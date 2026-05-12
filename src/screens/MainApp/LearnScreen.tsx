import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";
import {
  getResources,
  openResource,
  type Resource,
} from "../../lib/skillResources";
import { fetchUserDomainSkillLists } from "./SkillsScreen";

// LearnScreen uses canonical domain/skill data from SkillsScreen

export default function LearnScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [tickedIds, setTickedIds] = useState<Set<string>>(new Set());
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [nextSkill, setNextSkill] = useState<{
    id: string;
    name: string;
    domainName: string;
    domainColor: string;
  } | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { domains: fetchedDomains, roles = [] } =
      await fetchUserDomainSkillLists();
    setDomains(fetchedDomains);
    setUserRoles(roles ?? []);

    const { data: prof } = await supabase
      .from("user_profiles")
      .select("goal, level")
      .eq("id", user.id)
      .single();

    setProfile(prof);

    // build ticked id set from fetched domains
    const ticked = new Set<string>();
    fetchedDomains.forEach((d: any) =>
      d.skills.forEach((s: any) => s.ticked && ticked.add(s.id)),
    );
    setTickedIds(ticked);

    // find next skill within user's roles (frontend-first ordering comes from fetch)
    const next = fetchedDomains
      .filter((domain: any) => (roles ?? []).includes(domain.id))
      .flatMap((domain: any) =>
        domain.skills.map((skill: any) => ({
          ...skill,
          domainName: domain.name,
          domainColor: domain.color,
        })),
      )
      .find((skill: any) => !ticked.has(skill.id));

    if (next) {
      setNextSkill(next);
      setSelectedSkill({ id: next.id, name: next.name });
      void loadResourcesForSkill(next.id, next.name, prof);
    }

    setLoading(false);
  };

  const loadResourcesForSkill = async (
    skillId: string,
    skillName: string,
    prof: any,
  ) => {
    setLoadingResources(true);
    setResources([]);
    setResourcesError(null);
    setSelectedSkill({ id: skillId, name: skillName });

    try {
      const result = await getResources({
        skillId,
        skillName,
        userLevel: prof?.level ?? "beginner",
        userGoal: prof?.goal ?? "skills",
      });
      setResources(result);
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      console.error("Failed to load resources:", err);
      setResourcesError(`Resource load failed: ${err}`);
    } finally {
      setLoadingResources(false);
    }
  };

  const sortedDomains = [...domains].sort((a, b) => {
    const aMatch = userRoles.includes(a.id);
    const bMatch = userRoles.includes(b.id);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#534AB7" size="large" />
        <Text style={styles.loadingText}>Loading your path...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Learn</Text>
          <Text style={styles.headerSub}>Personalised to your goals</Text>
        </View>

        {nextSkill && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Continue where you left off</Text>
            <View style={styles.nextCard}>
              <View style={styles.nextTop}>
                <View
                  style={[
                    styles.nextIcon,
                    { backgroundColor: nextSkill.domainColor + "20" },
                  ]}
                >
                  <Ionicons
                    name="code-slash-outline"
                    size={20}
                    color={nextSkill.domainColor}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nextDomain}>
                    Next skill · {nextSkill.domainName}
                  </Text>
                  <Text style={styles.nextName}>{nextSkill.name}</Text>
                </View>
              </View>
              <Text style={styles.nextSub}>
                Based on your progress, this is the most impactful skill to
                learn next.
              </Text>
              <View style={styles.nextBtnRow}>
                <TouchableOpacity
                  style={[styles.btnPrimary, { flex: 1 }]}
                  onPress={() =>
                    void loadResourcesForSkill(
                      nextSkill.id,
                      nextSkill.name,
                      profile,
                    )
                  }
                >
                  <Text style={styles.btnPrimaryText}>View resources</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {selectedSkill
              ? `Resources for ${selectedSkill.name}`
              : "Resources"}
          </Text>

          {loadingResources ? (
            <View style={styles.resourcesLoading}>
              <ActivityIndicator color="#534AB7" />
              <Text style={styles.resourcesLoadingText}>
                Generating resources with Gemini AI...
              </Text>
            </View>
          ) : resources.length > 0 ? (
            <View style={styles.resourcesList}>
              {resources.map((res, index) => (
                <TouchableOpacity
                  key={`${res.title}-${index}`}
                  style={styles.resourceCard}
                  onPress={() => void openResource(res.url)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.resIcon,
                      {
                        backgroundColor:
                          res.provider.toLowerCase() === "youtube"
                            ? "#E8593C15"
                            : res.provider.toLowerCase() === "freecodecamp"
                              ? "#1D9E7515"
                              : res.provider.toLowerCase() === "mdn"
                                ? "#378ADD15"
                                : "#7F77DD15",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        res.provider.toLowerCase() === "youtube"
                          ? "logo-youtube"
                          : res.provider.toLowerCase() === "freecodecamp"
                            ? "school-outline"
                            : res.provider.toLowerCase() === "mdn"
                              ? "document-text-outline"
                              : "link-outline"
                      }
                      size={18}
                      color={
                        res.provider.toLowerCase() === "youtube"
                          ? "#E8593C"
                          : res.provider.toLowerCase() === "freecodecamp"
                            ? "#1D9E75"
                            : res.provider.toLowerCase() === "mdn"
                              ? "#378ADD"
                              : "#7F77DD"
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.resTitle} numberOfLines={2}>
                      {res.title}
                    </Text>
                    <View style={styles.resMeta}>
                      <Text style={styles.resProvider}>{res.provider}</Text>
                      <Text style={styles.resDot}>·</Text>
                      <Ionicons
                        name={
                          res.resource_type === "video"
                            ? "play-circle-outline"
                            : res.resource_type === "practice"
                              ? "code-slash-outline"
                              : "document-text-outline"
                        }
                        size={11}
                        color="#6B6A7A"
                      />
                      <Text style={styles.resType}>{res.resource_type}</Text>
                      <View style={styles.resFree}>
                        <Text style={styles.resFreeText}>Free</Text>
                      </View>
                    </View>
                  </View>

                  <Ionicons name="open-outline" size={16} color="#4A4A5A" />
                </TouchableOpacity>
              ))}
            </View>
          ) : resourcesError ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{resourcesError}</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Tap a skill below to load its resources
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>All learning paths</Text>
          {sortedDomains.map((domain) => {
            const isPrimary = userRoles.includes(domain.id);
            const domainDone = domain.skills.filter((skill: any) =>
              tickedIds.has(skill.id),
            ).length;
            const domainPct = Math.round(
              (domainDone / domain.skills.length) * 100,
            );

            return (
              <View
                key={domain.id}
                style={[
                  styles.domainCard,
                  isPrimary ? styles.domainPrimary : styles.domainSecondary,
                ]}
              >
                <View style={styles.domainHead}>
                  <View
                    style={[
                      styles.domainDot,
                      { backgroundColor: domain.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.domainName,
                      !isPrimary && { color: "#6B6A7A" },
                    ]}
                  >
                    {domain.name}
                  </Text>
                  {isPrimary && (
                    <View style={styles.focusBadge}>
                      <Text style={styles.focusBadgeText}>Your focus</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.domainPct,
                      { color: isPrimary ? domain.color : "#4A4A5A" },
                    ]}
                  >
                    {domainPct}%
                  </Text>
                </View>

                <View style={styles.domainBarTrack}>
                  <View
                    style={[
                      styles.domainBarFill,
                      {
                        width: `${domainPct}%` as any,
                        backgroundColor: domain.color,
                      },
                    ]}
                  />
                </View>

                <View style={styles.skillsList}>
                  {domain.skills.map((skill: any) => {
                    const isDone = tickedIds.has(skill.id);
                    const isCurrent = selectedSkill?.id === skill.id;

                    return (
                      <TouchableOpacity
                        key={skill.id}
                        style={[
                          styles.skillRow,
                          isCurrent && styles.skillRowActive,
                        ]}
                        onPress={() =>
                          void loadResourcesForSkill(
                            skill.id,
                            skill.name,
                            profile,
                          )
                        }
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.skillDot,
                            isDone && styles.skillDotDone,
                            isCurrent && !isDone && styles.skillDotCurrent,
                          ]}
                        >
                          {isDone ? (
                            <Ionicons name="checkmark" size={10} color="#fff" />
                          ) : isCurrent ? (
                            <Ionicons name="play" size={8} color="#fff" />
                          ) : null}
                        </View>

                        <Text
                          style={[
                            styles.skillName,
                            isDone && styles.skillNameDone,
                            isCurrent && styles.skillNameCurrent,
                          ]}
                        >
                          {skill.name}
                        </Text>

                        <Text
                          style={[
                            styles.skillAction,
                            isDone && { color: "#1D9E75" },
                            isCurrent && { color: "#7F77DD" },
                          ]}
                        >
                          {isDone
                            ? "Done ✓"
                            : isCurrent
                              ? "Viewing"
                              : "Tap to learn"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0E0E12" },
  scrollContent: { paddingTop: 32, paddingBottom: 120 },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E0E12",
    gap: 16,
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

  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },

  nextCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
  },
  nextTop: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  nextIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  nextDomain: {
    fontSize: 12,
    lineHeight: 16,
    color: "#7F77DD",
    fontWeight: "500",
    marginBottom: 8,
  },
  nextName: { fontSize: 20, fontWeight: "600", color: "#fff" },
  nextSub: {
    fontSize: 16,
    fontWeight: "400",
    color: "#9CA3AF",
    lineHeight: 24,
    marginBottom: 16,
  },
  nextBtnRow: { flexDirection: "row", gap: 8 },
  btnPrimary: {
    backgroundColor: "#534AB7",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    color: "#EEEDFE",
  },

  resourcesLoading: {
    alignItems: "center",
    padding: 12,
    gap: 8,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  resourcesLoadingText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    color: "#9CA3AF",
  },
  resourcesList: { gap: 12 },
  resourceCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 12,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  resTitle: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: "#D4D3E0",
    marginBottom: 8,
  },
  resMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  resProvider: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    color: "#9CA3AF",
  },
  resDot: { fontSize: 13, fontWeight: "400", lineHeight: 18, color: "#9CA3AF" },
  resType: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    color: "#9CA3AF",
  },
  resFree: {
    backgroundColor: "#E1F5EE20",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  resFreeText: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    color: "#1D9E75",
  },
  emptyBox: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: "#9CA3AF",
  },

  domainCard: {
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: "hidden",
    marginBottom: 16,
  },
  domainPrimary: {
    backgroundColor: "#1E1E1E",
    borderColor: "rgba(255,255,255,0.1)",
  },
  domainSecondary: {
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
  domainDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  domainName: { flex: 1, fontSize: 20, fontWeight: "600", color: "#fff" },
  focusBadge: {
    backgroundColor: "#1C1B2E",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: "#534AB7",
  },
  focusBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#7F77DD",
    fontWeight: "500",
  },
  domainPct: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  domainBarTrack: { height: 2, backgroundColor: "#1A1A22", overflow: "hidden" },
  domainBarFill: { height: "100%" },

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
  skillRowActive: { backgroundColor: "#1C1B2E" },
  skillDot: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: "#3A3A48",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  skillDotDone: { backgroundColor: "#1D9E75", borderColor: "#1D9E75" },
  skillDotCurrent: { backgroundColor: "#534AB7", borderColor: "#534AB7" },
  skillName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: "#D4D3E0",
  },
  skillNameDone: { color: "#9CA3AF", textDecorationLine: "line-through" },
  skillNameCurrent: { color: "#fff", fontWeight: "500" },
  skillAction: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: "#9CA3AF",
  },
});
