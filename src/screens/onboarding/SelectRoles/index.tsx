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

type Role = "frontend" | "backend" | "mobile" | "fullstack" | "devops" | "ai";

type SelectRolesProps = {
  onBackToDashboard?: () => void;
  onContinue?: (roles: Role[]) => void;
};

const ROLES = [
  {
    id: "frontend" as Role,
    title: "Frontend",
    subtitle: "React, UI, design",
    icon: "code-outline",
    iconColor: "#3B82F6",
    iconBg: "rgba(59, 130, 246, 0.14)",
  },
  {
    id: "backend" as Role,
    title: "Backend",
    subtitle: "APIs, databases",
    icon: "server-outline",
    iconColor: "#06B6D4",
    iconBg: "rgba(6, 182, 212, 0.14)",
  },
  {
    id: "mobile" as Role,
    title: "Mobile",
    subtitle: "iOS, Android",
    icon: "phone-portrait-outline",
    iconColor: "#8B5CF6",
    iconBg: "rgba(139, 92, 246, 0.14)",
  },
  {
    id: "fullstack" as Role,
    title: "Full Stack",
    subtitle: "End-to-end",
    icon: "layers-outline",
    iconColor: "#EC4899",
    iconBg: "rgba(236, 72, 153, 0.14)",
  },
  {
    id: "devops" as Role,
    title: "DevOps",
    subtitle: "CI/CD, Cloud",
    icon: "settings-outline",
    iconColor: "#F97316",
    iconBg: "rgba(249, 115, 22, 0.14)",
  },
  {
    id: "ai" as Role,
    title: "AI / ML",
    subtitle: "Models, LLMs",
    icon: "sparkles-outline",
    iconColor: "#14B8A6",
    iconBg: "rgba(20, 184, 166, 0.14)",
  },
];

export function SelectRoles({
  onBackToDashboard,
  onContinue,
}: SelectRolesProps) {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  const toggleRole = (role: Role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleContinue = () => {
    if (selectedRoles.length > 0) {
      onContinue?.(selectedRoles);
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
            Which role excites you most? Pick all that apply — I'll tailor your
            projects to match.
          </Text>
        </View>

        <Text style={styles.title}>What role interests you?</Text>
        <Text style={styles.subtitle}>Pick all that apply</Text>

        <View style={styles.rolesGrid}>
          {ROLES.map((role) => {
            const isSelected = selectedRoles.includes(role.id);

            return (
              <TouchableOpacity
                key={role.id}
                activeOpacity={0.85}
                onPress={() => toggleRole(role.id)}
                style={[styles.roleCard, isSelected && styles.roleCardSelected]}
              >
                <View
                  style={[styles.roleIcon, { backgroundColor: role.iconBg }]}
                >
                  <Ionicons
                    name={role.icon as any}
                    size={24}
                    color={role.iconColor}
                  />
                </View>

                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleSubtitle}>{role.subtitle}</Text>

                <View
                  style={[
                    styles.checkmark,
                    isSelected && styles.checkmarkSelected,
                  ]}
                >
                  {isSelected ? (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
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
            selectedRoles.length === 0 && styles.continueBtnDisabled,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={selectedRoles.length === 0}
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
  rolesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  roleCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  roleCardSelected: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  roleIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  roleTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  roleSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkSelected: {
    backgroundColor: "rgba(139, 92, 246, 0.95)",
    borderColor: "rgba(139, 92, 246, 0.95)",
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
