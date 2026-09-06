import { defineStack } from '@objectstack/spec';
import * as objects from './src/objects/index.js';

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
});
