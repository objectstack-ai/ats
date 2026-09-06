import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * The formal offer on an application. Its `status` carries the employer's own
 * internal approval (F3) before the candidate ever sees it — approval here is
 * the employer's business, not the platform's.
 *
 * `employer` is denormalised for the same reason as on the application.
 */
export const Offer = ObjectSchema.create({
  name: 'ats_offer',
  label: 'Offer',
  pluralLabel: 'Offers',
  icon: 'file-signature',
  description: 'An offer extended on an application, with its approval and response.',

  sharingModel: 'private',
  nameField: 'display_name',

  fields: {
    display_name: Field.text({
      label: 'Offer',
      searchable: true,
      maxLength: 300,
      description: 'Stamped as "Offer · <candidate> · <job>" on write.',
    }),
    application: Field.lookup('ats_application', { label: 'Application', required: true }),
    employer: Field.lookup('ats_employer', {
      label: 'Employer',
      description: 'Copied from the application on insert; row-level rules key on it.',
    }),
    salary: Field.currency({ label: 'Salary' }),
    salary_period: Field.select({
      label: 'Salary Period',
      defaultValue: 'monthly',
      options: [
        { label: 'Monthly', value: 'monthly', default: true },
        { label: 'Yearly',  value: 'yearly' },
        { label: 'Hourly',  value: 'hourly' },
      ],
    }),
    start_date: Field.date({ label: 'Start Date' }),
    status: Field.select({
      label: 'Status',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft',            value: 'draft', default: true, color: '#94A3B8' },
        { label: 'Pending approval', value: 'pending_approval',     color: '#F59E0B' },
        { label: 'Approved',         value: 'approved',             color: '#3B82F6' },
        { label: 'Sent',             value: 'sent',                 color: '#8B5CF6' },
        { label: 'Accepted',         value: 'accepted',             color: '#10B981' },
        { label: 'Declined',         value: 'declined',             color: '#EF4444' },
        { label: 'Withdrawn',        value: 'withdrawn',            color: '#6B7280' },
      ],
    }),
    approved_by: Field.user({ label: 'Approved By' }),
    expires_at: Field.date({ label: 'Offer Expires' }),
    notes: Field.textarea({ label: 'Notes' }),
  },

  validations: [
    {
      type: 'state_machine' as const,
      name: 'offer_status_transitions',
      label: 'Offer Status Transitions',
      description: 'An offer is approved internally, sent, then accepted or declined.',
      field: 'status',
      message: 'Invalid offer status transition.',
      transitions: {
        draft:            ['pending_approval', 'withdrawn'],
        pending_approval: ['approved', 'draft'],
        approved:         ['sent', 'withdrawn'],
        sent:             ['accepted', 'declined', 'withdrawn'],
        accepted:         [],
        declined:         [],
        withdrawn:        [],
      },
    },
  ],

  enable: { apiEnabled: true, searchable: true },
});
