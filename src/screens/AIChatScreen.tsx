import { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import { sendToGemini, buildSystemPrompt, Message } from "../lib/geminiChat";

const QUICK_PROMPTS = [
  "What should I learn next?",
  "What projects should I build?",
  "How ready am I for internships?",
  "What are my skill gaps?",
];

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

  useEffect(() => {
    initChat();
  }, []);

  // ── Init: load profile + history ──────────────────────────────────────────

  const initChat = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("goal, level, roles, name, full_name, display_name")
        .eq("id", user.id)
        .single();

      // Get user name
      const userName =
        profile?.name ||
        profile?.full_name ||
        profile?.display_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "there";

      // Get completed skills
      const { data: skills, error: skillsError } = await supabase
        .from("skill_progress")
        .select("skill_id")
        .eq("user_id", user.id)
        .eq("status", "done");

      const skillsCount = skills?.length ?? 0;

      // Build system prompt
      const prompt = buildSystemPrompt(
        profile?.goal ?? "",
        profile?.level ?? "",
        profile?.roles ?? [],
        skills?.map((s: any) => s.skill_id) ?? [],
      );
      setSystemPrompt(prompt);

      // Load chat history
      const { data: history, error: historyError } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);
      const goalText =
        profile?.goal === "internship"
          ? "frontend internship"
          : profile?.goal || "your career goals";
      const rolesText = profile?.roles ? (Array.isArray(profile.roles) ? profile.roles.join(", ") : String(profile.roles)) : "your profile role";
      const welcomeMsg = `Hey ${userName}! 👋 I'm Forge AI, your personal career mentor. I can see you're aiming for a ${goalText} with interests in ${rolesText}. You've completed ${skillsCount} skills so far.\n\nWhat do you want to work on today?`;
      setWelcomeMessage(welcomeMsg);

      if (history && history.length > 0) {
        setMessages(history as Message[]);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("initChat error:", err);
      setWelcomeMessage(
        "Hey! 👋 I'm Forge AI, your personal career mentor. What do you want to work on today?",
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = async (text?: string) => {
    const messageText = text ?? inputText.trim();
    if (!messageText || sending) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setInputText("");
    setSending(true);

    // 1. Add user message to UI immediately
    const userMessage: Message = { role: "user", content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // 2. Save user message to Supabase
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: messageText,
    });

    // 3. Add loading bubble
    setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

    try {
      // 4. Call Gemini with full history
      const reply = await sendToGemini(updatedMessages, systemPrompt);

      // 5. Replace loading bubble with real reply
      setMessages((prev) => [
        ...prev.slice(0, -1), // remove '...'
        { role: "assistant", content: reply },
      ]);

      // 6. Save AI reply to Supabase
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: reply,
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }

    setSending(false);
  };

  // ── Scroll to bottom on new message ──────────────────────────────────────

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const visibleMessages = useMemo(() => {
    if (!searchText.trim()) return messages;
    const q = searchText.trim().toLowerCase();
    return messages.filter((m) => m.content.toLowerCase().includes(q));
  }, [messages, searchText]);

  // ── Render message bubble ─────────────────────────────────────────────────

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isAI = item.role === "assistant";
    const isLoading = item.content === "...";
    const isFirst = index === 0;

    return (
      <View>
        <View
          style={[
            styles.messageRow,
            isAI ? styles.messageRowAI : styles.messageRowUser,
          ]}
        >
          {isAI && (
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={12} color="#fff" />
            </View>
          )}
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
      </View>
    );
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#534AB7" size="large" />
        <Text style={styles.loadingText}>Preparing Forge AI...</Text>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <View style={{ flex: 1 }}>
          {/* Header */}
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

          {/* Messages */}
          {welcomeMessage ? (
            <View>
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

              {!searchText.trim() && messages.length === 0 && (
                <View style={styles.chipsWrap}>
                  {QUICK_PROMPTS.map((prompt) => (
                    <TouchableOpacity
                      key={prompt}
                      style={styles.chip}
                      onPress={() => handleSend(prompt)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chipText}>{prompt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : null}

          <FlatList
            ref={flatListRef}
            data={visibleMessages}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Input bar - fixed at bottom */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.leftIconWrap}
            onPress={() => {
              setSearchMode((s) => {
                const next = !s;
                if (!next) setSearchText("");
                return next;
              });
            }}
          >
            <Ionicons
              name={searchMode ? "search" : "mic"}
              size={18}
              color="#9A99A8"
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={searchMode ? searchText : inputText}
            onChangeText={(t) =>
              searchMode ? setSearchText(t) : setInputText(t)
            }
            placeholder={searchMode ? "Search messages..." : "Ask anything..."}
            placeholderTextColor="#6B6A7A"
            multiline={!searchMode}
            maxLength={500}
            onSubmitEditing={() => {
              if (searchMode) return;
              handleSend();
            }}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || sending) &&
                !searchMode &&
                styles.sendBtnDisabled,
            ]}
            onPress={() => {
              if (searchMode) return;
              handleSend();
            }}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() && !sending ? "#fff" : "#3A3A48"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0E0E12" },
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

  // Header
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

  // Messages
  messagesList: { paddingTop: 32, paddingBottom: 120, paddingHorizontal: 16, gap: 12 },
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
  bubbleText: { fontSize: 16, fontWeight: "500", lineHeight: 24, flexWrap: "wrap" },
  bubbleTextAI: { color: "#D4D3E0" },
  bubbleTextUser: { color: "#EEEDFE" },

  // Quick prompts
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingLeft: 34,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "#1C1B2E",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: "#534AB7",
  },
  chipText: { fontSize: 11, color: "#9A99A8" },

  // Input
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    paddingBottom: 70,
    borderTopWidth: 0.5,
    borderTopColor: "#1A1A22",
    backgroundColor: "#0E0E12",
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#14141C",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#534AB7",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: "#fff",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#534AB7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sendBtnDisabled: { backgroundColor: "#1A1A22" },
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#1A1A22",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#14141C",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    color: "#fff",
  },
  searchClearText: { marginLeft: 10, color: "#9A99A8" },
  leftIconWrap: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
});
