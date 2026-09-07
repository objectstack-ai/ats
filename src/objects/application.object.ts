import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * One candidate's pursuit of one job — the spine of the pipeline. The kanban
 * groups by `stage`, the funnel counts it, and the two row-level scopes meet
 * here: the employer reads its own via `employer`, the candidate reads their
 * own via `candidate`.
 *
 * `employer` is denormalised from `job.employer` by a write hook: row-level
 * predicates compare a field to the caller, and cannot traverse a lookup.
 */
export const Application = ObjectSchema.create({
  name: 'ats_application',
  label: 'Application',
  pluralLabel: 'Applications',
  icon: 'send',
  description: 'A candidate applying to a job, and its progress through the pipeline.',

  sharingModel: 'private',
  // Platform-global, jointly owned (DESIGN.md §03, tenancy wall split
  // contract): an application belongs to the candidate AND the employer, and
  // the tenant model assumes exactly one owner per row. It sits outside the
  // Layer 0 tenant wall; the employer side is isolated by `employer_org`, the
  // candidate side by `candidate_user`, both at the row-level layer.
  tenancy: { enabled: false },
  nameField: 'display_name',

  fields: {
    display_name: Field.text({
      label: 'Application',
      searchable: true,
      maxLength: 300,
      description: 'Stamped as "<candidate> → <job>" on write.',
    }),
    job: Field.lookup('ats_job', { label: 'Job', required: true }),
    candidate: Field.lookup('ats_candidate', { label: 'Candidate', required: true }),
    employer: Field.lookup('ats_employer', {
      label: 'Employer',
      description: 'Copied from job.employer on insert; row-level rules key on it.',
    }),

    employer_org: Field.text({
      label: 'Employer Organization',
      maxLength: 64,
      description: 'Organization id of the employer, stamped on write. Row-level policies compare it to the caller\'s org memberships — a predicate cannot traverse the employer lookup (ADR-0055).',
    }),
    candidate_user: Field.text({
      label: 'Candidate User',
      maxLength: 64,
      description: "User id of the candidate, stamped on write. Lets the seeker's own policy match without traversing the candidate lookup.",
    }),

    stage: Field.select({
      label: 'Stage',
      required: true,
      defaultValue: 'applied',
      options: [
        { label: 'Applied',   value: 'applied', default: true, color: '#94A3B8' },
        { label: 'Screening', value: 'screening',              color: '#3B82F6' },
        { label: 'Interview', value: 'interview',              color: '#F59E0B' },
        { label: 'Offer',     value: 'offer',                  color: '#8B5CF6' },
        { label: 'Hired',     value: 'hired',                  color: '#10B981' },
        { label: 'Rejected',  value: 'rejected',               color: '#EF4444' },
        { label: 'Withdrawn', value: 'withdrawn',              color: '#6B7280' },
      ],
    }),
    source: Field.select({
      label: 'Source',
      defaultValue: 'direct',
      options: [
        { label: 'Direct',         value: 'direct', default: true },
        { label: 'Referral',       value: 'referral' },
        { label: 'Recommendation', value: 'recommendation' },
        { label: 'Agency',         value: 'agency' },
        { label: 'Import',         value: 'import' },
      ],
    }),
    applied_at: Field.datetime({ label: 'Applied At' }),
    resume_snapshot: Field.file({
      label: 'Résumé (as submitted)',
      description: 'The résumé at the moment of applying — the live profile may move on.',
    }),
    cover_letter: Field.textarea({ label: 'Cover Letter' }),
    rating: Field.slider({ label: 'Rating', min: 1, max: 5 }),
    rejection_reason: Field.select({
      label: 'Rejection Reason',
      options: [
        { label: 'Not a fit',               value: 'not_a_fit' },
        { label: 'Insufficient experience', value: 'insufficient_experience' },
        { label: 'Salary mismatch',         value: 'salary_mismatch' },
        { label: 'Position filled',         value: 'position_filled' },
        { label: 'Candidate withdrew',      value: 'candidate_withdrew' },
        { label: 'Other',                   value: 'other' },
      ],
    }),
    last_activity_at: Field.datetime({ label: 'Last Activity' }),

    /**
     * Days from `applied_at` to the FIRST offer's `created_at` — stamped once,
     * by the `afterInsert` hook on `ats_offer`, and never recomputed.
     *
     * It is a stored column because it has to be: a dataset measure aggregates
     * ONE column of ONE object, and this duration spans two objects. Averaging
     * it is what the employer dashboard's "Average Days to Offer" tile does.
     * A later offer on the same application does not move it — the metric is
     * time to FIRST offer, and re-deriving it would make the tile drift every
     * time an offer is re-issued.
     */
    days_to_offer: Field.number({
      label: 'Days to Offer',
      min: 0,
      description: 'Whole days from applying to the first offer on this application. Stamped when that offer is inserted; not editable and not recomputed.',
    }),

    /** Roll-up: how many interview rounds this application has accumulated. */
    interview_count: Field.summary({
      label: 'Interviews',
      summaryOperations: {
        object: 'ats_interview',
        field: 'round',
        function: 'count',
      },
    }),
  },

  // One application per candidate per job. Uniqueness is an index, never a
  // validation rule — there is no `unique` validation type.
  indexes: [
    { fields: ['job', 'candidate'], unique: 'organization' },
  ],

  validations: [
    {
      type: 'state_machine' as const,
      name: 'application_stage_transitions',
      label: 'Application Stage Transitions',
      description: 'The pipeline moves forward one stage at a time; rejection and withdrawal are always available until terminal.',
      field: 'stage',
      message: 'Invalid application stage transition.',
      transitions: {
        applied:   ['screening', 'rejected', 'withdrawn'],
        screening: ['interview', 'rejected', 'withdrawn'],
        interview: ['offer', 'rejected', 'withdrawn'],
        offer:     ['hired', 'rejected', 'withdrawn'],
        hired:     [],
        rejected:  [],
        withdrawn: [],
      },
    },
  ],

  enable: { apiEnabled: true, searchable: true },
});
