import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * A kind of licence or certificate a role can require — nursing licence,
 * electrician certification, CPA, forklift permit, medical practitioner
 * registration. Kept in the core model on purpose: "licensed to practise, and
 * re-certified before expiry" is a hiring constraint in healthcare, trades,
 * finance, logistics and construction alike, and it is the piece most
 * open-source applicant tracking systems leave out.
 */
export const CredentialType = ObjectSchema.create({
  name: 'ats_credential_type',
  label: 'Credential Type',
  pluralLabel: 'Credential Types',
  icon: 'badge-check',
  description: 'A licence or certificate that a job can require and a candidate can hold.',

  sharingModel: 'public_read',
  // Platform-global dictionary (DESIGN.md §03, tenancy wall split contract):
  // shared by every tenant, so it sits outside the Layer 0 tenant wall.
  tenancy: { enabled: false },

  fields: {
    name: Field.text({
      label: 'Credential',
      required: true,
      searchable: true,
      maxLength: 200,
    }),
    issuer: Field.text({
      label: 'Issuing Body',
      searchable: true,
      maxLength: 200,
    }),
    description: Field.textarea({
      label: 'Description',
    }),
    has_levels: Field.boolean({
      label: 'Has Levels',
      defaultValue: false,
      description: 'Whether this credential is graded (e.g. level 1–5) rather than pass/fail.',
    }),
    validity_months: Field.number({
      label: 'Validity (months)',
      min: 0,
      description: 'How long a certificate stays valid. Drives the re-certification reminder; leave empty for credentials that never expire.',
    }),
  },

  enable: {
    apiEnabled: true,
    searchable: true,
  },
});
