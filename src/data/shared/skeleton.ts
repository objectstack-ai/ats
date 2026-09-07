/**
 * Hand-authored, locale-independent structure of the demo seed.
 *
 * Everything that is a machine value lives here — enum values, salary bands,
 * indexes between tables, day offsets. Everything that is a human string lives
 * in the locale packs (`../demo-en/pack.ts`, `../demo-zh/pack.ts`), aligned by
 * index. The generated pipeline (applications, interviews, offers, candidate
 * attributes) lives in `pipeline.ts`.
 *
 * Enum values are exactly those declared on the objects in `src/objects/`;
 * `pnpm validate` and `pnpm lint` (seed-value-outside-state-machine) hold
 * them there.
 */

// ── Employers ────────────────────────────────────────────────────────────────

export type Industry =
  | 'technology' | 'manufacturing' | 'healthcare' | 'retail' | 'education'
  | 'finance' | 'logistics' | 'hospitality' | 'construction' | 'other';

export interface EmployerRow {
  /** Stable handle: organization slug `ats-<slug>`, org id `org_ats_<slug>`, staff e-mails `*@<slug>.example`. */
  slug: string;
  industry: Industry;
  size: 'micro' | 'small' | 'medium' | 'large';
  verificationStatus: 'draft' | 'pending' | 'verified' | 'rejected' | 'suspended';
  serviceTier: 'trial' | 'standard' | 'premium';
  serviceExpiresInDays: number;
  /** Recruiters per employer (the card asks for 1 admin + 1–2 recruiters). */
  recruiters: 1 | 2;
}

/** Twelve employers: industries across the enum, 2 pending, 1 suspended (DESIGN.md §06). */
export const EMPLOYERS: readonly EmployerRow[] = [
  /* 0 */ { slug: 'quillstone',   industry: 'technology',    size: 'medium', verificationStatus: 'verified',  serviceTier: 'premium',  serviceExpiresInDays: 300, recruiters: 2 },
  /* 1 */ { slug: 'harborline',   industry: 'manufacturing', size: 'large',  verificationStatus: 'verified',  serviceTier: 'standard', serviceExpiresInDays: 210, recruiters: 2 },
  /* 2 */ { slug: 'cedarbrook',   industry: 'healthcare',    size: 'large',  verificationStatus: 'verified',  serviceTier: 'premium',  serviceExpiresInDays: 340, recruiters: 2 },
  /* 3 */ { slug: 'brightmarket', industry: 'retail',        size: 'large',  verificationStatus: 'verified',  serviceTier: 'standard', serviceExpiresInDays: 150, recruiters: 2 },
  /* 4 */ { slug: 'lumenvale',    industry: 'education',     size: 'small',  verificationStatus: 'verified',  serviceTier: 'standard', serviceExpiresInDays: 120, recruiters: 2 },
  /* 5 */ { slug: 'summitridge',  industry: 'finance',       size: 'medium', verificationStatus: 'verified',  serviceTier: 'premium',  serviceExpiresInDays: 365, recruiters: 2 },
  /* 6 */ { slug: 'swiftroute',   industry: 'logistics',     size: 'medium', verificationStatus: 'verified',  serviceTier: 'standard', serviceExpiresInDays: 180, recruiters: 1 },
  /* 7 */ { slug: 'bluewater',    industry: 'hospitality',   size: 'medium', verificationStatus: 'verified',  serviceTier: 'trial',    serviceExpiresInDays: 25,  recruiters: 1 },
  /* 8 */ { slug: 'ironbridge',   industry: 'construction',  size: 'medium', verificationStatus: 'verified',  serviceTier: 'standard', serviceExpiresInDays: 95,  recruiters: 1 },
  /* 9 */ { slug: 'pixelforge',   industry: 'technology',    size: 'micro',  verificationStatus: 'pending',   serviceTier: 'trial',    serviceExpiresInDays: 30,  recruiters: 1 },
  /* 10 */ { slug: 'meridian',    industry: 'healthcare',    size: 'small',  verificationStatus: 'pending',   serviceTier: 'trial',    serviceExpiresInDays: 30,  recruiters: 1 },
  /* 11 */ { slug: 'orbit',       industry: 'other',         size: 'micro',  verificationStatus: 'suspended', serviceTier: 'trial',    serviceExpiresInDays: 10,  recruiters: 1 },
];

// ── Skills ───────────────────────────────────────────────────────────────────

export type SkillCategory = 'technical' | 'domain' | 'tool' | 'language' | 'soft';

/** Sixty skills: 18 technical · 14 domain · 12 tool · 6 language · 10 soft. Names live in the packs. */
export const SKILL_CATEGORIES: readonly SkillCategory[] = [
  ...Array<SkillCategory>(18).fill('technical'),
  ...Array<SkillCategory>(14).fill('domain'),
  ...Array<SkillCategory>(12).fill('tool'),
  ...Array<SkillCategory>(6).fill('language'),
  ...Array<SkillCategory>(10).fill('soft'),
];

// ── Credential types ─────────────────────────────────────────────────────────

export interface CredentialTypeRow {
  /** Prefix of seeded certificate numbers. */
  code: string;
  hasLevels: boolean;
  /** Months a certificate stays valid; null = never expires. */
  validityMonths: number | null;
}

/** Fifteen credential types with realistic validity windows. Names and issuers live in the packs. */
export const CREDENTIAL_TYPES: readonly CredentialTypeRow[] = [
  /* 0 */ { code: 'RN',   hasLevels: false, validityMonths: 24 },
  /* 1 */ { code: 'ELEC', hasLevels: true,  validityMonths: 36 },
  /* 2 */ { code: 'FLT',  hasLevels: false, validityMonths: 36 },
  /* 3 */ { code: 'CPA',  hasLevels: false, validityMonths: 12 },
  /* 4 */ { code: 'FA',   hasLevels: false, validityMonths: 24 },
  /* 5 */ { code: 'FSH',  hasLevels: true,  validityMonths: 36 },
  /* 6 */ { code: 'CRN',  hasLevels: true,  validityMonths: 60 },
  /* 7 */ { code: 'TCH',  hasLevels: false, validityMonths: 60 },
  /* 8 */ { code: 'PMP',  hasLevels: false, validityMonths: 36 },
  /* 9 */ { code: 'WLD',  hasLevels: true,  validityMonths: 24 },
  /* 10 */ { code: 'CDL', hasLevels: true,  validityMonths: 60 },
  /* 11 */ { code: 'PHT', hasLevels: false, validityMonths: 24 },
  /* 12 */ { code: 'OSO', hasLevels: true,  validityMonths: 36 },
  /* 13 */ { code: 'DPP', hasLevels: false, validityMonths: 24 },
  /* 14 */ { code: 'PHY', hasLevels: false, validityMonths: 12 },
];

// ── Jobs ─────────────────────────────────────────────────────────────────────

export type JobStatus = 'draft' | 'pending_review' | 'published' | 'paused' | 'closed' | 'rejected';
export type Education = 'none' | 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctorate';

export interface JobRow {
  /** Index into EMPLOYERS. */
  employer: number;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary';
  workMode: 'onsite' | 'hybrid' | 'remote';
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: 'monthly' | 'yearly' | 'hourly';
  headcount: number;
  /** Indexes into the skills table. */
  requiredSkills: readonly number[];
  /** Indexes into CREDENTIAL_TYPES. */
  requiredCredentials: readonly number[];
  experienceMinYears: number;
  educationMin: Education;
  status: JobStatus;
  isFeatured: boolean;
  /** Set for published / paused / closed postings (`daysAgo(n)`). */
  publishedDaysAgo: number | null;
  /** Set for published postings (`daysFromNow(n)`). */
  expiresInDays: number | null;
}

/**
 * Forty jobs: published 22 · pending_review 6 · draft 4 · paused 3 · closed 3 ·
 * rejected 2; four featured. Pending employers (9, 10) carry only drafts and
 * reviews — an unverified employer cannot publish; the suspended employer (11)
 * carries a rejected posting.
 */
export const JOBS: readonly JobRow[] = [
  /* 0 */ { employer: 0, employmentType: 'full_time', workMode: 'hybrid', salaryMin: 130000, salaryMax: 170000, salaryPeriod: 'yearly', headcount: 2, requiredSkills: [3, 0, 6], requiredCredentials: [], experienceMinYears: 5, educationMin: 'bachelor', status: 'published', isFeatured: true, publishedDaysAgo: 21, expiresInDays: 39 },
  /* 1 */ { employer: 0, employmentType: 'full_time', workMode: 'onsite', salaryMin: 115000, salaryMax: 150000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [5, 3], requiredCredentials: [], experienceMinYears: 3, educationMin: 'bachelor', status: 'published', isFeatured: false, publishedDaysAgo: 30, expiresInDays: 30 },
  /* 2 */ { employer: 0, employmentType: 'full_time', workMode: 'onsite', salaryMin: 5000, salaryMax: 6500, salaryPeriod: 'monthly', headcount: 3, requiredSkills: [13, 52, 56], requiredCredentials: [10], experienceMinYears: 2, educationMin: 'associate', status: 'published', isFeatured: false, publishedDaysAgo: 14, expiresInDays: 46 },
  /* 3 */ { employer: 0, employmentType: 'full_time', workMode: 'hybrid', salaryMin: 110000, salaryMax: 140000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [12, 0, 13], requiredCredentials: [], experienceMinYears: 3, educationMin: 'bachelor', status: 'pending_review', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },
  /* 4 */ { employer: 0, employmentType: 'full_time', workMode: 'hybrid', salaryMin: 140000, salaryMax: 175000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [50, 51, 8], requiredCredentials: [], experienceMinYears: 3, educationMin: 'bachelor', status: 'draft', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },

  /* 5 */ { employer: 1, employmentType: 'full_time', workMode: 'onsite', salaryMin: 4800, salaryMax: 6200, salaryPeriod: 'monthly', headcount: 4, requiredSkills: [14, 26, 59], requiredCredentials: [], experienceMinYears: 3, educationMin: 'high_school', status: 'published', isFeatured: false, publishedDaysAgo: 25, expiresInDays: 35 },
  /* 6 */ { employer: 1, employmentType: 'full_time', workMode: 'onsite', salaryMin: 75000, salaryMax: 90000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [27, 51, 53], requiredCredentials: [12], experienceMinYears: 5, educationMin: 'associate', status: 'published', isFeatured: false, publishedDaysAgo: 18, expiresInDays: 42 },
  /* 7 */ { employer: 1, employmentType: 'full_time', workMode: 'onsite', salaryMin: 4200, salaryMax: 5200, salaryPeriod: 'monthly', headcount: 2, requiredSkills: [26, 59, 36], requiredCredentials: [], experienceMinYears: 2, educationMin: 'high_school', status: 'published', isFeatured: false, publishedDaysAgo: 9, expiresInDays: 51 },
  /* 8 */ { employer: 1, employmentType: 'full_time', workMode: 'onsite', salaryMin: 5500, salaryMax: 7000, salaryPeriod: 'monthly', headcount: 1, requiredSkills: [13, 52], requiredCredentials: [1], experienceMinYears: 4, educationMin: 'associate', status: 'paused', isFeatured: false, publishedDaysAgo: 40, expiresInDays: null },
  /* 9 */ { employer: 1, employmentType: 'full_time', workMode: 'onsite', salaryMin: 26, salaryMax: 34, salaryPeriod: 'hourly', headcount: 3, requiredSkills: [26, 59], requiredCredentials: [9], experienceMinYears: 2, educationMin: 'high_school', status: 'closed', isFeatured: false, publishedDaysAgo: 75, expiresInDays: null },

  /* 10 */ { employer: 2, employmentType: 'full_time', workMode: 'onsite', salaryMin: 78000, salaryMax: 95000, salaryPeriod: 'yearly', headcount: 4, requiredSkills: [18, 50, 57], requiredCredentials: [0, 4], experienceMinYears: 2, educationMin: 'associate', status: 'published', isFeatured: true, publishedDaysAgo: 12, expiresInDays: 48 },
  /* 11 */ { employer: 2, employmentType: 'full_time', workMode: 'hybrid', salaryMin: 52000, salaryMax: 62000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [18, 54, 50], requiredCredentials: [], experienceMinYears: 2, educationMin: 'bachelor', status: 'published', isFeatured: false, publishedDaysAgo: 20, expiresInDays: 40 },
  /* 12 */ { employer: 2, employmentType: 'full_time', workMode: 'onsite', salaryMin: 72000, salaryMax: 88000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [18, 53], requiredCredentials: [14], experienceMinYears: 1, educationMin: 'bachelor', status: 'published', isFeatured: false, publishedDaysAgo: 27, expiresInDays: 33 },
  /* 13 */ { employer: 2, employmentType: 'full_time', workMode: 'onsite', salaryMin: 3600, salaryMax: 4400, salaryPeriod: 'monthly', headcount: 2, requiredSkills: [25, 59], requiredCredentials: [11], experienceMinYears: 1, educationMin: 'associate', status: 'pending_review', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },
  /* 14 */ { employer: 2, employmentType: 'part_time', workMode: 'onsite', salaryMin: 3200, salaryMax: 3800, salaryPeriod: 'monthly', headcount: 1, requiredSkills: [59, 22], requiredCredentials: [], experienceMinYears: 0, educationMin: 'high_school', status: 'draft', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },

  /* 15 */ { employer: 3, employmentType: 'full_time', workMode: 'onsite', salaryMin: 65000, salaryMax: 80000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [51, 56, 24], requiredCredentials: [], experienceMinYears: 4, educationMin: 'associate', status: 'published', isFeatured: false, publishedDaysAgo: 16, expiresInDays: 44 },
  /* 16 */ { employer: 3, employmentType: 'full_time', workMode: 'hybrid', salaryMin: 55000, salaryMax: 68000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [24, 38, 50], requiredCredentials: [], experienceMinYears: 3, educationMin: 'bachelor', status: 'published', isFeatured: false, publishedDaysAgo: 33, expiresInDays: 27 },
  /* 17 */ { employer: 3, employmentType: 'full_time', workMode: 'hybrid', salaryMin: 60000, salaryMax: 75000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [25, 32, 34], requiredCredentials: [], experienceMinYears: 2, educationMin: 'bachelor', status: 'closed', isFeatured: false, publishedDaysAgo: 80, expiresInDays: null },
  /* 18 */ { employer: 3, employmentType: 'full_time', workMode: 'remote', salaryMin: 58000, salaryMax: 72000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [24, 33, 35], requiredCredentials: [], experienceMinYears: 2, educationMin: 'bachelor', status: 'rejected', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },

  /* 19 */ { employer: 4, employmentType: 'full_time', workMode: 'onsite', salaryMin: 55000, salaryMax: 70000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [23, 50, 58], requiredCredentials: [7], experienceMinYears: 2, educationMin: 'bachelor', status: 'published', isFeatured: false, publishedDaysAgo: 22, expiresInDays: 38 },
  /* 20 */ { employer: 4, employmentType: 'full_time', workMode: 'onsite', salaryMin: 48000, salaryMax: 58000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [50, 56, 35], requiredCredentials: [], experienceMinYears: 1, educationMin: 'bachelor', status: 'published', isFeatured: false, publishedDaysAgo: 11, expiresInDays: 49 },
  /* 21 */ { employer: 4, employmentType: 'contract', workMode: 'remote', salaryMin: 65000, salaryMax: 80000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [23, 38], requiredCredentials: [], experienceMinYears: 3, educationMin: 'bachelor', status: 'pending_review', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },

  /* 22 */ { employer: 5, employmentType: 'full_time', workMode: 'hybrid', salaryMin: 95000, salaryMax: 125000, salaryPeriod: 'yearly', headcount: 2, requiredSkills: [15, 4, 21], requiredCredentials: [], experienceMinYears: 3, educationMin: 'master', status: 'published', isFeatured: true, publishedDaysAgo: 19, expiresInDays: 41 },
  /* 23 */ { employer: 5, employmentType: 'full_time', workMode: 'hybrid', salaryMin: 90000, salaryMax: 115000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [22, 21, 50], requiredCredentials: [13], experienceMinYears: 4, educationMin: 'bachelor', status: 'published', isFeatured: false, publishedDaysAgo: 28, expiresInDays: 32 },
  /* 24 */ { employer: 5, employmentType: 'full_time', workMode: 'onsite', salaryMin: 80000, salaryMax: 100000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [55, 35, 20], requiredCredentials: [], experienceMinYears: 5, educationMin: 'bachelor', status: 'paused', isFeatured: false, publishedDaysAgo: 45, expiresInDays: null },
  /* 25 */ { employer: 5, employmentType: 'full_time', workMode: 'remote', salaryMin: 120000, salaryMax: 150000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [4, 0, 9], requiredCredentials: [], experienceMinYears: 4, educationMin: 'bachelor', status: 'pending_review', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },

  /* 26 */ { employer: 6, employmentType: 'full_time', workMode: 'onsite', salaryMin: 4000, salaryMax: 4800, salaryPeriod: 'monthly', headcount: 2, requiredSkills: [19, 54, 50], requiredCredentials: [], experienceMinYears: 2, educationMin: 'high_school', status: 'published', isFeatured: false, publishedDaysAgo: 15, expiresInDays: 45 },
  /* 27 */ { employer: 6, employmentType: 'full_time', workMode: 'onsite', salaryMin: 4200, salaryMax: 5000, salaryPeriod: 'monthly', headcount: 1, requiredSkills: [43, 51, 53], requiredCredentials: [2], experienceMinYears: 3, educationMin: 'high_school', status: 'published', isFeatured: false, publishedDaysAgo: 24, expiresInDays: 36 },
  /* 28 */ { employer: 6, employmentType: 'full_time', workMode: 'onsite', salaryMin: 19, salaryMax: 24, salaryPeriod: 'hourly', headcount: 6, requiredSkills: [25], requiredCredentials: [2], experienceMinYears: 1, educationMin: 'none', status: 'published', isFeatured: false, publishedDaysAgo: 7, expiresInDays: 53 },
  /* 29 */ { employer: 6, employmentType: 'full_time', workMode: 'hybrid', salaryMin: 65000, salaryMax: 85000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [30, 22], requiredCredentials: [], experienceMinYears: 3, educationMin: 'bachelor', status: 'closed', isFeatured: false, publishedDaysAgo: 70, expiresInDays: null },

  /* 30 */ { employer: 7, employmentType: 'full_time', workMode: 'onsite', salaryMin: 58000, salaryMax: 70000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [29, 56, 51], requiredCredentials: [], experienceMinYears: 3, educationMin: 'associate', status: 'published', isFeatured: false, publishedDaysAgo: 13, expiresInDays: 47 },
  /* 31 */ { employer: 7, employmentType: 'full_time', workMode: 'onsite', salaryMin: 55000, salaryMax: 68000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [29, 53, 54], requiredCredentials: [5], experienceMinYears: 3, educationMin: 'none', status: 'published', isFeatured: true, publishedDaysAgo: 10, expiresInDays: 50 },
  /* 32 */ { employer: 7, employmentType: 'temporary', workMode: 'onsite', salaryMin: 3800, salaryMax: 4600, salaryPeriod: 'monthly', headcount: 1, requiredSkills: [29, 55, 54], requiredCredentials: [], experienceMinYears: 1, educationMin: 'high_school', status: 'pending_review', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },

  /* 33 */ { employer: 8, employmentType: 'full_time', workMode: 'onsite', salaryMin: 78000, salaryMax: 95000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [14, 28, 36], requiredCredentials: [], experienceMinYears: 2, educationMin: 'bachelor', status: 'published', isFeatured: false, publishedDaysAgo: 17, expiresInDays: 43 },
  /* 34 */ { employer: 8, employmentType: 'full_time', workMode: 'onsite', salaryMin: 70000, salaryMax: 88000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [28, 50, 59], requiredCredentials: [12, 4], experienceMinYears: 3, educationMin: 'associate', status: 'published', isFeatured: false, publishedDaysAgo: 29, expiresInDays: 31 },
  /* 35 */ { employer: 8, employmentType: 'full_time', workMode: 'onsite', salaryMin: 32, salaryMax: 42, salaryPeriod: 'hourly', headcount: 2, requiredSkills: [28], requiredCredentials: [6], experienceMinYears: 3, educationMin: 'none', status: 'paused', isFeatured: false, publishedDaysAgo: 38, expiresInDays: null },

  /* 36 */ { employer: 9, employmentType: 'full_time', workMode: 'remote', salaryMin: 85000, salaryMax: 110000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [38, 52, 53], requiredCredentials: [], experienceMinYears: 2, educationMin: 'none', status: 'pending_review', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },
  /* 37 */ { employer: 9, employmentType: 'contract', workMode: 'remote', salaryMin: 90000, salaryMax: 120000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [3, 38, 39], requiredCredentials: [], experienceMinYears: 3, educationMin: 'none', status: 'draft', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },

  /* 38 */ { employer: 10, employmentType: 'part_time', workMode: 'onsite', salaryMin: 18, salaryMax: 22, salaryPeriod: 'hourly', headcount: 2, requiredSkills: [56, 50, 54], requiredCredentials: [], experienceMinYears: 0, educationMin: 'high_school', status: 'draft', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },

  /* 39 */ { employer: 11, employmentType: 'full_time', workMode: 'hybrid', salaryMin: 95000, salaryMax: 130000, salaryPeriod: 'yearly', headcount: 1, requiredSkills: [20, 50, 55], requiredCredentials: [], experienceMinYears: 4, educationMin: 'bachelor', status: 'rejected', isFeatured: false, publishedDaysAgo: null, expiresInDays: null },
];

// ── Candidate credentials ────────────────────────────────────────────────────

export interface CredentialRow {
  /** Index into the candidates table. */
  candidate: number;
  /** Index into CREDENTIAL_TYPES. */
  type: number;
  /** Level token, rendered through `pack.levels`; null for pass/fail credentials. */
  level: string | null;
  certificateNo: string;
  issuedDaysAgo: number;
  /** Days until expiry (`daysFromNow(n)`); negative = already expired (`daysAgo(-n)`). */
  expiresInDays: number;
  verification: 'pending' | 'verified' | 'rejected';
}

/**
 * Thirty credentials; exactly five expire within the next 90 days (15, 33, 48,
 * 62, 80 days out), so `is_expiring` is exercised without fixed dates. Two are
 * already expired — `is_expiring` must stay false on those.
 */
export const CREDENTIALS: readonly CredentialRow[] = [
  { candidate: 23, type: 0,  level: null,          certificateNo: 'RN-2024-10457',   issuedDaysAgo: 715,  expiresInDays: 15,   verification: 'verified' },
  { candidate: 24, type: 0,  level: null,          certificateNo: 'RN-2025-20311',   issuedDaysAgo: 330,  expiresInDays: 400,  verification: 'verified' },
  { candidate: 25, type: 0,  level: null,          certificateNo: 'RN-2024-11872',   issuedDaysAgo: 697,  expiresInDays: 33,   verification: 'pending' },
  { candidate: 26, type: 14, level: null,          certificateNo: 'PHY-2026-00218',  issuedDaysAgo: 165,  expiresInDays: 200,  verification: 'verified' },
  { candidate: 27, type: 4,  level: null,          certificateNo: 'FA-2024-33019',   issuedDaysAgo: 682,  expiresInDays: 48,   verification: 'verified' },
  { candidate: 28, type: 11, level: null,          certificateNo: 'PHT-2025-04471',  issuedDaysAgo: 210,  expiresInDays: 520,  verification: 'verified' },
  { candidate: 29, type: 0,  level: null,          certificateNo: 'RN-2023-09934',   issuedDaysAgo: 750,  expiresInDays: -20,  verification: 'verified' },
  { candidate: 30, type: 4,  level: null,          certificateNo: 'FA-2025-35102',   issuedDaysAgo: 430,  expiresInDays: 300,  verification: 'pending' },
  { candidate: 31, type: 0,  level: null,          certificateNo: 'RN-2026-30040',   issuedDaysAgo: 30,   expiresInDays: 700,  verification: 'verified' },
  { candidate: 14, type: 1,  level: 'journeyman',  certificateNo: 'ELEC-2023-5521',  issuedDaysAgo: 1033, expiresInDays: 62,   verification: 'verified' },
  { candidate: 15, type: 9,  level: 'position_3g', certificateNo: 'WLD-2025-0782',   issuedDaysAgo: 480,  expiresInDays: 250,  verification: 'verified' },
  { candidate: 16, type: 2,  level: null,          certificateNo: 'FLT-2023-88120',  issuedDaysAgo: 1015, expiresInDays: 80,   verification: 'verified' },
  { candidate: 17, type: 1,  level: 'master',      certificateNo: 'ELEC-2025-6102',  issuedDaysAgo: 195,  expiresInDays: 900,  verification: 'verified' },
  { candidate: 18, type: 12, level: 'level_2',     certificateNo: 'OSO-2025-2210',   issuedDaysAgo: 645,  expiresInDays: 450,  verification: 'pending' },
  { candidate: 19, type: 9,  level: 'position_6g', certificateNo: 'WLD-2025-0911',   issuedDaysAgo: 400,  expiresInDays: 330,  verification: 'verified' },
  { candidate: 58, type: 2,  level: null,          certificateNo: 'FLT-2025-90455',  issuedDaysAgo: 495,  expiresInDays: 600,  verification: 'verified' },
  { candidate: 59, type: 10, level: 'class_b',     certificateNo: 'CDL-2024-71833',  issuedDaysAgo: 725,  expiresInDays: 1100, verification: 'verified' },
  { candidate: 60, type: 2,  level: null,          certificateNo: 'FLT-2022-84077',  issuedDaysAgo: 1190, expiresInDays: -95,  verification: 'verified' },
  { candidate: 61, type: 10, level: 'class_c',     certificateNo: 'CDL-2025-72910',  issuedDaysAgo: 1025, expiresInDays: 800,  verification: 'verified' },
  { candidate: 73, type: 6,  level: 'class_a',     certificateNo: 'CRN-2024-1187',   issuedDaysAgo: 875,  expiresInDays: 950,  verification: 'verified' },
  { candidate: 74, type: 12, level: 'level_3',     certificateNo: 'OSO-2025-2377',   issuedDaysAgo: 695,  expiresInDays: 400,  verification: 'verified' },
  { candidate: 75, type: 4,  level: null,          certificateNo: 'FA-2025-36648',   issuedDaysAgo: 580,  expiresInDays: 150,  verification: 'pending' },
  { candidate: 76, type: 6,  level: 'class_b',     certificateNo: 'CRN-2025-1290',   issuedDaysAgo: 625,  expiresInDays: 1200, verification: 'verified' },
  { candidate: 49, type: 3,  level: null,          certificateNo: 'CPA-2026-40112',  issuedDaysAgo: 185,  expiresInDays: 180,  verification: 'verified' },
  { candidate: 50, type: 13, level: null,          certificateNo: 'DPP-2025-00931',  issuedDaysAgo: 230,  expiresInDays: 500,  verification: 'verified' },
  { candidate: 51, type: 3,  level: null,          certificateNo: 'CPA-2026-40388',  issuedDaysAgo: 245,  expiresInDays: 120,  verification: 'pending' },
  { candidate: 43, type: 7,  level: null,          certificateNo: 'TCH-2023-15502',  issuedDaysAgo: 425,  expiresInDays: 1400, verification: 'verified' },
  { candidate: 44, type: 7,  level: null,          certificateNo: 'TCH-2024-16219',  issuedDaysAgo: 825,  expiresInDays: 1000, verification: 'verified' },
  { candidate: 66, type: 5,  level: 'level_2',     certificateNo: 'FSH-2025-5540',   issuedDaysAgo: 395,  expiresInDays: 700,  verification: 'verified' },
  { candidate: 67, type: 5,  level: 'level_3',     certificateNo: 'FSH-2024-5122',   issuedDaysAgo: 835,  expiresInDays: 260,  verification: 'verified' },
];

// ── Reports ──────────────────────────────────────────────────────────────────

export type ReportTarget =
  | { kind: 'job'; index: number }
  | { kind: 'candidate'; index: number }
  | { kind: 'application'; index: number }
  | { kind: 'employer'; index: number };

export type Reporter =
  | { kind: 'candidate'; index: number }
  | { kind: 'recruiter'; employer: number; slot: number };

export interface ReportRow {
  target: ReportTarget;
  reason: 'fake_info' | 'harassment' | 'spam' | 'discrimination' | 'other';
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  reporter: Reporter;
}

/** Six reports across all four target types; three still `new` so the queue is not empty. */
export const REPORTS: readonly ReportRow[] = [
  { target: { kind: 'job', index: 31 },         reason: 'fake_info',      status: 'new',           reporter: { kind: 'candidate', index: 66 } },
  { target: { kind: 'employer', index: 11 },    reason: 'spam',           status: 'resolved',      reporter: { kind: 'candidate', index: 3 } },
  { target: { kind: 'candidate', index: 40 },   reason: 'fake_info',      status: 'investigating', reporter: { kind: 'recruiter', employer: 3, slot: 0 } },
  { target: { kind: 'application', index: 57 }, reason: 'harassment',     status: 'new',           reporter: { kind: 'candidate', index: 28 } },
  { target: { kind: 'job', index: 28 },         reason: 'discrimination', status: 'dismissed',     reporter: { kind: 'candidate', index: 60 } },
  { target: { kind: 'employer', index: 9 },     reason: 'other',          status: 'new',           reporter: { kind: 'candidate', index: 5 } },
];
