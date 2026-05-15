import { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import { sendToGemini, buildSystemPrompt, Message } from "../lib/geminiChat";

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    initChat();
  }, []);

  const initChat = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("goal, level, roles")
        .eq("id", user.id)
        .single();

      const { data: skills } = await supabase
        .from("skill_progress")
        .select("skill_id")
        .eq("user_id", user.id)
        .eq("status", "done");

      const prompt = buildSystemPrompt(
        profile?.goal ?? "",
        profile?.level ?? "",
        profile?.roles ?? [],
        skills?.map((s: any) => s.skill_id) ?? [],
      );
      setSystemPrompt(prompt);

      const userName =
        user.user_metadata?.name || user.email?.split("@")[0] || "there";

      const goalText =
        profile?.goal === "internship"
          ? "frontend internship"
          : profile?.goal || "your career goals";
      const rolesText = profile?.roles
        ? Array.isArray(profile.roles)
          ? profile.roles.join(", ")
          : String(profile.roles)
        : "your profile role";

      setWelcomeMessage(
        `Hey ${userName}! 👋 I'm Forge AI, your personal career mentor. I can see you're aiming for ${goalText} with interests in ${rolesText}.`,
      );

      setMessages([]);
    } catch (err) {
      console.error("initChat error:", err);
      setWelcomeMessage("Hey! 👋 I'm Forge AI, your personal career mentor.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text ?? inputText.trim();
    if (!messageText || sending) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setInputText("");
    setSending(true);

    const userMessage: Message = { role: "user", content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: messageText,
    });

    setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

    try {
      const reply = await sendToGemini(updatedMessages, systemPrompt);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: reply },
      ]);

      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: reply,
      });
    } catch (err) {
      console.error("Gemini call failed:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: `Error: ${errorMsg}` },
      ]);
    }

    setSending(false);
  };

  const visibleMessages = useMemo(() => {
    if (!searchText.trim()) return messages;
    const q = searchText.trim().toLowerCase();
    return messages.filter((m) => m.content.toLowerCase().includes(q));
  }, [messages, searchText]);

  const beginSearchMode = () => {
    setSearchMode(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const closeSearchMode = () => {
    setSearchMode(false);
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = ({ item }: { item: Message; index: number }) => {
    const isAI = item.role === "assistant";
    const isLoading = item.content === "...";

    return (
      <View
        style={[
          styles.messageRow,
          isAI ? styles.messageRowAI : styles.messageRowUser,
        ]}
      >
        {isAI ? (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={12} color="#fff" />
          </View>
        ) : null}
        <View
          style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#7F77DD" />
          ) : (
            <Text
              style={[
                styles.bubbleText,
                isAI ? styles.bubbleTextAI : styles.bubbleTextUser,
              ]}
            >
              {item.content}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#534AB7" size="large" />
        <Text style={styles.loadingText}>Preparing Forge AI...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={8}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerAvatar}>
                <Ionicons name="sparkles" size={16} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Forge AI</Text>
                <Text style={styles.headerSub}>Your career mentor</Text>
              </View>
              <View style={styles.onlineDot} />
            </View>

            {welcomeMessage && !searchMode ? (
              <View style={styles.welcomeWrap}>
                <View style={[styles.messageRow, styles.messageRowAI]}>
                  <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={12} color="#fff" />
                  </View>
                  <View style={[styles.bubble, styles.bubbleAI]}>
                    <Text style={[styles.bubbleText, styles.bubbleTextAI]}>
                      {welcomeMessage}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            <FlatList
              ref={flatListRef}
              data={visibleMessages}
              keyExtractor={(_, i) => i.toString()}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />

            <View style={styles.inputBar}>
              <TouchableOpacity
                style={styles.leftIconWrap}
                onPress={() => {
                  if (searchMode) {
                    setSearchText("");
                    closeSearchMode();
                    return;
                  }

                  beginSearchMode();
                }}
              >
                <Ionicons
                  name={searchMode ? "search" : "mic"}
                  size={18}
                  color="#9A99A8"
                />
              </TouchableOpacity>

              <TextInput
                ref={inputRef}
                style={styles.input}
                value={searchMode ? searchText : inputText}
                placeholder={
                  searchMode ? "Search messages..." : "Ask anything..."
                }
                placeholderTextColor="#6B6A7A"
                multiline={!searchMode}
                maxLength={500}
                blurOnSubmit={searchMode}
                textAlignVertical="top"
                onChangeText={(t) => {
                  if (searchMode) {
                    setSearchText(t);
                    return;
                  }

                  setInputText(t);
                }}
                onSubmitEditing={() => {
                  if (searchMode) {
                    closeSearchMode();
                    return;
                  }
                  handleSend();
                }}
              />

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!inputText.trim() || sending) && styles.sendBtnDisabled,
                ]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || sending || searchMode}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={
                    inputText.trim() && !sending && !searchMode
                      ? "#fff"
                      : "#3A3A48"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0E0E12" },
  keyboardWrap: { flex: 1 },
  container: { flex: 1, position: "relative" },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E0E12",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    color: "#9CA3AF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#1A1A22",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#534AB7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 30, fontWeight: "700", color: "#fff" },
  headerSub: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: "#9CA3AF",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1D9E75",
    marginLeft: "auto",
  },
  welcomeWrap: { paddingTop: 16 },
  messagesList: {
    paddingTop: 16,
    paddingBottom: 220,
    paddingHorizontal: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 8,
  },
  messageRowAI: { justifyContent: "flex-start" },
  messageRowUser: { justifyContent: "flex-end" },
  aiAvatar: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#534AB7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginBottom: 2,
  },
  bubble: { maxWidth: "78%", borderRadius: 14, padding: 12, minHeight: 48 },
  bubbleAI: {
    backgroundColor: "#14141C",
    borderWidth: 0.5,
    borderColor: "#2A2A36",
    borderBottomLeftRadius: 4,
  },
  bubbleUser: { backgroundColor: "#534AB7", borderBottomRightRadius: 4 },
  bubbleText: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    flexWrap: "wrap",
  },
  bubbleTextAI: { color: "#D4D3E0" },
  bubbleTextUser: { color: "#EEEDFE" },
  inputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 104,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#1A1A22",
    backgroundColor: "#0E0E12",
    zIndex: 20,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: "#14141C",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#534AB7",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    lineHeight: 22,
    color: "#fff",
  },
  sendBtn: {
    width: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: "#534AB7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sendBtnDisabled: { backgroundColor: "#1A1A22" },
  leftIconWrap: {
    width: 36,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
});
