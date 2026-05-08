import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type SplashScreenProps = {
  onNavigateToLogin: () => void;
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
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
  paginationActive: {
    opacity: 0.95,
    transform: [{ scale: 1.05 }],
  },
  paginationInactive: {
    opacity: 0.32,
  },
});

export function SplashScreen({ onNavigateToLogin }: SplashScreenProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const timers: Array<number> = [];

    // Activate dots at 0.5s, 1s, 1.5s
    timers.push(window.setTimeout(() => setActiveIndex(0), 500));
    timers.push(window.setTimeout(() => setActiveIndex(1), 1000));
    timers.push(window.setTimeout(() => setActiveIndex(2), 1500));

    // After the sequence, navigate to login at 2s
    timers.push(window.setTimeout(() => onNavigateToLogin(), 2000));

    return () => timers.forEach((t) => clearTimeout(t));
  }, [onNavigateToLogin]);

  return (
    <LinearGradient
      colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconBox}>
            <Ionicons name="star-outline" size={48} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>CareerForge</Text>
          <Text style={styles.subtitle}>
            AI-Powered Career Operating System
          </Text>

          <View style={styles.paginationContainer}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.paginationDot,
                  i === activeIndex
                    ? styles.paginationActive
                    : styles.paginationInactive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
