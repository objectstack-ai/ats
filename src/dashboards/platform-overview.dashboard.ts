import type { Dashboard } from '@objectstack/spec/ui';

/**
 * `ats_platform_overview` — the marketplace at a glance for platform staff
 * (card 13, DESIGN.md §04: 雇主数 · 在招岗位 · 本月投递 · 活跃候选人 · 待审队列).
 *
 * Every tile is ONE count measure on a declared dataset, sliced by the
 * widget's own `filter` (a measure-scoped filter is refused by the memory
 * driver — see application.dataset.ts). No `dateRange` scrubber on purpose:
 * five of the six tiles are point-in-time counts (an employer is verified
 * NOW), and the scrubber would silently bind to `created_at` on every one of
 * them, turning "verified employers" into "employers created this month".
 * The two time windows are stated on the widgets that have one.
 *
 * "Review queue length" is two tiles, not one: pending employers and pending
 * jobs live on two base objects, and a derived measure may only add measures
 * of ONE dataset (ADR-0021 Q1) — there is no cross-dataset sum to bind.
 *
 * ⚠️ Employer tiles read 0 on the default (sqlite) driver for platform
 * personas — `ats_employer` is tenancy-walled there (#39, open). The memory
 * driver reads 9 verified · 2 pending on the demo seed.
 *
 * ⚠️ The per-week bar is right on sqlite and WRONG on the memory driver
 * (cli 17.3.0): with no native SQL the analytics service re-buckets the
 * driver's per-timestamp groups by week and counts the GROUPS, so a week
 * holding 38 applications on 7 distinct days reads 7. Reported upstream; the
 * widget is authored correctly and stays.
 */
export const PlatformOverviewDashboard: Dashboard = {
  name: 'ats_platform_overview',
  label: 'Platform Overview',
  description: 'Employers, open jobs, applications this month, active candidates and the review queue.',
  columns: 12,
  gap: 4,
  header: { showTitle: true, showDescription: true },
  widgets: [
    {
      id: 'verified_employers',
      type: 'kpi',
      title: 'Verified Employers',
      dataset: 'ats_employer_metrics',
      values: ['employer_count'],
      filter: { verification_status: 'verified' },
      layout: { x: 0, y: 0, w: 3, h: 2 },
      options: { icon: 'building-2' },
    },
    {
      id: 'open_jobs',
      type: 'kpi',
      title: 'Open Jobs',
      description: 'Published jobs.',
      dataset: 'ats_job_metrics',
      values: ['job_count'],
      filter: { status: 'published' },
      layout: { x: 3, y: 0, w: 3, h: 2 },
      options: { icon: 'briefcase' },
    },
    {
      id: 'applications_this_month',
      type: 'kpi',
      title: 'Applications This Month',
      description: 'Applied since the 1st of this month.',
      dataset: 'ats_application_metrics',
      values: ['application_count'],
      filter: { applied_at: { $gte: '{current_month_start}' } },
      layout: { x: 6, y: 0, w: 3, h: 2 },
      options: { icon: 'send' },
    },
    {
      id: 'active_candidates',
      type: 'kpi',
      title: 'Active Candidates',
      description: 'Seeking status other than "not looking".',
      dataset: 'ats_candidate_metrics',
      values: ['candidate_count'],
      filter: { seeking_status: { $ne: 'not_looking' } },
      layout: { x: 9, y: 0, w: 3, h: 2 },
      options: { icon: 'user-round' },
    },
    {
      id: 'pending_employers',
      type: 'kpi',
      title: 'Review Queue · Employers',
      description: 'Employers awaiting verification.',
      dataset: 'ats_employer_metrics',
      values: ['employer_count'],
      filter: { verification_status: 'pending' },
      colorVariant: 'warning',
      layout: { x: 0, y: 2, w: 3, h: 2 },
      options: { icon: 'inbox' },
    },
    {
      id: 'pending_jobs',
      type: 'kpi',
      title: 'Review Queue · Jobs',
      description: 'Jobs awaiting publication review.',
      dataset: 'ats_job_metrics',
      values: ['job_count'],
      filter: { status: 'pending_review' },
      colorVariant: 'warning',
      layout: { x: 3, y: 2, w: 3, h: 2 },
      options: { icon: 'inbox' },
    },
    {
      id: 'applications_per_week',
      type: 'bar',
      title: 'Applications per Week',
      description: 'Applications filed in the last 12 weeks, by ISO week.',
      dataset: 'ats_application_metrics',
      dimensions: ['applied_at'],
      values: ['application_count'],
      filter: { applied_at: { $gte: '{12_weeks_ago}' } },
      // Which column is the axis and which is the bar: the renderer reads the
      // dimension NAME and the measure NAME off the dataset result.
      chartConfig: {
        type: 'bar',
        xAxis: { field: 'applied_at', title: 'Week' },
        yAxis: [{ field: 'application_count', title: 'Applications' }],
        series: [{ name: 'application_count', label: 'Applications' }],
        showLegend: false,
      },
      layout: { x: 0, y: 4, w: 12, h: 5 },
      options: { dateGranularity: 'week' },
    },
  ],
};
