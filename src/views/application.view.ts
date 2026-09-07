import { defineView } from '@objectstack/spec';
import type { ListColumn, ListView } from '@objectstack/spec/ui';

/**
 * Views over `ats_application` — the employer's pipeline (card 07) and the
 * seeker's own timeline (card 08).
 *
 * `display_name` is the stored "<candidate> → <job>" mirror the stamp hook
 * maintains, so it is a real column: safe to bind, sort and link on. Row
 * scope is the permission set's job (row-level rules on `employer_org` for
 * employers, `candidate_user` for seekers), never a view filter — these views
 * only decide what a page SHOWS.
 */

type ViewContainer = Parameters<typeof defineView>[0];
type ObjectListView = NonNullable<ViewContainer['listViews']>[string];

const data = { provider: 'object' as const, object: 'ats_application' };

const columns = [
  { field: 'display_name', link: true },
  { field: 'job' },
  { field: 'candidate' },
  { field: 'stage' },
  { field: 'source' },
  { field: 'applied_at' },
  { field: 'rating' },
] satisfies ListColumn[];

/** Newest applications first, on every grid. */
const sort = [{ field: 'applied_at', order: 'desc' }] satisfies ListView['sort'];

const exportOptions = { formats: ['csv', 'xlsx'] } satisfies ListView['exportOptions'];

/** What every kanban card shows. */
const cardFields = ['display_name', 'job', 'rating', 'applied_at'];

/**
 * One inbox per working stage. The first inbox is "new" in the employer's
 * vocabulary and `applied` in the pipeline's — `stage` has no `new` value
 * (DESIGN.md §02), and `applied` is where every application starts.
 */
function inbox(
  label: string,
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired',
): ObjectListView {
  return {
    label,
    type: 'grid',
    data,
    columns,
    sort,
    exportOptions,
    filter: [{ field: 'stage', operator: 'equals', value: stage }],
  };
}

export const ApplicationViews = defineView({
  name: 'ats_application',
  label: 'Applications',
  object: 'ats_application',

  list: {
    // The default list registers as `<object>.<name>` and implicitly claims
    // `default` when unnamed, which is the key the form below owns. Naming it
    // keeps `ats_application.default` for the form instead of a renamed
    // `default_2` with a collision warning.
    name: 'all',
    label: 'All Applications',
    type: 'grid',
    data,
    columns,
    sort,
    exportOptions,
  },

  listViews: {
    /** The board: one lane per `stage` option, in option order. */
    pipeline: {
      label: 'Pipeline',
      type: 'kanban',
      data,
      columns: cardFields,
      kanban: {
        groupByField: 'stage',
        columns: cardFields,
      },
      sort,
    },

    inbox_new: inbox('Inbox · New', 'applied'),
    inbox_screening: inbox('Inbox · Screening', 'screening'),
    inbox_interview: inbox('Inbox · Interview', 'interview'),
    inbox_offer: inbox('Inbox · Offer', 'offer'),
    inbox_hired: inbox('Inbox · Hired', 'hired'),

    /**
     * The seeker's "My Applications": a chronological stream anchored on
     * `applied_at`, coloured by `stage`. No filter — the seeker's row-level
     * rule (`candidate_user == current_user.id`) is what makes it "mine";
     * platform staff see the same stream over every application.
     */
    mine: {
      label: 'My Applications',
      type: 'timeline',
      data,
      columns: ['display_name', 'job', 'stage', 'applied_at', 'last_activity_at'],
      timeline: {
        startDateField: 'applied_at',
        titleField: 'display_name',
        colorField: 'stage',
        scale: 'month',
      },
      sort,
    },
  },

  formViews: {
    default: {
      type: 'simple',
      data,
      columns: 2,
      sections: [
        {
          name: 'application',
          label: 'Application',
          columns: 2,
          fields: ['job', 'candidate', 'stage', 'source', 'rating', 'cover_letter'],
        },
      ],
    },
  },
});
