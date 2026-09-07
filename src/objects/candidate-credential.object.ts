import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * A licence or certificate a candidate actually holds, with its expiry. The
 * daily reminder job (F5) reads `is_expiring`; the employer side reads it to
 * see whose ticket lapses before a start date.
 */
export const CandidateCredential = ObjectSchema.create({
  name: 'ats_candidate_credential',
  label: 'Credential',
  pluralLabel: 'Credentials',
  icon: 'award',
  description: "A credential held by a candidate, with its level, number and expiry.",

  sharingModel: 'controlled_by_parent',
  // Platform-global, like its parent candidate (DESIGN.md §03, tenancy wall
  // split contract): outside the Layer 0 tenant wall, isolated by RLS alone.
  tenancy: { enabled: false },
  nameField: 'display_name',

  fields: {
    display_name: Field.text({
      label: 'Credential',
      searchable: true,
      maxLength: 240,
      description: 'Stamped as "<credential> · <level>" on write.',
    }),
    candidate: Field.masterDetail('ats_candidate', {
      label: 'Candidate',
      required: true,
      deleteBehavior: 'cascade',
      inlineEdit: 'grid',
      inlineTitle: 'Credentials',
    }),
    credential_type: Field.lookup('ats_credential_type', {
      label: 'Credential Type',
      required: true,
    }),
    level: Field.text({ label: 'Level', maxLength: 60 }),
    certificate_no: Field.text({ label: 'Certificate No.', maxLength: 120, searchable: true }),
    issued_at: Field.date({ label: 'Issued' }),
    expires_at: Field.date({ label: 'Expires' }),
    certificate_file: Field.file({ label: 'Certificate' }),
    verification_status: Field.select({
      label: 'Verification',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending',  value: 'pending', default: true, color: '#F59E0B' },
        { label: 'Verified', value: 'verified',               color: '#10B981' },
        { label: 'Rejected', value: 'rejected',               color: '#EF4444' },
      ],
    }),

    /**
     * CEL: does this credential lapse within the next 90 days? Calendar-helper
     * comparison, never date arithmetic — `today() + 90` faults the build.
     */
    is_expiring: Field.formula({
      label: 'Expiring Soon',
      expression: 'record.expires_at != null && record.expires_at >= today() && record.expires_at <= daysFromNow(90)',
    }),

    /**
     * F5's dedupe state (card 12, #7): when the daily `credential_expiry_reminder`
     * flow last told the candidate this credential is expiring. The flow skips a
     * credential reminded within the last 30 days, so a lapsing credential earns
     * one message per 30 days, not one per day — a reminder that fires daily is
     * spam, spam gets muted, and the reminder that matters is the one that gets
     * missed. Stored here rather than in a log object because the dedupe key is
     * exactly one value per credential; a timestamp rather than a "YYYY-MM"
     * bucket because two reminders on Aug 31 and Sep 1 are the spam the rule
     * exists to prevent. Written only by that `runAs: 'system'` flow.
     */
    expiry_reminded_at: Field.datetime({
      label: 'Expiry Reminder Sent',
      readonly: true,
      description: 'When the expiry reminder (F5) last notified the candidate; the next reminder waits 30 days.',
    }),
  },

  validations: [
    {
      type: 'state_machine' as const,
      name: 'credential_verification_transitions',
      label: 'Credential Verification Transitions',
      description: 'A rejected credential may be resubmitted; a verified one is final.',
      field: 'verification_status',
      message: 'Invalid credential verification transition.',
      transitions: {
        pending:  ['verified', 'rejected'],
        rejected: ['pending'],
        verified: [],
      },
    },
  ],

  enable: { apiEnabled: true, searchable: true },
});
