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

export function ResetPassword({
  email,
  onSuccess,
  onBack,
}: {
  email: string;
  onSuccess?: () => void;
  onBack?: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "good" | "strong"
  >("weak");

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const screenWidth = Dimensions.get("window").width;

  const MIN_PASSWORD_LENGTH = 8;

  const checkPasswordStrength = (password: string) => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordStrength("weak");
    } else if (password.length < 12) {
      setPasswordStrength("good");
    } else {
      setPasswordStrength("strong");
    }
  };

  const handlePasswordChange = (text: string) => {
    setNewPassword(text);
    checkPasswordStrength(text);
  };

  const handleUpdatePassword = async () => {
    Keyboard.dismiss();

    if (!newPassword || !confirmPassword) {
      Alert.alert("Missing fields", "Please fill in both password fields.");
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      Alert.alert(
        "Password too short",
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Passwords don't match",
        "New password and confirm password must be the same.",
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        Alert.alert(
          "Update failed",
          error.message || "Unable to update password.",
        );
        return;
      }

      Alert.alert(
        "Success",
        "Your password has been updated. Please sign in again.",
      );
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          onPress={() => onBack?.()}
          style={styles.backButton}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.heading}>New password</Text>
            <Text style={styles.subtitle}>
              At least {MIN_PASSWORD_LENGTH} characters.
            </Text>

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
                ref={newPasswordRef}
                style={styles.input}
                placeholder="New password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={newPassword}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showNewPassword}
                returnKeyType="next"
                textContentType="newPassword"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>
            </View>

            {newPassword ? (
              <View
                style={[
                  styles.strengthContainer,
                  { width: Math.min(520, screenWidth - 48) },
                ]}
              >
                <View
                  style={[
                    styles.strengthBar,
                    {
                      width:
                        passwordStrength === "weak"
                          ? "33%"
                          : passwordStrength === "good"
                            ? "66%"
                            : "100%",
                    },
                  ]}
                />
              </View>
            ) : null}

            {newPassword ? (
              <Text
                style={[
                  styles.strengthLabel,
                  {
                    color:
                      passwordStrength === "weak"
                        ? "#FF6B6B"
                        : passwordStrength === "good"
                          ? "#FFA500"
                          : "#51CF66",
                  },
                ]}
              >
                {passwordStrength === "weak"
                  ? "Weak"
                  : passwordStrength === "good"
                    ? "Good"
                    : "Strong"}
              </Text>
            ) : null}

            <Text style={styles.confirmLabel}>Confirm password</Text>
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
                ref={confirmPasswordRef}
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                textContentType="password"
                onSubmitEditing={handleUpdatePassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>
            </View>

            {confirmPassword && newPassword === confirmPassword ? (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#51CF66"
                style={styles.confirmIcon}
              />
            ) : null}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleUpdatePassword}
              disabled={loading}
            >
              <LinearGradient
                colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.updateButton,
                  { width: Math.min(520, screenWidth - 48) },
                ]}
              >
                <Text style={styles.updateButtonText}>
                  {loading ? "Updating..." : "Update password"}
                </Text>
              </LinearGradient>
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
  backButton: {
    position: "absolute",
    top: 8,
    left: 0,
    zIndex: 10,
    padding: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
  },
  form: {
    marginTop: 0,
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
    marginBottom: 24,
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
    marginBottom: 12,
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
  strengthContainer: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#51CF66",
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 22,
    textAlign: "right",
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 8,
  },
  confirmIcon: {
    alignSelf: "flex-end",
    marginTop: -40,
    marginRight: 16,
    marginBottom: 8,
  },
  updateButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
