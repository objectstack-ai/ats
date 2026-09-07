# ATS

**An open-source recruiting marketplace built on [ObjectStack](https://github.com/objectstack-ai/objectstack).**
Employers post jobs, candidates apply, the platform governs — modelled as typed metadata:
objects, permissions, approval flows, views and dashboards in one readable repository.

**一个建在 ObjectStack 上的开源平台型招聘应用。** 多雇主入驻、候选人求职、平台方治理，全部是类型化元数据。

> Status: **M1 — data & permission skeleton in progress.** See [DESIGN.md](./DESIGN.md) for the model and
> [docs/backlog](./docs/backlog/README.md) for what is being built next.

## What it is

- **Platform-shaped, not single-company** — many employers, one platform operator, hard row-level isolation between employers.
- **Three audiences, one metadata set** — platform ops, employer, job seeker each get their own app over the same objects.
- **Credentials are first-class** — "licensed to practise, re-certified before expiry" is core, not a plugin.
- **Industry-neutral by rule** — no vertical vocabulary in the schema; industries live in seed data only.

## Quick start

```bash
pnpm install
pnpm dev          # REST + Console on http://localhost:3000
```

Open <http://localhost:3000/_console/> and sign in. The `dev` script boots with the demo seed
(`src/data/`, English by default — `OS_SEED_LOCALE=zh pnpm dev` for the Chinese set) and declares the
platform owner: it sets `OS_PLATFORM_OWNER_EMAIL=admin@objectos.ai`, which is what gives that
account platform-admin standing once the seed's people exist (without it the runtime's first-account
carve-out stays shut and the dev admin is an ordinary user who can administer nothing). On Windows
`cmd`, set the variable in the shell before running `objectstack dev --ui`.

**The demo seed loads in development mode only.** Every seed under `src/data/` is scoped
`env: ['dev', 'test']`, and the seed loader reads the mode from `NODE_ENV`: `objectstack dev` (what
`pnpm dev` runs) sets `NODE_ENV=development` and seeds; `objectstack start` and `objectstack serve`
set `NODE_ENV=production` when it is unset and seed **nothing** — no ATS rows, no demo logins — and
say so on one warning line under the startup banner (`[ats] demo seed skipped: NODE_ENV=production …`).
A production database therefore never receives the fictional people or their published passwords.
To load the demo into a production-mode boot on purpose, export `NODE_ENV=development`
(the CLI documents `NODE_ENV=development objectstack start`). Details and evidence:
[`src/data/demo-seed-gate.ts`](./src/data/demo-seed-gate.ts).

### Demo logins

**These are fictional demo accounts in a public repository. The passwords are documented here on
purpose and are not secrets.** They exist **only when the demo seed loads — `NODE_ENV=development`
(or `test`), which `objectstack dev` / `pnpm dev` set**; under `objectstack start`, `objectstack serve`
or `NODE_ENV=production` none of these rows is created and every sign-in below answers
`Invalid email or password`. Each persona is served exactly the navigation group its position unlocks
(DESIGN.md §04); the shared password is `demo1234`. They are defined in
[`src/data/shared/personas.ts`](./src/data/shared/personas.ts).

| Boot | `NODE_ENV` the CLI pins | Demo rows | These logins |
|---|---|---|---|
| `pnpm dev` · `objectstack dev` | `development` (when unset) | 809 seeded | work |
| `objectstack start` · `objectstack serve` | `production` (when unset) | none | do not exist |
| `NODE_ENV=development objectstack start` | as exported | 809 seeded | work — deliberate opt-in |

| Sign in as | Password | Who | Sees |
|---|---|---|---|
| `admin@objectos.ai` | `admin123` | Platform owner (`OS_PLATFORM_OWNER_EMAIL`) | Setup and the ATS app; holds no ATS position, so no ATS group — use the personas below for the product |
| `admin@platform.example` | `demo1234` | Platform administrator | **Platform** group, all data |
| `ops@platform.example` | `demo1234` | Platform operations | **Platform** group, review queues |
| `admin@quillstone.example` | `demo1234` | Employer administrator, Quillstone | **Hiring** group |
| `talent1@quillstone.example` | `demo1234` | Recruiter, Quillstone | **Hiring** group |
| `admin@harborline.example` | `demo1234` | Employer administrator, Harborline | **Hiring** group |
| `candidate01@mail.example` | `demo1234` | Job seeker | **Job Seeker** group |

Employer isolation works: signed in as Quillstone you see 5 jobs, 27 applications, 2 offers,
3 team members and 2 inquiries; as Harborline, 5 / 31 / 2 / 3 / 2 — and neither sees a single row of
the other's.

### The public application form

Anyone — no account, no cookie — can apply to a published job at
`/_console/f/apply?prefill_job=JOB_ID` (open a published job and use **Public Apply Link**), or by
`POST /api/v1/forms/apply/submit`. The submission lands in `ats_inquiry`, a quarantine object nobody
browses; the platform or the employer that owns the job converts it (**Convert to Application** on the
inquiry) into a candidate and an application — a repeat inquiry from the same e-mail attaches to the
existing candidate. The anonymous write is authorised by the form declaration itself, not by a guest
permission set (DESIGN.md §04).

> **Run the demo on `--database-driver memory`.** On the default driver the four tenancy-scoped
> objects (`ats_employer`, `ats_employer_member`, `ats_interview`, `ats_offer`) return no rows to
> the platform personas, so the Platform group's review queues look empty. The employer and seeker
> personas are unaffected. Cause and evidence: [#39](https://github.com/objectstack-ai/ats/issues/39)
> (upstream [objectstack#16589](https://github.com/objectstack-ai/objectstack/issues/16589)).
>
> Two other known gaps, both with the measurement in the issue:
> [#45](https://github.com/objectstack-ai/ats/issues/45) — an employer administrator cannot yet
> *create* a job (blocked upstream); [#13](https://github.com/objectstack-ai/ats/issues/13) —
> employers can currently read every candidate profile, including ones marked hidden.

Every metadata change is gated:

```bash
pnpm validate     # protocol schema + CEL predicates + bindings
pnpm lint         # data-model conventions (ADR-0090 vocabulary, titles, master-detail)
pnpm typecheck
```

## Layout

| Path | Contents |
|---|---|
| `objectstack.config.ts` | `defineStack()` — the single entry point |
| `src/objects/` | `ats_*` business objects |
| `DESIGN.md` | Architecture authority — objects, isolation model, apps, automation, milestones |
| `AGENTS.md` | Conventions for humans and coding agents; read by the PM dispatch loop |
| `docs/backlog/` | Dispatch-ready work cards (each file is an issue body) |

## License

Apache-2.0 — see [LICENSE](./LICENSE).
