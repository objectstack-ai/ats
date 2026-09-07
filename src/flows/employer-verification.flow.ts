import { defineFlow, cel } from '@objectstack/spec';

/**
 * F1 — employer verification (DESIGN.md §05).
 *
 * Fires when `ats_employer.verification_status` becomes `pending`. Two
 * successive approval nodes carry the review: platform operations first,
 * then a platform administrator. Approve → `verified` and an inbox message to
 * the employer's primary contact. Reject at either step → `rejected`, with the
 * reviewer's comment copied onto `verification_note`.
 *
 * `verification_note` is platform-internal (field-level security hides it from
 * every employer-side and seeker role, DESIGN.md §03), so nothing seeker- or
 * employer-visible is written on rejection — the status change is the only
 * signal the employer gets, by design.
 *
 * Transitions written here are the ones the object's state machine allows:
 * `pending → verified` and `pending → rejected`. Nothing is widened.
 *
 * ## Why `runAs: 'system'`
 *
 * The post-decision writes are approval-process outcomes, not acts of the
 * submitter or of the reviewer. Running them as the system principal makes
 * them land regardless of which role resumed the run; attribution
 * (`updated_by`) still carries the triggering user (#5494).
 *
 * ## Where the reviewer's comment comes from
 *
 * A decision resumes the run with `{ decision, requestId }` only — the comment
 * is not on the resume envelope. It lives on the `sys_approval_action` row the
 * decision wrote, so each reject branch reads that row back by request id
 * before writing the note.
 */
export const EmployerVerificationFlow = defineFlow({
  name: 'employer_verification',
  label: 'Employer Verification',
  description: 'Two-step platform review of a newly submitted employer: operations, then an administrator.',
  type: 'record_change',
  status: 'active',
  runAs: 'system',
  nodes: [
    {
      id: 'start',
      type: 'start',
      label: 'On Verification Submitted',
      config: {
        objectName: 'ats_employer',
        triggerType: 'record-after-update',
        // Gate on the TRANSITION into `pending`, not on every update of a
        // pending employer — otherwise an unrelated edit would re-open a review.
        condition: cel`record.verification_status == "pending" && previous.verification_status != "pending"`,
      },
    },
    {
      id: 'ops_review',
      type: 'approval',
      label: 'Platform Operations Review',
      config: {
        approvers: [{ type: 'position', value: 'platform_ops' }],
        behavior: 'first_response',
        // The documents under review must not move while ops reads them.
        lockRecord: true,
      },
    },
    {
      id: 'admin_review',
      type: 'approval',
      label: 'Platform Administrator Review',
      config: {
        approvers: [{ type: 'position', value: 'platform_admin' }],
        behavior: 'first_response',
        lockRecord: true,
      },
    },
    {
      id: 'mark_verified',
      type: 'update_record',
      label: 'Mark Verified',
      config: {
        objectName: 'ats_employer',
        filter: { id: '{record.id}' },
        fields: { verification_status: 'verified' },
      },
    },
    {
      id: 'notify_owner',
      type: 'notify',
      label: 'Notify Primary Contact',
      config: {
        recipients: '{record.owner}',
        topic: 'ats.employer_verification',
        severity: 'info',
        channels: ['inbox'],
        title: 'Employer verified: {record.name}',
        message: 'Your organisation has passed platform verification and can now publish jobs.',
        sourceObject: 'ats_employer',
        sourceId: '{record.id}',
      },
    },
    {
      id: 'load_ops_rejection',
      type: 'get_record',
      label: 'Read Operations Rejection',
      config: {
        objectName: 'sys_approval_action',
        filter: { request_id: '{ops_review.requestId}', action: 'reject' },
        fields: ['comment'],
        outputVariable: 'rejection',
      },
    },
    {
      id: 'load_admin_rejection',
      type: 'get_record',
      label: 'Read Administrator Rejection',
      config: {
        objectName: 'sys_approval_action',
        filter: { request_id: '{admin_review.requestId}', action: 'reject' },
        fields: ['comment'],
        outputVariable: 'rejection',
      },
    },
    {
      id: 'mark_rejected',
      type: 'update_record',
      label: 'Mark Rejected',
      config: {
        objectName: 'ats_employer',
        filter: { id: '{record.id}' },
        fields: {
          verification_status: 'rejected',
          // Platform-internal: hidden from employer and seeker roles by FLS.
          verification_note: '{rejection.comment}',
        },
      },
    },
    { id: 'end_verified', type: 'end', label: 'Verified' },
    { id: 'end_rejected', type: 'end', label: 'Rejected' },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'ops_review' },
    { id: 'e2', source: 'ops_review', target: 'admin_review', label: 'approve' },
    { id: 'e3', source: 'ops_review', target: 'load_ops_rejection', label: 'reject' },
    { id: 'e4', source: 'admin_review', target: 'mark_verified', label: 'approve' },
    { id: 'e5', source: 'admin_review', target: 'load_admin_rejection', label: 'reject' },
    { id: 'e6', source: 'mark_verified', target: 'notify_owner' },
    { id: 'e7', source: 'notify_owner', target: 'end_verified' },
    // Both reject branches converge on one write; only one of them runs per run.
    { id: 'e8', source: 'load_ops_rejection', target: 'mark_rejected' },
    { id: 'e9', source: 'load_admin_rejection', target: 'mark_rejected' },
    { id: 'e10', source: 'mark_rejected', target: 'end_rejected' },
  ],
});
