import type { NavigationItemInput } from '@objectstack/spec/ui';

/**
 * Job seeker — the candidate's own side of the marketplace (DESIGN.md §04).
 * This array is the `Job Seeker` group of the one `ats` app (ats.app.ts),
 * served only to callers holding `ats_seeker.access`, which `ats_job_seeker`
 * grants. Inside the Console this group is the internal and debugging
 * fallback; the seeker's product surface is a separate front end (§03).
 *
 * Only the entries whose views exist today are mounted. §04 lists five —
 * Find Jobs · My Applications · My Interviews · My Profile · My Credentials —
 * and the rest of their views belong to card 08 (#3):
 *
 *   - My Applications lands on the default `all` grid until the timeline
 *     view exists; the entry stays, the view behind it changes.
 *   - My Profile needs the candidate form view and an own-record entry.
 *   - My Credentials needs its view.
 *
 * Adding those two entries is a card-08 edit to this array, nothing else.
 * Which rows a seeker sees is the permission set's row-level rule
 * (`candidate_user == current_user.id`, `status == 'published'`), never a
 * navigation filter.
 */
export const SeekerNavigation: NavigationItemInput[] = [
  { id: 'nav_seeker_find_jobs',       type: 'object', label: 'Find Jobs',       icon: 'search',         objectName: 'ats_job',         viewName: 'published' },
  { id: 'nav_seeker_my_applications', type: 'object', label: 'My Applications', icon: 'send',           objectName: 'ats_application' },
  { id: 'nav_seeker_my_interviews',   type: 'object', label: 'My Interviews',   icon: 'calendar-clock', objectName: 'ats_interview',   viewName: 'calendar' },
];
