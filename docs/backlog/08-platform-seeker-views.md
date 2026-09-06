# Platform & seeker views + public application form

Milestone: M2 · Labels: `pm:queue` · Blocked-by: card-06

## Scope
`src/views/employer.view.ts`, `report.view.ts`, `skill.view.ts`, `credential-type.view.ts`,
`candidate-credential.view.ts`; extend `job.view.ts` / `application.view.ts` from card 07 (rebase on it
if it landed; otherwise coordinate through the PM). Load `objectstack-ui`.

## Spec
**Platform:** `ats_employer` grid + `listViews.pending_verification` (`verification_status == 'pending'`),
form with verification section (docs, status, note); `ats_job.listViews.pending_review`;
`ats_report` grid (subject, target_type, reason, status, reporter) + `listViews.open`
(`status in ['new','investigating']`); dictionary grids for `ats_skill`, `ats_credential_type`.

**Seeker:** `ats_job.listViews.search` — grid over `status == 'published'` only, columns title,
employer, city, work_mode, salary_min, salary_max, employment_type; `ats_application.listViews.mine`
as timeline ordered by `applied_at`; `ats_interview.listViews.mine` calendar; `ats_candidate` profile
`formViews.profile` (all fields, salary section last); `ats_candidate_credential` grid.

**Public application form** — on `ats_application.formViews.apply_public`: `type: 'simple'`,
`sharing: { enabled: true, allowAnonymous: true, publicLink: '/apply' }`, fields limited to job,
cover_letter, resume_snapshot plus candidate identity fields the platform's public-form contract allows;
`submitBehavior: { kind: 'thank-you', … }`. Guest grant (INSERT-only on `ats_application`) goes in the
security file as `ats_guest_apply`. If the public-form contract cannot create the linked `ats_candidate`
in the same submission, return `needs_decision` with the two options (two-step apply, or a lightweight
`ats_inquiry` object).

## Acceptance
- Gates green; `GET /api/v1/forms/apply` returns the whitelisted schema; anonymous POST creates a row
  and no read is possible.

## Out of scope
Navigation/apps, dashboards, translations.
