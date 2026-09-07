import { defineSeed } from '@objectstack/spec/data';
import { Interview } from '../../objects/interview.object.js';
import { buildInterviews } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-zh · 40 interviews scheduled over the next 14 days from seed time (dynamic CEL). */
export const InterviewSeed = defineSeed(Interview, {
  externalId: ['application', 'round'],
  mode: 'upsert',
  records: buildInterviews(pack),
});
