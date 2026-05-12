import { Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";

export type Resource = {
  title: string;
  url: string;
  provider: string;
  resource_type: string;
};

type DbResourceRow = {
  title?: string | null;
  url?: string | null;
  provider?: string | null;
  resource_type?: string | null;
};

type GetResourcesArgs = {
  skillId: string;
  skillName: string;
  userLevel?: string;
  userGoal?: string;
};

type GeminiCandidateRow = {
  title?: string;
  url?: string;
  provider?: string;
  resource_type?: string;
};

const fallbackResourceMap: Record<string, Resource[]> = {
  "html / css": [
    {
      title: "MDN Learn HTML: Introduction",
      url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML",
      provider: "MDN",
      resource_type: "article",
    },
    {
      title: "MDN Learn CSS: First Steps",
      url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps",
      provider: "MDN",
      resource_type: "article",
    },
    {
      title: "freeCodeCamp Responsive Web Design",
      url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
      provider: "freeCodeCamp",
      resource_type: "practice",
    },
    {
      title: "HTML & CSS Full Course",
      url: "https://www.youtube.com/watch?v=mU6anWqZJcc",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "CSS Flexbox Complete Guide",
      url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
      provider: "CSS-Tricks",
      resource_type: "article",
    },
  ],
  javascript: [
    {
      title: "MDN JavaScript Guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      provider: "MDN",
      resource_type: "article",
    },
    {
      title: "javascript.info",
      url: "https://javascript.info/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "freeCodeCamp JavaScript Algorithms and Data Structures",
      url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/",
      provider: "freeCodeCamp",
      resource_type: "practice",
    },
    {
      title: "JavaScript Full Course for Beginners",
      url: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Eloquent JavaScript",
      url: "https://eloquentjavascript.net/",
      provider: "Official Docs",
      resource_type: "article",
    },
  ],
  react: [
    {
      title: "React Official Learn",
      url: "https://react.dev/learn",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "React Native Docs",
      url: "https://reactnative.dev/docs/getting-started",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "freeCodeCamp Front End Development Libraries",
      url: "https://www.freecodecamp.org/learn/front-end-development-libraries/",
      provider: "freeCodeCamp",
      resource_type: "practice",
    },
    {
      title: "React Course for Beginners",
      url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Kent C. Dodds React Fundamentals",
      url: "https://kentcdodds.com/blog/react-fundamentals",
      provider: "Official Docs",
      resource_type: "article",
    },
  ],
  typescript: [
    {
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/handbook/intro.html",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "TypeScript for JavaScript Programmers",
      url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "TypeScript Full Course",
      url: "https://www.youtube.com/watch?v=30LWjhZzg50",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Total TypeScript Concepts",
      url: "https://www.totaltypescript.com/tutorials",
      provider: "Official Docs",
      resource_type: "practice",
    },
    {
      title: "Type Challenges",
      url: "https://github.com/type-challenges/type-challenges",
      provider: "Official Docs",
      resource_type: "practice",
    },
  ],
};

function getFallbackResources(skillName: string): Resource[] {
  const normalized = skillName.toLowerCase().trim();
  const exact = fallbackResourceMap[normalized];
  if (exact) return exact;

  if (normalized.includes("html") || normalized.includes("css")) {
    return fallbackResourceMap["html / css"];
  }
  if (normalized.includes("javascript") || normalized === "js") {
    return fallbackResourceMap.javascript;
  }
  if (normalized.includes("react")) {
    return fallbackResourceMap.react;
  }
  if (normalized.includes("typescript") || normalized === "ts") {
    return fallbackResourceMap.typescript;
  }

  return fallbackResourceMap.javascript;
}

function parseGeminiText(raw: string): DbResourceRow[] {
  try {
    if (!raw || raw.length === 0) {
      console.error("❌ parseGeminiText: empty raw text");
      throw new Error("Empty Gemini response");
    }
    const cleaned = raw.replace(/```json|```/g, "").trim();
    console.log("🔧 Cleaned text:", cleaned.slice(0, 100));
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      console.error("❌ parseGeminiText: not an array", typeof parsed);
      throw new Error("Gemini response was not a JSON array");
    }
    console.log("✅ parseGeminiText: parsed", parsed.length, "items");
    return parsed.map((row: GeminiCandidateRow) => ({
      title: row?.title ?? "",
      url: row?.url ?? "",
      provider: row?.provider ?? "",
      resource_type: row?.resource_type ?? "",
    }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("❌ parseGeminiText error:", msg);
    throw e;
  }
}

async function fetchFromGeminiClient({
  skillId,
  skillName,
  userLevel,
  userGoal,
}: {
  skillId: string;
  skillName: string;
  userLevel: string;
  userGoal: string;
}): Promise<Resource[]> {
  console.log("🔍 Gemini client fetch started");
  // Access Expo env var same way as supabase.ts
  const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
  console.log("📌 geminiApiKey exists:", !!geminiApiKey.trim());
  console.log("📌 geminiApiKey length:", geminiApiKey.length);
  if (!geminiApiKey || !geminiApiKey.trim()) {
    console.warn(
      "Missing EXPO_PUBLIC_GEMINI_API_KEY. Using local fallback resources.",
    );
    return getFallbackResources(skillName);
  }

  const prompt = `Act as a senior dev librarian. Find the 5 best learning resources for "${skillName}".
The learner's current level is "${userLevel}" and their goal is "${userGoal}".
Provide a mix of YouTube videos, official docs, and practice labs that match that level.
Return ONLY a valid JSON array of objects with keys: title, url, resource_type, provider.`;

  console.log("🚀 Calling Gemini API...");
  // Use the current stable Gemini text model.
  const modelConfigs = [{ name: "gemini-2.5-flash", version: "v1beta" }];
  let response: Response | null = null;
  let lastError: Error | null = null;

  for (const config of modelConfigs) {
    try {
      console.log(`  Trying: ${config.name} with ${config.version}`);
      const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.name}:generateContent?key=${geminiApiKey}`;
      console.log(`  URL: ${url.slice(0, 90)}...`);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, topP: 0.8, topK: 40 },
        }),
      });
      if (res.ok) {
        console.log(`  ✅ ${config.name} (${config.version}) worked!`);
        response = res;
        break;
      }
      const errBody = await res.text();
      console.log(
        `  ❌ ${config.name} (${config.version}) failed: ${res.status}`,
      );
      lastError = new Error(
        `${config.name}@${config.version}: ${res.status} - ${errBody.slice(0, 100)}`,
      );
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.error(`  ❌ Fetch error:`, lastError.message);
    }
  }

  if (!response) {
    console.warn(
      `All Gemini API attempts failed. Last error: ${lastError?.message}. Using local fallback resources.`,
    );
    return getFallbackResources(skillName);
  }

  const payload = await response.json();
  console.log("✅ Gemini API response OK");
  const rawText =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part: any) => (typeof part?.text === "string" ? part.text : ""))
      .join("\n") ?? "";

  console.log("📝 Raw Gemini text:", rawText.slice(0, 200));
  const parsedRows = parseGeminiText(rawText).filter(
    (row) => row.url && row.title,
  );

  console.log("✨ Parsed rows:", parsedRows.length);

  if (parsedRows.length === 0) {
    console.warn(
      "Gemini returned no usable resources. Using local fallback resources.",
    );
    return getFallbackResources(skillName);
  }

  const rowsForDb = parsedRows.map((row) => ({
    skill_id: skillId,
    title: row.title,
    url: row.url,
    provider: row.provider,
    resource_type: row.resource_type,
  }));

  if (rowsForDb.length > 0) {
    // Best effort cache write; ignore RLS failures and still return resources.
    console.log("💾 Saving to Supabase cache...");
    await supabase
      .from("skill_resources")
      .upsert(rowsForDb, { onConflict: "skill_id,url" });
  }

  return parsedRows.map(normalizeResource);
}

function normalizeResource(row: DbResourceRow): Resource {
  return {
    title: String(row.title ?? "Untitled resource"),
    url: String(row.url ?? ""),
    provider: String(row.provider ?? "link"),
    resource_type: String(row.resource_type ?? "link"),
  };
}

export const providerIcon = (
  provider: string,
): keyof typeof Ionicons.glyphMap => {
  switch (provider.toLowerCase()) {
    case "youtube":
      return "logo-youtube";
    case "mdn":
      return "document-text-outline";
    case "freecodecamp":
      return "school-outline";
    case "official docs":
      return "file-code-outline" as keyof typeof Ionicons.glyphMap;
    default:
      return "link-outline";
  }
};

export const providerColor = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case "youtube":
      return "#E8593C";
    case "mdn":
      return "#378ADD";
    case "freecodecamp":
      return "#1D9E75";
    case "official docs":
      return "#7F77DD";
    default:
      return "#BA7517";
  }
};

export const typeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type.toLowerCase()) {
    case "video":
      return "play-circle-outline";
    case "article":
      return "document-text-outline";
    case "practice":
      return "code-slash-outline";
    default:
      return "link-outline";
  }
};

export async function getResources({
  skillId,
  skillName,
  userLevel = "beginner",
  userGoal = "skills",
}: GetResourcesArgs): Promise<Resource[]> {
  console.log(`📚 getResources called for skill: ${skillId}`);
  const { data: cachedResources, error: cacheError } = await supabase
    .from("skill_resources")
    .select("title,url,provider,resource_type")
    .eq("skill_id", skillId);

  if (cacheError) {
    console.warn("skill_resources cache read failed:", cacheError.message);
  }

  if (cachedResources && cachedResources.length > 0) {
    console.log(`✅ Found ${cachedResources.length} cached resources`);
    return (cachedResources as DbResourceRow[]).map(normalizeResource);
  }

  console.log("⏳ No cached resources, trying edge function...");

  try {
    const { data, error } = await supabase.functions.invoke(
      "get-skill-materials",
      {
        body: {
          skill_id: skillId,
          skill_name: skillName,
          user_level: userLevel,
          user_goal: userGoal,
        },
      },
    );

    if (error) {
      throw error;
    }

    const rows = (data?.resources ?? data ?? []) as DbResourceRow[];
    console.log(`✅ Edge function returned ${rows.length} resources`);
    const normalized = rows.map(normalizeResource).filter((row) => row.url);
    if (normalized.length > 0) {
      return normalized;
    }
  } catch (edgeError) {
    console.warn(
      "Edge function failed, falling back to local resources:",
      edgeError,
    );
  }

  console.log("🎯 Using local fallback resources...");
  return getFallbackResources(skillName);
}

export async function openResource(url: string) {
  if (!url) return;
  await Linking.openURL(url);
}
