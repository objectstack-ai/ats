import { defineView } from '@objectstack/spec';
import type { ListColumn } from '@objectstack/spec/ui';

/**
 * Dictionary grid over `ats_skill` (card 08). The skill list is a
 * platform-maintained, platform-wide vocabulary (`public_read`, writes are
 * platform-only); the platform group's "Skills" entry is bare and lands here.
 */

const data = { provider: 'object' as const, object: 'ats_skill' };

const columns = [
  { field: 'name', link: true },
  { field: 'category' },
  { field: 'aliases' },
  { field: 'description' },
] satisfies ListColumn[];

export const SkillViews = defineView({
  name: 'ats_skill',
  label: 'Skills',
  object: 'ats_skill',

  list: {
    name: 'all',
    label: 'All Skills',
    type: 'grid',
    data,
    columns,
    userFilters: { element: 'dropdown', fields: [{ field: 'category' }] },
    sort: [{ field: 'name', order: 'asc' }],
    exportOptions: { formats: ['csv', 'xlsx'] },
  },
});
