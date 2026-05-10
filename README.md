<div align="center">

<img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Claude_API-CC785C?style=for-the-badge&logo=anthropic&logoColor=white" />

# CareerForge

### *The AI-Powered Career Operating System for Student Developers*

> **CareerForge transforms students into internship-ready developers** through personalised AI roadmaps, structured skill tracking, and real-time career intelligence — all in one mobile app.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Screens](#-screens) • [Roadmap](#-roadmap)

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

It works like a **personal career mentor that's always available** — generating personalised roadmaps, recommending portfolio-worthy projects, tracking your progress, and giving you an honest readiness score so you know exactly where you stand.

---

## ✨ Features

### 🤖 AI Career Intelligence (Forge AI)
A 24/7 career mentor powered by the Claude API. Forge AI knows your goal, skill level, and interests — so every recommendation is personalised to *you*, not a generic student.

- Generates personalised learning roadmaps based on `goal + level + roles`
- Answers "What should I learn next?" with context-aware guidance
- Identifies skill gaps against real internship requirements
- Gives actionable tips that update as your profile evolves

### 🗺️ Smart Onboarding
A 4-step onboarding flow that captures the user's profile before they see a single screen:

| Step | What we capture | How it's used |
|------|----------------|---------------|
| Primary goal | internship / skills / career switch | Powers readiness score label + weights |
| Current level | beginner / intermediate / advanced | Sets starting point in skill tree |
| Role interests | frontend / backend / mobile / AI / DevOps | Filters projects + AI recommendations |
| Time commitment | casual / regular / intensive | Shapes learning pace + AI suggestions |

### 📊 Internship Readiness Score
A dynamic score that tells you exactly where you stand — no guessing.

```
Score = (Skills × 35%) + (Projects × 30%) + (Consistency × 20%) + (Depth × 15%)
```

The label, color, and weighting **change based on the user's goal**:

- `internship` → "Internship Readiness" — weights skills + projects highest (what recruiters care about)
- `skills` → "Skill Mastery" — weights depth + consistency (pure learning focus)
- `switch` → "Career Transition" — weights foundations + projects (portfolio-first approach)

### 🌳 Skill Progression System
An interactive skill tree that goes from Beginner → Intermediate → Advanced across:
- Frontend (HTML/CSS → React → TypeScript → Testing)
- Backend (Node.js → APIs → Databases → Auth)
- Mobile (React Native → Expo → Native APIs)
- DevOps, AI/ML, and more

Every "Mark done" tap writes to `skill_progress` in Supabase and immediately updates the readiness score.

### 🚀 Project Recommendation Engine
Stop building random projects. Build ones that actually impress recruiters.

Each recommendation includes:
- Full feature breakdown with scope guidance
- Suggested tech stack aligned to the user's skill level
- Complexity rating to keep users in the challenge zone
- CV impact score showing how much it will actually matter

### 📁 Portfolio Generator *(Phase 4)*
The AI transforms completed projects into:
- GitHub-ready repository descriptions
- CV bullet points in STAR format
- LinkedIn project summaries optimised for recruiter visibility

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Mobile** | React Native + Expo | Cross-platform iOS & Android from one codebase |
| **Language** | TypeScript | Type safety across the entire app |
| **Navigation** | Expo Router | File-based routing, clean and scalable |
| **Backend & DB** | Supabase (PostgreSQL) | Auth + database + real-time + RLS in one |
| **Authentication** | Supabase Auth | Email/OTP auth with session management |
| **AI Engine** | Claude API (Anthropic) | Personalised career roadmaps + skill gap analysis |
| **Icons** | @expo/vector-icons | Ionicons throughout the UI |

---

## 🗄️ Database Architecture

CareerForge uses **Supabase (PostgreSQL)** with Row Level Security on every table so users can only ever access their own data.

```sql
-- Core profile (filled once at onboarding)
user_profiles
  id uuid references auth.users PRIMARY KEY
  goal text                    -- 'internship' | 'skills' | 'switch'
  level text                   -- 'beginner' | 'intermediate' | 'advanced'
  roles text[]                 -- ['frontend', 'mobile', ...]
  time_commitment text         -- 'casual' | 'regular' | 'intensive'
  onboarding_completed boolean

-- Activity tables (grow as user uses the app)
skill_progress   → one row per completed skill
user_projects    → one row per completed project
daily_activity   → one row per day app is opened (streak tracking)
ai_insights      → cached AI tips (refreshed every 24hrs)
```

**Row Level Security** ensures every query is scoped to `auth.uid()`:
```sql
create policy "Users can only access own data"
on user_profiles for all
using (auth.uid() = id);
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              CareerForge Mobile App              │
│           React Native + Expo + TypeScript       │
├──────────────┬─────────────────┬────────────────┤
│  Auth Flow   │   Dashboard     │   AI Layer     │
│  Onboarding  │   Skill Tree    │   Forge AI     │
│  Routing     │   Projects      │   Roadmaps     │
└──────┬───────┴────────┬────────┴───────┬────────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────────────────────────────────────────┐
│                   Supabase                       │
│   Auth · PostgreSQL · RLS · Real-time           │
└─────────────────────────────┬───────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │    Claude API        │
                   │  Anthropic claude-   │
                   │  sonnet-4            │
                   └─────────────────────┘
```

---

## 📱 Screens

| Screen | Description | Status |
|--------|-------------|--------|
| Splash | Session check + routing | ✅ Done |
| Sign Up / Sign In | Supabase auth with OTP | ✅ Done |
| Onboarding (4 steps) | Goal, level, roles, time captured | ✅ Done |
| Dashboard | Readiness score, stats, quick actions, AI insight | 🔨 Building |
| Skill Tree | Interactive skill tree with progress tracking | 📅 Phase 3 |
| AI Chat | Forge AI — personalised career mentor | 📅 Phase 4 |
| Projects | Filtered project recommendations | 📅 Phase 4 |
| Portfolio Generator | AI-powered CV + GitHub + LinkedIn content | 📅 Phase 5 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>=18.x`
- Expo CLI
- Supabase account
- Anthropic API key

### Installation

```bash
# Clone the repo
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

Run these in your Supabase SQL Editor:

```sql
-- User profiles table
create table user_profiles (
  id uuid references auth.users primary key,
  goal text,
  level text,
  roles text[],
  time_commitment text,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table user_profiles enable row level security;

create policy "Users can manage own profile"
on user_profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);
```

### Run the app

```bash
npx expo start
```

---

## 🗺️ Roadmap

### Phase 1 — Foundation ✅
- [x] Project architecture + navigation
- [x] Supabase auth (sign up, sign in, sign out, OTP)
- [x] Smart onboarding flow (4 steps, saves to Supabase)
- [x] Routing logic (new users → onboarding, returning → dashboard)

### Phase 2 — Dashboard 🔨
- [ ] Dashboard UI with readiness score
- [ ] Goal-based score weighting
- [ ] Streak tracking via daily_activity table
- [ ] Stats row (skills, projects, streak)

### Phase 3 — Skill System
- [ ] Interactive skill tree
- [ ] skill_progress table + RLS
- [ ] Skill completion → score update

### Phase 4 — AI + Projects
- [ ] Forge AI chat screen (Claude API)
- [ ] Personalised roadmap generation
- [ ] Project recommendation engine
- [ ] Skill gap analysis

### Phase 5 — Polish + Launch
- [ ] Portfolio generator
- [ ] LinkedIn / GitHub export
- [ ] App Store + Play Store submission

---

## 👩‍💻 Author

**Chamethya Yasodie**
Full-Stack Developer · BSc Computer Science · University of Westminster (IIT Colombo)

[![GitHub](https://img.shields.io/badge/GitHub-chamethyaY-181717?style=flat&logo=github)](https://github.com/chamethyaY)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Chamethya_Yasodie-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/chamethya-yasodie-a8278a349/)
[![Email](https://img.shields.io/badge/Email-k.chamethya@gmail.com-EA4335?style=flat&logo=gmail)](mailto:k.chamethya@gmail.com)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <sub>Built with ❤️ by Chamethya Yasodie · CareerForge is currently in active development</sub>
</div>
