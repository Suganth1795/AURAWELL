# Privacy & ethics

AuraWell AI handles sensitive personal data and supports people who may be
vulnerable. This document records the principles the product follows and how the
code enforces them. It is intended to be read alongside
[security](security.md) and [architecture](architecture.md).

## Ethical stance

1. **Wellness, not medicine.** AuraWell AI is not a medical device. It does not
   diagnose, treat, or cure any condition. Every user-facing surface carries this
   framing, and no output claims clinical validity.
2. **Support, not replacement.** The AURA companion is a reflective listener. It
   explicitly does not position itself as a doctor or therapist, and it redirects
   medical questions to professionals.
3. **Consent is meaningful.** Data is sent to a third-party model only with an
   explicit, revocable consent. Denying consent degrades gracefully rather than
   removing the feature.
4. **Young people are protected first.** Children never interact with a language
   model in this product and never have their data sent off-device.
5. **Non-competition.** Progress uses gentle XP, levels, and streaks shown only to
   the user themself. There is no leaderboard and no comparison to others. Activity
   tracking deliberately avoids calorie, weight, and ranking framing.

## The consent model

- Consent decisions are recorded as immutable `ConsentRecord` rows
  (`terms_of_service`, `privacy_policy`, `ai_wellness_data`, `guardian_minor`,
  `journal_ai`) with version, source (`self` / `guardian`), and note.
- The live switches are `user.preferences.aiWellnessDataConsent` and
  `journalAiConsent`. Both default to **off**.
- Consent is surfaced and changeable from Settings and the Privacy centre, and the
  full history is shown in the Privacy centre.
- For minors, consent is modelled as guardian-sourced. Child self-registration
  requires `guardianConsent: true` plus terms and privacy acceptance. Recording a
  child consent with `source: 'self'` returns `403 guardian_required`.
- Withdrawing consent immediately changes behaviour: the counseling service stops
  contacting any provider for that user.

## How the AI is constrained

The determination order for every AURA message is fixed and independent of model
behaviour (see `counseling.service.ts`):

1. **Deterministic safety screen** — `safety.service.ts` matches crisis and
   boundary patterns. On a crisis match it returns a **hand-written** response with
   real crisis resources and records a `possible_self_harm` flag. On a medical
   request it returns a boundary-redirect response and records
   `medical_advice_request`. The model is skipped entirely.
2. **Children** — receive curated grounding activities (`source: 'canned'`). No
   provider is invoked.
3. **Consented adults** — a real model may be used, governed by a system prompt
   that forbids diagnosis, prescribing, and crisis handling (which is handled in
   step 1).
4. **Everyone else** — the deterministic fallback provider produces a reflective,
   non-diagnostic reply with **no network access**.

The safety screen is intentionally conservative about _benign_ mentions (e.g. "this
homework is killing me") so it does not over-trigger, while erring toward caution on
clear first-person self-harm language.

### Crisis resources

The product ships verifiable, region-tagged resources and prompts minors to tell a
trusted adult:

| Region        | Name                          | Contact                   |
| ------------- | ----------------------------- | ------------------------- |
| US            | 988 Suicide & Crisis Lifeline | Call or text 988          |
| UK & ROI      | Samaritans                    | Call 116 123 (free, 24/7) |
| International | Find a helpline               | https://findahelpline.com |

These are reviewed as part of maintenance and should be kept current.

## Data minimisation & user control

- Only data needed for the features is collected. Wellness trackers store minutes
  and self-reported quality, not medical measurements.
- Users can review **what is stored** (types and counts) and **download everything**
  via the Privacy centre / `GET /api/privacy/export`. Exports exclude passwords and
  security secrets.
- Account deletion is available in-app and requires password confirmation.
- All user data is scoped by `userId`; other users' records are never reachable.

## Language and framing guidelines for contributors

When adding features, copy, or AI prompts:

- Prefer "reflect", "notice", "support", "check-in" over "assess for", "screen for",
  or "diagnose".
- Never present a score as a clinical result; always include a disclaimer on results.
- Do not use competitive, shaming, or appearance-based metrics.
- Keep crisis handling in the deterministic layer and out of model prompts.
- For children, keep activities concrete, short, and calming; never send their data
  to an external provider.

## Known gaps (tracked honestly)

- Guardian consent for minors is captured and enforced in data, but there is not yet
  an out-of-band guardian verification step.
- In-app notifications are the only channel; no email/SMS is sent.
- The system prompt reduces but cannot guarantee against all model misuse; the
  deterministic layers around it are the primary guarantees.

## Reporting

If you find a safety, privacy, or ethics issue — especially anything that could put
a user at risk — stop and raise it with the maintainers before shipping changes. When
in doubt, prefer the more protective behaviour.
