# Employer views: pipeline kanban, inbox, interview calendar, talent pool

Milestone: M2 · Labels: `pm:queue` · Blocked-by: card-06

## Scope
`src/views/application.view.ts`, `interview.view.ts`, `candidate.view.ts`, `job.view.ts`; barrel
`src/views/index.ts`; wire `views` in `objectstack.config.ts`. Load `objectstack-ui`.

## Spec
- **`ats_application`** — `list`: grid (display_name, job, candidate, stage, source, applied_at, rating).
  `listViews`: `pipeline` kanban `groupByField: 'stage'`, card columns display_name, job, rating,
  applied_at; `inbox_new` / `inbox_screening` / `inbox_interview` / `inbox_offer` / `inbox_hired` grids
  filtered by stage. `formViews.default` two-column: job, candidate, stage, source, rating, cover_letter.
- **`ats_interview`** — `listViews.calendar`: calendar on `scheduled_at`, title `display_name`, colour by
  `status`. Grid list with round, scheduled_at, mode, interviewers, status, rating.
- **`ats_candidate`** — `listViews.talent_pool`: grid with full_name, city, current_title,
  experience_years, skills, seeking_status; filters on skills/city/experience_years.
  `listViews.gallery`: gallery, image `avatar`, title `full_name`, subtitle `current_title`.
- **`ats_job`** — `listViews.mine`: grid (title, status, city, employment_type, headcount, published_at,
  expires_at); `listViews.published`: filter `status == 'published'`.
Every filter is a CEL/filter expression over `record.<field>`; export options csv/xlsx on grids.

## Acceptance
- Gates green (validate checks column bindings).
- `pnpm dev` boots; kanban groups by stage, calendar renders on scheduled_at (screenshot in PR).

## Out of scope
Apps/navigation, platform and seeker views, dashboards.
