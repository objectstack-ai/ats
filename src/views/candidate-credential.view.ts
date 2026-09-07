import { defineView } from '@objectstack/spec';
import type { ListColumn } from '@objectstack/spec/ui';

/**
 * Seeker-side grid over `ats_candidate_credential` (card 08) — "My
 * Credentials". The object is a master-detail child of `ats_candidate`
 * (`controlled_by_parent`), so which rows a caller sees follows the
 * candidate they may see; the seeker's own-profile rule scopes it to their
 * own certificates, platform staff read every row. `display_name` is the
 * stored "<credential> · <level>" mirror the stamp hook maintains.
 */

const data = { provider: 'object' as const, object: 'ats_candidate_credential' };

const columns = [
  { field: 'display_name', link: true },
  { field: 'candidate' },
  { field: 'credential_type' },
  { field: 'level' },
  { field: 'issued_at' },
  { field: 'expires_at' },
  { field: 'verification_status' },
  { field: 'is_expiring' },
] satisfies ListColumn[];

export const CandidateCredentialViews = defineView({
  name: 'ats_candidate_credential',
  label: 'Candidate Credentials',
  object: 'ats_candidate_credential',

  list: {
    name: 'all',
    label: 'All Credentials',
    type: 'grid',
    data,
    columns,
    userFilters: { element: 'dropdown', fields: [{ field: 'verification_status' }] },
    sort: [{ field: 'expires_at', order: 'asc' }],
    exportOptions: { formats: ['csv', 'xlsx'] },
  },
});
