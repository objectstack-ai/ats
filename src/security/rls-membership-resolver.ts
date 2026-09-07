/**
 * The app-owned RLS membership resolver — how `current_user.employer_org_ids`
 * and `current_user.applicant_candidate_ids` reach the employer-side
 * row-level policies (DESIGN.md §03).
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
 * ## The applicant set — a subquery the compiler cannot run, pre-resolved here
 *
 * The candidate pool (#13) needs a second fact: WHICH candidates have applied
 * to one of the caller's employers. That is a subquery over `ats_application`,
 * and the RLS grammar is deliberately subquery-free (ADR-0055/0056): the
 * contract's own answer is that "set-membership that would otherwise need a
 * subquery is PRE-RESOLVED by the runtime into `ExecutionContext.rlsMembership`
 * under a stable key" — this seam exists for "app-shaped sets: the accounts in
 * a rep's territories, the records a case team can touch". So this resolver
 * reads `ats_application.candidate` for every row whose `employer_org` is in
 * the caller's set and publishes the distinct ids as `applicant_candidate_ids`;
 * the policy is `record.id in current_user.applicant_candidate_ids`, a scalar
 * `IN` list that every driver evaluates identically.
 *
 * Why not a carrier on the candidate row instead: a single stamped scalar
 * cannot hold several employers, and a multi-value one cannot be queried —
 * `record.<array> in current_user.<set>` lowers to `{ field: { $in } }` with no
 * knowledge that the field is an array; the memory driver then matches on
 * overlap while the SQL driver REFUSES `$in` on a JSON column (HTTP 400 on
 * every employer read, driver-sql #7398). Measured on both drivers in #13. A
 * junction object would not help either: the candidate ROW itself has to be
 * readable (list, direct GET, lookup all pass through the same policy), and no
 * predicate on `ats_candidate` can reference a junction.
 *
 * The set is derived live — an application filed now exposes the candidate on
 * the next request, a deleted one withdraws it — with no stamp hook and so no
 * column for `claimSeedOwnership`'s predicate update to corrupt (#43). It is
 * stage-agnostic: "applied to" means an application row exists, whatever its
 * stage. Cost: one indexed read of `ats_application` per request by a caller
 * with at least one employer membership (seekers and platform staff skip it),
 * bounded by {@link APPLICANT_SET_LIMIT} in the fail-closed direction.
 *
 * ## Fail-closed by construction
 *
 * The two keys fail independently. The application read runs inside its own
 * guard: if the engine is not reachable or the read throws, only
 * `applicant_candidate_ids` is omitted — its policy drops out and the employer
 * keeps the discoverable pool — while `employer_org_ids` is still returned. A
 * resolver that threw as a whole would take every employer policy down with
 * it (the contract treats a throw as "resolved nothing").
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
 * where it is declared. The ObjectQL engine is NOT available at `init()`, so
 * the plugin keeps the kernel context and the resolver asks it for the engine
 * lazily, on the first request — the same `ctx.getService('objectql')` the
 * security plugin itself uses.
 */

import {
  RLS_MEMBERSHIP_RESOLVER_SERVICE,
  type IRlsMembershipResolver,
  type Plugin,
  type RlsMembershipContext,
} from '@objectstack/spec/contracts';

/** The `current_user.*` key the employer-side policies read (DESIGN.md §03). */
export const EMPLOYER_ORG_IDS_KEY = 'employer_org_ids';

/** The `current_user.*` key the candidate applicant policies read (DESIGN.md §03, #13). */
export const APPLICANT_CANDIDATE_IDS_KEY = 'applicant_candidate_ids';

/**
 * Upper bound on application rows read per request. Fail-closed: an employer
 * with more applications than this sees a TRUNCATED applicant set, never a
 * wider one. Raise it together with an index on `ats_application.employer_org`.
 */
export const APPLICANT_SET_LIMIT = 5000;

/** Row shape the applicant read returns. */
type Row = Record<string, unknown>;

/** The slice of the ObjectQL engine the applicant read touches. */
interface ApplicationReader {
  find(object: string, query: Record<string, unknown>): Promise<unknown>;
}

/** The slice of the kernel `PluginContext` the plugin below touches. */
interface ResolverHostContext {
  registerService: (name: string, service: unknown) => void;
  getService?: (name: string) => unknown;
  logger?: { info?: (...a: unknown[]) => void; warn?: (...a: unknown[]) => void; error?: (...a: unknown[]) => void };
}

/** System context for the applicant read — the spelling plugin-sharing uses for its own grant reads. */
const SYSTEM_CTX = { isSystem: true, positions: [] as string[], permissions: [] as string[] };

/** Set by the plugin's `init()`; read lazily on the first `resolve()`. */
let host: ResolverHostContext | undefined;
/** Warn once, not once per request, when the applicant half cannot resolve. */
let warnedApplicantHalf = false;

function engine(): ApplicationReader | undefined {
  try {
    const svc = host?.getService?.('objectql') as Partial<ApplicationReader> | undefined;
    return svc && typeof svc.find === 'function' ? (svc as ApplicationReader) : undefined;
  } catch {
    return undefined;
  }
}

function warnApplicantHalfOnce(detail: string): void {
  if (warnedApplicantHalf) return;
  warnedApplicantHalf = true;
  host?.logger?.warn?.(
    `[ats] ${APPLICANT_CANDIDATE_IDS_KEY} could not be resolved — the applicant half of the candidate pool fails closed (employers keep the discoverable pool only): ${detail}`,
  );
}

/**
 * Distinct `ats_application.candidate` ids across the caller's employer
 * organizations. `undefined` = could not resolve (key omitted, fail closed);
 * `[]` = resolved and empty (the policy drops out the same way).
 */
async function resolveApplicantCandidateIds(orgIds: string[]): Promise<string[] | undefined> {
  if (orgIds.length === 0) return [];
  const ql = engine();
  if (!ql) {
    warnApplicantHalfOnce("the 'objectql' service is not reachable from the resolver");
    return undefined;
  }
  const result = await ql.find('ats_application', {
    where: { employer_org: { $in: orgIds } },
    fields: ['candidate'],
    limit: APPLICANT_SET_LIMIT,
    context: { ...SYSTEM_CTX },
  });
  const rows: unknown[] = Array.isArray(result)
    ? result
    : Array.isArray((result as Row | null)?.records) ? ((result as Row).records as unknown[]) : [];
  const ids = new Set<string>();
  for (const row of rows) {
    const candidate = (row as Row | null)?.candidate;
    if (typeof candidate === 'string' && candidate !== '') ids.add(candidate);
  }
  return [...ids];
}

/**
 * Republishes the kernel-resolved `accessible_org_ids` as
 * `current_user.employer_org_ids`, and pre-resolves
 * `current_user.applicant_candidate_ids` from `ats_application`. Never throws
 * for an ordinary miss (the contract treats a throw as "resolved nothing",
 * fail closed); the applicant read fails on its own, never taking the
 * employer set with it.
 */
export const AtsRlsMembershipResolver: IRlsMembershipResolver = {
  keys: [EMPLOYER_ORG_IDS_KEY, APPLICANT_CANDIDATE_IDS_KEY],
  async resolve(context: RlsMembershipContext): Promise<Record<string, string[]>> {
    // Anonymous request: nothing to resolve; the contract asks for `{}`.
    if (!context?.userId) return {};
    const orgIds = Array.isArray(context.accessible_org_ids)
      ? context.accessible_org_ids.filter((v): v is string => typeof v === 'string' && v.length > 0)
      : [];
    const resolved: Record<string, string[]> = { [EMPLOYER_ORG_IDS_KEY]: orgIds };
    try {
      const applicants = await resolveApplicantCandidateIds(orgIds);
      if (applicants !== undefined) resolved[APPLICANT_CANDIDATE_IDS_KEY] = applicants;
    } catch (err) {
      warnApplicantHalfOnce(err instanceof Error ? err.message : String(err));
    }
    return resolved;
  },
};

/**
 * Registers {@link AtsRlsMembershipResolver} under `rls-membership-resolver`
 * during Phase 1 (`init`), before plugin-security's `start()` looks it up,
 * and keeps the kernel context so the resolver can reach the ObjectQL engine
 * once it exists. Declared in `objectstack.config.ts` → `plugins`.
 */
export const AtsRlsMembershipResolverPlugin = {
  name: 'ats.rls-membership-resolver',
  version: '0.2.0',
  type: 'standard',
  providesServices: [RLS_MEMBERSHIP_RESOLVER_SERVICE],
  init(ctx: ResolverHostContext): void {
    host = ctx;
    try {
      ctx.registerService(RLS_MEMBERSHIP_RESOLVER_SERVICE, AtsRlsMembershipResolver);
    } catch (err) {
      // Another resolver already holds the slot. Fail the boot loudly rather
      // than run with employer policies that would silently deny every row.
      ctx.logger?.error?.(
        `[ats] cannot register the rls-membership-resolver — the employer-side policies key on current_user.${EMPLOYER_ORG_IDS_KEY} / current_user.${APPLICANT_CANDIDATE_IDS_KEY} and would fail closed`,
        { error: err instanceof Error ? err.message : String(err) },
      );
      throw err;
    }
    ctx.logger?.info?.('[ats] rls-membership-resolver registered', { keys: AtsRlsMembershipResolver.keys });
  },
} satisfies Plugin;
