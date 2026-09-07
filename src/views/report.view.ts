import { defineView } from '@objectstack/spec';
import type { ListColumn, ListView } from '@objectstack/spec/ui';

/**
 * Platform-side views over `ats_report` (card 08). Reports are filed by every
 * audience and handled only by platform staff; the platform group's "Reports"
 * entry is bare, so the default `all` list below is what it lands on and the
 * `open` queue is one view-switch away. `subject` is the object's `nameField`,
 * so it is the link column.
 */

const data = { provider: 'object' as const, object: 'ats_report' };

const columns = [
  { field: 'subject', link: true },
  { field: 'target_type' },
  { field: 'reason' },
  { field: 'status' },
  { field: 'reporter' },
  { field: 'handled_by' },
] satisfies ListColumn[];

const exportOptions = { formats: ['csv', 'xlsx'] } satisfies ListView['exportOptions'];

export const ReportViews = defineView({
  name: 'ats_report',
  label: 'Reports',
  object: 'ats_report',

  list: {
    name: 'all',
    label: 'All Reports',
    type: 'grid',
    data,
    columns,
    userFilters: {
      element: 'dropdown',
      fields: [{ field: 'status' }, { field: 'target_type' }, { field: 'reason' }],
    },
    exportOptions,
  },

  listViews: {
    /** The handling queue: everything not yet resolved or dismissed. */
    open: {
      label: 'Open Reports',
      type: 'grid',
      data,
      columns,
      filter: [{ field: 'status', operator: 'in', value: ['new', 'investigating'] }],
      exportOptions,
    },
  },
});
