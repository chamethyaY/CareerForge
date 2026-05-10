import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignIn } from "./src/screens/authentication/signIn";
import { SignUp } from "./src/screens/authentication/SignUp";
import { SplashScreen } from "./src/screens/authentication/SplashScreen";
import { Verify } from "./src/screens/authentication/Verify";
import { ForgotPassword } from "./src/screens/authentication/ForgotPassword";
import { ResetPassword } from "./src/screens/authentication/ResetPassword";
import { Dashboard } from "./src/screens/onboarding/primaryGoal";
import { CurrentLevel } from "./src/screens/onboarding/CurrentLevel";
import { SelectRoles } from "./src/screens/onboarding/SelectRoles";
import { Commitment } from "./src/screens/onboarding/Commitment";
import { MainApp } from "./src/screens/MainApp";
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
    | "goal"
    | "forgot"
    | "reset"
    | "level"
    | "roles"
    | "commitment"
    | "dashboard"
  >("splash");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyName, setVerifyName] = useState<string | undefined>(undefined);
  const [verifyFlow, setVerifyFlow] = useState<"signup" | "recovery">("signup");
  const [splashNextScreen, setSplashNextScreen] = useState<
    "signin" | "goal" | "dashboard"
  >("signin");
  const [goal, setGoal] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState<string | null>(null);

  const resetSessionState = () => {
    setVerifyEmail("");
    setVerifyFlow("signup");
    setSplashNextScreen("signin");
    setHasCompletedOnboarding(false);
    setGoal(null);
    setLevel(null);
    setRoles([]);
    setTimeCommitment(null);
  };

  // Keep onboarding values locally per-step. We only write once (insert-only)
  // when the user completes onboarding.
  const saveOnboarding = async (
    nextValues: {
      goal?: string | null;
      level?: string | null;
      roles?: string[];
      timeCommitment?: string | null;
    } = {},
  ) => {
    const resolvedGoal = nextValues.goal ?? goal;
    const resolvedLevel = nextValues.level ?? level;
    const resolvedRoles = nextValues.roles ?? roles;
    const resolvedTimeCommitment = nextValues.timeCommitment ?? timeCommitment;

    if (nextValues.goal !== undefined) setGoal(nextValues.goal ?? null);
    if (nextValues.level !== undefined) setLevel(nextValues.level ?? null);
    if (nextValues.roles !== undefined) setRoles(nextValues.roles ?? []);
    if (nextValues.timeCommitment !== undefined)
      setTimeCommitment(nextValues.timeCommitment ?? null);
  };

  const [hasCompletedOnboarding, setHasCompletedOnboarding] =
    useState<boolean>(false);

  const syncOnboardingState = async (userId: string | null) => {
    if (!userId) {
      setHasCompletedOnboarding(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed reading profile:", error);
      return;
    }

    setHasCompletedOnboarding(Boolean(profile?.onboarding_completed));
  };

  // On app start / auth change, check if the user already completed onboarding.
  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        if (!mounted) return;

        if (!user) {
          resetSessionState();
          return;
        }

        await syncOnboardingState(user.id);
      } catch (err) {
        console.error("check onboarding error:", err);
      }
    };

    check();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session?.user) {
        resetSessionState();
        setCurrentScreen("signin");
        return;
      }

      void syncOnboardingState(session.user.id);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const goToDashboardOrMain = () => {
    if (hasCompletedOnboarding) setCurrentScreen("dashboard");
    else setCurrentScreen("goal");
  };

  // Insert-only: attempt to insert the profile once. If a row already exists,
  // do not overwrite it (no upsert). This enforces immutability after first save.
  // Accept optional overrides so callers can pass the most recent step value
  // (avoids reading stale state when setState hasn't flushed yet).
  const insertOnboarding = async (
    overrides: {
      goal?: string | null;
      level?: string | null;
      roles?: string[];
      timeCommitment?: string | null;
    } = {},
  ) => {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;
      if (!user) {
        throw new Error("No authenticated user found.");
      }

      const payload: any = {
        id: user.id,
        goal: overrides.goal ?? goal,
        level: overrides.level ?? level,
        roles: overrides.roles ?? roles,
        time_commitment: overrides.timeCommitment ?? timeCommitment,
        onboarding_completed: true,
      };

      console.log("Inserting onboarding payload:", payload);
      const { error } = await supabase.from("user_profiles").insert(payload);

      if (error) {
        // If the insert fails because the row already exists, ignore — we must
        // not overwrite existing records. Different Supabase/Postgres setups
        // may return different error shapes; treat duplicates as non-fatal.
        const msg = (error && error.message) || "";
        if (msg.toLowerCase().includes("duplicate")) {
          console.warn("Profile already exists - not overwriting.");
        } else {
          throw error;
        }
      } else {
        setHasCompletedOnboarding(true);
      }
    } catch (err) {
      console.error("Failed to insert onboarding:", err);
      throw err;
    }
  };

  const handleSplashComplete = () => {
    if (splashNextScreen === "goal") goToDashboardOrMain();
    else setCurrentScreen(splashNextScreen);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Sign out failed", error.message || "Please try again.");
        return;
      }

      resetSessionState();
      setCurrentScreen("signin");
    } catch (err) {
      console.error("Sign out error:", err);
      Alert.alert("Sign out failed", "Please try again.");
    }
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
            setCurrentScreen("dashboard");
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
          onNavigateToVerify={(email, fullName) => {
            setVerifyEmail(email);
            setVerifyName(fullName);
            setVerifyFlow("signup");
            setCurrentScreen("verify");
          }}
          onBack={() => setCurrentScreen("signin")}
        />
      ) : currentScreen === "verify" ? (
        <Verify
          email={verifyEmail}
          name={verifyName}
          mode={verifyFlow}
          onNavigateToSignIn={() => setCurrentScreen("signin")}
          onNavigateToReset={() => setCurrentScreen("reset")}
          onNavigateToHome={() => {
            if (verifyFlow === "signup") setCurrentScreen("goal");
            else goToDashboardOrMain();
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
          onBackToDashboard={() => goToDashboardOrMain()}
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
          onBackToDashboard={() => goToDashboardOrMain()}
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
          onBackToDashboard={() => goToDashboardOrMain()}
          onContinue={async (selectedCommitment) => {
            setTimeCommitment(selectedCommitment);

            try {
              await saveOnboarding({ timeCommitment: selectedCommitment });
              // Start insert in background and navigate immediately to dashboard
              // so user isn't blocked by network latency. Insert is insert-only
              // and will not overwrite existing records.
              insertOnboarding({ timeCommitment: selectedCommitment }).catch(
                (e) => {
                  console.error("Insert onboarding failed:", e);
                },
              );

              // Mark onboarding as completed locally and go to dashboard.
              setHasCompletedOnboarding(true);
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
      ) : currentScreen === "dashboard" ? (
        <MainApp onSignOut={handleSignOut} />
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
