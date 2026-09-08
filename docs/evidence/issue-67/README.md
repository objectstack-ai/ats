# Evidence — issue #67 (`Field.user` columns render the raw user id in every grid)

Captured on 2026-09-08 in one container, on branch `claude/issue-67-employer-contact`, against
`OS_PLATFORM_OWNER_EMAIL=admin@objectos.ai npx objectstack dev -p 4671 --log-level info` with the
driver named per run, after `[Seeder] Seed loading complete`. Every count below was read from the
top-level `records` / `total` of a REST list response with `hasMore == false` and
`records.length == total` asserted first.

| Persona | Sign-in | Role here |
|:--|:--|:--|
| Platform administrator | `admin@platform.example` / `demo1234` | the reviewer this card is about |
| Platform operations | `ops@platform.example` / `demo1234` | works the pending queue |
| Job seeker | `candidate01@mail.example` / `demo1234` | the audience the mirror must NOT reach |
| Platform owner | `admin@objectos.ai` / `admin123` | holds no ATS position; used only as the independent reader that sees all 113 `sys_user` rows |

## The shots

| File | Driver | URL | What it shows |
|:--|:--|:--|:--|
| `01-after-employers-pending-nav-slice.png` | memory | `/_console/apps/ats/ats_employer/data?filter[verification_status]=pending` | The review queue, reached by clicking the **Employers Pending** nav entry. 2 records, `Primary Contact Name` = `Zoe Hamilton`, `Samir Khoury`. Zero `usr_ats_*` strings on screen. |
| `02-after-authored-view-employer-all.png` | memory | `/_console/apps/ats/ats_employer` | The authored `ats_employer.all` view, reached by clicking **Employers**. 12 records, all 12 contact names rendered, zero `usr_ats_*` strings on screen. |
| `03-after-employer-record-header.png` | memory | `/_console/apps/ats/ats_employer/record/…` (Pixelforge Studios) | The record page. Header strip reads `Primary Contact Name: Zoe Ha…` — the shell truncates a 5-item strip, the same behaviour `docs/evidence/issue-33/` recorded for `Pendi…` / `Full-ti…`. **The Details tab still shows `PRIMARY CONTACT usr_ats_pixelforge_admin`**: that is the `owner` pointer, deliberately unchanged and deliberately not replaced — it is what the F1 approval notifies and what an admin edits. This shot doubles as the "before" for the renderer: a `Field.user` still prints its raw value wherever the pointer itself is shown. |
| `04-after-sqlite-boot2-employers-pending.png` | sqlite, 2nd boot of one file | same as `01-…` | The same queue after the second boot of a persistent database — the boot that runs `claimSeedOwnership`'s `multi: true` pass and the seed's re-boot upsert. Names intact. |

The "before" state of the two grids is this repository's own
`docs/evidence/issue-33/01-after-employers-pending-nav-slice.png` and
`12-after-authored-view-employer-all-unchanged.png`, taken with the same recipe on `62e496d`, plus
the measurement quoted in the card itself (`records[0].owner == "usr_ats_pixelforge_admin"`). It was
not re-taken here; shot `03-…` shows the unresolved pointer still rendering that way today.

## The two premises the fix rests on, re-checked

**1. No platform persona can read an employer-staff `sys_user` row** — so the runtime's refusal to
expand `ats_employer.owner` is correct, and the fix must not widen that read.

| Persona | `sys_user` readable | of the 30 employer-staff rows |
|:--|--:|--:|
| platform administrator | 1 of 113 | 0 |
| platform operations | 1 of 113 | 0 |
| job seeker | 1 of 113 | 0 |
| platform owner (`admin@objectos.ai`) | 113 of 113 | 30 |

Identical on both drivers. The set of "employer-staff" ids is not hand-written: it is the 30 `user`
values of `ats_employer_member`, read as the platform owner. Note the drift from the card's triage
comment, which measured 83 of 113 readable on `54cd69c`: the readable set is now the caller's own
row alone. The conclusion the premise carries is unchanged and stronger.

**2. The name is already in this audience's hands** — `ats_employer_member.display_name` is a stored
mirror stamped `"<user name> · <access level>"`.

| Persona | `ats_employer_member` readable | rows carrying a name |
|:--|--:|--:|
| platform administrator | 30 of 30 | 30 |
| platform operations | 30 of 30 | 30 |
| job seeker | **403 `PERMISSION_DENIED`** | — |

Both drivers. The seeker line is why the job-seeker permission set seals `owner_name`: for that
audience the name would have been new information, not a restatement.

## The projected values, cross-checked against an independent source

`owner_name` is stamped by `ats_employer_stamp` from `sys_user.name`. It is verified here against
`ats_employer_member.display_name` — a different column, stamped by a different handler, from a
different row, seeded independently — never against itself. Both the name and the pointer are
compared, so a right name on a wrong contact would fail.

| Employer | `ats_employer.owner_name` | `ats_employer_member.display_name` (that employer's `admin` row) | pointer vs `member.user` |
|:--|:--|:--|:--|
| Bluewater Hospitality Group | Nicolas Aubert | Nicolas Aubert · admin | `usr_ats_bluewater_admin` = same |
| Brightmarket Retail Group | Stephen Quill | Stephen Quill · admin | `usr_ats_brightmarket_admin` = same |
| Cedarbrook Care Network | Helen Mwangi | Helen Mwangi · admin | `usr_ats_cedarbrook_admin` = same |
| Harborline Manufacturing | Walter Brandt | Walter Brandt · admin | `usr_ats_harborline_admin` = same |
| Ironbridge Construction | Frank Delaney | Frank Delaney · admin | `usr_ats_ironbridge_admin` = same |
| Lumenvale Academy | Ruth Calloway | Ruth Calloway · admin | `usr_ats_lumenvale_admin` = same |
| Meridian Clinics | Samir Khoury | Samir Khoury · admin | `usr_ats_meridian_admin` = same |
| Orbit Consulting Partners | Victoria Lang | Victoria Lang · admin | `usr_ats_orbit_admin` = same |
| Pixelforge Studios | Zoe Hamilton | Zoe Hamilton · admin | `usr_ats_pixelforge_admin` = same |
| Quillstone Robotics | Margaret Ellison | Margaret Ellison · admin | `usr_ats_quillstone_admin` = same |
| Summitridge Financial | Alan Pemberton | Alan Pemberton · admin | `usr_ats_summitridge_admin` = same |
| Swiftroute Logistics | Paula Reyes | Paula Reyes · admin | `usr_ats_swiftroute_admin` = same |

12 of 12 matched on both the name and the pointer, on memory and on sqlite, on the first boot and on
the second boot of one persistent file.

## #43 — the stamp must not be re-derived by a payload that does not name its source

| Write | Expected | Measured (both drivers) |
|:--|:--|:--|
| `PATCH {}` (no-op) | no stamp moves | 0 of 12 rows changed |
| `PATCH { city }` with the value it already has | no stamp moves | 0 of 12 rows changed |
| `PATCH { verification_note }` — the reviewer's own write | no stamp moves | 0 of 12 rows changed |
| `PATCH { owner_name: "HACKED VALUE" }` | re-derived from `owner`, nothing else touched | 0 of 12 rows changed (the tampered value did not survive) |
| `PATCH { owner: <another user> }` | that row follows, alone | 1 of 12 rows changed, to `Victoria Lang` |
| `PATCH { owner: null }` | the mirror empties | `owner = null`, `owner_name = null` |
| second boot of one sqlite file (`claimSeedOwnership` + the seed's re-boot upsert) | all 12 values reproduce | 12 of 12 `(name, owner, owner_name)` triples identical to boot 1; 12 distinct values, so no single `SET` clause was broadcast |

Boot 2's seeder line, for the record: `[Seeder] Seed loading complete {"inserted":0,"updated":7,"skipped":811,"errored":0}`.

## Seed shape — unchanged

818 rows inserted on a fresh boot (`errored: 0`); `ats_application` 200 with the funnel
`applied 88 · screening 46 · interview 28 · offer 14 · hired 9` (+ `rejected 15`); `ats_candidate` 80;
`ats_employer` 12; `ats_employer_member` 30. Same on both drivers and on both sqlite boots.
