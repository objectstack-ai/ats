/**
 * Identity keys — locale-independent on purpose: the same person and
 * organization carry the same id, e-mail and slug in every locale, so
 * `demo-zh` really is the same row set with different display strings.
 *
 * Split out of `build.ts` so `personas.ts` (the signable subset) can name
 * the same people without importing the builders that consume it.
 */

const pad2 = (n: number): string => String(n).padStart(2, '0');

export const orgId = (slug: string): string => `org_ats_${slug}`;
export const orgSlug = (slug: string): string => `ats-${slug}`;
export const adminEmail = (slug: string): string => `admin@${slug}.example`;
export const recruiterEmail = (slug: string, slot: number): string => `talent${slot + 1}@${slug}.example`;
export const staffUserId = (slug: string, who: 'admin' | 'r1' | 'r2'): string => `usr_ats_${slug}_${who}`;
export const candidateEmail = (index: number): string => `candidate${pad2(index + 1)}@mail.example`;
export const candidateUserId = (index: number): string => `usr_ats_c${pad2(index + 1)}`;
export const candidateKey = (index: number): string => pad2(index + 1);
/** A public-form applicant who has no candidate row yet (`INQUIRIES`, kind `new`). */
export const applicantEmail = (index: number): string => `applicant${pad2(index + 1)}@mail.example`;

export const PLATFORM_OPS = { id: 'usr_ats_platform_ops', email: 'ops@platform.example' } as const;
export const PLATFORM_ADMIN = { id: 'usr_ats_platform_admin', email: 'admin@platform.example' } as const;
