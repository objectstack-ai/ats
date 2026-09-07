import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * A person looking for work. Owned by the candidate themself. Employers reach
 * it through the consent-gated pool (DESIGN.md §03, #13): a `public` or
 * `limited` profile is discoverable by every employer, a `hidden` one only by
 * an employer the candidate applied to — enforced by the row-level policies in
 * the employer permission sets, never by a view. The contact and
 * salary-expectation fields stay masked by field-level security regardless.
 */
export const Candidate = ObjectSchema.create({
  name: 'ats_candidate',
  label: 'Candidate',
  pluralLabel: 'Candidates',
  icon: 'user-round',
  description: 'A person looking for work, with their skills, history and credentials.',

  sharingModel: 'private',
  // Platform-global (DESIGN.md §03, tenancy wall split contract): a candidate
  // belongs to no employer organization, so the row sits outside the Layer 0
  // tenant wall and isolation is carried by the row-level rules alone.
  tenancy: { enabled: false },
  nameField: 'full_name',
  // ADR-0085 ordered "most important fields". The seeker's "My Profile" entry
  // is a `filters` slice (`{ user: '{current_user_id}' }`) on the bare data
  // surface, so it derives its columns from this and nothing else; undeclared,
  // the walk led with `Account`, `Photo` and `Phone` (#33). Listing
  // `profile_visibility` makes the value legible to whoever may already read
  // the row — it does not make it enforced; that is #13's job, and no entry
  // here should be mistaken for it.
  highlightFields: ['full_name', 'current_title', 'city', 'seeking_status', 'experience_years', 'profile_visibility'],

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
    // Which employers may reach this profile at all. Row-level security reads
    // it (permission-sets.ts); field-level security does NOT — FLS is static
    // per permission set, so no value here can open or seal a field per row.
    profile_visibility: Field.select({
      label: 'Profile Visibility',
      required: true,
      defaultValue: 'limited',
      description:
        'Who may find this profile. `public` and `limited` are both discoverable by every employer and differ only in presentation — `public` is showcased in the gallery, `limited` is found through the Talent Pool search only; that split is not a security boundary. `hidden` is enforced: the profile is reachable only by employers this candidate has applied to.',
      options: [
        { label: 'Public',                value: 'public' },
        { label: 'Limited (search only)', value: 'limited', default: true },
        { label: 'Hidden',                value: 'hidden' },
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
