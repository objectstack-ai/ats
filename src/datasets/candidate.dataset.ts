import { defineDataset } from '@objectstack/spec/ui';

/**
 * The analytics face of `ats_candidate` (card 13). "Active" is the card's
 * definition, `seeking_status != 'not_looking'`, applied as a widget filter;
 * `$ne` does not match a null status, so a candidate who never chose one is
 * not counted as active either (every seeded candidate carries a status —
 * 70 active of 80).
 */
export const CandidateMetrics = defineDataset({
  name: 'ats_candidate_metrics',
  label: 'Candidate Metrics',
  description: 'Candidates by seeking status, education and profile visibility. Slice with a widget filter; one count measure.',
  object: 'ats_candidate',
  dimensions: [
    { name: 'seeking_status', field: 'seeking_status', type: 'string', label: 'Seeking Status' },
    { name: 'education', field: 'education', type: 'string', label: 'Education' },
    { name: 'profile_visibility', field: 'profile_visibility', type: 'string', label: 'Profile Visibility' },
  ],
  measures: [
    { name: 'candidate_count', aggregate: 'count', label: 'Candidates' },
  ],
});
