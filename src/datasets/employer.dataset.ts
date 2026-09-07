import { defineDataset } from '@objectstack/spec/ui';

/**
 * The analytics face of `ats_employer` (card 13) — the platform overview's
 * first tile ("employers (verified)") and half of its review queue ("pending
 * employers"; the other half is a count on `ats_job_metrics`, a different base
 * object, so the queue is two tiles rather than one sum).
 *
 * ⚠️ `ats_employer` is one of the four tenancy-walled objects that return no
 * rows to platform personas on the default (sqlite) driver (#39, open). Both
 * tiles read 0 there for the very people this dashboard is for; the memory
 * driver reads 9 verified · 2 pending (demo seed).
 */
export const EmployerMetrics = defineDataset({
  name: 'ats_employer_metrics',
  label: 'Employer Metrics',
  description: 'Employers by verification status, industry and size. Slice with a widget filter; one count measure.',
  object: 'ats_employer',
  dimensions: [
    { name: 'verification_status', field: 'verification_status', type: 'string', label: 'Verification' },
    { name: 'industry', field: 'industry', type: 'string', label: 'Industry' },
    { name: 'size', field: 'size', type: 'string', label: 'Size' },
  ],
  measures: [
    { name: 'employer_count', aggregate: 'count', label: 'Employers' },
  ],
});
