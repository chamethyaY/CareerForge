import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignIn } from "./src/screens/signIn";
import { SignUp } from "./src/screens/SignUp";
import { SplashScreen } from "./src/screens/SplashScreen";
import { Verify } from "./src/screens/Verify";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "splash" | "signin" | "signup" | "verify"
  >("splash");
  const [verifyEmail, setVerifyEmail] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {currentScreen === "splash" ? (
        <SplashScreen onNavigateToLogin={() => setCurrentScreen("signin")} />
      ) : currentScreen === "signin" ? (
        <SignIn onNavigateToSignUp={() => setCurrentScreen("signup")} />
      ) : currentScreen === "signup" ? (
        <SignUp
          onNavigateToSignIn={() => setCurrentScreen("signin")}
          onNavigateToVerify={(email) => {
            setVerifyEmail(email);
            setCurrentScreen("verify");
          }}
        />
      ) : (
        <Verify
          email={verifyEmail}
          onNavigateToSignIn={() => setCurrentScreen("signin")}
          onNavigateToHome={() => {
            setCurrentScreen("signin");
          }}
        />
      )}
    </SafeAreaView>
  );
}
