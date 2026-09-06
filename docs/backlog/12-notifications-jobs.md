# Notifications and scheduled jobs F4–F6

Milestone: M3 · Labels: `pm:queue` · Blocked-by: card-06 (and rebase on card-11 if it landed first — it adds `automation`)

## Scope
`src/flows/application-stage-notify.flow.ts` (record trigger), `src/jobs/credential-expiry-reminder.job.ts`,
`src/jobs/interview-reminder.job.ts`, barrels, wire `flows`/`jobs`. Ensure `'automation'` is in
`requires:` (add it only if card 11 has not). Load `objectstack-automation` (triggers, `defineJob`).

## Spec — DESIGN.md §05
- **F4** trigger `afterUpdate` on `ats_application` when `stage` changed: inbox notification to the
  candidate's `user` with the new stage; set `last_activity_at = now`.
- **F5** daily at 08:00 (business tz): for each `ats_candidate_credential` with `is_expiring == true`
  and `verification_status == 'verified'`, notify the candidate's user once per credential per 30 days
  (dedupe key: credential id + month).
- **F6** hourly: for each `ats_interview` with `status == 'scheduled'` and `scheduled_at` between
  23h and 25h from now, notify the candidate's user and every user in `interviewers`; mark sent via a
  boolean `reminder_sent` added to `ats_interview` (this card owns that one field addition).
Channel: `inbox` only (always-on). No SMS/email configuration.

## Acceptance
- Gates green; `pnpm validate` shows 1 flow + 2 jobs added; changing a stage in `pnpm dev` produces an
  inbox message for the candidate.

## Out of scope
Email/SMS transports, WeChat or push channels, digest settings.
