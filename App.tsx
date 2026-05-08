import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignIn } from "./src/screens/signIn";
import { SignUp } from "./src/screens/SignUp";
import { SplashScreen } from "./src/screens/SplashScreen";
import { Verify } from "./src/screens/Verify";
import { ForgotPassword } from "./src/screens/ForgotPassword";
import { ResetPassword } from "./src/screens/ResetPassword";
import { Dashboard } from "./src/screens/Dashboard";
import { CurrentLevel } from "./src/screens/CurrentLevel";
import { SelectRoles } from "./src/screens/SelectRoles";
import { Commitment } from "./src/screens/Commitment";
import { supabase } from "./src/services/supabase";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    | "splash"
    | "signin"
    | "signup"
    | "verify"
    | "dashboard"
    | "forgot"
    | "reset"
    | "level"
    | "roles"
    | "commitment"
  >("splash");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyFlow, setVerifyFlow] = useState<"signup" | "recovery">("signup");
  const [splashNextScreen, setSplashNextScreen] = useState<
    "signin" | "dashboard"
  >("signin");
  const [goal, setGoal] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState<string | null>(null);

  const saveOnboarding = async (nextValues: {
    goal?: string | null;
    level?: string | null;
    roles?: string[];
    timeCommitment?: string | null;
  } = {}) => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      throw new Error("No authenticated user found.");
    }

    const payload: Record<string, unknown> = {
      id: user.id,
    };

    const resolvedGoal = nextValues.goal ?? goal;
    const resolvedLevel = nextValues.level ?? level;
    const resolvedRoles = nextValues.roles ?? roles;
    const resolvedTimeCommitment = nextValues.timeCommitment ?? timeCommitment;

    if (resolvedGoal !== null) payload.goal = resolvedGoal;
    if (resolvedLevel !== null) payload.level = resolvedLevel;
    if (resolvedRoles.length > 0) payload.roles = resolvedRoles;
    if (resolvedTimeCommitment !== null) payload.time_commitment = resolvedTimeCommitment;

    const { error } = await supabase
      .from("user_profiles")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      throw error;
    }
  };

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
          onNavigateToReset={() => setCurrentScreen("reset")}
          onNavigateToHome={() => {
            setCurrentScreen("dashboard");
          }}
        />
      ) : currentScreen === "reset" ? (
        <ResetPassword
          email={verifyEmail}
          onBack={() => setCurrentScreen("verify")}
          onSuccess={() => setCurrentScreen("signin")}
        />
      ) : currentScreen === "level" ? (
        <CurrentLevel
          onBackToDashboard={() => setCurrentScreen("dashboard")}
          onContinue={async (selectedLevel) => {
            setLevel(selectedLevel);

            try {
              await saveOnboarding({ level: selectedLevel });
              setCurrentScreen("roles");
            } catch (error) {
              console.error("Failed to save level:", error);
              Alert.alert("Save failed", "Could not save your current level.");
            }
          }}
        />
      ) : currentScreen === "roles" ? (
        <SelectRoles
          onBackToDashboard={() => setCurrentScreen("dashboard")}
          onContinue={async (selectedRoles) => {
            setRoles(selectedRoles);

            try {
              await saveOnboarding({ roles: selectedRoles });
              setCurrentScreen("commitment");
            } catch (error) {
              console.error("Failed to save roles:", error);
              Alert.alert("Save failed", "Could not save your role selection.");
            }
          }}
        />
      ) : currentScreen === "commitment" ? (
        <Commitment
          onBackToDashboard={() => setCurrentScreen("dashboard")}
          onContinue={async (selectedCommitment) => {
            setTimeCommitment(selectedCommitment);

            try {
              await saveOnboarding({ timeCommitment: selectedCommitment });
              setCurrentScreen("dashboard");
            } catch (error) {
              console.error("Failed to save onboarding:", error);
              Alert.alert(
                "Save failed",
                "Could not save your commitment level.",
              );
            }
          }}
        />
      ) : (
        <Dashboard
          onSignOut={() => setCurrentScreen("signin")}
          onContinue={async (selectedGoal) => {
            setGoal(selectedGoal);

            try {
              await saveOnboarding({ goal: selectedGoal });
              setCurrentScreen("level");
            } catch (error) {
              console.error("Failed to save goal:", error);
              Alert.alert("Save failed", "Could not save your primary goal.");
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}
