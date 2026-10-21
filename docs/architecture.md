# Architecture

AuraWell AI is an npm-workspaces monorepo with two packages: `client` (React SPA)
and `server` (Express API). This document explains how the pieces fit together and
where to make changes.

## High-level shape

```
┌──────────────────────────┐        HTTPS / JSON        ┌─────────────────────────────┐
│  React SPA (client)      │  ───────────────────────▶  │  Express API (server)       │
│  • AppShell + routing    │        credentials:        │  • session + CSRF + limiter │
│  • feature services      │        'include'           │  • zod validation           │
│  • zustand auth store    │  ◀───────────────────────  │  • services (domain logic)  │
└──────────────────────────┘    { data } / { error }    │  • Mongoose models          │
                                                        │  • AI provider abstraction  │
                                                        └──────────────┬──────────────┘
                                                                       │
                                                        ┌──────────────▼──────────────┐
                                                        │  MongoDB                     │
                                                        └──────────────────────────────┘
```

The browser never talks to an AI provider directly. All model calls happen
server-side and only when the user has granted consent.

## Server

```
server/src/
├── server.ts            Process entry: connect DB, start HTTP listener
├── app.ts               Express app assembly (helmet, cors, parsers, routes)
├── config/              env parsing, database connection, session middleware, logger
├── middleware/          auth (requireAuth/requireUser), error, csrf, validate, rateLimit
├── models/              Mongoose schemas + DTO mappers (one file per aggregate)
├── validators/          shared zod schemas (auth, onboarding, preferences)
├── routes/              thin routers; index.ts mounts every feature router
├── controllers/         HTTP handlers: parse request, call a service, shape response
├── services/            domain logic; the only place models are queried
├── repositories/        (reserved for specialised queries)
├── ai/                  AI provider abstraction + factory
├── data/                static seed/content data (assessments, games, wellness content)
├── scripts/             seeders and maintenance scripts
└── utils/               http envelope, pagination, dates, age groups, password, logger
```

### Layering rules

- **Controllers** do not query models directly; they call a service.
- **Services** encapsulate all business rules and persistence for one domain.
- **Models** own schema shape and expose `to*Dto` mappers so raw documents never
  leak fields such as `passwordHash`.
- **Routes** stay declarative: path + validation + handler.

### Request lifecycle

1. `helmet`, CORS (allow-listed `CLIENT_ORIGIN`, `credentials: true`).
2. Body parser + `cookie-parser`.
3. Session middleware (`express-session` backed by `connect-mongo`).
4. API rate limiter (`apiLimiter`).
5. CSRF middleware (double-submit cookie) on non-safe methods.
6. Feature router → `requireAuth` → zod `validate` → controller → service.
7. Responses are wrapped by `ok()`; thrown `HttpError`s (and `ZodError`s) are mapped
   by the central error middleware.

### Domain services

| Service                             | Responsibility                                                          |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `auth.service`                      | Registration, login, logout, password reset, session shaping            |
| `assessmentEngine.service`          | Deterministic scoring of submitted answers into tags, indicators, plans |
| `actionPlan.service`                | Enriches engine suggestions and persists recommendations                |
| `progress.service`                  | XP curve, levels, daily streaks (shared by games and trackers)          |
| `wellness.service`                  | `touchDailyActivity` — the single XP/streak entry point for trackers    |
| `mood/journal/sleep/activity/habit` | Per-tracker CRUD + summaries and trends                                 |
| `gameProgress.service`              | Server-authoritative game rewards (XP computed from score/difficulty)   |
| `recommendation.service`            | List/update recommendations, feedback                                   |
| `counseling.service`                | Session/message orchestration, safety precedence, consent gating        |
| `safety.service`                    | Deterministic crisis/boundary screening and canned responses            |
| `analytics.service`                 | Aggregated non-diagnostic overview and trend series                     |
| `privacy.service`                   | Consent summary, data counts, and full user data export                 |
| `notification.service`              | In-app notifications with preference-aware creation                     |

### The AI layer

`server/src/ai/` defines a provider contract so the rest of the codebase is
model-agnostic:

- `types.ts` — `ChatProvider` (`name`, `isConfigured`, `complete`), request/result types.
- `openaiProvider.ts` — OpenAI-compatible HTTP provider with an `AbortController`
  timeout; degrades to the fallback on missing key, non-OK response, empty content,
  or any thrown error.
- `fallbackProvider.ts` — deterministic, hash-seeded reflective replies; always available.
- `index.ts` — memoized `getChatProvider()`, plus `setChatProvider()` as a test seam.

Configuration is environment-driven (`AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`,
`AI_BASE_URL`, `AI_TIMEOUT_MS`). When `AI_PROVIDER=none` or the key is empty, the
fallback provider is used and no network request is ever made.

### The determination order for a chat message

1. **Safety screen** (always): crisis or boundary content returns a canned,
   non-diagnostic response with region-specific resources; a safety flag is recorded.
2. **Children**: curated activities only; the provider is never invoked.
3. **Consent + configured provider**: the real model is used.
4. **Otherwise**: the deterministic fallback provider replies.

This ordering makes the safety and privacy guarantees independent of model behaviour.

## Client

```
client/src/
├── main.tsx / App.tsx     App bootstrap and providers
├── routes/                AppRoutes, RequireAuth
├── layouts/AppShell.tsx   Authenticated shell: nav, notifications, XP/streak, footer
├── pages/                 Route-level screens
├── features/              Feature folders (components, services, types)
│   ├── authentication/    Login, register, forgot password
│   ├── onboarding/        First-run flow
│   ├── assessments/       Runner + result views
│   ├── games/             Game registry, shells, and 12 mini-games
│   ├── wellness/          Shared tracker helpers (charts, rewards, service)
│   ├── counseling/        AURA chat UI + service
│   ├── analytics/         Insights dashboard pieces + WellnessGalaxy
│   ├── recommendations/    Recommendation service + kind→route mapping
│   ├── notifications/     Bell dropdown + service
│   └── privacy/           Settings and Privacy centre
├── components/
│   ├── ui/                Design-system primitives (button, card, alert, …)
│   └── navigation/        navConfig (age-adaptive labels)
├── stores/auth.ts         zustand store: user, init, login/logout, setUser
├── hooks/useAsync.ts      Sanctioned data-fetching hook
├── services/api.ts        Typed fetch wrapper (envelope + CSRF + ApiError)
├── utils/                 cn, applyPreferences, age helpers
└── types/                 Shared client types
```

### Data fetching convention

All reads use `useAsync(loader, deps)` which runs the loader asynchronously, guards
against stale runs, and exposes `reload()`. Writes call a feature service and then
`reload()`. The `api` service attaches credentials and the CSRF header automatically
and unwraps the `{ data }` envelope, throwing `ApiError` on `{ error }`.

### React Compiler constraints

The project enables the React Compiler lint rules. In particular:

- No synchronous `setState` inside effect bodies (`react-hooks/set-state-in-effect`).
- Do not create or select components during render (`react-hooks/static-components`).
  When a component must be chosen dynamically, render it with `createElement(...)`
  inside a module-scope component (see `features/games/GameStage.tsx` and
  `pages/DashboardPage.tsx`).

## Data model (collections)

`User`, `ConsentRecord`, `Goal`, `Assessment`, `AssessmentResponse`, `GameSession`,
`MoodEntry`, `JournalEntry`, `SleepEntry`, `ActivityEntry`, `Habit`, `HabitEntry`,
`Recommendation`, `ChatSession`, `ChatMessage`, `Notification`.

Every user-owned document carries a `userId` and is always queried with that scope;
cross-user access resolves as `404`.
