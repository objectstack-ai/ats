import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * A person looking for work. Owned by the candidate themself — an employer only
 * ever reaches one through an application to its own job, and the contact and
 * salary-expectation fields stay masked even then (DESIGN.md §03).
 */
export const Candidate = ObjectSchema.create({
  name: 'ats_candidate',
  label: 'Candidate',
  pluralLabel: 'Candidates',
  icon: 'user-round',
  description: 'A person looking for work, with their skills, history and credentials.',

  sharingModel: 'private',
  nameField: 'full_name',

  fields: {
    full_name: Field.text({
      label: 'Full Name',
      required: true,
      searchable: true,
      maxLength: 200,
    }),
    user: Field.user({
      label: 'Account',
      description: 'The signed-in user this profile belongs to. Row-level rules key on it.',
    }),
    avatar: Field.image({ label: 'Photo' }),

    // ── Contact — masked from recruiters (DESIGN.md §03) ────────────────
    phone: Field.phone({ label: 'Phone' }),
    email: Field.email({ label: 'Email', searchable: true }),
    city: Field.text({ label: 'City', searchable: true, maxLength: 120 }),

    // ── Experience ──────────────────────────────────────────────────────
    experience_years: Field.number({ label: 'Years of Experience', min: 0 }),
    education: Field.select({
      label: 'Highest Education',
      // Same value set as ats_job.education_min so the two can be compared.
      options: [
        { label: 'None',        value: 'none' },
        { label: 'High school', value: 'high_school' },
        { label: 'Associate',   value: 'associate' },
        { label: "Bachelor's",  value: 'bachelor' },
        { label: "Master's",    value: 'master' },
        { label: 'Doctorate',   value: 'doctorate' },
      ],
    }),
    current_title: Field.text({ label: 'Current Title', maxLength: 160 }),
    current_employer: Field.text({ label: 'Current Employer', maxLength: 200 }),
    skills: Field.lookup('ats_skill', { label: 'Skills', multiple: true }),
    summary: Field.textarea({ label: 'Summary' }),
    resume_file: Field.file({ label: 'Résumé' }),

    // ── Expectations — masked from every employer role ──────────────────
    expected_salary_min: Field.currency({ label: 'Expected Salary (min)' }),
    expected_salary_max: Field.currency({ label: 'Expected Salary (max)' }),
    salary_period: Field.select({
      label: 'Salary Period',
      defaultValue: 'monthly',
      options: [
        { label: 'Monthly', value: 'monthly', default: true },
        { label: 'Yearly',  value: 'yearly' },
        { label: 'Hourly',  value: 'hourly' },
      ],
    }),

    seeking_status: Field.select({
      label: 'Seeking Status',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Actively looking', value: 'actively_looking',               color: '#10B981' },
        { label: 'Open to offers',   value: 'open', default: true,            color: '#3B82F6' },
        { label: 'Not looking',      value: 'not_looking',                    color: '#94A3B8' },
      ],
    }),
    profile_visibility: Field.select({
      label: 'Profile Visibility',
      required: true,
      defaultValue: 'limited',
      description: 'How much of this profile employers may see before the candidate agrees.',
      options: [
        { label: 'Public',  value: 'public' },
        { label: 'Limited', value: 'limited', default: true },
        { label: 'Hidden',  value: 'hidden' },
      ],
    }),
  },

  validations: [
    {
      type: 'script' as const,
      name: 'candidate_salary_range',
      label: 'Expected salary range is ordered',
      description: 'When both bounds are set, the minimum must not exceed the maximum.',
      condition: 'record.expected_salary_min != null && record.expected_salary_max != null && record.expected_salary_min > record.expected_salary_max',
      message: 'Minimum expected salary cannot exceed the maximum.',
    },
  ],

  enable: { apiEnabled: true, searchable: true },
});
