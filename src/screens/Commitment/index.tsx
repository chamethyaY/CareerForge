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

type Commitment = "casual" | "regular" | "intensive";

type CommitmentProps = {
  onBackToDashboard?: () => void;
  onContinue?: (commitment: Commitment) => void;
};

const COMMITMENTS = [
  {
    id: "casual" as Commitment,
    title: "Casual",
    subtitle: "1-2 hours per week",
    icon: "sunny-outline",
    iconColor: "#F59E0B",
    iconBg: "rgba(245, 158, 11, 0.14)",
  },
  {
    id: "regular" as Commitment,
    title: "Regular",
    subtitle: "3-5 hours per week",
    icon: "calendar-outline",
    iconColor: "#6366F1",
    iconBg: "rgba(99, 102, 241, 0.14)",
  },
  {
    id: "intensive" as Commitment,
    title: "Intensive",
    subtitle: "6+ hours per week",
    icon: "flame-outline",
    iconColor: "#EF4444",
    iconBg: "rgba(239, 68, 68, 0.14)",
  },
];

export function Commitment({ onBackToDashboard, onContinue }: CommitmentProps) {
  const [selectedCommitment, setSelectedCommitment] =
    useState<Commitment | null>(null);

  const handleContinue = () => {
    if (selectedCommitment) {
      onContinue?.(selectedCommitment);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
          Almost there! How much time can you dedicate each week? I'll set a
          realistic pace for you.
        </Text>
      </View>

      <Text style={styles.title}>How much time can you commit?</Text>
      <Text style={styles.subtitle}>We'll build your schedule around this</Text>

      <View style={styles.options}>
        {COMMITMENTS.map((commitment) => {
          const isSelected = selectedCommitment === commitment.id;

          return (
            <TouchableOpacity
              key={commitment.id}
              activeOpacity={0.85}
              onPress={() => setSelectedCommitment(commitment.id)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: commitment.iconBg },
                ]}
              >
                <Ionicons
                  name={commitment.icon as any}
                  size={24}
                  color={commitment.iconColor}
                />
              </View>

              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>{commitment.title}</Text>
                <Text style={styles.optionSubtitle}>{commitment.subtitle}</Text>
              </View>

              <View style={[styles.radio, isSelected && styles.radioSelected]}>
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
          !selectedCommitment && styles.continueBtnDisabled,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!selectedCommitment}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>Start my journey</Text>
        </TouchableOpacity>
      </LinearGradient>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onBackToDashboard}
        style={styles.backLink}
      >
        <Text style={styles.backLinkText}>Back to dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 34,
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
