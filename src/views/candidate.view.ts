import { defineView } from '@objectstack/spec';
import type { ListColumn } from '@objectstack/spec/ui';

/**
 * Views over `ats_candidate`: the employer's talent pool (card 07) and the
 * seeker's own profile form (card 08). There is no talent-pool object on
 * purpose (DESIGN.md §02): it is `ats_candidate` seen through these views.
 *
 * Which candidates an employer may see at all is the permission set's
 * decision — the consent-gated pool (DESIGN.md §03, #13): `public` and
 * `limited` profiles for every employer, plus this employer's own applicants
 * whatever their visibility. The `filter` on each list below only narrows
 * WITHIN that: the Talent Pool lists the two discoverable tiers, the Gallery
 * showcases `public` alone. That is the whole difference between `public`
 * and `limited` — presentation, documented as such on the field — because
 * field-level security is static per permission set and cannot vary by row.
 * A `hidden` applicant is reached through the pipeline (the application's
 * candidate lookup) and by direct link, not by browsing a pool. The contact
 * and salary fields stay masked by field-level security.
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
    /**
     * Grid with the end-user filter bar on skills, city and experience. The
     * discoverable tiers only (header); the row-level policy is what admits
     * a row, this filter cannot widen it.
     */
    talent_pool: {
      label: 'Talent Pool',
      type: 'grid',
      data,
      columns,
      filter: [{ field: 'profile_visibility', operator: 'in', value: ['public', 'limited'] }],
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
     * Card deck: photo as cover, name as title — the showcase surface, so it
     * lists `public` profiles only (header). The gallery config has no
     * subtitle key — the first `visibleFields` entry (`current_title`) is the
     * line under the title.
     */
    gallery: {
      label: 'Gallery',
      type: 'gallery',
      data,
      columns: ['full_name', 'current_title', 'city', 'seeking_status'],
      filter: [{ field: 'profile_visibility', operator: 'equals', value: 'public' }],
      gallery: {
        coverField: 'avatar',
        titleField: 'full_name',
        visibleFields: ['current_title', 'city', 'seeking_status'],
      },
      sort: [{ field: 'full_name', order: 'asc' }],
    },
  },

  formViews: {
    /**
     * The seeker's profile — every field, salary last (card 08). Keyed
     * `default` rather than the card's `profile` because the shell binds the
     * record create/edit surface to `form ?? formViews.default` and nothing
     * else (objectui `RecordFormPage`); a `profile` key would register and be
     * used by nothing. Sections are enumerated because the object declares
     * no `fieldGroups`. The salary and contact fields stay masked for
     * employer roles by field-level security, so the same form serves the
     * candidate and platform staff without a second definition.
     */
    default: {
      type: 'simple',
      data,
      sections: [
        {
          name: 'identity',
          label: 'About You',
          columns: 2,
          fields: ['full_name', 'user', 'avatar', 'phone', 'email', 'city'],
        },
        {
          name: 'background',
          label: 'Background',
          columns: 2,
          fields: ['experience_years', 'education', 'current_title', 'current_employer', 'skills', 'summary', 'resume_file'],
        },
        {
          name: 'preferences',
          label: 'Job Search',
          columns: 2,
          fields: ['seeking_status', 'profile_visibility'],
        },
        {
          name: 'salary',
          label: 'Expected Salary',
          columns: 2,
          fields: ['expected_salary_min', 'expected_salary_max', 'salary_period'],
        },
      ],
    },
  },
});
