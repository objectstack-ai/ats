import { defineSeed } from '@objectstack/spec/data';
import { SysMember } from '../shared/sys-objects.js';
import { buildMemberships } from '../shared/build.js';

/** demo-zh · employer staff memberships — what `current_user.accessible_org_ids` is derived from. */
export const SysMemberSeed = defineSeed(SysMember, {
  externalId: ['organization_id', 'user_id'],
  mode: 'upsert',
  records: buildMemberships(),
});
