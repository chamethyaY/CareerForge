import { Pressable, StyleSheet, Text, View } from "react-native";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  button: {
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#3b82f6",
  },
  inner: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  label: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <View style={styles.inner}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}
