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
  "next.js": [
    {
      title: "Next.js Official Documentation",
      url: "https://nextjs.org/docs",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Next.js by Vercel",
      url: "https://www.youtube.com/watch?v=ZjAqacIm9iI",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Next.js Full Stack Development",
      url: "https://www.udemy.com/course/next-js-react-the-complete-guide/",
      provider: "Udemy",
      resource_type: "course",
    },
    {
      title: "App Router Deep Dive",
      url: "https://nextjs.org/learn/dashboard-app",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Vercel Deployment Guide",
      url: "https://vercel.com/docs/frameworks/nextjs",
      provider: "Official Docs",
      resource_type: "article",
    },
  ],
  "testing (jest)": [
    {
      title: "Jest Official Documentation",
      url: "https://jestjs.io/docs/getting-started",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Testing Library Docs",
      url: "https://testing-library.com/docs/react-testing-library/intro/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Jest Testing Tutorial",
      url: "https://www.youtube.com/watch?v=7r4xVDgS2AI",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "React Component Testing",
      url: "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library",
      provider: "Blog",
      resource_type: "article",
    },
    {
      title: "Mocking and Spies in Jest",
      url: "https://jestjs.io/docs/mock-functions",
      provider: "Official Docs",
      resource_type: "article",
    },
  ],
  "node.js": [
    {
      title: "Node.js Official Docs",
      url: "https://nodejs.org/en/docs/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Node.js Complete Course",
      url: "https://www.youtube.com/watch?v=RLtQcCP1pEU",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Express.js Framework",
      url: "https://expressjs.com/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Node.js Best Practices",
      url: "https://github.com/goldbergyoni/nodebestpractices",
      provider: "GitHub",
      resource_type: "article",
    },
    {
      title: "Async/Await in Node.js",
      url: "https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/",
      provider: "Official Docs",
      resource_type: "article",
    },
  ],
  "rest apis": [
    {
      title: "REST API Tutorial",
      url: "https://www.restapitutorial.com/",
      provider: "Tutorial",
      resource_type: "article",
    },
    {
      title: "Express.js REST API",
      url: "https://www.youtube.com/watch?v=fgTGADljAe0",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "HTTP Status Codes",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
      provider: "MDN",
      resource_type: "article",
    },
    {
      title: "API Design Best Practices",
      url: "https://restfulapi.net/",
      provider: "RESTful API",
      resource_type: "article",
    },
    {
      title: "Building Production APIs",
      url: "https://www.youtube.com/watch?v=0sTzMHPDMdg",
      provider: "YouTube",
      resource_type: "video",
    },
  ],
  postgresql: [
    {
      title: "PostgreSQL Official Docs",
      url: "https://www.postgresql.org/docs/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "PostgreSQL Tutorial",
      url: "https://www.postgresqltutorial.com/",
      provider: "Tutorial",
      resource_type: "article",
    },
    {
      title: "SQL Fundamentals",
      url: "https://www.youtube.com/watch?v=qw6uliHWFl4",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Advanced PostgreSQL",
      url: "https://www.postgresql.org/docs/current/sql.html",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Database Indexing",
      url: "https://use-the-index-luke.com/",
      provider: "Performance",
      resource_type: "article",
    },
  ],
  "auth & security": [
    {
      title: "OWASP Top 10",
      url: "https://owasp.org/www-project-top-ten/",
      provider: "OWASP",
      resource_type: "article",
    },
    {
      title: "JWT Authentication",
      url: "https://jwt.io/introduction",
      provider: "JWT",
      resource_type: "article",
    },
    {
      title: "OAuth 2.0 Explained",
      url: "https://www.youtube.com/watch?v=ZV7cmnSCrwc",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Password Security",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html",
      provider: "OWASP",
      resource_type: "article",
    },
    {
      title: "API Security",
      url: "https://owasp.org/www-project-api-security/",
      provider: "OWASP",
      resource_type: "article",
    },
  ],
  graphql: [
    {
      title: "GraphQL Official Site",
      url: "https://graphql.org/learn/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Apollo Server",
      url: "https://www.apollographql.com/docs/apollo-server/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "GraphQL Full Course",
      url: "https://www.youtube.com/watch?v=ed8SzALN2x0",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "GraphQL vs REST",
      url: "https://blog.apollographql.com/graphql-vs-rest-5d425123e34b",
      provider: "Blog",
      resource_type: "article",
    },
    {
      title: "Query Language Basics",
      url: "https://www.howtographql.com/",
      provider: "Tutorial",
      resource_type: "article",
    },
  ],
  "react native": [
    {
      title: "React Native Official Docs",
      url: "https://reactnative.dev/docs/getting-started",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "React Native Complete Course",
      url: "https://www.youtube.com/watch?v=ur6I5GQvWQA",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "React Native Navigation",
      url: "https://reactnavigation.org/docs/getting-started",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Mobile App Performance",
      url: "https://reactnative.dev/docs/performance",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Native Modules",
      url: "https://reactnative.dev/docs/native-modules-intro",
      provider: "Official Docs",
      resource_type: "article",
    },
  ],
  expo: [
    {
      title: "Expo Documentation",
      url: "https://docs.expo.dev/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Expo CLI Guide",
      url: "https://docs.expo.dev/workflow/expo-cli/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Building with Expo",
      url: "https://www.youtube.com/watch?v=XatXRluWBtw",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Expo Go App",
      url: "https://docs.expo.dev/get-started/installation/#2-install-expo-go",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "EAS Build & Submit",
      url: "https://docs.expo.dev/build/introduction/",
      provider: "Official Docs",
      resource_type: "article",
    },
  ],
  navigation: [
    {
      title: "React Navigation Docs",
      url: "https://reactnavigation.org/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Stack Navigation",
      url: "https://reactnavigation.org/docs/stack-navigator",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Tab Navigation",
      url: "https://reactnavigation.org/docs/bottom-tab-navigator",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Deep Linking",
      url: "https://reactnavigation.org/docs/deep-linking",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "React Navigation Advanced",
      url: "https://www.youtube.com/watch?v=IvRX7SZgSGE",
      provider: "YouTube",
      resource_type: "video",
    },
  ],
  "native apis": [
    {
      title: "React Native APIs",
      url: "https://reactnative.dev/docs/apis/alert",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Camera API",
      url: "https://docs.expo.dev/versions/latest/sdk/camera/",
      provider: "Expo Docs",
      resource_type: "article",
    },
    {
      title: "Geolocation",
      url: "https://docs.expo.dev/versions/latest/sdk/location/",
      provider: "Expo Docs",
      resource_type: "article",
    },
    {
      title: "File System",
      url: "https://docs.expo.dev/versions/latest/sdk/filesystem/",
      provider: "Expo Docs",
      resource_type: "article",
    },
    {
      title: "Device Hardware",
      url: "https://docs.expo.dev/versions/latest/sdk/sensors/",
      provider: "Expo Docs",
      resource_type: "article",
    },
  ],
  "push notifications": [
    {
      title: "Expo Push Notifications",
      url: "https://docs.expo.dev/push-notifications/overview/",
      provider: "Expo Docs",
      resource_type: "article",
    },
    {
      title: "Setting Up Push Notifications",
      url: "https://docs.expo.dev/push-notifications/setup/",
      provider: "Expo Docs",
      resource_type: "article",
    },
    {
      title: "Firebase Cloud Messaging",
      url: "https://firebase.google.com/docs/cloud-messaging",
      provider: "Firebase",
      resource_type: "article",
    },
    {
      title: "Local Notifications",
      url: "https://docs.expo.dev/versions/latest/sdk/notifications/",
      provider: "Expo Docs",
      resource_type: "article",
    },
    {
      title: "Push Notification Best Practices",
      url: "https://www.youtube.com/watch?v=sioEY4tWmLI",
      provider: "YouTube",
      resource_type: "video",
    },
  ],
  "git & github": [
    {
      title: "Git Official Documentation",
      url: "https://git-scm.com/doc",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "GitHub Docs",
      url: "https://docs.github.com/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Git Complete Tutorial",
      url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Branching Strategy",
      url: "https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Pull Requests",
      url: "https://docs.github.com/en/pull-requests",
      provider: "Official Docs",
      resource_type: "article",
    },
  ],
  docker: [
    {
      title: "Docker Official Docs",
      url: "https://docs.docker.com/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Docker Complete Course",
      url: "https://www.youtube.com/watch?v=fqMOX6JJhGo",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Docker Hub",
      url: "https://hub.docker.com/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Dockerfile Best Practices",
      url: "https://docs.docker.com/engine/reference/builder/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Docker Compose",
      url: "https://docs.docker.com/compose/",
      provider: "Official Docs",
      resource_type: "article",
    },
  ],
  "ci/cd": [
    {
      title: "GitHub Actions Docs",
      url: "https://docs.github.com/en/actions",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "CI/CD Fundamentals",
      url: "https://www.youtube.com/watch?v=M4CXiYiIIF0",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "GitLab CI/CD",
      url: "https://docs.gitlab.com/ee/ci/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Jenkins",
      url: "https://www.jenkins.io/doc/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Automated Testing & Deployment",
      url: "https://www.youtube.com/watch?v=xSQUIxUyUPw",
      provider: "YouTube",
      resource_type: "video",
    },
  ],
  "aws basics": [
    {
      title: "AWS Documentation",
      url: "https://docs.aws.amazon.com/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "AWS Free Tier",
      url: "https://aws.amazon.com/free/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "AWS for Beginners",
      url: "https://www.youtube.com/watch?v=ZzW9NTZcr7E",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "EC2, S3, and RDS",
      url: "https://docs.aws.amazon.com/index.html",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "AWS Lambda",
      url: "https://docs.aws.amazon.com/lambda/",
      provider: "Official Docs",
      resource_type: "article",
    },
  ],
  "python for ml": [
    {
      title: "Python Official Docs",
      url: "https://docs.python.org/3/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "NumPy & Pandas",
      url: "https://www.youtube.com/watch?v=r-uOLxkrihE",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Scikit-Learn",
      url: "https://scikit-learn.org/stable/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Machine Learning with Python",
      url: "https://www.coursera.org/learn/machine-learning-python",
      provider: "Coursera",
      resource_type: "course",
    },
    {
      title: "Data Science Handbook",
      url: "https://jakevdp.github.io/PythonDataScienceHandbook/",
      provider: "Book",
      resource_type: "article",
    },
  ],
  "llm apis": [
    {
      title: "OpenAI API Docs",
      url: "https://platform.openai.com/docs",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Google Gemini API",
      url: "https://ai.google.dev/docs",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "LLM Integration Guide",
      url: "https://www.youtube.com/watch?v=HN-LPgEFPxU",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "LangChain Framework",
      url: "https://js.langchain.com/docs/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Anthropic Claude API",
      url: "https://docs.anthropic.com/",
      provider: "Official Docs",
      resource_type: "article",
    },
  ],
  "prompt engineering": [
    {
      title: "Prompt Engineering Guide",
      url: "https://www.promptingguide.ai/",
      provider: "Guide",
      resource_type: "article",
    },
    {
      title: "OpenAI Prompt Engineering",
      url: "https://platform.openai.com/docs/guides/prompt-engineering",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Chain of Thought Prompting",
      url: "https://www.youtube.com/watch?v=_ZvnEKVjgZ0",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Advanced Techniques",
      url: "https://learnprompting.org/",
      provider: "Tutorial",
      resource_type: "article",
    },
    {
      title: "Few-Shot Learning",
      url: "https://www.youtube.com/watch?v=5qLMqf1PfmE",
      provider: "YouTube",
      resource_type: "video",
    },
  ],
  "ml models": [
    {
      title: "TensorFlow Docs",
      url: "https://www.tensorflow.org/learn",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "PyTorch Tutorials",
      url: "https://pytorch.org/tutorials/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Deep Learning Fundamentals",
      url: "https://www.youtube.com/watch?v=S75EdAwhQFU",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Neural Networks",
      url: "https://www.deeplearningbook.org/",
      provider: "Book",
      resource_type: "article",
    },
    {
      title: "Model Training & Evaluation",
      url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production",
      provider: "Coursera",
      resource_type: "course",
    },
  ],
  "mvc architecture": [
    {
      title: "MVC Pattern Explained",
      url: "https://www.youtube.com/watch?v=1IsL6g2aPww",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "MVC in Web Development",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/MVC",
      provider: "MDN",
      resource_type: "article",
    },
    {
      title: "Express.js MVC",
      url: "https://www.youtube.com/watch?v=nVzrHrr_cpp",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Design Patterns",
      url: "https://refactoring.guru/design-patterns",
      provider: "Guide",
      resource_type: "article",
    },
    {
      title: "Clean Code Architecture",
      url: "https://www.youtube.com/watch?v=o_TH-Y78tt4",
      provider: "YouTube",
      resource_type: "video",
    },
  ],
  "api design": [
    {
      title: "API Design Best Practices",
      url: "https://restfulapi.net/",
      provider: "Guide",
      resource_type: "article",
    },
    {
      title: "OpenAPI Specification",
      url: "https://spec.openapis.org/oas/v3.0.3",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "API Security",
      url: "https://owasp.org/www-project-api-security/",
      provider: "OWASP",
      resource_type: "article",
    },
    {
      title: "Versioning Strategies",
      url: "https://www.youtube.com/watch?v=x0OxqhFJXn4",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Rate Limiting & Throttling",
      url: "https://cloud.google.com/architecture/rate-limiting-strategies-techniques",
      provider: "Article",
      resource_type: "article",
    },
  ],
  deployment: [
    {
      title: "Deployment Basics",
      url: "https://www.youtube.com/watch?v=SMUV1JCB9hE",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Vercel Deployment",
      url: "https://vercel.com/docs",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Heroku Deployment",
      url: "https://devcenter.heroku.com/",
      provider: "Official Docs",
      resource_type: "article",
    },
    {
      title: "Server Configuration",
      url: "https://www.youtube.com/watch?v=l-sSJbsIkT8",
      provider: "YouTube",
      resource_type: "video",
    },
    {
      title: "Monitoring & Logging",
      url: "https://www.youtube.com/watch?v=Sva0GWfJaB8",
      provider: "YouTube",
      resource_type: "video",
    },
  ],
};

function getFallbackResources(skillName: string): Resource[] {
  const normalized = skillName.toLowerCase().trim();

  // Direct key match first
  if (fallbackResourceMap[normalized]) {
    return fallbackResourceMap[normalized];
  }

  // Partial matching for common variations
  if (normalized.includes("html") || normalized.includes("css"))
    return fallbackResourceMap["html / css"];
  if (normalized.includes("javascript") || normalized === "js")
    return fallbackResourceMap.javascript;
  if (normalized.includes("react") && !normalized.includes("native"))
    return fallbackResourceMap.react;
  if (normalized.includes("typescript") || normalized === "ts")
    return fallbackResourceMap.typescript;
  if (normalized.includes("next") || normalized.includes("nextjs"))
    return fallbackResourceMap["next.js"];
  if (normalized.includes("jest") || normalized.includes("testing"))
    return fallbackResourceMap["testing (jest)"];
  if (normalized.includes("node")) return fallbackResourceMap["node.js"];
  if (
    normalized.includes("rest") ||
    (normalized.includes("api") && !normalized.includes("native"))
  )
    return fallbackResourceMap["rest apis"];
  if (normalized.includes("postgres") || normalized.includes("sql"))
    return fallbackResourceMap.postgresql;
  if (normalized.includes("auth") || normalized.includes("security"))
    return fallbackResourceMap["auth & security"];
  if (normalized.includes("graphql")) return fallbackResourceMap.graphql;
  if (normalized.includes("react native"))
    return fallbackResourceMap["react native"];
  if (normalized.includes("expo")) return fallbackResourceMap.expo;
  if (normalized.includes("navigation")) return fallbackResourceMap.navigation;
  if (normalized.includes("native") || normalized.includes("device"))
    return fallbackResourceMap["native apis"];
  if (normalized.includes("push") || normalized.includes("notification"))
    return fallbackResourceMap["push notifications"];
  if (normalized.includes("git") || normalized.includes("github"))
    return fallbackResourceMap["git & github"];
  if (normalized.includes("docker")) return fallbackResourceMap.docker;
  if (normalized.includes("ci") || normalized.includes("cd"))
    return fallbackResourceMap["ci/cd"];
  if (normalized.includes("aws")) return fallbackResourceMap["aws basics"];
  if (normalized.includes("python"))
    return fallbackResourceMap["python for ml"];
  if (normalized.includes("llm")) return fallbackResourceMap["llm apis"];
  if (normalized.includes("prompt"))
    return fallbackResourceMap["prompt engineering"];
  if (normalized.includes("ml") || normalized.includes("model"))
    return fallbackResourceMap["ml models"];
  if (normalized.includes("mvc"))
    return fallbackResourceMap["mvc architecture"];
  if (normalized.includes("design")) return fallbackResourceMap["api design"];
  if (normalized.includes("deploy")) return fallbackResourceMap.deployment;

  console.warn(
    `⚠️ No specific fallback for skill: ${skillName}, using JavaScript as default`,
  );
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
  console.log(`📚 getResources called for skill: ${skillId} (${skillName})`);
  const { data: cachedResources, error: cacheError } = await supabase
    .from("skill_resources")
    .select("title,url,provider,resource_type")
    .eq("skill_id", skillId);

  if (cacheError) {
    console.warn("skill_resources cache read failed:", cacheError.message);
  }

  if (cachedResources && cachedResources.length > 0) {
    console.log(
      `✅ Found ${cachedResources.length} cached resources for ${skillId}`,
    );
    return (cachedResources as DbResourceRow[]).map(normalizeResource);
  }

  console.log(`⏳ No cached resources for ${skillId}, trying edge function...`);

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
      console.error(`❌ Edge function error for ${skillId}:`, error);
      throw error;
    }

    const rows = (data?.resources ?? data ?? []) as DbResourceRow[];
    console.log(
      `✅ Edge function returned ${rows.length} resources for ${skillId}`,
    );
    const normalized = rows.map(normalizeResource).filter((row) => row.url);
    if (normalized.length > 0) {
      return normalized;
    }
  } catch (edgeError) {
    console.warn(
      `⚠️ Edge function failed for ${skillId}, falling back:`,
      edgeError,
    );
  }

  console.log(`🎯 Using local fallback resources for ${skillId}...`);
  return getFallbackResources(skillName);
}

export async function openResource(url: string) {
  if (!url) return;
  await Linking.openURL(url);
}
