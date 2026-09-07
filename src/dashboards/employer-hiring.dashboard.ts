import type { Dashboard } from '@objectstack/spec/ui';

/**
 * `ats_employer_hiring` — one employer's hiring at a glance (card 13,
 * DESIGN.md §04: 在招岗位 · 待处理简历 · 本周面试 · 平均到 Offer 天数).
 *
 * Scoped to the viewer's employer by row-level security, not by a dashboard
 * filter: the analytics runtime applies the caller's read scope per object,
 * and every employer-side policy keys on the stamped `employer_org` (#44,
 * #46). Quillstone's administrator and Harborline's read different numbers
 * from the same widgets, and platform staff read the whole marketplace.
 *
 * All four of the card's tiles are here. The fourth — "Average Days to
 * Offer" — reads `avg(ats_application.days_to_offer)` over this employer's
 * HIRED applications, and it took three things that did not exist when the
 * dashboard was first built:
 *   - a STORED column. `days_to_offer` is a duration between `applied_at` on
 *     the application and `created_at` on the offer; a dataset measure
 *     aggregates one column of one object and its only computed form combines
 *     OTHER MEASURES by name, so the duration had to become a column before
 *     the semantic layer could touch it. It is written once, by the
 *     `afterInsert` hook on `ats_offer` (`src/hooks/stamp.hook.ts`).
 *   - `avg`, not median. The aggregate set is
 *     `count/sum/avg/min/max/count_distinct`; DESIGN.md §04 asks for the
 *     average (「平均到 Offer 天数」) and that is what this reports.
 *   - the seed. Nine `accepted` offers, one per hired application (#53/#64) —
 *     before them the tile would have been an empty average over zero rows.
 * `AVG` ignores NULLs, so the denominator is the hired applications that
 * actually reached an offer, not every hired row.
 *
 * ⚠️ On the DEMO SEED this tile's number is not the history it looks like.
 * `created_at` is the platform's own stamp, so every seeded offer is created
 * at boot, and `days_to_offer` therefore equals the application's AGE for all
 * 23 stamped rows — measured against `appliedDaysAgo` in the seed skeleton,
 * exact match on all nine hired. Quillstone's 30 and Harborline's 58 are
 * "filed 30 / 58 days ago", not "took 30 / 58 days to decide". The metric
 * itself is right; it is the seed that has no real elapsed time in it (#65).
 * Nothing here can fix that — a seed cannot set `created_at` — so the tile is
 * honest about what it computes and this note is honest about what the demo
 * feeds it. The stage filter is a
 * WIDGET filter (the query's WHERE), never a measure-scoped one: the memory
 * driver answers `501 NOT_IMPLEMENTED` to a conditional aggregate.
 *
 * "This week" is Monday 00:00 (`{current_week_start}`) up to but excluding
 * next Monday (`{next_week_start}`): `*_end` macros are calendar days, and
 * `scheduled_at` is a timestamp.
 */
export const EmployerHiringDashboard: Dashboard = {
  name: 'ats_employer_hiring',
  label: 'Hiring Overview',
  description: 'Your open jobs, applications awaiting action, interviews this week, average days to offer and the pipeline by stage.',
  columns: 12,
  gap: 4,
  header: { showTitle: true, showDescription: true },
  widgets: [
    {
      id: 'open_jobs',
      type: 'kpi',
      title: 'Open Jobs',
      description: 'Published jobs.',
      dataset: 'ats_job_metrics',
      values: ['job_count'],
      filter: { status: 'published' },
      layout: { x: 0, y: 0, w: 4, h: 2 },
      options: { icon: 'briefcase' },
    },
    {
      id: 'awaiting_action',
      type: 'kpi',
      title: 'Applications Awaiting Action',
      description: 'In "applied" or "screening".',
      dataset: 'ats_application_metrics',
      values: ['application_count'],
      filter: { stage: { $in: ['applied', 'screening'] } },
      colorVariant: 'warning',
      layout: { x: 4, y: 0, w: 4, h: 2 },
      options: { icon: 'inbox' },
    },
    {
      id: 'interviews_this_week',
      type: 'kpi',
      title: 'Interviews This Week',
      description: 'Rounds scheduled Monday to Sunday, cancelled ones excluded.',
      dataset: 'ats_interview_metrics',
      values: ['interview_count'],
      filter: { status: { $ne: 'cancelled' }, scheduled_at: { $gte: '{current_week_start}', $lt: '{next_week_start}' } },
      layout: { x: 8, y: 0, w: 4, h: 2 },
      options: { icon: 'calendar-clock' },
    },
    {
      id: 'avg_days_to_offer',
      type: 'kpi',
      title: 'Average Days to Offer',
      description: 'Applied to first offer, over your hired applications.',
      dataset: 'ats_application_metrics',
      values: ['avg_days_to_offer'],
      filter: { stage: 'hired' },
      colorVariant: 'success',
      layout: { x: 0, y: 2, w: 4, h: 2 },
      options: { icon: 'timer' },
    },
    {
      id: 'pipeline_by_stage',
      type: 'bar',
      title: 'Pipeline by Stage',
      description: 'Your applications in each stage, exits included.',
      dataset: 'ats_application_metrics',
      dimensions: ['stage'],
      values: ['application_count'],
      chartConfig: {
        type: 'bar',
        xAxis: { field: 'stage', title: 'Stage' },
        yAxis: [{ field: 'application_count', title: 'Applications' }],
        series: [{ name: 'application_count', label: 'Applications' }],
        showLegend: false,
      },
      layout: { x: 0, y: 4, w: 12, h: 5 },
    },
  ],
};
