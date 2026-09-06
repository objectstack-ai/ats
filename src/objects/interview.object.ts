import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * A scheduled conversation on an application. `scheduled_at` is the calendar
 * view's anchor and the T-24h reminder's trigger (F6).
 */
export const Interview = ObjectSchema.create({
  name: 'ats_interview',
  label: 'Interview',
  pluralLabel: 'Interviews',
  icon: 'calendar-clock',
  description: 'A scheduled interview round on an application, with its outcome.',

  sharingModel: 'controlled_by_parent',
  nameField: 'display_name',

  fields: {
    display_name: Field.text({
      label: 'Interview',
      searchable: true,
      maxLength: 240,
      description: 'Stamped as "<candidate> · R<round>" on write.',
    }),
    // A related list on the application's detail page, not inline line items.
    application: Field.masterDetail('ats_application', {
      label: 'Application',
      required: true,
      deleteBehavior: 'cascade',
    }),
    round: Field.number({ label: 'Round', min: 1, defaultValue: 1 }),
    scheduled_at: Field.datetime({ label: 'Scheduled At', required: true }),
    duration_minutes: Field.number({ label: 'Duration (min)', min: 0, defaultValue: 60 }),
    mode: Field.select({
      label: 'Mode',
      required: true,
      defaultValue: 'video',
      options: [
        { label: 'On-site', value: 'onsite' },
        { label: 'Video',   value: 'video', default: true },
        { label: 'Phone',   value: 'phone' },
      ],
    }),
    location_or_link: Field.text({ label: 'Location / Link', maxLength: 500 }),
    interviewers: Field.user({ label: 'Interviewers', multiple: true }),
    status: Field.select({
      label: 'Status',
      required: true,
      defaultValue: 'scheduled',
      options: [
        { label: 'Scheduled', value: 'scheduled', default: true, color: '#3B82F6' },
        { label: 'Completed', value: 'completed',                color: '#10B981' },
        { label: 'Cancelled', value: 'cancelled',                color: '#6B7280' },
        { label: 'No show',   value: 'no_show',                  color: '#EF4444' },
      ],
    }),
    rating: Field.slider({ label: 'Rating', min: 1, max: 5 }),
    feedback: Field.textarea({ label: 'Feedback' }),
  },

  validations: [
    {
      type: 'state_machine' as const,
      name: 'interview_status_transitions',
      label: 'Interview Status Transitions',
      description: 'A scheduled interview completes, is cancelled, or is a no-show.',
      field: 'status',
      message: 'Invalid interview status transition.',
      transitions: {
        scheduled: ['completed', 'cancelled', 'no_show'],
        completed: [],
        cancelled: [],
        no_show:   ['scheduled'],
      },
    },
  ],

  enable: { apiEnabled: true, searchable: true },
});
