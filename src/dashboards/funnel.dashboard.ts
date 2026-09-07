import type { Dashboard } from '@objectstack/spec/ui';

/**
 * `ats_hiring_funnel` — the pipeline as a funnel over `ats_application.stage`
 * (card 13, DESIGN.md §04: applied → screening → interview → offer → hired).
 *
 * The funnel widget counts ONLY the five progressing stages (`stage: $in`):
 * `rejected` and `withdrawn` are exits, and a funnel that mixes "did not
 * progress" into its stages reads as a far worse pipeline than it is. The two
 * exits get their own tiles. `stageOrder` pins the picklist order so a bulge
 * at one stage is visible instead of being sorted away.
 *
 * No stage-to-stage ratio tiles, though the card asks for them: a ratio is a
 * derived measure over two differently-filtered counts in ONE query, and that
 * is the conditional-aggregate shape the memory driver refuses with 501 on
 * cli 17.3.0 (see application.dataset.ts). The funnel's narrowing is drawn
 * from the same counts; the percentages return when the runtime lowers
 * per-aggregation filters for every driver.
 *
 * Read through the caller's row-level scope, so platform staff see the whole
 * marketplace while an employer would see only its own pipeline. Demo seed
 * (`demo-en`): 88 / 46 / 28 / 14 / 9, rejected 15, withdrawn 0.
 */
const PROGRESSING_STAGES = ['applied', 'screening', 'interview', 'offer', 'hired'];

export const HiringFunnelDashboard: Dashboard = {
  name: 'ats_hiring_funnel',
  label: 'Hiring Funnel',
  description: 'Applications by pipeline stage, and the two exits kept out of the funnel.',
  columns: 12,
  gap: 4,
  header: { showTitle: true, showDescription: true },
  widgets: [
    {
      id: 'stage_funnel',
      type: 'funnel',
      title: 'Pipeline Funnel',
      description: 'Applications currently in each progressing stage.',
      dataset: 'ats_application_metrics',
      dimensions: ['stage'],
      values: ['application_count'],
      filter: { stage: { $in: PROGRESSING_STAGES } },
      chartConfig: {
        type: 'funnel',
        xAxis: { field: 'stage', title: 'Stage' },
        yAxis: [{ field: 'application_count', title: 'Applications' }],
        series: [{ name: 'application_count', label: 'Applications' }],
        showDataLabels: true,
      },
      layout: { x: 0, y: 0, w: 8, h: 6 },
      options: { stageOrder: PROGRESSING_STAGES },
    },
    {
      id: 'rejected',
      type: 'kpi',
      title: 'Rejected',
      description: 'Exited the pipeline — not a funnel stage.',
      dataset: 'ats_application_metrics',
      values: ['application_count'],
      filter: { stage: 'rejected' },
      colorVariant: 'danger',
      layout: { x: 8, y: 0, w: 4, h: 2 },
      options: { icon: 'user-x' },
    },
    {
      id: 'withdrawn',
      type: 'kpi',
      title: 'Withdrawn',
      description: 'Candidate withdrew — not a funnel stage.',
      dataset: 'ats_application_metrics',
      values: ['application_count'],
      filter: { stage: 'withdrawn' },
      layout: { x: 8, y: 2, w: 4, h: 2 },
      options: { icon: 'user-minus' },
    },
    {
      id: 'total_in_funnel',
      type: 'kpi',
      title: 'In Pipeline',
      description: 'Applications in the five progressing stages.',
      dataset: 'ats_application_metrics',
      values: ['application_count'],
      filter: { stage: { $in: PROGRESSING_STAGES } },
      layout: { x: 8, y: 4, w: 4, h: 2 },
      options: { icon: 'send' },
    },
  ],
};
