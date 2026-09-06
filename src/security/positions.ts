import { definePosition } from '@objectstack/spec/identity';

/**
 * The five audiences. Positions are flat distribution groups (ADR-0090 D3) —
 * no hierarchy — and they bind people to permission sets at runtime.
 *
 * Employer staff carry the same two positions at every employer; *which*
 * employer they act for is not a position, it is their organization
 * membership. That is what keeps the position list constant as the
 * marketplace grows.
 */
export const PlatformAdminPosition = definePosition({
  name: 'platform_admin',
  label: 'Platform Administrator',
  description: 'Runs the platform: full reach over every object, org-wide.',
});

export const PlatformOpsPosition = definePosition({
  name: 'platform_ops',
  label: 'Platform Operations',
  description: 'Works the review queues — employer verification, job review, reports.',
});

export const EmployerAdminPosition = definePosition({
  name: 'employer_admin',
  label: 'Employer Administrator',
  description: "Runs one employer's hiring: staff, jobs, pipeline, offer approval.",
});

export const EmployerRecruiterPosition = definePosition({
  name: 'employer_recruiter',
  label: 'Recruiter',
  description: 'Works the pipeline for an employer. Cannot see candidate contact details or salary expectations.',
});

export const JobSeekerPosition = definePosition({
  name: 'job_seeker',
  label: 'Job Seeker',
  description: 'Owns their own profile, applications and credentials; reads published jobs.',
});
