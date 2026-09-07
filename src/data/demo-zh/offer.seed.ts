import { defineSeed } from '@objectstack/spec/data';
import { Offer } from '../../objects/offer.object.js';
import { buildOffers } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-zh · 14 offers, 3 of them pending_approval. */
export const OfferSeed = defineSeed(Offer, {
  externalId: 'display_name',
  mode: 'upsert',
  records: buildOffers(pack),
});
