/**
 * The locale-dependent half of the demo seed.
 *
 * A pack carries only STRINGS — names, titles, cities, prose. Every array is
 * index-aligned with the structural tables in `skeleton.ts` / `pipeline.ts`,
 * which is what makes `demo-zh` a row-for-row mirror of `demo-en`: the two
 * packs are the same length everywhere, and the builders in `build.ts` render
 * one skeleton through whichever pack is selected.
 *
 * Nothing in a pack is a real company or person. Employers, schools, hospitals
 * and people are invented; e-mail and web addresses use the reserved
 * `.example` top-level domain.
 */

export interface EmployerText {
  name: string;
  shortName: string;
  city: string;
  /** One-sentence "About" paragraph. */
  intro: string;
  /** Platform-internal reviewer note; only pending/suspended employers carry one. */
  verificationNote?: string;
}

export interface StaffText {
  /** The employer administrator's display name. */
  admin: string;
  /** Recruiter display names — as many as `EMPLOYERS[i].recruiters`. */
  recruiters: readonly string[];
}

export interface JobText {
  title: string;
  department: string;
  city: string;
  description: string;
  requirements: string;
  /** Returned to the employer on a rejected posting. */
  rejectionReason?: string;
  /** Platform-internal reviewer note (hidden from employer and seeker roles). */
  reviewNote?: string;
}

export interface CandidateText {
  name: string;
  title: string;
  currentEmployer: string;
  summary: string;
}

export interface CredentialTypeText {
  name: string;
  issuer: string;
  description: string;
}

export interface ReportText {
  subject: string;
  description: string;
  resolution?: string;
}

export interface InquiryText {
  /** The applicant's name — only for `INQUIRIES[i].applicant.kind === 'new'`; a seeded candidate keeps their own. */
  name?: string;
  coverLetter: string;
}

export interface LocalePack {
  /** BCP-47 tag written onto the seeded user rows. */
  locale: 'en' | 'zh-CN';
  /** Twelve cities; candidates index into it via `CandidateRow.city`. */
  cities: readonly string[];
  /** Twelve employers, aligned with `EMPLOYERS`. */
  employers: readonly EmployerText[];
  /** Twelve staff groups, aligned with `EMPLOYERS`. */
  staff: readonly StaffText[];
  platformStaff: { readonly ops: string; readonly admin: string };
  /** Forty jobs, aligned with `JOBS`. */
  jobs: readonly JobText[];
  /** Eighty candidates, aligned with `CANDIDATES`. */
  candidates: readonly CandidateText[];
  /** Sixty skills, aligned with `SKILL_CATEGORIES`. */
  skills: readonly string[];
  /** Fifteen credential types, aligned with `CREDENTIAL_TYPES`. */
  credentialTypes: readonly CredentialTypeText[];
  /** Level tokens used in `CREDENTIALS`, rendered in this locale. */
  levels: Readonly<Record<string, string>>;
  /** Six reports, aligned with `REPORTS`. */
  reports: readonly ReportText[];
  /** Eight public-form inquiries, aligned with `INQUIRIES`. */
  inquiries: readonly InquiryText[];
  /** Interview `location_or_link` text per mode; `{city}` and `{room}` are substituted. */
  interviewLocations: { readonly onsite: string; readonly video: string; readonly phone: string };
  offerNote: string;
  /** Summary line for a member row is "<name> · <access level>" — the level label is the machine value; no text needed. */
}
