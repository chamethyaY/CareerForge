import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { supabase } from "../../services/supabase";
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

export function ForgotPassword({
  onSend,
  onBack,
}: {
  onSend?: (email: string) => void;
  onBack?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const screenWidth = Dimensions.get("window").width;

  const handleSend = async () => {
    Keyboard.dismiss();
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false },
      });

      if (error) {
        Alert.alert("Request failed", error.message || "Unable to send code.");
        return;
      }

      Alert.alert(
        "Check your email",
        `We've sent a 6-digit code to ${email.trim().toLowerCase()}`,
      );
      onSend?.(email.trim().toLowerCase());
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
          <View style={styles.topIconWrap}>
            <View style={styles.iconShadow} />
            <LinearGradient
              colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name="mail-outline" size={36} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <View style={styles.form}>
            <Text style={styles.heading}>Forgot password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send a 6-digit code.
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
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSend}
              disabled={loading}
            >
              <LinearGradient
                colors={["#7B6CF6", "#C86DD7", "#2EC6C6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.sendButton,
                  { width: Math.min(520, screenWidth - 48) },
                ]}
              >
                <Text style={styles.sendButtonText}>
                  {loading ? "Sending..." : "Send link"}
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
    marginBottom: 8,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
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
  form: {
    marginTop: 28,
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
    marginBottom: 22,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 12, color: "#FFFFFF", fontSize: 16 },
  sendButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  sendButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
