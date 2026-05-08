import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";

type DashboardProps = {
  onSignOut?: () => void;
  onContinue?: (goal: string) => void;
};

type Goal = "internship" | "skills" | "switch";

const GOALS = [
  {
    id: "internship" as Goal,
    title: "Land an Internship",
    subtitle: "Get ready for your first role",
    icon: "briefcase-outline",
    iconColor: "#7B6CF6",
    iconBg: "rgba(123, 108, 246, 0.18)",
  },
  {
    id: "skills" as Goal,
    title: "Build My Skills",
    subtitle: "Level up as a developer",
    icon: "flash-outline",
    iconColor: "#2EC6C6",
    iconBg: "rgba(46, 198, 198, 0.18)",
  },
  {
    id: "switch" as Goal,
    title: "Career Switch",
    subtitle: "Transition into tech",
    icon: "time-outline",
    iconColor: "#C86DD7",
    iconBg: "rgba(200, 109, 215, 0.18)",
  },
];

export function Dashboard({ onSignOut, onContinue }: DashboardProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedGoal) {
      const message = "Please choose a primary goal to continue.";
      setSelectionError(message);
      Alert.alert("Select a goal", message);
      return;
    }

    setSelectionError(null);

    if (onContinue) {
      onContinue(selectedGoal);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>ForgeAI</Text>
            <Text style={styles.headerSubtitle}>Your career assistant</Text>
          </View>
        </View>

        {/* Greeting Message */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            Hey there! 👋 I'm excited to help you on your career journey. Let's
            start by understanding your goals.
          </Text>
        </View>

        {/* Goals Section */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>What's your primary goal?</Text>
          <View style={styles.goalsContainer}>
            {GOALS.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedGoal(goal.id);
                  setSelectionError(null);
                }}
                style={[
                  styles.goalCard,
                  selectedGoal === goal.id && styles.goalCardActive,
                ]}
              >
                <View
                  style={[
                    styles.goalIconGradient,
                    { backgroundColor: goal.iconBg },
                  ]}
                >
                  <Ionicons
                    name={goal.icon as any}
                    size={24}
                    color={goal.iconColor}
                  />
                </View>
                <View style={styles.goalTextContainer}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    selectedGoal === goal.id && styles.radioSelected,
                  ]}
                >
                  {selectedGoal === goal.id ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <LinearGradient
          colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.continueBtn,
            !selectedGoal && styles.continueBtnDisabled,
          ]}
        >
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedGoal}
            activeOpacity={0.8}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </LinearGradient>

        {selectionError ? (
          <Text style={styles.selectionError}>{selectionError}</Text>
        ) : null}

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={onSignOut}
          activeOpacity={0.8}
          style={styles.signOutBtn}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 36,
    marginBottom: 32,
    gap: 12,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
  greetingContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  greetingText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
    fontWeight: "500",
  },

  goalsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  goalsContainer: {
    gap: 12,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 12,
  },
  goalCardActive: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderColor: "rgba(139, 92, 246, 0.4)",
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
  goalIconGradient: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
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
  selectionError: {
    color: "#FCA5A5",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  signOutBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  topLeftText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
});
