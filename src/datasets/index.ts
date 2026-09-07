// The semantic layer the three dashboards bind to (card 13, ADR-0021). One
// dataset per object that has an analytics face; widgets select dimensions and
// measures from these BY NAME, and `validate` refuses a name that is not here.
export { ApplicationMetrics } from './application.dataset.js';
export { JobMetrics } from './job.dataset.js';
export { EmployerMetrics } from './employer.dataset.js';
export { CandidateMetrics } from './candidate.dataset.js';
export { InterviewMetrics } from './interview.dataset.js';
