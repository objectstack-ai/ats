# Seed data: `demo-en` and `demo-zh`

Milestone: M2 · Labels: `pm:queue` · Blocked-by: card-05

## Scope
`src/data/demo-en/*.seed.ts`, `src/data/demo-zh/*.seed.ts`, `src/data/index.ts` selecting by
`OS_SEED_LOCALE` (default `en`); wire `data` in `objectstack.config.ts`. Load `objectstack-data`
§Seed Data (`defineSeed()`, `externalId`, relationship references by natural key, dynamic CEL dates).

## Spec — counts and shape per DESIGN.md §06
Dictionaries first (60 skills across the 5 categories; 15 credential types with realistic issuers and
`validity_months`), then 12 employers (industries spread across the enum; 2 `pending`, 1 `suspended`),
40 jobs (all statuses; 6 `pending_review`; 4 featured; salary ranges plausible per role), 80 candidates
(avatars via data URIs or a stable placeholder service is **not** allowed — leave `avatar` empty rather
than hot-link), 200 applications distributed **exactly** applied 88 · screening 46 · interview 28 ·
offer 14 · hired 9 · rejected 15, 40 interviews with `scheduled_at` spread over the **next 14 days from
seed time** (dynamic CEL, not fixed dates), 14 offers (3 `pending_approval`), 6 reports, 30 candidate
credentials (5 expiring within 90 days), employer members: 1 admin + 1–2 recruiters per employer.
`display_name` mirrors and `employer` denormalised fields are filled explicitly in the seed.
`demo-zh` mirrors `demo-en` row for row with Chinese company/candidate/job names and cities.
No real company or person names; no vertical-industry object or field names.

## Acceptance
- Gates green; `pnpm dev` boots with the seed; kanban shows the funnel; calendar shows upcoming interviews.
- Switching `OS_SEED_LOCALE=zh` boots the Chinese set.

## Out of scope
Views, translations of labels (that is i18n, card 14).
