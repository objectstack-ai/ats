import { defineView } from '@objectstack/spec';
import type { ListColumn, ListView } from '@objectstack/spec/ui';

/**
 * Employer-side views over `ats_job` (card 07). `mine` carries no filter of
 * its own: which employer's jobs a caller sees is the row-level rule on
 * `employer_org` (both employer permission sets scope `ats_job` to the
 * caller's organizations), and a view filter is presentation, not security.
 */

const data = { provider: 'object' as const, object: 'ats_job' };

const columns = [
  { field: 'title', link: true },
  { field: 'status' },
  { field: 'city' },
  { field: 'employment_type' },
  { field: 'headcount' },
  { field: 'published_at' },
  { field: 'expires_at' },
] satisfies ListColumn[];

const sort = [{ field: 'published_at', order: 'desc' }] satisfies ListView['sort'];

const exportOptions = { formats: ['csv', 'xlsx'] } satisfies ListView['exportOptions'];

export const JobViews = defineView({
  name: 'ats_job',
  label: 'Jobs',
  object: 'ats_job',

  listViews: {
    mine: {
      label: 'My Jobs',
      type: 'grid',
      data,
      columns,
      sort,
      exportOptions,
    },

    published: {
      label: 'Published Jobs',
      type: 'grid',
      data,
      columns,
      filter: [{ field: 'status', operator: 'equals', value: 'published' }],
      sort,
      exportOptions,
    },
  },
});
