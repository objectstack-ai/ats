# Security: positions, permission sets, RLS, FLS, bindings, stamp hooks

Milestone: M1 · Labels: `pm:queue` · Blocked-by: card-05

## Scope
`src/security/positions.ts`, `src/security/permission-sets.ts`, `src/security/bind-position-sets.ts`
(pattern: objectstack `examples/app-crm/src/security/`), `src/hooks/*.hook.ts`, wire `positions`,
`permissions`, `hooks` and `onEnable` in `objectstack.config.ts`. Load the `objectstack-data` skill's
`rules/security.md` before starting.

## Spec
**Positions (5):** `platform_admin`, `platform_ops`, `employer_admin`, `employer_recruiter`, `job_seeker`.
**Permission sets (5):** `ats_platform_admin`, `ats_platform_ops`, `ats_employer_admin`,
`ats_employer_recruiter`, `ats_job_seeker` — object grants exactly as the matrix in DESIGN.md §03.
Bind each position to its set in `onEnable` (idempotent).

**Row-level scope (DESIGN.md §03):**
- Employer-side (`ats_employer`, `ats_job`, `ats_application`, `ats_interview` via parent, `ats_offer`,
  `ats_employer_member`): a row is visible when the current user is an **active** `ats_employer_member`
  of the row's employer. Express with the platform's RLS / sharing primitives on the `employer` field
  (`ats_employer_member` is the pivot). If the spec's RLS cannot join through the pivot, return
  `needs_decision` with the fallback (a `member_user_ids` mirror on `ats_employer` maintained by hook).
- Seeker-side: `ats_candidate` where `user == current_user`; `ats_application`/`ats_offer` through that
  candidate; `ats_job` read only where `status == 'published'` (view-level filter, see DESIGN.md §08 Q1).
- Platform roles: org-wide.

**Field-level security (DESIGN.md §03):** `ats_candidate.phone`, `.email` hidden from
`ats_employer_recruiter`; `ats_candidate.expected_salary_min/max` hidden from both employer sets;
`ats_job.review_note` and `ats_employer.verification_note` visible only to the two platform sets.

**Stamp hooks:** `beforeInsert`/`beforeUpdate` on `ats_application` and `ats_offer` copy `employer` from
the job (offer: via application→job); `display_name` mirrors on `ats_employer_member`,
`ats_candidate_credential`, `ats_application`, `ats_interview`, `ats_offer` per the formats in DESIGN.md §02.

## Acceptance
- Gates green; `pnpm validate` shows 5 positions, 5 permission sets.
- A written test or documented REST check: two users, members of different employers, each `GET
  /api/v1/data/ats_application` — neither sees the other's rows. A `job_seeker` reading an `ats_job`
  gets no `review_note` key.

## Out of scope
Views, apps, seeds, flows. Do not add the enterprise hierarchy scopes (`unit_and_below` etc.).
