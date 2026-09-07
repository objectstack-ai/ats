import { defineSeed } from '@objectstack/spec/data';
import { Offer } from '../../objects/offer.object.js';
import { buildOffers } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-en · 23 offers: 14 on offer-stage applications (3 pending_approval) and one `accepted` per hired application (9). */
export const OfferSeed = defineSeed(Offer, {
  externalId: 'display_name',
  mode: 'upsert',
  records: buildOffers(pack),
});
