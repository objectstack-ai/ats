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
