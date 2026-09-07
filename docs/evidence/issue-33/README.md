# Evidence — issue #33 (`highlightFields` on the three `filters`-slice objects)

Captured on 2026-09-07 against `OS_PLATFORM_OWNER_EMAIL=admin@objectos.ai npx objectstack dev
--fresh --database-driver memory -p 4511 --log-level info`, after `[Seeder] Seed loading complete
{"inserted":818,...,"errored":0}`. `--database-driver memory` is required: on the default sqlite
driver `ats_employer` reads 0 rows to platform personas (#39), which empties the Employers Pending
queue and would make the "before" unmeasurable.

**Before** was re-measured on this branch's base (`62e496d`, `origin/main`) in the same container
and the same boot recipe — not quoted from the `docs/evidence/issue-3/` shots. It reproduces them
exactly.

| Persona | Sign-in |
|:--|:--|
| Platform administrator | `admin@platform.example` / `demo1234` |
| Job seeker | `candidate01@mail.example` / `demo1234` |

## The nav slices — the card's acceptance

| File | Persona | URL | What it shows |
|:--|:--|:--|:--|
| `00-before-employers-pending-nav-slice.png` | platform | `/_console/apps/ats/ats_employer/data?filter[verification_status]=pending` | **Before.** `Employer Name · Short Name · Logo · Industry · Company Size · City` (2 records). No verdict field, no contact. |
| `01-after-employers-pending-nav-slice.png` | platform | same | **After.** `Employer Name · Industry · City · Verification · Service Tier · Primary Contact` (2 records). |
| `02-before-jobs-pending-nav-slice.png` | platform | `/_console/apps/ats/ats_job/data?filter[status]=pending_review` | **Before.** `Job Title · Employer · Employer Organization · Department · Description · Requirements` (6 records) — two rich-text columns, no status, no location. |
| `03-after-jobs-pending-nav-slice.png` | platform | same | **After.** `Job Title · Employer · Status · City · Employment Type · Work Mode` (6 records). |
| `04-before-seeker-my-profile-nav-slice.png` | seeker | `/_console/apps/ats/ats_candidate/data?filter[user]={current_user_id}` (resolved to `usr_ats_c01`) | **Before.** `Full Name · Account · Photo · Phone · Email · City` (1 record). The third `filters` slice, from the card's comment. |
| `05-after-seeker-my-profile-nav-slice.png` | seeker | same | **After.** `Full Name · Current Title · City · Seeking Status · Years of Experience · Profile Visibility` (1 record). |

Both platform slices were reached by **clicking the nav entry**, not by typing the URL, so the shots
are of the shipped navigation.

## The other surfaces `highlightFields` feeds

| File | What it shows |
|:--|:--|
| `06-before-employer-record-header-and-jobs-related-list.png` | **Before.** One frame with both: the employer record header strip (`Primary Contact · Industry`) and, under Related, the Jobs related list (`Job Title · Employment Type · Work Mode · Salary Period · Min. Education · Status`). |
| `07-after-employer-record-header-and-jobs-related-list.png` | **After.** Header `Industry · City · Verification: Pending · Service Tier: Trial · Primary Contact`; Jobs related list `Job Title · Status · City · Employment Type · Work Mode`. `Employer` is in `ats_job.highlightFields` but is (correctly) suppressed on its own parent's related list. |
| `08-before-job-record-header.png` / `09-after-job-record-header.png` | Job record header: `Employer · Employer Organization` → `Employer · Status · City · Employment Type · Work Mode`. **Regression to note:** at five items two badges truncate (`Pendi…`, `Full-ti…`), and `Status` is now shown twice — once in the strip and once in the state-machine stage bar directly below it. |
| `10-before-candidate-record-header.png` / `11-after-candidate-record-header.png` | Candidate record header: `Phone · Email` → `Current Title · City · Seeking Status · Years of Experience · Profile Visibility`. **Trade-off to note:** phone and email leave the header; both remain on the Details tab as live `tel:` / `mailto:` links. |

## Non-regression — authored views are untouched

`highlightFields` feeds only the surfaces that derive their columns. Views that author a column list
are unaffected; these two shots are the check, and each rendered set is byte-identical to the array
in `src/views/`.

| File | Rendered | Authored in |
|:--|:--|:--|
| `12-after-authored-view-employer-all-unchanged.png` | `Employer Name · Industry · Company Size · City · Verification · Service Tier · Primary Contact` (12 records) | `src/views/employer.view.ts` `columns` |
| `13-after-authored-view-job-published-unchanged.png` | `Job Title · Employer · City · Work Mode · Salary (min) · Salary (max) · Employment Type` (22 records) | `src/views/job.view.ts` `seekerColumns` |

`ats_job.all` (`platformColumns`) and `ats_inquiry.inbox` were checked the same way and are also
unchanged.

## Unrelated observation, visible in these shots

`Primary Contact` (a `Field.user`) renders as the raw user id — `usr_ats_pixelforge_admin` — in every
grid, including the authored `ats_employer.all` view in `12-…` which this change does not touch. It
resolves to a display name on the record header and on the Details tab. Pre-existing and independent
of this card; filed separately.
