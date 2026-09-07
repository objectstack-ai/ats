# ATS — Agent Instructions

> Read by Claude Code, Cursor, Codex (`AGENTS.md`) and by the PM dispatch loop, which carries
> these rules into every developer dispatch. When a skill and this file disagree, **this file wins**.
> When this file and `DESIGN.md` disagree on architecture, **`DESIGN.md` wins** — fix this file.

## Project context

An **ObjectStack** application: a platform-shaped recruiting marketplace (employers, candidates,
platform operator) defined as typed metadata. Not a framework, not a package — an app people fork.

- **Entry point:** `objectstack.config.ts` (`defineStack()`)
- **Spec package:** `@objectstack/spec` ^17 (Zod-first); protocol range pinned in `manifest.engines`
- **Architecture authority:** [`DESIGN.md`](./DESIGN.md) — objects, isolation model, apps, automation, milestones
- **Work cards:** [`docs/backlog/`](./docs/backlog/README.md) — each file is a dispatch-ready issue body

## Verify your work — after every metadata change

```bash
pnpm validate     # protocol schema + CEL predicates (record.<field> existence) + widget bindings
pnpm lint         # data-model conventions: reserved vocabulary, titles, master-detail, select options
pnpm typecheck
```

`validate` runs the same gates as `pnpm build` without emitting `dist/`. All three exit non-zero with a
located, corrective message. **Never report a change as done, and never open a PR, until all three pass.**
Paste the three green tails into the PR body.

## Booting with the demo seed — read before you count rows

The demo seed (`src/data/`, 818 rows incl. the 7 logins in `README.md`) is scoped `env: ['dev', 'test']`
and loads **only when the boot's `NODE_ENV` resolves to development or test**. The CLI pins it for you:

```bash
npx objectstack build
OS_PLATFORM_OWNER_EMAIL=admin@objectos.ai npx objectstack dev --fresh --database-driver memory -p <port> --log-level info
```

`objectstack dev` spawns `serve --dev`, which sets `NODE_ENV=development` when unset, so this seeds —
no extra flag. `objectstack start` / `objectstack serve` set `NODE_ENV=production` when unset and seed
**nothing**. Both states announce themselves; **never read zero rows as a fail-closed policy until you
have checked the boot log for these lines**:

| State | What the log says | Rows |
|:--|:--|:--|
| seeded | `INFO [ats] demo seed enabled: NODE_ENV=development …` then `[Seeder] Seed loading complete {"inserted":818,…,"errored":0}` | 80 `ats_candidate`, 7 sign-ins work |
| skipped | `WARN [ats] demo seed skipped: NODE_ENV=production …` (replayed under the banner at the default log level) and, at `--log-level info`, `[SeedLoader] Environment 'prod': skipped 16 dataset(s) …` | 0 everywhere, every persona answers `Invalid email or password` |

If you exported `NODE_ENV=production` in your shell, `objectstack dev` keeps it and you get the skipped
state on purpose (add `OS_CRYPTO_AUTOKEY=1` to such a boot: production mode also arms the platform's
crypto-key guard, and `--fresh` has no persisted key, so the server exits right after seeding without it —
`objectstack start` sets that variable for itself). ⛔ Do not add `NODE_ENV=development` to the `dev` script or to the `objectstack dev`
command line: `dev.ts` measures that it activates oclif's tsx source loader in the compile/serve children
and breaks the boot; `serve --dev` already sets it in-process. Wait for the `[Seeder] Seed loading complete`
line before counting — counting earlier also reads zero. Rule and evidence: `src/data/demo-seed-gate.ts`.

## Naming — binding

| Context | Convention | Example |
|:--|:--|:--|
| Object `name` | `ats_` + `snake_case`; object name **is** the table name | `ats_application` |
| Field keys / option values | `snake_case` / lowercase | `applied_at`, `pending_review` |
| Config keys (TS props) | `camelCase` | `maxLength`, `defaultValue` |
| Metadata type names | singular | `'view'`, `'flow'` |
| Files | `{name}.{type}.ts` | `job.object.ts`, `employer.app.ts` |
| Exports | `PascalCase`, barrel via `Object.values()` | `export { Job } from './job.object.js'` |

- **Industry-neutral, always.** No vertical vocabulary (eldercare, tech, healthcare…) in any object,
  field, option value or label. Industries live in seed data under `src/data/` only.
- **Reserved platform words — never as field names:** `role`, `position`, `permission_set`,
  `business_unit` (ADR-0090 D3; `validate` refuses them as `security-role-word`). Use a domain word:
  `access_level`, `function`, `duty`.
- **Never set `namespace` or `tableName` on an object.** Prefix lives in `name`.
- **Every object authors `sharingModel`** — one of `private` · `public_read` · `public_read_write` ·
  `controlled_by_parent`. Absence is refused (`security-owd-unset`). Which one is decided in `DESIGN.md` §03.
- **Every object resolves a title.** Use a `name`/`title`/`subject`/`full_name` field, or a **stored**
  `display_name` mirror declared as `nameField` — never a formula (formulas are not searchable).
- **Predicates are CEL** and reference fields as `record.<field>`; a bare `<field>` is a silent `null`.
  `script` validations are inverted: the rule **fails when the expression is true**.
- **Uniqueness is an index, not a validation** — `indexes: [{ fields: [...], unique: 'organization' }]`.

## Structure

```
objectstack.config.ts   defineStack() — the single entry point
src/objects/            ats_*.object.ts          src/security/     positions, permission sets, RLS, FLS, onEnable bindings
src/views/              *.view.ts                src/hooks/        runtime handlers (display_name / employer stamps)
src/apps/               *.app.ts                 src/flows/            F1–F6 automation (F5/F6 are schedule flows)
src/dashboards/         *.dashboard.ts + datasets src/translations/ en, zh-CN
src/data/               demo-en/, demo-zh/ seeds docs/backlog/     work cards
```

## Delivery process — what the dispatch loop reads

| Topic | Rule |
|:--|:--|
| Default branch | `main` |
| Branch naming | `claude/issue-<n>-<slug>`, from `origin/main` |
| Worktree | **One dedicated worktree per task**: `git worktree add ../ats-issue-<n> -b claude/issue-<n>-<slug> origin/main`. Never edit a shared checkout. |
| Stash | ⛔ Never `git stash` — the stash stack is shared across worktrees. Use a wip commit or a patch. |
| Commits | Imperative subject, scope prefix: `feat(objects): add ats_candidate`, `fix(security): …`. Body says why. |
| PR | **Draft** PR against `main`, title = issue title, body: what changed · gate output · `Fixes #<n>`. One issue per PR. |
| Release notes | **None per PR.** `CHANGELOG.md` is written at release time by the maintainer; a code PR never touches it. |
| Files a code PR never touches | `LICENSE` · `CHANGELOG.md` · `skills-lock.json` and `.claude/skills/` (owned by the skills CLI) · `DESIGN.md` §01–§03 without a `needs-user-decision` first |
| Tests / gates | `pnpm validate && pnpm lint && pnpm typecheck`. No shared heavy-verify lock exists; `pnpm dev` boot is optional evidence. |
| Merge policy | Maintainer merges, **squash**. No self-merge, no auto-merge, no merging red or unreviewed PRs. |
| Capability expansion | **Tight.** No new runtime dependency, plugin, `requires:` capability or external service unless the card says so. Propose via `needs_decision`. |
| Scope | Deliver the card, whole. Out-of-scope findings become new unassigned issues, not riders. |

### PM dispatch

The repository is its own backlog — no `.claude/pm-dispatch.json` needed. Labels: `pm:queue` (ready),
`pm:dispatched` (in flight), `needs-user-decision` (blocked on the maintainer — never dispatch).
`Blocked-by: #<n>` lines are honoured at selection time. Developer agents run on **Fable** by default
(maintainer's choice); one issue per agent, in a dedicated worktree, returning the `dev-report` JSON.

**Stop instead of guessing** when a card underspecifies a public contract — an object or field name,
an enum value, an OWD, a permission scope — or conflicts with `DESIGN.md`: return `needs_decision`
with options, costs and a recommendation. Cards in `docs/backlog/` are written to leave no such gap;
if you find one, that is the finding.

## AI skills

The ObjectStack skills bundle lives in `.claude/skills/` as real directories, pinned by `skills-lock.json`.
Update with:

```bash
npx skills add objectstack-ai/objectstack/skills --skill '*' --agent claude-code -y
```

**Never `--all`** — it expands to `--agent '*'` and writes one full copy of the bundle per agent runtime
the CLI knows about (`agent/`, `.agents/`, …), which is how this repo once carried the bundle three
times. Another runtime (Cursor, Codex) installs its own copy with its own `--agent` value.

| Skill | Load when |
|:--|:--|
| **objectstack-platform** | `defineStack()`, `requires:`, drivers, boot, plugins |
| **objectstack-data** | objects, fields, relationships, validations, indexes, hooks, RLS, seeds |
| **objectstack-ui** | views (grid/kanban/calendar/gallery/timeline), apps, dashboards, actions, public forms |
| **objectstack-automation** | flows, approvals, triggers, jobs, state machines |
| **objectstack-formula** | every CEL expression — formulas, predicates, conditions, dynamic seed values |
| **objectstack-i18n** | translation bundles, locale config |
| **objectstack-query** / **-api** / **-ai** | ObjectQL, REST/auth surface, MCP tools |
| **objectstack-pm-dispatch** | running the backlog loop |

> Skills give shape and intent; **the Zod sources under `node_modules/@objectstack/spec/src/**/*.zod.ts`
> are the truth.** Read them for exact field shapes before authoring.

## Learn more

- [ObjectStack docs](https://objectstack.ai/docs) · [objectstack-ai/objectstack](https://github.com/objectstack-ai/objectstack) · [skills CLI](https://skills.sh/)
