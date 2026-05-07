import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignIn } from "./src/screens/signIn";
import { SignUp } from "./src/screens/SignUp";
import { SplashScreen } from "./src/screens/SplashScreen";
import { Verify } from "./src/screens/Verify";
import { ForgotPassword } from "./src/screens/ForgotPassword";
import { Dashboard } from "./src/screens/Dashboard";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "splash" | "signin" | "signup" | "verify" | "dashboard" | "forgot"
  >("splash");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyFlow, setVerifyFlow] = useState<"signup" | "recovery">("signup");
  const [splashNextScreen, setSplashNextScreen] = useState<
    "signin" | "dashboard"
  >("signin");

  const handleSplashComplete = () => {
    setCurrentScreen(splashNextScreen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {currentScreen === "splash" ? (
        <SplashScreen onNavigateToLogin={handleSplashComplete} />
      ) : currentScreen === "signin" ? (
        <SignIn
          onNavigateToSignUp={() => setCurrentScreen("signup")}
          onNavigateToForgotPassword={() => {
            setCurrentScreen("forgot");
          }}
          onNavigateToSplash={() => {
            setSplashNextScreen("dashboard");
            setCurrentScreen("splash");
          }}
        />
      ) : currentScreen === "forgot" ? (
        <ForgotPassword
          onBack={() => setCurrentScreen("signin")}
          onSend={(email) => {
            setVerifyEmail(email);
            setVerifyFlow("recovery");
            setCurrentScreen("verify");
          }}
        />
      ) : currentScreen === "signup" ? (
        <SignUp
          onNavigateToSignIn={() => setCurrentScreen("signin")}
          onNavigateToVerify={(email) => {
            setVerifyEmail(email);
            setVerifyFlow("signup");
            setCurrentScreen("verify");
          }}
          onBack={() => setCurrentScreen("signin")}
        />
      ) : currentScreen === "verify" ? (
        <Verify
          email={verifyEmail}
          mode={verifyFlow}
          onNavigateToSignIn={() => setCurrentScreen("signin")}
          onNavigateToHome={() => {
            setCurrentScreen("dashboard");
          }}
        />
      ) : (
        <Dashboard onSignOut={() => setCurrentScreen("signin")} />
      )}
    </SafeAreaView>
  );
}
