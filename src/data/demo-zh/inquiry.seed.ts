import { defineSeed } from '@objectstack/spec/data';
import { Inquiry } from '../../objects/inquiry.object.js';
import { buildInquiries } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-zh · 8 public-form inquiries, all `new`: 5 from people with no candidate row, 3 from seeded candidates. */
export const InquirySeed = defineSeed(Inquiry, {
  externalId: 'display_name',
  mode: 'upsert',
  records: buildInquiries(pack),
});
