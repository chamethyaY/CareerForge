const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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
  // Convert messages to Gemini format
  // Note: Gemini uses 'model' not 'assistant'
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error("Gemini error:", err);
    throw new Error(`Gemini failed: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};
