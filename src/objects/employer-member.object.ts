import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Which users belong to which employer, and in what capacity. This is the
 * pivot every employer-side row-level rule resolves through: a user sees the
 * jobs, applications, interviews and offers of the employers they are an
 * active member of, and nothing else.
 */
export const EmployerMember = ObjectSchema.create({
  name: 'ats_employer_member',
  label: 'Employer Member',
  pluralLabel: 'Employer Members',
  icon: 'users',
  description: 'A user\'s membership in an employer, with their role there.',

  // Record scope always follows the employer (ADR-0055); object-level CRUD is a
  // separate gate granted by the permission sets.
  sharingModel: 'controlled_by_parent',

  // A membership row has no natural title of its own, so `display_name` is a
  // stored mirror ("<user> · <access level>") that seeds and the member hook
  // stamp. Stored text, not a formula: CEL cannot read the user's name, and a
  // formula is not title-eligible for search (objectstack-data §Search Fields).
  nameField: 'display_name',

  fields: {
    display_name: Field.text({
      label: 'Member',
      searchable: true,
      maxLength: 200,
      description: 'Stamped as "<user name> · <access level>" on write.',
    }),
    employer: Field.masterDetail('ats_employer', {
      label: 'Employer',
      required: true,
      deleteBehavior: 'cascade',
      inlineEdit: 'grid',
      inlineTitle: 'Members',
    }),
    employer_org: Field.text({
      label: 'Employer Organization',
      maxLength: 64,
      description: 'Organization id of the employer, stamped on write. Row-level policies compare it to the caller\'s org memberships — a predicate cannot traverse the employer lookup (ADR-0055).',
    }),
    user: Field.user({
      label: 'User',
      required: true,
    }),
    access_level: Field.select({
      label: 'Access Level',
      required: true,
      defaultValue: 'recruiter',
      options: [
        { label: 'Admin',      value: 'admin',                    color: '#8B5CF6' },
        { label: 'Recruiter',  value: 'recruiter', default: true, color: '#3B82F6' },
        { label: 'Viewer',     value: 'viewer',                   color: '#94A3B8' },
      ],
    }),
    is_active: Field.boolean({
      label: 'Active',
      defaultValue: true,
    }),
  },

  enable: {
    apiEnabled: true,
  },
});
