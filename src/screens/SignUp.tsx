import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from "react-native";

export function SignUp({
  onNavigateToSignIn,
  onNavigateToVerify,
}: {
  onNavigateToSignIn?: () => void;
  onNavigateToVerify?: (email: string) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupCooldown, setSignupCooldown] = useState(0);
  const emailInputRef = useRef<TextInput>(null);
  const createPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const screenWidth = Dimensions.get("window").width;
  const isDuplicateEmailError = (message?: string) =>
    /already\s+registered|already\s+exists|user\s+already/i.test(
      message ?? "",
    );

  const handleSignUp = async () => {
    Keyboard.dismiss();
    setError(null);

    if (!fullName || !email || !createPassword || !confirmPassword) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    if (createPassword !== confirmPassword) {
      Alert.alert("Password mismatch", "Create password and confirm password must match.");
      return;
    }

    if (createPassword.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signError } = await supabase.auth.signUp({
        email,
        password: createPassword,
      });

      // Helpful debug output when diagnosing rate-limit / token issues
      // Remove or reduce logging in production.
      // This shows whether Supabase returned a user/session or any server message.
      // eslint-disable-next-line no-console
      console.log("supabase.signUp result:", { data, signError });

      if (signError) {
        const msg = signError.message ?? "";
        if (/rate limit|email rate limit|429/i.test(msg)) {
          Alert.alert(
            "Too many requests",
            "Email rate limit exceeded. Please wait 60 seconds before trying again.",
          );
          setSignupCooldown(60);
          // eslint-disable-next-line no-console
          console.warn("supabase.signUp rate limit:", msg);
          return;
        }
        if (isDuplicateEmailError(signError.message)) {
          Alert.alert(
            "Sign up failed",
            "There is a user with the same email.",
          );
          return;
        }
        setError(signError.message || "Sign up failed.");
        // show server message for easier debugging
        // eslint-disable-next-line no-console
        console.warn("signUp error message:", signError.message);
        return;
      }

      onNavigateToVerify?.(email);
    } catch (e: any) {
      if (isDuplicateEmailError(e?.message)) {
        Alert.alert("Sign up failed", "There is a user with the same email.");
        return;
      }
      setError(e?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!signupCooldown) return;
    const timer = setInterval(() => setSignupCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [signupCooldown]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <View style={styles.content}>
        <View style={styles.topIconWrap}>
          <View style={styles.iconShadow} />
          <LinearGradient
            colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name="star-outline" size={36} color="#FFFFFF" />
          </LinearGradient>
        </View>

        <View style={styles.form}>
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start your journey</Text>

          <View style={[styles.inputContainer, { width: Math.min(520, screenWidth - 48) }]}>
            <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <View style={[styles.inputContainer, { width: Math.min(520, screenWidth - 48) }]}>
            <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => createPasswordInputRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <View style={[styles.inputContainer, { width: Math.min(520, screenWidth - 48) }]}>
            <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
            <TextInput
              ref={createPasswordInputRef}
              style={styles.input}
              placeholder="Create password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={createPassword}
              onChangeText={setCreatePassword}
              secureTextEntry={!showCreatePassword}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={() => setShowCreatePassword(!showCreatePassword)} style={styles.eyeIcon}>
              <Ionicons name={showCreatePassword ? "eye-outline" : "eye-off-outline"} size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { width: Math.min(520, screenWidth - 48) }]}>
            <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
            <TextInput
              ref={confirmPasswordInputRef}
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          

          {error ? <Text style={{ color: "#FF6B6B", marginBottom: 8 }}>{error}</Text> : null}
          {signupCooldown ? (
            <Text style={{ color: "#FF6B6B", marginBottom: 8 }}>
              Please wait {signupCooldown}s before trying again.
            </Text>
          ) : null}

          <TouchableOpacity activeOpacity={0.9} onPress={handleSignUp} disabled={loading || signupCooldown > 0}>
            <LinearGradient colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.signInButton, { width: Math.min(520, screenWidth - 48) }]}>
              <Text style={styles.signInButtonText}>{loading ? "Creating..." : "Sign Up"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={[styles.dividerContainer, { width: Math.min(520, screenWidth - 48) }]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={[styles.socialContainer, { width: Math.min(520, screenWidth - 48) }]}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={18} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-github" size={18} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>GitHub</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => onNavigateToSignIn && onNavigateToSignIn()}>
            <Text style={styles.signUpLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  form: {
    marginTop: 28,
  },
  topIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 36,
    marginBottom: 12,
  },
  iconShadow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 28,
    shadowColor: "#7B6CF6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 8,
    zIndex: -1,
  },
  iconGradient: {
    width: 88,
    height: 88,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
    alignSelf: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 44,
    textAlign: "center",
    alignSelf: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 22,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 12,
  },
  forgotPassword: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    color: "#7B6CF6",
  },
  forgotPasswordRow: {
    alignItems: "flex-end",
    marginTop: 2,
    marginBottom: 28,
  },
  signInButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 34,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 24,
  },
  socialButton: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 30,
  },
  signUpText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7B6CF6",
  },
});
