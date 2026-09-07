import { defineFlow, cel } from '@objectstack/spec';

/**
 * F3 — offer approval (DESIGN.md §05). The employer's own internal sign-off:
 * a recruiter moves an offer to `pending_approval`, an administrator of that
 * employer approves or sends it back, and the submitter is told either way.
 *
 * Approve → `approved`, `approved_by` = the administrator who decided.
 * Reject → `draft`. Both are the transitions the offer state machine allows
 * from `pending_approval`; nothing is widened.
 *
 * ## Who approves — the employer's admins, resolved without traversal
 *
 * The approver slate is "the `employer_admin` members of THIS offer's
 * employer", never every administrator on the platform. The slate is computed
 * from `ats_employer_member` — the pivot every employer-side rule resolves
 * through — by comparing the member's `employer` scalar to the offer's stamped
 * `employer` scalar (`get_record`), then folding the rows into one CSV string
 * of user ids (a `loop` whose body appends `{member.user}` by template
 * interpolation) and handing that string to an `expression` approver over
 * `vars.*`. The approver contract accepts a CSV string; the fold is spelled
 * with templates rather than a CEL comprehension because the approver's
 * expression only admits the `current` / `trigger` / `vars` roots (a
 * comprehension variable is refused there) and the `assignment` node
 * interpolates templates rather than evaluating CEL.
 *
 * The other spelling, `{ type: 'position', value: 'employer_admin' }`, would
 * lean on the runtime scoping the position lookup to the request's
 * organization; it is exact only once every employer is its own organization
 * (DESIGN.md §03) and is a cross-employer slate until then, so the member
 * table is the boundary that holds today.
 *
 * An employer with no active administrator yields an empty slate:
 * `onEmptyApprovers: 'admin_rescue'` opens the request for a platform admin to
 * reassign rather than waving the offer through or killing the run.
 *
 * ## Who is "the submitter"
 *
 * The user whose update fired the flow. Captured into a flow variable before
 * the run parks on the approval node, so the value survives the pause and does
 * not depend on who resumed the run.
 */
export const OfferApprovalFlow = defineFlow({
  name: 'offer_approval',
  label: 'Offer Approval',
  description: "An employer administrator approves a recruiter's offer before it is sent.",
  type: 'record_change',
  status: 'active',
  runAs: 'system',
  variables: [
    { name: 'submitter_id', type: 'text', isInput: false, isOutput: false },
    { name: 'employer_admins', type: 'list', isInput: false, isOutput: false },
    { name: 'employer_admin_csv', type: 'text', isInput: false, isOutput: false },
  ],
  nodes: [
    {
      id: 'start',
      type: 'start',
      label: 'On Offer Submitted for Approval',
      config: {
        objectName: 'ats_offer',
        triggerType: 'record-after-update',
        condition: cel`record.status == "pending_approval" && previous.status != "pending_approval"`,
      },
    },
    {
      id: 'capture_submitter',
      type: 'assignment',
      label: 'Capture Submitter',
      config: {
        assignments: { submitter_id: '{$User.Id}' },
      },
    },
    {
      id: 'load_employer_admins',
      type: 'get_record',
      label: 'Load Employer Administrators',
      config: {
        objectName: 'ats_employer_member',
        filter: { employer: '{record.employer}', access_level: 'admin', is_active: true },
        fields: ['user'],
        limit: 200,
        outputVariable: 'employer_admins',
      },
    },
    {
      id: 'init_admin_csv',
      type: 'assignment',
      label: 'Start Administrator List',
      config: {
        assignments: { employer_admin_csv: '' },
      },
    },
    {
      id: 'collect_admin_csv',
      type: 'loop',
      label: 'Collect Administrator User Ids',
      config: {
        collection: '{employer_admins}',
        iteratorVariable: 'member',
        maxIterations: 200,
        body: {
          nodes: [
            {
              id: 'append_admin',
              type: 'assignment',
              label: 'Append Administrator',
              config: {
                // Leading separators are harmless: the approver contract splits
                // on commas and drops empty entries.
                assignments: { employer_admin_csv: '{employer_admin_csv},{member.user}' },
              },
            },
          ],
          edges: [],
        },
      },
    },
    {
      id: 'admin_review',
      type: 'approval',
      label: 'Employer Administrator Approval',
      config: {
        approvers: [{ type: 'expression', value: 'vars.employer_admin_csv' }],
        behavior: 'first_response',
        // Offer terms must not change while they are being signed off.
        lockRecord: true,
        onEmptyApprovers: 'admin_rescue',
      },
    },
    {
      id: 'load_approval',
      type: 'get_record',
      label: 'Read Approval',
      config: {
        objectName: 'sys_approval_action',
        filter: { request_id: '{admin_review.requestId}', action: 'approve' },
        fields: ['actor_id'],
        outputVariable: 'approval',
      },
    },
    {
      id: 'approve_offer',
      type: 'update_record',
      label: 'Approve Offer',
      config: {
        objectName: 'ats_offer',
        filter: { id: '{record.id}' },
        fields: { status: 'approved', approved_by: '{approval.actor_id}' },
      },
    },
    {
      id: 'notify_approved',
      type: 'notify',
      label: 'Notify Submitter: Approved',
      config: {
        recipients: '{submitter_id}',
        topic: 'ats.offer_approval',
        severity: 'info',
        channels: ['inbox'],
        title: 'Offer approved: {record.display_name}',
        message: 'The offer was approved and can now be sent to the candidate.',
        sourceObject: 'ats_offer',
        sourceId: '{record.id}',
      },
    },
    {
      id: 'load_rejection',
      type: 'get_record',
      label: 'Read Rejection',
      config: {
        objectName: 'sys_approval_action',
        filter: { request_id: '{admin_review.requestId}', action: 'reject' },
        fields: ['comment'],
        outputVariable: 'rejection',
      },
    },
    {
      id: 'return_to_draft',
      type: 'update_record',
      label: 'Return to Draft',
      config: {
        objectName: 'ats_offer',
        filter: { id: '{record.id}' },
        fields: { status: 'draft' },
      },
    },
    {
      id: 'notify_rejected',
      type: 'notify',
      label: 'Notify Submitter: Returned',
      config: {
        recipients: '{submitter_id}',
        topic: 'ats.offer_approval',
        severity: 'warning',
        channels: ['inbox'],
        title: 'Offer returned to draft: {record.display_name}',
        message: 'The offer was not approved and is back in draft. Comment: {rejection.comment}',
        sourceObject: 'ats_offer',
        sourceId: '{record.id}',
      },
    },
    { id: 'end_approved', type: 'end', label: 'Approved' },
    { id: 'end_returned', type: 'end', label: 'Returned to Draft' },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'capture_submitter' },
    { id: 'e2', source: 'capture_submitter', target: 'load_employer_admins' },
    { id: 'e3', source: 'load_employer_admins', target: 'init_admin_csv' },
    { id: 'e4', source: 'init_admin_csv', target: 'collect_admin_csv' },
    { id: 'e4b', source: 'collect_admin_csv', target: 'admin_review' },
    { id: 'e5', source: 'admin_review', target: 'load_approval', label: 'approve' },
    { id: 'e6', source: 'admin_review', target: 'load_rejection', label: 'reject' },
    { id: 'e7', source: 'load_approval', target: 'approve_offer' },
    { id: 'e8', source: 'approve_offer', target: 'notify_approved' },
    { id: 'e9', source: 'notify_approved', target: 'end_approved' },
    { id: 'e10', source: 'load_rejection', target: 'return_to_draft' },
    { id: 'e11', source: 'return_to_draft', target: 'notify_rejected' },
    { id: 'e12', source: 'notify_rejected', target: 'end_returned' },
  ],
});
