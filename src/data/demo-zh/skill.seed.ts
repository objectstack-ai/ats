import { defineSeed } from '@objectstack/spec/data';
import { Skill } from '../../objects/skill.object.js';
import { buildSkills } from '../shared/build.js';
import { pack } from './pack.js';

/** demo-zh · 60 skills across the five categories; the dictionary the jobs and candidates reference by name. */
export const SkillSeed = defineSeed(Skill, {
  externalId: 'name',
  mode: 'upsert',
  records: buildSkills(pack),
});
