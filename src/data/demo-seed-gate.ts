/**
 * The demo-seed gate — what keeps the fictional rows under `src/data/`, and
 * the seven working logins among them, out of a production database (#42).
 *
 * ## The control is the platform's own `Seed.env`, judged at boot
 *
 * Every demo seed is scoped `env: ['dev', 'test']` ({@link scopeToDemo}).
 * The seed loader (`SeedLoaderService.filterByEnv`,
 * `@objectstack/metadata-protocol`) resolves the boot's seed environment
 * from `NODE_ENV` — `production`/`prod` → `prod`, `development`/`dev` →
 * `dev`, `test` → `test` — drops every dataset whose `env` does not list it,
 * and logs `[SeedLoader] Environment 'prod': skipped N dataset(s) …` at info.
 * Both first-party boot paths pin `NODE_ENV` before anything is imported:
 * `objectstack dev` (→ `serve --dev`) sets `development` when unset;
 * `objectstack serve` and `objectstack start` set `production` when unset
 * ("an operator who never exported NODE_ENV is booting a real deployment",
 * cli `serve.ts`). A forgotten `NODE_ENV` is therefore the SAFE case under
 * the CLI, and the gate needs no flag of its own: `objectstack dev` seeds,
 * `objectstack start` does not, and `NODE_ENV=development objectstack start`
 * (documented by the CLI) is the deliberate override.
 *
 * ## Why not the config-level gate the issue sketched
 *
 * `data = flag ? seeds : []` in `src/data/index.ts` is evaluated TWICE — by
 * `objectstack build`/`compile` into `dist/objectstack.json`, and again by
 * `serve`'s bundle-require of `objectstack.config.ts` at boot — and neither
 * `os dev` nor `os build` sets `NODE_ENV` for the compile step (`dev.ts`
 * explains why it must not: it would activate oclif's tsx source loader in
 * the child). A gate read there answers to the shell's environment at
 * whichever evaluation wins, not to the boot's mode. `Seed.env` is data,
 * identical in both evaluations, judged once by the loader.
 *
 * Residual: an EMBEDDED host (`new Runtime()` + `AppPlugin`, no CLI) that
 * leaves `NODE_ENV` unset makes the loader fail OPEN — every dataset loads
 * and the loader warns, naming them. That is the platform's deliberate
 * trade (fail-closed would drop `env: ['prod']` reference data on a host
 * that merely forgot `NODE_ENV`); the plugin below warns for it too.
 *
 * ## Why an app-owned boot line on top of the loader's
 *
 * The CLI's default `--log-level` is `warn`: the boot-quiet window replays
 * warnings under the startup banner and swallows info. The loader's skip
 * line is info by design (a skipped dataset is the intended outcome), so on
 * a default `objectstack start` the demo would vanish silently — and in this
 * codebase zero rows is also exactly what a fail-closed RLS policy looks
 * like. One warn line naming the toggle turns that ambiguity into a one-line
 * answer. It is warn, not info, because it is the only level that surfaces
 * on a default boot; and it is one line per boot, not one per dataset.
 *
 * The `NODE_ENV` → seed-environment table below mirrors the loader's
 * (`NODE_ENV_TO_SEED_ENV`, not exported). Keep the five entries identical.
 */

import type { Plugin } from '@objectstack/spec/contracts';
import type { Seed } from '@objectstack/spec/data';

/** One of the three seed environments `Seed.env` enumerates. */
export type SeedEnv = NonNullable<Seed['env']>[number];

/** Where the demo seed loads. `prod` is deliberately absent — that is the gate. */
export const DEMO_SEED_ENVS: readonly SeedEnv[] = ['dev', 'test'];

/** Scope a seed set to {@link DEMO_SEED_ENVS}. Applied to the whole demo set so no future seed can forget it. */
export function scopeToDemo(seeds: readonly Seed[]): Seed[] {
  return seeds.map((seed) => ({ ...seed, env: [...DEMO_SEED_ENVS] }));
}

const NODE_ENV_TO_SEED_ENV: Readonly<Record<string, SeedEnv>> = {
  production: 'prod',
  prod: 'prod',
  development: 'dev',
  dev: 'dev',
  test: 'test',
};

/** The seed environment the loader will filter on for this `NODE_ENV`; `undefined` when it cannot tell (it then fails open). */
export function resolveSeedEnv(nodeEnv: string | undefined): SeedEnv | undefined {
  if (typeof nodeEnv !== 'string') return undefined;
  return NODE_ENV_TO_SEED_ENV[nodeEnv.trim().toLowerCase()];
}

export interface DemoSeedGateNotice {
  level: 'info' | 'warn';
  message: string;
  detail: Record<string, unknown>;
}

/** The credential rows in a seed set — the part of the demo that is an incident, not a mess, if it reaches production. */
function countLogins(seeds: readonly Seed[]): number {
  return seeds.filter((s) => s.object === 'sys_account').reduce((n, s) => n + s.records.length, 0);
}

/** The one boot line for a given `NODE_ENV`. Pure, so the three states can be read side by side. */
export function describeDemoSeedGate(nodeEnv: string | undefined, seeds: readonly Seed[]): DemoSeedGateNotice {
  const env = resolveSeedEnv(nodeEnv);
  const datasets = seeds.length;
  const rows = seeds.reduce((n, s) => n + s.records.length, 0);
  const logins = countLogins(seeds);
  const shape = `${datasets} datasets, ${rows} rows, ${logins} demo logins (README.md)`;
  const scope = DEMO_SEED_ENVS.join('/');
  const detail = { nodeEnv: nodeEnv ?? null, seedEnv: env ?? null, demoScope: [...DEMO_SEED_ENVS], datasets, rows, logins };

  if (env === undefined) {
    return {
      level: 'warn',
      message:
        `[ats] demo seed environment is INDETERMINATE: NODE_ENV is unset or names no seed environment ` +
        `(got ${JSON.stringify(nodeEnv ?? null)}), so the seed loader fails open and loads the demo seed ` +
        `(${shape}) EVERYWHERE. Export NODE_ENV=production to skip it, or NODE_ENV=development to load it ` +
        `deliberately. Unreachable under objectstack dev/serve/start, which all pin NODE_ENV.`,
      detail,
    };
  }
  if (!DEMO_SEED_ENVS.includes(env)) {
    return {
      level: 'warn',
      message:
        `[ats] demo seed skipped: NODE_ENV=${nodeEnv} resolves to seed environment '${env}' and the demo seed ` +
        `(${shape}) is scoped to ${scope}. Zero ATS rows and no working demo login are the expected state of ` +
        `this boot, not a policy failure. To load the demo, boot with 'objectstack dev' (it sets ` +
        `NODE_ENV=development) or export NODE_ENV=development.`,
      detail,
    };
  }
  return {
    level: 'info',
    message:
      `[ats] demo seed enabled: NODE_ENV=${nodeEnv} resolves to seed environment '${env}' (demo scope ${scope}); ` +
      `loading ${shape}. Boot with 'objectstack start' or NODE_ENV=production to skip it.`,
    detail,
  };
}

/** The slice of the kernel `PluginContext` the plugin touches. */
interface GateHostContext {
  logger?: { info?: (...a: unknown[]) => void; warn?: (...a: unknown[]) => void };
}

/**
 * A kernel plugin whose only job is the boot line. `init()` (Phase 1) runs
 * before AppPlugin's `start()` seeds, and after `serve` has pinned
 * `NODE_ENV`, so the line announces exactly the policy the loader then
 * enforces; the loader's own `[SeedLoader] … skipped …` info line is the
 * measured confirmation. Declared under `plugins` in `objectstack.config.ts`
 * beside the RLS resolver, for the same Phase-1 reason it gives.
 */
export function createDemoSeedGatePlugin(seeds: readonly Seed[]) {
  return {
    name: 'ats.demo-seed-gate',
    version: '0.1.0',
    type: 'standard',
    init(ctx: GateHostContext): void {
      const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
      const notice = describeDemoSeedGate(env?.NODE_ENV, seeds);
      ctx.logger?.[notice.level]?.(notice.message, notice.detail);
    },
  } satisfies Plugin;
}
