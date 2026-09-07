import { defineSeed } from '@objectstack/spec/data';
import { SysUser } from '../shared/sys-objects.js';
import { buildUsers } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-en · the platform owner, employer staff, two platform staff and every candidate; credentials for the signable subset live in sys-account.seed.ts. */
export const SysUserSeed = defineSeed(SysUser, {
  externalId: 'email',
  mode: 'upsert',
  records: buildUsers(pack),
});
