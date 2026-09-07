import { defineStack } from '@objectstack/spec';
import * as objects from './src/objects/index.js';
import { data } from './src/data/index.js';
import { allHooks } from './src/hooks/index.js';
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
  // `automation` is added in M3 when the approval flows land.
  requires: ['ui'],

  objects: Object.values(objects),

  // Data — the demo seed; `OS_SEED_LOCALE` selects demo-en (default) or demo-zh.
  data,

  // Logic — the stamps that make row-level scoping resolvable (see stamp.hook.ts).
  hooks: allHooks,

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
});

/**
 * Declaring a position and a permission set grants nobody anything until a
 * `sys_position_permission_set` row joins them, and that row cannot be a seed
 * (the seed loader runs before the security bootstrap creates the rows it
 * would reference). Bind them on `kernel:bootstrapped` instead.
 */
export const onEnable = async (ctx: unknown): Promise<void> => {
  registerAtsPositionBindings(ctx as Parameters<typeof registerAtsPositionBindings>[0]);
};
