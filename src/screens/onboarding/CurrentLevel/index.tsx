import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Level = "beginner" | "intermediate" | "advanced";

type CurrentLevelProps = {
  onBackToDashboard?: () => void;
  onContinue?: (level: Level) => void;
};

const LEVELS = [
  {
    id: "beginner" as Level,
    title: "Beginner",
    subtitle: "Just starting out",
    icon: "leaf-outline",
    iconColor: "#34D399",
    iconBg: "rgba(16, 185, 129, 0.14)",
  },
  {
    id: "intermediate" as Level,
    title: "Intermediate",
    subtitle: "Know the basics, want more",
    icon: "trending-up-outline",
    iconColor: "#818CF8",
    iconBg: "rgba(99, 102, 241, 0.14)",
  },
  {
    id: "advanced" as Level,
    title: "Advanced",
    subtitle: "Ready to go deep",
    icon: "rocket-outline",
    iconColor: "#F97316",
    iconBg: "rgba(249, 115, 22, 0.14)",
  },
];

export function CurrentLevel({
  onBackToDashboard,
  onContinue,
}: CurrentLevelProps) {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const handleContinue = () => {
    if (selectedLevel) {
      onContinue?.(selectedLevel);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topActionRow}>
          <TouchableOpacity
            style={styles.topActionBtn}
            onPress={onBackToDashboard}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <LinearGradient
              colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIcon}
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </LinearGradient>

            <View>
              <Text style={styles.headerTitle}>Forge AI</Text>
              <Text style={styles.headerSubtitle}>Your career assistant</Text>
            </View>
          </View>

          <Text style={styles.message}>
            Now let me understand where you are right now so I can set the right
            pace.
          </Text>
        </View>

        <Text style={styles.title}>What's your current level?</Text>
        <Text style={styles.subtitle}>This shapes your skill roadmap</Text>

        <View style={styles.options}>
          {LEVELS.map((level) => {
            const isSelected = selectedLevel === level.id;

            return (
              <TouchableOpacity
                key={level.id}
                activeOpacity={0.85}
                onPress={() => setSelectedLevel(level.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <View
                  style={[styles.optionIcon, { backgroundColor: level.iconBg }]}
                >
                  <Ionicons
                    name={level.icon as any}
                    size={22}
                    color={level.iconColor}
                  />
                </View>

                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>{level.title}</Text>
                  <Text style={styles.optionSubtitle}>{level.subtitle}</Text>
                </View>

                <View
                  style={[styles.radio, isSelected && styles.radioSelected]}
                >
                  {isSelected ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <LinearGradient
          colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.continueBtn,
            !selectedLevel && styles.continueBtnDisabled,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!selectedLevel}
            onPress={handleContinue}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 34,
  },
  topActionRow: {
    alignItems: "flex-start",
    marginTop: 32,
    marginBottom: 0,
  },
  topActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    marginTop: 40,
    marginBottom: 26,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 2,
  },
  message: {
    color: "#E5E7EB",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    marginTop: 8,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.44)",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 16,
  },
  options: {
    gap: 12,
    marginBottom: 28,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 12,
  },
  optionCardSelected: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  optionIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  optionSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    marginTop: 4,
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "rgba(139, 92, 246, 0.85)",
    backgroundColor: "rgba(139, 92, 246, 0.95)",
  },
  continueBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  backLink: {
    alignItems: "center",
    marginTop: 14,
  },
  backLinkText: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 13,
    fontWeight: "600",
  },
});
