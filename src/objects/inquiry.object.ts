import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * The public application entry — the quarantine object an ANONYMOUS applicant
 * writes to (maintainer ruling on #3, option (b); DESIGN.md §04).
 *
 * Why not a public form over `ats_application`: the anonymous public-form
 * contract inserts ONE row on ONE object under a route-derived
 * `publicFormGrant`, and `ats_application.candidate` is `required: true` with
 * a unique `(job, candidate)` index — measured, not inferred
 * (`docs/evidence/issue-3/20-anonymous-public-form-probe-transcript.txt`). So
 * an application cannot be born anonymously. An inquiry can: it carries what
 * the applicant typed and nothing else, and a platform or employer user then
 * CONVERTS it — `status: 'converted'` — into a real `ats_candidate` (found by
 * e-mail, or created `hidden`) plus an `ats_application`, in the
 * `beforeUpdate` hook (`src/hooks/inquiry.hook.ts`). This is the Web-to-Lead
 * shape the platform's own reference apps use for their public forms.
 *
 * ## Who may touch it
 *
 * - **Anonymous**: INSERT through `formViews.apply_public` only. The
 *   authorization is the route-derived `publicFormGrant` (ADR-0056 Option A),
 *   scoped to this one object and to the fields the form declares; there is
 *   no guest permission set (there never was a working one — #32). The row's
 *   `job` arrives by prefill from the job page's apply link, not by search
 *   (the anonymous lookup route is broken upstream, objectstack#16581).
 * - **Platform staff**: read the whole queue, triage, convert.
 * - **The employer that owns the job**: read and triage its own inquiries —
 *   `employer_org` is stamped from the job on insert, and the employer
 *   policies compare it to the caller's org memberships (DESIGN.md §03).
 * - **Job seekers**: nothing. An inquiry belongs to nobody until conversion.
 *
 * The object declares NO row-level `check` of its own on purpose: the
 * insert-side RLS check evaluates the PRE-hook payload (objectstack#16608),
 * so a check that depends on a stamped value (`employer_org`) would refuse
 * every anonymous submit and read as a broken public-form contract. The
 * anonymous insert is authorised by the grant; the employer-side policies
 * gate reads and triage.
 *
 * Platform-global (`tenancy: { enabled: false }`): an anonymous submitter
 * belongs to no organization, and §03 forbids inventing a "platform
 * organization" to own rows like these.
 */
export const Inquiry = ObjectSchema.create({
  name: 'ats_inquiry',
  label: 'Inquiry',
  pluralLabel: 'Inquiries',
  icon: 'mail-plus',
  description: 'An anonymous application submitted through the public form, waiting to be converted into a candidate and an application.',

  sharingModel: 'private',
  tenancy: { enabled: false },
  nameField: 'display_name',
  // The compact face the data surface and lookup pickers render (#33).
  highlightFields: ['display_name', 'status', 'email', 'submitted_at'],

  fields: {
    display_name: Field.text({
      label: 'Inquiry',
      searchable: true,
      maxLength: 300,
      description: 'Stamped as "<applicant> → <job>" on write, the same shape an application carries.',
    }),

    // ── What the applicant submits (the public form's whitelist) ────────
    job: Field.lookup('ats_job', {
      label: 'Job',
      required: true,
      description: 'The job applied to. Only a published job accepts an inquiry (enforced by the stamp hook).',
    }),
    full_name: Field.text({ label: 'Full Name', required: true, searchable: true, maxLength: 200 }),
    email: Field.email({
      label: 'Email',
      required: true,
      searchable: true,
      description: 'Normalised to lower case on write; conversion de-duplicates candidates on it.',
    }),
    phone: Field.phone({ label: 'Phone' }),
    cover_letter: Field.textarea({ label: 'Cover Letter' }),
    resume: Field.file({ label: 'Résumé' }),

    // ── Stamped on write (never client-suppliable in effect) ────────────
    employer: Field.lookup('ats_employer', {
      label: 'Employer',
      description: 'Copied from job.employer on insert; the employer-side policies key on the organization below.',
    }),
    employer_org: Field.text({
      label: 'Employer Organization',
      maxLength: 64,
      description: "Organization id of the job's employer, stamped on write. Row-level policies compare it to the caller's org memberships — a predicate cannot traverse the job lookup (ADR-0055).",
    }),
    submitted_at: Field.datetime({ label: 'Submitted At' }),

    // ── Triage ──────────────────────────────────────────────────────────
    status: Field.select({
      label: 'Status',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New',       value: 'new', default: true, color: '#F59E0B' },
        { label: 'Converted', value: 'converted',          color: '#10B981' },
        { label: 'Rejected',  value: 'rejected',           color: '#6B7280' },
        { label: 'Spam',      value: 'spam',               color: '#EF4444' },
      ],
    }),
    candidate: Field.lookup('ats_candidate', {
      label: 'Converted Candidate',
      description: 'Set by conversion: the candidate this inquiry became, or was matched to by e-mail.',
    }),
    application: Field.lookup('ats_application', {
      label: 'Converted Application',
      description: 'Set by conversion: the application this inquiry became.',
    }),
    converted_at: Field.datetime({ label: 'Converted At' }),
  },

  indexes: [
    // The employer-side policy filters on it; the queue groups by it.
    { fields: ['employer_org'] },
    { fields: ['status'] },
  ],

  validations: [
    {
      type: 'state_machine' as const,
      name: 'inquiry_status_transitions',
      label: 'Inquiry Status Transitions',
      description: 'An inquiry is born new; it is converted, rejected or marked spam once, and a rejection or spam mark can be reopened. Conversion is terminal.',
      field: 'status',
      message: 'Invalid inquiry status transition.',
      // The entry point: no write — anonymous or otherwise — can create an
      // inquiry that is already converted or already triaged.
      initialStates: ['new'],
      transitions: {
        new:       ['converted', 'rejected', 'spam'],
        rejected:  ['new'],
        spam:      ['new'],
        converted: [],
      },
    },
  ],

  enable: { apiEnabled: true, searchable: true },
});
