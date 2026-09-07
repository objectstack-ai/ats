import { ObjectSchema, Field } from '@objectstack/spec/data';
import { cel } from '@objectstack/spec';

/**
 * A position an employer is hiring for. Drafted by the employer, reviewed by
 * the platform, then published to job seekers. Once `ats_application` lands,
 * the pipeline hangs off this record.
 *
 * Visibility is a deliberate soft filter, not a hard boundary: jobs are meant
 * to be public, so the baseline is `public_read` and unpublished drafts are
 * kept out of seeker-facing views by view filters and app navigation. The
 * platform-internal `review_note` is hidden by field-level security. See
 * DESIGN.md §08 Q1 for the trade-off and the possible upgrade.
 */
export const Job = ObjectSchema.create({
  name: 'ats_job',
  label: 'Job',
  pluralLabel: 'Jobs',
  icon: 'briefcase',
  description: 'A position an employer is hiring for.',

  sharingModel: 'public_read',
  // Platform-global, jointly owned (DESIGN.md §03, tenancy wall split
  // contract): a job is the employer's to write and every seeker's to read, so
  // it sits outside the Layer 0 tenant wall; the employer side is isolated by
  // `employer_org` at the row-level layer.
  tenancy: { enabled: false },

  fields: {
    title: Field.text({
      label: 'Job Title',
      required: true,
      searchable: true,
      maxLength: 200,
    }),
    employer: Field.lookup('ats_employer', {
      label: 'Employer',
      required: true,
    }),
    employer_org: Field.text({
      label: 'Employer Organization',
      maxLength: 64,
      description: 'Organization id of the employer, stamped on write. Row-level policies compare it to the caller\'s org memberships — a predicate cannot traverse the employer lookup (ADR-0055).',
    }),
    department: Field.text({
      label: 'Department',
      maxLength: 120,
    }),
    description: Field.richtext({
      label: 'Description',
    }),
    requirements: Field.richtext({
      label: 'Requirements',
    }),

    // ── Terms ───────────────────────────────────────────────────────────
    employment_type: Field.select({
      label: 'Employment Type',
      required: true,
      defaultValue: 'full_time',
      options: [
        { label: 'Full-time',   value: 'full_time', default: true },
        { label: 'Part-time',   value: 'part_time' },
        { label: 'Contract',    value: 'contract' },
        { label: 'Internship',  value: 'internship' },
        { label: 'Temporary',   value: 'temporary' },
      ],
    }),
    work_mode: Field.select({
      label: 'Work Mode',
      defaultValue: 'onsite',
      options: [
        { label: 'On-site',  value: 'onsite', default: true },
        { label: 'Hybrid',   value: 'hybrid' },
        { label: 'Remote',   value: 'remote' },
      ],
    }),
    city: Field.text({
      label: 'City',
      searchable: true,
      maxLength: 120,
    }),
    salary_min: Field.currency({
      label: 'Salary (min)',
    }),
    salary_max: Field.currency({
      label: 'Salary (max)',
    }),
    salary_period: Field.select({
      label: 'Salary Period',
      defaultValue: 'monthly',
      options: [
        { label: 'Monthly',  value: 'monthly', default: true },
        { label: 'Yearly',   value: 'yearly' },
        { label: 'Hourly',   value: 'hourly' },
      ],
    }),
    headcount: Field.number({
      label: 'Openings',
      min: 1,
      defaultValue: 1,
    }),

    // ── Requirements as structured data ─────────────────────────────────
    required_skills: Field.lookup('ats_skill', {
      label: 'Required Skills',
      multiple: true,
    }),
    required_credentials: Field.lookup('ats_credential_type', {
      label: 'Required Credentials',
      multiple: true,
      description: 'Licences or certificates a candidate must hold to be considered.',
    }),
    experience_min_years: Field.number({
      label: 'Min. Experience (years)',
      min: 0,
    }),
    education_min: Field.select({
      label: 'Min. Education',
      options: [
        { label: 'None required',  value: 'none' },
        { label: 'High school',    value: 'high_school' },
        { label: 'Associate',      value: 'associate' },
        { label: "Bachelor's",     value: 'bachelor' },
        { label: "Master's",       value: 'master' },
        { label: 'Doctorate',      value: 'doctorate' },
      ],
    }),

    // ── Lifecycle ───────────────────────────────────────────────────────
    status: Field.select({
      label: 'Review status',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft',           value: 'draft', default: true, color: '#94A3B8' },
        { label: 'Pending Review',  value: 'pending_review',       color: '#F59E0B' },
        { label: 'Published',       value: 'published',            color: '#10B981' },
        { label: 'Paused',          value: 'paused',               color: '#6B7280' },
        { label: 'Closed',          value: 'closed',               color: '#374151' },
        { label: 'Rejected',        value: 'rejected',             color: '#EF4444' },
      ],
    }),
    rejection_reason: Field.textarea({
      label: 'Rejection Reason',
      description: 'Returned to the employer when a job is rejected.',
    }),
    review_note: Field.textarea({
      label: 'Review Note',
      description: 'Platform-internal reviewer note. Hidden from employer and seeker roles.',
    }),
    is_featured: Field.boolean({
      label: 'Featured',
      defaultValue: false,
    }),
    published_at: Field.datetime({
      label: 'Published At',
    }),
    expires_at: Field.date({
      label: 'Expires',
    }),

    /** CEL: is this job currently visible to seekers? */
    is_open: Field.formula({
      label: 'Open',
      expression: cel`record.status == "published"`,
    }),
  },

  validations: [
    {
      type: 'state_machine' as const,
      name: 'job_status_transitions',
      label: 'Job Status Transitions',
      description: 'A job is reviewed before it is published, and may be paused or closed once live.',
      field: 'status',
      message: 'Invalid job status transition.',
      transitions: {
        draft:          ['pending_review'],
        pending_review: ['published', 'rejected'],
        published:      ['paused', 'closed'],
        paused:         ['published', 'closed'],
        rejected:       ['draft', 'pending_review'],
        closed:         [],
      },
    },
    {
      type: 'script' as const,
      name: 'job_salary_range',
      label: 'Salary range is ordered',
      description: 'When both bounds are set, the minimum must not exceed the maximum.',
      condition: cel`record.salary_min != null && record.salary_max != null && record.salary_min > record.salary_max`,
      message: 'Minimum salary cannot exceed maximum salary.',
    },
  ],

  enable: {
    apiEnabled: true,
    searchable: true,
  },
});
