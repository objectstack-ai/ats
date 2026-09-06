# Candidate domain: `ats_candidate`, `ats_candidate_credential`

Milestone: M1 · Labels: `pm:queue` · Blocked-by: — (builds on the initial commit)

## Scope
`src/objects/candidate.object.ts`, `src/objects/candidate-credential.object.ts`, export both from
`src/objects/index.ts` **after** the dictionaries and before the employer domain block.

## Spec — pinned in DESIGN.md §02, repeated here where a choice exists
**`ats_candidate`** — `sharingModel: 'private'`, `nameField: 'full_name'`, icon `user-round`.
Fields exactly as DESIGN.md §02: `full_name*` text searchable · `user` Field.user · `avatar` image ·
`phone` · `email` · `city` searchable · `experience_years` number min 0 · `education` select with the
**same values as `ats_job.education_min`** (`none/high_school/associate/bachelor/master/doctorate`) ·
`current_title` · `current_employer` · `skills` lookup `ats_skill` multiple · `summary` textarea ·
`resume_file` file · `expected_salary_min` / `expected_salary_max` currency · `salary_period` select
`monthly/yearly/hourly` default `monthly` · `seeking_status` select `actively_looking/open/not_looking`
default `open` · `profile_visibility` select `public/limited/hidden` default `limited`.
Validation: `script` `candidate_salary_range` — fails when
`record.expected_salary_min != null && record.expected_salary_max != null && record.expected_salary_min > record.expected_salary_max`.
`enable: { apiEnabled: true, searchable: true }`.

**`ats_candidate_credential`** — `sharingModel: 'controlled_by_parent'`, `nameField: 'display_name'`, icon `award`.
`display_name` text (stored mirror, description "Stamped as \"<credential> · <level>\" on write") ·
`candidate*` masterDetail `ats_candidate`, `deleteBehavior: 'cascade'`, `inlineEdit: 'grid'`,
`inlineTitle: 'Credentials'` · `credential_type*` lookup `ats_credential_type` · `level` text ·
`certificate_no` text · `issued_at` date · `expires_at` date · `certificate_file` file ·
`verification_status` select `pending/verified/rejected` default `pending` ·
`is_expiring` formula — true when `expires_at` is within the next 90 days (consult the
`objectstack-formula` skill for the date arithmetic; if CEL cannot express it, return `needs_decision`
with the two options: a stored boolean stamped by the daily job F5, or dropping the field).
State machine on `verification_status`: pending→verified/rejected; rejected→pending; verified terminal.

Mirror maintenance (`display_name`) is **not** in this card — card 06 lands the hooks; seeds fill it directly.

## Acceptance
- Gates green; `pnpm validate` reports 7 objects.
- `pnpm lint` shows no `title-unresolvable` / `missing-name-field` for either object.
- No field named `role`/`position`/`permission_set`/`business_unit`.

## Out of scope
Views, permissions, seeds, hooks.
