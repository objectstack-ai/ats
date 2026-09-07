import { defineSeed } from '@objectstack/spec/data';
import { Report } from '../../objects/report.object.js';
import { buildReports } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-en · 6 reports across all four target types. */
export const ReportSeed = defineSeed(Report, {
  externalId: 'subject',
  mode: 'upsert',
  records: buildReports(pack),
});
