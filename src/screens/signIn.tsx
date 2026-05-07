import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
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
export function SignIn({
  onNavigateToSignUp,
  onNavigateToSplash,
  onNavigateToForgotPassword,
}: {
  onNavigateToSignUp?: () => void;
  onNavigateToSplash?: () => void;
  onNavigateToForgotPassword?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleSignIn = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert(
          "Sign in failed",
          error.message || "Please check your credentials.",
        );
        return;
      }

      onNavigateToSplash?.();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    Keyboard.dismiss();

    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email address first.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
        },
      });

      // eslint-disable-next-line no-console
      console.log(
        "signInWithOtp called for password recovery:",
        email.trim().toLowerCase(),
      );

      if (error) {
        Alert.alert(
          "Request failed",
          error.message || "Unable to send code right now.",
        );
        return;
      }

      Alert.alert(
        "Check your email",
        "We've sent a 6-digit code to " +
          email.trim().toLowerCase() +
          ". Enter it on the next screen.",
      );

      onNavigateToForgotPassword?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
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
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your journey
            </Text>

            <View
              style={[
                styles.inputContainer,
                { width: Math.min(520, screenWidth - 48) },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color="rgba(255,255,255,0.5)"
                style={styles.inputIcon}
              />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <View
              style={[
                styles.inputContainer,
                { width: Math.min(520, screenWidth - 48) },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="rgba(255,255,255,0.5)"
                style={styles.inputIcon}
              />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                textContentType="password"
                autoComplete="password"
                onSubmitEditing={handleSignIn}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.forgotPasswordRow,
                { width: Math.min(520, screenWidth - 48) },
              ]}
            >
              <TouchableOpacity
                onPress={() => onNavigateToForgotPassword?.()}
                disabled={loading}
              >
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSignIn}
              activeOpacity={0.9}
              disabled={loading}
            >
              <LinearGradient
                colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.signInButton,
                  { width: Math.min(520, screenWidth - 48) },
                ]}
              >
                <Text style={styles.signInButtonText}>
                  {loading ? "Signing In..." : "Sign In"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View
              style={[
                styles.dividerContainer,
                { width: Math.min(520, screenWidth - 48) },
              ]}
            >
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View
              style={[
                styles.socialContainer,
                { width: Math.min(520, screenWidth - 48) },
              ]}
            >
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
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => onNavigateToSignUp && onNavigateToSignUp()}
            >
              <Text style={styles.signUpLink}>Sign Up</Text>
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
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 8,
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
