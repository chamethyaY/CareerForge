import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "Home", icon: "home-outline" },
  { label: "Skills", icon: "school-outline" },
  { label: "AI", icon: "sparkles", active: true },
  { label: "Projects", icon: "folder-open-outline" },
  { label: "Profile", icon: "person-outline" },
];

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    marginTop: -72,
  },
  iconBox: {
    width: 112,
    height: 112,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  title: {
    marginTop: 28,
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
  },
  paginationContainer: {
    marginTop: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  paginationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  dot1: {
    opacity: 0.9,
  },
  dot2: {
    opacity: 0.55,
  },
  dot3: {
    opacity: 0.35,
  },
  navBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    backgroundColor: "#121829",
    paddingVertical: 10,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  navItemActive: {
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 6,
  },
  navLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.65)",
    fontWeight: "500",
  },
  navLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export function HomeScreen() {
  return (
    <LinearGradient
      colors={["#7D66FF", "#B365D6", "#39C2E2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconBox}>
            <Ionicons name="sparkles-outline" size={48} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>CareerForge</Text>
          <Text style={styles.subtitle}>
            AI-Powered Career Operating System
          </Text>

          <View style={styles.paginationContainer}>
            <View style={[styles.paginationDot, styles.dot1]} />
            <View style={[styles.paginationDot, styles.dot2]} />
            <View style={[styles.paginationDot, styles.dot3]} />
          </View>
        </View>

        <View style={styles.navBar}>
          {navItems.map((item) => {
            if (item.active) {
              return (
                <LinearGradient
                  key={item.label}
                  colors={["#6E5CFF", "#A85BFF"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.navItem, styles.navItemActive]}
                >
                  <Ionicons name={item.icon} size={20} color="#FFFFFF" />
                  <Text style={[styles.navLabel, styles.navLabelActive]}>
                    {item.label}
                  </Text>
                </LinearGradient>
              );
            }

            return (
              <View key={item.label} style={styles.navItem}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color="rgba(255, 255, 255, 0.65)"
                />
                <Text style={styles.navLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
}
