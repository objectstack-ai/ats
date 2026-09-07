import { defineSeed } from '@objectstack/spec/data';
import { SysAccount } from '../shared/sys-objects.js';
import { buildAccounts } from '../shared/build.js';

/** demo-zh · local password logins for the platform owner and the six personas in shared/personas.ts; the other users stay directory rows. */
export const SysAccountSeed = defineSeed(SysAccount, {
  externalId: ['provider_id', 'account_id'],
  mode: 'upsert',
  records: buildAccounts(),
});
