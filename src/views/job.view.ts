import { defineView } from '@objectstack/spec';
import type { ListColumn, ListView } from '@objectstack/spec/ui';

/**
 * Views over `ats_job` for all three audiences (cards 07 and 08).
 *
 * `all` is the platform's list: the platform group's "Jobs" entry is bare (no
 * `viewName`), and a bare entry lands on the container's default `list`. The
 * shell synthesises an "All Records" tab only for an object with NO authored
 * views; measured on `main` before this list existed, the bare entry landed on
 * `mine` ("My Jobs"), the first named view — which is the employer's list, not
 * the platform's. Declaring `all` is what makes the platform entry mean "every
 * job". The pending-review queue is not a view here: `platform.nav.ts` owns
 * it as a `filters: { status: 'pending_review' }` slice (see employer.view.ts
 * for the reasoning).
 *
 * `mine` (employer) carries no filter of its own: which employer's jobs a
 * caller sees is the row-level rule on `employer_org`, and a view filter is
 * presentation, not security. `published` (seeker "Find Jobs") shows what a
 * job seeker searches on — the seeker's row-level rule already restricts them
 * to `status == 'published'`; the view filter keeps the same list honest for
 * platform staff, who read every status.
 */

const data = { provider: 'object' as const, object: 'ats_job' };

/** The employer's own listing — status and dates are what they manage. */
const employerColumns = [
  { field: 'title', link: true },
  { field: 'status' },
  { field: 'city' },
  { field: 'employment_type' },
  { field: 'headcount' },
  { field: 'published_at' },
  { field: 'expires_at' },
] satisfies ListColumn[];

/** The platform's listing — the same, plus whose job it is. */
const platformColumns = [
  { field: 'title', link: true },
  { field: 'employer' },
  { field: 'status' },
  { field: 'city' },
  { field: 'employment_type' },
  { field: 'published_at' },
  { field: 'expires_at' },
] satisfies ListColumn[];

/** What a job seeker compares: where, how, and for how much. */
const seekerColumns = [
  { field: 'title', link: true },
  { field: 'employer' },
  { field: 'city' },
  { field: 'work_mode' },
  { field: 'salary_min' },
  { field: 'salary_max' },
  { field: 'employment_type' },
] satisfies ListColumn[];

const sort = [{ field: 'published_at', order: 'desc' }] satisfies ListView['sort'];

const exportOptions = { formats: ['csv', 'xlsx'] } satisfies ListView['exportOptions'];

export const JobViews = defineView({
  name: 'ats_job',
  label: 'Jobs',
  object: 'ats_job',

  list: {
    name: 'all',
    label: 'All Jobs',
    type: 'grid',
    data,
    columns: platformColumns,
    userFilters: {
      element: 'dropdown',
      fields: [{ field: 'status' }, { field: 'employment_type' }, { field: 'work_mode' }],
    },
    sort,
    exportOptions,
  },

  listViews: {
    mine: {
      label: 'My Jobs',
      type: 'grid',
      data,
      columns: employerColumns,
      sort,
      exportOptions,
    },

    published: {
      label: 'Published Jobs',
      type: 'grid',
      data,
      columns: seekerColumns,
      filter: [{ field: 'status', operator: 'equals', value: 'published' }],
      userFilters: {
        element: 'dropdown',
        fields: [{ field: 'work_mode' }, { field: 'employment_type' }, { field: 'city' }],
      },
      sort,
      exportOptions,
    },
  },
});
