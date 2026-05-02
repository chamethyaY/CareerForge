import { StyleSheet, Text, View } from "react-native";

type FeatureCardProps = {
  title: string;
  description: string;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f5f9",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#94a3b8",
  },
});

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
