/**
 * Generated pipeline skeleton — the locale-independent half of the demo seed.
 *
 * Produced once by a deterministic generator (seeded PRNG, constraint checks)
 * and pasted here as LITERAL rows so the app source carries no randomness and
 * no clock: two consecutive builds are byte-identical, and `demo-zh` mirrors
 * `demo-en` row for row because both locales render THIS table.
 *
 * Indexes refer to the aligned arrays in `skeleton.ts` (employers, jobs,
 * skills) and to the per-locale packs (names, titles, cities), which are the
 * same length in every locale.
 *
 * Invariants a reviewer can re-count here:
 *   applications: 200 · applied 88 · screening 46 · interview 28 · offer 14 ·
 *                 hired 9 · rejected 15 · withdrawn 0 · (job, candidate) unique
 *   interviews:   40 · every row on an interview-stage application ·
 *                 day 1–14 from seed time (12 applications carry a round 2)
 *   offers:       14 · one per offer-stage application · 3 pending_approval
 *   inquiries:    8 · all `new` · 5 from people with no candidate row, 3 from
 *                 seeded candidates (converting one attaches to that row) ·
 *                 every job published · 2 Quillstone · 2 Harborline
 */

export type Stage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
export type Source = 'direct' | 'referral' | 'recommendation' | 'agency' | 'import';
export type RejectionReason = 'not_a_fit' | 'insufficient_experience' | 'salary_mismatch' | 'position_filled' | 'candidate_withdrew' | 'other';

export interface ApplicationRow {
  /** Index into the jobs table. */
  job: number;
  /** Index into the candidates table. */
  candidate: number;
  stage: Stage;
  source: Source;
  /** Days before seed time the application was filed (`daysAgo(n)`). */
  appliedDaysAgo: number;
  /** Days before seed time of the last activity — never earlier than the filing. */
  activityDaysAgo: number;
  rating: number | null;
  rejectionReason: RejectionReason | null;
}

export interface InterviewRow {
  /** Index into APPLICATIONS (an interview-stage row). */
  application: number;
  round: number;
  /** Calendar days from seed time, 1–14. */
  day: number;
  hour: number;
  minute: number;
  durationMinutes: number;
  mode: 'onsite' | 'video' | 'phone';
}

export type OfferStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'declined';

export interface OfferRow {
  /** Index into APPLICATIONS (an offer-stage row). */
  application: number;
  status: OfferStatus;
  startInDays: number;
  expiresInDays: number;
}

/**
 * An anonymous public-form application waiting in the `ats_inquiry` queue
 * (#37). Either a person who does not exist as a candidate yet (`new` — the
 * e-mail is `applicantEmail(index)`), or a seeded candidate applying through
 * the public form instead of signing in (`candidate` — conversion then
 * matches the existing row by e-mail rather than creating a second).
 */
export interface InquiryRow {
  /** Index into the jobs table — a PUBLISHED job (the stamp hook refuses anything else). */
  job: number;
  applicant: { kind: 'new'; index: number } | { kind: 'candidate'; index: number };
  /** Days before seed time the form was submitted (`daysAgo(n)`). */
  submittedDaysAgo: number;
}

export const INQUIRIES: readonly InquiryRow[] = [
  /* 0 */ { job: 0,  applicant: { kind: 'new',       index: 0 },  submittedDaysAgo: 1 },
  /* 1 */ { job: 2,  applicant: { kind: 'candidate', index: 14 }, submittedDaysAgo: 2 },
  /* 2 */ { job: 5,  applicant: { kind: 'new',       index: 1 },  submittedDaysAgo: 1 },
  /* 3 */ { job: 7,  applicant: { kind: 'candidate', index: 21 }, submittedDaysAgo: 3 },
  /* 4 */ { job: 10, applicant: { kind: 'new',       index: 2 },  submittedDaysAgo: 2 },
  /* 5 */ { job: 15, applicant: { kind: 'new',       index: 3 },  submittedDaysAgo: 4 },
  /* 6 */ { job: 22, applicant: { kind: 'new',       index: 4 },  submittedDaysAgo: 5 },
  /* 7 */ { job: 27, applicant: { kind: 'candidate', index: 59 }, submittedDaysAgo: 6 },
];

export interface CandidateRow {
  track: 'tech' | 'mfg' | 'health' | 'retail' | 'edu' | 'fin' | 'log' | 'hosp' | 'con';
  experienceYears: number;
  education: 'none' | 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctorate';
  /** Indexes into the skills table. */
  skills: readonly number[];
  seekingStatus: 'actively_looking' | 'open' | 'not_looking';
  profileVisibility: 'public' | 'limited' | 'hidden';
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  salaryPeriod: 'monthly' | 'yearly';
  /** Index into the locale pack's city list. */
  city: number;
}

export const CANDIDATES: readonly CandidateRow[] = [
  /* c01 */ { track: "tech", experienceYears: 14, education: "bachelor", skills: [37, 40], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 6300, expectedSalaryMax: 7800, salaryPeriod: "monthly", city: 0 },
  /* c02 */ { track: "tech", experienceYears: 0, education: "doctorate", skills: [3, 12, 37, 40, 47], seekingStatus: "open", profileVisibility: "hidden", expectedSalaryMin: 40000, expectedSalaryMax: 50600, salaryPeriod: "yearly", city: 1 },
  /* c03 */ { track: "tech", experienceYears: 1, education: "bachelor", skills: [37, 52, 47], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 3400, expectedSalaryMax: 4500, salaryPeriod: "monthly", city: 2 },
  /* c04 */ { track: "tech", experienceYears: 7, education: "bachelor", skills: [4, 40, 45], seekingStatus: "not_looking", profileVisibility: "public", expectedSalaryMin: 71500, expectedSalaryMax: 94700, salaryPeriod: "yearly", city: 3 },
  /* c05 */ { track: "tech", experienceYears: 7, education: "master", skills: [7, 8, 17, 37, 41], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 4700, expectedSalaryMax: 6200, salaryPeriod: "monthly", city: 4 },
  /* c06 */ { track: "tech", experienceYears: 15, education: "bachelor", skills: [10, 11, 17], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 107500, expectedSalaryMax: 137900, salaryPeriod: "yearly", city: 5 },
  /* c07 */ { track: "tech", experienceYears: 6, education: "bachelor", skills: [2, 3, 5, 9, 12, 49], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 4500, expectedSalaryMax: 5900, salaryPeriod: "monthly", city: 6 },
  /* c08 */ { track: "tech", experienceYears: 8, education: "bachelor", skills: [0, 5, 9, 11], seekingStatus: "not_looking", profileVisibility: "limited", expectedSalaryMin: 5000, expectedSalaryMax: 5800, salaryPeriod: "monthly", city: 7 },
  /* c09 */ { track: "tech", experienceYears: 14, education: "doctorate", skills: [5, 11, 17], seekingStatus: "actively_looking", profileVisibility: "hidden", expectedSalaryMin: 6300, expectedSalaryMax: 7400, salaryPeriod: "monthly", city: 8 },
  /* c10 */ { track: "tech", experienceYears: 8, education: "bachelor", skills: [0, 12, 37, 39], seekingStatus: "open", profileVisibility: "public", expectedSalaryMin: 76000, expectedSalaryMax: 101100, salaryPeriod: "yearly", city: 9 },
  /* c11 */ { track: "tech", experienceYears: 6, education: "master", skills: [8, 16, 37, 45], seekingStatus: "actively_looking", profileVisibility: "public", expectedSalaryMin: 67000, expectedSalaryMax: 78200, salaryPeriod: "yearly", city: 10 },
  /* c12 */ { track: "tech", experienceYears: 5, education: "doctorate", skills: [7, 16], seekingStatus: "actively_looking", profileVisibility: "hidden", expectedSalaryMin: 4300, expectedSalaryMax: 5800, salaryPeriod: "monthly", city: 11 },
  /* c13 */ { track: "tech", experienceYears: 6, education: "doctorate", skills: [6, 8, 16, 52], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 4500, expectedSalaryMax: 5700, salaryPeriod: "monthly", city: 0 },
  /* c14 */ { track: "tech", experienceYears: 6, education: "doctorate", skills: [1, 5, 6, 10, 39, 48], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 4500, expectedSalaryMax: 6000, salaryPeriod: "monthly", city: 1 },
  /* c15 */ { track: "mfg", experienceYears: 10, education: "high_school", skills: [14, 36, 53, 44], seekingStatus: "actively_looking", profileVisibility: "public", expectedSalaryMin: 5400, expectedSalaryMax: 6400, salaryPeriod: "monthly", city: 2 },
  /* c16 */ { track: "mfg", experienceYears: 2, education: "high_school", skills: [13, 36, 53, 59], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 3600, expectedSalaryMax: 4600, salaryPeriod: "monthly", city: 3 },
  /* c17 */ { track: "mfg", experienceYears: 6, education: "bachelor", skills: [13, 14, 19, 34], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 4500, expectedSalaryMax: 5400, salaryPeriod: "monthly", city: 4 },
  /* c18 */ { track: "mfg", experienceYears: 14, education: "high_school", skills: [19, 26, 36, 46], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 103000, expectedSalaryMax: 129100, salaryPeriod: "yearly", city: 5 },
  /* c19 */ { track: "mfg", experienceYears: 17, education: "high_school", skills: [14, 19, 34, 53, 59, 48], seekingStatus: "open", profileVisibility: "hidden", expectedSalaryMin: 6900, expectedSalaryMax: 8700, salaryPeriod: "monthly", city: 6 },
  /* c20 */ { track: "mfg", experienceYears: 10, education: "associate", skills: [14, 19, 27, 59], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 5400, expectedSalaryMax: 7200, salaryPeriod: "monthly", city: 7 },
  /* c21 */ { track: "mfg", experienceYears: 17, education: "associate", skills: [14, 26], seekingStatus: "open", profileVisibility: "public", expectedSalaryMin: 6900, expectedSalaryMax: 8800, salaryPeriod: "monthly", city: 8 },
  /* c22 */ { track: "mfg", experienceYears: 3, education: "high_school", skills: [26, 27, 34, 36, 52, 45], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 3900, expectedSalaryMax: 4600, salaryPeriod: "monthly", city: 9 },
  /* c23 */ { track: "mfg", experienceYears: 12, education: "high_school", skills: [26, 34, 48], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 5800, expectedSalaryMax: 6700, salaryPeriod: "monthly", city: 10 },
  /* c24 */ { track: "health", experienceYears: 5, education: "master", skills: [18, 50, 53, 57, 59], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 62500, expectedSalaryMax: 79900, salaryPeriod: "yearly", city: 11 },
  /* c25 */ { track: "health", experienceYears: 10, education: "bachelor", skills: [18, 22, 50], seekingStatus: "open", profileVisibility: "hidden", expectedSalaryMin: 5400, expectedSalaryMax: 7100, salaryPeriod: "monthly", city: 0 },
  /* c26 */ { track: "health", experienceYears: 13, education: "associate", skills: [18, 53, 57, 59], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 6100, expectedSalaryMax: 7600, salaryPeriod: "monthly", city: 1 },
  /* c27 */ { track: "health", experienceYears: 19, education: "associate", skills: [50, 53, 56, 57, 59], seekingStatus: "actively_looking", profileVisibility: "hidden", expectedSalaryMin: 7400, expectedSalaryMax: 9100, salaryPeriod: "monthly", city: 2 },
  /* c28 */ { track: "health", experienceYears: 12, education: "bachelor", skills: [4, 57, 49], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 94000, expectedSalaryMax: 112400, salaryPeriod: "yearly", city: 3 },
  /* c29 */ { track: "health", experienceYears: 0, education: "bachelor", skills: [22, 50, 53, 48], seekingStatus: "open", profileVisibility: "public", expectedSalaryMin: 3200, expectedSalaryMax: 3900, salaryPeriod: "monthly", city: 4 },
  /* c30 */ { track: "health", experienceYears: 9, education: "bachelor", skills: [4, 22, 50, 53], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 5200, expectedSalaryMax: 6800, salaryPeriod: "monthly", city: 5 },
  /* c31 */ { track: "health", experienceYears: 10, education: "master", skills: [50, 59, 45], seekingStatus: "not_looking", profileVisibility: "hidden", expectedSalaryMin: 5400, expectedSalaryMax: 7100, salaryPeriod: "monthly", city: 6 },
  /* c32 */ { track: "health", experienceYears: 17, education: "master", skills: [4, 22, 57, 49], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 6900, expectedSalaryMax: 8500, salaryPeriod: "monthly", city: 7 },
  /* c33 */ { track: "health", experienceYears: 19, education: "bachelor", skills: [4, 18], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 7400, expectedSalaryMax: 9600, salaryPeriod: "monthly", city: 8 },
  /* c34 */ { track: "health", experienceYears: 16, education: "associate", skills: [22, 50, 53], seekingStatus: "not_looking", profileVisibility: "hidden", expectedSalaryMin: 6700, expectedSalaryMax: 9000, salaryPeriod: "monthly", city: 9 },
  /* c35 */ { track: "health", experienceYears: 3, education: "bachelor", skills: [4, 22, 53, 56, 59], seekingStatus: "actively_looking", profileVisibility: "public", expectedSalaryMin: 53500, expectedSalaryMax: 69200, salaryPeriod: "yearly", city: 10 },
  /* c36 */ { track: "retail", experienceYears: 20, education: "bachelor", skills: [33, 35, 44], seekingStatus: "actively_looking", profileVisibility: "public", expectedSalaryMin: 7600, expectedSalaryMax: 9300, salaryPeriod: "monthly", city: 11 },
  /* c37 */ { track: "retail", experienceYears: 4, education: "bachelor", skills: [32, 33, 55, 56], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 4100, expectedSalaryMax: 5400, salaryPeriod: "monthly", city: 0 },
  /* c38 */ { track: "retail", experienceYears: 0, education: "bachelor", skills: [25, 32, 56, 48], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 3200, expectedSalaryMax: 3700, salaryPeriod: "monthly", city: 1 },
  /* c39 */ { track: "retail", experienceYears: 2, education: "associate", skills: [24, 25, 32, 50, 55], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 49000, expectedSalaryMax: 64300, salaryPeriod: "yearly", city: 2 },
  /* c40 */ { track: "retail", experienceYears: 16, education: "bachelor", skills: [24, 55], seekingStatus: "open", profileVisibility: "public", expectedSalaryMin: 6700, expectedSalaryMax: 8000, salaryPeriod: "monthly", city: 3 },
  /* c41 */ { track: "retail", experienceYears: 4, education: "bachelor", skills: [24, 56, 49], seekingStatus: "not_looking", profileVisibility: "limited", expectedSalaryMin: 4100, expectedSalaryMax: 5300, salaryPeriod: "monthly", city: 4 },
  /* c42 */ { track: "retail", experienceYears: 13, education: "bachelor", skills: [33, 35, 50, 56, 44], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 6100, expectedSalaryMax: 8100, salaryPeriod: "monthly", city: 5 },
  /* c43 */ { track: "retail", experienceYears: 5, education: "bachelor", skills: [24, 32, 33, 50, 55], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 4300, expectedSalaryMax: 5600, salaryPeriod: "monthly", city: 6 },
  /* c44 */ { track: "edu", experienceYears: 19, education: "bachelor", skills: [23, 51, 45], seekingStatus: "not_looking", profileVisibility: "limited", expectedSalaryMin: 125500, expectedSalaryMax: 163400, salaryPeriod: "yearly", city: 7 },
  /* c45 */ { track: "edu", experienceYears: 8, education: "master", skills: [54, 58, 44], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 5000, expectedSalaryMax: 6200, salaryPeriod: "monthly", city: 8 },
  /* c46 */ { track: "edu", experienceYears: 5, education: "doctorate", skills: [54, 57, 45], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 62500, expectedSalaryMax: 75800, salaryPeriod: "yearly", city: 9 },
  /* c47 */ { track: "edu", experienceYears: 10, education: "master", skills: [23, 50, 54, 57, 58], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 5400, expectedSalaryMax: 6300, salaryPeriod: "monthly", city: 10 },
  /* c48 */ { track: "edu", experienceYears: 13, education: "bachelor", skills: [38, 58], seekingStatus: "open", profileVisibility: "hidden", expectedSalaryMin: 98500, expectedSalaryMax: 115300, salaryPeriod: "yearly", city: 11 },
  /* c49 */ { track: "edu", experienceYears: 10, education: "doctorate", skills: [51, 54, 58], seekingStatus: "actively_looking", profileVisibility: "public", expectedSalaryMin: 5400, expectedSalaryMax: 7000, salaryPeriod: "monthly", city: 0 },
  /* c50 */ { track: "fin", experienceYears: 0, education: "bachelor", skills: [4, 20, 21, 32, 59], seekingStatus: "open", profileVisibility: "public", expectedSalaryMin: 40000, expectedSalaryMax: 49600, salaryPeriod: "yearly", city: 1 },
  /* c51 */ { track: "fin", experienceYears: 1, education: "bachelor", skills: [4, 42], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 44500, expectedSalaryMax: 52300, salaryPeriod: "yearly", city: 2 },
  /* c52 */ { track: "fin", experienceYears: 13, education: "bachelor", skills: [15, 21, 32, 42], seekingStatus: "not_looking", profileVisibility: "limited", expectedSalaryMin: 6100, expectedSalaryMax: 8100, salaryPeriod: "monthly", city: 3 },
  /* c53 */ { track: "fin", experienceYears: 6, education: "bachelor", skills: [4, 33, 59], seekingStatus: "open", profileVisibility: "public", expectedSalaryMin: 4500, expectedSalaryMax: 5600, salaryPeriod: "monthly", city: 4 },
  /* c54 */ { track: "fin", experienceYears: 11, education: "bachelor", skills: [8, 20, 21, 22, 33], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 5600, expectedSalaryMax: 6900, salaryPeriod: "monthly", city: 5 },
  /* c55 */ { track: "fin", experienceYears: 0, education: "bachelor", skills: [8, 15, 32], seekingStatus: "open", profileVisibility: "hidden", expectedSalaryMin: 3200, expectedSalaryMax: 4100, salaryPeriod: "monthly", city: 6 },
  /* c56 */ { track: "fin", experienceYears: 5, education: "bachelor", skills: [15, 21, 22, 42], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 62500, expectedSalaryMax: 81400, salaryPeriod: "yearly", city: 7 },
  /* c57 */ { track: "fin", experienceYears: 2, education: "master", skills: [8, 15, 20, 21, 42], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 3600, expectedSalaryMax: 4600, salaryPeriod: "monthly", city: 8 },
  /* c58 */ { track: "fin", experienceYears: 5, education: "bachelor", skills: [20, 42, 59], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 62500, expectedSalaryMax: 84200, salaryPeriod: "yearly", city: 9 },
  /* c59 */ { track: "log", experienceYears: 6, education: "associate", skills: [25, 34, 43, 52, 54], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 67000, expectedSalaryMax: 79900, salaryPeriod: "yearly", city: 10 },
  /* c60 */ { track: "log", experienceYears: 19, education: "associate", skills: [19, 54], seekingStatus: "actively_looking", profileVisibility: "public", expectedSalaryMin: 7400, expectedSalaryMax: 9400, salaryPeriod: "monthly", city: 11 },
  /* c61 */ { track: "log", experienceYears: 18, education: "bachelor", skills: [19, 25, 30, 34, 47], seekingStatus: "not_looking", profileVisibility: "hidden", expectedSalaryMin: 7200, expectedSalaryMax: 8900, salaryPeriod: "monthly", city: 0 },
  /* c62 */ { track: "log", experienceYears: 18, education: "high_school", skills: [19, 30, 34, 52, 46], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 7200, expectedSalaryMax: 8500, salaryPeriod: "monthly", city: 1 },
  /* c63 */ { track: "log", experienceYears: 5, education: "high_school", skills: [19, 25, 30, 43, 53, 46], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 4300, expectedSalaryMax: 5600, salaryPeriod: "monthly", city: 2 },
  /* c64 */ { track: "log", experienceYears: 6, education: "associate", skills: [34, 52, 54, 47], seekingStatus: "not_looking", profileVisibility: "public", expectedSalaryMin: 4500, expectedSalaryMax: 6000, salaryPeriod: "monthly", city: 3 },
  /* c65 */ { track: "log", experienceYears: 0, education: "associate", skills: [43, 52, 54], seekingStatus: "actively_looking", profileVisibility: "public", expectedSalaryMin: 3200, expectedSalaryMax: 4100, salaryPeriod: "monthly", city: 4 },
  /* c66 */ { track: "log", experienceYears: 5, education: "bachelor", skills: [19, 25, 43, 52, 54], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 4300, expectedSalaryMax: 5000, salaryPeriod: "monthly", city: 5 },
  /* c67 */ { track: "hosp", experienceYears: 17, education: "high_school", skills: [29, 44, 47, 56, 57], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 6900, expectedSalaryMax: 8200, salaryPeriod: "monthly", city: 6 },
  /* c68 */ { track: "hosp", experienceYears: 17, education: "associate", skills: [50, 54], seekingStatus: "open", profileVisibility: "public", expectedSalaryMin: 6900, expectedSalaryMax: 9200, salaryPeriod: "monthly", city: 7 },
  /* c69 */ { track: "hosp", experienceYears: 1, education: "high_school", skills: [54, 56], seekingStatus: "actively_looking", profileVisibility: "hidden", expectedSalaryMin: 3400, expectedSalaryMax: 4300, salaryPeriod: "monthly", city: 8 },
  /* c70 */ { track: "hosp", experienceYears: 5, education: "bachelor", skills: [29, 47, 54], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 4300, expectedSalaryMax: 5400, salaryPeriod: "monthly", city: 9 },
  /* c71 */ { track: "hosp", experienceYears: 16, education: "bachelor", skills: [44, 53, 56, 57, 47], seekingStatus: "actively_looking", profileVisibility: "public", expectedSalaryMin: 112000, expectedSalaryMax: 140500, salaryPeriod: "yearly", city: 10 },
  /* c72 */ { track: "hosp", experienceYears: 1, education: "bachelor", skills: [47, 53, 56, 57], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 44500, expectedSalaryMax: 59200, salaryPeriod: "yearly", city: 11 },
  /* c73 */ { track: "hosp", experienceYears: 6, education: "associate", skills: [54, 57], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 4500, expectedSalaryMax: 5600, salaryPeriod: "monthly", city: 0 },
  /* c74 */ { track: "con", experienceYears: 15, education: "high_school", skills: [52, 53, 49], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 6500, expectedSalaryMax: 8300, salaryPeriod: "monthly", city: 1 },
  /* c75 */ { track: "con", experienceYears: 19, education: "bachelor", skills: [28, 52, 45], seekingStatus: "open", profileVisibility: "limited", expectedSalaryMin: 7400, expectedSalaryMax: 9400, salaryPeriod: "monthly", city: 2 },
  /* c76 */ { track: "con", experienceYears: 1, education: "bachelor", skills: [14, 36], seekingStatus: "open", profileVisibility: "public", expectedSalaryMin: 3400, expectedSalaryMax: 4400, salaryPeriod: "monthly", city: 3 },
  /* c77 */ { track: "con", experienceYears: 2, education: "associate", skills: [26, 51, 49], seekingStatus: "not_looking", profileVisibility: "hidden", expectedSalaryMin: 3600, expectedSalaryMax: 4500, salaryPeriod: "monthly", city: 4 },
  /* c78 */ { track: "con", experienceYears: 7, education: "associate", skills: [14, 26, 28, 51, 53], seekingStatus: "open", profileVisibility: "public", expectedSalaryMin: 4700, expectedSalaryMax: 6000, salaryPeriod: "monthly", city: 5 },
  /* c79 */ { track: "con", experienceYears: 3, education: "bachelor", skills: [14, 51, 52, 49], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 3900, expectedSalaryMax: 4700, salaryPeriod: "monthly", city: 6 },
  /* c80 */ { track: "con", experienceYears: 14, education: "high_school", skills: [14, 26, 28, 51, 53, 48], seekingStatus: "actively_looking", profileVisibility: "limited", expectedSalaryMin: 6300, expectedSalaryMax: 8100, salaryPeriod: "monthly", city: 7 },
];

export const APPLICATIONS: readonly ApplicationRow[] = [
  /* a000 */ { job: 0, candidate: 0, stage: "hired", source: "referral", appliedDaysAgo: 30, activityDaysAgo: 10, rating: 4, rejectionReason: null },
  /* a001 */ { job: 0, candidate: 3, stage: "offer", source: "direct", appliedDaysAgo: 23, activityDaysAgo: 8, rating: 4, rejectionReason: null },
  /* a002 */ { job: 0, candidate: 4, stage: "interview", source: "referral", appliedDaysAgo: 20, activityDaysAgo: 10, rating: 5, rejectionReason: null },
  /* a003 */ { job: 0, candidate: 5, stage: "applied", source: "referral", appliedDaysAgo: 2, activityDaysAgo: 2, rating: null, rejectionReason: null },
  /* a004 */ { job: 0, candidate: 6, stage: "screening", source: "referral", appliedDaysAgo: 21, activityDaysAgo: 1, rating: null, rejectionReason: null },
  /* a005 */ { job: 0, candidate: 7, stage: "interview", source: "direct", appliedDaysAgo: 32, activityDaysAgo: 4, rating: 4, rejectionReason: null },
  /* a006 */ { job: 0, candidate: 8, stage: "interview", source: "referral", appliedDaysAgo: 25, activityDaysAgo: 11, rating: 4, rejectionReason: null },
  /* a007 */ { job: 0, candidate: 9, stage: "applied", source: "import", appliedDaysAgo: 16, activityDaysAgo: 16, rating: null, rejectionReason: null },
  /* a008 */ { job: 0, candidate: 10, stage: "applied", source: "import", appliedDaysAgo: 8, activityDaysAgo: 8, rating: null, rejectionReason: null },
  /* a009 */ { job: 0, candidate: 12, stage: "screening", source: "direct", appliedDaysAgo: 29, activityDaysAgo: 5, rating: null, rejectionReason: null },
  /* a010 */ { job: 0, candidate: 13, stage: "screening", source: "direct", appliedDaysAgo: 13, activityDaysAgo: 6, rating: 2, rejectionReason: null },
  /* a011 */ { job: 0, candidate: 57, stage: "applied", source: "direct", appliedDaysAgo: 14, activityDaysAgo: 14, rating: null, rejectionReason: null },
  /* a012 */ { job: 1, candidate: 2, stage: "screening", source: "direct", appliedDaysAgo: 28, activityDaysAgo: 10, rating: null, rejectionReason: null },
  /* a013 */ { job: 1, candidate: 7, stage: "screening", source: "direct", appliedDaysAgo: 30, activityDaysAgo: 3, rating: 2, rejectionReason: null },
  /* a014 */ { job: 1, candidate: 8, stage: "rejected", source: "referral", appliedDaysAgo: 52, activityDaysAgo: 7, rating: 3, rejectionReason: "not_a_fit" },
  /* a015 */ { job: 1, candidate: 9, stage: "offer", source: "direct", appliedDaysAgo: 38, activityDaysAgo: 11, rating: 5, rejectionReason: null },
  /* a016 */ { job: 1, candidate: 10, stage: "applied", source: "referral", appliedDaysAgo: 16, activityDaysAgo: 16, rating: null, rejectionReason: null },
  /* a017 */ { job: 1, candidate: 11, stage: "interview", source: "referral", appliedDaysAgo: 40, activityDaysAgo: 5, rating: 5, rejectionReason: null },
  /* a018 */ { job: 1, candidate: 12, stage: "applied", source: "direct", appliedDaysAgo: 11, activityDaysAgo: 11, rating: null, rejectionReason: null },
  /* a019 */ { job: 1, candidate: 56, stage: "screening", source: "agency", appliedDaysAgo: 25, activityDaysAgo: 13, rating: 2, rejectionReason: null },
  /* a020 */ { job: 2, candidate: 1, stage: "interview", source: "recommendation", appliedDaysAgo: 28, activityDaysAgo: 21, rating: 3, rejectionReason: null },
  /* a021 */ { job: 2, candidate: 2, stage: "screening", source: "agency", appliedDaysAgo: 15, activityDaysAgo: 6, rating: 4, rejectionReason: null },
  /* a022 */ { job: 2, candidate: 5, stage: "screening", source: "import", appliedDaysAgo: 23, activityDaysAgo: 8, rating: null, rejectionReason: null },
  /* a023 */ { job: 2, candidate: 6, stage: "applied", source: "import", appliedDaysAgo: 9, activityDaysAgo: 9, rating: null, rejectionReason: null },
  /* a024 */ { job: 2, candidate: 7, stage: "applied", source: "direct", appliedDaysAgo: 12, activityDaysAgo: 12, rating: null, rejectionReason: null },
  /* a025 */ { job: 2, candidate: 10, stage: "applied", source: "direct", appliedDaysAgo: 16, activityDaysAgo: 16, rating: null, rejectionReason: null },
  /* a026 */ { job: 2, candidate: 17, stage: "applied", source: "import", appliedDaysAgo: 9, activityDaysAgo: 9, rating: null, rejectionReason: null },
  /* a027 */ { job: 5, candidate: 10, stage: "applied", source: "direct", appliedDaysAgo: 2, activityDaysAgo: 2, rating: null, rejectionReason: null },
  /* a028 */ { job: 5, candidate: 14, stage: "applied", source: "direct", appliedDaysAgo: 1, activityDaysAgo: 1, rating: null, rejectionReason: null },
  /* a029 */ { job: 5, candidate: 15, stage: "applied", source: "direct", appliedDaysAgo: 15, activityDaysAgo: 15, rating: null, rejectionReason: null },
  /* a030 */ { job: 5, candidate: 17, stage: "offer", source: "recommendation", appliedDaysAgo: 31, activityDaysAgo: 6, rating: 5, rejectionReason: null },
  /* a031 */ { job: 5, candidate: 18, stage: "applied", source: "recommendation", appliedDaysAgo: 18, activityDaysAgo: 18, rating: null, rejectionReason: null },
  /* a032 */ { job: 5, candidate: 19, stage: "applied", source: "referral", appliedDaysAgo: 8, activityDaysAgo: 8, rating: null, rejectionReason: null },
  /* a033 */ { job: 5, candidate: 20, stage: "interview", source: "referral", appliedDaysAgo: 34, activityDaysAgo: 5, rating: 5, rejectionReason: null },
  /* a034 */ { job: 5, candidate: 22, stage: "screening", source: "referral", appliedDaysAgo: 23, activityDaysAgo: 11, rating: 2, rejectionReason: null },
  /* a035 */ { job: 6, candidate: 14, stage: "offer", source: "referral", appliedDaysAgo: 40, activityDaysAgo: 19, rating: 4, rejectionReason: null },
  /* a036 */ { job: 6, candidate: 18, stage: "applied", source: "direct", appliedDaysAgo: 1, activityDaysAgo: 1, rating: null, rejectionReason: null },
  /* a037 */ { job: 6, candidate: 19, stage: "screening", source: "referral", appliedDaysAgo: 22, activityDaysAgo: 9, rating: null, rejectionReason: null },
  /* a038 */ { job: 6, candidate: 21, stage: "applied", source: "direct", appliedDaysAgo: 20, activityDaysAgo: 20, rating: null, rejectionReason: null },
  /* a039 */ { job: 6, candidate: 24, stage: "interview", source: "referral", appliedDaysAgo: 33, activityDaysAgo: 24, rating: 3, rejectionReason: null },
  /* a040 */ { job: 6, candidate: 51, stage: "screening", source: "referral", appliedDaysAgo: 9, activityDaysAgo: 5, rating: null, rejectionReason: null },
  /* a041 */ { job: 6, candidate: 66, stage: "screening", source: "direct", appliedDaysAgo: 5, activityDaysAgo: 2, rating: 2, rejectionReason: null },
  /* a042 */ { job: 7, candidate: 14, stage: "screening", source: "agency", appliedDaysAgo: 12, activityDaysAgo: 8, rating: 3, rejectionReason: null },
  /* a043 */ { job: 7, candidate: 16, stage: "screening", source: "import", appliedDaysAgo: 25, activityDaysAgo: 8, rating: 3, rejectionReason: null },
  /* a044 */ { job: 7, candidate: 18, stage: "interview", source: "direct", appliedDaysAgo: 22, activityDaysAgo: 1, rating: 3, rejectionReason: null },
  /* a045 */ { job: 7, candidate: 19, stage: "applied", source: "recommendation", appliedDaysAgo: 13, activityDaysAgo: 13, rating: null, rejectionReason: null },
  /* a046 */ { job: 7, candidate: 20, stage: "applied", source: "referral", appliedDaysAgo: 11, activityDaysAgo: 11, rating: null, rejectionReason: null },
  /* a047 */ { job: 7, candidate: 75, stage: "applied", source: "referral", appliedDaysAgo: 12, activityDaysAgo: 12, rating: null, rejectionReason: null },
  /* a048 */ { job: 8, candidate: 14, stage: "applied", source: "recommendation", appliedDaysAgo: 5, activityDaysAgo: 5, rating: null, rejectionReason: null },
  /* a049 */ { job: 8, candidate: 15, stage: "applied", source: "direct", appliedDaysAgo: 10, activityDaysAgo: 10, rating: null, rejectionReason: null },
  /* a050 */ { job: 8, candidate: 16, stage: "applied", source: "import", appliedDaysAgo: 12, activityDaysAgo: 12, rating: null, rejectionReason: null },
  /* a051 */ { job: 8, candidate: 19, stage: "screening", source: "import", appliedDaysAgo: 8, activityDaysAgo: 1, rating: 4, rejectionReason: null },
  /* a052 */ { job: 8, candidate: 20, stage: "applied", source: "direct", appliedDaysAgo: 4, activityDaysAgo: 4, rating: null, rejectionReason: null },
  /* a053 */ { job: 9, candidate: 15, stage: "hired", source: "direct", appliedDaysAgo: 58, activityDaysAgo: 32, rating: 4, rejectionReason: null },
  /* a054 */ { job: 9, candidate: 17, stage: "rejected", source: "direct", appliedDaysAgo: 31, activityDaysAgo: 15, rating: 2, rejectionReason: "insufficient_experience" },
  /* a055 */ { job: 9, candidate: 19, stage: "rejected", source: "direct", appliedDaysAgo: 26, activityDaysAgo: 11, rating: 2, rejectionReason: "position_filled" },
  /* a056 */ { job: 9, candidate: 21, stage: "hired", source: "direct", appliedDaysAgo: 58, activityDaysAgo: 22, rating: 4, rejectionReason: null },
  /* a057 */ { job: 9, candidate: 22, stage: "rejected", source: "recommendation", appliedDaysAgo: 36, activityDaysAgo: 18, rating: 2, rejectionReason: "insufficient_experience" },
  /* a058 */ { job: 10, candidate: 13, stage: "applied", source: "agency", appliedDaysAgo: 8, activityDaysAgo: 8, rating: null, rejectionReason: null },
  /* a059 */ { job: 10, candidate: 23, stage: "screening", source: "direct", appliedDaysAgo: 10, activityDaysAgo: 8, rating: 2, rejectionReason: null },
  /* a060 */ { job: 10, candidate: 24, stage: "hired", source: "direct", appliedDaysAgo: 58, activityDaysAgo: 15, rating: 4, rejectionReason: null },
  /* a061 */ { job: 10, candidate: 25, stage: "rejected", source: "direct", appliedDaysAgo: 40, activityDaysAgo: 32, rating: 3, rejectionReason: "insufficient_experience" },
  /* a062 */ { job: 10, candidate: 26, stage: "offer", source: "direct", appliedDaysAgo: 28, activityDaysAgo: 3, rating: 4, rejectionReason: null },
  /* a063 */ { job: 10, candidate: 27, stage: "interview", source: "direct", appliedDaysAgo: 15, activityDaysAgo: 5, rating: 4, rejectionReason: null },
  /* a064 */ { job: 10, candidate: 29, stage: "applied", source: "direct", appliedDaysAgo: 18, activityDaysAgo: 18, rating: null, rejectionReason: null },
  /* a065 */ { job: 10, candidate: 30, stage: "applied", source: "direct", appliedDaysAgo: 1, activityDaysAgo: 1, rating: null, rejectionReason: null },
  /* a066 */ { job: 10, candidate: 33, stage: "interview", source: "direct", appliedDaysAgo: 22, activityDaysAgo: 2, rating: 4, rejectionReason: null },
  /* a067 */ { job: 10, candidate: 34, stage: "interview", source: "direct", appliedDaysAgo: 33, activityDaysAgo: 9, rating: 4, rejectionReason: null },
  /* a068 */ { job: 10, candidate: 63, stage: "applied", source: "direct", appliedDaysAgo: 9, activityDaysAgo: 9, rating: null, rejectionReason: null },
  /* a069 */ { job: 10, candidate: 76, stage: "applied", source: "direct", appliedDaysAgo: 3, activityDaysAgo: 3, rating: null, rejectionReason: null },
  /* a070 */ { job: 11, candidate: 27, stage: "screening", source: "recommendation", appliedDaysAgo: 16, activityDaysAgo: 7, rating: 3, rejectionReason: null },
  /* a071 */ { job: 11, candidate: 29, stage: "offer", source: "direct", appliedDaysAgo: 44, activityDaysAgo: 34, rating: 5, rejectionReason: null },
  /* a072 */ { job: 11, candidate: 30, stage: "applied", source: "agency", appliedDaysAgo: 4, activityDaysAgo: 4, rating: null, rejectionReason: null },
  /* a073 */ { job: 11, candidate: 31, stage: "applied", source: "recommendation", appliedDaysAgo: 15, activityDaysAgo: 15, rating: null, rejectionReason: null },
  /* a074 */ { job: 11, candidate: 32, stage: "interview", source: "recommendation", appliedDaysAgo: 20, activityDaysAgo: 5, rating: 4, rejectionReason: null },
  /* a075 */ { job: 11, candidate: 33, stage: "applied", source: "direct", appliedDaysAgo: 3, activityDaysAgo: 3, rating: null, rejectionReason: null },
  /* a076 */ { job: 11, candidate: 53, stage: "applied", source: "direct", appliedDaysAgo: 5, activityDaysAgo: 5, rating: null, rejectionReason: null },
  /* a077 */ { job: 11, candidate: 56, stage: "applied", source: "direct", appliedDaysAgo: 7, activityDaysAgo: 7, rating: null, rejectionReason: null },
  /* a078 */ { job: 12, candidate: 23, stage: "offer", source: "import", appliedDaysAgo: 25, activityDaysAgo: 11, rating: 5, rejectionReason: null },
  /* a079 */ { job: 12, candidate: 25, stage: "interview", source: "direct", appliedDaysAgo: 37, activityDaysAgo: 18, rating: 5, rejectionReason: null },
  /* a080 */ { job: 12, candidate: 27, stage: "screening", source: "direct", appliedDaysAgo: 27, activityDaysAgo: 8, rating: null, rejectionReason: null },
  /* a081 */ { job: 12, candidate: 28, stage: "screening", source: "direct", appliedDaysAgo: 20, activityDaysAgo: 17, rating: 2, rejectionReason: null },
  /* a082 */ { job: 12, candidate: 30, stage: "screening", source: "direct", appliedDaysAgo: 22, activityDaysAgo: 12, rating: 2, rejectionReason: null },
  /* a083 */ { job: 12, candidate: 31, stage: "applied", source: "direct", appliedDaysAgo: 4, activityDaysAgo: 4, rating: null, rejectionReason: null },
  /* a084 */ { job: 12, candidate: 33, stage: "applied", source: "referral", appliedDaysAgo: 16, activityDaysAgo: 16, rating: null, rejectionReason: null },
  /* a085 */ { job: 15, candidate: 20, stage: "applied", source: "direct", appliedDaysAgo: 17, activityDaysAgo: 17, rating: null, rejectionReason: null },
  /* a086 */ { job: 15, candidate: 35, stage: "applied", source: "recommendation", appliedDaysAgo: 13, activityDaysAgo: 13, rating: null, rejectionReason: null },
  /* a087 */ { job: 15, candidate: 36, stage: "offer", source: "referral", appliedDaysAgo: 38, activityDaysAgo: 21, rating: 5, rejectionReason: null },
  /* a088 */ { job: 15, candidate: 38, stage: "screening", source: "direct", appliedDaysAgo: 17, activityDaysAgo: 14, rating: 4, rejectionReason: null },
  /* a089 */ { job: 15, candidate: 39, stage: "applied", source: "import", appliedDaysAgo: 3, activityDaysAgo: 3, rating: null, rejectionReason: null },
  /* a090 */ { job: 15, candidate: 40, stage: "interview", source: "agency", appliedDaysAgo: 15, activityDaysAgo: 9, rating: 4, rejectionReason: null },
  /* a091 */ { job: 15, candidate: 41, stage: "applied", source: "direct", appliedDaysAgo: 14, activityDaysAgo: 14, rating: null, rejectionReason: null },
  /* a092 */ { job: 15, candidate: 42, stage: "applied", source: "import", appliedDaysAgo: 6, activityDaysAgo: 6, rating: null, rejectionReason: null },
  /* a093 */ { job: 16, candidate: 36, stage: "screening", source: "direct", appliedDaysAgo: 29, activityDaysAgo: 1, rating: null, rejectionReason: null },
  /* a094 */ { job: 16, candidate: 38, stage: "interview", source: "recommendation", appliedDaysAgo: 30, activityDaysAgo: 22, rating: 4, rejectionReason: null },
  /* a095 */ { job: 16, candidate: 39, stage: "applied", source: "direct", appliedDaysAgo: 16, activityDaysAgo: 16, rating: null, rejectionReason: null },
  /* a096 */ { job: 16, candidate: 41, stage: "screening", source: "referral", appliedDaysAgo: 24, activityDaysAgo: 18, rating: null, rejectionReason: null },
  /* a097 */ { job: 16, candidate: 42, stage: "applied", source: "direct", appliedDaysAgo: 12, activityDaysAgo: 12, rating: null, rejectionReason: null },
  /* a098 */ { job: 16, candidate: 49, stage: "applied", source: "direct", appliedDaysAgo: 11, activityDaysAgo: 11, rating: null, rejectionReason: null },
  /* a099 */ { job: 17, candidate: 35, stage: "hired", source: "direct", appliedDaysAgo: 49, activityDaysAgo: 6, rating: 5, rejectionReason: null },
  /* a100 */ { job: 17, candidate: 37, stage: "hired", source: "referral", appliedDaysAgo: 36, activityDaysAgo: 3, rating: 4, rejectionReason: null },
  /* a101 */ { job: 17, candidate: 39, stage: "rejected", source: "direct", appliedDaysAgo: 20, activityDaysAgo: 16, rating: null, rejectionReason: "position_filled" },
  /* a102 */ { job: 17, candidate: 40, stage: "rejected", source: "agency", appliedDaysAgo: 34, activityDaysAgo: 11, rating: 1, rejectionReason: "position_filled" },
  /* a103 */ { job: 19, candidate: 3, stage: "applied", source: "recommendation", appliedDaysAgo: 10, activityDaysAgo: 10, rating: null, rejectionReason: null },
  /* a104 */ { job: 19, candidate: 33, stage: "applied", source: "referral", appliedDaysAgo: 6, activityDaysAgo: 6, rating: null, rejectionReason: null },
  /* a105 */ { job: 19, candidate: 43, stage: "screening", source: "direct", appliedDaysAgo: 16, activityDaysAgo: 2, rating: 2, rejectionReason: null },
  /* a106 */ { job: 19, candidate: 44, stage: "offer", source: "recommendation", appliedDaysAgo: 24, activityDaysAgo: 12, rating: 5, rejectionReason: null },
  /* a107 */ { job: 19, candidate: 45, stage: "interview", source: "referral", appliedDaysAgo: 22, activityDaysAgo: 15, rating: 4, rejectionReason: null },
  /* a108 */ { job: 19, candidate: 46, stage: "screening", source: "referral", appliedDaysAgo: 30, activityDaysAgo: 22, rating: null, rejectionReason: null },
  /* a109 */ { job: 19, candidate: 47, stage: "screening", source: "import", appliedDaysAgo: 16, activityDaysAgo: 1, rating: null, rejectionReason: null },
  /* a110 */ { job: 20, candidate: 40, stage: "applied", source: "agency", appliedDaysAgo: 10, activityDaysAgo: 10, rating: null, rejectionReason: null },
  /* a111 */ { job: 20, candidate: 43, stage: "interview", source: "import", appliedDaysAgo: 29, activityDaysAgo: 12, rating: 5, rejectionReason: null },
  /* a112 */ { job: 20, candidate: 45, stage: "applied", source: "direct", appliedDaysAgo: 13, activityDaysAgo: 13, rating: null, rejectionReason: null },
  /* a113 */ { job: 20, candidate: 47, stage: "applied", source: "recommendation", appliedDaysAgo: 19, activityDaysAgo: 19, rating: null, rejectionReason: null },
  /* a114 */ { job: 20, candidate: 48, stage: "screening", source: "direct", appliedDaysAgo: 11, activityDaysAgo: 2, rating: 4, rejectionReason: null },
  /* a115 */ { job: 20, candidate: 79, stage: "screening", source: "direct", appliedDaysAgo: 28, activityDaysAgo: 2, rating: null, rejectionReason: null },
  /* a116 */ { job: 22, candidate: 5, stage: "rejected", source: "direct", appliedDaysAgo: 46, activityDaysAgo: 14, rating: 1, rejectionReason: "position_filled" },
  /* a117 */ { job: 22, candidate: 12, stage: "applied", source: "direct", appliedDaysAgo: 12, activityDaysAgo: 12, rating: null, rejectionReason: null },
  /* a118 */ { job: 22, candidate: 13, stage: "applied", source: "referral", appliedDaysAgo: 3, activityDaysAgo: 3, rating: null, rejectionReason: null },
  /* a119 */ { job: 22, candidate: 29, stage: "interview", source: "direct", appliedDaysAgo: 30, activityDaysAgo: 12, rating: 3, rejectionReason: null },
  /* a120 */ { job: 22, candidate: 41, stage: "applied", source: "direct", appliedDaysAgo: 10, activityDaysAgo: 10, rating: null, rejectionReason: null },
  /* a121 */ { job: 22, candidate: 49, stage: "hired", source: "direct", appliedDaysAgo: 66, activityDaysAgo: 33, rating: 5, rejectionReason: null },
  /* a122 */ { job: 22, candidate: 50, stage: "applied", source: "referral", appliedDaysAgo: 18, activityDaysAgo: 18, rating: null, rejectionReason: null },
  /* a123 */ { job: 22, candidate: 51, stage: "offer", source: "direct", appliedDaysAgo: 49, activityDaysAgo: 8, rating: 4, rejectionReason: null },
  /* a124 */ { job: 22, candidate: 52, stage: "applied", source: "direct", appliedDaysAgo: 1, activityDaysAgo: 1, rating: null, rejectionReason: null },
  /* a125 */ { job: 22, candidate: 54, stage: "screening", source: "direct", appliedDaysAgo: 17, activityDaysAgo: 10, rating: null, rejectionReason: null },
  /* a126 */ { job: 22, candidate: 57, stage: "interview", source: "direct", appliedDaysAgo: 21, activityDaysAgo: 12, rating: 5, rejectionReason: null },
  /* a127 */ { job: 23, candidate: 49, stage: "screening", source: "referral", appliedDaysAgo: 29, activityDaysAgo: 15, rating: 2, rejectionReason: null },
  /* a128 */ { job: 23, candidate: 50, stage: "offer", source: "recommendation", appliedDaysAgo: 33, activityDaysAgo: 5, rating: 5, rejectionReason: null },
  /* a129 */ { job: 23, candidate: 51, stage: "interview", source: "direct", appliedDaysAgo: 26, activityDaysAgo: 14, rating: 5, rejectionReason: null },
  /* a130 */ { job: 23, candidate: 52, stage: "screening", source: "direct", appliedDaysAgo: 17, activityDaysAgo: 9, rating: 4, rejectionReason: null },
  /* a131 */ { job: 23, candidate: 55, stage: "applied", source: "direct", appliedDaysAgo: 15, activityDaysAgo: 15, rating: null, rejectionReason: null },
  /* a132 */ { job: 23, candidate: 57, stage: "screening", source: "direct", appliedDaysAgo: 7, activityDaysAgo: 3, rating: 2, rejectionReason: null },
  /* a133 */ { job: 23, candidate: 59, stage: "applied", source: "direct", appliedDaysAgo: 13, activityDaysAgo: 13, rating: null, rejectionReason: null },
  /* a134 */ { job: 24, candidate: 52, stage: "applied", source: "agency", appliedDaysAgo: 6, activityDaysAgo: 6, rating: null, rejectionReason: null },
  /* a135 */ { job: 24, candidate: 53, stage: "applied", source: "direct", appliedDaysAgo: 6, activityDaysAgo: 6, rating: null, rejectionReason: null },
  /* a136 */ { job: 24, candidate: 54, stage: "applied", source: "referral", appliedDaysAgo: 7, activityDaysAgo: 7, rating: null, rejectionReason: null },
  /* a137 */ { job: 24, candidate: 55, stage: "screening", source: "direct", appliedDaysAgo: 27, activityDaysAgo: 5, rating: null, rejectionReason: null },
  /* a138 */ { job: 24, candidate: 56, stage: "applied", source: "direct", appliedDaysAgo: 7, activityDaysAgo: 7, rating: null, rejectionReason: null },
  /* a139 */ { job: 26, candidate: 20, stage: "applied", source: "recommendation", appliedDaysAgo: 12, activityDaysAgo: 12, rating: null, rejectionReason: null },
  /* a140 */ { job: 26, candidate: 60, stage: "offer", source: "direct", appliedDaysAgo: 33, activityDaysAgo: 3, rating: 5, rejectionReason: null },
  /* a141 */ { job: 26, candidate: 61, stage: "rejected", source: "direct", appliedDaysAgo: 55, activityDaysAgo: 34, rating: 2, rejectionReason: "salary_mismatch" },
  /* a142 */ { job: 26, candidate: 62, stage: "applied", source: "import", appliedDaysAgo: 9, activityDaysAgo: 9, rating: null, rejectionReason: null },
  /* a143 */ { job: 26, candidate: 63, stage: "interview", source: "direct", appliedDaysAgo: 29, activityDaysAgo: 15, rating: 4, rejectionReason: null },
  /* a144 */ { job: 26, candidate: 64, stage: "screening", source: "direct", appliedDaysAgo: 16, activityDaysAgo: 9, rating: null, rejectionReason: null },
  /* a145 */ { job: 26, candidate: 65, stage: "applied", source: "recommendation", appliedDaysAgo: 17, activityDaysAgo: 17, rating: null, rejectionReason: null },
  /* a146 */ { job: 27, candidate: 32, stage: "rejected", source: "direct", appliedDaysAgo: 16, activityDaysAgo: 10, rating: 2, rejectionReason: "not_a_fit" },
  /* a147 */ { job: 27, candidate: 58, stage: "screening", source: "direct", appliedDaysAgo: 7, activityDaysAgo: 5, rating: null, rejectionReason: null },
  /* a148 */ { job: 27, candidate: 59, stage: "interview", source: "referral", appliedDaysAgo: 19, activityDaysAgo: 7, rating: 4, rejectionReason: null },
  /* a149 */ { job: 27, candidate: 60, stage: "applied", source: "direct", appliedDaysAgo: 12, activityDaysAgo: 12, rating: null, rejectionReason: null },
  /* a150 */ { job: 27, candidate: 61, stage: "applied", source: "direct", appliedDaysAgo: 14, activityDaysAgo: 14, rating: null, rejectionReason: null },
  /* a151 */ { job: 27, candidate: 64, stage: "applied", source: "referral", appliedDaysAgo: 2, activityDaysAgo: 2, rating: null, rejectionReason: null },
  /* a152 */ { job: 27, candidate: 65, stage: "applied", source: "direct", appliedDaysAgo: 2, activityDaysAgo: 2, rating: null, rejectionReason: null },
  /* a153 */ { job: 28, candidate: 23, stage: "screening", source: "import", appliedDaysAgo: 13, activityDaysAgo: 4, rating: 2, rejectionReason: null },
  /* a154 */ { job: 28, candidate: 55, stage: "screening", source: "direct", appliedDaysAgo: 23, activityDaysAgo: 6, rating: 4, rejectionReason: null },
  /* a155 */ { job: 28, candidate: 58, stage: "interview", source: "direct", appliedDaysAgo: 31, activityDaysAgo: 2, rating: 4, rejectionReason: null },
  /* a156 */ { job: 28, candidate: 59, stage: "applied", source: "import", appliedDaysAgo: 20, activityDaysAgo: 20, rating: null, rejectionReason: null },
  /* a157 */ { job: 28, candidate: 60, stage: "screening", source: "direct", appliedDaysAgo: 27, activityDaysAgo: 24, rating: 3, rejectionReason: null },
  /* a158 */ { job: 28, candidate: 61, stage: "applied", source: "recommendation", appliedDaysAgo: 7, activityDaysAgo: 7, rating: null, rejectionReason: null },
  /* a159 */ { job: 28, candidate: 62, stage: "applied", source: "import", appliedDaysAgo: 6, activityDaysAgo: 6, rating: null, rejectionReason: null },
  /* a160 */ { job: 28, candidate: 67, stage: "screening", source: "direct", appliedDaysAgo: 18, activityDaysAgo: 16, rating: 4, rejectionReason: null },
  /* a161 */ { job: 29, candidate: 56, stage: "rejected", source: "direct", appliedDaysAgo: 58, activityDaysAgo: 7, rating: 2, rejectionReason: "other" },
  /* a162 */ { job: 29, candidate: 61, stage: "rejected", source: "agency", appliedDaysAgo: 26, activityDaysAgo: 5, rating: 1, rejectionReason: "position_filled" },
  /* a163 */ { job: 29, candidate: 62, stage: "hired", source: "direct", appliedDaysAgo: 66, activityDaysAgo: 26, rating: 5, rejectionReason: null },
  /* a164 */ { job: 29, candidate: 64, stage: "hired", source: "referral", appliedDaysAgo: 30, activityDaysAgo: 6, rating: 4, rejectionReason: null },
  /* a165 */ { job: 29, candidate: 71, stage: "rejected", source: "direct", appliedDaysAgo: 50, activityDaysAgo: 33, rating: null, rejectionReason: "position_filled" },
  /* a166 */ { job: 30, candidate: 66, stage: "interview", source: "referral", appliedDaysAgo: 39, activityDaysAgo: 18, rating: 5, rejectionReason: null },
  /* a167 */ { job: 30, candidate: 67, stage: "applied", source: "recommendation", appliedDaysAgo: 7, activityDaysAgo: 7, rating: null, rejectionReason: null },
  /* a168 */ { job: 30, candidate: 68, stage: "screening", source: "direct", appliedDaysAgo: 29, activityDaysAgo: 9, rating: null, rejectionReason: null },
  /* a169 */ { job: 30, candidate: 69, stage: "applied", source: "direct", appliedDaysAgo: 11, activityDaysAgo: 11, rating: null, rejectionReason: null },
  /* a170 */ { job: 30, candidate: 71, stage: "rejected", source: "direct", appliedDaysAgo: 13, activityDaysAgo: 10, rating: 2, rejectionReason: "position_filled" },
  /* a171 */ { job: 30, candidate: 72, stage: "applied", source: "import", appliedDaysAgo: 12, activityDaysAgo: 12, rating: null, rejectionReason: null },
  /* a172 */ { job: 31, candidate: 12, stage: "applied", source: "direct", appliedDaysAgo: 4, activityDaysAgo: 4, rating: null, rejectionReason: null },
  /* a173 */ { job: 31, candidate: 21, stage: "applied", source: "agency", appliedDaysAgo: 9, activityDaysAgo: 9, rating: null, rejectionReason: null },
  /* a174 */ { job: 31, candidate: 40, stage: "applied", source: "import", appliedDaysAgo: 3, activityDaysAgo: 3, rating: null, rejectionReason: null },
  /* a175 */ { job: 31, candidate: 63, stage: "rejected", source: "direct", appliedDaysAgo: 55, activityDaysAgo: 39, rating: null, rejectionReason: "position_filled" },
  /* a176 */ { job: 31, candidate: 66, stage: "screening", source: "referral", appliedDaysAgo: 8, activityDaysAgo: 1, rating: 2, rejectionReason: null },
  /* a177 */ { job: 31, candidate: 67, stage: "applied", source: "direct", appliedDaysAgo: 3, activityDaysAgo: 3, rating: null, rejectionReason: null },
  /* a178 */ { job: 31, candidate: 68, stage: "applied", source: "direct", appliedDaysAgo: 1, activityDaysAgo: 1, rating: null, rejectionReason: null },
  /* a179 */ { job: 31, candidate: 69, stage: "applied", source: "direct", appliedDaysAgo: 11, activityDaysAgo: 11, rating: null, rejectionReason: null },
  /* a180 */ { job: 31, candidate: 70, stage: "offer", source: "direct", appliedDaysAgo: 20, activityDaysAgo: 9, rating: 4, rejectionReason: null },
  /* a181 */ { job: 31, candidate: 71, stage: "interview", source: "direct", appliedDaysAgo: 22, activityDaysAgo: 8, rating: 3, rejectionReason: null },
  /* a182 */ { job: 31, candidate: 72, stage: "interview", source: "recommendation", appliedDaysAgo: 35, activityDaysAgo: 12, rating: 5, rejectionReason: null },
  /* a183 */ { job: 33, candidate: 16, stage: "screening", source: "direct", appliedDaysAgo: 14, activityDaysAgo: 10, rating: 3, rejectionReason: null },
  /* a184 */ { job: 33, candidate: 73, stage: "applied", source: "referral", appliedDaysAgo: 1, activityDaysAgo: 1, rating: null, rejectionReason: null },
  /* a185 */ { job: 33, candidate: 74, stage: "applied", source: "direct", appliedDaysAgo: 7, activityDaysAgo: 7, rating: null, rejectionReason: null },
  /* a186 */ { job: 33, candidate: 75, stage: "offer", source: "recommendation", appliedDaysAgo: 41, activityDaysAgo: 24, rating: 5, rejectionReason: null },
  /* a187 */ { job: 33, candidate: 76, stage: "applied", source: "direct", appliedDaysAgo: 18, activityDaysAgo: 18, rating: null, rejectionReason: null },
  /* a188 */ { job: 33, candidate: 78, stage: "interview", source: "recommendation", appliedDaysAgo: 19, activityDaysAgo: 3, rating: 3, rejectionReason: null },
  /* a189 */ { job: 33, candidate: 79, stage: "applied", source: "referral", appliedDaysAgo: 6, activityDaysAgo: 6, rating: null, rejectionReason: null },
  /* a190 */ { job: 34, candidate: 68, stage: "applied", source: "referral", appliedDaysAgo: 17, activityDaysAgo: 17, rating: null, rejectionReason: null },
  /* a191 */ { job: 34, candidate: 73, stage: "interview", source: "direct", appliedDaysAgo: 28, activityDaysAgo: 15, rating: 3, rejectionReason: null },
  /* a192 */ { job: 34, candidate: 74, stage: "applied", source: "direct", appliedDaysAgo: 19, activityDaysAgo: 19, rating: null, rejectionReason: null },
  /* a193 */ { job: 34, candidate: 76, stage: "applied", source: "direct", appliedDaysAgo: 14, activityDaysAgo: 14, rating: null, rejectionReason: null },
  /* a194 */ { job: 34, candidate: 77, stage: "screening", source: "direct", appliedDaysAgo: 9, activityDaysAgo: 6, rating: null, rejectionReason: null },
  /* a195 */ { job: 34, candidate: 78, stage: "screening", source: "import", appliedDaysAgo: 11, activityDaysAgo: 8, rating: null, rejectionReason: null },
  /* a196 */ { job: 35, candidate: 44, stage: "applied", source: "direct", appliedDaysAgo: 4, activityDaysAgo: 4, rating: null, rejectionReason: null },
  /* a197 */ { job: 35, candidate: 50, stage: "applied", source: "import", appliedDaysAgo: 14, activityDaysAgo: 14, rating: null, rejectionReason: null },
  /* a198 */ { job: 35, candidate: 74, stage: "screening", source: "direct", appliedDaysAgo: 23, activityDaysAgo: 8, rating: 4, rejectionReason: null },
  /* a199 */ { job: 35, candidate: 77, stage: "screening", source: "direct", appliedDaysAgo: 30, activityDaysAgo: 7, rating: null, rejectionReason: null },
];

export const INTERVIEWS: readonly InterviewRow[] = [
  { application: 2, round: 1, day: 1, hour: 9, minute: 0, durationMinutes: 45, mode: "video" },
  { application: 2, round: 2, day: 6, hour: 13, minute: 0, durationMinutes: 60, mode: "onsite" },
  { application: 5, round: 1, day: 2, hour: 10, minute: 30, durationMinutes: 60, mode: "onsite" },
  { application: 5, round: 2, day: 7, hour: 14, minute: 0, durationMinutes: 60, mode: "phone" },
  { application: 6, round: 1, day: 3, hour: 11, minute: 0, durationMinutes: 60, mode: "phone" },
  { application: 6, round: 2, day: 8, hour: 15, minute: 0, durationMinutes: 60, mode: "video" },
  { application: 17, round: 1, day: 4, hour: 13, minute: 30, durationMinutes: 90, mode: "video" },
  { application: 17, round: 2, day: 9, hour: 16, minute: 0, durationMinutes: 60, mode: "onsite" },
  { application: 20, round: 1, day: 5, hour: 14, minute: 0, durationMinutes: 45, mode: "onsite" },
  { application: 20, round: 2, day: 10, hour: 9, minute: 0, durationMinutes: 60, mode: "video" },
  { application: 33, round: 1, day: 6, hour: 15, minute: 30, durationMinutes: 60, mode: "video" },
  { application: 33, round: 2, day: 11, hour: 10, minute: 0, durationMinutes: 60, mode: "video" },
  { application: 39, round: 1, day: 7, hour: 16, minute: 0, durationMinutes: 60, mode: "video" },
  { application: 39, round: 2, day: 12, hour: 11, minute: 0, durationMinutes: 60, mode: "onsite" },
  { application: 44, round: 1, day: 8, hour: 9, minute: 30, durationMinutes: 90, mode: "onsite" },
  { application: 44, round: 2, day: 13, hour: 13, minute: 0, durationMinutes: 60, mode: "phone" },
  { application: 63, round: 1, day: 1, hour: 10, minute: 0, durationMinutes: 45, mode: "phone" },
  { application: 63, round: 2, day: 6, hour: 14, minute: 0, durationMinutes: 60, mode: "video" },
  { application: 66, round: 1, day: 2, hour: 11, minute: 30, durationMinutes: 60, mode: "video" },
  { application: 66, round: 2, day: 7, hour: 15, minute: 0, durationMinutes: 60, mode: "onsite" },
  { application: 67, round: 1, day: 3, hour: 13, minute: 0, durationMinutes: 60, mode: "onsite" },
  { application: 67, round: 2, day: 8, hour: 16, minute: 0, durationMinutes: 60, mode: "video" },
  { application: 74, round: 1, day: 4, hour: 14, minute: 30, durationMinutes: 90, mode: "video" },
  { application: 74, round: 2, day: 9, hour: 9, minute: 0, durationMinutes: 60, mode: "video" },
  { application: 79, round: 1, day: 13, hour: 15, minute: 0, durationMinutes: 45, mode: "video" },
  { application: 90, round: 1, day: 14, hour: 16, minute: 30, durationMinutes: 60, mode: "onsite" },
  { application: 94, round: 1, day: 1, hour: 9, minute: 0, durationMinutes: 60, mode: "phone" },
  { application: 107, round: 1, day: 2, hour: 10, minute: 30, durationMinutes: 90, mode: "video" },
  { application: 111, round: 1, day: 3, hour: 11, minute: 0, durationMinutes: 45, mode: "onsite" },
  { application: 119, round: 1, day: 4, hour: 13, minute: 30, durationMinutes: 60, mode: "video" },
  { application: 126, round: 1, day: 5, hour: 14, minute: 0, durationMinutes: 60, mode: "video" },
  { application: 129, round: 1, day: 6, hour: 15, minute: 30, durationMinutes: 90, mode: "onsite" },
  { application: 143, round: 1, day: 7, hour: 16, minute: 0, durationMinutes: 45, mode: "phone" },
  { application: 148, round: 1, day: 8, hour: 9, minute: 30, durationMinutes: 60, mode: "video" },
  { application: 155, round: 1, day: 9, hour: 10, minute: 0, durationMinutes: 60, mode: "onsite" },
  { application: 166, round: 1, day: 10, hour: 11, minute: 30, durationMinutes: 90, mode: "video" },
  { application: 181, round: 1, day: 11, hour: 13, minute: 0, durationMinutes: 45, mode: "video" },
  { application: 182, round: 1, day: 12, hour: 14, minute: 30, durationMinutes: 60, mode: "onsite" },
  { application: 188, round: 1, day: 13, hour: 15, minute: 0, durationMinutes: 60, mode: "phone" },
  { application: 191, round: 1, day: 14, hour: 16, minute: 30, durationMinutes: 90, mode: "video" },
];

export const OFFERS: readonly OfferRow[] = [
  { application: 1, status: "pending_approval", startInDays: 21, expiresInDays: 7 },
  { application: 15, status: "sent", startInDays: 24, expiresInDays: 8 },
  { application: 30, status: "approved", startInDays: 27, expiresInDays: 9 },
  { application: 35, status: "draft", startInDays: 30, expiresInDays: 10 },
  { application: 62, status: "sent", startInDays: 33, expiresInDays: 11 },
  { application: 71, status: "pending_approval", startInDays: 36, expiresInDays: 12 },
  { application: 78, status: "sent", startInDays: 39, expiresInDays: 13 },
  { application: 87, status: "approved", startInDays: 42, expiresInDays: 14 },
  { application: 106, status: "declined", startInDays: 45, expiresInDays: 7 },
  { application: 123, status: "sent", startInDays: 48, expiresInDays: 8 },
  { application: 128, status: "pending_approval", startInDays: 51, expiresInDays: 9 },
  { application: 140, status: "approved", startInDays: 54, expiresInDays: 10 },
  { application: 180, status: "draft", startInDays: 57, expiresInDays: 11 },
  { application: 186, status: "sent", startInDays: 60, expiresInDays: 12 },
];
