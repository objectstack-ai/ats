# Release: README, live demo, CI, screenshots, CONTRIBUTING, i18n

Milestone: M4 · Labels: `pm:queue` · Blocked-by: card-09, card-11, card-12, card-13

## Scope
`README.md` (bilingual, screenshots, "try it" link), `CONTRIBUTING.md`, `.github/workflows/ci.yml`,
`docs/screenshots/`, `src/translations/` (`en`, `zh-CN` bundles for object/field/nav labels — load
`objectstack-i18n`), `docker-compose.yml` + `Dockerfile` from the ObjectStack blank template, and a
StackBlitz-or-container live demo link recorded in README.

## Spec
- CI: `pnpm install --frozen-lockfile && pnpm validate && pnpm lint && pnpm typecheck` on push and PR.
- i18n: 100 % label coverage for both locales (the i18n skill's coverage report), `i18n` block in
  `defineStack` with `defaultLocale: 'en'`, `supportedLocales: ['en','zh-CN']`.
- Screenshots: pipeline kanban, interview calendar, funnel dashboard, the three apps' home views.
- CONTRIBUTING: how to run gates, card workflow, `DESIGN.md` authority, no vertical vocabulary rule.

## Acceptance
- A fresh clone: `pnpm install && pnpm dev` boots with seed in under two minutes on a laptop;
  CI green on `main`; README's first screen shows what it is and a way to try it.

## Out of scope
New features; changes to `DESIGN.md` §01–§03.
