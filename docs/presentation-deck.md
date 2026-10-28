# AuraWell AI — Complete Presentation Deck (PPT) & Feature-Technology Specification

---

# PART 1: Slide-by-Slide Presentation Deck

---

### Slide 1: Title & Executive Introduction
* **Header:** AuraWell AI
* **Subtitle:** An AI-Assisted Mental Wellness & Daily Reflection Platform
* **Tagline:** Empowering mindful daily routines through non-diagnostic reflection, ambient soundscapes, and ethical AI.
* **Presenter:** Project Engineering & Product Team
* **Key Visual:** Cosmic dark mode dashboard preview with glowing floating dock and starry background.
* **Bullet Points:**
  * Full-stack wellness ecosystem: Assessments, Ambient Audio, Daily Tracking, and Conversational Support.
  * 100% non-diagnostic and non-pathologizing: focuses on lifestyle reflection and preventive self-care.
  * Deterministic safety-first AI guardrails with local-first fallback capabilities.
* **Speaker Notes:**
  > "Welcome everyone. Today we are presenting AuraWell AI, a platform created to transform how individuals engage in daily mental self-care. Instead of treating wellness as an intermittent clinical intervention, AuraWell AI integrates reflection, restorative music, and habit-building into a peaceful, daily ritual."

---

### Slide 2: The Problem Space
* **Header:** Current Challenges in Digital Mental Wellness
* **Visual Layout:** 3-column split card comparison (Fragmentation | Diagnostic Overreach | AI Safety Risks)
* **Bullet Points:**
  * **App Fragmentation:** Users juggle separate applications for mood tracking, sleep journals, soundscapes, and chat support, creating friction and disconnected insights.
  * **Clinical Overreach & Liability:** Many digital apps misuse psychiatric terminology (e.g. diagnosing anxiety/depression without supervision), triggering user alarm.
  * **Black-Box AI Vulnerabilities:** General-purpose AI chatbots can hallucinate medical advice or fail dangerously during crisis situations when safety relies solely on system prompts.
  * **Privacy Concerns:** Intimate journals and emotional states are frequently stored without clear consent boundaries or used to train third-party models.
* **Speaker Notes:**
  > "People who want to improve their mental wellbeing face fragmented tools and unreliable AI chatbots that overstep into pseudo-medical diagnosis. When a user in crisis speaks to an unconstrained LLM, the consequences can be dangerous. We recognized the need for an integrated platform built on hard deterministic safety."

---

### Slide 3: The AuraWell AI Solution
* **Header:** A Unified, Safe, and Peaceful Sanctuary
* **Visual Layout:** Central hub diagram showing the user connected to 4 pillars.
* **Bullet Points:**
  * **All-in-One Reflection Hub:** Integrates 15 wellness assessment areas, daily trackers, a soundscape player, and guided journals into a single pane of glass.
  * **Grounded in Lifestyle, Not Pathology:** Replaces medical labels with clear, understandable indicators like *Strain*, *Restfulness*, *Vitality*, and *Groundedness*.
  * **Multi-Stage Deterministic Safety Gate:** Crisis words and medical queries are intercepted by hard server rules *before* any language model is invoked.
  * **Privacy by Design:** AI data sharing is strictly opt-in, minors never touch external models, and users have complete one-click data export and account deletion rights.
* **Speaker Notes:**
  > "AuraWell AI solves this by serving as an integrated digital sanctuary. It combines structured check-ins, soothing nature soundscapes, and a conversational sounding board into one cohesive experience, where every sensitive decision is governed by deterministic code rather than unpredictable AI."

---

### Slide 4: Target Audience & Age Adaptability
* **Header:** Thoughtful Design for Every Stage of Life
* **Visual Layout:** Age spectrum matrix (Children 6–12 | Teens 13–17 | Adults 18–64 | Seniors 65+)
* **Bullet Points:**
  * **Children (Ages 6–12):** Playful metaphors, tactile interactions, curated activities; completely isolated from external LLMs under strict COPPA compliance.
  * **Teens (Ages 13–17):** Focus on academic strain, peer connections, and screen boundaries with empathetic, non-judgmental language.
  * **Adults (Ages 18–64):** In-depth reflection on work burnout, relationship dynamics, emotional granularity, and restorative routines.
  * **Older Adults (Ages 65+):** High-contrast readability, accessible controls, and focus on physical vitality, peace of mind, and life reflections.
* **Speaker Notes:**
  > "Mental wellbeing looks different at every stage of life. AuraWell AI adapts question wording, activities, and interaction models to the user's age group, ensuring children receive safe, curated activities while adults receive nuanced cognitive reflections."

---

### Slide 5: Core Feature 1 — Multi-Tier Assessment Engine
* **Header:** 540 Curated Questions Across 15 Wellness Dimensions
* **Visual Layout:** Category grid highlighting 15 areas + Depth Mode toggle cards.
* **Bullet Points:**
  * **540 Non-Diagnostic Questions:** Spans Daily Mood, Stress, Sleep, Burnout, Social Connection, Resilience, Lifestyle, and Weekly Reviews.
  * **Customizable Depth Modes:**
    * *Quick Mode (~2–3 min):* 5–10 anchor questions for rapid daily check-ins.
    * *Standard Mode (~5–7 min):* Balanced assessment of primary drivers and emotions.
    * *Detailed Mode (~12–15 min):* Deep-dive retrospective across all sub-dimensions.
  * **Dual-Input Responsive Controls:** Interactive Base UI slider paired with discrete numeric step buttons (1–5) and dynamic emotional descriptors.
  * **Immediate 0–100 Indicators:** Generates instant visual meters showing balance across vitality, tension, and clarity.
* **Speaker Notes:**
  > "At the heart of the platform is our 540-question reflection bank. Whether a user has two minutes for a quick morning pulse check or fifteen minutes for a Sunday evening review, our depth-mode engine adapts questions dynamically, delivering instant, explainable wellness indicators."

---

### Slide 6: Core Feature 2 — Spotify-Style Peaceful Sounds Music Player
* **Header:** Ambient Audio Engine & Smart Reflection Pairing
* **Visual Layout:** Persistent bottom player dock mockup with wave visualizer and track cards.
* **Bullet Points:**
  * **Integrated Audio Library:** Mastered nature and ambient soundscapes including *Calming Rain*, *Ocean Waves*, *Forest Sanctuary*, *Tibetan Singing Bell*, and *Mountain Waterfall*.
  * **Persistent Global Dock:** Uninterrupted gapless playback while navigating between assessments, journaling, and chat.
  * **Comprehensive Controls:** Play, pause, track scrubber, volume control, mute, shuffle, loop, and queue management.
  * **Contextual Soundscape Pairing:** High-tension questions directly suggest paired audio (e.g., *♫ Paired with Calming Rain*); results feature one-click playback directly driving the global player.
* **Speaker Notes:**
  > "Audio is one of the most effective tools for down-regulating the nervous system. We built a full Spotify-style persistent music player into the application. When an assessment detects tension or racing thoughts, it links directly to curated soundscapes that users can trigger with a single click."

---

### Slide 7: Core Feature 3 — Safe AI Counseling Companion (AURA)
* **Header:** AURA: Empathetic Reflection with Hard Safety Gates
* **Visual Layout:** 5-Stage Triage Flowchart (Crisis -> Medical -> Child -> Consent -> LLM)
* **Bullet Points:**
  * **Not a Therapist, but a Thoughtful Companion:** Positioned as a gentle sounding board for active listening, cognitive reframing, and habit encouragement.
  * **Deterministic Pre-Screening:**
    * *Crisis Match:* Intercepts self-harm or suicidal ideation immediately; provides 24/7 localized helplines.
    * *Medical Boundary:* Automatically redirects requests for prescriptions or diagnoses to licensed professionals.
  * **Curated Child Guard:** Users under 13 receive pre-approved, uplifting mindfulness exercises.
  * **Zero-Failure Fallback:** Operates 100% offline using deterministic rule-based dialogue when the AI provider is unavailable or consent is withheld.
* **Speaker Notes:**
  > "AURA demonstrates how AI should be deployed in sensitive spaces: with strict guardrails. Every user message passes through deterministic safety filters on our server before any API call is made. If a crisis keyword or medical question is detected, the LLM is bypassed entirely in favor of vetted emergency resources."

---

### Slide 8: Core Feature 4 — Trackers & 7-Day Action Plans
* **Header:** Turning Daily Reflection into Sustainable Action
* **Visual Layout:** Split screen showing daily tracking cards on the left, and an interactive 7-day checklist on the right.
* **Bullet Points:**
  * **Holistic Daily Trackers:** Simple, low-friction recording for Daily Mood, Sleep Latency/Quality, Freeform Journaling, and Daily Habits.
  * **Guaranteed 7-Day Action Plan:** Every assessment dynamically generates a non-empty, actionable plan structured into manageable daily tasks:
    * *Days 1–2:* Grounding exercises and soundscape immersion.
    * *Days 3–4:* Guided cognitive journaling and small habit experiments.
    * *Days 5–6:* Environmental reset and social micro-steps.
    * *Day 7:* Retrospective celebration and next-week intentions.
  * **Interactive Progress:** Check off daily tasks directly in the dashboard to build momentum.
* **Speaker Notes:**
  > "Insights without action lead nowhere. AuraWell AI converts assessment results into a structured 7-day action plan. Users receive concrete, bite-sized tasks—from 5 minutes of calming rain soundscapes to targeted journal prompts—that they can check off day by day."

---

### Slide 9: Core Feature 5 — Cosmic UI & Mindful Gamification
* **Header:** Calming Aesthetic Design & Non-Addictive Progress
* **Visual Layout:** Cosmic dark theme screenshot with floating dock, Cmd+K palette, and level badge.
* **Bullet Points:**
  * **Cosmic Starfield Theme:** Deep space glassmorphism with soft sapphire and violet accents designed to soothe eye strain and encourage evening reflection.
  * **Dynamic Navigation:** Floating dock pill, floating header, and universal `Cmd+K` / `Ctrl+K` Command Palette for rapid search across tools and audio.
  * **Non-Competitive Gamification:** Private XP, mindful levels, and gentle streaks—deliberately free of public leaderboards, social comparisons, or punitive streak freezes.
  * **Server-Authoritative Rewards:** All XP calculations and badge unlocks are computed on the backend to maintain data integrity.
* **Speaker Notes:**
  > "Our UI was designed with purpose: deep space aesthetics and fluid motion provide a calming escape from noisy, hyper-stimulating feeds. Furthermore, our gamification is strictly private and non-addictive, celebrating gentle consistency rather than obsessive screen time."

---

### Slide 10: System Architecture & Data Flow
* **Header:** Clean Monorepo Architecture & Decoupled Services
* **Visual Layout:** Layered architectural diagram (Presentation -> HTTP/API -> Domain Services -> Persistence & AI)
* **Bullet Points:**
  * **Modern Monorepo:** Separates `@aurawell/client` and `@aurawell/server` with shared root scripts for unified builds, linting, and testing.
  * **API & Validation Middleware:** Declarative routing with Express 5, cookie sessions, double-submit CSRF protection, and strict Zod runtime schema guards.
  * **Self-Healing Backend:** Automatic database seed synchronization on server boot and on-demand fallback upserts preventing 404 errors during check-ins.
  * **Sanitized DTOs:** Strict data-transfer transformations strip passwords, session tokens, and security metadata before responses reach the client.
* **Speaker Notes:**
  > "Architecturally, AuraWell AI is built for reliability and maintainability. By separating our Express API, domain scoring services, and React presentation tier, each component evolves independently. Self-healing database syncing ensures that even upon fresh deployments, all 540 questions and soundscapes are instantly available."

---

### Slide 11: Technology Stack Matrix
* **Header:** Proven, High-Performance Modern Web Technologies
* **Visual Layout:** 2x3 grid displaying logos and core tech benefits.
* **Bullet Points:**
  * **React 19 & TypeScript:** State-of-the-art component architecture, strict type checking, and fluid UI updates.
  * **Vite 6 & Rolldown Engine:** Blazing fast development server and optimized production bundling under 2.2 seconds.
  * **Tailwind CSS v4 & Motion:** Cutting-edge utility styling with hardware-accelerated spring animations and transitions.
  * **Express 5 & Node.js 20+ LTS:** Modernized HTTP engine with native async routing and robust middleware chaining.
  * **MongoDB & Mongoose 8:** Scalable document persistence for complex assessment responses and user metrics.
  * **Base UI Primitives:** Accessible, headless UI primitives ensuring flawless keyboard and touch interactions.
* **Speaker Notes:**
  > "We selected our tech stack to maximize performance, developer velocity, and accessibility. React 19 and Vite deliver near-instant load times, while Express 5 and Mongoose 8 provide a rock-solid, typed backend."

---

### Slide 12: Engineering Challenges & Breakthroughs
* **Header:** Overcoming Key Engineering Hurdles
* **Visual Layout:** 3 problem-solution highlight callouts.
* **Bullet Points:**
  * **Headless Slider Geometry Bug:** Base UI's thumb originally positioned outside the track bar causing cursor disconnect. Resolved by nesting the thumb inside the track and enforcing scalar numeric inputs with dual-mode button chips.
  * **Missing Database Seed 404s:** Initial direct navigation to newly introduced assessments caused 404s on empty databases. Resolved by engineering a two-tier self-healing auto-sync at server boot and controller query time.
  * **Non-Diagnostic Scoring Math:** Developed an explainable, deterministic rule engine that maps multidimensional tags into 0–100 wellness indicators without using opaque neural networks or clinical diagnostic codes.
* **Speaker Notes:**
  > "Every robust system encounters tough engineering hurdles. We resolved intricate headless slider geometry bugs to guarantee smooth dragging, built self-healing database seeding to eliminate 404s, and designed a non-diagnostic scoring algorithm that is completely transparent and testable."

---

### Slide 13: Results, Verification & Quality Assurance
* **Header:** 100% Test Pass Rate Across Monorepo
* **Visual Layout:** Large metric cards showing 201 Tests Passed | 0 Errors | Sub-2s Build
* **Bullet Points:**
  * **Server Test Suite (14 files):** **146 passed (146)** covering assessment scoring, AI safety triage, authentication, rate-limiting, and privacy export.
  * **Client Test Suite (11 files):** **55 passed (55)** verifying slider interactions, runner navigation, audio player state, and responsive layouts.
  * **Static Code Analysis:** **0 errors** in TypeScript compilation (`npm run typecheck`) and ESLint (`npm run lint`).
  * **Fast Production Build:** Client bundles in 1.64 seconds with tree-shaking, code-splitting, and audio asset optimization.
* **Speaker Notes:**
  > "Quality and stability are non-negotiable in wellness technology. AuraWell AI is backed by 201 automated tests across 25 test suites with a 100% pass rate. Every build, typecheck, and lint check runs cleanly with zero warnings or errors."

---

### Slide 14: Future Roadmap & Vision
* **Header:** Scalability and Long-Term Evolution
* **Visual Layout:** 3-stage timeline (Phase 1: Near-Term | Phase 2: Mid-Term | Phase 3: Long-Term)
* **Bullet Points:**
  * **Near-Term (Q1–Q2):** Out-of-band guardian email verification for minors; IANA timezone-aware daily streak calculations; Progressive Web App (PWA) offline caching.
  * **Mid-Term (Q3–Q4):** Biometric synchronization with Apple Health and Google Health Connect; custom soundscape mixer (combining rain + bells + ocean).
  * **Long-Term (2027):** On-device Small Language Models (SLMs) for 100% private, local conversational AI; clinical trial partnership to measure preventive efficacy.
* **Speaker Notes:**
  > "Looking forward, our roadmap focuses on expanding user sovereignty and personalization. From biometric syncing with smart wearables to running small language models locally on user devices, AuraWell AI will continue pioneering safe, private mental wellness technology."

---

### Slide 15: Conclusion & Q&A
* **Header:** AuraWell AI — The Future of Mindful Self-Care
* **Key Takeaway:** Digital mental wellness can be visually inspiring, feature-rich, and technologically advanced while remaining strictly ethical, non-diagnostic, and safe.
* **Links & Resources:**
  * Project Repository: `aurawell-ai`
  * Architecture & API Docs: `docs/architecture.md`, `docs/api.md`
  * Full Technical Report: `docs/project-report.md`
* **Speaker Notes:**
  > "Thank you for your time and attention. AuraWell AI represents a thoughtful balance of human-centered design, modern engineering, and uncompromising safety. We are now open for questions and discussion."

---

# PART 2: Feature-by-Feature Deep Dive: Uses, Technologies & Purpose

---

### 1. Multi-Tier Mental Wellness Assessment Engine
* **What it does & How it is used:**
  * Provides a repository of **540 curated questions** across 15 mental wellness dimensions (Daily Mood, Stress, Sleep, Burnout, Resilience, Focus, etc.).
  * Users choose their check-in depth (*Quick Mode* ~2m, *Standard Mode* ~5m, *Detailed Mode* ~12m) before taking a check-in.
  * Supports single-choice, multiple-choice, boolean, short-text, and rating scales with adaptive age-specific wording.
* **Technologies Used:**
  * **React 19 & Base UI (`@base-ui-components/react`):** Powers the accessible, dual-input slider and discrete score button controls.
  * **Express 5 & TypeScript:** Serves filtered question batches matching the requested depth mode and user age group.
  * **Deterministic Scoring Engine (`assessmentEngine.service.ts`):** Evaluates responses, computes weighted tags, and generates 0–100 wellness indicators.
  * **MongoDB & Mongoose:** Stores assessment templates and user response history.
* **Purpose & Architectural Rationale:**
  * Eliminates user overwhelm by letting users tailor the assessment length to their immediate schedule.
  * Guarantees non-diagnostic evaluation: scores are calculated deterministically via transparent tag weighting rather than black-box models, preventing psychiatric misdiagnosis.

---

### 2. Spotify-Style Ambient Music Player & Soundscape Engine
* **What it does & How it is used:**
  * Provides high-fidelity nature and ambient soundscapes (*Calming Rain*, *Ocean Waves*, *Forest Sanctuary*, *Tibetan Bell*, *Waterfalls*, etc.).
  * Operates via a fixed bottom floating dock that stays active and persistent across all page transitions.
  * Users can browse soundscapes on a dedicated `/music` page, search by mood or category, adjust volume, seek/scrub, loop, and shuffle.
  * Automatically pairs with assessment questions: when a user expresses high stress, assessment results feature one-click soundscape playback cards.
* **Technologies Used:**
  * **HTML5 Web Audio API:** Delivers low-latency, gapless audio streaming and scrubbing.
  * **Zustand (`useMusicStore.ts`):** Global reactive audio store managing play/pause state, active track, queue, volume, and playback progress.
  * **Tailwind CSS v4 & Motion:** Smooth progress bars, animated soundwave visualizers, and expandable drawer views.
  * **Local Audio Assets (`client/src/music/*.mp3`):** Packaged directly within the client assets for zero external network latency.
* **Purpose & Architectural Rationale:**
  * Audio is clinically proven to reduce somatic anxiety. Embedding a global, persistent music player directly into the application ensures users can listen to calming audio *while* writing journals or completing check-ins without having to switch to third-party streaming apps.

---

### 3. Safe AI Counseling Companion (AURA) & Deterministic Safety Gate
* **What it does & How it is used:**
  * Provides a reflective conversational sounding board where users can discuss daily stressors, explore cognitive reframing, and receive gentle encouragement.
  * Maintains conversational context across a session while clearly disclosing its AI identity.
* **Technologies Used:**
  * **Safety Screening Service (`safety.service.ts`):** High-speed regex and deterministic pattern matching to screen for crisis keywords (self-harm, suicide) and medical requests.
  * **Gemini 2.5 Flash / OpenAI SDK:** External LLM integration invoked *only* for consented adult users whose input passed safety screening.
  * **Local Fallback Engine (`fallbackProvider.ts`):** Deterministic rule-based dialogue engine that runs when the external LLM is offline or when the user has not granted AI consent.
  * **Zod & Express Middleware:** Sanitizes and validates all incoming conversational payloads.
* **Purpose & Architectural Rationale:**
  * Traditional LLMs are prone to hallucinations and unpredictable failure modes in mental health contexts. AuraWell AI enforces a server-side **deterministic safety gate** that intercepts emergencies before any model is invoked, ensuring users in crisis immediately receive certified emergency contact details.

---

### 4. Guaranteed 7-Day Personalized Action Plan Generator
* **What it does & How it is used:**
  * Analyzes the tag results of any completed assessment and synthesizes a non-empty, actionable 7-day wellness action plan.
  * Assigns manageable daily tasks across grounding exercises, soundscapes, journal reflections, habit building, and social check-ins.
  * Users can view their personalized plan on the assessment results page and check off tasks day-by-day.
* **Technologies Used:**
  * **Action Plan Domain Service (`actionPlan.service.ts`):** Deterministic template selection and suggestion enrichment based on user strain tags and priorities.
  * **Recommendation Model (`Recommendation.ts`):** MongoDB collection storing personalized action steps and status.
  * **React 19 & Lucide Icons:** Interactive checklist UI with completion animations and progress meters.
* **Purpose & Architectural Rationale:**
  * Assessments without practical follow-through fail to improve wellbeing. The action plan generator bridges reflection with concrete behavioral steps, ensuring users leave every check-in with a tangible path forward.

---

### 5. Daily Wellness Trackers (Mood, Sleep, Journal, Habits)
* **What it does & How it is used:**
  * **Mood Tracker:** Allows quick logging of emotional valence, energy levels, and primary emotion descriptors.
  * **Sleep Tracker:** Records sleep duration, latency (time to fall asleep), and morning restfulness ratings.
  * **Guided Journal:** Freeform and prompt-driven journaling with tags and privacy indicators.
  * **Habit Builder:** Customizable daily habit checklist (e.g. hydration, screen curfews, outdoor walks) with streak tracking.
* **Technologies Used:**
  * **Mongoose Models (`MoodLog.ts`, `SleepLog.ts`, `JournalEntry.ts`, `Habit.ts`):** Scalable MongoDB document schemas indexed by `userId` and date.
  * **Zod Schemas:** Validates that daily logs fall within healthy bounds (e.g. sleep duration <= 24 hours).
  * **Chart / Metric Visualizations:** Dynamic SVG and HTML5 metric cards summarizing weekly and monthly trends.
* **Purpose & Architectural Rationale:**
  * Consolidating daily tracking into one platform allows users to correlate sleep quality, mood fluctuations, and habit completion without needing multiple separate subscription apps.

---

### 6. Non-Competitive Mindful Gamification (XP, Levels, Streaks)
* **What it does & How it is used:**
  * Awards gentle "Mindful XP" for completing healthy actions (e.g. +15 XP for check-ins, +10 XP for journaling, +5 XP for habits).
  * Unlocks peaceful wellness levels (e.g. *Level 1: Novice Seeker* to *Level 10: Zen Master*) and tracks personal streaks.
  * Strictly private: no leaderboards, public rankings, or social comparison.
* **Technologies Used:**
  * **Gamification Service (`gamification.service.ts`):** Server-authoritative calculation of XP, levels, and streak increments.
  * **User Model (`User.ts`):** Tracks XP, level, and streak state with atomic MongoDB updates (`$inc`).
  * **Client Header Status Badges:** Luminous cosmic pill badges displaying current streak and level in the navigation bar.
* **Purpose & Architectural Rationale:**
  * Encourages consistent daily habits without triggering social anxiety or unhealthy comparison. Server-authoritative calculations prevent client tampering and maintain data integrity.

---

### 7. Cosmic UI & Dynamic Navigation (Floating Dock, Floating Header, Command Palette)
* **What it does & How it is used:**
  * Features a starry deep-space background with glowing neon accents and glassmorphic cards.
  * Includes a floating bottom dock providing quick icon navigation across Dashboard, Assessments, Music, Games, Journal, Trackers, Chat, and Settings.
  * Features a universal **Command Palette (`Cmd+K` / `Ctrl+K`)** allowing keyboard-driven quick-launch across all tools, soundscapes, and pages.
* **Technologies Used:**
  * **Tailwind CSS v4:** Hardware-accelerated CSS variables, backdrop blur filters, and fluid responsiveness.
  * **Motion (`motion/react`):** Spring-physics micro-interactions, page transition cross-fades, and dock hover tooltips.
  * **Lucide React:** Vector iconography matching cosmic aesthetic tokens.
* **Purpose & Architectural Rationale:**
  * Digital wellness apps should induce tranquility, not visual fatigue. The cosmic dark theme reduces eye strain, while the floating dock and Command Palette streamline navigation, keeping user focus on mindfulness.

---

### 8. Privacy, Consent Management & Data Sovereignty
* **What it does & How it is used:**
  * Gives users complete visibility and control over their data in the Settings page.
  * AI consent toggle: explicitly opt-in or opt-out of third-party language model processing.
  * One-Click Data Export: downloads an exhaustive, decrypted JSON file containing all user check-ins, journals, and logs.
  * Account Soft-Deletion: allows immediate account termination, destroying active sessions and anonymizing records.
* **Technologies Used:**
  * **Cookie-Session & CSRF Tokens:** Secure HTTP-only cookies with double-submit CSRF protection.
  * **Privacy Controller (`privacy.controller.ts`):** Compiles user documents across all collections into a structured export DTO.
  * **User Model Hooks:** Implements soft-deletion flags (`deletedAt`) to immediately block access while respecting data retention policies.
* **Purpose & Architectural Rationale:**
  * Mental wellness data is deeply sensitive. By adhering to GDPR, CCPA, and COPPA principles, AuraWell AI guarantees that personal reflections belong solely to the user, establishing high trust and zero commercial data exploitation.

---

### 9. Self-Healing Resilience & Database Auto-Seeding
* **What it does & How it is used:**
  * Automatically synchronizes the database with all 23 assessment seed templates upon server startup.
  * Features an on-demand fallback: if a user navigates to an assessment that hasn't been seeded in MongoDB, the controller catches the missing record, upserts the in-memory seed on the fly, and returns HTTP 200 without user disruption.
* **Technologies Used:**
  * **Server Startup Engine (`server.ts`):** `autoSeedAssessments()` runs immediately after `connectDatabase()`.
  * **Assessment Controller (`assessment.controller.ts`):** Dynamic seed lookup via `getAssessmentSeed(code)` with atomic MongoDB upsert (`{ upsert: true }`).
* **Purpose & Architectural Rationale:**
  * Eliminates 404 errors during deployments or testing on empty databases. Ensures that all 540 questions and 15 wellness categories are always available to the client, maximizing platform availability and developer convenience.
