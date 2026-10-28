# AuraWell AI

AuraWell AI is a full-stack, AI-assisted mental **wellness** platform. It combines
structured self-assessments, gentle daily trackers, reflective mini-games, and a
supportive chat companion ("AURA") into one age-adaptive experience for children,
teens, adults, and older adults.

> **AuraWell AI supports wellness reflection and education. It is not a medical
> device and does not diagnose, treat, or cure any condition. In an emergency,
> contact local emergency services.**

## Why it is built this way

- **Non-diagnostic by design.** Every assessment, chart, and AI reply is framed as
  reflection, never diagnosis. A deterministic privacy and safety layer always runs
  before (and independently of) any language model.
- **Consent-first AI.** Wellness data is never sent to a third-party model unless the
  user has explicitly granted AI data consent. With consent off, AURA replies with a
  deterministic, on-device-equivalent fallback.
- **Age-adaptive.** Children never reach a language model and instead receive curated,
  grounding activities; wording and navigation adapt per age group.
- **Private by default.** Self-hosted sessions, per-user data scoping, an export
  endpoint, and soft account deletion are built in from the start.

## Tech stack

| Layer  | Technology                                                                             |
| ------ | -------------------------------------------------------------------------------------- |
| Client | React 19, Vite, TypeScript, Tailwind CSS v4, zustand, react-router, base-ui            |
| Server | Node.js, Express 5, TypeScript, Mongoose 9, zod, pino, express-session + connect-mongo |
| Data   | MongoDB                                                                                |
| AI     | Pluggable provider (OpenAI-compatible HTTP) with a deterministic fallback              |
| Tests  | Vitest + Supertest (server), Vitest + Testing Library (client)                         |

## Repository layout

```
aurawell-ai/
├── client/        React single-page app (Vite)
├── server/        Express API, Mongoose models, services, AI layer
├── docs/          Architecture, security, API, and privacy/ethics documentation
└── .env.example   Environment template (copy to .env)
```

## Getting started

Prerequisites: Node.js 20+ and a MongoDB instance (local Docker or Atlas).

```bash
# 1. Install dependencies (npm workspaces)
npm install

# 2. Configure environment
cp .env.example .env
#    - set MONGODB_URI
#    - set SESSION_SECRET (>= 32 random chars)
#    - leave AI_API_KEY empty to run in deterministic fallback mode

# 3. Seed the assessment catalogue (idempotent)
MONGODB_URI="mongodb://localhost:27017/aurawell" npm run seed

# 4. Run the client and server together
npm run dev
```

- Client dev server: http://localhost:5173
- API server: http://localhost:4000

### Scripts

| Command             | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| `npm run dev`       | Run client + server in watch mode                                |
| `npm run build`     | Type-check and build both packages for production                |
| `npm start`         | Start the built server                                           |
| `npm run typecheck` | Type-check client then server                                    |
| `npm run lint`      | ESLint across the monorepo                                       |
| `npm test`          | Run server then client test suites                               |
| `npm run seed`      | Seed the assessment catalogue (`-w server`)                      |
| `npm run test:e2e`  | Run Playwright end-to-end tests (needs `npx playwright install`) |

## Documentation

- [Project overview and PPT content](docs/project-overview.md) — consolidated feature, technology, purpose, architecture, and presentation guide
- [Architecture](docs/architecture.md) — how the client, API, services, and AI layer fit together
- [Security](docs/security.md) — authentication, sessions, CSRF, rate limiting, and data handling
- [API reference](docs/api.md) — endpoints, envelopes, and error codes
- [Privacy & ethics](docs/privacy-ethics.md) — consent model, safety screening, and non-diagnostic policy

## License

Private project. All rights reserved.
