# API reference

Base path: `/api`. All responses are JSON.

## Envelope

Success:

```json
{ "data": { ... } }
```

Error:

```json
{ "error": { "message": "Human readable", "code": "machine_code", "details": [] } }
```

Common error codes: `unauthenticated` (401), `csrf_invalid` (403), `not_found`
(404), `validation_error` (400), `rate_limited` (429), `internal_error` (500),
and feature-specific codes noted below.

## Conventions

- **Auth**: session cookie (`aurawell.sid`). Send `credentials: 'include'`.
- **CSRF**: call `GET /api/csrf` once; then send the `aurawell_csrf` cookie value in
  the `X-CSRF-Token` header on every `POST`, `PUT`, `PATCH`, `DELETE`.
- **Pagination**: `?page=&limit=` on list endpoints; responses include
  `{ items, page, limit, total, totalPages }`.
- **Dates**: day keys are `YYYY-MM-DD` (UTC); timestamps are ISO 8601 UTC.
- **IDs**: 24-character hex MongoDB ObjectIds.

---

## Health

| Method | Path          | Auth | Description          |
| ------ | ------------- | ---- | -------------------- |
| GET    | `/api/health` | no   | Liveness + timestamp |

## Auth — `/api/auth`

| Method | Path                      | Auth | Description                |
| ------ | ------------------------- | ---- | -------------------------- |
| POST   | `/register`               | no   | Create account (see below) |
| POST   | `/login`                  | no   | Start session              |
| POST   | `/logout`                 | no   | End session                |
| GET    | `/me`                     | yes  | Current user               |
| POST   | `/request-password-reset` | no   | Request a reset token      |
| POST   | `/reset-password`         | no   | Complete a reset           |
| PUT    | `/password`               | yes  | Change password            |

Registration requires `consents.termsOfService` and `consents.privacyPolicy`;
child accounts (`ageGroup: "child"`, derived from `birthYear`) additionally require
`guardianConsent: true` and, if AI is to be used, a guardian consent record.

## Users — `/api/users` (auth required)

| Method | Path              | Description                                            |
| ------ | ----------------- | ------------------------------------------------------ |
| GET    | `/profile`        | Public profile DTO                                     |
| PATCH  | `/profile`        | Update display name / birth year                       |
| PUT    | `/preferences`    | Update theme, accessibility, notifications, AI consent |
| PUT    | `/onboarding`     | Complete onboarding (creates goals)                    |
| GET    | `/consent`        | List consent records                                   |
| POST   | `/consent`        | Record a consent decision                              |
| GET    | `/goals`          | List goals                                             |
| POST   | `/goals`          | Create a goal                                          |
| PATCH  | `/goals/:id`      | Update a goal                                          |
| POST   | `/account/delete` | Soft-delete the account (requires password)            |

## Assessments — `/api/assessments` (auth required)

| Method | Path               | Description                                        |
| ------ | ------------------ | -------------------------------------------------- |
| GET    | `/`                | Catalogue available to the user's age group        |
| GET    | `/responses`       | User's past results                                |
| GET    | `/responses/:id`   | A single result                                    |
| GET    | `/:code`           | Runnable assessment (no tags/weights leaked)       |
| POST   | `/:code/responses` | Submit answers → structured, non-diagnostic result |

Submitting returns summary, priorities, indicators, enriched suggestions, a
7-day plan, and a disclaimer; it also persists recommendations.

## Games (MindPlay) — `/api/games` (auth required)

| Method | Path        | Description                                     |
| ------ | ----------- | ----------------------------------------------- |
| GET    | `/`         | Game catalogue for the user's age group         |
| GET    | `/sessions` | Recent game sessions                            |
| GET    | `/stats`    | Per-game stats (no leaderboard)                 |
| GET    | `/:code`    | Game detail (mechanic + settings)               |
| POST   | `/sessions` | Submit a result; **XP is computed server-side** |

Result body: `{ gameCode, difficulty, score, maxScore, durationSeconds,
completed, summary?, idempotencyKey? }`. Supplying the same `idempotencyKey`
again returns the prior outcome without granting XP twice. Age-restricted games
return `403 age_restricted`.

## Wellness — `/api/wellness` (auth required)

### Mood

| Method | Path          | Description                        |
| ------ | ------------- | ---------------------------------- |
| POST   | `/mood`       | Log a mood entry (grants daily XP) |
| GET    | `/mood/today` | Today's entries                    |
| GET    | `/mood/trend` | `?days=2..90` daily averages       |
| GET    | `/mood`       | Paginated history (`from`/`to`)    |
| DELETE | `/mood/:id`   | Delete an entry                    |

### Journal

| Method | Path               | Description                     |
| ------ | ------------------ | ------------------------------- |
| GET    | `/journal/prompts` | Reflective prompts              |
| POST   | `/journal`         | Create an entry                 |
| GET    | `/journal`         | Paginated list (`tag`/`search`) |
| GET    | `/journal/:id`     | A single entry                  |
| PATCH  | `/journal/:id`     | Update an entry                 |
| DELETE | `/journal/:id`     | Soft-delete an entry            |

### Sleep

| Method | Path             | Description                                   |
| ------ | ---------------- | --------------------------------------------- |
| POST   | `/sleep`         | Log sleep (validates cross-midnight duration) |
| GET    | `/sleep/summary` | `?days=` averages + series                    |
| GET    | `/sleep`         | Paginated history                             |
| DELETE | `/sleep/:id`     | Delete a night                                |

### Activity

| Method | Path                | Description                 |
| ------ | ------------------- | --------------------------- |
| POST   | `/activity`         | Log activity (minutes only) |
| GET    | `/activity/summary` | `?days=` totals + series    |
| GET    | `/activity`         | Paginated history           |
| DELETE | `/activity/:id`     | Delete an entry             |

### Habits

| Method | Path                  | Description                 |
| ------ | --------------------- | --------------------------- |
| GET    | `/habits`             | List habits with progress   |
| POST   | `/habits`             | Create a habit              |
| PATCH  | `/habits/:id`         | Update / archive a habit    |
| POST   | `/habits/:id/entries` | Toggle completion for a day |
| DELETE | `/habits/:id`         | Delete a habit              |

## Recommendations — `/api/recommendations` (auth required)

| Method | Path   | Description                                               |
| ------ | ------ | --------------------------------------------------------- |
| GET    | `/`    | `?status=&kind=&limit=` score-sorted list                 |
| PATCH  | `/:id` | Update `status` (accepted/dismissed/completed) + feedback |

## AURA counseling — `/api/counseling` (auth required)

| Method | Path                     | Description                                        |
| ------ | ------------------------ | -------------------------------------------------- |
| GET    | `/intro`                 | Disclaimer, crisis resources, suggested activities |
| GET    | `/sessions`              | List conversations                                 |
| POST   | `/sessions`              | Create a conversation                              |
| GET    | `/sessions/:id`          | Conversation + messages                            |
| POST   | `/sessions/:id/messages` | Send a message, receive a reply                    |
| POST   | `/sessions/:id/close`    | Close a conversation                               |
| DELETE | `/sessions/:id`          | Delete a conversation                              |

Each assistant message carries `safetyLevel` (`none` / `crisis_support` /
`boundary_redirect`) and `source` (`llm` / `fallback` / `canned`). Crisis messages
return canned resources and record a safety flag; sending to a closed session
returns `400 session_closed`.

## AI status — `/api/ai` (auth required)

| Method | Path      | Description                |
| ------ | --------- | -------------------------- |
| GET    | `/status` | `{ provider, configured }` |

## Analytics — `/api/analytics` (auth required)

| Method | Path        | Description                                              |
| ------ | ----------- | -------------------------------------------------------- |
| GET    | `/overview` | `?days=7..90` aggregated totals, trends, latest check-in |

## Privacy — `/api/privacy` (auth required)

| Method | Path        | Description                                                |
| ------ | ----------- | ---------------------------------------------------------- |
| GET    | `/overview` | Consent summary + per-type data counts + account status    |
| GET    | `/export`   | Full JSON export of the user's data (download; no secrets) |

## Notifications — `/api/notifications` (auth required)

| Method | Path        | Description                               |
| ------ | ----------- | ----------------------------------------- |
| GET    | `/`         | `?limit=&unreadOnly=` list + unread count |
| POST   | `/read-all` | Mark all read                             |
| POST   | `/:id/read` | Mark one read                             |
| DELETE | `/:id`      | Delete a notification                     |
