import { defineApp } from '@objectstack/spec';
import type { NavigationItemInput } from '@objectstack/spec/ui';
import { PlatformNavigation } from './platform.nav.js';
import { HiringNavigation } from './hiring.nav.js';
import { SeekerNavigation } from './seeker.nav.js';

/**
 * The one ATS app (DESIGN.md §04, revised 2026-09-07).
 *
 * A `type: 'app'` package may define at most one app — `defineStack` refuses
 * a second (ADR-0019 D3) — so the three audiences are not three apps but
 * three navigation GROUPS of this one, each gated by a capability:
 *
 *   Platform     ats_platform.access   ats_platform_admin · ats_platform_ops
 *   Hiring       ats_employer.access   ats_employer_admin · ats_employer_recruiter
 *   Job Seeker   ats_seeker.access     ats_job_seeker
 *
 * The gate is server-side: `/api/v1/meta/app` strips every entry whose
 * `requiredPermissions` the caller does not hold and drops a group with no
 * surviving children, so a person who lacks a capability never receives that
 * group at all. The capabilities exist only because the permission sets grant
 * them via `systemPermissions` (src/security/permission-sets.ts): a capability
 * nothing grants is a `capability-reference-unknown` WARNING at validate time
 * and a silently absent group at runtime — when a group goes missing, check
 * the grant before the navigation.
 *
 * The app itself carries no `requiredPermissions`: anyone signed in may open
 * it, and what they see inside is decided group by group. Platform-owner
 * standing (`OS_PLATFORM_OWNER_EMAIL`) confers the kernel capabilities only,
 * none of these three — an owner sees the groups of the positions they hold.
 */
const navigation: NavigationItemInput[] = [
  {
    id: 'grp_platform',
    type: 'group',
    label: 'Platform',
    icon: 'shield-check',
    expanded: true,
    requiredPermissions: ['ats_platform.access'],
    children: PlatformNavigation,
  },
  {
    id: 'grp_hiring',
    type: 'group',
    label: 'Hiring',
    icon: 'briefcase',
    expanded: true,
    requiredPermissions: ['ats_employer.access'],
    children: HiringNavigation,
  },
  {
    id: 'grp_seeker',
    type: 'group',
    label: 'Job Seeker',
    icon: 'user-search',
    expanded: true,
    requiredPermissions: ['ats_seeker.access'],
    children: SeekerNavigation,
  },
];

export const AtsApp = defineApp({
  name: 'ats',
  label: 'ATS',
  description: 'Recruiting marketplace — platform review queues, employer hiring, and the job seeker portal.',
  icon: 'briefcase',
  branding: { primaryColor: '#0B6E63' },
  navigation,
});
