/**
 * The app-owned RLS membership resolver — how `current_user.employer_org_ids`
 * reaches the employer-side row-level policies (DESIGN.md §03).
 *
 * ## Why the app owns a resolver instead of reading `accessible_org_ids`
 *
 * Every employer-side policy needs one fact: the organizations the caller is
 * a member of. The kernel computes exactly that set for every request —
 * `accessible_org_ids` (ADR-0105 D2), resolved from `sys_member` — and the
 * transport puts it on the execution context. It never reaches the RLS
 * compiler: `RLSUserContext` is assembled from `id`, `organization_id`,
 * `positions`, `org_user_ids`, `email` plus the membership bag, nothing else.
 * A policy written on `current_user.accessible_org_ids` therefore reads an
 * UNDEFINED variable, is dropped, and the request is filtered by
 * `RLS_DENY_FILTER` — zero rows, no error (objectstack#16518). Nor can the
 * app supply that name: it is in `RESERVED_RLS_MEMBERSHIP_KEYS`, and
 * plugin-security ignores a resolver that tries ("core-resolved, not an app
 * resolver", ADR-0105 D11).
 *
 * The reserved list blocks the NAME, not the capability. The resolver seam
 * (`IRlsMembershipResolver`) receives `accessible_org_ids` as an input — the
 * kernel hands it over on every call — so this module republishes the same
 * set under a key of its own, `employer_org_ids`, which the compiler merges
 * into the variable bag. Nothing is invented and no grant widens: the set is
 * the one the kernel already resolved, and a caller with no membership gets
 * the EMPTY set, which the policies fail closed on (`$in: []` → zero rows).
 *
 * ## Why a kernel plugin, not `onEnable`
 *
 * plugin-security reads the resolver ONCE, in its own `start()`, and caches
 * it. `onEnable` is invoked from AppPlugin's `start()`, and the CLI composes
 * the security plugin ahead of the app, so a service registered from
 * `onEnable` lands after that read: registered, never seen, every policy
 * still denied (measured on @objectstack/cli 17.3.0, see #18). The kernel
 * runs every plugin's `init()` before any `start()`, so a plugin that
 * registers in `init()` is early enough whatever slot the CLI gives it. That
 * is the only Phase-1 seam an app package owns; `plugins:` on the stack is
 * where it is declared.
 */

import {
  RLS_MEMBERSHIP_RESOLVER_SERVICE,
  type IRlsMembershipResolver,
  type Plugin,
  type RlsMembershipContext,
} from '@objectstack/spec/contracts';

/** The `current_user.*` key the employer-side policies read (DESIGN.md §03). */
export const EMPLOYER_ORG_IDS_KEY = 'employer_org_ids';

/**
 * Republishes the kernel-resolved `accessible_org_ids` as
 * `current_user.employer_org_ids`. Pure: no I/O, no throw for an ordinary
 * miss (the contract treats a throw as "resolved nothing", fail closed).
 */
export const AtsRlsMembershipResolver: IRlsMembershipResolver = {
  keys: [EMPLOYER_ORG_IDS_KEY],
  async resolve(context: RlsMembershipContext): Promise<Record<string, string[]>> {
    // Anonymous request: nothing to resolve; the contract asks for `{}`.
    if (!context?.userId) return {};
    const ids = Array.isArray(context.accessible_org_ids)
      ? context.accessible_org_ids.filter((v): v is string => typeof v === 'string' && v.length > 0)
      : [];
    return { [EMPLOYER_ORG_IDS_KEY]: ids };
  },
};

/** The slice of the kernel `PluginContext` the plugin below touches. */
interface ResolverHostContext {
  registerService: (name: string, service: unknown) => void;
  logger?: { info?: (...a: unknown[]) => void; error?: (...a: unknown[]) => void };
}

/**
 * Registers {@link AtsRlsMembershipResolver} under `rls-membership-resolver`
 * during Phase 1 (`init`), before plugin-security's `start()` looks it up.
 * Declared in `objectstack.config.ts` → `plugins`.
 */
export const AtsRlsMembershipResolverPlugin = {
  name: 'ats.rls-membership-resolver',
  version: '0.1.0',
  type: 'standard',
  providesServices: [RLS_MEMBERSHIP_RESOLVER_SERVICE],
  init(ctx: ResolverHostContext): void {
    try {
      ctx.registerService(RLS_MEMBERSHIP_RESOLVER_SERVICE, AtsRlsMembershipResolver);
    } catch (err) {
      // Another resolver already holds the slot. Fail the boot loudly rather
      // than run with employer policies that would silently deny every row.
      ctx.logger?.error?.(
        `[ats] cannot register the rls-membership-resolver — the employer-side policies key on current_user.${EMPLOYER_ORG_IDS_KEY} and would fail closed`,
        { error: err instanceof Error ? err.message : String(err) },
      );
      throw err;
    }
    ctx.logger?.info?.('[ats] rls-membership-resolver registered', { keys: AtsRlsMembershipResolver.keys });
  },
} satisfies Plugin;
