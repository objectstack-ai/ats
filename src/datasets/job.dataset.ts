import { defineDataset } from '@objectstack/spec/ui';

/**
 * The analytics face of `ats_job` (card 13). Grain is the job row; the
 * employer dashboard reads it through the caller's row-level scope, the
 * platform dashboard reads every job.
 *
 * "Open" is the card's definition, `status == 'published'` — the same
 * predicate as the object's `is_open` formula, applied as a WIDGET filter on
 * the stored column (a formula field has no column to filter, and a
 * measure-scoped filter is refused by the memory driver — see
 * application.dataset.ts).
 */
export const JobMetrics = defineDataset({
  name: 'ats_job_metrics',
  label: 'Job Metrics',
  description: 'Jobs by status, employer, employment type and month published. Slice with a widget filter; one count measure.',
  object: 'ats_job',
  dimensions: [
    { name: 'status', field: 'status', type: 'string', label: 'Status' },
    { name: 'employer', field: 'employer', type: 'lookup', label: 'Employer' },
    { name: 'employment_type', field: 'employment_type', type: 'string', label: 'Employment Type' },
    { name: 'published_at', field: 'published_at', type: 'date', dateGranularity: 'month', label: 'Month Published' },
  ],
  measures: [
    { name: 'job_count', aggregate: 'count', label: 'Jobs' },
  ],
});
