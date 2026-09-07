import { defineSeed } from '@objectstack/spec/data';
import { CredentialType } from '../../objects/credential-type.object.js';
import { buildCredentialTypes } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-en · 15 credential types with issuers and validity windows. */
export const CredentialTypeSeed = defineSeed(CredentialType, {
  externalId: 'name',
  mode: 'upsert',
  records: buildCredentialTypes(pack),
});
