import { defineFlow, cel } from '@objectstack/spec';

/**
 * F6 — interview reminder (DESIGN.md §05, card 12 / #7).
 *
 * Hourly: every `scheduled` interview whose `scheduled_at` is 23–25 hours
 * away gets one reminder to the candidate and one to every interviewer, and
 * is marked `reminder_sent` so no later run repeats it. The two-hour window
 * around T-24h exists because the run is hourly: an interview is inside it on
 * exactly one run, and `reminder_sent` covers the case where a run is late or
 * replayed.
 *
 * A scheduled flow rather than a `defineJob` for the reasons measured in
 * credential-expiry-reminder.flow.ts: a job handler has no route to the
 * messaging service, and `functions` would cost the artifact its
 * metadata-only shape. The hour arithmetic is why the window is decided in a
 * CEL edge condition and not in the query: filter templates offer `{NOW()}`
 * and whole-day `{TODAY() + N}`, nothing finer.
 *
 * ## Recipients — two notify nodes, on purpose
 *
 * The candidate's user id is the parent application's `candidate_user` stamp
 * (one `get_record` hop, no lookup traversal). `interviewers` is a multi-user
 * field, and it is handed to `notify` as a WHOLE-STRING token
 * (`recipients: '{interview.interviewers}'`), which the template engine
 * returns as the raw array. Mixing both into one `recipients` array would
 * nest the interviewer array inside it, `notify` would stringify it to
 * `"id1,id2"`, and the recipient resolver — which treats a bare string as one
 * user id and never splits on commas — would address a user literally named
 * "id1,id2". Two nodes keep both audiences honest and let the wording differ.
 *
 * ## `runAs: 'system'`
 *
 * No trigger user on a schedule, and `reminder_sent` is `readonly` — a
 * non-system write to it is dropped from the payload, so the mark would never
 * land under `runAs: 'user'`. `ats_interview` sits inside the tenant wall; a
 * system read spans employers, which is what an hourly platform sweep needs.
 */
export const InterviewReminderFlow = defineFlow({
  name: 'interview_reminder',
  label: 'Interview Reminder',
  description: 'Hourly: 24 hours before a scheduled interview, reminds the candidate and every interviewer once.',
  type: 'schedule',
  status: 'active',
  runAs: 'system',
  variables: [
    { name: 'upcoming', type: 'list', isInput: false, isOutput: false },
  ],
  nodes: [
    {
      id: 'start',
      type: 'start',
      label: 'Hourly',
      config: {
        schedule: { type: 'cron', expression: '0 * * * *' },
      },
    },
    {
      id: 'load_upcoming',
      type: 'get_record',
      label: 'Load Upcoming Scheduled Interviews',
      config: {
        objectName: 'ats_interview',
        // Coarse selection: still scheduled, not yet reminded, in the future.
        // The 23–25h window is decided per row below.
        filter: {
          status: 'scheduled',
          scheduled_at: { $gte: '{NOW()}' },
        },
        fields: ['id', 'display_name', 'application', 'scheduled_at', 'interviewers', 'reminder_sent'],
        limit: 1000,
        outputVariable: 'upcoming',
      },
    },
    {
      id: 'each_interview',
      type: 'loop',
      label: 'For Each Upcoming Interview',
      config: {
        collection: '{upcoming}',
        iteratorVariable: 'interview',
        maxIterations: 1000,
        body: {
          nodes: [
            { id: 'window_check', type: 'decision', label: 'Inside the 23–25h Window?' },
            {
              // Isolate each interview: `loop` awaits its body bare, so one
              // failure (an application gone, an empty interviewer list) would
              // otherwise end the sweep for every interview after it. The
              // catch region records nothing — the trace keeps the failed step.
              id: 'remind',
              type: 'try_catch',
              label: 'Remind (Isolated per Interview)',
              config: {
                try: {
                  nodes: [
                    {
                      id: 'load_application',
                      type: 'get_record',
                      label: 'Load Application',
                      config: {
                        objectName: 'ats_application',
                        filter: { id: '{interview.application}' },
                        fields: ['id', 'candidate_user', 'display_name'],
                        outputVariable: 'application',
                      },
                    },
                    {
                      id: 'notify_candidate',
                      type: 'notify',
                      label: 'Notify Candidate',
                      config: {
                        recipients: '{application.candidate_user}',
                        topic: 'ats.interview_reminder',
                        severity: 'info',
                        channels: ['inbox'],
                        title: 'Interview tomorrow: {interview.display_name}',
                        message: 'Reminder: your interview for {application.display_name} is scheduled at {interview.scheduled_at}.',
                        sourceObject: 'ats_interview',
                        sourceId: '{interview.id}',
                      },
                    },
                    {
                      id: 'notify_interviewers',
                      type: 'notify',
                      label: 'Notify Interviewers',
                      config: {
                        recipients: '{interview.interviewers}',
                        topic: 'ats.interview_reminder',
                        severity: 'info',
                        channels: ['inbox'],
                        title: 'Interview tomorrow: {interview.display_name}',
                        message: 'Reminder: you are interviewing for {application.display_name} at {interview.scheduled_at}.',
                        sourceObject: 'ats_interview',
                        sourceId: '{interview.id}',
                      },
                    },
                    {
                      id: 'mark_sent',
                      type: 'update_record',
                      label: 'Mark Reminder Sent',
                      config: {
                        objectName: 'ats_interview',
                        filter: { id: '{interview.id}' },
                        fields: { reminder_sent: true },
                      },
                    },
                  ],
                  edges: [
                    { id: 't1', source: 'load_application', target: 'notify_candidate' },
                    { id: 't2', source: 'notify_candidate', target: 'notify_interviewers' },
                    { id: 't3', source: 'notify_interviewers', target: 'mark_sent' },
                  ],
                },
                catch: {
                  nodes: [
                    {
                      id: 'reminder_failed',
                      type: 'assignment',
                      label: 'Reminder Failed for This Interview',
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
              source: 'window_check',
              target: 'remind',
              label: 'due',
              // `has()` first: a NULL column comes back without its key (measured on
              // the memory driver) and CEL faults on a missing key.
              condition: cel`(!has(interview.reminder_sent) || interview.reminder_sent != true) && timestamp(interview.scheduled_at) >= now() + duration("23h") && timestamp(interview.scheduled_at) < now() + duration("25h")`,
            },
            {
              id: 'b2',
              source: 'window_check',
              target: 'done',
              label: 'not due',
              condition: cel`(has(interview.reminder_sent) && interview.reminder_sent == true) || timestamp(interview.scheduled_at) < now() + duration("23h") || timestamp(interview.scheduled_at) >= now() + duration("25h")`,
            },
            { id: 'b3', source: 'remind', target: 'done' },
          ],
        },
      },
    },
    { id: 'end', type: 'end', label: 'Done' },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'load_upcoming' },
    { id: 'e2', source: 'load_upcoming', target: 'each_interview' },
    { id: 'e3', source: 'each_interview', target: 'end' },
  ],
});
