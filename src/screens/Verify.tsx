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

type VerifyProps = {
  email: string;
  mode?: "signup" | "recovery";
  onNavigateToSignIn?: () => void;
  onNavigateToHome?: () => void;
};

const OTP_LENGTH = 6;

export function Verify({
  email,
  mode = "signup",
  onNavigateToSignIn,
  onNavigateToHome,
}: VerifyProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRef = useRef<TextInput>(null);

  const screenWidth = Dimensions.get("window").width;

  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    setError(null);

    if (!otp || otp.length !== OTP_LENGTH) {
      Alert.alert("Invalid OTP", `Please enter a ${OTP_LENGTH}-digit code.`);
      return;
    }

    if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)) {
      Alert.alert("Invalid OTP", "OTP must contain only numbers.");
      return;
    }

    setLoading(true);
    try {
      const otpType = mode === "recovery" ? "email" : "signup";
      const { error: verifyError, data } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: otpType,
      });

      // eslint-disable-next-line no-console
      console.log("verifyOtp result:", { verifyError, data, mode, otpType });

      if (verifyError) {
        setError(verifyError.message || "Verification failed.");
        return;
      }

      if (mode === "recovery") {
        Alert.alert(
          "Code verified",
          "Your recovery code is verified. Please sign in with your new password.",
        );
        onNavigateToSignIn?.();
        return;
      }

      onNavigateToHome?.();
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setResendLoading(true);
    try {
      const resendResult =
        mode === "recovery"
          ? await supabase.auth.signInWithOtp({
              email: email.toLowerCase(),
              options: {
                shouldCreateUser: false,
              },
            })
          : await supabase.auth.resend({
              type: "signup",
              email,
            });

      const resendError = resendResult.error;

      if (resendError) {
        setError(resendError.message || "Resend failed.");
        return;
      }

      Alert.alert(
        "Code Resent",
        "A new verification code has been sent to your email.",
      );
      // start a cooldown to avoid hammering the email endpoint
      setResendCooldown(30);
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (!resendCooldown) return;
    const timer = setInterval(
      () => setResendCooldown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [resendCooldown]);

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
              <Ionicons name="checkmark-outline" size={36} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <View style={styles.form}>
            <Text style={styles.heading}>
              {mode === "recovery" ? "Verify Reset Code" : "Verify Your Email"}
            </Text>
            <Text style={styles.subtitle}>
              {mode === "recovery"
                ? `Enter the ${OTP_LENGTH}-digit reset code sent to ${email}`
                : `Enter the ${OTP_LENGTH}-digit code sent to ${email}`}
            </Text>

            <View
              style={[
                styles.inputContainer,
                { width: Math.min(520, screenWidth - 48) },
              ]}
            >
              <Ionicons
                name="key"
                size={20}
                color="rgba(255,255,255,0.5)"
                style={styles.inputIcon}
              />
              <TextInput
                ref={otpInputRef}
                style={styles.input}
                placeholder={"0".repeat(OTP_LENGTH)}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={otp}
                onChangeText={(text) => {
                  // Allow only numbers, max 6 digits
                  if (new RegExp(`^\\d{0,${OTP_LENGTH}}$`).test(text)) {
                    setOtp(text);
                  }
                }}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                returnKeyType="done"
                onSubmitEditing={handleVerifyOtp}
              />
            </View>

            {error ? (
              <Text style={{ color: "#FF6B6B", marginBottom: 8 }}>{error}</Text>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              <LinearGradient
                colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.verifyButton,
                  { width: Math.min(520, screenWidth - 48) },
                ]}
              >
                <Text style={styles.verifyButtonText}>
                  {loading ? "Verifying..." : "Verify Code"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleResendOtp}
              disabled={resendLoading || resendCooldown > 0}
              style={{ marginTop: 18 }}
            >
              <Text style={styles.resendText}>
                {resendLoading
                  ? "Resending..."
                  : resendCooldown
                    ? `Resend available in ${resendCooldown}s`
                    : "Didn't receive the code? Resend"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.backContainer}>
            <TouchableOpacity onPress={() => onNavigateToSignIn?.()}>
              <Text style={styles.backLink}>
                {mode === "recovery" ? "Back to Sign In" : "Back to Sign Up"}
              </Text>
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
    letterSpacing: 4,
    textAlign: "center",
  },
  verifyButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resendText: {
    fontSize: 14,
    color: "#7B6CF6",
    fontWeight: "600",
    textAlign: "center",
  },
  backContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 30,
  },
  backLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    textDecorationLine: "underline",
  },
});
