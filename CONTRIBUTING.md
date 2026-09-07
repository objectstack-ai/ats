# Contributing to ATS

Thanks for looking. This is an [ObjectStack](https://github.com/objectstack-ai/objectstack) application —
a platform-shaped recruiting marketplace written as typed metadata — and it is developed by people and
coding agents working from the same rules. Those rules live in three files; this one is the map.

| File | What it decides |
|:--|:--|
| [`DESIGN.md`](./DESIGN.md) | **Architecture authority.** Objects, fields, enum values, the isolation model, apps, automation, milestones. Written in Chinese; the domain vocabulary it fixes (岗位 · 投递 · 面试 · Offer · 候选人 · 雇主) is the vocabulary of the code and the `zh-CN` bundle. |
| [`AGENTS.md`](./AGENTS.md) | Conventions, naming, the delivery process, and what the PM dispatch loop reads. When a skill and `AGENTS.md` disagree, `AGENTS.md` wins; when `AGENTS.md` and `DESIGN.md` disagree on architecture, `DESIGN.md` wins. |
| [`docs/backlog/`](./docs/backlog/README.md) | The work cards. Each file is a complete, dispatch-ready issue body. |

## Run the gates — after every metadata change

```bash
pnpm install
pnpm validate     # protocol schema + CEL predicates (record.<field> existence) + widget bindings
pnpm lint         # data-model conventions + zh-CN translation parity (--i18n-strict)
                  # + en.ts source parity (pnpm check:i18n-source, runnable on its own)
pnpm typecheck
```

All three exit non-zero with a located, corrective message. **Nothing is done, and no PR is opened, until
all three pass**, and the PR body carries their tails. [CI](./.github/workflows/ci.yml) runs the same three
commands on every push and pull request; a green run on your machine and a green run in CI mean the same
thing because they are the same scripts.

Metadata mistakes fail *silently* at runtime — a mistyped field in a predicate is `null`, a capability
nobody grants is a navigation group that quietly disappears, a widget bound to a measure that does not
exist is an empty tile indistinguishable from "no data yet". The gates are the only place these surface
early, which is why they are not optional.

`pnpm dev` boot is optional evidence, not a gate. When you boot, read
[AGENTS.md → Booting with the demo seed](./AGENTS.md#booting-with-the-demo-seed--read-before-you-count-rows)
first: the seed loads only when `NODE_ENV` resolves to development or test, and zero rows before the
`[Seeder] Seed loading complete` line is not a permission problem.

## The card workflow

Work arrives as cards. A card is a GitHub issue whose body is one of the files in `docs/backlog/` (or is
written to the same standard), labelled `pm:queue` when it is ready. The loop is:

1. **Claim before you write code.** One issue per person or agent, one branch per issue:
   `claude/issue-<n>-<slug>` from `origin/main`. Every agent shares one GitHub identity, so the `Claim:`
   comment on the issue (session and branch) is the identity, not the assignee field.
2. **One dedicated worktree per task.** `git worktree add ../ats-issue-<n> -b claude/issue-<n>-<slug> origin/main`.
   Never edit a shared checkout. ⛔ Never `git stash` — the stash stack is shared across worktrees; use a
   wip commit or a patch.
3. **Verify the premise before the fix.** The issue body is a lead, not a spec: a file may have moved, a
   capability may already exist, a measurement may have changed. A report that disproves its issue, with
   evidence and without a PR, is a good outcome.
4. **Deliver the card, whole — and nothing else.** A bug you trip over on the way becomes a new,
   unassigned issue with the measurement that found it, never a rider on the PR you are on.
5. **Open a draft PR against `main`.** Title = the issue title; body = what changed, the three gate tails,
   `Fixes #<n>`. One issue per PR. Commits use an imperative subject with a scope prefix
   (`feat(objects): add ats_candidate`, `fix(security): …`) and a body that says why.
6. **The maintainer merges, by squash.** No self-merge, no auto-merge, no merging red or unreviewed PRs.

**Stop instead of guessing.** When a card leaves a public contract open — an object or field name, an enum
value, a sharing model, a permission scope — or conflicts with `DESIGN.md`, do not pick one. Return a
`needs_decision` with the options, their costs and a recommendation. Cards are written to leave no such
gap; finding one is the finding.

**Measure, do not assert.** This repository's review culture is that a claim in a PR body comes with the
command that produced it and the number it produced. "It works" is not a sentence in a PR here; "the
Quillstone admin reads 5 jobs / 27 applications / 3 offers and 0 of Harborline's" is. Several cards have
been overturned by their own developer measuring the premise — that is the standard, not the exception.

## Rules that are easy to break

**No vertical vocabulary — anywhere in the schema.** Object names, field names, option values and labels
are industry-neutral, always. No eldercare, no tech, no healthcare, no hospitality in any `*.object.ts`,
`*.view.ts`, `*.app.ts` or translation bundle. Industries live in the demo seed under `src/data/` and
nowhere else — swapping the seed is how this becomes another industry's ATS. `ats_employer.industry` is
an enum *about* industries; that is the one place the words appear, as option values of a neutral field.

**Reserved platform words are never field names.** `role`, `position`, `permission_set`,
`business_unit` (ADR-0090 D3; `validate` refuses them as `security-role-word`). Use a domain word:
`access_level`, `function`, `duty`.

**Every object authors `sharingModel`**, resolves a title (a `name`/`title`/`subject`/`full_name` field
or a **stored** `display_name` mirror declared as `nameField` — never a formula), and never sets
`namespace` or `tableName`. Predicates are CEL and reference fields as `record.<field>`; uniqueness is an
index, not a validation. The full table is in [AGENTS.md → Naming](./AGENTS.md#naming--binding).

**Capability expansion is tight.** No new runtime dependency, plugin, `requires:` capability or external
service unless the card says so. Propose it through `needs_decision`.

**Files a code PR never touches:** `LICENSE` · `CHANGELOG.md` (written at release time) ·
`skills-lock.json` and `.claude/skills/` (owned by the skills CLI) · `DESIGN.md` §01–§03 without a
`needs-user-decision` first.

## Translations

Every user-visible string the metadata authors — object, field and option labels, help text, sections,
validation messages, action copy, navigation, dashboards, datasets — exists in two locales:

- `en` is the source: the inline `label:` in the metadata **is** the English text.
  [`src/translations/en.ts`](./src/translations/en.ts) restates it so the two locale files have the same
  shape. Rename a label in an object file and rename it there too; a stale entry there wins at runtime.
- `zh-CN` is authored in [`src/translations/zh-CN.ts`](./src/translations/zh-CN.ts), with the vocabulary
  `DESIGN.md` fixes. Do not machine-translate the domain words.

Two different gates, both inside `pnpm lint`:

- **Coverage** — `objectstack lint --i18n-strict` fails when a translatable key is missing from a
  non-default locale, i.e. from `zh-CN`; `npx objectstack i18n check --show-keys` lists exactly which. It
  cannot speak for `en`: it reports the source locale as 100 % translated, because the source label *is*
  the translation.
- **Source parity** — `pnpm check:i18n-source` ([`scripts/check-i18n-source.mjs`](./scripts/check-i18n-source.mjs))
  compares every one of `en.ts`'s 507 keys against the label its metadata declares in the built artifact,
  and fails on a drifted value, a key whose metadata is gone, or a source label `en.ts` never restates.
  Renaming a label without renaming it in `en.ts` is a red gate, not a silent runtime override (#63).

The Studio's own metadata-form strings are the platform's and are not this repository's to translate
(both gates exclude them; `lint` shows them with `--include-platform`).

## Skills for coding agents

The ObjectStack skills bundle is installed under `.claude/skills/` and pinned by `skills-lock.json`.
Update it with `npx skills add objectstack-ai/objectstack/skills --skill '*' --agent claude-code -y` —
**never `--all`**. Skills give shape and intent; the Zod sources under
`node_modules/@objectstack/spec/src/**/*.zod.ts` are the truth for exact field shapes.

## License

By contributing you agree that your contributions are licensed under the [Apache-2.0](./LICENSE) license
that covers the project.
