# Shipped datasets by name vs REST · sqlite (default) driver · PR branch 8cd5956 · 2026-09-07T15:19:27.888Z
# analytics = POST /api/v1/analytics/dataset/query {"datasetName": D, "selection": {"measures": [M]}} · REST = GET /api/v1/data/OBJECT?$top=1&$count=true (total)

| persona | shipped dataset · measure | base object | analytics (by datasetName) | REST count | agree |
|:--|:--|:--|--:|--:|:--|
| job_seeker | ats_application_metrics · application_count | ats_application | 1 | 1 | yes |
| job_seeker | ats_job_metrics · job_count | ats_job | 22 | 22 | yes |
| job_seeker | ats_employer_metrics · employer_count | ats_employer | 9 | 0 | NO |
| job_seeker | ats_candidate_metrics · candidate_count | ats_candidate | 1 | 1 | yes |
| job_seeker | ats_interview_metrics · interview_count | ats_interview | 0 | 0 | yes |
| platform_admin | ats_application_metrics · application_count | ats_application | 200 | 200 | yes |
| platform_admin | ats_job_metrics · job_count | ats_job | 40 | 40 | yes |
| platform_admin | ats_employer_metrics · employer_count | ats_employer | 12 | 0 | NO |
| platform_admin | ats_candidate_metrics · candidate_count | ats_candidate | 80 | 80 | yes |
| platform_admin | ats_interview_metrics · interview_count | ats_interview | 40 | 0 | NO |
| quillstone_admin | ats_application_metrics · application_count | ats_application | 27 | 27 | yes |
| quillstone_admin | ats_job_metrics · job_count | ats_job | 5 | 5 | yes |
| quillstone_admin | ats_employer_metrics · employer_count | ats_employer | 1 | 1 | yes |
| quillstone_admin | ats_candidate_metrics · candidate_count | ats_candidate | 70 | 70 | yes |
| quillstone_admin | ats_interview_metrics · interview_count | ats_interview | 10 | 10 | yes |

seeker · ats_employer_metrics by verification_status -> 200 [{"verification_status":"Verified","employer_count":9}]
seeker · INLINE dataset on ats_employer_member (no shipped dataset, no grant) -> 200 [{"cnt":24}] · REST 403 PERMISSION_DENIED
