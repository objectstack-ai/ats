import { defineDataset } from '@objectstack/spec/ui';

/**
 * The analytics face of `ats_application` — the one dataset behind the funnel
 * and every application tile on the three dashboards (card 13, DESIGN.md §04).
 *
 * Grain is the application row. Row-level security is applied by the analytics
 * runtime per caller (`security.getReadFilter`), so the SAME dataset reads the
 * whole marketplace for platform staff and one employer's pipeline for that
 * employer's people — the employer dashboard needs no filter of its own.
 *
 * One count, sliced by the WIDGET's `filter` — deliberately no measure-scoped
 * `filter` and no derived ratio. Measured on cli 17.3.0: a measure that
 * carries its own `filter` compiles to a conditional aggregate, and the memory
 * driver refuses that with `NOT_IMPLEMENTED` / 501 ("Per-aggregation `filter`
 * … is not supported by this backend (driver-memory)"), which the analytics
 * service does not fall back from — so every such tile errors on the
 * documented dev boot (`--database-driver memory`, AGENTS.md) while working on
 * sqlite. A widget-level filter is applied as the query's WHERE and works on
 * both drivers. The stage-to-stage ratios the card asks for need two
 * differently-filtered counts in one query, which is exactly the refused
 * shape; they are reported as not deliverable on this runtime, not faked.
 *
 * `rejected` / `withdrawn` are terminal exits, not funnel stages: the funnel
 * widget excludes them with `stage: $in` and they get their own tiles.
 */
export const ApplicationMetrics = defineDataset({
  name: 'ats_application_metrics',
  label: 'Application Metrics',
  description: 'Applications by stage, source and week applied. Slice with a widget filter; a count and the average days to offer.',
  object: 'ats_application',
  dimensions: [
    { name: 'stage', field: 'stage', type: 'string', label: 'Stage' },
    { name: 'source', field: 'source', type: 'string', label: 'Source' },
    { name: 'applied_at', field: 'applied_at', type: 'date', dateGranularity: 'week', label: 'Week Applied' },
  ],
  measures: [
    { name: 'application_count', aggregate: 'count', label: 'Applications' },
    // The duration tile. `avg`, not median: the aggregate set is
    // count/sum/avg/min/max/count_distinct and there is no median in it —
    // DESIGN.md §04 asks for the average and this is it. It averages a STORED
    // column (`ats_application.days_to_offer`, written once by the
    // `afterInsert` hook on `ats_offer`) because a measure aggregates one
    // column of one object, and the duration it reports spans two.
    // `AVG` ignores NULLs, so applications that never reached an offer are
    // absent from the denominator rather than counted as zero — which is the
    // reading the tile wants. Slice it with the WIDGET's filter, like the
    // count above; a measure-scoped `filter` is the shape the memory driver
    // answers 501 to (see the header).
    { name: 'avg_days_to_offer', aggregate: 'avg', field: 'days_to_offer', label: 'Avg Days to Offer', format: '0.0' },
  ],
});
