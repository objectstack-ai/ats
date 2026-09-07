/**
 * Pure builders: one skeleton × one locale pack → seed records.
 *
 * Every builder is deterministic and clock-free. Dates are CEL envelopes
 * (`daysAgo(n)`, `daysFromNow(n)`, `daysFromNow(n) + duration("9h30m")`)
 * that the seed loader evaluates against a single pinned `now` at install
 * time, so the calendar still shows next week's interviews a month after the
 * package was built and two consecutive builds stay byte-identical.
 *
 * Denormalised fields are written EXPLICITLY here — `display_name` mirrors,
 * `employer`, `employer_org`, `candidate_user` — because a seed row does not
 * go through the stamp hooks (`skipTriggers`), and a seed that leaned on them
 * would break silently the day a hook changed.
 *
 * The kernel's tenant column `organization_id` is written explicitly as well,
 * on the four objects that stay inside the Layer 0 tenant wall (DESIGN.md §03,
 * tenancy wall split contract) — see `TenantScopedSeedRecordOf` below.
 *
 * Sign-in: the seeded people are directory rows, except the handful in
 * `personas.ts`, which also get a `sys_account` credential (`buildAccounts`)
 * and, for the two platform staff, a platform position — so the demo can be
 * walked as a real persona, not only as the platform owner.
 */

import { defineSeed } from '@objectstack/spec/data';
import { cel } from '@objectstack/spec';

import { Skill } from '../../objects/skill.object.js';
import { CredentialType } from '../../objects/credential-type.object.js';
import { Employer } from '../../objects/employer.object.js';
import { EmployerMember } from '../../objects/employer-member.object.js';
import { Job } from '../../objects/job.object.js';
import { Candidate } from '../../objects/candidate.object.js';
import { CandidateCredential } from '../../objects/candidate-credential.object.js';
import { Application } from '../../objects/application.object.js';
import { Interview } from '../../objects/interview.object.js';
import { Offer } from '../../objects/offer.object.js';
import { Report } from '../../objects/report.object.js';
import { Inquiry } from '../../objects/inquiry.object.js';

import { SysAccount, SysMember, SysOrganization, SysUser, SysUserPosition } from './sys-objects.js';
import { EmployerAdminPosition, EmployerRecruiterPosition, JobSeekerPosition } from '../../security/positions.js';
import {
  PLATFORM_ADMIN,
  PLATFORM_OPS,
  adminEmail,
  applicantEmail,
  candidateEmail,
  candidateKey,
  candidateUserId,
  orgId,
  orgSlug,
  recruiterEmail,
  staffUserId,
} from './identity.js';
import { PLATFORM_OWNER, SIGNABLE_EMAILS, SIGNABLE_PERSONAS } from './personas.js';
import {
  CREDENTIALS,
  CREDENTIAL_TYPES,
  EMPLOYERS,
  JOBS,
  REPORTS,
  SKILL_CATEGORIES,
  type EmployerRow,
  type Reporter,
  type ReportTarget,
} from './skeleton.js';
import { APPLICATIONS, CANDIDATES, INQUIRIES, INTERVIEWS, OFFERS, type ApplicationRow } from './pipeline.js';
import type { LocalePack } from './pack.js';

/** The record shape `defineSeed(objectDef, …)` accepts for one object — field keys checked at compile time. */
type SeedRecordOf<T extends { name: string; fields: Record<string, unknown> }> =
  Parameters<typeof defineSeed<T>>[1]['records'][number];

/**
 * A seed row of an object that stays INSIDE the Layer 0 tenant wall
 * (DESIGN.md §03, tenancy wall split contract): `ats_employer` ·
 * `ats_employer_member` · `ats_interview` · `ats_offer`. A system-context
 * insert on a tenant-scoped object must name the organization that owns the
 * row (objectql #8844), and the column it names is the kernel-injected
 * `organization_id` — not an authored field, so `SeedRecordOf` cannot see it
 * and the record type gains it here instead of a cast at the write site. The
 * value is the organization's ID (`orgId`), the same value `employer_org`
 * carries; `sys_member.organization_id` uses the slug only because there the
 * column is a lookup the loader resolves by natural key.
 */
type TenantScopedSeedRecordOf<T extends { name: string; fields: Record<string, unknown> }> =
  SeedRecordOf<T> & { organization_id: string };

// ── Identity keys ────────────────────────────────────────────────────────────
//
// Live in `identity.ts` (shared with `personas.ts`); re-exported so nothing
// that reads them off this module has to move.

export {
  PLATFORM_ADMIN,
  PLATFORM_OPS,
  adminEmail,
  candidateEmail,
  candidateUserId,
  orgId,
  orgSlug,
  recruiterEmail,
  staffUserId,
} from './identity.js';

// ── Dynamic dates (CEL) ──────────────────────────────────────────────────────

const daysAgo = (n: number) => cel`daysAgo(${n})`;
const daysFromNow = (n: number) => cel`daysFromNow(${n})`;
/** A calendar day from seed time at a wall-clock hour: the calendar helpers land on UTC midnight, so add a duration. */
const dayAt = (day: number, hour: number, minute: number) =>
  cel`daysFromNow(${day}) + duration(${minute > 0 ? `${hour}h${minute}m` : `${hour}h`})`;

// ── Small helpers ────────────────────────────────────────────────────────────

const employerName = (pack: LocalePack, employerIndex: number): string => pack.employers[employerIndex]!.name;
const jobTitle = (pack: LocalePack, jobIndex: number): string => pack.jobs[jobIndex]!.title;
const candidateName = (pack: LocalePack, candidateIndex: number): string => pack.candidates[candidateIndex]!.name;
const employerOf = (jobIndex: number): { index: number; row: EmployerRow } => {
  const index = JOBS[jobIndex]!.employer;
  return { index, row: EMPLOYERS[index]! };
};

/** The stamp hook's format for an application title: "<candidate> → <job>". */
const applicationName = (pack: LocalePack, a: ApplicationRow): string =>
  `${candidateName(pack, a.candidate)} → ${jobTitle(pack, a.job)}`;

const recruiterEmails = (e: EmployerRow): string[] =>
  Array.from({ length: e.recruiters }, (_, slot) => recruiterEmail(e.slug, slot));

const reporterEmail = (r: Reporter): string =>
  r.kind === 'candidate' ? candidateEmail(r.index) : recruiterEmail(EMPLOYERS[r.employer]!.slug, r.slot);

/**
 * `ats_report.target_ref` is a free-text pointer. Record ids are minted by the
 * engine at load time and are not knowable when this file is written, so the
 * seed stores the target's natural key — the same key the loader resolves
 * references by — and says so in the row's description.
 */
const targetRef = (pack: LocalePack, t: ReportTarget): string => {
  switch (t.kind) {
    case 'job': return jobTitle(pack, t.index);
    case 'candidate': return candidateName(pack, t.index);
    case 'application': return applicationName(pack, APPLICATIONS[t.index]!);
    case 'employer': return employerName(pack, t.index);
  }
};

const phoneFor = (pack: LocalePack, index: number): string =>
  pack.locale === 'zh-CN' ? `+86 130 0000 ${String(100 + index).padStart(4, '0')}` : `+1 202 555 ${String(100 + index).padStart(4, '0')}`;

// ── Dictionaries ─────────────────────────────────────────────────────────────

export function buildSkills(pack: LocalePack): SeedRecordOf<typeof Skill>[] {
  return pack.skills.map((name, i) => ({ name, category: SKILL_CATEGORIES[i]! }));
}

export function buildCredentialTypes(pack: LocalePack): SeedRecordOf<typeof CredentialType>[] {
  return pack.credentialTypes.map((t, i) => {
    const row = CREDENTIAL_TYPES[i]!;
    return {
      name: t.name,
      issuer: t.issuer,
      description: t.description,
      has_levels: row.hasLevels,
      ...(row.validityMonths != null ? { validity_months: row.validityMonths } : {}),
    };
  });
}

// ── Platform identity: organizations, users, memberships ─────────────────────

export function buildOrganizations(pack: LocalePack): SeedRecordOf<typeof SysOrganization>[] {
  return EMPLOYERS.map((e, i) => ({ id: orgId(e.slug), name: employerName(pack, i), slug: orgSlug(e.slug) }));
}

/**
 * The platform owner, employer staff (12 admins + 18 recruiters), two platform
 * staff, and one user per candidate. `email_verified` is written only on the
 * rows that carry a credential (`personas.ts`); everyone else stays a plain
 * directory row. The owner goes FIRST, with an id that collates first and a
 * `created_at` a year older than everyone else's: the security bootstrap's
 * first-user carve-out promotes the oldest authenticable user in an unordered
 * 50-row window, and the owner must be that user under every driver's
 * ordering (the why, and the sqlite measurement, are in `personas.ts`). The
 * same placement keeps the runtime's dev-admin probe — which also reads the
 * first 50 users — finding the owner and surfacing the login hint.
 */
export function buildUsers(pack: LocalePack): SeedRecordOf<typeof SysUser>[] {
  const locale = pack.locale;
  const verified = (email: string) => (SIGNABLE_EMAILS.has(email) ? { email_verified: true } : {});
  const users: SeedRecordOf<typeof SysUser>[] = [];
  users.push({
    id: PLATFORM_OWNER.id,
    name: PLATFORM_OWNER.name,
    email: PLATFORM_OWNER.email,
    email_verified: true,
    created_at: daysAgo(365),
    locale,
  });
  EMPLOYERS.forEach((e, i) => {
    const staff = pack.staff[i]!;
    users.push({ id: staffUserId(e.slug, 'admin'), name: staff.admin, email: adminEmail(e.slug), ...verified(adminEmail(e.slug)), locale });
    for (let slot = 0; slot < e.recruiters; slot++) {
      const email = recruiterEmail(e.slug, slot);
      users.push({
        id: staffUserId(e.slug, slot === 0 ? 'r1' : 'r2'),
        name: staff.recruiters[slot]!,
        email,
        ...verified(email),
        locale,
      });
    }
  });
  users.push({ id: PLATFORM_OPS.id, name: pack.platformStaff.ops, email: PLATFORM_OPS.email, ...verified(PLATFORM_OPS.email), locale });
  users.push({ id: PLATFORM_ADMIN.id, name: pack.platformStaff.admin, email: PLATFORM_ADMIN.email, ...verified(PLATFORM_ADMIN.email), locale });
  CANDIDATES.forEach((_, i) => {
    users.push({ id: candidateUserId(i), name: candidateName(pack, i), email: candidateEmail(i), ...verified(candidateEmail(i)), locale });
  });
  return users;
}

/**
 * `sys_account` rows — the credentials that make the personas in
 * `personas.ts` signable. Each is better-auth's local password login for its
 * user: `provider_id: 'credential'`, `issuer: 'local:credential'`,
 * `account_id` = the user's id (the sign-in route matches all three), and the
 * scrypt digest better-auth verifies against. `user_id` is written as the
 * e-mail, the natural key the loader resolves `sys_user` references by.
 * Locale-independent: the same seven people sign in under both packs.
 */
export function buildAccounts(): SeedRecordOf<typeof SysAccount>[] {
  const credential = (key: string, userId: string, email: string, passwordHash: string): SeedRecordOf<typeof SysAccount> => ({
    id: `acc_ats_${key}`,
    user_id: email,
    provider_id: 'credential',
    issuer: 'local:credential',
    account_id: userId,
    password: passwordHash,
  });
  return [
    credential('platform_owner', PLATFORM_OWNER.id, PLATFORM_OWNER.email, PLATFORM_OWNER.passwordHash),
    ...SIGNABLE_PERSONAS.map((p) => credential(p.key, p.userId, p.email, p.passwordHash)),
  ];
}

/**
 * `sys_member` rows — the source of `current_user.accessible_org_ids`, which
 * every employer-side row-level policy compares `employer_org` against.
 * The membership role is the platform's ORGANIZATION grade (owner / admin /
 * member); the ATS business role is `ats_employer_member.access_level`.
 */
export function buildMemberships(): SeedRecordOf<typeof SysMember>[] {
  const rows: SeedRecordOf<typeof SysMember>[] = [];
  for (const e of EMPLOYERS) {
    rows.push({ id: `mem_ats_${e.slug}_admin`, organization_id: orgSlug(e.slug), user_id: adminEmail(e.slug), role: 'admin' });
    for (let slot = 0; slot < e.recruiters; slot++) {
      rows.push({
        id: `mem_ats_${e.slug}_r${slot + 1}`,
        organization_id: orgSlug(e.slug),
        user_id: recruiterEmail(e.slug, slot),
        role: 'member',
      });
    }
  }
  return rows;
}

/**
 * `sys_user_position` rows — the persona grants that make the memberships
 * above mean something: a member row scopes WHICH employer's rows a user may
 * reach; the position decides WHAT they may do there (DESIGN.md §03 matrix).
 * The two seeded platform staff hold the two platform positions so the
 * Platform group has someone to sign in as; the platform OWNER holds none
 * (its standing is config-derived, `OS_PLATFORM_OWNER_EMAIL`).
 */
export function buildUserPositions(): SeedRecordOf<typeof SysUserPosition>[] {
  const rows: SeedRecordOf<typeof SysUserPosition>[] = [];
  for (const p of SIGNABLE_PERSONAS) {
    if (p.userId === PLATFORM_ADMIN.id || p.userId === PLATFORM_OPS.id) {
      rows.push({ id: `upos_ats_${p.key}`, user_id: p.email, position: p.position });
    }
  }
  for (const e of EMPLOYERS) {
    rows.push({ id: `upos_ats_${e.slug}_admin`, user_id: adminEmail(e.slug), position: EmployerAdminPosition.name });
    for (let slot = 0; slot < e.recruiters; slot++) {
      rows.push({
        id: `upos_ats_${e.slug}_r${slot + 1}`,
        user_id: recruiterEmail(e.slug, slot),
        position: EmployerRecruiterPosition.name,
      });
    }
  }
  CANDIDATES.forEach((_, i) => {
    rows.push({ id: `upos_ats_c${candidateKey(i)}`, user_id: candidateEmail(i), position: JobSeekerPosition.name });
  });
  return rows;
}

// ── Employer domain ──────────────────────────────────────────────────────────

export function buildEmployers(pack: LocalePack): TenantScopedSeedRecordOf<typeof Employer>[] {
  return EMPLOYERS.map((e, i) => {
    const t = pack.employers[i]!;
    return {
      name: t.name,
      short_name: t.shortName,
      industry: e.industry,
      size: e.size,
      city: t.city,
      website: `https://${e.slug}.example`,
      intro: t.intro,
      verification_status: e.verificationStatus,
      ...(t.verificationNote ? { verification_note: t.verificationNote } : {}),
      service_tier: e.serviceTier,
      service_expires_at: daysFromNow(e.serviceExpiresInDays),
      organization: orgId(e.slug),
      organization_id: orgId(e.slug),
      owner: adminEmail(e.slug),
    };
  });
}

export function buildEmployerMembers(pack: LocalePack): TenantScopedSeedRecordOf<typeof EmployerMember>[] {
  const rows: TenantScopedSeedRecordOf<typeof EmployerMember>[] = [];
  EMPLOYERS.forEach((e, i) => {
    const staff = pack.staff[i]!;
    const employer = employerName(pack, i);
    rows.push({
      display_name: `${staff.admin} · admin`,
      employer,
      employer_org: orgId(e.slug),
      organization_id: orgId(e.slug),
      user: adminEmail(e.slug),
      access_level: 'admin',
      is_active: true,
    });
    for (let slot = 0; slot < e.recruiters; slot++) {
      rows.push({
        display_name: `${staff.recruiters[slot]!} · recruiter`,
        employer,
        employer_org: orgId(e.slug),
        organization_id: orgId(e.slug),
        user: recruiterEmail(e.slug, slot),
        access_level: 'recruiter',
        is_active: true,
      });
    }
  });
  return rows;
}

export function buildJobs(pack: LocalePack): SeedRecordOf<typeof Job>[] {
  return JOBS.map((j, i) => {
    const t = pack.jobs[i]!;
    const e = EMPLOYERS[j.employer]!;
    return {
      title: t.title,
      employer: employerName(pack, j.employer),
      employer_org: orgId(e.slug),
      department: t.department,
      description: t.description,
      requirements: t.requirements,
      employment_type: j.employmentType,
      work_mode: j.workMode,
      city: t.city,
      salary_min: j.salaryMin,
      salary_max: j.salaryMax,
      salary_period: j.salaryPeriod,
      headcount: j.headcount,
      ...(j.requiredSkills.length > 0 ? { required_skills: j.requiredSkills.map((k) => pack.skills[k]!) } : {}),
      ...(j.requiredCredentials.length > 0
        ? { required_credentials: j.requiredCredentials.map((k) => pack.credentialTypes[k]!.name) }
        : {}),
      experience_min_years: j.experienceMinYears,
      education_min: j.educationMin,
      status: j.status,
      ...(t.rejectionReason ? { rejection_reason: t.rejectionReason } : {}),
      ...(t.reviewNote ? { review_note: t.reviewNote } : {}),
      is_featured: j.isFeatured,
      ...(j.publishedDaysAgo != null ? { published_at: daysAgo(j.publishedDaysAgo) } : {}),
      ...(j.expiresInDays != null ? { expires_at: daysFromNow(j.expiresInDays) } : {}),
    };
  });
}

// ── Candidate domain ─────────────────────────────────────────────────────────

/** `avatar` and `resume_file` stay empty on purpose: no hot-linked placeholders, no data URIs (the card). */
export function buildCandidates(pack: LocalePack): SeedRecordOf<typeof Candidate>[] {
  return CANDIDATES.map((c, i) => {
    const t = pack.candidates[i]!;
    return {
      full_name: t.name,
      user: candidateEmail(i),
      phone: phoneFor(pack, i),
      email: candidateEmail(i),
      city: pack.cities[c.city]!,
      experience_years: c.experienceYears,
      education: c.education,
      current_title: t.title,
      current_employer: t.currentEmployer,
      skills: c.skills.map((k) => pack.skills[k]!),
      summary: t.summary,
      expected_salary_min: c.expectedSalaryMin,
      expected_salary_max: c.expectedSalaryMax,
      salary_period: c.salaryPeriod,
      seeking_status: c.seekingStatus,
      profile_visibility: c.profileVisibility,
    };
  });
}

export function buildCandidateCredentials(pack: LocalePack): SeedRecordOf<typeof CandidateCredential>[] {
  return CREDENTIALS.map((r) => {
    const typeName = pack.credentialTypes[r.type]!.name;
    const level = r.level ? pack.levels[r.level] : undefined;
    return {
      display_name: level ? `${typeName} · ${level}` : typeName,
      candidate: candidateName(pack, r.candidate),
      credential_type: typeName,
      ...(level ? { level } : {}),
      certificate_no: r.certificateNo,
      issued_at: daysAgo(r.issuedDaysAgo),
      expires_at: r.expiresInDays >= 0 ? daysFromNow(r.expiresInDays) : daysAgo(-r.expiresInDays),
      verification_status: r.verification,
    };
  });
}

// ── Transaction domain ───────────────────────────────────────────────────────

export function buildApplications(pack: LocalePack): SeedRecordOf<typeof Application>[] {
  return APPLICATIONS.map((a) => {
    const { index: employerIndex, row: e } = employerOf(a.job);
    return {
      display_name: applicationName(pack, a),
      job: jobTitle(pack, a.job),
      candidate: candidateName(pack, a.candidate),
      employer: employerName(pack, employerIndex),
      employer_org: orgId(e.slug),
      candidate_user: candidateUserId(a.candidate),
      stage: a.stage,
      source: a.source,
      applied_at: daysAgo(a.appliedDaysAgo),
      last_activity_at: daysAgo(a.activityDaysAgo),
      ...(a.rating != null ? { rating: a.rating } : {}),
      ...(a.rejectionReason ? { rejection_reason: a.rejectionReason } : {}),
    };
  });
}

export function buildInterviews(pack: LocalePack): TenantScopedSeedRecordOf<typeof Interview>[] {
  return INTERVIEWS.map((iv) => {
    const a = APPLICATIONS[iv.application]!;
    const { index: employerIndex, row: e } = employerOf(a.job);
    const recruiters = recruiterEmails(e);
    const lead = recruiters[iv.application % recruiters.length]!;
    const room = 1 + (iv.application % 6);
    const city = pack.employers[employerIndex]!.city;
    const location =
      iv.mode === 'video'
        ? `https://meet.example/${e.slug}-${iv.application}-r${iv.round}`
        : iv.mode === 'onsite'
          ? pack.interviewLocations.onsite.replace('{city}', city).replace('{room}', String(room))
          : pack.interviewLocations.phone;
    return {
      display_name: `${candidateName(pack, a.candidate)} · R${iv.round}`,
      application: applicationName(pack, a),
      organization_id: orgId(e.slug),
      round: iv.round,
      scheduled_at: dayAt(iv.day, iv.hour, iv.minute),
      duration_minutes: iv.durationMinutes,
      mode: iv.mode,
      location_or_link: location,
      interviewers: iv.round === 1 ? [lead] : [lead, adminEmail(e.slug)],
      status: 'scheduled',
    };
  });
}

export function buildOffers(pack: LocalePack): TenantScopedSeedRecordOf<typeof Offer>[] {
  return OFFERS.map((o) => {
    const a = APPLICATIONS[o.application]!;
    const job = JOBS[a.job]!;
    const { index: employerIndex, row: e } = employerOf(a.job);
    const name = applicationName(pack, a);
    const salary = Math.round((job.salaryMin + job.salaryMax) / 2 / 10) * 10;
    const approved = o.status === 'approved' || o.status === 'sent' || o.status === 'declined';
    return {
      display_name: `Offer · ${name}`,
      application: name,
      employer: employerName(pack, employerIndex),
      employer_org: orgId(e.slug),
      organization_id: orgId(e.slug),
      candidate_user: candidateUserId(a.candidate),
      salary,
      salary_period: job.salaryPeriod,
      start_date: daysFromNow(o.startInDays),
      status: o.status,
      ...(approved ? { approved_by: adminEmail(e.slug) } : {}),
      expires_at: daysFromNow(o.expiresInDays),
      notes: pack.offerNote,
    };
  });
}

/**
 * `ats_inquiry` — public-form applications waiting in the queue (#37). All
 * `new`: conversion is a runtime act (the `beforeUpdate` hook), never seeded.
 * The stamps a live submit gets from the hook — `display_name`, `employer`,
 * `employer_org`, `submitted_at` — are written explicitly, like every other
 * seed here; a seeded candidate's inquiry reuses their name, e-mail and phone
 * so converting it demonstrably attaches to the existing row.
 */
export function buildInquiries(pack: LocalePack): SeedRecordOf<typeof Inquiry>[] {
  return INQUIRIES.map((q, i) => {
    const t = pack.inquiries[i]!;
    const { index: employerIndex, row: e } = employerOf(q.job);
    const fromCandidate = q.applicant.kind === 'candidate';
    const who = fromCandidate ? candidateName(pack, q.applicant.index) : (t.name ?? '');
    return {
      display_name: `${who} → ${jobTitle(pack, q.job)}`,
      job: jobTitle(pack, q.job),
      employer: employerName(pack, employerIndex),
      employer_org: orgId(e.slug),
      full_name: who,
      email: fromCandidate ? candidateEmail(q.applicant.index) : applicantEmail(q.applicant.index),
      phone: phoneFor(pack, fromCandidate ? q.applicant.index : 900 + q.applicant.index),
      cover_letter: t.coverLetter,
      status: 'new',
      submitted_at: daysAgo(q.submittedDaysAgo),
    };
  });
}

export function buildReports(pack: LocalePack): SeedRecordOf<typeof Report>[] {
  return REPORTS.map((r, i) => {
    const t = pack.reports[i]!;
    return {
      subject: t.subject,
      target_type: r.target.kind,
      target_ref: targetRef(pack, r.target),
      reason: r.reason,
      description: t.description,
      reporter: reporterEmail(r.reporter),
      status: r.status,
      ...(t.resolution ? { resolution: t.resolution } : {}),
      ...(r.status !== 'new' ? { handled_by: PLATFORM_OPS.email } : {}),
    };
  });
}
