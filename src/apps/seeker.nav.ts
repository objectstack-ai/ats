import type { NavigationItemInput } from '@objectstack/spec/ui';

/**
 * Job seeker — the candidate's own side of the marketplace (DESIGN.md §04).
 * This array is the `Job Seeker` group of the one `ats` app (ats.app.ts),
 * served only to callers holding `ats_seeker.access`, which `ats_job_seeker`
 * grants. Inside the Console this group is the internal and debugging
 * fallback; the seeker's product surface is a separate front end (§03).
 *
 * The five entries §04 lists — Find Jobs · My Applications · My Interviews ·
 * My Profile · My Credentials — are all mounted (card 08, #3):
 *
 *   - My Profile is a `filters` slice on the seeker's own `user` id: a nav
 *     `recordId` resolves only `{current_user_id}` / `{current_org_id}`, and a
 *     candidate row's id is not the user's id, so the closest own-record entry
 *     the shell offers is the one-row slice; the profile form opens from it.
 *   - My Credentials lands on the credential grid's default `all` list.
 *
 * Which rows a seeker sees is the permission set's row-level rule
 * (`candidate_user == current_user.id`, `user == current_user.id`,
 * `status == 'published'`), never a navigation filter — the My Profile slice
 * is presentation over rows the seeker may already read.
 */
export const SeekerNavigation: NavigationItemInput[] = [
  { id: 'nav_seeker_find_jobs',       type: 'object', label: 'Find Jobs',       icon: 'search',         objectName: 'ats_job',                  viewName: 'published' },
  { id: 'nav_seeker_my_applications', type: 'object', label: 'My Applications', icon: 'send',           objectName: 'ats_application',          viewName: 'mine' },
  { id: 'nav_seeker_my_interviews',   type: 'object', label: 'My Interviews',   icon: 'calendar-clock', objectName: 'ats_interview',            viewName: 'calendar' },
  { id: 'nav_seeker_my_profile',      type: 'object', label: 'My Profile',      icon: 'user-round',     objectName: 'ats_candidate',            filters: { user: '{current_user_id}' } },
  { id: 'nav_seeker_my_credentials',  type: 'object', label: 'My Credentials',  icon: 'badge-check',    objectName: 'ats_candidate_credential' },
];
