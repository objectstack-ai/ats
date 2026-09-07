import { defineHook, type HookContext } from '@objectstack/spec/data';

/**
 * The denormalisation hooks.
 *
 * Two kinds of value are copied onto rows here, both because a row-level
 * predicate compares a FIELD to a `current_user.*` placeholder and cannot
 * traverse a lookup (ADR-0055):
 *
 *   `employer_org`   — which organization's staff may see this row
 *   `candidate_user` — which signed-in person owns it on the seeker side
 *
 * These are load-bearing for security, not convenience: an unstamped row makes
 * its policy drop out, and a policy that drops out fails CLOSED (zero rows).
 * That is the safe direction, but it reads as "the pipeline is empty", so the
 * stamps run at `beforeInsert`, before anything can observe the row.
 *
 * The `display_name` stamps are the other half — objects with no natural title
 * need a stored, searchable one (a formula field is not searchable).
 *
 * ## The sandbox contract these handlers are written against
 *
 * `os build` lowers every handler to a metadata-only `body` and the runtime
 * executes it in the QuickJS sandbox (`BodyRunner`). The sandbox `ctx` has no
 * `ql`; its only read channel is `ctx.api.object(NAME).findOne({ where })`,
 * gated by the `api.read` capability. That capability is INFERRED by the
 * lowering step from the `.object(...).findOne` call shape — nothing here
 * declares it by hand, and a handler that read through any other surface would
 * ship `capabilities: []` and throw on first use.
 *
 * `runAs: 'system'` is the sandbox spelling of the elevated read every stamp
 * needs. The engine hands a `runAs: 'system'` hook a system-elevated `ctx.api`
 * on BOTH execution surfaces, which is the same envelope the in-process
 * `context: { isSystem: true }` read used to carry. It is required, not a
 * convenience: a job seeker filing an application is not a member of the
 * employer's organization, so a caller-scoped read of the job would resolve to
 * nothing and the row would land outside every employer policy. (A `context`
 * key inside the query is silently overwritten by the repository, and `sudo()`
 * does not exist in the VM — neither is an alternative.)
 *
 * ## Why every handler is self-contained
 *
 * No shared helpers, deliberately. A handler that closes over a module-level
 * function cannot be lowered to a metadata-only body, so the whole app stops
 * being shippable as pure metadata and starts shipping a bundled closure
 * (`hook-body/not-lowerable`). That is a change of deployment shape, and this
 * app's entire claim is that it is metadata. A few repeated lines are the
 * cheaper side of that trade.
 */

/** Row shape the stamps read back. Local to each handler by necessity. */
type Row = Record<string, unknown>;

/** `ats_employer_member` — inherit the employer's organization, and title the row. */
export const EmployerMemberStampHook = defineHook({
  name: 'ats_employer_member_stamp',
  object: 'ats_employer_member',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  runAs: 'system',
  description: "Stamps the member's employer organization and display name.",
  handler: async (ctx: HookContext) => {
    const api = ctx.api;
    if (!api) throw new Error('ats_employer_member_stamp: ctx.api is unavailable, the employer organization cannot be resolved');
    const input = ctx.input as Row;
    const prev = (ctx.previous ?? {}) as Row;

    const employerId = input.employer ?? prev.employer;
    if (typeof employerId === 'string' && employerId !== '') {
      const employer = (await api.object('ats_employer').findOne({ where: { id: employerId } })) as Row | null;
      if (employer?.organization != null) input.employer_org = employer.organization;
    }

    const who = String(input.user ?? prev.user ?? '');
    const level = String(input.access_level ?? prev.access_level ?? '');
    if (who !== '') input.display_name = level === '' ? who : `${who} · ${level}`;
  },
});

/** `ats_job` — inherit the employer's organization for row-level scoping. */
export const JobStampHook = defineHook({
  name: 'ats_job_stamp',
  object: 'ats_job',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  runAs: 'system',
  description: "Stamps the job's employer organization.",
  handler: async (ctx: HookContext) => {
    const api = ctx.api;
    if (!api) throw new Error('ats_job_stamp: ctx.api is unavailable, the employer organization cannot be resolved');
    const input = ctx.input as Row;
    const prev = (ctx.previous ?? {}) as Row;

    const employerId = input.employer ?? prev.employer;
    if (typeof employerId !== 'string' || employerId === '') return;
    const employer = (await api.object('ats_employer').findOne({ where: { id: employerId } })) as Row | null;
    if (employer?.organization != null) input.employer_org = employer.organization;
  },
});

/**
 * `ats_application` — the one row both audiences reach.
 *
 * `employer` and `employer_org` are taken from the JOB, never from the incoming
 * payload: letting a caller supply them would let them file an application into
 * another employer's scope.
 */
export const ApplicationStampHook = defineHook({
  name: 'ats_application_stamp',
  object: 'ats_application',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  runAs: 'system',
  description: 'Stamps employer, employer_org, candidate_user and display name from the job and candidate.',
  handler: async (ctx: HookContext) => {
    const api = ctx.api;
    if (!api) throw new Error('ats_application_stamp: ctx.api is unavailable, the job and candidate cannot be resolved');
    const input = ctx.input as Row;
    const prev = (ctx.previous ?? {}) as Row;

    let jobTitle = '';
    const jobId = input.job ?? prev.job;
    if (typeof jobId === 'string' && jobId !== '') {
      const job = (await api.object('ats_job').findOne({ where: { id: jobId } })) as Row | null;
      if (job) {
        if (job.employer != null) input.employer = job.employer;
        if (job.employer_org != null) input.employer_org = job.employer_org;
        jobTitle = String(job.title ?? '');
      }
    }

    let who = '';
    const candidateId = input.candidate ?? prev.candidate;
    if (typeof candidateId === 'string' && candidateId !== '') {
      const candidate = (await api.object('ats_candidate').findOne({ where: { id: candidateId } })) as Row | null;
      if (candidate?.user != null) input.candidate_user = candidate.user;
      who = String(candidate?.full_name ?? '');
    }

    if (who !== '' || jobTitle !== '') input.display_name = `${who} → ${jobTitle}`.trim();
    if (ctx.event === 'beforeInsert' && input.applied_at == null) {
      input.applied_at = new Date().toISOString();
    }
    input.last_activity_at = new Date().toISOString();
  },
});

/** `ats_interview` — title from the parent application's candidate and round. */
export const InterviewStampHook = defineHook({
  name: 'ats_interview_stamp',
  object: 'ats_interview',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  runAs: 'system',
  description: 'Stamps the interview display name from its application and round.',
  handler: async (ctx: HookContext) => {
    const api = ctx.api;
    if (!api) throw new Error('ats_interview_stamp: ctx.api is unavailable, the application cannot be resolved');
    const input = ctx.input as Row;
    const prev = (ctx.previous ?? {}) as Row;

    const applicationId = input.application ?? prev.application;
    if (typeof applicationId !== 'string' || applicationId === '') return;
    const application = (await api.object('ats_application').findOne({ where: { id: applicationId } })) as Row | null;
    if (!application) return;

    let who = '';
    if (typeof application.candidate === 'string' && application.candidate !== '') {
      const candidate = (await api.object('ats_candidate').findOne({ where: { id: application.candidate } })) as Row | null;
      who = String(candidate?.full_name ?? '');
    }
    if (who === '') who = String(application.display_name ?? '');

    const round = input.round ?? prev.round ?? 1;
    if (who !== '') input.display_name = `${who} · R${String(round)}`;
  },
});

/** `ats_offer` — the same two scoping stamps, sourced through the application. */
export const OfferStampHook = defineHook({
  name: 'ats_offer_stamp',
  object: 'ats_offer',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  runAs: 'system',
  description: 'Stamps employer, employer_org, candidate_user and display name from the application.',
  handler: async (ctx: HookContext) => {
    const api = ctx.api;
    if (!api) throw new Error('ats_offer_stamp: ctx.api is unavailable, the application cannot be resolved');
    const input = ctx.input as Row;
    const prev = (ctx.previous ?? {}) as Row;

    const applicationId = input.application ?? prev.application;
    if (typeof applicationId !== 'string' || applicationId === '') return;
    const application = (await api.object('ats_application').findOne({ where: { id: applicationId } })) as Row | null;
    if (!application) return;

    if (application.employer != null) input.employer = application.employer;
    if (application.employer_org != null) input.employer_org = application.employer_org;
    if (application.candidate_user != null) input.candidate_user = application.candidate_user;

    const title = String(application.display_name ?? '');
    if (title !== '') input.display_name = `Offer · ${title}`;
  },
});

/** `ats_candidate_credential` — title from the credential type and level. */
export const CandidateCredentialStampHook = defineHook({
  name: 'ats_candidate_credential_stamp',
  object: 'ats_candidate_credential',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  runAs: 'system',
  description: 'Stamps the credential display name from its type and level.',
  handler: async (ctx: HookContext) => {
    const api = ctx.api;
    if (!api) throw new Error('ats_candidate_credential_stamp: ctx.api is unavailable, the credential type cannot be resolved');
    const input = ctx.input as Row;
    const prev = (ctx.previous ?? {}) as Row;

    const typeId = input.credential_type ?? prev.credential_type;
    let name = '';
    if (typeof typeId === 'string' && typeId !== '') {
      const type = (await api.object('ats_credential_type').findOne({ where: { id: typeId } })) as Row | null;
      name = String(type?.name ?? '');
    }
    const level = String(input.level ?? prev.level ?? '');
    if (name !== '') input.display_name = level === '' ? name : `${name} · ${level}`;
  },
});
