/**
 * The app-owned declaration of the auth membership policy — how this
 * deployment states, at author time, that signing in or being seeded does NOT
 * bind you to an organization (DESIGN.md §03).
 *
 * ## What goes wrong without it
 *
 * `AuthManager.getMembershipPolicy()` is `this.config.membershipPolicy ?? 'auto'`,
 * and under `auto` two paths bind:
 *
 *  - sign-up — the reconciler composed into better-auth's `user.create.after`;
 *  - the ADR-0093 D6 backfill — a pass over every pre-existing member-less
 *    user, run from AuthPlugin's `kernel:ready` AND `app:seeded` hooks.
 *
 * Measured on this repo at `e759ba5` with the demo seed, before this plugin
 * existed:
 *
 *   [auth] membership backfill (app:seeded) bound 82 member-less user(s) to
 *   the default organization (ADR-0093 D6) {"scanned":113,"bound":82,"skipped":31}
 *
 * The 82 are the 80 job seekers and the 2 platform staff — exactly the people
 * the seed leaves member-less on purpose. DESIGN.md §03 rules that out in as
 * many words: 「`membershipPolicy` 必须是 **`invite-only`**（不自动绑组织）」,
 * because an organization is this platform's isolation boundary and a shared
 * one is a shared identity. It is not cosmetic: the employer-side policies key
 * on membership through `current_user.employer_org_ids`
 * (see rls-membership-resolver.ts), so every member-less seeker carrying the
 * default organization is a seeker inside a tenant.
 *
 * ## Why a kernel plugin, and why `init()`
 *
 * The policy is an auth-plugin setting (ADR-0093 D1), not a `defineStack()`
 * key, and it is read LIVE through `getMembershipPolicy()` — never off a
 * captured constructor option. `AuthManager.applyConfigPatch()` is the public
 * seam that targets exactly the config that accessor reads, and the manager is
 * registered as the `auth` service inside `AuthPlugin.init()`.
 *
 * Kernel phases are: every plugin's `init()`, then every `start()`, then
 * `trigger('kernel:ready')`. Patching in `init()` therefore lands before the
 * backfill under any composition order, and `optionalDependencies` below makes
 * "AuthPlugin initializes first" a declared contract (ADR-0116) rather than an
 * accident of the CLI's registration order. `start()` is the fallback for a
 * composition that inits us first anyway: still a whole phase before
 * `kernel:ready`.
 *
 * ## Routes deliberately not taken
 *
 *  - Constructing `AuthPlugin` in `objectstack.config.ts`: the CLI stands down
 *    entirely when the app supplies one (`serve.ts`, `hasAuthPlugin`), so the
 *    app would inherit the secret, base URL, trusted origins, social providers,
 *    the admin plugin and the cookie domain — six ways to break the demo to
 *    move one flag.
 *  - Seeding a `sys_setting` row: that object is `managedBy: 'engine-owned'`.
 *  - `OS_SKIP_MEMBERSHIP_BACKFILL=1`: it silences the backfill only. Sign-up
 *    keeps auto-binding, so the deviation survives with its evidence removed.
 *
 * ## Who wins if the deployment says otherwise
 *
 * The operator does, and deliberately. AuthPlugin binds the `auth` settings
 * namespace at `kernel:ready` — after this patch — but applies a value only
 * when it is EXPLICIT (a stored `auth.membership_policy` row or
 * `OS_AUTH_MEMBERSHIP_POLICY`); a manifest default is a UI default and is not
 * applied. So the precedence is: explicit deployment setting > this
 * declaration > the platform default `auto`. That is the right order — this
 * file is the app's default posture, not a lock, and an operator who sets the
 * platform setting has said something more specific than the app can.
 *
 * ## This route is unpinned upstream
 *
 * Nothing in the framework — no app, example, template or test — declares this
 * policy at author time today, so no upstream test fails if `applyConfigPatch`
 * or the service name moves. The verification below is this app's own pin: the
 * policy is read back through the same accessor the backfill reads, and a
 * patch that did not take fails the boot instead of booting into `auto`.
 */

import type { Plugin } from '@objectstack/spec/contracts';

/** DESIGN.md §03: seekers belong to no organization. One of `['auto', 'invite-only']`. */
export const ATS_MEMBERSHIP_POLICY = 'invite-only';

/** The service name `AuthPlugin.init()` registers its `AuthManager` under. */
const AUTH_SERVICE = 'auth';

/** The plugin whose `init()` provides it — an order-if-present edge, not a hard dependency. */
const AUTH_PLUGIN_NAME = 'com.objectstack.auth';

/**
 * The slice of `AuthManager` this file touches. Declared structurally rather
 * than imported: `@objectstack/plugin-auth` is not a dependency of this app
 * (the CLI composes it), and taking one on to read two method signatures would
 * pin a package the app otherwise never names.
 */
interface AuthManagerLike {
  applyConfigPatch(patch: { membershipPolicy: string }): void;
  getMembershipPolicy(): string;
}

/** The slice of the kernel `PluginContext` this plugin touches. */
interface PolicyHostContext {
  getService?: (name: string) => unknown;
  logger?: { info?: (...a: unknown[]) => void; warn?: (...a: unknown[]) => void; error?: (...a: unknown[]) => void };
}

/** Set once the patch has been applied and read back, so `start()` knows to stand down. */
let applied = false;

function authManager(ctx: PolicyHostContext): AuthManagerLike | undefined {
  let svc: unknown;
  try {
    svc = ctx.getService?.(AUTH_SERVICE);
  } catch {
    return undefined; // not registered yet — the caller decides whether that is fatal
  }
  if (!svc) return undefined;
  const candidate = svc as Partial<AuthManagerLike>;
  if (typeof candidate.applyConfigPatch !== 'function' || typeof candidate.getMembershipPolicy !== 'function') {
    // The service exists but is not the shape this seam needs. Never silently
    // continue: the deployment would boot on `auto` and bulk-bind.
    throw new Error(
      `[ats] the '${AUTH_SERVICE}' service does not expose applyConfigPatch()/getMembershipPolicy() — ` +
        `this app cannot declare membershipPolicy='${ATS_MEMBERSHIP_POLICY}' (DESIGN.md §03) and would boot on the ` +
        `platform default 'auto', which binds every member-less user to the default organization.`,
    );
  }
  return candidate as AuthManagerLike;
}

/**
 * Patch and verify. Returns `false` when the `auth` service is not registered
 * yet — the only recoverable miss, and the reason `start()` retries.
 */
function declarePolicy(ctx: PolicyHostContext, phase: 'init' | 'start'): boolean {
  const manager = authManager(ctx);
  if (!manager) return false;

  const before = manager.getMembershipPolicy();
  if (before !== ATS_MEMBERSHIP_POLICY) manager.applyConfigPatch({ membershipPolicy: ATS_MEMBERSHIP_POLICY });
  const after = manager.getMembershipPolicy();

  if (after !== ATS_MEMBERSHIP_POLICY) {
    // The seam moved. Fail the boot rather than leave the log line as the only
    // notice — an `auto` boot binds in BULK and the rows outlive the process.
    throw new Error(
      `[ats] membership policy is still '${after}' after applyConfigPatch({ membershipPolicy: '${ATS_MEMBERSHIP_POLICY}' }) ` +
        `— DESIGN.md §03 requires '${ATS_MEMBERSHIP_POLICY}'. Refusing to boot: on '${before}' the ADR-0093 D6 backfill ` +
        `binds every member-less user (80 seekers and 2 platform staff on the demo seed) to the default organization.`,
    );
  }

  applied = true;
  ctx.logger?.info?.(
    `[ats] auth membership policy declared '${ATS_MEMBERSHIP_POLICY}' (was '${before}') in ${phase}() — DESIGN.md §03: ` +
      'sign-up and the ADR-0093 D6 backfill bind nobody to the default organization. An explicit ' +
      'auth.membership_policy setting or OS_AUTH_MEMBERSHIP_POLICY still overrides this at kernel:ready.',
  );
  return true;
}

/**
 * Declares {@link ATS_MEMBERSHIP_POLICY} on the live `AuthManager` in Phase 1,
 * before the ADR-0093 D6 backfill runs at `kernel:ready` / `app:seeded`.
 * Declared in `objectstack.config.ts` → `plugins`.
 */
export const AtsAuthMembershipPolicyPlugin = {
  name: 'ats.auth-membership-policy',
  version: '0.1.0',
  type: 'standard',
  // Order-if-present: hoists AuthPlugin ahead of this one when it is composed
  // (it always is, under the CLI), and is skipped when it is not. Not
  // `requiresServices: ['auth']`, which would refuse to boot a kernel that
  // composes no auth at all — a kernel that also runs no backfill.
  optionalDependencies: [AUTH_PLUGIN_NAME],
  init(ctx: PolicyHostContext): void {
    declarePolicy(ctx, 'init');
  },
  start(ctx: PolicyHostContext): void {
    if (applied) return;
    if (declarePolicy(ctx, 'start')) return;
    // No `auth` service after every plugin has initialized: AuthPlugin is not
    // composed at all, so there is no reconciler and no backfill to govern —
    // nothing to enforce, and nothing that can bind. Loud anyway, because the
    // alternative reading (the seam moved) looks identical from here.
    ctx.logger?.error?.(
      `[ats] no '${AUTH_SERVICE}' service was registered, so membershipPolicy='${ATS_MEMBERSHIP_POLICY}' (DESIGN.md §03) ` +
        'could NOT be declared. Nothing binds either — AuthPlugin owns both the sign-up reconciler and the ADR-0093 D6 ' +
        'backfill — so this boot is consistent, but if sign-in works here the declaration has silently stopped applying.',
    );
  },
} satisfies Plugin;
