import { defineSeed } from '@objectstack/spec/data';
import { EmployerMember } from '../../objects/employer-member.object.js';
import { buildEmployerMembers } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-en · 1 admin + 1–2 recruiters per employer, `display_name` mirrored explicitly. */
export const EmployerMemberSeed = defineSeed(EmployerMember, {
  externalId: ['employer', 'user'],
  mode: 'upsert',
  records: buildEmployerMembers(pack),
});
