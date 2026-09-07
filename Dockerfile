# Container build for ATS — the app and the ObjectStack runtime in one image.
#
#   docker build -t ats .
#   docker run -p 8080:8080 \
#     -e OS_AUTH_SECRET -e OS_SECRET_KEY \
#     -e OS_PLATFORM_OWNER_EMAIL=admin@example.com \
#     -v ats-data:/srv/app/.objectstack \
#     ats
#
# Or `docker compose up -d` — see docker-compose.yml.
#
# ⚠️ Authored from the ObjectStack blank template, but NOT verified by building
# and running a container: the environment this file was written in had no
# Docker daemon. What was measured instead, natively, is every command below,
# in a fresh clone: `pnpm install --frozen-lockfile`, `pnpm build`, and
# `objectstack start` from the app directory with the compiled artifact
# present (the card-14 pull request, issue #9, records the numbers). Build it
# once before you rely on it.
#
# Why this is one image and not the template's two stages
# (`FROM ghcr.io/objectstack-ai/objectstack` + COPY dist/objectstack.json):
# the official runtime image is app-agnostic and boots the artifact ALONE, and
# the artifact only NAMES this app's runtime plugins — it does not carry their
# code. Measured on cli 17.3.0: booting `dist/objectstack.json` in an empty
# directory starts 38 plugins and `ats.rls-membership-resolver` is not among
# them, while `objectstack start` in the app directory (config + src present)
# starts 39 and registers it with `employer_org_ids` / `applicant_candidate_ids`.
# Without that resolver every employer-side row-level policy is unresolvable
# and fails closed to zero rows (DESIGN.md §03) — a container that looks
# healthy and shows employers nothing. So the runtime must start from the app
# directory, and the app directory must be in the image.
#
# Docs: https://objectstack.ai/docs/deployment/self-hosting

FROM node:22-slim

# pnpm, pinned to the version the lockfile is maintained with (same pin as
# .github/workflows/ci.yml). `--frozen-lockfile` refuses a lockfile that
# disagrees with package.json instead of quietly rewriting it.
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /srv/app

# Dependencies first, so source edits do not invalidate the install layer.
# pnpm-workspace.yaml is not optional: it approves the two native build
# scripts (better-sqlite3, esbuild) that pnpm otherwise refuses to run.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# The app: metadata sources, the in-repo runtime plugins, the demo seed.
COPY objectstack.config.ts tsconfig.json ./
COPY src ./src

# Compile the artifact once at build time so the container does not compile on
# every start. `objectstack start` picks up ./dist/objectstack.json itself.
RUN pnpm build

# `objectstack start` sets NODE_ENV=production when unset, which is what keeps
# the demo seed — its 809 fictional rows AND its 7 published-password logins —
# out of the database (src/data/demo-seed-gate.ts). The Console is served at
# /_console/. Persistent state (the sqlite database by default, the persisted
# crypto key) lives under /srv/app/.objectstack: mount a volume there.
ENV NODE_ENV=production \
    PORT=8080 \
    OS_LOG_LEVEL=info
EXPOSE 8080

RUN chown -R node:node /srv/app
USER node

# Liveness: /api/v1/health. For orchestrated readiness use /api/v1/ready.
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||8080)+'/api/v1/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# OS_AUTH_SECRET, OS_SECRET_KEY and OS_DATABASE_URL are injected at runtime —
# never bake them into the image.
CMD ["pnpm", "start"]
