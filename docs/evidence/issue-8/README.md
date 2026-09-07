# Evidence — issue #8 (card 13: three dashboards and their datasets)

Captured on 2026-09-07 against `@objectstack/cli` 17.3.0, booted from a fresh `npx objectstack build` as
`OS_PLATFORM_OWNER_EMAIL=admin@objectos.ai npx objectstack dev --fresh [--database-driver memory] -p 4333 --log-level info`,
once on the memory driver and once on the default (sqlite) driver, each time after the boot log's
`[Seeder] Seed loading complete {"inserted":809,…,"errored":0}`. The probe and browser scripts lived in the scratchpad and are
not committed; every table below names the request behind each number.

## What each file shows

| File | What it shows |
|:--|:--|
| `20-widget-crosscheck-memory.md` · `21-widget-crosscheck-sqlite.md` | **Every widget on every dashboard, per persona, two columns.** Left: the number the widget's own dataset query returns (`POST /api/v1/analytics/dataset/query`, the exact `dataset` / `dimensions` / `values` / `filter` the widget declares in `dist/objectstack.json`). Right: an independent count over the same object with the same filter through the list API (`GET /api/v1/data/OBJECT?$filter=…&$count=true`, `total`), per stage for the funnel and the bar, per week window for the trend. `match` says whether the two columns agree. |
| `22-analytics-vs-rest-by-persona-memory.md` · `23-…-sqlite.md` | A bare `count` of each of the seven objects through both paths, for a platform admin, both employer admins and a job seeker — the tenancy-wall (#39) surface, and how the analytics path treats it on each driver. |
| `30-browser-pass-memory-notes.txt` · `31-browser-pass-sqlite-notes.txt` | What the browser script saw while taking the screenshots: the URL, how many dataset queries the page issued, and the rendered text of every tile. |
| `32-inline-dataset-checks-sqlite.txt` · `33-…-memory.txt` | The two dataset shapes this card could not ship on the memory driver, isolated with inline datasets: a measure-scoped `filter` (and a `ratio` over two of them), and `dateGranularity` bucketing — same request, both drivers. |
| `01`–`05-*-memory-*.png` | The three dashboards in the Console on the memory driver: Platform Overview and Hiring Funnel as `admin@platform.example`; Hiring Overview as `admin@quillstone.example`, `admin@harborline.example` and the platform admin. |
| `11`–`15-*-sqlite-*.png` | The same five views on the default (sqlite) driver. |

## Numbers to hold the release to (demo seed, both drivers unless a driver is named)

| Dashboard · widget | Persona | Reads | Independent count |
|:--|:--|--:|--:|
| **Hiring Funnel** · applied → screening → interview → offer → hired | platform admin | **88 / 46 / 28 / 14 / 9** | 88 / 46 / 28 / 14 / 9 |
| Hiring Funnel · rejected · withdrawn · in pipeline | platform admin | 15 · 0 · 185 | 15 · 0 · 185 |
| Hiring Funnel (row-level scoped) | Quillstone admin | 10 / 8 / 5 / 2 / 1 · rejected 1 | same |
| Hiring Funnel (row-level scoped) | Harborline admin | 14 / 7 / 3 / 2 / 2 · rejected 3 | same |
| **Platform Overview** · verified employers · open jobs · applications this month · active candidates · pending employers · pending jobs | platform admin, platform ops | 9 · 22 · 30 · 70 · 2 · 6 | memory: 9 · 22 · 30 · 70 · 2 · 6 — sqlite: **0** · 22 · 30 · 70 · **0** · 6 (see §#39 below) |
| Platform Overview · applications per week (ISO weeks W27–W36) | platform admin | sqlite: 2 · 4 · 4 · 4 · 10 · 24 · 28 · 40 · 46 · 38 (sum 200) — memory: **1 · 1 · 3 · 3 · 6 · 7 · 7 · 7 · 7 · 7 (sum 49)** | 2 · 4 · 4 · 4 · 10 · 24 · 28 · 40 · 46 · 38 |
| **Hiring Overview** · open jobs · awaiting action · interviews this week | Quillstone admin, Quillstone recruiter | **3 · 18 · 6** | 3 · 18 · 6 |
| Hiring Overview | Harborline admin | **3 · 21 · 1** | 3 · 21 · 1 |
| Hiring Overview | platform admin | 22 · 134 · 18 | memory 22 · 134 · 18 — sqlite 22 · 134 · **0** |
| Hiring Overview · pipeline by stage | Quillstone / Harborline | 10/8/5/2/1/1 · 14/7/3/2/2/3 (applied/screening/interview/offer/hired/rejected) | same |

"This week" was Monday 2026-09-07 to Sunday 2026-09-13 at capture time; the seed schedules interviews `daysFromNow(1..14)`, so the
window held 18 rounds platform-wide (Quillstone 6, Harborline 1). "This month" was applications with `applied_at` from 2026-09-01,
30 of the 200 (`daysAgo(1..6)`).

## The three things the numbers say that the card did not

**1. #39 does not show on the dashboards — it shows next to them.** On sqlite the platform personas' list API returns 0 rows for
`ats_employer`, `ats_employer_member`, `ats_interview`, `ats_offer` (that is #39). The dashboard tiles over the same objects read
**9 verified · 2 pending employers · 18 interviews this week** for the same persona on the same driver, because the analytics
service's native-SQL strategy does not apply the tenant wall the list path applies (`23-…-sqlite.md`). So on sqlite the Platform
Overview says "9 verified employers" while the "Employers" list one click away is empty. On the memory driver both paths agree
(12 / 30 / 40 / 14 for platform staff). The same native-SQL path also skips the object-level grant: a job seeker, who holds no grant
on `ats_employer_member` (REST 403), gets `24` from a count dataset on it — reported upstream with this evidence.

**2. Two dataset shapes are unusable on the memory driver (the documented dev boot), so the dashboards avoid them.**
A measure with its own `filter` — and therefore any `ratio` of two such measures — answers **501 `NOT_IMPLEMENTED`** on memory
(`driver-memory` refuses per-aggregation filters; the analytics service does not fall back) while answering correctly on sqlite
(`32`/`33-inline-…`). Every KPI is therefore one bare `count` plus a widget-level `filter`, which both drivers apply as the query's
WHERE — and the card's "conversion % between stages" tiles are not shipped (objectstack#16642). Separately, `dateGranularity`
bucketing on memory counts **distinct timestamps per bucket, not rows** (a week holding 38 applications on 7 distinct days reads 7;
by day every bucket reads 1) — objectstack#16178. The per-week bar is authored correctly and is right on sqlite; on memory it is
wrong by that mechanism.

**3. The fourth employer tile ("median days from `applied_at` to the offer's `created_at` for hired applications") cannot be
built from what exists.** No median aggregate (`count/sum/avg/min/max/count_distinct`); no computed column across two objects in a
dataset (the only derived form combines other measures by name); and on the demo seed **no hired application has an offer row at
all** — all 14 offers sit on `offer`-stage applications (#53). It is left out rather than approximated.
