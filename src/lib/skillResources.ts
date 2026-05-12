import { Linking } from "react-native";

export type Resource = {
  title: string;
  url: string;
  provider: string;
  type?: "article" | "video" | "doc" | "course";
  description?: string;
};

const GENERIC_RESOURCES: Record<string, Resource[]> = {
  javascript: [
    {
      title: "JavaScript.info - The Modern JavaScript Tutorial",
      url: "https://javascript.info/",
      provider: "javascript.info",
      type: "article",
      description: "Comprehensive modern JS guide, from basics to advanced.",
    },
    {
      title: "MDN JavaScript Guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      provider: "MDN",
      type: "article",
      description: "Official Mozilla docs and guides for JavaScript.",
    },
  ],
  react: [
    {
      title: "React Official Docs",
      url: "https://reactjs.org/docs/getting-started.html",
      provider: "React",
      type: "doc",
      description: "The canonical source for learning React.",
    },
    {
      title: "FreeCodeCamp React Tutorial (YouTube)",
      url: "https://www.youtube.com/results?search_query=react+tutorial+freecodecamp",
      provider: "YouTube",
      type: "video",
    },
  ],
};

export async function getResources(opts: {
  skillId: string;
  skillName?: string;
  userLevel?: string;
  userGoal?: string;
}): Promise<Resource[]> {
  const { skillId } = opts;
  // return mapped resources if available, otherwise a small generic list
  const key = skillId?.toLowerCase() ?? "";
  if (GENERIC_RESOURCES[key]) return GENERIC_RESOURCES[key];

  return [
    {
      title: `${opts.skillName ?? "Skill"} — Quick Overview (MDN)`,
      url: "https://developer.mozilla.org/",
      provider: "MDN",
      type: "article",
    },
    {
      title: `${opts.skillName ?? "Skill"} — Intro Video (YouTube)`,
      url: "https://www.youtube.com/results?search_query=" + encodeURIComponent((opts.skillName ?? "")),
      provider: "YouTube",
      type: "video",
    },
  ];
}

export function openResource(url?: string) {
  if (!url) return;
  Linking.canOpenURL(url)
    .then((ok) => {
      if (ok) Linking.openURL(url);
    })
    .catch(() => {});
}
