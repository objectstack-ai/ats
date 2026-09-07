import { defineSeed } from '@objectstack/spec/data';
import { Candidate } from '../../objects/candidate.object.js';
import { buildCandidates } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-zh · 80 candidates with graded experience and skills; `avatar` left empty by design. */
export const CandidateSeed = defineSeed(Candidate, {
  externalId: 'full_name',
  mode: 'upsert',
  records: buildCandidates(pack),
});
