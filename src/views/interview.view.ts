import { defineView } from '@objectstack/spec';
import type { ListColumn, ListView } from '@objectstack/spec/ui';

/**
 * Employer-side views over `ats_interview` (card 07). `scheduled_at` is the
 * calendar anchor; `display_name` is the stored "<candidate> · R<round>"
 * mirror, so the event title is a real column.
 */

const data = { provider: 'object' as const, object: 'ats_interview' };

const columns = [
  { field: 'display_name', link: true },
  { field: 'round' },
  { field: 'scheduled_at' },
  { field: 'mode' },
  { field: 'interviewers' },
  { field: 'status' },
  { field: 'rating' },
] satisfies ListColumn[];

const exportOptions = { formats: ['csv', 'xlsx'] } satisfies ListView['exportOptions'];

export const InterviewViews = defineView({
  name: 'ats_interview',
  label: 'Interviews',
  object: 'ats_interview',

  list: {
    // Named so the `default` key stays free for a form view (see application.view.ts).
    name: 'all',
    label: 'All Interviews',
    type: 'grid',
    data,
    columns,
    sort: [{ field: 'scheduled_at', order: 'desc' }],
    exportOptions,
  },

  listViews: {
    /**
     * The interview calendar. Events are single-instant (`duration_minutes`
     * is a number, not an end timestamp, so there is no `endDateField`);
     * colour follows the `status` option colours.
     */
    calendar: {
      label: 'Interview Calendar',
      type: 'calendar',
      data,
      columns,
      calendar: {
        startDateField: 'scheduled_at',
        titleField: 'display_name',
        colorField: 'status',
      },
      sort: [{ field: 'scheduled_at', order: 'asc' }],
    },
  },
});
