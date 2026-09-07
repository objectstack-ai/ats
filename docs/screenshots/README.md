# Screenshots

Taken on 2026-09-07 against `@objectstack/cli` 17.3.0, from this repository booted as

```bash
OS_PLATFORM_OWNER_EMAIL=admin@objectos.ai npx objectstack dev --fresh --database-driver memory -p 4393 --log-level info
```

**every shot on the memory driver**, after the boot log's
`[Seeder] Seed loading complete {"inserted":809,…,"errored":0}`, in a headless Chromium at 1440 × 900.
The driver matters: on the default (sqlite) driver the four tenancy-scoped objects return no rows to the
platform personas ([#39](https://github.com/objectstack-ai/ats/issues/39)), so the Platform group's review
queues photograph empty there. The demo logins are in the [README](../../README.md#demo-logins); the
personas below are three of them.

| File | Signed in as | What it shows |
|:--|:--|:--|
| `01-platform-home-overview.png` | `admin@platform.example` (Platform) | The Platform group's home: the **Platform Overview** dashboard — 9 verified employers · 22 open jobs · 30 applications this month · 70 active candidates · review queue 2 employers / 6 jobs · applications per ISO week. |
| `02-platform-hiring-funnel.png` | `admin@platform.example` (Platform) | The **Hiring Funnel** dashboard, marketplace-wide: applied → screening → interview → offer → hired, plus the two exits. The funnel's per-stage values are hover-only in the Console's funnel widget; measured through the dataset query they are **88 / 46 / 28 / 14 / 9**, with 15 rejected · 0 withdrawn · 185 in pipeline (see [`docs/evidence/issue-8`](../evidence/issue-8/README.md)). |
| `03-hiring-home-overview.png` | `admin@quillstone.example` (Hiring) | The Hiring group's home: the **Hiring Overview** dashboard, row-level scoped to Quillstone — 3 open jobs · 18 applications awaiting action · 6 interviews this week · pipeline by stage 10 / 8 / 5 / 2 / 1 (+1 rejected). |
| `04-hiring-pipeline-kanban.png` | `admin@quillstone.example` (Hiring) | The **Pipeline** kanban over `ats_application`, grouped by `stage`: Quillstone's 27 applications in their columns (Applied 10 · Screening 8 · Interview 5 · Offer 2 …). |
| `05-hiring-interview-calendar.png` | `admin@quillstone.example` (Hiring) | The **Interview Calendar** over `ats_interview.scheduled_at`: Quillstone's 10 rounds, all inside the next two weeks because the seed schedules them relative to boot time. |
| `06-seeker-home-find-jobs.png` | `candidate01@mail.example` (Job Seeker) | The Job Seeker group's home: **Find Jobs**, the `published` grid over `ats_job` — 22 published jobs across every industry in the seed. |
| `07-hiring-pipeline-kanban-zh-CN.png` | `admin@quillstone.example` (Hiring) | The same kanban as `04` with the browser locale set to `zh-CN`: navigation, object, view, column and option labels come from [`src/translations/zh-CN.ts`](../../src/translations/zh-CN.ts). The Console follows `navigator.language`; the demo rows stay English because the seed set (`OS_SEED_LOCALE`) is a separate switch. |

Each persona sees exactly the navigation group its position unlocks (DESIGN.md §04), so the sidebar in
`01`–`02`, `03`–`05` and `06` is the whole product for that audience — there is no hidden fourth group.

The browser script that took these lived in the developer's scratch directory and is not committed; each
row above names the URL's view so the shot can be retaken by hand:
`/_console/apps/ats/dashboard/<dashboard>`, `/_console/apps/ats/<object>/view/<view>`.
