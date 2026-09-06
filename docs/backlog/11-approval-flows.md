# Approval flows F1–F3 + `automation` capability

Milestone: M3 · Labels: `pm:queue` · Blocked-by: card-06

## Scope
`src/flows/employer-verification.flow.ts`, `job-publish-review.flow.ts`, `offer-approval.flow.ts`,
barrel, wire `flows`; add `'automation'` to `requires:` in `objectstack.config.ts` (this card is the one
that expands that capability — no other dependency changes). Load `objectstack-automation` (approvals,
approval-as-flow-node) and study objectstack `examples/app-showcase/src/automation/flows/`.

## Spec — DESIGN.md §05
- **F1 `employer_verification`**: entry when `ats_employer.verification_status` becomes `pending`;
  step 1 approver = position `platform_ops`; step 2 = `platform_admin`; approve → set `verified`, notify
  employer owner (inbox); reject → set `rejected`, copy the reviewer's comment to `verification_note`
  and a seeker-visible reason is **not** exposed (note is platform-internal).
- **F2 `job_publish_review`**: entry on `ats_job.status` → `pending_review`; single approver position
  `platform_ops`; approve → `published` + `published_at = now`; reject → `rejected` + `rejection_reason`
  from the reviewer comment; notify the job's employer members with `access_level == 'admin'`.
- **F3 `offer_approval`**: entry on `ats_offer.status` → `pending_approval`; approver = the
  `employer_admin` members of the offer's employer; approve → `approved`; reject → `draft`; notify submitter.
All transitions must be legal under the state machines in DESIGN.md §02 — do not widen them.

## Acceptance
- Gates green; `pnpm validate` shows 3 flows; the three approvals appear in the approver's queue in
  `pnpm dev`; a rejected job carries `rejection_reason`.

## Out of scope
Email channel configuration; F4–F6.
