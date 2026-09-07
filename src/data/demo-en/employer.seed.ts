import { defineSeed } from '@objectstack/spec/data';
import { Employer } from '../../objects/employer.object.js';
import { buildEmployers } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-en · 12 employers across the industry enum; 2 pending, 1 suspended. */
export const EmployerSeed = defineSeed(Employer, {
  externalId: 'name',
  mode: 'upsert',
  records: buildEmployers(pack),
});
