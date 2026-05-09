import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../services/supabase";

type Props = {
  onSignOut?: () => void;
};

export function MainApp({ onSignOut }: Props) {
  const [internshipProgress] = useState(62);
  const [dayStreak] = useState(12);
  const [skillsDone] = useState(18);
  const [projectsBuilt] = useState(4);
  const [userName, setUserName] = useState<string>("");
  const [initials, setInitials] = useState<string>("?");

  const screenWidth = Dimensions.get("window").width;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const computeInitials = (nameOrEmail: string) => {
    if (!nameOrEmail) return "?";
    const name = nameOrEmail.trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    // if single word (or email), try to use first two letters
    const withoutAt = name.split("@")[0];
    if (withoutAt.length >= 2) return withoutAt.slice(0, 2).toUpperCase();
    return withoutAt[0].toUpperCase();
  };

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) return;
        const user = data?.user as any;
        if (!user) return;
        // prefer metadata name, fall back to user.email
        const meta = user.user_metadata || user.user_metadata || {};
        const name = meta?.name || meta?.full_name || user.email || "";
        if (!mounted) return;
        setUserName(name);
        setInitials(computeInitials(name));
      } catch (e) {
        // ignore
      }
    };
    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.userName}>{userName || "Welcome"}</Text>
        </View>
        <TouchableOpacity onPress={onSignOut}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Internship Readiness */}
      <View style={styles.readinessCard}>
        <Text style={styles.readinessLabel}>Internship readiness</Text>
        <View style={styles.readinessTitleRow}>
          <Text style={styles.readinessTitle}>Keep it up!</Text>
          <Text style={styles.readinessPercent}>{internshipProgress}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${internshipProgress}%` }]}
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={20} color="#7B6CF6" />
          <Text style={styles.statNumber}>{dayStreak}</Text>
          <Text style={styles.statLabel}>day streak</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={20} color="#2EC6C6" />
          <Text style={styles.statNumber}>{skillsDone}</Text>
          <Text style={styles.statLabel}>skills done</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="bulb" size={20} color="#C86DD7" />
          <Text style={styles.statNumber}>{projectsBuilt}</Text>
          <Text style={styles.statLabel}>projects built</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIconBox}>
            <Ionicons name="book" size={24} color="#7B6CF6" />
          </View>
          <Text style={styles.actionText}>Continue Learning</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIconBox}>
            <Ionicons name="map" size={24} color="#2EC6C6" />
          </View>
          <Text style={styles.actionText}>View Roadmap</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIconBox}>
            <Ionicons name="chatbubble" size={24} color="#C86DD7" />
          </View>
          <Text style={styles.actionText}>Chat with AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIconBox}>
            <Ionicons name="folder" size={24} color="#F77F00" />
          </View>
          <Text style={styles.actionText}>Projects</Text>
        </TouchableOpacity>
      </View>

      {/* AI Insights */}
      <Text style={styles.sectionTitle}>AI INSIGHTS</Text>
      <View style={styles.insightCard}>
        <View style={styles.insightIconBox}>
          <Ionicons name="sparkles" size={20} color="#7B6CF6" />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightText}>
            Based on your progress, focus on{" "}
            <Text style={styles.insightHighlight}>
              TypeScript and React Testing
            </Text>{" "}
            to boost your readiness by 15%.
          </Text>
          <TouchableOpacity>
            <Text style={styles.insightLink}>View details →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 32,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7B6CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  readinessCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  readinessLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  readinessTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  readinessTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  readinessPercent: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7B6CF6",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
  },
  actionIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  insightCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  insightIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(123, 108, 246, 0.2)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
    marginBottom: 8,
  },
  insightHighlight: {
    color: "#7B6CF6",
    fontWeight: "600",
  },
  insightLink: {
    fontSize: 12,
    color: "#7B6CF6",
    fontWeight: "600",
  },
});
