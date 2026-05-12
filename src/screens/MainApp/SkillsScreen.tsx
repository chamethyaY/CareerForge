import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";

type Skill = { id: string; name: string; ticked: boolean };
type Domain = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  skills: Skill[];
};

const ALL_DOMAINS = [
  {
    id: "frontend",
    name: "Frontend",
    icon: "desktop-outline",
    color: "#7F77DD",
    skills: [
      { id: "html-css", name: "HTML / CSS" },
      { id: "javascript", name: "JavaScript" },
      { id: "react", name: "React" },
      { id: "typescript", name: "TypeScript" },
      { id: "nextjs", name: "Next.js" },
      { id: "testing-fe", name: "Testing (Jest)" },
    ],
  },
  {
    id: "backend",
    name: "Backend",
    icon: "server-outline",
    color: "#1D9E75",
    skills: [
      { id: "nodejs", name: "Node.js" },
      { id: "rest-apis", name: "REST APIs" },
      { id: "postgresql", name: "PostgreSQL" },
      { id: "auth", name: "Auth & Security" },
      { id: "graphql", name: "GraphQL" },
    ],
  },
  {
    id: "mobile",
    name: "Mobile",
    icon: "phone-portrait-outline",
    color: "#E8593C",
    skills: [
      { id: "react-native", name: "React Native" },
      { id: "expo", name: "Expo" },
      { id: "navigation", name: "Navigation" },
      { id: "native-apis", name: "Native APIs" },
      { id: "push-notif", name: "Push Notifications" },
    ],
  },
  {
    id: "devops",
    name: "DevOps",
    icon: "cloud-outline",
    color: "#639922",
    skills: [
      { id: "git", name: "Git & GitHub" },
      { id: "docker", name: "Docker" },
      { id: "cicd", name: "CI/CD" },
      { id: "aws", name: "AWS Basics" },
    ],
  },
  {
    id: "ai",
    name: "AI / ML",
    icon: "hardware-chip-outline",
    color: "#BA7517",
    skills: [
      { id: "python-ml", name: "Python for ML" },
      { id: "llm-apis", name: "LLM APIs" },
      { id: "prompt-eng", name: "Prompt Engineering" },
      { id: "ml-models", name: "ML Models" },
    ],
  },
  {
    id: "fullstack",
    name: "Full Stack",
    icon: "layers-outline",
    color: "#9B4DCA",
    skills: [
      { id: "mvc", name: "MVC Architecture" },
      { id: "api-design", name: "API Design" },
      { id: "deployment", name: "Deployment" },
    ],
  },
];

const TOTAL_SKILLS = ALL_DOMAINS.reduce((acc, d) => acc + d.skills.length, 0);

type SkillsScreenProps = {
  onOpenResources?: (skillId: string, skillName: string) => void;
};

export function SkillsScreen({ onOpenResources }: SkillsScreenProps) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSkill, setSavingSkill] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("roles")
      .eq("id", user.id)
      .single();
    const roles: string[] = profile?.roles ?? [];
    setUserRoles(roles);

    const { data: progress } = await supabase
      .from("skill_progress")
      .select("skill_id")
      .eq("user_id", user.id)
      .eq("status", "done");
    const tickedIds = new Set(
      (progress ?? []).map((item: any) => item.skill_id),
    );

    const built: Domain[] = ALL_DOMAINS.map((domain) => ({
      ...domain,
      icon: domain.icon as keyof typeof Ionicons.glyphMap,
      skills: domain.skills.map((skill) => ({
        ...skill,
        ticked: tickedIds.has(skill.id),
      })),
    }));

    const sorted = [...built].sort((a, b) => {
      const aIsRole = roles.includes(a.id);
      const bIsRole = roles.includes(b.id);
      if (aIsRole && !bIsRole) return -1;
      if (!aIsRole && bIsRole) return 1;
      return 0;
    });

    setExpandedDomains(
      roles.length > 0 ? roles : ([sorted[0]?.id].filter(Boolean) as string[]),
    );
    setDomains(sorted);
    setLoading(false);
  };

  const toggleSkill = async (domainId: string, skillId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user || savingSkill) return;

    setSavingSkill(skillId);

    const domain = domains.find((entry) => entry.id === domainId);
    const skill = domain?.skills.find((entry) => entry.id === skillId);
    if (!domain || !skill) {
      setSavingSkill(null);
      return;
    }

    const nowTicked = !skill.ticked;

    setDomains((prev) =>
      prev.map((entry) =>
        entry.id !== domainId
          ? entry
          : {
              ...entry,
              skills: entry.skills.map((item) =>
                item.id !== skillId ? item : { ...item, ticked: nowTicked },
              ),
            },
      ),
    );

    if (nowTicked) {
      await supabase.from("skill_progress").upsert(
        {
          user_id: user.id,
          skill_id: skillId,
          status: "done",
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,skill_id" },
      );
    } else {
      await supabase
        .from("skill_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("skill_id", skillId);
    }

    setSavingSkill(null);
  };

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId],
    );
  };

  const totalDone = domains.reduce(
    (acc, domain) => acc + domain.skills.filter((skill) => skill.ticked).length,
    0,
  );
  const overallPct =
    TOTAL_SKILLS > 0 ? Math.round((totalDone / TOTAL_SKILLS) * 100) : 0;
  const domainDone = (domain: Domain) =>
    domain.skills.filter((skill) => skill.ticked).length;
  const domainPct = (domain: Domain) =>
    Math.round((domainDone(domain) / domain.skills.length) * 100);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#534AB7" size="large" />
        <Text style={styles.loadingText}>Loading your skills...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Skill Profile</Text>
        </View>

        <View style={styles.overallCard}>
          <View style={styles.overallRow}>
            <Text style={styles.overallLabel}>Overall skill level</Text>
            <Text style={styles.overallPct}>{overallPct}%</Text>
          </View>
          <View style={styles.barTrack}>
            <View
              style={[styles.barFill, { width: `${overallPct}%` as any }]}
            />
          </View>
          <Text style={styles.overallSub}>
            {totalDone} of {TOTAL_SKILLS} skills completed
          </Text>
        </View>

        <Text
          style={[styles.headerSub, { paddingHorizontal: 20, marginTop: 6 }]}
        >
          Track your progress
        </Text>

        <View style={styles.legend}>
          {[
            { color: "#1D9E75", label: "Completed" },
            { color: "#3A3A48", label: "Not done" },
            { color: "#534AB7", label: "Your focus" },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.domainsWrap}>
          {domains.map((domain) => {
            const isExpanded = expandedDomains.includes(domain.id);
            const pct = domainPct(domain);
            const done = domainDone(domain);
            const isPrimary = userRoles.includes(domain.id);

            return (
              <View
                key={domain.id}
                style={[
                  styles.domainCard,
                  isPrimary
                    ? styles.domainCardPrimary
                    : styles.domainCardSecondary,
                ]}
              >
                <TouchableOpacity
                  style={styles.domainHead}
                  onPress={() => toggleDomain(domain.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.domainIcon,
                      { backgroundColor: `${domain.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={domain.icon}
                      size={16}
                      color={domain.color}
                    />
                  </View>
                  <Text style={styles.domainName}>{domain.name}</Text>
                  {isPrimary ? (
                    <View style={styles.focusBadge}>
                      <Text style={styles.focusBadgeText}>Your focus</Text>
                    </View>
                  ) : null}
                  <Text
                    style={[
                      styles.domainPct,
                      { color: isPrimary ? domain.color : "#4A4A5A" },
                    ]}
                  >
                    {pct}%
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#4A4A5A"
                  />
                </TouchableOpacity>

                <View style={styles.domainBarTrack}>
                  <View
                    style={[
                      styles.domainBarFill,
                      {
                        width: `${pct}%` as any,
                        backgroundColor: domain.color,
                      },
                    ]}
                  />
                </View>

                {isExpanded ? (
                  <View style={styles.domainCount}>
                    <Text style={styles.domainCountText}>
                      {done} of {domain.skills.length} skills completed
                    </Text>
                  </View>
                ) : null}

                {isExpanded ? (
                  <View style={styles.skillsList}>
                    {domain.skills.map((skill) => (
                      <View key={skill.id} style={{ marginBottom: 6 }}>
                        <TouchableOpacity
                          style={styles.skillRow}
                          onPress={() => toggleSkill(domain.id, skill.id)}
                          activeOpacity={0.8}
                          disabled={savingSkill === skill.id}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              skill.ticked && styles.checkboxTicked,
                            ]}
                          >
                            {savingSkill === skill.id ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : skill.ticked ? (
                              <Ionicons
                                name="checkmark-outline"
                                size={16}
                                color="#fff"
                              />
                            ) : null}
                          </View>
                          <Text
                            style={[
                              styles.skillName,
                              skill.ticked && styles.skillNameTicked,
                            ]}
                          >
                            {skill.name}
                          </Text>
                          <Text
                            style={[
                              styles.skillAction,
                              skill.ticked && { color: "#1D9E75" },
                            ]}
                          >
                            {skill.ticked ? "Completed ✓" : "Mark"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// Helper: fetch per-domain lists (ticked / unticked) for the current user
export async function fetchUserDomainSkillLists() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return { domains: [] as Domain[] };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("roles")
    .eq("id", user.id)
    .single();
  const roles: string[] = profile?.roles ?? [];

  const { data: progress } = await supabase
    .from("skill_progress")
    .select("skill_id")
    .eq("user_id", user.id)
    .eq("status", "done");
  const tickedIds = new Set((progress ?? []).map((item: any) => item.skill_id));

  const built: Domain[] = ALL_DOMAINS.map((domain) => ({
    ...domain,
    icon: domain.icon as keyof typeof Ionicons.glyphMap,
    skills: domain.skills.map((skill) => ({
      ...skill,
      ticked: tickedIds.has(skill.id),
    })),
  }));

  // ensure frontend-first ordering as requested (frontend, backend, devops, ai, ...)
  const desiredOrder = [
    "frontend",
    "backend",
    "devops",
    "ai",
    "mobile",
    "fullstack",
  ];

  const ordered = [...built].sort((a, b) => {
    const ia = desiredOrder.indexOf(a.id);
    const ib = desiredOrder.indexOf(b.id);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return { domains: ordered, roles };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0E0E12" },
  scrollContent: { paddingTop: 32, paddingBottom: 120 },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E0E12",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    color: "#9CA3AF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#1A1A22",
  },
  headerTitle: { fontSize: 30, fontWeight: "700", color: "#fff" },
  headerSub: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: "#9CA3AF",
    marginTop: 4,
  },
  overallCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    margin: 16,
    padding: 12,
  },
  overallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  overallLabel: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: "#9CA3AF",
  },
  overallPct: { fontSize: 18, fontWeight: "600", color: "#7F77DD" },
  barTrack: {
    height: 6,
    backgroundColor: "#1A1A22",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  barFill: { height: "100%", backgroundColor: "#534AB7", borderRadius: 3 },
  overallSub: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: "#9CA3AF",
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: "#9CA3AF",
  },
  domainsWrap: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },
  domainCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  domainCardPrimary: {
    backgroundColor: "#1E1E1E",
    borderColor: "rgba(255,255,255,0.1)",
  },
  domainCardSecondary: {
    backgroundColor: "#1E1E1E",
    borderColor: "rgba(255,255,255,0.1)",
    opacity: 0.9,
  },
  domainHead: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 10,
    minHeight: 44,
  },
  domainIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  domainName: { flex: 1, fontSize: 20, fontWeight: "600", color: "#fff" },
  focusBadge: {
    backgroundColor: "#1C1B2E",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: "#534AB7",
  },
  focusBadgeText: { fontSize: 12, fontWeight: "400", color: "#7F77DD" },
  domainPct: { fontSize: 12, fontWeight: "400", color: "#9CA3AF" },
  domainBarTrack: { height: 3, backgroundColor: "#1A1A22", overflow: "hidden" },
  domainBarFill: { height: "100%" },
  domainCount: { paddingHorizontal: 16, paddingTop: 8 },
  domainCountText: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: "#9CA3AF",
  },
  skillsList: { padding: 12, gap: 12 },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
    minHeight: 48,
  },
  checkbox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A3A48",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxTicked: { backgroundColor: "#1D9E75", borderColor: "#1D9E75" },
  skillName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: "#D4D3E0",
  },
  skillNameTicked: { color: "#9CA3AF", textDecorationLine: "line-through" },
  skillAction: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: "#9CA3AF",
  },
});
