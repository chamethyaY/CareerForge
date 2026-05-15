const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
console.log(
  "API KEY BEING USED:",
  process.env.EXPO_PUBLIC_GEMINI_API_KEY?.slice(0, 20),
);
const GEMINI_MODEL = "gemini-1.5-flash-8b";
const GEMINI_URL = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateText?key=${GEMINI_API_KEY}`
  : "";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

// Build system prompt from user's profile
export const buildSystemPrompt = (
  goal: string,
  level: string,
  roles: string[],
  tickedSkills: string[],
): string => {
  return `
You are Forge AI, a friendly career mentor for student developers.
Be concise, practical and encouraging. Max 120 words per response.

About this user:
- Goal: ${goal === "internship" ? "Land a developer internship" : goal}
- Level: ${level}
- Role interests: ${roles.join(", ")}
- Skills already completed: ${tickedSkills.length > 0 ? tickedSkills.join(", ") : "none yet"}

Always give advice specific to their situation.
Never give generic advice. Reference their actual skills and goal.
  `.trim();
};

// Send message to Gemini
export const sendToGemini = async (
  messages: Message[],
  systemPrompt: string,
): Promise<string> => {
  // Try server-side first
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY)
      throw new Error("Missing Supabase env");
    const fnUrl = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/dynamic-task`;
    const resp = await fetch(fnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ messages, systemPrompt }),
    });
    if (resp.ok) {
      const body = await resp.json();
      if (body?.reply) return body.reply;
    } else {
      const text = await resp.text().catch(() => "");
      console.warn(
        "Edge function dynamic-task failed:",
        resp.status,
        text.slice?.(0, 300),
      );
    }
  } catch (e) {
    console.warn(
      "Edge function invocation failed, will attempt client fallback if key present:",
      e instanceof Error ? e.message : String(e),
    );
  }

  if (!GEMINI_API_KEY) {
    const lastUser =
      [...messages].reverse().find((m) => m.role === "user")?.content ??
      "your question";
    return `Sorry — AI chat is temporarily unavailable. The app is configured to use a server-side AI (recommended). Please deploy the server function or enable a public Gemini key for a temporary fallback. Quick tip for "${lastUser}": check the Learn tab for resources.`;
  }

  const convoLines = messages.map((m) =>
    m.role === "assistant" ? `Assistant: ${m.content}` : `User: ${m.content}`,
  );
  const promptText = `${systemPrompt}\n\nConversation:\n${convoLines.join("\n")}`;
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const maxRetries = 3;
  let attempt = 0;
  let lastErrorBody: any = null;

  while (attempt < maxRetries) {
    attempt += 1;
    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: { text: promptText },
          temperature: 0.7,
          maxOutputTokens: 300,
        }),
      });

      const textBody = await response.text().catch(() => "");
      try {
        lastErrorBody = JSON.parse(textBody);
      } catch {
        lastErrorBody = textBody;
      }

      if (response.ok) {
        const data =
          typeof lastErrorBody === "string"
            ? JSON.parse(textBody)
            : lastErrorBody;
        const candidateText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          data?.output?.[0]?.content?.[0]?.text ||
          data?.text ||
          (typeof data === "string" ? data : null);
        if (candidateText) return candidateText;
      }

      if (response.status === 429) {
        const userMsg =
          typeof lastErrorBody === "string"
            ? lastErrorBody
            : (lastErrorBody?.message ?? "Rate limit or quota exceeded");
        return `Sorry — the AI service quota has been reached: ${String(userMsg).slice(0, 200)}. Please try again later or check the Learn tab for resources.`;
      }

      if (response.status === 403 || response.status === 404) {
        // Try older v1beta generateContent endpoint as a fallback for keys
        // that don't support v1 generateText for this model.
        try {
          const altUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
          console.log("Trying client fallback URL:", altUrl.slice(0, 120));
          const retryResp = await fetch(altUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
            }),
          });

          const retryText = await retryResp.text().catch(() => "");
          let retryBody: any = null;
          try {
            retryBody = JSON.parse(retryText);
          } catch {
            retryBody = retryText;
          }
          console.log("Fallback response status:", retryResp.status);
          if (retryResp.ok) {
            const candidateText =
              retryBody?.candidates?.[0]?.content?.parts?.[0]?.text ||
              retryBody?.output?.[0]?.content?.text ||
              (typeof retryBody === "string" ? retryBody : null);
            if (candidateText) return candidateText;
          }
          console.warn(
            "Fallback call failed:",
            retryResp.status,
            JSON.stringify(retryBody).slice?.(0, 300),
          );
        } catch (fbE) {
          console.warn(
            "Fallback attempt error:",
            fbE instanceof Error ? fbE.message : String(fbE),
          );
        }

        const modelMsg =
          typeof lastErrorBody === "string"
            ? lastErrorBody
            : JSON.stringify(lastErrorBody?.error ?? lastErrorBody);
        return `Sorry — the configured model (${GEMINI_MODEL}) or API method isn't available for this key or API version: ${String(modelMsg).slice(0, 200)}. Ensure your key has access to ${GEMINI_MODEL} or deploy the server function with a valid server-side key.`;
      }

      // other non-OK: throw to trigger retry/backoff
      throw new Error(
        `Gemini failed: ${response.status} - ${JSON.stringify(lastErrorBody)}`,
      );
    } catch (e) {
      console.error(
        `Gemini attempt ${attempt} error:`,
        e instanceof Error ? e.message : String(e),
      );
      if (attempt >= maxRetries) {
        const lastUser =
          [...messages].reverse().find((m) => m.role === "user")?.content ??
          "your question";
        return `Sorry — the AI service is temporarily unavailable (rate limit or quota). Meanwhile, here's a quick suggestion for: "${lastUser}"\n\n- Try rephrasing the question more specifically.\n- Check the Learn tab for recommended resources.\n- Try again in a minute.`;
      }
      const backoffMs = Math.pow(2, attempt) * 500;
      await new Promise((res) => setTimeout(res, backoffMs));
    }
  }

  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ??
    "your question";
  return `Sorry — the AI service is temporarily unavailable. Quick tip for "${lastUser}": check the Learn tab for resources and try again shortly.`;
};
