import { defineSeed } from '@objectstack/spec/data';
import { CandidateCredential } from '../../objects/candidate-credential.object.js';
import { buildCandidateCredentials } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-zh · 30 credentials, 5 of them expiring within 90 days of seed time. */
export const CandidateCredentialSeed = defineSeed(CandidateCredential, {
  externalId: 'certificate_no',
  mode: 'upsert',
  records: buildCandidateCredentials(pack),
});
