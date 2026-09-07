# MailMind (FacultyInbox AI) 🎓✉️
### Intelligent Email Triage & Workflow Management for Academic Faculty

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose%208-green?logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%201.5%20Flash-orange?logo=google)](https://ai.google.dev/)
[![Better Auth](https://img.shields.io/badge/Auth-Better--Auth-indigo)](https://www.better-auth.com/)

---

## 📌 Executive Overview

University faculty members are bombarded daily with an overwhelming influx of emails spanning class cancellations, grade dispute requests, administrative mandates, research committee updates, and student hardships. High-stakes messages (such as time-sensitive grade re-evaluations or urgent exam logistics) frequently get buried under general announcements and routine correspondence.

**MailMind (FacultyInbox AI)** is an intelligent email intelligence and triage dashboard engineered specifically for academia. Rather than presenting a flat chronological list of messages, MailMind groups conversations into multi-turn threads, leverages **Google Gemini AI** to assess urgency, extract deadlines, and categorize content, and provides an **AI Daily Digest** alongside proactive follow-up monitoring. The result is a calm, focused, and high-efficiency workspace tailored to professors and academic leaders.

---

## 🖼️ Application Screenshots

> *Tip: Replace the placeholder image links below with your actual project screenshots (place them in a `/screenshots` or `/docs/assets` folder).*

### 1. Unified Dashboard & AI Daily Digest
![Dashboard & Daily Digest](docs/screenshots/dashboard-preview.png)
*Figure 1: Main Faculty dashboard displaying the AI Daily Digest summary, priority stat strip, category filter tabs, and intelligent thread rows.*

---

### 2. Deep-Dive Thread Inspection & AI Reasoning Drawer
![Thread Detail Drawer](docs/screenshots/thread-detail.png)
*Figure 2: Slide-out drawer showcasing multi-message conversation history, extracted deadlines, AI "Why this matters" justification, and manual category reclassification.*

---

### 3. Needs Follow-Up Action Queue
![Needs Follow-Up View](docs/screenshots/needs-follow-up.png)
*Figure 3: Dedicated queue flagging unanswered student and departmental messages exceeding the 48-hour response threshold.*

---

### 4. Interactive Real-Time Email Ingestion Simulator
![Email Ingestion Simulator](docs/screenshots/email-simulator.png)
*Figure 4: Built-in simulation modal enabling judges and testers to inject custom academic emails and watch real-time Gemini AI triage and database persistence.*

---

### 5. Resolved Thread Archive & Lifecycle Management
![Resolved Archive](docs/screenshots/resolved-archive.png)
*Figure 5: Archive view storing completed threads with resolution notes, one-click restoration, and automated 7-day TTL cleanup.*

---

## 🚀 Core Features

### 🧠 1. Multi-Dimensional AI Classification
Every ingested thread is processed by Google Gemini and classified across 7 academic categories:
- **Meeting**: Office hours, calendar invites, and research syncs.
- **Class/Schedule**: Room changes, lab cancellations, lecture timing adjustments.
- **Student Issue**: Hardships, medical leaves, accommodations, and academic integrity.
- **Examination**: Question paper submissions, invigilation duties, proctor schedules.
- **Re-evaluation**: Grade reviews, regrade requests, and marks appeals (auto-boosted to High urgency).
- **Committee/Admin**: Departmental meetings, accreditation, senate tasks, HR notices.
- **Other**: Newsletters, IT notices, spam (automatically silenced to Low urgency).

### ⚡ 2. Dynamic Urgency Scoring & Action Tagging
- **Four Urgency Tiers**: `Critical` (immediate 24-48h deadline or disciplinary/hardship), `High` (2-3 days action needed), `Medium` (standard weekly tasks), and `Low` (informational/newsletters).
- **Automated Deadline Extraction**: Accurately recognizes explicit dates and formats them into readable due-date chips.
- **Concise AI Explanation**: A single-sentence justification (e.g., *"Student disputes grade and requests re-evaluation before Friday deadline"*), bringing the "why" to the surface immediately.

### 📋 3. AI Daily Digest Summary
- An executive plain-English synthesis displayed at the top of the dashboard.
- Highlights what is critical today, pending committee tasks, and actionable recommendations.
- **Smart Invalidation**: Cached in MongoDB with a configurable TTL, and proactively invalidated when new incoming emails are ingested.

### ⏳ 4. Proactive "Needs Follow-Up" Engine
- Computes whether an email conversation is waiting on faculty input.
- Automatically flags threads where:
  1. The last message was sent by an external participant (student or colleague).
  2. The thread remains unread or unanswered.
  3. The elapsed time exceeds the configured threshold (e.g., 48 hours).

### 🔄 5. Live Email Ingestion & Simulator
- Allows testers to fire realistic incoming emails directly into the pipeline.
- Automatically runs the full AI classification, creates database records in MongoDB Atlas, updates global metrics, and invalidates stale digests in real time.

### 🛡️ 6. Faculty Feedback & Human-in-the-Loop Reclassification
- AI predictions are never cast in stone. Faculty members can manually reclassify any thread.
- Tracks `correctedCategory` in the database to support continuous alignment and auditability.

### 📦 7. Thread Resolution & Automated 7-Day Prune Scheduler
- Threads can be marked as `Resolved` with optional resolution notes.
- Resolved threads are archived in a dedicated view with restore capabilities.
- A background scheduler periodically purges resolved threads older than 7 days, maintaining clean database hygiene.

---

## 🛠️ Technology Stack

| Layer | Technologies & Libraries | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.3 (App Router)** + **React 19** | Fast SSR/CSR routing, modern server/client components, optimized bundling. |
| **Frontend Styling** | **Tailwind CSS v4** + Custom Design Tokens | Clean, minimal academic aesthetic, responsive layouts, glassmorphism badges. |
| **Icons & UI Assets** | **Lucide React** | Consistent, modern iconography across all buttons, indicators, and chips. |
| **Frontend Auth Client**| **Better Auth Client** | Lightweight session verification, reactive login state, cookie-based session headers. |
| **Backend Runtime** | **Node.js (ES Modules)** + **TypeScript 5.7** | Type-safe execution with `tsx watch` hot-reload in development. |
| **Web Server** | **Express 4.21** | Modular routing, middleware pipelines, CORS origin controls, rate-limiting. |
| **Database & ODM** | **MongoDB Atlas / Local** + **Mongoose 8** | Schema enforcement, embedded message subdocuments, compound indexing, TTL purging. |
| **Authentication** | **Better Auth (v1.1)** | Session cookies, user identity management, credential validation. |
| **AI / LLM Engine** | **Google Gemini 1.5 Flash** (`@google/generative-ai`) | Zero-shot academic triage, deadline extraction, JSON schema generation, digest creation. |
| **Validation & Security** | **Zod 3.24**, **Helmet 8.0**, **express-rate-limit** | Request payload validation, secure HTTP headers, and API flood protection. |
| **Logging & Monitoring** | **Pino 9.6** + **Pino Pretty** | High-performance structured JSON logging for all API operations and LLM calls. |

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
                             ┌───────────────────────────────────┐
                             │       Next.js 16 Client App       │
                             │  - Dashboard & Daily Digest Card  │
                             │  - Priority Stat Strip            │
                             │  - Slide-out Thread Drawer        │
                             │  - Email Ingestion Simulator      │
                             └─────────────────┬─────────────────┘
                                               │
                                               │ HTTPS / JSON REST API
                                               │ (Session Cookies)
                                               ▼
                             ┌───────────────────────────────────┐
                             │        Express API Gateway        │
                             │  - Helmet Security & CORS         │
                             │  - Global Rate Limiting           │
                             │  - Better Auth Session Guard      │
                             │  - Zod Request Schema Validation  │
                             └─────────┬───────────────┬─────────┘
                                       │               │
                     ┌─────────────────┘               └─────────────────┐
                     ▼                                                   ▼
       ┌───────────────────────────┐                       ┌───────────────────────────┐
       │     Business Services     │                       │     AI & Triage Engine    │
       │ - ThreadService           │                       │ - ClassifierService       │
       │ - FollowUpService         │                       │   (Gemini 1.5 Flash)      │
       │ - DigestService           │                       │ - Prompt Persona & Rules  │
       │ - Resolved Cleanup Cron   │                       │ - Heuristic Fallbacks     │
       └─────────────┬─────────────┘                       └─────────────┬─────────────┘
                     │                                                   │
                     ▼                                                   │
       ┌───────────────────────────┐                                     │
       │   MongoDB / Mongoose 8    │                                     │
       │ - Users & Sessions        │◄────────────────────────────────────┘
       │ - Threads (Embedded Msgs) │   Structured Classification & Explanations
       │ - DigestCache (TTL-backed)│
       └───────────────────────────┘
```

### Frontend Architecture Details
- **State Management**: Orchestrated via a unified `ThreadsContext` that stores current threads, filtered views, stats, and user state. Optimistic UI updates ensure instantaneous interactions when reading, reclassifying, or resolving threads.
- **Visual Design Philosophy**: Built on an "iDraft" inspired academic productivity theme — clean white cards, subtle borders (`border-black/[0.04]`), dark pill active tabs, and high-contrast urgency chips (`Critical` in red, `High` in amber, `Medium` in yellow, `Low` in slate).
- **Modals & Drawers**: Slide-over drawer pattern for inspecting thread histories without losing context of the overall inbox list.

### Backend Architecture Details
- **Modular Layering**:
  - `routes/`: Define API endpoints and apply schema validation and auth guards.
  - `controllers/`: Extract parameters, handle HTTP responses, and delegate to services.
  - `services/`: Encapsulate core business logic (digest caching, follow-up criteria, thread queries).
  - `providers/`: Implements the **Provider Pattern**. The `IngestionProvider` contract cleanly decouples ingestion sources (Mock vs. Gmail OAuth) from classification and storage.
- **Resilient AI Calling**: The `ClassifierService` enforces structured JSON output with built-in retry handling and keyword-based fallback heuristics should the external API encounter latency or rate caps.

---

## 🤖 Agentic Pipelines: Pseudo Workflow

The diagram and steps below illustrate the non-technical conceptual flow of how emails are transformed into triaged faculty tasks:

```
[ Incoming Email / Ingestion ]
             │
             ▼
┌──────────────────────────────────────┐
│  1. Ingestion & Thread Normalization │ ── Standardizes subject, participants,
└──────────────────┬───────────────────┘    and message timestamp.
                   ▼
┌──────────────────────────────────────┐
│  2. Prompt Formulation & Persona     │ ── Equips Gemini with university context,
└──────────────────┬───────────────────┘    category definitions, & academic rules.
                   ▼
┌──────────────────────────────────────┐
│  3. Multi-Attribute AI Evaluation    │ ── Gemini infers category, urgency,
└──────────────────┬───────────────────┘    deadlines, & "why this matters".
                   ▼
┌──────────────────────────────────────┐
│  4. Safety Heuristics & Rules Engine │ ── Enforces domain guarantees (e.g.
└──────────────────┬───────────────────┘    "Other" must be Low; regrades High).
                   ▼
┌──────────────────────────────────────┐
│  5. Database Sync & Cache Purge      │ ── Stores thread in Atlas; invalidates
└──────────────────┬───────────────────┘    the existing AI Daily Digest cache.
                   ▼
┌──────────────────────────────────────┐
│  6. Proactive Follow-Up Monitoring   │ ── Evaluates reply aging and notifies
└──────────────────────────────────────┘    the professor if action is overdue.
```

### Step-by-Step Flow

1. **Email Capture & Normalization**:
   The system receives an email (via webhook, synchronization, or the built-in simulator). If the email belongs to an existing conversation, it is appended to that thread; otherwise, a new thread container is generated.

2. **Persona & Guardrail Injection**:
   The thread history is formatted into a sanitized context block and paired with the **FacultyInbox AI System Persona**. The prompt provides strict rules (such as identifying academic accommodations or isolating administrative newsletters).

3. **Reasoning & Output Synthesis**:
   Gemini 1.5 Flash processes the conversation and outputs a strict structured JSON payload containing:
   - Category choice
   - Urgency rating
   - Extracted calendar deadline (if any)
   - One-sentence faculty-centric justification

4. **Deterministic Heuristic Verification**:
   Before persistence, the system validates the response against university business logic:
   - If marked as `Other`, urgency is locked to `Low` and `actionNeeded` is set to `false`.
   - If classified as `Re-evaluation` without an explicit urgency, it is promoted to `High`.
   - Deadline strings are parsed into standardized ISO timestamps.

5. **Cache Invalidation & Fresh Digest Trigger**:
   The thread is saved to MongoDB. The existing AI Daily Digest is cleared so that the professor’s dashboard summary updates automatically upon their next visit.

6. **Continuous Follow-Up Evaluation**:
   Background evaluation checks whether the email is unread or awaiting a response from the professor. If 48 hours elapse without an answer, the thread is elevated to the **Needs Follow-Up** queue.

---

## 📁 Repository Structure

```
onsite/
├── backend/
│   ├── src/
│   │   ├── config/             # Environment validation (Zod) & DB connection
│   │   ├── controllers/        # REST route handlers (threads, stats, digest, auth)
│   │   ├── middleware/         # Auth verification, rate limiting, error handling
│   │   ├── models/             # Mongoose schemas (Thread, DigestCache, User)
│   │   ├── providers/
│   │   │   ├── classification/ # Gemini AI Classifier Service & Prompts
│   │   │   └── ingestion/      # IngestionProvider interface, Mock & Gmail providers
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # ThreadService, DigestService, FollowUpService
│   │   ├── utils/              # Resolved thread cleanup scheduler, loggers, response helpers
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server bootstrap & graceful shutdown
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── login/              # Authentication screen (Better Auth)
│   │   ├── globals.css         # Styling, tokens, and CSS variables
│   │   ├── layout.tsx          # Root layout and metadata
│   │   └── page.tsx            # Main dashboard shell & view switcher
│   ├── components/
│   │   ├── DailyDigestCard.tsx     # AI plain-English summary banner
│   │   ├── PriorityStatStrip.tsx   # Critical / High / Follow-up pill counts
│   │   ├── CategoryFilterTabs.tsx  # Academic category tab bar
│   │   ├── ThreadList.tsx          # Virtualized/sorted email thread rows
│   │   ├── ThreadRow.tsx           # Individual thread item with badges
│   │   ├── ThreadDetailDrawer.tsx  # Conversation history & reclassify panel
│   │   ├── NeedsFollowUpView.tsx   # Unanswered thread alert view
│   │   ├── OtherPriorityView.tsx   # De-emphasized low priority list
│   │   ├── ResolvedThreadsView.tsx # Archived & resolved threads manager
│   │   ├── SimulateEmailModal.tsx  # Interactive live email injector
│   │   ├── NotificationModal.tsx   # Recent activity feed
│   │   ├── HeaderSearch.tsx        # Omnibar search across threads
│   │   └── Sidebar.tsx             # Main navigation sidebar
│   ├── context/
│   │   └── ThreadsContext.tsx  # Global state manager for threads and user data
│   ├── lib/
│   │   ├── api.ts              # Type-safe fetch client for Express API
│   │   └── auth-client.ts      # Better Auth frontend client
│   ├── types/                  # TypeScript interfaces for threads, messages, and stats
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                   # Project documentation
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **MongoDB**: A running local instance (`mongodb://127.0.0.1:27017`) or a free MongoDB Atlas connection URI.
- **Google Gemini API Key**: Obtainable via [Google AI Studio](https://aistudio.google.com/).

---

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables by creating a `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000

   # Database
   MONGODB_URI=mongodb://127.0.0.1:27017
   MONGODB_DB_NAME=facultyinbox_dev

   # Better Auth
   BETTER_AUTH_SECRET=development_secret_key_at_least_32_characters_long_for_facultyinbox
   BETTER_AUTH_URL=http://localhost:5000
   BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000

   # AI Configuration
   LLM_PROVIDER=gemini
   LLM_API_KEY=YOUR_GEMINI_API_KEY_HERE
   LLM_MODEL=gemini-1.5-flash

   # Business Rules
   FOLLOWUP_THRESHOLD_HOURS=48
   DIGEST_CACHE_TTL_SECONDS=300
   MAX_MESSAGES_PER_THREAD=200
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will boot on `http://localhost:5000` and automatically connect to MongoDB.*

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify or create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_AUTH_URL=http://localhost:5000
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit **`http://localhost:3000`**.

---

### 3. Testing the Live AI Triage

1. Log in using any email/password credentials or use the demo account.
2. In the top navigation bar, click the **"+ Simulate Email"** button.
3. Enter sample details:
   - **Subject**: `Grade calculation inquiry for CS301 midterm`
   - **Sender**: `student.rahim@university.edu`
   - **Body**: `Dear Professor, I noticed my score for Question 4 was omitted in the midterm portal. The deadline for re-evaluation submission is tomorrow at 5 PM. Could you please review my script?`
4. Click **"Simulate & Ingest"**.
5. Observe the real-time AI classification:
   - **Category**: `Re-evaluation`
   - **Urgency**: `High` or `Critical`
   - **AI Explanation**: Outlining the deadline and regrade request.
   - The thread appears instantly at the top of your inbox, and the **AI Daily Digest** updates automatically!

---

## 🔒 Security & Best Practices

- **Zero Hardcoded Secrets**: Strict startup validation powered by Zod ensures missing environment variables fail fast.
- **Granular Sanitization**: Helmet protects against cross-site scripting, while CORS limits requests strictly to authorized origins.
- **Isolated User Context**: All thread queries and actions are strictly scoped to the authenticated user's session ID (`req.user.id`).
- **Graceful Fallbacks**: In case of network disruptions or AI quota limits, the system safely defaults to standard inbox ordering without dropping messages.

---

## 👥 Contributors & Hackathon Team

Developed with ❤️ for academic leaders and faculty members to eliminate communication friction.
