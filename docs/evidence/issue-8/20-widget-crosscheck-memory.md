# probe · driver=memory · base=http://localhost:4333 · 2026-09-07T15:02:21.582Z

## persona platform_admin (admin@platform.example)

### ats_platform_overview
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| verified_employers | kpi | ats_employer_metrics · employer_count | 9 | 9 | yes |
| open_jobs | kpi | ats_job_metrics · job_count | 22 | 22 | yes |
| applications_this_month | kpi | ats_application_metrics · application_count | 30 | 30 | yes |
| active_candidates | kpi | ats_candidate_metrics · candidate_count | 70 | 70 | yes |
| pending_employers | kpi | ats_employer_metrics · employer_count | 2 | 2 | yes |
| pending_jobs | kpi | ats_job_metrics · job_count | 6 | 6 | yes |
| applications_per_week | bar | ats_application_metrics · application_count by applied_at | 2026-W27=1 · 2026-W28=1 · 2026-W29=3 · 2026-W30=3 · 2026-W31=6 · 2026-W32=7 · 2026-W33=7 · 2026-W34=7 · 2026-W35=7 · 2026-W36=7 (sum 49) | 2026-W27=2 · 2026-W28=4 · 2026-W29=4 · 2026-W30=4 · 2026-W31=10 · 2026-W32=24 · 2026-W33=28 · 2026-W34=40 · 2026-W35=46 · 2026-W36=38 (total 200) | NO |

### ats_hiring_funnel
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| stage_funnel | funnel | ats_application_metrics · application_count by stage | Hired=9 · Offer=14 · Interview=28 · Applied=88 · Screening=46 (sum 185) | Hired(hired)=9 · Offer(offer)=14 · Interview(interview)=28 · Applied(applied)=88 · Screening(screening)=46 (total 185) | yes |
| rejected | kpi | ats_application_metrics · application_count | 15 | 15 | yes |
| withdrawn | kpi | ats_application_metrics · application_count | 0 | 0 | yes |
| total_in_funnel | kpi | ats_application_metrics · application_count | 185 | 185 | yes |

### ats_employer_hiring
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| open_jobs | kpi | ats_job_metrics · job_count | 22 | 22 | yes |
| awaiting_action | kpi | ats_application_metrics · application_count | 134 | 134 | yes |
| interviews_this_week | kpi | ats_interview_metrics · interview_count | 18 | 18 | yes |
| pipeline_by_stage | bar | ats_application_metrics · application_count by stage | Hired=9 · Offer=14 · Interview=28 · Applied=88 · Screening=46 · Rejected=15 (sum 200) | Hired(hired)=9 · Offer(offer)=14 · Interview(interview)=28 · Applied(applied)=88 · Screening(screening)=46 · Rejected(rejected)=15 (total 200) | yes |

## persona platform_ops (ops@platform.example)

### ats_platform_overview
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| verified_employers | kpi | ats_employer_metrics · employer_count | 9 | 9 | yes |
| open_jobs | kpi | ats_job_metrics · job_count | 22 | 22 | yes |
| applications_this_month | kpi | ats_application_metrics · application_count | 30 | 30 | yes |
| active_candidates | kpi | ats_candidate_metrics · candidate_count | 70 | 70 | yes |
| pending_employers | kpi | ats_employer_metrics · employer_count | 2 | 2 | yes |
| pending_jobs | kpi | ats_job_metrics · job_count | 6 | 6 | yes |
| applications_per_week | bar | ats_application_metrics · application_count by applied_at | 2026-W27=1 · 2026-W28=1 · 2026-W29=3 · 2026-W30=3 · 2026-W31=6 · 2026-W32=7 · 2026-W33=7 · 2026-W34=7 · 2026-W35=7 · 2026-W36=7 (sum 49) | 2026-W27=2 · 2026-W28=4 · 2026-W29=4 · 2026-W30=4 · 2026-W31=10 · 2026-W32=24 · 2026-W33=28 · 2026-W34=40 · 2026-W35=46 · 2026-W36=38 (total 200) | NO |

## persona quillstone_admin (admin@quillstone.example)

### ats_employer_hiring
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| open_jobs | kpi | ats_job_metrics · job_count | 3 | 3 | yes |
| awaiting_action | kpi | ats_application_metrics · application_count | 18 | 18 | yes |
| interviews_this_week | kpi | ats_interview_metrics · interview_count | 6 | 6 | yes |
| pipeline_by_stage | bar | ats_application_metrics · application_count by stage | Hired=1 · Offer=2 · Interview=5 · Applied=10 · Screening=8 · Rejected=1 (sum 27) | Hired(hired)=1 · Offer(offer)=2 · Interview(interview)=5 · Applied(applied)=10 · Screening(screening)=8 · Rejected(rejected)=1 (total 27) | yes |

### ats_hiring_funnel
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| stage_funnel | funnel | ats_application_metrics · application_count by stage | Hired=1 · Offer=2 · Interview=5 · Applied=10 · Screening=8 (sum 26) | Hired(hired)=1 · Offer(offer)=2 · Interview(interview)=5 · Applied(applied)=10 · Screening(screening)=8 (total 26) | yes |
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
| pipeline_by_stage | bar | ats_application_metrics · application_count by stage | Hired=1 · Offer=2 · Interview=5 · Applied=10 · Screening=8 · Rejected=1 (sum 27) | Hired(hired)=1 · Offer(offer)=2 · Interview(interview)=5 · Applied(applied)=10 · Screening(screening)=8 · Rejected(rejected)=1 (total 27) | yes |

## persona harborline_admin (admin@harborline.example)

### ats_employer_hiring
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| open_jobs | kpi | ats_job_metrics · job_count | 3 | 3 | yes |
| awaiting_action | kpi | ats_application_metrics · application_count | 21 | 21 | yes |
| interviews_this_week | kpi | ats_interview_metrics · interview_count | 1 | 1 | yes |
| pipeline_by_stage | bar | ats_application_metrics · application_count by stage | Applied=14 · Offer=2 · Interview=3 · Screening=7 · Hired=2 · Rejected=3 (sum 31) | Applied(applied)=14 · Offer(offer)=2 · Interview(interview)=3 · Screening(screening)=7 · Hired(hired)=2 · Rejected(rejected)=3 (total 31) | yes |

### ats_hiring_funnel
| widget | type | dataset · measure | analytics | REST count | match |
|:--|:--|:--|--:|--:|:--|
| stage_funnel | funnel | ats_application_metrics · application_count by stage | Applied=14 · Offer=2 · Interview=3 · Screening=7 · Hired=2 (sum 28) | Applied(applied)=14 · Offer(offer)=2 · Interview(interview)=3 · Screening(screening)=7 · Hired(hired)=2 (total 28) | yes |
| rejected | kpi | ats_application_metrics · application_count | 3 | 3 | yes |
| withdrawn | kpi | ats_application_metrics · application_count | 0 | 0 | yes |
| total_in_funnel | kpi | ats_application_metrics · application_count | 28 | 28 | yes |

## walled-object raw REST counts (no filter)
| persona | ats_employer | ats_employer_member | ats_interview | ats_offer | ats_job | ats_application | ats_candidate |
|:--|--:|--:|--:|--:|--:|--:|--:|
| platform_admin | 12 | 30 | 40 | 14 | 40 | 200 | 80 |
| platform_ops | 12 | 30 | 40 | 14 | 40 | 200 | 80 |
| quillstone_admin | 1 | 3 | 10 | 2 | 5 | 27 | 70 |
| harborline_admin | 1 | 3 | 6 | 2 | 5 | 31 | 69 |

