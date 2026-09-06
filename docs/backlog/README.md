# Backlog — dispatch-ready work cards

Each file below is a complete issue body: paste it verbatim into a GitHub issue, add the label
`pm:queue`, and the PM dispatch loop (`AGENTS.md` → PM dispatch) can pick it up.

**Post cards in file order**, then replace every `Blocked-by: card-NN` placeholder with the real
`#<issue>` number — the loop honours `Blocked-by:` at selection time and never dispatches a card
whose blockers are still open.

| Card | Title | Milestone | Blocked by |
|:--|:--|:--|:--|
| ~~01–03~~ | Scaffold · dictionaries · employer domain | M1 | **landed in the initial commit** |
| [04](./04-candidate-domain.md) | Candidate domain: `ats_candidate`, `ats_candidate_credential` | M1 | — |
| [05](./05-transaction-domain.md) | Transaction domain: `ats_application`, `ats_interview`, `ats_offer`, `ats_report` | M1 | 04 |
| [06](./06-security.md) | Positions, permission sets, RLS, FLS, bindings | M1 | 05 |
| [07](./07-employer-views.md) | Employer views: pipeline kanban, inbox, interview calendar, talent pool | M2 | 06 |
| [08](./08-platform-seeker-views.md) | Platform & seeker views + public application form | M2 | 06 |
| [09](./09-apps.md) | Three apps with navigation and permission gating | M2 | 07, 08 |
| [10](./10-seed-data.md) | Seed data: `demo-en` and `demo-zh` | M2 | 05 |
| [11](./11-approval-flows.md) | Approval flows F1–F3 + `automation` capability | M3 | 06 |
| [12](./12-notifications-jobs.md) | Notifications and scheduled jobs F4–F6 | M3 | 06 |
| [13](./13-dashboards.md) | Three dashboards and their datasets | M3 | 10 |
| [14](./14-release.md) | Release: README, live demo, CI, screenshots, CONTRIBUTING | M4 | 09, 11, 12, 13 |

Every card inherits the same acceptance floor: `pnpm validate && pnpm lint && pnpm typecheck` green,
gate output pasted in the PR, one draft PR per card, no rider changes. Field lists and enum values are
pinned in [`DESIGN.md`](../../DESIGN.md) §02 — a card that needs a value not pinned there stops with
`needs_decision` instead of inventing one.
