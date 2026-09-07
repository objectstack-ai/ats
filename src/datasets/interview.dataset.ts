import { defineDataset } from '@objectstack/spec/ui';

/**
 * The analytics face of `ats_interview` (card 13) — "interviews this week" on
 * the employer dashboard. Grain is the interview round. The dashboard's
 * window is a widget filter on `scheduled_at` (`{current_week_start}` to
 * `{next_week_start}`, half-open because `*_end` macros are calendar days and
 * `scheduled_at` is a timestamp); the week bucket here serves a per-week chart.
 *
 * `ats_interview` is `controlled_by_parent`: which rows a caller aggregates is
 * the application's row-level rule. It is also one of the four tenancy-walled
 * objects platform personas cannot read on sqlite (#39) — the employer
 * dashboard is read by employer personas, whom #39 does not touch.
 */
export const InterviewMetrics = defineDataset({
  name: 'ats_interview_metrics',
  label: 'Interview Metrics',
  description: 'Interview rounds by status, mode and week scheduled. Slice with a widget filter; one count measure.',
  object: 'ats_interview',
  dimensions: [
    { name: 'status', field: 'status', type: 'string', label: 'Status' },
    { name: 'mode', field: 'mode', type: 'string', label: 'Mode' },
    { name: 'scheduled_at', field: 'scheduled_at', type: 'date', dateGranularity: 'week', label: 'Week Scheduled' },
  ],
  measures: [
    { name: 'interview_count', aggregate: 'count', label: 'Interviews' },
  ],
});
