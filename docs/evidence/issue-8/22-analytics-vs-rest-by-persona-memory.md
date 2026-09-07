# Analytics count vs REST count, per persona and object · memory driver · 2026-09-07T15:09:03Z
# analytics = POST /api/v1/analytics/dataset/query with an inline count dataset on the object; REST = GET /api/v1/data/OBJECT?$top=1&$count=true (total, or the error code).

| persona | object | analytics count | REST count |
|:--|:--|--:|--:|
| platform_admin | ats_employer | 12 | 12 |
| platform_admin | ats_employer_member | 30 | 30 |
| platform_admin | ats_interview | 40 | 40 |
| platform_admin | ats_offer | 14 | 14 |
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
| job_seeker | ats_employer | 9 | 9 |
| job_seeker | ats_employer_member | PERMISSION_DENIED | PERMISSION_DENIED |
| job_seeker | ats_interview | 0 | 0 |
| job_seeker | ats_offer | 0 | 0 |
| job_seeker | ats_job | 22 | 22 |
| job_seeker | ats_application | 1 | 1 |
| job_seeker | ats_candidate | 1 | 1 |
