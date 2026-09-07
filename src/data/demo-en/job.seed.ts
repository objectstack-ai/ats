import { defineSeed } from '@objectstack/spec/data';
import { Job } from '../../objects/job.object.js';
import { buildJobs } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-en · 40 jobs over every status; 6 pending_review, 4 featured. Titles are unique — they are the natural key applications reference. */
export const JobSeed = defineSeed(Job, {
  externalId: 'title',
  mode: 'upsert',
  records: buildJobs(pack),
});
