# Transaction domain: `ats_application`, `ats_interview`, `ats_offer`, `ats_report`

Milestone: M1 · Labels: `pm:queue` · Blocked-by: card-04

## Scope
`src/objects/application.object.ts`, `interview.object.ts`, `offer.object.ts`, `report.object.ts`;
export in that order at the end of `src/objects/index.ts`.

## Spec
All four: `enable: { apiEnabled: true, searchable: true }`; fields and enum values exactly as DESIGN.md §02.

**`ats_application`** — `private`, `nameField: 'display_name'` (mirror "<candidate> → <job>"), icon `send`.
`job*` lookup `ats_job` · `candidate*` lookup `ats_candidate` · `employer` lookup `ats_employer` with
description "Copied from job.employer on insert; row-level rules key on it" · `stage*` select default
`applied` with colors: applied `#94A3B8`, screening `#3B82F6`, interview `#F59E0B`, offer `#8B5CF6`,
hired `#10B981`, rejected `#EF4444`, withdrawn `#6B7280` · `source` select default `direct` ·
`applied_at` datetime · `resume_snapshot` file · `cover_letter` textarea · `rating` slider min 1 max 5 ·
`rejection_reason` select · `last_activity_at` datetime.
`indexes: [{ fields: ['job', 'candidate'], unique: 'organization' }]`.
State machine `application_stage_transitions` on `stage` exactly as DESIGN.md §02.

**`ats_interview`** — `controlled_by_parent`, `nameField: 'display_name'` (mirror "<candidate> · R<round>"), icon `calendar-clock`.
`application*` masterDetail `ats_application` cascade (no inlineEdit — interviews are a related list,
not line items) · `round` number min 1 default 1 · `scheduled_at*` datetime · `duration_minutes` number
default 60 · `mode` select `onsite/video/phone` default `video` · `location_or_link` text ·
`interviewers` Field.user multiple · `status` select `scheduled/completed/cancelled/no_show` default
`scheduled` · `rating` slider 1–5 · `feedback` textarea.

**`ats_offer`** — `private`, `nameField: 'display_name'` (mirror "Offer · <candidate> · <job>"), icon `file-signature`.
`application*` lookup · `employer` lookup (same RLS note as application) · `salary` currency ·
`salary_period` select default `monthly` · `start_date` date · `status` select default `draft` ·
`approved_by` Field.user · `expires_at` date · `notes` textarea.
State machine `offer_status_transitions` exactly as DESIGN.md §02.

**`ats_report`** — `private`, `nameField: 'subject'`, icon `flag`.
`subject*` text searchable · `target_type*` select `job/candidate/application/employer` · `target_ref*`
text (the target record id; polymorphic on purpose — no four nullable lookups) · `reason` select ·
`description` textarea · `reporter` Field.user default `current_user` · `status` select default `new` ·
`resolution` textarea · `handled_by` Field.user.
State machine on `status`: new→investigating/dismissed; investigating→resolved/dismissed; terminal otherwise.

`employer`/`display_name` stamping hooks are card 06. **Do not add `application_count` to `ats_job`**
(DESIGN.md §02 revisions).

## Acceptance
- Gates green; `pnpm validate` reports 11 objects.
- Unique index present; `pnpm lint` shows no title warnings.

## Out of scope
Hooks, permissions, views, flows.
