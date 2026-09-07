import { defineView } from '@objectstack/spec';
import type { ListColumn } from '@objectstack/spec/ui';

/**
 * Dictionary grid over `ats_credential_type` (card 08). Same shape as the
 * skill dictionary: a `public_read` vocabulary platform staff maintain; the
 * platform group's "Credential Types" entry is bare and lands here.
 */

const data = { provider: 'object' as const, object: 'ats_credential_type' };

const columns = [
  { field: 'name', link: true },
  { field: 'issuer' },
  { field: 'has_levels' },
  { field: 'validity_months' },
  { field: 'description' },
] satisfies ListColumn[];

export const CredentialTypeViews = defineView({
  name: 'ats_credential_type',
  label: 'Credential Types',
  object: 'ats_credential_type',

  list: {
    name: 'all',
    label: 'All Credential Types',
    type: 'grid',
    data,
    columns,
    sort: [{ field: 'name', order: 'asc' }],
    exportOptions: { formats: ['csv', 'xlsx'] },
  },
});
