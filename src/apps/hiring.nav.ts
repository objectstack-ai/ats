import type { NavigationItemInput } from '@objectstack/spec/ui';

/**
 * Hiring — one employer's staff (DESIGN.md §04). This array is the `Hiring`
 * group of the one `ats` app (ats.app.ts), served only to callers holding
 * `ats_employer.access`, which the two employer permission sets grant. Every
 * entry mounts a view card 07 authored: which employer's rows a person sees
 * is the permission set's row-level rule, never a navigation filter.
 *
 * The inbox is five grids over `ats_application`, one per working stage; the
 * board and the calendar are the same object seen two other ways. Inquiries
 * — anonymous applications from the public form, not yet converted — sit
 * above it: an employer sees the ones for its own jobs (`employer_org`). The talent
 * pool entry lands on the filterable grid; the gallery is one view-switch away
 * on the same surface. The dashboard (card 13) leads: it reads the same
 * objects through the same row-level rule, so it is this employer's numbers
 * with no filter of its own.
 */
export const HiringNavigation: NavigationItemInput[] = [
  { id: 'nav_hiring_overview', type: 'dashboard', label: 'Hiring Overview', icon: 'layout-dashboard', dashboardName: 'ats_employer_hiring' },
  { id: 'nav_hiring_jobs',     type: 'object', label: 'Jobs',     icon: 'briefcase', objectName: 'ats_job',         viewName: 'mine' },
  { id: 'nav_hiring_pipeline', type: 'object', label: 'Pipeline', icon: 'kanban',    objectName: 'ats_application', viewName: 'pipeline' },
  { id: 'nav_hiring_inquiries', type: 'object', label: 'Inquiries', icon: 'mail-plus', objectName: 'ats_inquiry',     viewName: 'inbox' },
  {
    id: 'grp_hiring_inbox',
    type: 'group',
    label: 'Inbox',
    icon: 'inbox',
    expanded: true,
    children: [
      { id: 'nav_hiring_inbox_new',       type: 'object', label: 'New',       icon: 'mail',           objectName: 'ats_application', viewName: 'inbox_new' },
      { id: 'nav_hiring_inbox_screening', type: 'object', label: 'Screening', icon: 'search',         objectName: 'ats_application', viewName: 'inbox_screening' },
      { id: 'nav_hiring_inbox_interview', type: 'object', label: 'Interview', icon: 'calendar-clock', objectName: 'ats_application', viewName: 'inbox_interview' },
      { id: 'nav_hiring_inbox_offer',     type: 'object', label: 'Offer',     icon: 'file-signature', objectName: 'ats_application', viewName: 'inbox_offer' },
      { id: 'nav_hiring_inbox_hired',     type: 'object', label: 'Hired',     icon: 'user-check',     objectName: 'ats_application', viewName: 'inbox_hired' },
    ],
  },
  { id: 'nav_hiring_interviews',  type: 'object', label: 'Interviews',  icon: 'calendar-clock', objectName: 'ats_interview', viewName: 'calendar' },
  { id: 'nav_hiring_talent_pool', type: 'object', label: 'Talent Pool', icon: 'user-round',     objectName: 'ats_candidate', viewName: 'talent_pool' },
];
