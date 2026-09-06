# Three apps with navigation and permission gating

Milestone: M2 · Labels: `pm:queue` · Blocked-by: card-07, card-08

## Scope
`src/apps/admin.app.ts`, `employer.app.ts`, `seeker.app.ts`, barrel, wire `apps`. Load `objectstack-ui`
(apps) and read objectstack docs `ui/audience-based-interfaces`.

## Spec
| App | `requiredPermissions` | Navigation (in order) |
|:--|:--|:--|
| `ats_admin_app` "Platform" | capability granted only to the two platform sets | Review queue group: employers pending, jobs pending · Employers · Jobs · Reports · Dictionaries group: skills, credential types · Dashboards (card 13 adds) |
| `ats_employer_app` "Hiring" | employer sets | Jobs (mine) · Pipeline (kanban view) · Inbox (5 views) · Interviews (calendar) · Talent pool · Dashboard (card 13) |
| `ats_seeker_app` "Jobs" | job_seeker | Find jobs (search view) · My applications (timeline) · My interviews · My profile · My credentials |

Nav items point at the views by name (`type: 'view'`/`'object'` with default view), icons from the
same set as the objects. Builder-only entries (metadata resources) are **not** present in any app.
Branding primary colour: `#0B6E63`.

## Acceptance
- Gates green; `pnpm validate` shows 3 apps.
- Logging in as each role shows only its app; a `job_seeker` cannot open `/ats_admin_app`.

## Out of scope
Translations of nav labels (card 14), dashboards content.
