# Screenshots

Taken on 2026-09-07 against `@objectstack/cli` 17.3.0, from this repository booted as

```bash
OS_PLATFORM_OWNER_EMAIL=admin@objectos.ai npx objectstack dev --fresh --database-driver memory -p 4393 --log-level info
```

**every shot on the memory driver**, after the boot log's
`[Seeder] Seed loading complete {"inserted":809,…,"errored":0}`, in a headless Chromium at 1440 × 900.
The seed has since grown to 818 rows — #53 added one `accepted` `ats_offer` per hired application, nothing
else — so a boot today logs `{"inserted":818,…}`; no screen below reads `ats_offer`, and the stage counts the
shots show (88 / 46 / 28 / 14 / 9 marketplace-wide, 10 / 8 / 5 / 2 / 1 for Quillstone) did not move.
`03` is the one exception to the paragraph above: it was **re-taken on 2026-09-08 at 818 rows** (same CLI,
same driver, same 1440 × 900, `-p 4661`) because [#78](https://github.com/objectstack-ai/ats/issues/78)
moved its four KPI tiles onto one row. That is this file's second re-take — the first was on 2026-09-07
(`-p 4631`) when [#55](https://github.com/objectstack-ai/ats/issues/55) added the fourth tile. The other six still date from the 809-row boot; re-shot against 818
they render the same screen, so they were left as they are.
The driver matters: on the default (sqlite) driver the four tenancy-scoped objects return no rows to the
platform personas ([#39](https://github.com/objectstack-ai/ats/issues/39)), so the Platform group's review
queues photograph empty there. The demo logins are in the [README](../../README.md#demo-logins); the
personas below are three of them.

| File | Signed in as | What it shows |
|:--|:--|:--|
| `01-platform-home-overview.png` | `admin@platform.example` (Platform) | The Platform group's home: the **Platform Overview** dashboard — 9 verified employers · 22 open jobs · 30 applications this month · 70 active candidates · review queue 2 employers / 6 jobs · applications per ISO week. |
| `02-platform-hiring-funnel.png` | `admin@platform.example` (Platform) | The **Hiring Funnel** dashboard, marketplace-wide: applied → screening → interview → offer → hired, plus the two exits. The funnel's per-stage values are hover-only in the Console's funnel widget; measured through the dataset query they are **88 / 46 / 28 / 14 / 9**, with 15 rejected · 0 withdrawn · 185 in pipeline (see [`docs/evidence/issue-8`](../evidence/issue-8/README.md)). |
| `03-hiring-home-overview.png` | `admin@quillstone.example` (Hiring) | The Hiring group's home: the **Hiring Overview** dashboard, row-level scoped to Quillstone — 3 open jobs · 18 awaiting action · 5 interviews this week · **average days to offer 30.0** — and, under them, the whole of **Pipeline by Stage**: 10 / 8 / 5 / 2 / 1 (+1 rejected), every bar and both axes inside the 900 px fold. The four KPI tiles share row 0 at `w: 3` since [#78](https://github.com/objectstack-ai/ats/issues/78); the tile row `w: 4` forced ([#55](https://github.com/objectstack-ai/ats/issues/55)) is gone and nothing here is cropped. **The "5 interviews this week" is a Tuesday-boot number, not a fixed one**: the seed schedules Quillstone's ten rounds at boot + 1 … + 10 days while the tile counts a fixed Monday-to-Sunday week, so a Monday boot puts six of them inside the window (what the `#55` re-take photographed) and every later weekday one fewer. The other four numbers do not move with the boot day. On the demo seed the 30.0 is the hired applications' *age*, not elapsed decision time — a seed cannot set `created_at` ([#65](https://github.com/objectstack-ai/ats/issues/65)); `src/dashboards/employer-hiring.dashboard.ts` says so at the tile. |
| `04-hiring-pipeline-kanban.png` | `admin@quillstone.example` (Hiring) | The **Pipeline** kanban over `ats_application`, grouped by `stage`: Quillstone's 27 applications in their columns (Applied 10 · Screening 8 · Interview 5 · Offer 2 …). |
| `05-hiring-interview-calendar.png` | `admin@quillstone.example` (Hiring) | The **Interview Calendar** over `ats_interview.scheduled_at`: Quillstone's 10 rounds, all inside the next two weeks because the seed schedules them relative to boot time. |
| `06-seeker-home-find-jobs.png` | `candidate01@mail.example` (Job Seeker) | The Job Seeker group's home: **Find Jobs**, the `published` grid over `ats_job` — 22 published jobs across every industry in the seed. |
| `07-hiring-pipeline-kanban-zh-CN.png` | `admin@quillstone.example` (Hiring) | The same kanban as `04` with the browser locale set to `zh-CN`: navigation, object, view, column and option labels come from [`src/translations/zh-CN.ts`](../../src/translations/zh-CN.ts). The Console follows `navigator.language`; the demo rows stay English because the seed set (`OS_SEED_LOCALE`) is a separate switch. |

Each persona sees exactly the navigation group its position unlocks (DESIGN.md §04), so the sidebar in
`01`–`02`, `03`–`05` and `06` is the whole product for that audience — there is no hidden fourth group.

The browser script that took these lived in the developer's scratch directory and is not committed; each
row above names the URL's view so the shot can be retaken by hand:
`/_console/apps/ats/dashboard/<dashboard>`, `/_console/apps/ats/<object>/view/<view>`.
