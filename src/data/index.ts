import type { Seed } from '@objectstack/spec/data';
import { seeds as demoEn } from './demo-en/index.js';
import { seeds as demoZh } from './demo-zh/index.js';
import { createDemoSeedGatePlugin, scopeToDemo } from './demo-seed-gate.js';

/**
 * Demo seed selection.
 *
 * Two seed sets, one schema (DESIGN.md §06): `demo-en` (default, cross-industry
 * English) and `demo-zh` (a row-for-row Chinese mirror). `OS_SEED_LOCALE`
 * picks the set when the stack is loaded — `pnpm dev` for English,
 * `OS_SEED_LOCALE=zh pnpm dev` for Chinese. The switch is read once at load;
 * it is not a runtime toggle.
 *
 * Both sets share identity keys (organization slugs, user e-mails), so they
 * upsert onto the same organizations and users, but the ATS rows are keyed by
 * their localized natural keys (titles, names). Switching locale against a
 * database that already carries the other set therefore ADDS a second set of
 * ATS rows rather than translating the first — switch on a fresh database
 * (`pnpm dev --fresh`).
 *
 * Read through `globalThis` rather than a bare `process`: this app does not
 * depend on Node typings, and the config must also evaluate where `process`
 * is absent.
 *
 * ## Demo only — never production (#42)
 *
 * Whichever set is selected is scoped `env: ['dev', 'test']` by
 * `scopeToDemo`, so the seed loader drops all of it — the 794 ATS/identity
 * rows AND the 7 `sys_account` logins whose passwords are in the README — on
 * any boot whose `NODE_ENV` resolves to production. `objectstack dev` sets
 * `NODE_ENV=development` and seeds; `objectstack start`/`serve` set
 * `NODE_ENV=production` when unset and skip, saying so on a warn line that
 * names the toggle. The rule, its evidence and its alternatives are in
 * `demo-seed-gate.ts`.
 */
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const requested = (env?.OS_SEED_LOCALE ?? 'en').trim().toLowerCase();

export const seedLocale: 'en' | 'zh' = requested.startsWith('zh') ? 'zh' : 'en';

export const data: Seed[] = scopeToDemo(seedLocale === 'zh' ? demoZh : demoEn);

/** Boot-time notice for the gate above; registered under `plugins` in `objectstack.config.ts`. */
export const AtsDemoSeedGatePlugin = createDemoSeedGatePlugin(data);

export { DEMO_SEED_ENVS } from './demo-seed-gate.js';
