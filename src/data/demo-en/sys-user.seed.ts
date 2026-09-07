import { defineSeed } from '@objectstack/spec/data';
import { SysUser } from '../shared/sys-objects.js';
import { buildUsers } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-en · directory rows for employer staff, two platform staff and every candidate; no credentials are created. */
export const SysUserSeed = defineSeed(SysUser, {
  externalId: 'email',
  mode: 'upsert',
  records: buildUsers(pack),
});
