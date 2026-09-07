import type { Dashboard } from '@objectstack/spec/ui';

/**
 * `ats_employer_hiring` — one employer's hiring at a glance (card 13,
 * DESIGN.md §04: 在招岗位 · 待处理简历 · 本周面试 · 平均到 Offer 天数).
 *
 * Scoped to the viewer's employer by row-level security, not by a dashboard
 * filter: the analytics runtime applies the caller's read scope per object,
 * and every employer-side policy keys on the stamped `employer_org` (#44,
 * #46). Quillstone's administrator and Harborline's read different numbers
 * from the same three widgets, and platform staff read the whole marketplace.
 *
 * Three of the card's four tiles are here. The fourth — "median days from
 * `applied_at` to the offer's `created_at` for hired applications" — is not
 * expressible as a dataset measure and is deliberately NOT approximated:
 *   - the semantic layer has no median (`count/sum/avg/min/max/count_distinct`),
 *     and the only computed form combines OTHER MEASURES, never two columns;
 *   - the duration lives across two objects and needs a stored column
 *     (`ats_application.days_to_offer`, stamped when the offer is written),
 *     which is an object + hook change outside this card;
 *   - the demo seed does now carry one `accepted` offer per hired application
 *     (#53 — before it, all 14 offers sat on `offer`-stage applications and the
 *     tile would have read empty), so what keeps the tile out is the two
 *     reasons above, not the data.
 * The pipeline-by-stage bar takes its place so the surface shows the same
 * scoping at a glance; the tile returns with a card that adds the column.
 *
 * "This week" is Monday 00:00 (`{current_week_start}`) up to but excluding
 * next Monday (`{next_week_start}`): `*_end` macros are calendar days, and
 * `scheduled_at` is a timestamp.
 */
export const EmployerHiringDashboard: Dashboard = {
  name: 'ats_employer_hiring',
  label: 'Hiring Overview',
  description: 'Your open jobs, applications awaiting action, interviews this week and the pipeline by stage.',
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
      layout: { x: 0, y: 2, w: 12, h: 5 },
    },
  ],
};
