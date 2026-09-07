import { defineFlow, cel } from '@objectstack/spec';

/**
 * F5 — credential expiry reminder (DESIGN.md §05, card 12 / #7).
 *
 * Daily at 08:00: every `verified` credential that is expiring (the object's
 * `is_expiring` window — `expires_at` within the next 90 days) earns its
 * candidate one inbox message, and then no further message for 30 days.
 *
 * ## Why this is a scheduled FLOW and not a `defineJob`
 *
 * Card 12 names `src/jobs/*.job.ts`. Measured on cli 17.3.0, a `defineJob`
 * handler is invoked with `{ jobId, data, bundle, ql, logger }`
 * (`JobHandlerContext`, @objectstack/runtime) — a data engine and a logger,
 * and no handle on the messaging service; `IObjectQLEngine` has no
 * `getService`, and an object hook's context has no `services` key either
 * (hook.zod.ts). The only in-app door to the inbox is the flow `notify` node,
 * which resolves the `messaging` service itself. So a job could sweep and mark
 * but never deliver, and the delivery would have to be a second, record-
 * triggered flow watching the marker. A `schedule`-type flow does the whole
 * thing on one governed graph — and it is still scheduled work: the
 * `triggers` capability's `ScheduleTriggerPlugin` binds it onto the job
 * service as job `flow-schedule:credential_expiry_reminder` (the service that
 * `approvals` in `requires:` pulls in). One more reason, also measured: top-
 * level `functions` are never lowered to a metadata body (`lower-callables`),
 * so any `defineJob` would make `objectstack build` emit a bundled runtime
 * module, and this app's artifact would stop being metadata only.
 *
 * ## Dedupe — `expiry_reminded_at` on the credential, 30 rolling days
 *
 * The card's key is "credential id + month". The key lives on the credential
 * as a timestamp: the daily run reads `expiry_reminded_at` and skips a row
 * reminded within the last 30 days (`720h`). A calendar-month bucket would
 * allow a reminder on the 31st and another on the 1st — exactly the
 * back-to-back pair the rule exists to prevent — and a timestamp also tells an
 * operator WHEN the candidate was last told. No log object: the state is one
 * value per credential, and a second object would be a second truth.
 *
 * The 30-day check is a CEL edge condition rather than part of the query: a
 * filter can bound dates only in whole-day `{TODAY() + N}` steps, and the
 * comparison against `null` (never reminded) is one expression here and a
 * driver-dependent `IS NULL` dance there.
 *
 * ## `runAs: 'system'`
 *
 * A scheduled run has no trigger user. Both credential and candidate sit
 * outside the tenant wall (`tenancy: { enabled: false }`), so the sweep has no
 * organization to pin and reads the whole platform — which is the intended
 * audience: every candidate with a lapsing verified credential.
 *
 * Timezone: the card says "business tz" without naming one and DESIGN.md
 * names none; the cron runs in the platform default (UTC) until a maintainer
 * picks one — the one-line change is `timezone` on the start node's schedule.
 */
export const CredentialExpiryReminderFlow = defineFlow({
  name: 'credential_expiry_reminder',
  label: 'Credential Expiry Reminder',
  description: 'Daily: reminds candidates whose verified credentials expire within 90 days, at most once per credential per 30 days.',
  type: 'schedule',
  status: 'active',
  runAs: 'system',
  variables: [
    { name: 'expiring', type: 'list', isInput: false, isOutput: false },
  ],
  nodes: [
    {
      id: 'start',
      type: 'start',
      label: 'Daily at 08:00',
      config: {
        schedule: { type: 'cron', expression: '0 8 * * *' },
      },
    },
    {
      id: 'load_expiring',
      type: 'get_record',
      label: 'Load Expiring Verified Credentials',
      config: {
        objectName: 'ats_candidate_credential',
        // The same window `is_expiring` computes, as a query: today through
        // today + 90 days, verified only. The 30-day dedupe is decided per row
        // below, where `null` compares cleanly.
        filter: {
          verification_status: 'verified',
          expires_at: { $gte: '{TODAY()}', $lte: '{TODAY() + 90}' },
        },
        fields: ['id', 'display_name', 'candidate', 'expires_at', 'expiry_reminded_at'],
        limit: 1000,
        outputVariable: 'expiring',
      },
    },
    {
      id: 'each_credential',
      type: 'loop',
      label: 'For Each Expiring Credential',
      config: {
        collection: '{expiring}',
        iteratorVariable: 'credential',
        maxIterations: 1000,
        body: {
          nodes: [
            { id: 'due_check', type: 'decision', label: 'Reminded in the Last 30 Days?' },
            {
              // One credential's failure (a candidate row gone, a notify
              // refusal) must not end the sweep for every credential after it:
              // `loop` awaits its body bare, so an unhandled failure propagates
              // out of the container (`objectstack validate` says so). The
              // catch region records nothing — the run trace keeps the failed
              // step — and the loop moves to the next credential.
              id: 'remind',
              type: 'try_catch',
              label: 'Remind (Isolated per Credential)',
              config: {
                try: {
                  nodes: [
                    {
                      id: 'load_candidate',
                      type: 'get_record',
                      label: 'Load Candidate',
                      config: {
                        objectName: 'ats_candidate',
                        filter: { id: '{credential.candidate}' },
                        fields: ['id', 'user', 'full_name'],
                        outputVariable: 'candidate',
                      },
                    },
                    {
                      id: 'notify_candidate',
                      type: 'notify',
                      label: 'Notify Candidate',
                      config: {
                        recipients: '{candidate.user}',
                        topic: 'ats.credential_expiry',
                        severity: 'warning',
                        channels: ['inbox'],
                        title: 'Credential expiring soon: {credential.display_name}',
                        message: 'Your credential "{credential.display_name}" expires on {credential.expires_at}. Renew it before then to keep it verified.',
                        sourceObject: 'ats_candidate_credential',
                        sourceId: '{credential.id}',
                      },
                    },
                    {
                      id: 'mark_reminded',
                      type: 'update_record',
                      label: 'Stamp Reminder Time',
                      config: {
                        objectName: 'ats_candidate_credential',
                        filter: { id: '{credential.id}' },
                        fields: { expiry_reminded_at: '{NOW()}' },
                      },
                    },
                  ],
                  edges: [
                    { id: 't1', source: 'load_candidate', target: 'notify_candidate' },
                    { id: 't2', source: 'notify_candidate', target: 'mark_reminded' },
                  ],
                },
                catch: {
                  nodes: [
                    {
                      id: 'reminder_failed',
                      type: 'assignment',
                      label: 'Reminder Failed for This Credential',
                      config: { assignments: {} },
                    },
                  ],
                  edges: [],
                },
              },
            },
            {
              // The body's single exit: the engine registers a loop body only
              // when its region has exactly one exit node, so the "due" branch
              // (through the try_catch) and the "not due" branch both end here.
              id: 'done',
              type: 'assignment',
              label: 'Next',
              config: { assignments: {} },
            },
          ],
          edges: [
            {
              id: 'b1',
              source: 'due_check',
              target: 'remind',
              label: 'due',
              // `has()` first: a row whose column is NULL comes back WITHOUT the key
              // (measured on the memory driver), and CEL faults on a missing key
              // instead of comparing it to null.
              condition: cel`!has(credential.expiry_reminded_at) || credential.expiry_reminded_at == null || timestamp(credential.expiry_reminded_at) < now() - duration("720h")`,
            },
            {
              id: 'b2',
              source: 'due_check',
              target: 'done',
              label: 'recent',
              condition: cel`has(credential.expiry_reminded_at) && credential.expiry_reminded_at != null && timestamp(credential.expiry_reminded_at) >= now() - duration("720h")`,
            },
            { id: 'b3', source: 'remind', target: 'done' },
          ],
        },
      },
    },
    { id: 'end', type: 'end', label: 'Done' },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'load_expiring' },
    { id: 'e2', source: 'load_expiring', target: 'each_credential' },
    { id: 'e3', source: 'each_credential', target: 'end' },
  ],
});
