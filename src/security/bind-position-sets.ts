/**
 * Position ↔ permission-set bindings.
 *
 * The permission model is record-authoritative (ADR-0090/0094): declaring a
 * position and declaring a set grants nobody anything until a
 * `sys_position_permission_set` row joins them. Without this file every
 * persona silently degrades to the `everyone` baseline — which reads as
 * "permissions are broken" rather than "a binding is missing".
 *
 * This cannot be a declarative seed: the seed loader runs before the security
 * bootstrap creates the `sys_position` / `sys_permission_set` rows, so the name
 * references would not resolve. We play the admin's part imperatively on
 * `kernel:bootstrapped` — the anchor that fires only after every
 * `kernel:ready` handler, the security bootstrap included, has settled.
 *
 * No set is marked `isDefault`: that auto-binds to the `everyone` anchor and
 * would hand every signed-in user the set, employer rows included.
 */

const BINDINGS: ReadonlyArray<readonly [position: string, permissionSet: string]> = [
  ['platform_admin',     'ats_platform_admin'],
  ['platform_ops',       'ats_platform_ops'],
  ['employer_admin',     'ats_employer_admin'],
  ['employer_recruiter', 'ats_employer_recruiter'],
  ['job_seeker',         'ats_job_seeker'],
];

const SYS = { isSystem: true } as const;

interface BindHostContext {
  ql: {
    find: (object: string, query: unknown, options?: unknown) => Promise<unknown>;
    insert: (object: string, data: Record<string, unknown>, options?: unknown) => Promise<unknown>;
  };
  logger?: { info?: (...a: unknown[]) => void; warn?: (...a: unknown[]) => void };
  hook?: (event: string, handler: () => Promise<void> | void) => void;
}

/** Find one row by `name`, passing the system context the engine's read path expects. */
async function findOneByName(ctx: BindHostContext, object: string, name: string): Promise<{ id?: string } | undefined> {
  try {
    const rows = (await ctx.ql.find(object, { where: { name }, limit: 1, context: SYS })) as
      | Array<{ id?: string }>
      | { records?: Array<{ id?: string }> };
    if (Array.isArray(rows)) return rows[0];
    return rows?.records?.[0];
  } catch (err) {
    ctx.logger?.warn?.('[ats] position binding lookup failed', {
      object, name, error: err instanceof Error ? err.message : String(err),
    });
    return undefined;
  }
}

export function registerAtsPositionBindings(ctx: BindHostContext): void {
  const run = async (): Promise<void> => {
    let created = 0;
    for (const [positionName, setName] of BINDINGS) {
      const position = await findOneByName(ctx, 'sys_position', positionName);
      const set = await findOneByName(ctx, 'sys_permission_set', setName);
      if (!position?.id || !set?.id) {
        ctx.logger?.warn?.('[ats] position binding skipped (row missing)', { position: positionName, set: setName });
        continue;
      }
      const existing = (await ctx.ql.find(
        'sys_position_permission_set',
        { where: { position_id: position.id, permission_set_id: set.id }, limit: 1, context: SYS },
      )) as unknown;
      const hit = Array.isArray(existing) ? existing[0] : (existing as { records?: unknown[] })?.records?.[0];
      if (hit) continue;
      try {
        await ctx.ql.insert(
          'sys_position_permission_set',
          { id: `ppsb_ats_${positionName}`, position_id: position.id, permission_set_id: set.id },
          { context: SYS },
        );
        created += 1;
      } catch (err) {
        ctx.logger?.warn?.('[ats] position binding insert failed', {
          position: positionName, set: setName, error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    ctx.logger?.info?.('[ats] position bindings ensured', { created, total: BINDINGS.length });
  };

  if (typeof ctx.hook === 'function') {
    ctx.hook('kernel:bootstrapped', run);
  } else {
    void Promise.resolve().then(run);
  }
}
