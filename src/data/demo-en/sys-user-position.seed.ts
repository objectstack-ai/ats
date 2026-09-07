import { defineSeed } from '@objectstack/spec/data';
import { SysUserPosition } from '../shared/sys-objects.js';
import { buildUserPositions } from '../shared/build.js';

/** demo-en · persona grants for seeded staff and candidates (employer_admin / employer_recruiter / job_seeker); no platform positions. */
export const SysUserPositionSeed = defineSeed(SysUserPosition, {
  externalId: ['user_id', 'position'],
  mode: 'upsert',
  records: buildUserPositions(),
});
