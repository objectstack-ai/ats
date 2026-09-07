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
 * ## The two execution surfaces, and the read channel they share
 *
 * `os build` lowers every handler to a metadata-only `body`; a metadata-only
 * runtime executes that body in the QuickJS sandbox (`BodyRunner`), while
 * `objectstack dev` binds the in-process `handler` from the bundled config
 * (measured on cli 17.3.0: the stack of a hook error runs through
 * `objectstack.config.bundled_*.mjs`). Both surfaces hand the handler the same
 * `ctx.api`, and on both the read channel is
 * `ctx.api.object(NAME).findOne({ where: { id } })` — honoured as written, on
 * the memory and the sqlite driver alike (40 of 40 seed-time job stamps
 * resolved their own employer, #43). The sandbox gates it behind the
 * `api.read` capability, which the lowering step INFERS from the
 * `.object(...).findOne` call shape — nothing here declares it by hand, and a
 * handler that read through any other surface would ship `capabilities: []`
 * and throw on first use.
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
 * ## Why an update only re-stamps what the write payload names
 *
 * A predicate update (`multi: true`) sends ONE `SET` clause to the driver: the
 * engine dispatches `beforeUpdate` once per matched row, but whatever a handler
 * writes into `ctx.input` for one row is applied to EVERY matched row (ADR-0058
 * Addendum II D3). The engine refuses only when the SET of keys diverges across
 * rows; identical keys with per-row VALUES pass, and the last row's values win
 * (objectstack#14744). Its own contract for per-row `ctx.previous` on such a
 * write is that it exists for a guard to refuse with, not for a rewrite to aim
 * by (objectstack#16074).
 *
 * The platform performs exactly such a write on every boot: plugin-security's
 * `claimSeedOwnership` runs `update(object, { owner_id }, { where: { owner_id:
 * null }, multi: true })` over every owner-bearing object right after the seed.
 * A stamp that re-derives its value from `ctx.previous` on every update turns
 * that pass into a data-corruption pass — measured on cli 17.3.0, both drivers:
 * all 40 jobs carried `org_ats_orbit`, all 200 applications one Ironbridge job's
 * employer, all 30 members the title of Orbit's last recruiter (#43).
 *
 * So the rule every handler below follows: on `beforeInsert` stamp everything;
 * on `beforeUpdate` recompute a derived value ONLY when the payload names one
 * of its source fields, or the derived field itself (a caller writing
 * `employer_org` directly still gets it re-derived from the parent — the
 * anti-tamper property stays). A payload that names neither — an ownership
 * claim, a status change, a no-op PATCH — leaves the row's stamps alone.
 * Residual, by the platform's own contract: a predicate update that CHANGES a
 * source field across many rows must be issued by id.
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

/**
 * `ats_employer_member` — inherit the employer's organization, and title the
 * row as "USER NAME · ACCESS_LEVEL" (object description, DESIGN.md §02): the
 * person's `sys_user.name`, with the user id as the fallback when the row is
 * missing (#22).
 */
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
    const inserting = ctx.event === 'beforeInsert';
    const touched = (keys: string[]) => keys.some((k) => input[k] !== undefined);

    if (inserting || touched(['employer', 'employer_org'])) {
      const employerId = input.employer ?? prev.employer;
      if (typeof employerId === 'string' && employerId !== '') {
        const employer = (await api.object('ats_employer').findOne({ where: { id: employerId } })) as Row | null;
        if (employer?.organization != null) input.employer_org = employer.organization;
      }
    }

    if (inserting || touched(['user', 'access_level', 'display_name'])) {
      const userId = input.user ?? prev.user;
      const level = String(input.access_level ?? prev.access_level ?? '');
      if (typeof userId === 'string' && userId !== '') {
        const user = (await api.object('sys_user').findOne({ where: { id: userId } })) as Row | null;
        const name = String(user?.name ?? '').trim();
        const who = name !== '' ? name : userId;
        input.display_name = level === '' ? who : `${who} · ${level}`;
      }
    }
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
    const inserting = ctx.event === 'beforeInsert';
    if (!inserting && !['employer', 'employer_org'].some((k) => input[k] !== undefined)) return;

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
 * another employer's scope. A payload that names them is therefore a reason to
 * re-derive, never a value to keep.
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
    const inserting = ctx.event === 'beforeInsert';
    const touched = (keys: string[]) => keys.some((k) => input[k] !== undefined);

    if (inserting || touched(['job', 'candidate', 'employer', 'employer_org', 'candidate_user', 'display_name'])) {
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
    }

    if (inserting && input.applied_at == null) {
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
    const inserting = ctx.event === 'beforeInsert';
    if (!inserting && !['application', 'round', 'display_name'].some((k) => input[k] !== undefined)) return;

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
    const inserting = ctx.event === 'beforeInsert';
    if (!inserting && !['application', 'employer', 'employer_org', 'candidate_user', 'display_name'].some((k) => input[k] !== undefined)) return;

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

/**
 * `ats_offer` — stamp `ats_application.days_to_offer` when the FIRST offer on
 * that application is written.
 *
 * ## Why a stored column at all
 *
 * "Average days to offer" (DESIGN.md §04) is a duration between `applied_at`
 * on one object and `created_at` on another. A dataset measure aggregates ONE
 * column of ONE object, and the only computed form combines OTHER MEASURES of
 * the same dataset by name — there is no cross-object arithmetic to reach for.
 * So the duration has to exist as a column before the semantic layer can
 * average it, and this is where it gets written.
 *
 * ## Why `afterInsert`, and why it is immune to the #43 defect by construction
 *
 * The value is stamped exactly ONCE per application, on the insert of its
 * first offer, and is never recomputed. That is a metric decision first —
 * "time to offer" means time to the FIRST offer, so a re-issued offer must not
 * move it — and it also removes the whole surface #43 was about: this hook
 * subscribes to no `*Update` event, so `claimSeedOwnership`'s boot-time
 * `update(ats_offer, { owner_id }, { where: { owner_id: null }, multi: true })`
 * dispatches nothing here. There is no payload to inspect and no per-row
 * recompute that a batch-scoped `SET` clause could smear across every matched
 * row. The sibling handlers above, which DO subscribe to `beforeUpdate`, carry
 * the `inserting || touched([...])` guard for exactly that reason; the guard
 * that fits this one is `days_to_offer == null` on the target row.
 *
 * That guard is also what makes a re-boot on an existing database correct: the
 * seed loader upserts, an offer that already exists is an UPDATE rather than an
 * insert, and even a genuine re-insert finds the column already set and leaves
 * it alone.
 *
 * ## The write, and what else it touches
 *
 * The update is by id (`update({ id, ... })` — the repository reads the key out
 * of the payload), never a predicate write. It goes down the engine's normal
 * path, so `ats_application`'s own `beforeUpdate` stamps run on it:
 * `ApplicationStampHook` sees a payload naming neither a source field nor a
 * derived one and re-derives nothing, but it does refresh `last_activity_at`,
 * as it does for every write to an application. That costs nothing here —
 * measured on a seeded sqlite boot, all 200 applications already carry a
 * `last_activity_at` inside the same second, because that assignment is
 * unconditional on `beforeInsert` too — and writing an offer IS activity on the
 * application, so it is the right answer rather than a side effect to suppress.
 *
 * `runAs: 'system'`: a recruiter extending an offer is not necessarily allowed
 * to edit that application row, and a cross-object write through `ctx.api` is
 * gated by the TARGET object's rules. Same elevation the stamps above need,
 * for the same reason.
 */
export const OfferTimeToOfferHook = defineHook({
  name: 'ats_offer_time_to_offer',
  object: 'ats_offer',
  events: ['afterInsert'],
  priority: 100,
  runAs: 'system',
  description: "Stamps days_to_offer on the offer's application, once, from applied_at to this offer's created_at.",
  handler: async (ctx: HookContext) => {
    const api = ctx.api;
    if (!api) throw new Error('ats_offer_time_to_offer: ctx.api is unavailable, the application cannot be stamped');
    const input = ctx.input as Row;
    const written = (ctx.result != null && typeof ctx.result === 'object' && !Array.isArray(ctx.result) ? ctx.result : {}) as Row;

    const applicationId = written.application ?? input.application;
    if (typeof applicationId !== 'string' || applicationId === '') return;

    const application = (await api.object('ats_application').findOne({ where: { id: applicationId } })) as Row | null;
    if (!application) return;
    // First offer wins — see the header. Also the re-boot / re-insert guard.
    if (application.days_to_offer != null) return;

    const msOf = (value: unknown): number => (value == null ? Number.NaN : new Date(value as string).getTime());
    const appliedMs = msOf(application.applied_at);
    // `created_at` is the platform's own audit stamp on the row just written;
    // an `after*` handler runs close enough to it that "now" is the honest
    // fallback when the driver did not echo it back.
    const offerMs = msOf(written.created_at ?? new Date().toISOString());
    if (!Number.isFinite(appliedMs) || !Number.isFinite(offerMs)) return;

    // Whole elapsed days, floored: "it has been N days". Never negative — an
    // offer dated before its application is bad data, not a negative duration.
    const days = Math.max(0, Math.floor((offerMs - appliedMs) / 86400000));
    await api.object('ats_application').update({ id: applicationId, days_to_offer: days });
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
    const inserting = ctx.event === 'beforeInsert';
    if (!inserting && !['credential_type', 'level', 'display_name'].some((k) => input[k] !== undefined)) return;

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
