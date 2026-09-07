import { definePermissionSet } from '@objectstack/spec/security';

/**
 * The five capability containers, one per position (DESIGN.md §03).
 *
 * ## How employer isolation actually works
 *
 * Each employer is backed by a platform **organization**; its staff are members
 * of that organization. Every employer-side object carries a denormalised
 * `employer_org` scalar, stamped on write, and the policies below compare it to
 * the caller's organization memberships:
 *
 *     record.employer_org in current_user.employer_org_ids
 *
 * The indirection is forced, not stylistic: RLS predicates are canonical CEL
 * comparing a FIELD to a `current_user.*` placeholder, and cross-object
 * traversal is a compile error (ADR-0055) — "is the caller a member of this
 * row's employer" cannot be expressed by walking the lookup.
 *
 * `employer_org_ids` is the caller's whole org access set — the kernel's
 * `accessible_org_ids` (ADR-0105 D2), republished by the app-owned membership
 * resolver in `rls-membership-resolver.ts`. It is not the single active org,
 * so a recruiter placed at two employers sees both without switching context.
 * An authenticated caller with no membership resolves to the EMPTY set, which
 * fails the policy closed — zero rows, never fail-open.
 *
 * Why not `current_user.accessible_org_ids` directly: the RLS compiler never
 * populates it, so a policy naming it reads an undefined variable, is dropped,
 * and the request returns zero rows silently (objectstack#16518); and the key
 * is reserved, so a resolver may not supply it. The resolver module carries
 * the full account.
 *
 * ## Why the grants carry `readScope: 'org'`
 *
 * On a `private` OWD object an `allowRead` grant without a scope means
 * owner-only — a recruiter would not see an application a colleague created,
 * which is not a marketplace, it is a set of private inboxes. `readScope: 'org'`
 * widens the OWNER match to org-wide, and the policies below then narrow it
 * back to the caller's employer. Composition order is the point: OWD sets the
 * baseline, the scope widens it, RLS is the boundary that actually holds.
 * (`own` and `org` are the two open-source scopes; the hierarchy-relative ones
 * need the paid security plugin and fail closed to `own` without it.)
 *
 * The objects deliberately do **not** set `tenancy: { enabled: true }`. That
 * wall is absolute and org-equality based, so it would also hide a job seeker's
 * own application from them — the seeker is not a member of the employer's
 * organization. Business RLS lets the two audiences carry different policies
 * over the same rows, which is exactly the marketplace shape.
 */

/** Runs the platform. Org-wide reach on everything. */
export const PlatformAdminSet = definePermissionSet({
  name: 'ats_platform_admin',
  label: 'Platform Administrator',
  description: 'Full reach over every ATS object, org-wide.',
  // Unlocks the Platform navigation group of the `ats` app (DESIGN.md §04).
  systemPermissions: ['ats_platform.access'],
  objects: {
    ats_employer:             { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    ats_employer_member:      { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    ats_job:                  { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    ats_candidate:            { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    ats_candidate_credential: { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    ats_application:          { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    ats_interview:            { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    ats_offer:                { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    ats_report:               { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
    ats_skill:                { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true },
    ats_credential_type:      { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true },
  },
});

/**
 * Works the review queues. Reads everything (that is the job — verifying an
 * employer means reading its documents), but creates and deletes nothing on
 * the employer's behalf.
 */
export const PlatformOpsSet = definePermissionSet({
  name: 'ats_platform_ops',
  label: 'Platform Operations',
  description: 'Reviews employers, jobs and reports; maintains the shared dictionaries.',
  systemPermissions: ['ats_platform.access'],
  objects: {
    ats_employer:             { allowRead: true, allowEdit: true, viewAllRecords: true },
    ats_employer_member:      { allowRead: true, viewAllRecords: true },
    ats_job:                  { allowRead: true, allowEdit: true, viewAllRecords: true },
    ats_candidate:            { allowRead: true, viewAllRecords: true },
    ats_candidate_credential: { allowRead: true, allowEdit: true, viewAllRecords: true },
    ats_application:          { allowRead: true, viewAllRecords: true },
    ats_interview:            { allowRead: true, viewAllRecords: true },
    ats_offer:                { allowRead: true, viewAllRecords: true },
    ats_report:               { allowRead: true, allowEdit: true, viewAllRecords: true },
    ats_skill:                { allowRead: true, allowCreate: true, allowEdit: true },
    ats_credential_type:      { allowRead: true, allowCreate: true, allowEdit: true },
  },
});

/** Runs one employer's hiring. Scoped to its own organization by RLS. */
export const EmployerAdminSet = definePermissionSet({
  name: 'ats_employer_admin',
  label: 'Employer Administrator',
  description: "Manages one employer's staff, jobs, pipeline and offers.",
  // Unlocks the Hiring navigation group of the `ats` app (DESIGN.md §04).
  systemPermissions: ['ats_employer.access'],
  objects: {
    ats_employer:             { allowRead: true, allowEdit: true, readScope: 'org', writeScope: 'org' },
    ats_employer_member:      { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, readScope: 'org', writeScope: 'org' },
    ats_job:                  { allowRead: true, allowCreate: true, allowEdit: true },
    ats_candidate:            { allowRead: true, readScope: 'org' },
    ats_candidate_credential: { allowRead: true, readScope: 'org' },
    ats_application:          { allowRead: true, allowEdit: true, readScope: 'org', writeScope: 'org' },
    ats_interview:            { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, readScope: 'org', writeScope: 'org' },
    ats_offer:                { allowRead: true, allowCreate: true, allowEdit: true, readScope: 'org', writeScope: 'org' },
    ats_report:               { allowCreate: true },
    ats_skill:                { allowRead: true },
    ats_credential_type:      { allowRead: true },
  },
  // Expected salary stays sealed from the employer side until the candidate
  // opens it — knowing the number before negotiating is the whole asymmetry.
  fields: {
    'ats_candidate.expected_salary_min': { readable: false, editable: false },
    'ats_candidate.expected_salary_max': { readable: false, editable: false },
    'ats_job.review_note':               { readable: false, editable: false },
    'ats_employer.verification_note':    { readable: false, editable: false },
  },
  rowLevelSecurity: [
    { name: 'employer_admin_employer',    object: 'ats_employer',        operation: 'all',
      using: 'record.organization in current_user.employer_org_ids',
      check: 'record.organization in current_user.employer_org_ids' },
    { name: 'employer_admin_members',     object: 'ats_employer_member', operation: 'all',
      using: 'record.employer_org in current_user.employer_org_ids',
      check: 'record.employer_org in current_user.employer_org_ids' },
    { name: 'employer_admin_jobs',        object: 'ats_job',             operation: 'all',
      using: 'record.employer_org in current_user.employer_org_ids',
      check: 'record.employer_org in current_user.employer_org_ids' },
    { name: 'employer_admin_applications', object: 'ats_application',    operation: 'all',
      using: 'record.employer_org in current_user.employer_org_ids',
      check: 'record.employer_org in current_user.employer_org_ids' },
    { name: 'employer_admin_offers',      object: 'ats_offer',           operation: 'all',
      using: 'record.employer_org in current_user.employer_org_ids',
      check: 'record.employer_org in current_user.employer_org_ids' },
  ],
});

/**
 * Works the pipeline. Same row scope as the admin, a narrower field scope:
 * contact details are the part of a résumé that is worth scraping in bulk, so
 * they open only to the employer administrator, whose reads are attributable.
 */
export const EmployerRecruiterSet = definePermissionSet({
  name: 'ats_employer_recruiter',
  label: 'Recruiter',
  description: "Works one employer's pipeline. No candidate contact details, no salary expectations.",
  systemPermissions: ['ats_employer.access'],
  objects: {
    ats_employer:             { allowRead: true, readScope: 'org' },
    ats_employer_member:      { allowRead: true, readScope: 'org' },
    ats_job:                  { allowRead: true, allowCreate: true, allowEdit: true },
    ats_candidate:            { allowRead: true, readScope: 'org' },
    ats_candidate_credential: { allowRead: true, readScope: 'org' },
    ats_application:          { allowRead: true, allowEdit: true, readScope: 'org', writeScope: 'org' },
    ats_interview:            { allowRead: true, allowCreate: true, allowEdit: true, readScope: 'org', writeScope: 'org' },
    ats_offer:                { allowRead: true, allowCreate: true, readScope: 'org', writeScope: 'org' },
    ats_report:               { allowCreate: true },
    ats_skill:                { allowRead: true },
    ats_credential_type:      { allowRead: true },
  },
  fields: {
    'ats_candidate.phone':               { readable: false, editable: false },
    'ats_candidate.email':               { readable: false, editable: false },
    'ats_candidate.expected_salary_min': { readable: false, editable: false },
    'ats_candidate.expected_salary_max': { readable: false, editable: false },
    'ats_job.review_note':               { readable: false, editable: false },
    'ats_employer.verification_note':    { readable: false, editable: false },
  },
  rowLevelSecurity: [
    { name: 'recruiter_employer',     object: 'ats_employer',        operation: 'select',
      using: 'record.organization in current_user.employer_org_ids' },
    { name: 'recruiter_members',      object: 'ats_employer_member', operation: 'select',
      using: 'record.employer_org in current_user.employer_org_ids' },
    { name: 'recruiter_jobs',         object: 'ats_job',             operation: 'all',
      using: 'record.employer_org in current_user.employer_org_ids',
      check: 'record.employer_org in current_user.employer_org_ids' },
    { name: 'recruiter_applications', object: 'ats_application',     operation: 'all',
      using: 'record.employer_org in current_user.employer_org_ids',
      check: 'record.employer_org in current_user.employer_org_ids' },
    { name: 'recruiter_offers',       object: 'ats_offer',           operation: 'all',
      using: 'record.employer_org in current_user.employer_org_ids',
      check: 'record.employer_org in current_user.employer_org_ids' },
  ],
});

/**
 * Owns their own record and nothing else. The seeker's policies key on the
 * caller's user id, which is why `candidate_user` is stamped onto every
 * application and offer — same no-traversal constraint, other side of the
 * marketplace.
 */
export const JobSeekerSet = definePermissionSet({
  name: 'ats_job_seeker',
  label: 'Job Seeker',
  description: 'Owns one profile, its credentials, and the applications made from it.',
  // Unlocks the Job Seeker navigation group of the `ats` app (DESIGN.md §04).
  systemPermissions: ['ats_seeker.access'],
  objects: {
    ats_employer:             { allowRead: true, readScope: 'org' },
    ats_job:                  { allowRead: true, readScope: 'org' },
    ats_candidate:            { allowRead: true, allowCreate: true, allowEdit: true, readScope: 'org', writeScope: 'org' },
    ats_candidate_credential: { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true, readScope: 'org', writeScope: 'org' },
    ats_application:          { allowRead: true, allowCreate: true, readScope: 'org', writeScope: 'org' },
    ats_interview:            { allowRead: true, readScope: 'org' },
    ats_offer:                { allowRead: true, allowEdit: true, readScope: 'org', writeScope: 'org' },
    ats_report:               { allowCreate: true },
    ats_skill:                { allowRead: true },
    ats_credential_type:      { allowRead: true },
  },
  fields: {
    'ats_job.review_note':            { readable: false, editable: false },
    'ats_employer.verification_note': { readable: false, editable: false },
  },
  rowLevelSecurity: [
    // Only verified employers, and only published jobs, are browsable.
    { name: 'seeker_verified_employers', object: 'ats_employer',    operation: 'select',
      using: "verification_status == 'verified'" },
    { name: 'seeker_published_jobs',     object: 'ats_job',         operation: 'select',
      using: "status == 'published'" },
    { name: 'seeker_own_profile',        object: 'ats_candidate',   operation: 'all',
      using: 'user == current_user.id',
      check: 'user == current_user.id' },
    { name: 'seeker_own_applications',   object: 'ats_application', operation: 'all',
      using: 'candidate_user == current_user.id',
      check: 'candidate_user == current_user.id' },
    { name: 'seeker_own_offers',         object: 'ats_offer',       operation: 'all',
      using: 'candidate_user == current_user.id',
      check: 'candidate_user == current_user.id' },
  ],
});

/**
 * Anonymous applicants through the public form (card 08). INSERT-only: a guest
 * can hand in an application and read nothing back, ever.
 */
export const GuestApplySet = definePermissionSet({
  name: 'ats_guest_apply',
  label: 'Guest (Public Application Form)',
  description: 'Anonymous submission of the public application form. No reads.',
  objects: {
    ats_application: { allowRead: false, allowCreate: true, allowEdit: false, allowDelete: false },
  },
});
