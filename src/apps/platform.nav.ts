import type { NavigationItemInput } from '@objectstack/spec/ui';

/**
 * Platform operations — the audience that runs the marketplace (DESIGN.md
 * §04). This array is the `Platform` group of the one `ats` app (ats.app.ts),
 * served only to callers holding `ats_platform.access`, which the two
 * platform permission sets grant. Employers and jobs that wait on a verdict
 * come first; the dictionaries the whole platform shares come last.
 *
 * The review queues are `filters` slices on the bare data surface, not
 * authored views: `verification_status` / `status` equality is the whole
 * definition and the runtime serialises it as `filter[<field>]=<value>`.
 * The inquiry queue is the exception: it mounts an authored view
 * (`ats_inquiry.inbox`), because the queue has real columns to show and a
 * `filters` slice derives its columns from `highlightFields` alone (#33).
 * The four objects with no authored view (`ats_employer`, `ats_report`,
 * `ats_skill`, `ats_credential_type`) land on the default list — `viewName`
 * defaults to `all`, which the shell synthesises when nothing is declared.
 *
 * The two dashboards (card 13) lead: the overview is what the operator opens
 * first, and the funnel is the marketplace-wide pipeline — read through the
 * platform sets' `viewAllRecords`, so it counts every employer's applications.
 */
export const PlatformNavigation: NavigationItemInput[] = [
  { id: 'nav_platform_overview', type: 'dashboard', label: 'Platform Overview', icon: 'layout-dashboard', dashboardName: 'ats_platform_overview' },
  { id: 'nav_platform_funnel',   type: 'dashboard', label: 'Hiring Funnel',     icon: 'filter',           dashboardName: 'ats_hiring_funnel' },
  {
    id: 'grp_platform_review_queue',
    type: 'group',
    label: 'Review Queue',
    icon: 'inbox',
    expanded: true,
    children: [
      {
        id: 'nav_platform_employers_pending',
        type: 'object',
        label: 'Employers Pending',
        icon: 'building-2',
        objectName: 'ats_employer',
        filters: { verification_status: 'pending' },
      },
      {
        id: 'nav_platform_jobs_pending',
        type: 'object',
        label: 'Jobs Pending',
        icon: 'briefcase',
        objectName: 'ats_job',
        filters: { status: 'pending_review' },
      },
      { id: 'nav_platform_inquiries', type: 'object', label: 'Inquiries', icon: 'mail-plus', objectName: 'ats_inquiry', viewName: 'inbox' },
    ],
  },
  { id: 'nav_platform_employers', type: 'object', label: 'Employers', icon: 'building-2', objectName: 'ats_employer' },
  { id: 'nav_platform_jobs',      type: 'object', label: 'Jobs',      icon: 'briefcase',  objectName: 'ats_job' },
  { id: 'nav_platform_reports',   type: 'object', label: 'Reports',   icon: 'flag',       objectName: 'ats_report' },
  {
    id: 'grp_platform_dictionaries',
    type: 'group',
    label: 'Dictionaries',
    icon: 'book-open',
    children: [
      { id: 'nav_platform_skills',           type: 'object', label: 'Skills',           icon: 'tag',         objectName: 'ats_skill' },
      { id: 'nav_platform_credential_types', type: 'object', label: 'Credential Types', icon: 'badge-check', objectName: 'ats_credential_type' },
    ],
  },
];
