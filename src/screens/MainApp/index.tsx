import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  onSignOut?: () => void;
};

export function MainApp({ onSignOut }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back 🎉</Text>
      <Text style={styles.subtitle}>You've already completed onboarding.</Text>
      <TouchableOpacity style={styles.signout} onPress={onSignOut}>
        <Text style={styles.signoutTxt}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#bdbdd0", fontSize: 14, marginBottom: 20 },
  signout: {
    backgroundColor: "#534AB7",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  signoutTxt: { color: "#fff", fontWeight: "600" },
});
