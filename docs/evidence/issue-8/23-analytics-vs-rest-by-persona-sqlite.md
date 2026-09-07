# Analytics count vs REST count, per persona and object · sqlite (default) driver · 2026-09-07T15:06Z
# analytics = POST /api/v1/analytics/dataset/query with an inline count dataset on the object; REST = GET /api/v1/data/OBJECT?$top=1&$count=true (total, or the error code).
# Captured from the terminal of the run (the script printed the table; this file is that output verbatim).

| persona | object | analytics count | REST count |
|:--|:--|--:|--:|
| platform_admin | ats_employer | 12 | 0 |
| platform_admin | ats_employer_member | 30 | 0 |
| platform_admin | ats_interview | 40 | 0 |
| platform_admin | ats_offer | 14 | 0 |
| platform_admin | ats_job | 40 | 40 |
| platform_admin | ats_application | 200 | 200 |
| platform_admin | ats_candidate | 80 | 80 |
| quillstone_admin | ats_employer | 1 | 1 |
| quillstone_admin | ats_employer_member | 3 | 3 |
| quillstone_admin | ats_interview | 10 | 10 |
| quillstone_admin | ats_offer | 2 | 2 |
| quillstone_admin | ats_job | 5 | 5 |
| quillstone_admin | ats_application | 27 | 27 |
| quillstone_admin | ats_candidate | 70 | 70 |
| harborline_admin | ats_employer | 1 | 1 |
| harborline_admin | ats_employer_member | 3 | 3 |
| harborline_admin | ats_interview | 6 | 6 |
| harborline_admin | ats_offer | 2 | 2 |
| harborline_admin | ats_job | 5 | 5 |
| harborline_admin | ats_application | 31 | 31 |
| harborline_admin | ats_candidate | 69 | 69 |
| job_seeker | ats_employer | 9 | 0 |
| job_seeker | ats_employer_member | 24 | PERMISSION_DENIED |
| job_seeker | ats_interview | 0 | 0 |
| job_seeker | ats_offer | 0 | 0 |
| job_seeker | ats_job | 22 | 22 |
| job_seeker | ats_application | 1 | 1 |
| job_seeker | ats_candidate | 1 | 1 |

Reading: the employer personas agree on every object (their row-level policies are applied on both paths). The platform personas and
the seeker disagree only on the four tenancy-walled objects: REST applies the Layer-0 tenant wall (#39's zero on sqlite) and the
object-level grant (the seeker holds no grant on `ats_employer_member`, so REST answers 403); the analytics path on sqlite — the
NativeSQLStrategy, raw SQL — applies neither, so it answers 12 / 30 / 40 / 14 to platform staff and 9 / 24 to the seeker. On the
memory driver (22-…-memory.md) the two paths agree everywhere, the seeker's `ats_employer_member` included (both PERMISSION_DENIED).
