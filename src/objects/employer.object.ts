import { ObjectSchema, Field } from '@objectstack/spec/data';
import { cel } from '@objectstack/spec';

/**
 * An organisation that hires through the platform. Every job, application,
 * interview and offer on the employer side hangs off one of these, and
 * `ats_employer_member` decides which users belong to it — that membership is
 * what the row-level rules key on to keep one employer from seeing another's
 * candidates.
 */
export const Employer = ObjectSchema.create({
  name: 'ats_employer',
  label: 'Employer',
  pluralLabel: 'Employers',
  icon: 'building-2',
  description: 'A hiring organisation registered on the platform.',

  // Employer records carry verification documents and commercial terms, so the
  // baseline is owner-only. Members of the employer are widened onto it by the
  // security layer; job seekers only ever see verified employers through jobs.
  sharingModel: 'private',

  // The ordered "most important fields" role (ADR-0085, spec 17 — renamed from
  // `compactLayout` in 11.7.0). Every surface that has no authored column list
  // derives from this: the platform "Employers Pending" nav slice (a `filters`
  // slice on the bare data surface, which never reads an object's authored
  // list), the record header strip, lookup previews. Undeclared, the walk took
  // the first six business fields and gave a verification reviewer
  // `Short Name`, `Logo` and `Company Size` but not the verdict field, not the
  // contact (#33). `verification_docs` is deliberately absent: the seed carries
  // it on 0 of 12 rows and a multi-file column cannot be read at a glance —
  // the reviewer opens it on the record.
  highlightFields: ['name', 'industry', 'city', 'verification_status', 'service_tier', 'owner'],

  fields: {
    name: Field.text({
      label: 'Employer Name',
      required: true,
      searchable: true,
      maxLength: 200,
    }),
    short_name: Field.text({
      label: 'Short Name',
      maxLength: 60,
    }),
    logo: Field.image({
      label: 'Logo',
    }),
    industry: Field.select({
      label: 'Industry',
      options: [
        { label: 'Technology',    value: 'technology' },
        { label: 'Manufacturing', value: 'manufacturing' },
        { label: 'Healthcare',    value: 'healthcare' },
        { label: 'Retail',        value: 'retail' },
        { label: 'Education',     value: 'education' },
        { label: 'Finance',       value: 'finance' },
        { label: 'Logistics',     value: 'logistics' },
        { label: 'Hospitality',   value: 'hospitality' },
        { label: 'Construction',  value: 'construction' },
        { label: 'Other',         value: 'other' },
      ],
    }),
    size: Field.select({
      label: 'Company Size',
      options: [
        { label: '1–49',     value: 'micro' },
        { label: '50–199',   value: 'small' },
        { label: '200–999',  value: 'medium' },
        { label: '1000+',    value: 'large' },
      ],
    }),
    city: Field.text({
      label: 'City',
      searchable: true,
      maxLength: 120,
    }),
    website: Field.url({
      label: 'Website',
    }),
    intro: Field.richtext({
      label: 'About',
    }),

    // ── Verification ────────────────────────────────────────────────────
    verification_status: Field.select({
      label: 'Verification',
      required: true,
      // Write-path default so a minimal create satisfies `required`; the
      // option `default` below is only the UI preselect.
      defaultValue: 'draft',
      options: [
        { label: 'Draft',      value: 'draft',     default: true, color: '#94A3B8' },
        { label: 'Pending',    value: 'pending',                  color: '#F59E0B' },
        { label: 'Verified',   value: 'verified',                 color: '#10B981' },
        { label: 'Rejected',   value: 'rejected',                 color: '#EF4444' },
        { label: 'Suspended',  value: 'suspended',                color: '#6B7280' },
      ],
    }),
    verification_docs: Field.file({
      label: 'Verification Documents',
      multiple: true,
      description: 'Business registration, operating licence, or equivalent.',
    }),
    verification_note: Field.textarea({
      label: 'Verification Note',
      description: 'Platform-internal note from the reviewer. Not shown to the employer.',
    }),

    // ── Commercial terms ────────────────────────────────────────────────
    service_tier: Field.select({
      label: 'Service Tier',
      required: true,
      defaultValue: 'trial',
      options: [
        { label: 'Trial',     value: 'trial', default: true },
        { label: 'Standard',  value: 'standard' },
        { label: 'Premium',   value: 'premium' },
      ],
    }),
    service_expires_at: Field.date({
      label: 'Service Expires',
    }),

    organization: Field.text({
      label: 'Organization',
      maxLength: 64,
      description: 'Platform organization backing this employer. Its staff are members of it; every employer-side row-level policy resolves through it.',
    }),
    owner: Field.user({
      label: 'Primary Contact',
      defaultValue: 'current_user',
    }),

    /** CEL: may this employer publish jobs right now? */
    can_publish: Field.formula({
      label: 'Can Publish',
      expression: cel`record.verification_status == "verified"`,
    }),
  },

  validations: [
    {
      type: 'state_machine' as const,
      name: 'employer_verification_transitions',
      label: 'Employer Verification Transitions',
      description: 'Verification moves forward through review; a rejected employer may resubmit.',
      field: 'verification_status',
      message: 'Invalid verification status transition.',
      transitions: {
        draft:     ['pending'],
        pending:   ['verified', 'rejected'],
        verified:  ['suspended'],
        rejected:  ['pending'],
        suspended: ['verified'],
      },
    },
  ],

  enable: {
    apiEnabled: true,
    searchable: true,
  },
});
