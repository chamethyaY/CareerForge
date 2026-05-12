import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SkillMaterialsRequest = {
  skill_id: string;
  skill_name: string;
  user_level?: string;
  user_goal?: string;
};

type GeminiResource = {
  title: string;
  url: string;
  resource_type: string;
  provider: string;
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

function extractText(result: any): string {
  const candidates = result?.candidates;
  const textParts = candidates?.[0]?.content?.parts;
  if (!Array.isArray(textParts)) return "";
  return textParts
    .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
}

function safeParseResources(rawText: string): GeminiResource[] {
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini response was not a JSON array");
  }

  return parsed.map((item) => ({
    title: String(item?.title ?? ""),
    url: String(item?.url ?? ""),
    resource_type: String(item?.resource_type ?? ""),
    provider: String(item?.provider ?? ""),
  }));
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  let payload: SkillMaterialsRequest;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400 });
  }

  const skillId = payload?.skill_id?.trim();
  const skillName = payload?.skill_name?.trim();
  const userLevel = payload?.user_level?.trim() || "beginner";
  const userGoal = payload?.user_goal?.trim() || "skills";

  if (!skillId || !skillName) {
    return jsonResponse(
      { error: "Both skill_id and skill_name are required" },
      { status: 400 },
    );
  }

  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SERVICE_ROLE_KEY");

  if (!geminiKey || !supabaseUrl || !supabaseServiceRoleKey) {
    return jsonResponse(
      {
        error:
          "Missing GEMINI_API_KEY, SUPABASE_URL, or SERVICE_ROLE_KEY secret",
      },
      { status: 500 },
    );
  }

  const prompt = `Act as a senior dev librarian. Find the 5 best learning resources for "${skillName}".
The learner's current level is "${userLevel}" and their goal is "${userGoal}".
Provide a mix of YouTube videos, official docs, and practice labs that match that level.
Return ONLY a valid JSON array of objects with keys: title, url, resource_type, provider.`;

  const modelConfigs = [{ name: "gemini-2.5-flash", version: "v1beta" }];

  let geminiResult: any = null;
  let lastError = "";

  for (const config of modelConfigs) {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/${config.version}/models/${config.name}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (geminiResponse.ok) {
      geminiResult = await geminiResponse.json();
      break;
    }

    lastError = await geminiResponse.text();
  }

  if (!geminiResult) {
    return jsonResponse(
      { error: "Gemini request failed", details: lastError },
      { status: 502 },
    );
  }

  const rawText = extractText(geminiResult);

  let resources: GeminiResource[];
  try {
    resources = safeParseResources(rawText);
  } catch (error) {
    return jsonResponse(
      {
        error: "Could not parse Gemini response as JSON",
        details: error instanceof Error ? error.message : String(error),
        rawText,
      },
      { status: 502 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const rows = resources.map((resource) => ({
    skill_id: skillId,
    title: resource.title,
    url: resource.url,
    resource_type: resource.resource_type,
    provider: resource.provider,
  }));

  const { error: upsertError } = await supabase
    .from("skill_resources")
    .upsert(rows, { onConflict: "skill_id,url" });

  if (upsertError) {
    return jsonResponse(
      { error: "Failed to save resources", details: upsertError.message },
      { status: 500 },
    );
  }

  return jsonResponse({ skill_id: skillId, skill_name: skillName, resources });
});
