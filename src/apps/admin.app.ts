import { defineApp } from '@objectstack/spec';
import type { NavigationItemInput } from '@objectstack/spec/ui';

/**
 * Platform operations — the audience that runs the marketplace (card 09,
 * DESIGN.md §04). Employers and jobs that wait on a verdict come first; the
 * dictionaries the whole platform shares come last.
 *
 * The review queues are `filters` slices on the bare data surface, not
 * authored views: `verification_status` / `status` equality is the whole
 * definition and the runtime serialises it as `filter[<field>]=<value>`.
 * The four objects with no authored view (`ats_employer`, `ats_report`,
 * `ats_skill`, `ats_credential_type`) land on the default list — `viewName`
 * defaults to `all`, which the shell synthesises when nothing is declared.
 *
 * Dashboards join this navigation with card 13.
 */
export const PlatformNavigation: NavigationItemInput[] = [
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

export const AtsAdminApp = defineApp({
  name: 'ats_admin_app',
  label: 'Platform',
  description: 'Review queues, employers, jobs, reports and the shared dictionaries.',
  icon: 'shield-check',
  branding: { primaryColor: '#0B6E63' },
  // Held only by the two platform permission sets (ats_platform_admin,
  // ats_platform_ops). The runtime withholds the whole app from anyone else.
  requiredPermissions: ['ats_platform.access'],
  navigation: PlatformNavigation,
});
