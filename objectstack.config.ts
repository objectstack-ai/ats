import { defineStack } from '@objectstack/spec';
import * as objects from './src/objects/index.js';
import { data } from './src/data/index.js';
import * as views from './src/views/index.js';
import { allHooks } from './src/hooks/index.js';
import * as flows from './src/flows/index.js';
import { AtsApp } from './src/apps/index.js';
import {
  PlatformAdminPosition,
  PlatformOpsPosition,
  EmployerAdminPosition,
  EmployerRecruiterPosition,
  JobSeekerPosition,
  PlatformAdminSet,
  PlatformOpsSet,
  EmployerAdminSet,
  EmployerRecruiterSet,
  JobSeekerSet,
  GuestApplySet,
  registerAtsPositionBindings,
  AtsRlsMembershipResolverPlugin,
} from './src/security/index.js';

/**
 * ATS — an open-source recruiting marketplace on ObjectStack.
 *
 * Multi-employer job posting, candidate pipeline, interviews, offers and
 * platform governance, all as typed metadata. See DESIGN.md for the model.
 */
export default defineStack({
  manifest: {
    id: 'ats',
    namespace: 'ats',
    version: '0.1.0',
    type: 'app',
    name: 'ATS',
    description: 'Open-source recruiting marketplace — employers post, candidates apply, the platform governs.',
    // Protocol major this app is authored against. The runtime checks the
    // range at load time and refuses a major-incompatible runtime with a
    // structured diagnostic instead of failing deep in a schema parse.
    engines: { protocol: '^17' },
  },

  // `ui` serves the Console so the app can be browsed as soon as it boots.
  // The approval flows (F1–F3, src/flows/) need four tokens, not one:
  // `automation` is the flow engine; `triggers` arms their `record_change`
  // start nodes (defineStack refuses a triggered flow without it);
  // `approvals` contributes the `approval` node executor; `messaging` delivers
  // the `notify` nodes to the inbox (absent, notify reports success and
  // delivers nothing). All four providers ship with the CLI — no new package.
  requires: ['ui', 'automation', 'triggers', 'approvals', 'messaging'],

  objects: Object.values(objects),

  // Data — the demo seed; `OS_SEED_LOCALE` selects demo-en (default) or demo-zh.
  data,

  // UI — the views each app navigates to (card 07 employer, card 08 platform/seeker).
  views: Object.values(views),

  // Logic — the stamps that make row-level scoping resolvable (see stamp.hook.ts).
  hooks: allHooks,

  // Automation — the approval chains F1–F3 (DESIGN.md §05).
  flows: Object.values(flows),

  // The one app: three audience groups (Platform · Hiring · Job Seeker), each
  // gated by a capability the permission sets grant (DESIGN.md §04). An
  // 'app' package may define at most one app (ADR-0019 D3).
  apps: [AtsApp],

  // Security — capability containers plus the row- and field-level scopes.
  positions: [
    PlatformAdminPosition,
    PlatformOpsPosition,
    EmployerAdminPosition,
    EmployerRecruiterPosition,
    JobSeekerPosition,
  ],
  permissions: [
    PlatformAdminSet,
    PlatformOpsSet,
    EmployerAdminSet,
    EmployerRecruiterSet,
    JobSeekerSet,
    GuestApplySet,
  ],

  // Runtime — the app-owned RLS membership resolver that makes the employer
  // policies above resolvable (`current_user.employer_org_ids`, DESIGN.md §03).
  // A kernel plugin rather than an `onEnable` call on purpose: plugin-security
  // reads the resolver once in its `start()`, before the app's `onEnable`
  // runs, so only a plugin's `init()` (Phase 1) lands the service in time.
  // In-repo code, no new package (see rls-membership-resolver.ts).
  plugins: [AtsRlsMembershipResolverPlugin],
});

/**
 * Declaring a position and a permission set grants nobody anything until a
 * `sys_position_permission_set` row joins them, and that row cannot be a seed
 * (the seed loader runs before the security bootstrap creates the rows it
 * would reference). Bind them on `kernel:bootstrapped` instead.
 *
 * Not the place for the RLS membership resolver: `onEnable` runs inside
 * AppPlugin's `start()`, after plugin-security has already looked the resolver
 * up (measured on cli 17.3.0 — registered here, never seen). It is declared
 * under `plugins` above so it registers in Phase 1.
 */
export const onEnable = async (ctx: unknown): Promise<void> => {
  registerAtsPositionBindings(ctx as Parameters<typeof registerAtsPositionBindings>[0]);
};
