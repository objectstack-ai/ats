# probe · driver=sqlite · base=http://localhost:4333 · 2026-09-07T15:04:52.695Z

## persona platform_admin (admin@platform.example)

### ats_platform_overview
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| verified_employers | kpi | ats_employer_metrics · employer_count | 9 | 0 | NO |
| open_jobs | kpi | ats_job_metrics · job_count | 22 | 22 | yes |
| applications_this_month | kpi | ats_application_metrics · application_count | 30 | 30 | yes |
| active_candidates | kpi | ats_candidate_metrics · candidate_count | 70 | 70 | yes |
| pending_employers | kpi | ats_employer_metrics · employer_count | 2 | 0 | NO |
| pending_jobs | kpi | ats_job_metrics · job_count | 6 | 6 | yes |
| applications_per_week | bar | ats_application_metrics · application_count by applied_at | 2026-W27=2 · 2026-W28=4 · 2026-W29=4 · 2026-W30=4 · 2026-W31=10 · 2026-W32=24 · 2026-W33=28 · 2026-W34=40 · 2026-W35=46 · 2026-W36=38 (sum 200) | 2026-W27=2 · 2026-W28=4 · 2026-W29=4 · 2026-W30=4 · 2026-W31=10 · 2026-W32=24 · 2026-W33=28 · 2026-W34=40 · 2026-W35=46 · 2026-W36=38 (total 200) | yes |

### ats_hiring_funnel
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| stage_funnel | funnel | ats_application_metrics · application_count by stage | Applied=88 · Hired=9 · Interview=28 · Offer=14 · Screening=46 (sum 185) | Applied(applied)=88 · Hired(hired)=9 · Interview(interview)=28 · Offer(offer)=14 · Screening(screening)=46 (total 185) | yes |
| rejected | kpi | ats_application_metrics · application_count | 15 | 15 | yes |
| withdrawn | kpi | ats_application_metrics · application_count | 0 | 0 | yes |
| total_in_funnel | kpi | ats_application_metrics · application_count | 185 | 185 | yes |

### ats_employer_hiring
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| open_jobs | kpi | ats_job_metrics · job_count | 22 | 22 | yes |
| awaiting_action | kpi | ats_application_metrics · application_count | 134 | 134 | yes |
| interviews_this_week | kpi | ats_interview_metrics · interview_count | 18 | 0 | NO |
| pipeline_by_stage | bar | ats_application_metrics · application_count by stage | Applied=88 · Hired=9 · Interview=28 · Offer=14 · Rejected=15 · Screening=46 (sum 200) | Applied(applied)=88 · Hired(hired)=9 · Interview(interview)=28 · Offer(offer)=14 · Rejected(rejected)=15 · Screening(screening)=46 (total 200) | yes |

## persona platform_ops (ops@platform.example)

### ats_platform_overview
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| verified_employers | kpi | ats_employer_metrics · employer_count | 9 | 0 | NO |
| open_jobs | kpi | ats_job_metrics · job_count | 22 | 22 | yes |
| applications_this_month | kpi | ats_application_metrics · application_count | 30 | 30 | yes |
| active_candidates | kpi | ats_candidate_metrics · candidate_count | 70 | 70 | yes |
| pending_employers | kpi | ats_employer_metrics · employer_count | 2 | 0 | NO |
| pending_jobs | kpi | ats_job_metrics · job_count | 6 | 6 | yes |
| applications_per_week | bar | ats_application_metrics · application_count by applied_at | 2026-W27=2 · 2026-W28=4 · 2026-W29=4 · 2026-W30=4 · 2026-W31=10 · 2026-W32=24 · 2026-W33=28 · 2026-W34=40 · 2026-W35=46 · 2026-W36=38 (sum 200) | 2026-W27=2 · 2026-W28=4 · 2026-W29=4 · 2026-W30=4 · 2026-W31=10 · 2026-W32=24 · 2026-W33=28 · 2026-W34=40 · 2026-W35=46 · 2026-W36=38 (total 200) | yes |

## persona quillstone_admin (admin@quillstone.example)

### ats_employer_hiring
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| open_jobs | kpi | ats_job_metrics · job_count | 3 | 3 | yes |
| awaiting_action | kpi | ats_application_metrics · application_count | 18 | 18 | yes |
| interviews_this_week | kpi | ats_interview_metrics · interview_count | 6 | 6 | yes |
| pipeline_by_stage | bar | ats_application_metrics · application_count by stage | Applied=10 · Hired=1 · Interview=5 · Offer=2 · Rejected=1 · Screening=8 (sum 27) | Applied(applied)=10 · Hired(hired)=1 · Interview(interview)=5 · Offer(offer)=2 · Rejected(rejected)=1 · Screening(screening)=8 (total 27) | yes |

### ats_hiring_funnel
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| stage_funnel | funnel | ats_application_metrics · application_count by stage | Applied=10 · Hired=1 · Interview=5 · Offer=2 · Screening=8 (sum 26) | Applied(applied)=10 · Hired(hired)=1 · Interview(interview)=5 · Offer(offer)=2 · Screening(screening)=8 (total 26) | yes |
| rejected | kpi | ats_application_metrics · application_count | 1 | 1 | yes |
| withdrawn | kpi | ats_application_metrics · application_count | 0 | 0 | yes |
| total_in_funnel | kpi | ats_application_metrics · application_count | 26 | 26 | yes |

## persona quillstone_recruiter (talent1@quillstone.example)

### ats_employer_hiring
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| open_jobs | kpi | ats_job_metrics · job_count | 3 | 3 | yes |
| awaiting_action | kpi | ats_application_metrics · application_count | 18 | 18 | yes |
| interviews_this_week | kpi | ats_interview_metrics · interview_count | 6 | 6 | yes |
| pipeline_by_stage | bar | ats_application_metrics · application_count by stage | Applied=10 · Hired=1 · Interview=5 · Offer=2 · Rejected=1 · Screening=8 (sum 27) | Applied(applied)=10 · Hired(hired)=1 · Interview(interview)=5 · Offer(offer)=2 · Rejected(rejected)=1 · Screening(screening)=8 (total 27) | yes |

## persona harborline_admin (admin@harborline.example)

### ats_employer_hiring
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| open_jobs | kpi | ats_job_metrics · job_count | 3 | 3 | yes |
| awaiting_action | kpi | ats_application_metrics · application_count | 21 | 21 | yes |
| interviews_this_week | kpi | ats_interview_metrics · interview_count | 1 | 1 | yes |
| pipeline_by_stage | bar | ats_application_metrics · application_count by stage | Applied=14 · Hired=2 · Interview=3 · Offer=2 · Rejected=3 · Screening=7 (sum 31) | Applied(applied)=14 · Hired(hired)=2 · Interview(interview)=3 · Offer(offer)=2 · Rejected(rejected)=3 · Screening(screening)=7 (total 31) | yes |

### ats_hiring_funnel
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| stage_funnel | funnel | ats_application_metrics · application_count by stage | Applied=14 · Hired=2 · Interview=3 · Offer=2 · Screening=7 (sum 28) | Applied(applied)=14 · Hired(hired)=2 · Interview(interview)=3 · Offer(offer)=2 · Screening(screening)=7 (total 28) | yes |
| rejected | kpi | ats_application_metrics · application_count | 3 | 3 | yes |
| withdrawn | kpi | ats_application_metrics · application_count | 0 | 0 | yes |
| total_in_funnel | kpi | ats_application_metrics · application_count | 28 | 28 | yes |

## walled-object raw REST counts (no filter)
| persona | ats_employer | ats_employer_member | ats_interview | ats_offer | ats_job | ats_application | ats_candidate |
|:--|--:|--:|--:|--:|--:|--:|--:|
| platform_admin | 0 | 0 | 0 | 0 | 40 | 200 | 80 |
| platform_ops | 0 | 0 | 0 | 0 | 40 | 200 | 80 |
| quillstone_admin | 1 | 3 | 10 | 2 | 5 | 27 | 70 |
| harborline_admin | 1 | 3 | 6 | 2 | 5 | 31 | 69 |

