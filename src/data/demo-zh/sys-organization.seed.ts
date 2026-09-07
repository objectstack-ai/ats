import { defineSeed } from '@objectstack/spec/data';
import { SysOrganization } from '../shared/sys-objects.js';
import { buildOrganizations } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-zh · one platform organization per employer — the row `employer_org` points at (DESIGN.md §03). */
export const SysOrganizationSeed = defineSeed(SysOrganization, {
  externalId: 'slug',
  mode: 'upsert',
  records: buildOrganizations(pack),
});
