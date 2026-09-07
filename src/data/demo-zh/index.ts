import type { Seed } from '@objectstack/spec/data';
import { SkillSeed } from './skill.seed.js';
import { CredentialTypeSeed } from './credential-type.seed.js';
import { SysOrganizationSeed } from './sys-organization.seed.js';
import { SysUserSeed } from './sys-user.seed.js';
import { SysAccountSeed } from './sys-account.seed.js';
import { SysMemberSeed } from './sys-member.seed.js';
import { SysUserPositionSeed } from './sys-user-position.seed.js';
import { EmployerSeed } from './employer.seed.js';
import { EmployerMemberSeed } from './employer-member.seed.js';
import { JobSeed } from './job.seed.js';
import { CandidateSeed } from './candidate.seed.js';
import { CandidateCredentialSeed } from './candidate-credential.seed.js';
import { ApplicationSeed } from './application.seed.js';
import { InterviewSeed } from './interview.seed.js';
import { OfferSeed } from './offer.seed.js';
import { ReportSeed } from './report.seed.js';
import { InquirySeed } from './inquiry.seed.js';

/** Parents before children: the loader also sorts by the reference graph, but an explicit order is the readable contract. */
export const seeds: Seed[] = [
  // Dictionaries first — everything below references them by name.
  SkillSeed,
  CredentialTypeSeed,
  // Platform identity — organizations, users, their sign-in credentials, memberships, persona grants.
  SysOrganizationSeed,
  SysUserSeed,
  SysAccountSeed,
  SysMemberSeed,
  SysUserPositionSeed,
  // Employer domain.
  EmployerSeed,
  EmployerMemberSeed,
  JobSeed,
  // Candidate domain.
  CandidateSeed,
  CandidateCredentialSeed,
  // Transaction domain.
  ApplicationSeed,
  InterviewSeed,
  OfferSeed,
  ReportSeed,
  // The public application entry's queue — after jobs (it references them).
  InquirySeed,
];
