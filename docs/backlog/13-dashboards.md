# Three dashboards and their datasets

Milestone: M3 · Labels: `pm:queue` · Blocked-by: card-10

## Scope
`src/dashboards/platform-overview.dashboard.ts`, `funnel.dashboard.ts`, `employer-hiring.dashboard.ts`,
`src/datasets/*.dataset.ts`, barrels, wire `dashboards` + `datasets`; add the dashboard nav items to
the apps from card 09. Load `objectstack-ui` (dashboards, charts) and `objectstack-data` (analytics).

## Spec — DESIGN.md §04
- **`ats_platform_overview`**: KPI tiles — employers (verified), open jobs (`status == 'published'`),
  applications this month, active candidates (`seeking_status != 'not_looking'`), review queue length
  (pending employers + pending jobs); bar: applications per week (12 weeks).
- **`ats_hiring_funnel`**: funnel over `ats_application.stage` counts applied→screening→interview→offer→hired
  (exclude rejected/withdrawn from the funnel; show them as a separate tile); conversion % between stages.
- **`ats_employer_hiring`** (scoped by RLS to the viewer's employer automatically): open jobs, applications
  awaiting action (`stage in ['applied','screening']`), interviews this week, average days from
  `applied_at` to offer `created_at` for hired applications.
Every widget binds to a dataset field that exists — `pnpm validate` checks widget bindings.

## Acceptance
- Gates green; `pnpm validate` shows 3 dashboards; with `demo-en` loaded the funnel shows 88/46/28/14/9.

## Out of scope
Reports/scheduled digests, new objects.
