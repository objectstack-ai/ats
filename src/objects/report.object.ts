import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Something a user flags for the platform to look at — a fake job, an invented
 * résumé, harassment in a message. Deliberately polymorphic: one `target_type`
 * + `target_ref` pair rather than four nullable lookups, because the queue is
 * worked by target *kind*, and a fifth reportable object should not require a
 * schema change.
 */
export const Report = ObjectSchema.create({
  name: 'ats_report',
  label: 'Report',
  pluralLabel: 'Reports',
  icon: 'flag',
  description: 'A user-submitted report about a job, candidate, application or employer.',

  sharingModel: 'private',
  // Platform-global (DESIGN.md §03, tenancy wall split contract): reports are
  // filed by any audience and worked by the platform, so the row belongs to no
  // employer organization and sits outside the Layer 0 tenant wall.
  tenancy: { enabled: false },
  nameField: 'subject',

  fields: {
    subject: Field.text({
      label: 'Subject',
      required: true,
      searchable: true,
      maxLength: 200,
    }),
    target_type: Field.select({
      label: 'Target Type',
      required: true,
      options: [
        { label: 'Job',         value: 'job' },
        { label: 'Candidate',   value: 'candidate' },
        { label: 'Application', value: 'application' },
        { label: 'Employer',    value: 'employer' },
      ],
    }),
    target_ref: Field.text({
      label: 'Target Record',
      required: true,
      maxLength: 64,
      description: 'Id of the reported record, within the object named by target_type.',
    }),
    reason: Field.select({
      label: 'Reason',
      options: [
        { label: 'False information', value: 'fake_info' },
        { label: 'Harassment',        value: 'harassment' },
        { label: 'Spam',              value: 'spam' },
        { label: 'Discrimination',    value: 'discrimination' },
        { label: 'Other',             value: 'other' },
      ],
    }),
    description: Field.textarea({ label: 'What happened' }),
    reporter: Field.user({ label: 'Reported By', defaultValue: 'current_user' }),
    status: Field.select({
      label: 'Status',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New',           value: 'new', default: true, color: '#F59E0B' },
        { label: 'Investigating', value: 'investigating',      color: '#3B82F6' },
        { label: 'Resolved',      value: 'resolved',           color: '#10B981' },
        { label: 'Dismissed',     value: 'dismissed',          color: '#6B7280' },
      ],
    }),
    resolution: Field.textarea({ label: 'Resolution' }),
    handled_by: Field.user({ label: 'Handled By' }),
  },

  validations: [
    {
      type: 'state_machine' as const,
      name: 'report_status_transitions',
      label: 'Report Status Transitions',
      description: 'A report is triaged, then resolved or dismissed.',
      field: 'status',
      message: 'Invalid report status transition.',
      transitions: {
        new:           ['investigating', 'dismissed'],
        investigating: ['resolved', 'dismissed'],
        resolved:      [],
        dismissed:     [],
      },
    },
  ],

  enable: { apiEnabled: true, searchable: true },
});
