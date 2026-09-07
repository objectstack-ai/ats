import { defineView } from '@objectstack/spec';
import type { ListColumn } from '@objectstack/spec/ui';

/**
 * The talent pool (card 07). There is no talent-pool object on purpose
 * (DESIGN.md §02): it is `ats_candidate` seen through these two views. Which
 * candidates an employer may see at all is the permission set's decision;
 * the contact and salary fields stay masked by field-level security.
 */

const data = { provider: 'object' as const, object: 'ats_candidate' };

const columns = [
  { field: 'full_name', link: true },
  { field: 'city' },
  { field: 'current_title' },
  { field: 'experience_years' },
  { field: 'skills' },
  { field: 'seeking_status' },
] satisfies ListColumn[];

export const CandidateViews = defineView({
  name: 'ats_candidate',
  label: 'Candidates',
  object: 'ats_candidate',

  listViews: {
    /** Grid with the end-user filter bar on skills, city and experience. */
    talent_pool: {
      label: 'Talent Pool',
      type: 'grid',
      data,
      columns,
      userFilters: {
        element: 'dropdown',
        fields: [
          { field: 'skills' },
          { field: 'city' },
          { field: 'experience_years' },
        ],
      },
      sort: [{ field: 'full_name', order: 'asc' }],
      exportOptions: { formats: ['csv', 'xlsx'] },
    },

    /**
     * Card deck: photo as cover, name as title. The gallery config has no
     * subtitle key — the first `visibleFields` entry (`current_title`) is the
     * line under the title.
     */
    gallery: {
      label: 'Gallery',
      type: 'gallery',
      data,
      columns: ['full_name', 'current_title', 'city', 'seeking_status'],
      gallery: {
        coverField: 'avatar',
        titleField: 'full_name',
        visibleFields: ['current_title', 'city', 'seeking_status'],
      },
      sort: [{ field: 'full_name', order: 'asc' }],
    },
  },
});
