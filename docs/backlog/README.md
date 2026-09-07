# Backlog — dispatch-ready work cards

Each file below is a complete issue body: paste it verbatim into a GitHub issue, add the label
`pm:queue`, and the PM dispatch loop (`AGENTS.md` → PM dispatch) can pick it up.

Cards 01–06 landed directly (M1 was the serial bottleneck: every later card depends on the objects
and permission sets it created). Cards 07–14 are now **live issues**, labelled `pm:queue` — the table
below is the map. The dispatch loop honours `Blocked-by:` at selection time and never dispatches a
card whose blockers are still open.

**Once M1 merges, five cards are unblocked at once** — #2, #3, #5, #6, #7 — which is the first point
where parallel dispatch is worth anything.

| Card | Issue | Title | Milestone | Blocked by |
|:--|:--|:--|:--|:--|
| ~~01–03~~ | — | Scaffold · dictionaries · employer domain | M1 | **landed** |
| ~~04~~ | — | Candidate domain | M1 | **landed** |
| ~~05~~ | — | Transaction domain | M1 | **landed** |
| ~~06~~ | — | Positions, permission sets, RLS, FLS, hooks | M1 | **landed** |
| ~~07~~ | [#2](https://github.com/objectstack-ai/ats/issues/2) | Employer views: pipeline kanban, inbox, interview calendar, talent pool | M2 | **landed** |
| [08](./08-platform-seeker-views.md) | [#3](https://github.com/objectstack-ai/ats/issues/3) | Platform & seeker views + public application form | M2 | M1 |
| [09](./09-apps.md) | [#4](https://github.com/objectstack-ai/ats/issues/4) | Three apps with navigation and permission gating | M2 | #2, #3 |
| [10](./10-seed-data.md) | [#5](https://github.com/objectstack-ai/ats/issues/5) | Seed data: `demo-en` and `demo-zh` | M2 | #20 |
| ~~11~~ | [#6](https://github.com/objectstack-ai/ats/issues/6) | Approval flows F1–F3 + `automation` capability | M3 | **landed** |
| [12](./12-notifications-jobs.md) | [#7](https://github.com/objectstack-ai/ats/issues/7) | Notifications and scheduled jobs F4–F6 | M3 | M1 |
| [13](./13-dashboards.md) | [#8](https://github.com/objectstack-ai/ats/issues/8) | Three dashboards and their datasets | M3 | #5 |
| [14](./14-release.md) | [#9](https://github.com/objectstack-ai/ats/issues/9) | Release: README, live demo, CI, screenshots, CONTRIBUTING | M4 | #4, #6, #7, #8 |

Every card inherits the same acceptance floor: `pnpm validate && pnpm lint && pnpm typecheck` green,
gate output pasted in the PR, one draft PR per card, no rider changes. Field lists and enum values are
pinned in [`DESIGN.md`](../../DESIGN.md) §02 — a card that needs a value not pinned there stops with
`needs_decision` instead of inventing one.
