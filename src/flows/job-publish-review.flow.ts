import { defineFlow, cel } from '@objectstack/spec';

/**
 * F2 — job publish review (DESIGN.md §05).
 *
 * Fires when `ats_job.status` becomes `pending_review`. One approval node,
 * routed to the `platform_ops` position. Approve → `published` with
 * `published_at` stamped now. Reject → `rejected`, with the reviewer's comment
 * copied onto `rejection_reason` (the employer-visible field — `review_note`
 * stays platform-internal and is not touched here). Either way the employer's
 * administrators — its `ats_employer_member` rows with `access_level == 'admin'`
 * — get an inbox message.
 *
 * Transitions written: `pending_review → published` and
 * `pending_review → rejected`, both allowed by the job state machine.
 *
 * ## Resolving "the job's employer admins" without traversal
 *
 * A row-level predicate cannot walk a lookup (ADR-0055) and neither can a
 * template. The members are read once, before the run parks, with a
 * `get_record` whose filter compares the member's `employer` scalar to the
 * job's `employer` scalar; each branch then iterates that list with a `loop`
 * and sends one inbox message per administrator (`{member.user}`). A loop
 * rather than a projected id list on purpose: the `assignment` node
 * interpolates `{token}` templates and literals — it does not evaluate a CEL
 * list comprehension — so there is no declarative way to turn rows into an id
 * array that `notify` would accept as `recipients`.
 *
 * `runAs: 'system'` for the same reason as F1: the writes are process outcomes,
 * and attribution still carries the triggering user (#5494).
 */
export const JobPublishReviewFlow = defineFlow({
  name: 'job_publish_review',
  label: 'Job Publish Review',
  description: 'Platform operations reviews a submitted job; publish it or return it with a reason.',
  type: 'record_change',
  status: 'active',
  runAs: 'system',
  variables: [
    { name: 'employer_admins', type: 'list', isInput: false, isOutput: false },
    { name: 'last_notify_error', type: 'text', isInput: false, isOutput: false },
  ],
  nodes: [
    {
      id: 'start',
      type: 'start',
      label: 'On Job Submitted for Review',
      config: {
        objectName: 'ats_job',
        triggerType: 'record-after-update',
        condition: cel`record.status == "pending_review" && previous.status != "pending_review"`,
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
      id: 'ops_review',
      type: 'approval',
      label: 'Platform Operations Review',
      config: {
        approvers: [{ type: 'position', value: 'platform_ops' }],
        behavior: 'first_response',
        // The posting under review must not change under the reviewer.
        lockRecord: true,
      },
    },
    {
      id: 'publish_job',
      type: 'update_record',
      label: 'Publish Job',
      config: {
        objectName: 'ats_job',
        filter: { id: '{record.id}' },
        fields: { status: 'published', published_at: '{NOW()}' },
      },
    },
    {
      id: 'notify_published',
      type: 'loop',
      label: 'Notify Employer Administrators: Published',
      config: {
        collection: '{employer_admins}',
        iteratorVariable: 'member',
        maxIterations: 200,
        body: {
          nodes: [
            {
              // A failed delivery to one administrator must not end the run
              // before the others are told (the loop body has no error
              // containment of its own); the state change above already landed.
              id: 'guard_notify_published',
              type: 'try_catch',
              label: 'Notify Administrator: Published (guarded)',
              config: {
                try: {
                  nodes: [
                    {
                      id: 'notify_published_member',
                      type: 'notify',
                      label: 'Notify Administrator: Published',
                      config: {
                        recipients: '{member.user}',
                        topic: 'ats.job_review',
                        severity: 'info',
                        channels: ['inbox'],
                        title: 'Job published: {record.title}',
                        message: 'Your job "{record.title}" passed platform review and is now visible to job seekers.',
                        sourceObject: 'ats_job',
                        sourceId: '{record.id}',
                      },
                    },
                  ],
                  edges: [],
                },
                catch: {
                  nodes: [
                    {
                      id: 'note_notify_published_failure',
                      type: 'assignment',
                      label: 'Record Failed Delivery',
                      config: { assignments: { last_notify_error: '{$error.message}' } },
                    },
                  ],
                  edges: [],
                },
              },
            },
          ],
          edges: [],
        },
      },
    },
    {
      id: 'load_rejection',
      type: 'get_record',
      label: 'Read Rejection',
      config: {
        objectName: 'sys_approval_action',
        filter: { request_id: '{ops_review.requestId}', action: 'reject' },
        fields: ['comment'],
        outputVariable: 'rejection',
      },
    },
    {
      id: 'reject_job',
      type: 'update_record',
      label: 'Reject Job',
      config: {
        objectName: 'ats_job',
        filter: { id: '{record.id}' },
        fields: { status: 'rejected', rejection_reason: '{rejection.comment}' },
      },
    },
    {
      id: 'notify_rejected',
      type: 'loop',
      label: 'Notify Employer Administrators: Rejected',
      config: {
        collection: '{employer_admins}',
        iteratorVariable: 'member',
        maxIterations: 200,
        body: {
          nodes: [
            {
              // A failed delivery to one administrator must not end the run
              // before the others are told (the loop body has no error
              // containment of its own); the state change above already landed.
              id: 'guard_notify_rejected',
              type: 'try_catch',
              label: 'Notify Administrator: Rejected (guarded)',
              config: {
                try: {
                  nodes: [
                    {
                      id: 'notify_rejected_member',
                      type: 'notify',
                      label: 'Notify Administrator: Rejected',
                      config: {
                        recipients: '{member.user}',
                        topic: 'ats.job_review',
                        severity: 'warning',
                        channels: ['inbox'],
                        title: 'Job returned: {record.title}',
                        message: 'Your job "{record.title}" was not approved for publication. Reason: {rejection.comment}',
                        sourceObject: 'ats_job',
                        sourceId: '{record.id}',
                      },
                    },
                  ],
                  edges: [],
                },
                catch: {
                  nodes: [
                    {
                      id: 'note_notify_rejected_failure',
                      type: 'assignment',
                      label: 'Record Failed Delivery',
                      config: { assignments: { last_notify_error: '{$error.message}' } },
                    },
                  ],
                  edges: [],
                },
              },
            },
          ],
          edges: [],
        },
      },
    },
    { id: 'end_published', type: 'end', label: 'Published' },
    { id: 'end_rejected', type: 'end', label: 'Rejected' },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'load_employer_admins' },
    { id: 'e2', source: 'load_employer_admins', target: 'ops_review' },
    { id: 'e3', source: 'ops_review', target: 'publish_job', label: 'approve' },
    { id: 'e4', source: 'ops_review', target: 'load_rejection', label: 'reject' },
    { id: 'e5', source: 'publish_job', target: 'notify_published' },
    { id: 'e6', source: 'notify_published', target: 'end_published' },
    { id: 'e7', source: 'load_rejection', target: 'reject_job' },
    { id: 'e8', source: 'reject_job', target: 'notify_rejected' },
    { id: 'e9', source: 'notify_rejected', target: 'end_rejected' },
  ],
});
