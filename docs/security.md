# Security

This document describes AuraWell AI's security posture: how users are
authenticated, how requests are protected, how data is scoped, and how the AI
layer is constrained. It is written for maintainers and reviewers.

## Threat model (summary)

| Concern                           | Mitigation                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------- |
| Credential stuffing / brute force | `express-rate-limit` on auth routes; bcrypt hashing; generic error messages       |
| Session hijacking                 | HttpOnly, SameSite=Lax session cookie; server-side session store                  |
| CSRF                              | Double-submit cookie + `X-CSRF-Token` header on all unsafe methods                |
| XSS                               | React escaping by default; helmet CSP in production; no `dangerouslySetInnerHTML` |
| Cross-user data access            | Every query is scoped by `userId`; foreign ids resolve as `404`                   |
| NoSQL injection                   | zod validation + Mongoose typed schemas; no raw query string interpolation        |
| Secret leakage                    | `passwordHash` and reset tokens are `select: false` and stripped in `toJSON`      |
| Prompt injection / misuse         | Server-side provider only; deterministic safety screen runs first                 |
| Data over-sharing to AI vendor    | AI data consent gate; children never reach a model                                |

## Authentication & sessions

- Passwords are hashed with **bcrypt** (10 rounds). `verifyPassword` uses
  bcrypt's constant-time comparison.
- A password policy requires 8–128 characters with at least one letter and one
  number/symbol (`utils/password.ts`).
- Sessions use **express-session** with a **connect-mongo** store:
  - cookie name `aurawell.sid`
  - `httpOnly: true`, `sameSite: 'lax'`, `secure: true` in production
  - one-week lifetime; sessions are not saved uninitialized.
- `requireAuth` loads the session user and rejects missing or soft-deleted
  accounts, destroying the session on failure. `optionalAuth` loads the user when
  present but never rejects.
- Password reset uses a random token stored only as a **SHA-256 hash**; comparison
  is constant-time (`tokensMatch`).

## CSRF protection

The API is same-origin with the SPA and uses cookies, so it implements a
**double-submit cookie** pattern (`middleware/csrf.ts`):

1. Safe requests (GET/HEAD/OPTIONS) issue a readable `aurawell_csrf` cookie when
   missing.
2. Unsafe requests must echo the cookie value in the `X-CSRF-Token` header.
3. Requests whose header does not match the cookie are rejected with `403 csrf_invalid`.

Because cross-site forms cannot set custom headers, this blocks classic CSRF while
keeping the SPA simple. The client bootstraps the cookie via `GET /api/csrf`.

## Transport & headers

- `helmet` is enabled. In production a restrictive `Content-Security-Policy` is
  applied (`default-src 'self'`, `img-src 'self' data:`); the CSP is disabled in
  development to accommodate the Vite dev server.
- `x-powered-by` is disabled.
- CORS is restricted to the allow-list in `CLIENT_ORIGIN` with `credentials: true`.
- Request bodies are capped at **100 kb**.
- `trust proxy` is configurable via `TRUST_PROXY` for reverse-proxy deployments.

## Rate limiting

- `apiLimiter` guards the whole `/api` tree.
- `authLimiter` guards authentication endpoints with a tighter budget.
- Limits are relaxed automatically under `NODE_ENV=test` so the suite is not
  throttled.

## Input validation & errors

- Every route validates inputs with **zod** (params, query, body) before the
  controller runs.
- `ZodError` is mapped to `400 validation_error` with per-field details.
- Domain errors use `HttpError(status, message, code, details)`.
- The central handler returns a consistent `{ error: { message, code, details? } }`
  envelope and never leaks stack traces or internal messages (unexpected errors
  become `500 internal_error` after being logged).

## Data scoping & privacy

- All user-owned documents carry `userId`. Services filter by it on every read and
  write; accessing another user's resource returns `404` (never `403`, to avoid
  confirming existence).
- `toUserPublicDto` and every model `toJSON` transform strip `passwordHash` and
  reset secrets.
- Account deletion is a **soft delete**: the account is marked `deleted`, the
  email is obfuscated, and the session is destroyed. The data export endpoint
  (`GET /api/privacy/export`) returns everything stored about the user, without
  secrets.

## AI-specific controls

The AI layer is deliberately constrained (see also
[privacy & ethics](privacy-ethics.md)):

- Model calls occur **only** server-side; the browser never holds provider keys.
- A **deterministic safety screen** (`safety.service`) always runs first and can
  fully bypass the model for crisis or medical-advice content.
- **Consent gate**: wellness data is sent to a third-party provider only when
  `user.preferences.aiWellnessDataConsent` is true. Otherwise the deterministic
  fallback provider replies.
- **Child protection**: child accounts never reach a model; they receive curated
  activities.
- The provider degrades gracefully on timeout, non-OK responses, empty content, or
  errors, falling back rather than failing the request.
- `AI_TIMEOUT_MS` bounds every outbound request via `AbortController`.

## Environment & secrets

- Configuration is parsed and validated at boot by `config/env.ts`. Invalid
  configuration fails fast.
- `SESSION_SECRET` must be at least 32 characters in production.
- `.env` is git-ignored; `.env.example` documents every variable without secrets.

## Known limitations / production hardening

- The guardian workflow for minors is represented in data (consent records with
  `source: 'guardian'`) but does not yet include out-of-band guardian verification.
- In-app notifications are stored only; no email/SMS delivery channel is wired up.
- Multi-instance deployments should move rate-limit state to a shared store and
  ensure `TRUST_PROXY` is set correctly.
