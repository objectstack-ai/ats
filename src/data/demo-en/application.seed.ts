import { defineSeed } from '@objectstack/spec/data';
import { Application } from '../../objects/application.object.js';
import { buildApplications } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-en · 200 applications: applied 88 · screening 46 · interview 28 · offer 14 · hired 9 · rejected 15. */
export const ApplicationSeed = defineSeed(Application, {
  externalId: 'display_name',
  mode: 'upsert',
  records: buildApplications(pack),
});
