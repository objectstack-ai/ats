import { defineFlow, cel } from '@objectstack/spec';

/**
 * F4 — application stage notification (DESIGN.md §05, card 12 / #7).
 *
 * Fires after an `ats_application` update whose `stage` actually changed and
 * puts one inbox message in the candidate's account, naming the new stage. The
 * recipient is the row's stamped `candidate_user` — the seeker-side scoping
 * stamp `ApplicationStampHook` writes on insert (stamp.hook.ts) — so the flow
 * addresses a user id directly and never hops the `candidate` lookup (a flow
 * template reads the trigger record as written: `{record.candidate.user}`
 * resolves to nothing, `{record.candidate_user}` resolves to the id).
 *
 * ## `last_activity_at` — one writer, and it is not this flow
 *
 * DESIGN.md §05 reads "refresh `last_activity_at`". That already happens on the
 * SAME write that changes the stage: `ApplicationStampHook` runs at
 * `beforeUpdate` and stamps `last_activity_at = now()` on any update whose
 * payload names a field of the application — which a stage change is. (It is
 * NOT unconditional, as this paragraph claimed before #65: a payload of only
 * bookkeeping columns — the ownership claim, a derived roll-up — deliberately
 * does not move the activity clock, and an authored value always wins. See
 * stamp.hook.ts, "What counts as activity on an application".) By the
 * time this `record-after-update` flow starts, the value is already the
 * timestamp of the stage change, and `record.last_activity_at` carries it. A
 * second `update_record` here would issue another write per stage change, run
 * the stamp hook again for a value it already holds, and make two writers of
 * one field — so the flow deliberately has none. Measured on cli 17.3.0: after
 * a stage PATCH, `last_activity_at` equals the row's `updated_at` (see the PR).
 *
 * ## Why `runAs` stays at the default
 *
 * The flow performs no data operation — a single `notify` — so there is nothing
 * to elevate. Running as the triggering user also threads that session's
 * organization onto the `sys_notification` / `sys_inbox_message` rows the
 * messaging service writes (#11303), which a system run would not carry.
 */
export const ApplicationStageNotifyFlow = defineFlow({
  name: 'application_stage_notify',
  label: 'Application Stage Notification',
  description: 'Tells the candidate, in their inbox, when an application moves to a new stage.',
  type: 'record_change',
  status: 'active',
  nodes: [
    {
      id: 'start',
      type: 'start',
      label: 'On Stage Changed',
      config: {
        objectName: 'ats_application',
        triggerType: 'record-after-update',
        // The TRANSITION, not every update of an application: a rating edit or
        // a note must not message the candidate. `previous` is the row before
        // the write, `record` the row after.
        condition: cel`record.stage != previous.stage`,
      },
    },
    {
      id: 'notify_candidate',
      type: 'notify',
      label: 'Notify Candidate',
      config: {
        recipients: '{record.candidate_user}',
        topic: 'ats.application_stage',
        severity: 'info',
        channels: ['inbox'],
        title: 'Application update: {record.display_name}',
        message: 'Your application has moved to the "{record.stage}" stage.',
        sourceObject: 'ats_application',
        sourceId: '{record.id}',
      },
    },
    { id: 'end', type: 'end', label: 'Notified' },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'notify_candidate' },
    { id: 'e2', source: 'notify_candidate', target: 'end' },
  ],
});
