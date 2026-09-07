# Evidence — issue #3 (card 08: platform and seeker views, public application form)

Captured on 2026-09-07 against `objectstack dev --fresh --database-driver memory` with
`OS_PLATFORM_OWNER_EMAIL=admin@objectos.ai`, signed in as the dev admin. Where a shot needed a
navigation group to render, the admin was given the `platform_admin` (and, for the seeker shots,
`job_seeker`) position through `sys_user_position`; the platform owner reads every row through
`viewAllRecords`, so row counts are the whole table, not a persona's slice.

| File | What it shows |
|:--|:--|
| `00a-before-main-bare-ats_job-lands-on-mine.png` | **Before (main).** `ats_job` had authored `mine` + `published` and no `all`; the bare platform "Jobs" entry landed on **My Jobs** (first named view). Not broken — but not "all jobs" either. |
| `00b-before-main-bare-ats_employer-synthesised-all-records.png` | **Before (main).** `ats_employer` had no authored views; the shell synthesised an **All Records** tab. The synthesis happens only when an object declares no views at all. |
| `01-sidebar-platform-and-seeker-groups.png` | The Platform and Job Seeker groups with all five seeker entries mounted (Find Jobs · My Applications · My Interviews · My Profile · My Credentials). |
| `02-platform-jobs-bare-lands-on-all.png` | After: the bare "Jobs" entry lands on the authored `ats_job.all` (40 rows, employer column). |
| `03-platform-employers-bare-lands-on-all.png` | `ats_employer.all` with the verification column (12 rows). |
| `04-platform-employers-pending-nav-slice.png` | "Employers Pending" — the nav-owned `filters` slice (2 rows). Columns are auto-derived by the data surface, not authored. |
| `05-platform-jobs-pending-nav-slice.png` | "Jobs Pending" — the nav-owned `filters` slice (6 rows). Same column caveat. |
| `06-platform-reports-all.png` · `07-platform-reports-open.png` | `ats_report.all` (6) and `ats_report.open` = `status in [new, investigating]` (4). |
| `08-platform-skills.png` · `09-platform-credential-types.png` | The two dictionary grids (60 / 15 rows). |
| `10-seeker-find-jobs-published.png` | `ats_job.published` with the card's seven columns and the work-mode / employment-type / city filter chips (22 rows). |
| `11-seeker-my-applications-timeline.png` | `ats_application.mine` — timeline anchored on `applied_at`, coloured by `stage`. |
| `12-seeker-my-interviews-calendar.png` | `ats_interview.calendar` (pre-existing; the card's `mine` calendar is this view). |
| `13-seeker-my-profile-slice.png` | "My Profile" = `filters: { user: '{current_user_id}' }`, resolved by the shell to the signed-in user's id; one row once the admin owned a candidate row (zero rows before, because the owner had none). |
| `14-seeker-my-credentials.png` | `ats_candidate_credential.all` (30 rows). |
| `15-platform-employer-record.png` · `16-platform-employer-form-verification.png` | A pending employer's record and its edit form: Company · **Verification** (docs, status, note) · Service. `Verification Note` renders only for a platform-only persona (see the PR body's findings). |
| `17-seeker-candidate-profile-form.png` · `18-seeker-candidate-profile-form-salary-last.png` | The candidate profile form — every field, **Expected Salary** section last, credentials grid below it. |
| `19-anonymous-public-form-page-probe.png` | **Probe, not shipped.** `/_console/f/apply` rendered in a fresh browser context with no session, from a temporarily authored `formViews.apply_public`. |
| `20-anonymous-public-form-probe-transcript.txt` | The anonymous `curl` transcript against the same probe: GET serves the whitelisted schema (200), POST is refused with `Candidate is required` (400) even with a real job id, every read is 401. This is the measurement behind the `needs_decision` on the public form. |
