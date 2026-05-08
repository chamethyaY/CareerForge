import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = {
  goal: string | null;
  level: string | null;
  roles: string[];
  time: string | null;
};

// ─── Step Data ────────────────────────────────────────────────────────────────

const steps = [
  {
    id: "goal",
    question: "What's your primary goal?",
    subtitle: "We'll personalise everything around this",
    multiSelect: false,
    options: [
      {
        id: "internship",
        label: "Land an Internship",
        subtitle: "Get ready for your first role",
        icon: "radio-button-on-outline",
        color: "#7F77DD",
      },
      {
        id: "skills",
        label: "Build My Skills",
        subtitle: "Level up as a developer",
        icon: "flash-outline",
        color: "#1D9E75",
      },
      {
        id: "switch",
        label: "Career Switch",
        subtitle: "Transition into tech",
        icon: "time-outline",
        color: "#9B4DCA",
      },
    ],
  },
  {
    id: "level",
    question: "What's your current level?",
    subtitle: "This shapes your skill roadmap",
    multiSelect: false,
    options: [
      {
        id: "beginner",
        label: "Beginner",
        subtitle: "Just starting out",
        icon: "leaf-outline",
        color: "#1D9E75",
      },
      {
        id: "intermediate",
        label: "Intermediate",
        subtitle: "Know the basics, want more",
        icon: "trending-up-outline",
        color: "#7F77DD",
      },
      {
        id: "advanced",
        label: "Advanced",
        subtitle: "Ready to go deep",
        icon: "rocket-outline",
        color: "#E8593C",
      },
    ],
  },
  {
    id: "roles",
    question: "What role interests you?",
    subtitle: "Pick all that apply",
    multiSelect: true,
    options: [
      {
        id: "frontend",
        label: "Frontend",
        subtitle: "React, UI, design",
        icon: "desktop-outline",
        color: "#378ADD",
      },
      {
        id: "backend",
        label: "Backend",
        subtitle: "APIs, databases",
        icon: "server-outline",
        color: "#1D9E75",
      },
      {
        id: "mobile",
        label: "Mobile",
        subtitle: "iOS, Android",
        icon: "phone-portrait-outline",
        color: "#7F77DD",
      },
      {
        id: "fullstack",
        label: "Full Stack",
        subtitle: "End-to-end dev",
        icon: "layers-outline",
        color: "#E8593C",
      },
      {
        id: "devops",
        label: "DevOps",
        subtitle: "CI/CD, cloud",
        icon: "cloud-outline",
        color: "#639922",
      },
      {
        id: "ai",
        label: "AI / ML",
        subtitle: "Models, LLMs",
        icon: "hardware-chip-outline",
        color: "#BA7517",
      },
    ],
  },
  {
    id: "time",
    question: "How much time can you commit?",
    subtitle: "We'll build your schedule around this",
    multiSelect: false,
    options: [
      {
        id: "casual",
        label: "Casual",
        subtitle: "1–2 hours per week",
        icon: "cafe-outline",
        color: "#BA7517",
      },
      {
        id: "regular",
        label: "Regular",
        subtitle: "3–5 hours per week",
        icon: "calendar-outline",
        color: "#7F77DD",
      },
      {
        id: "intensive",
        label: "Intensive",
        subtitle: "6+ hours per week",
        icon: "flame-outline",
        color: "#E8593C",
      },
    ],
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    goal: null,
    level: null,
    roles: [],
    time: null,
  });
  const [saving, setSaving] = useState(false);

  const step = steps[currentStep];

  // ── Check if an option is selected ────────────────────────────────────────

  const isSelected = (optionId: string): boolean => {
    if (step.multiSelect) {
      return answers.roles.includes(optionId);
    }
    return answers[step.id as keyof Answers] === optionId;
  };

  // ── Save partial answers locally only. We avoid upserts — persistence is
  // insert-only and happens once at the end. This prevents accidental
  // overwrites of existing rows.
  const savePartial = async (_partial: Partial<Answers>) => {
    // Intentionally no-op for DB writes. Keep answers in component state.
    return;
  };

  // ── Toggle option selection ────────────────────────────────────────────────

  const toggleOption = (optionId: string) => {
    if (step.multiSelect) {
      // Roles step — multi select
      setAnswers((prev) => {
        const roles = prev.roles.includes(optionId)
          ? prev.roles.filter((r) => r !== optionId)
          : [...prev.roles, optionId];
        // persist
        savePartial({ roles });
        return { ...prev, roles };
      });
    } else {
      // Single select
      setAnswers((prev) => {
        const next = { ...prev, [step.id]: optionId } as Answers;
        // persist mapping 'time' -> time_commitment handled in savePartial
        savePartial({ [step.id]: optionId } as Partial<Answers>);
        return next;
      });
    }
  };

  // ── Can user continue? ─────────────────────────────────────────────────────

  const canContinue = (): boolean => {
    if (step.multiSelect) return answers.roles.length > 0;
    return answers[step.id as keyof Answers] !== null;
  };

  // ── Save to Supabase (final) ───────────────────────────────────────────────

  const saveToSupabase = async () => {
    setSaving(true);

    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;

      if (!user) {
        Alert.alert("Error", "No user found. Please log in again.");
        setSaving(false);
        return;
      }

      const payload: any = {
        id: user.id,
        goal: answers.goal,
        level: answers.level,
        roles: answers.roles,
        time_commitment: answers.time,
        onboarding_completed: true,
      };

      const { error } = await supabase.from("user_profiles").insert(payload);

      setSaving(false);

      if (error) {
        const msg = (error && error.message) || "";
        if (msg.toLowerCase().includes("duplicate")) {
          // Row exists already — do not overwrite.
          console.warn("Profile already exists - not overwriting.");
          Alert.alert("Saved", "Onboarding already recorded.");
        } else {
          console.error("Supabase error:", error);
          Alert.alert("Save failed", error.message);
        }
      } else {
        Alert.alert("Saved", "Your onboarding answers were saved.");
      }
    } catch (err) {
      setSaving(false);
      console.error("Save exception:", err);
      Alert.alert("Save failed", "Unexpected error");
    }
  };

  // ── Handle Continue button ─────────────────────────────────────────────────

  const handleContinue = () => {
    if (!canContinue()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Last step — save to Supabase
      saveToSupabase();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        {currentStep > 0 ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setCurrentStep((prev) => prev - 1)}
          >
            <Ionicons name="arrow-back" size={18} color="#9A99A8" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={styles.stepCount}>
          {currentStep + 1} / {steps.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentStep + 1) / steps.length) * 100}%` },
          ]}
        />
      </View>

      {/* Body */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <Text style={styles.question}>{step.question}</Text>
        <Text style={styles.questionSub}>{step.subtitle}</Text>

        {/* Forge AI card (moved lower) */}
        <View style={styles.aiCard}>
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
          <View style={styles.aiText}>
            <Text style={styles.aiName}>Forge AI</Text>
            <Text style={styles.aiRole}>Your career assistant</Text>
            <Text style={styles.aiMsg}>
              {currentStep === 0 &&
                "Hey there! 👋 I'm excited to help you on your career journey. Let's start by understanding your goals."}
              {currentStep === 1 &&
                "Now let me understand where you are right now so I can set the right pace."}
              {currentStep === 2 &&
                "Which role excites you most? Pick all that apply — I'll tailor your projects to match."}
              {currentStep === 3 &&
                "Almost there! How much time can you dedicate each week? I'll set a realistic pace for you."}
            </Text>
          </View>
        </View>

        {/* Options */}
        {step.options.map((opt) => {
          const selected = isSelected(opt.id);
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => toggleOption(opt.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: selected
                      ? `${opt.color}30`
                      : `${opt.color}1A`,
                  },
                ]}
              >
                <Ionicons name={opt.icon as any} size={20} color={opt.color} />
              </View>
              <View style={styles.optLabels}>
                <Text
                  style={[styles.optLabel, selected && styles.optLabelSelected]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.optSub}>{opt.subtitle}</Text>
              </View>
              {selected ? (
                <View style={styles.checkBox}>
                  <Ionicons name="checkmark" size={13} color="#fff" />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#3A3A48" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            !canContinue() && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue() || saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={[
                styles.continueTxt,
                !canContinue() && styles.continueTxtDisabled,
              ]}
            >
              {currentStep < steps.length - 1 ? "Continue" : "Start my journey"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0E0E12" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#1A1A22",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCount: { fontSize: 13, color: "#4A4A5A", fontWeight: "500" },

  progressTrack: {
    height: 2,
    backgroundColor: "#1A1A22",
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#534AB7",
    borderRadius: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },

  // Forge AI card
  aiCard: {
    backgroundColor: "#14141C",
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#2A2A36",
    padding: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  aiAvatar: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#534AB7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  aiText: { flex: 1 },
  aiName: { fontSize: 12, fontWeight: "600", color: "#fff" },
  aiRole: { fontSize: 10, color: "#4A4A5A", marginBottom: 6 },
  aiMsg: { fontSize: 12, color: "#B4B2B8", lineHeight: 18 },

  // Question
  question: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  questionSub: { fontSize: 12, color: "#6B6A7A", marginBottom: 18 },

  // Option tile
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14141C",
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#2A2A36",
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 12,
  },
  optionSelected: {
    backgroundColor: "#1C1B2E",
    borderColor: "#534AB7",
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optLabels: { flex: 1, gap: 2 },
  optLabel: { fontSize: 15, fontWeight: "500", color: "#D4D3E0" },
  optLabelSelected: { color: "#fff" },
  optSub: { fontSize: 12, color: "#6B6A7A" },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#534AB7",
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer
  footer: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 12 },
  continueBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#534AB7",
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnDisabled: { backgroundColor: "#1A1A22" },
  continueTxt: { fontSize: 15, fontWeight: "600", color: "#fff" },
  continueTxtDisabled: { color: "#3A3A4A" },
});
