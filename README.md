<div align="center">


<br/><br/>

# CareerForge

### *The AI-Powered Career Operating System for Student Developers*

> **CareerForge transforms students into internship-ready developers** through personalised AI roadmaps, structured skill tracking, intelligent project guidance, and real-time career intelligence — all in one cross-platform mobile app.

<br/>

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Database](#-database-design) • [Getting Started](#-getting-started) • [Screens](#-screens)

</div>

---

## The Problem

Most CS students face the same painful cycle:

> *"I've done the tutorials. I've watched the YouTube videos. But I don't know what to build, what skills actually matter, or if I'm actually ready for internships."*

Generic learning platforms teach syntax — not careers. Students are left guessing:

- Which skills do real internships actually require?
- What projects will stand out to recruiters?
- Am I ready to apply — or am I wasting my time?

## The Solution

**CareerForge** closes the gap between *learning* and *landing your first internship*.

It acts as a **personal career mentor that's always available** — generating personalised roadmaps based on your goals, recommending portfolio-worthy projects filtered to your tech interests, tracking your progress with a live readiness score, and giving you AI-powered guidance so you know exactly what to do next.

```
Smart Onboarding → Personalised Roadmap → Skill Tracking → Internship Readiness
```

---

##  Features

###  Authentication System
A complete, production-grade auth flow built on Supabase Auth.

- Email + OTP verification on sign up
- Secure session management with automatic token refresh
- Smart routing — new users go through onboarding, returning users land directly on their dashboard
- Sign out clears the device session only — all profile data and progress persists in the database forever
- Row Level Security enforces data isolation at the database level, not just the application layer

###  Smart Onboarding
A 4-step personalisation flow that runs once for new users. Every answer is saved to Supabase and drives every feature in the app.

| Step | What we capture | How it personalises the app |
|------|----------------|----------------------------|
| Primary goal | internship / build skills / career switch | Changes readiness score label, weighting, and targets |
| Current level | beginner / intermediate / advanced | Sets starting point in skill tree, adjusts AI recommendations |
| Role interests | frontend / backend / mobile / devops / AI | Filters project recommendations and skill roadmap |
| Time commitment | casual / regular / intensive | Shapes weekly learning targets and AI pacing |

###  Internship Readiness Score
A dynamic, data-driven score that reflects real progress — not just activity.

```
Score = (Skills Completed × 35%) + (Projects Built × 30%) + (Consistency × 20%) + (Technical Depth × 15%)
```

The score adapts based on the user's goal:

- **Internship** → "Internship Readiness" — weights skills and projects highest, matching what recruiters look for
- **Build Skills** → "Skill Mastery" — weights depth and consistency, focused on genuine learning
- **Career Switch** → "Career Transition" — weights foundations and projects, prioritising portfolio building

###  Skill Progression System
An interactive skill tree covering every major development domain.

- Beginner → Intermediate → Advanced progression per domain
- Domains: Frontend, Backend, Mobile, DevOps, AI/ML
- Every completed skill updates the readiness score in real time
- Progress bars per domain showing exactly how far along each track the user is
- Confidence indicators: Confident / Learning / Locked

###  Project Recommendation Engine
Personalised project recommendations filtered by the user's role interests and skill level.

Every recommended project includes:
- Full feature breakdown with scope guidance
- Suggested tech stack matched to the user's current level
- Complexity rating to keep users challenged without being overwhelmed
- CV impact score — how much this project will actually impress a recruiter

###  Forge AI — Career Intelligence
A 24/7 AI career mentor powered by the Claude API. Forge AI knows the user's goal, skill level, role interests, and current progress — so every response is genuinely personalised.

- Generates personalised career roadmaps on demand
- Answers "What should I learn next?" with context-aware, actionable guidance
- Identifies skill gaps by comparing the user's profile against real internship requirements
- Provides one focused daily insight per dashboard visit, cached and refreshed every 24 hours

###  Portfolio Generator
The AI transforms completed projects into professional assets ready to use immediately.

- **GitHub** — repository descriptions with impact-focused language
- **CV bullet points** — written in STAR format (Situation, Task, Action, Result)
- **LinkedIn summaries** — optimised for recruiter visibility and keyword search

---

##  Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile** | React Native + Expo | Cross-platform iOS & Android from one codebase |
| **Language** | TypeScript | Full type safety across all screens and services |
| **Navigation** | Expo Router | File-based routing with deep link support |
| **Backend** | Supabase | Auth, PostgreSQL database, real-time subscriptions |
| **Database** | PostgreSQL (via Supabase) | Relational data with Row Level Security |
| **Authentication** | Supabase Auth | Email + OTP, session management, JWT tokens |
| **AI Engine** | Claude API (Anthropic) | Personalised roadmaps, skill gap analysis, career coaching |
| **Icons** | @expo/vector-icons | Ionicons throughout the UI |
| **Styling** | React Native StyleSheet | Dark theme, consistent design system |

---

##  Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CareerForge Mobile App                     │
│                React Native · Expo · TypeScript              │
├─────────────┬──────────────────┬───────────────┬────────────┤
│  Auth &     │   Dashboard &    │  Skill Tree & │  AI Layer  │
│  Onboarding │   Readiness      │  Projects     │  Forge AI  │
│  Routing    │   Score          │  Portfolio    │  Roadmaps  │
└──────┬──────┴────────┬─────────┴───────┬───────┴─────┬──────┘
       │               │                 │             │
       ▼               ▼                 ▼             ▼
┌──────────────────────────────────────────────────────────────┐
│                         Supabase                              │
│         Auth · PostgreSQL · Row Level Security               │
│                                                              │
│   user_profiles · skill_progress · user_projects            │
│   daily_activity · ai_insights                              │
└───────────────────────────────────────┬──────────────────────┘
                                        │
                                        ▼
                          ┌─────────────────────────┐
                          │       Claude API          │
                          │   claude-sonnet-4         │
                          │   Career intelligence     │
                          └─────────────────────────┘
```

---

##  Database Design

CareerForge uses **Supabase (PostgreSQL)** with Row Level Security on every table. Users can only read and write their own data — enforced at the database level, not just the application layer.

### Tables

```sql
-- Core profile — saved once at onboarding
user_profiles (
  id              uuid references auth.users PRIMARY KEY,
  goal            text,        -- 'internship' | 'skills' | 'switch'
  level           text,        -- 'beginner' | 'intermediate' | 'advanced'
  roles           text[],      -- ['frontend', 'mobile', ...]
  time_commitment text,        -- 'casual' | 'regular' | 'intensive'
  onboarding_completed boolean default false,
  created_at      timestamptz  default now()
)

-- Skill activity — one row per completed skill
skill_progress (
  id           uuid PRIMARY KEY,
  user_id      uuid references auth.users,
  skill_id     text,           -- e.g. 'react-hooks', 'typescript-generics'
  status       text,           -- 'done'
  completed_at timestamptz
)

-- Projects — one row per completed project
user_projects (
  id       uuid PRIMARY KEY,
  user_id  uuid references auth.users,
  title    text,               -- e.g. 'Portfolio Website'
  stack    text,               -- e.g. 'React, Node.js, Supabase'
  status   text,               -- 'completed'
  built_at timestamptz
)

-- Streak tracking — one row per day the app is opened
daily_activity (
  id      uuid PRIMARY KEY,
  user_id uuid references auth.users,
  date    date
)

-- AI insights cache — refreshed every 24 hours
ai_insights (
  id           uuid PRIMARY KEY,
  user_id      uuid references auth.users,
  tip          text,
  generated_at timestamptz
)
```

### Row Level Security

```sql
-- Same pattern applied to every table
alter table user_profiles enable row level security;

create policy "Users can manage own data"
on user_profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);
```

---

##  Screens

### Authentication
**Sign Up** — email + password with Supabase OTP email verification. New accounts automatically enter the onboarding flow.

**Sign In** — existing users authenticate and land directly on their personalised dashboard.

### Onboarding
**4-step personalisation flow** — Goal → Level → Roles (multi-select) → Time. Forge AI greets the user on each step. All answers saved to `user_profiles` on completion.

### Dashboard
**Personalised home screen** with:
- Time-aware greeting using the user's name
- Internship readiness score with animated progress bar (label and colour adapt by goal)
- Live stats — streak days, skills completed, projects built
- Quick action tiles — Continue Learning, View Roadmap, Chat with AI, Projects
- Forge AI daily insight card, cached and refreshed every 24 hours
- Bottom navigation bar persisting across all screens

### Skill Profile
**Interactive skill tree** grouped by domain (Frontend, Backend, Mobile, DevOps, AI). Users mark skills as completed, writing to `skill_progress` and updating the readiness score in real time. Confidence indicators per skill.

### AI Chat — Forge AI
**Full conversational AI career mentor** powered by Claude API. The system prompt is built from the user's `user_profiles` data so Forge AI already knows their goal, level, and interests before the first message.

### Projects
**Filtered project recommendations** based on role interests from onboarding. Each card includes tech stack, complexity rating, and CV impact score. Completing a project writes to `user_projects`.

### Portfolio Generator
**One-tap AI export** of completed projects into GitHub descriptions, STAR-format CV bullet points, and LinkedIn summaries.

---

##  Getting Started

### Prerequisites
- Node.js `>=18.x`
- Expo CLI — `npm install -g expo-cli`
- Supabase account — [supabase.com](https://supabase.com)
- Anthropic API key — [console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/chamethyaY/careerforge.git
cd careerforge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_claude_api_key
```

### Supabase Setup

Run the following in your Supabase SQL Editor:

```sql
create table user_profiles (
  id uuid references auth.users primary key,
  goal text, level text, roles text[],
  time_commitment text,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

create table skill_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  skill_id text, status text default 'done',
  completed_at timestamptz default now()
);

create table user_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  title text, stack text, status text default 'completed',
  built_at timestamptz default now()
);

-- Enable RLS
alter table user_profiles enable row level security;
alter table skill_progress enable row level security;
alter table user_projects enable row level security;

-- Policies
create policy "own profile" on user_profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own skills"  on skill_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own projects" on user_projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### Run

```bash
npx expo start
```

---

##  Project Structure

```
careerforge/
├── app/
│   ├── index.tsx                 # Splash + session routing
│   ├── login.tsx                 # Sign in + sign up
│   ├── onboarding.tsx            # 4-step onboarding flow
│   └── (tabs)/
│       ├── dashboard.tsx         # Main dashboard
│       ├── learn.tsx             # Skill tree
│       ├── skills.tsx            # Skill profile + progress
│       └── ai-chat.tsx           # Forge AI chat
├── components/
│   ├── onboarding/               # GoalSelector, LevelSelector, RoleSelector, TimeSelector
│   ├── dashboard/                # ReadinessCard, StatsRow, QuickActions, AIInsightCard
│   └── shared/                   # OptionTile, ProgressBar
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── scoring.ts                # Readiness score calculation logic
├── hooks/
│   ├── useAuth.ts                # Auth state + routing
│   └── useProfile.ts             # User profile fetching
└── constants/
    ├── skills.ts                 # Full skill tree data
    └── theme.ts                  # Design tokens + colours
```

---

##  Security

- **Row Level Security** on every Supabase table — data isolation enforced at database level
- **JWT tokens** managed by Supabase Auth with automatic refresh
- **No sensitive data on device** — only the session token is stored locally
- **Environment variables** for all API keys — never committed to source control
- **OTP email verification** on sign up — no unverified accounts can access the app

---

##  Author

**Chamethya Yasodie**
Full-Stack Developer · BSc Computer Science · University of Westminster (IIT Colombo)

[![GitHub](https://img.shields.io/badge/GitHub-chamethyaY-181717?style=flat&logo=github)](https://github.com/chamethyaY)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Chamethya_Yasodie-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/chamethya-yasodie-a8278a349/)
[![Email](https://img.shields.io/badge/Email-k.chamethya@gmail.com-EA4335?style=flat&logo=gmail)](mailto:k.chamethya@gmail.com)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with ❤️ by Chamethya Yasodie</sub>
</div>
