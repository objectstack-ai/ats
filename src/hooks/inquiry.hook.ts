import { defineHook, type HookContext } from '@objectstack/spec/data';

/**
 * The two hooks behind `ats_inquiry`, the public application entry
 * (maintainer ruling on #3, option (b); DESIGN.md §04).
 *
 * Both follow every rule `stamp.hook.ts` lays down — read its header before
 * changing either: self-contained handlers (no shared helpers, so the app stays
 * lowerable to metadata-only bodies), `runAs: 'system'` for the elevated
 * reads, and on `beforeUpdate` re-derive ONLY when the payload names a source
 * field or the derived field itself (#43). The platform runs a predicate
 * update over every owner-bearing object on each boot (`claimSeedOwnership`,
 * payload `{ owner_id }`), and a hook that recomputed unconditionally would be
 * corrupted by it and look correct until someone counted.
 *
 * Refusals declare `status: 400` so the REST seam serves them as the business
 * refusal they are, on both execution surfaces (in-process `handler` under
 * `objectstack dev`, sandboxed `body` under a metadata-only runtime), rather
 * than a sanitised 500.
 */

/** Row shape the hooks read back. Local to each handler by necessity. */
type Row = Record<string, unknown>;

/**
 * `ats_inquiry` stamps.
 *
 * On insert (the anonymous public-form submit, or a staff-created inquiry):
 * refuse unless the job exists and is `published` — the only jobs the public
 * may apply to are the ones the public may see; stamp `employer` and
 * `employer_org` from the job so the employer-side policies can scope the
 * row; title the row "<applicant> → <job>"; normalise the e-mail (conversion
 * de-duplicates candidates on it); record `submitted_at`.
 *
 * `employer` / `employer_org` are taken from the JOB, never from the payload:
 * a payload naming them is a reason to re-derive, never a value to keep, so
 * neither the public form nor a caller with edit rights can move an inquiry
 * into another employer's scope.
 */
export const InquiryStampHook = defineHook({
  name: 'ats_inquiry_stamp',
  object: 'ats_inquiry',
  events: ['beforeInsert', 'beforeUpdate'],
  priority: 100,
  runAs: 'system',
  description: 'Stamps employer, employer_org, display name and submitted_at from the job, normalises the e-mail, and refuses an inquiry against a job that is not published.',
  handler: async (ctx: HookContext) => {
    const api = ctx.api;
    if (!api) throw new Error('ats_inquiry_stamp: ctx.api is unavailable, the job cannot be resolved');
    const input = ctx.input as Row;
    const prev = (ctx.previous ?? {}) as Row;
    const inserting = ctx.event === 'beforeInsert';
    const touched = (keys: string[]) => keys.some((k) => input[k] !== undefined);

    if ((inserting || touched(['email'])) && typeof input.email === 'string') {
      input.email = input.email.trim().toLowerCase();
    }

    if (inserting || touched(['job', 'employer', 'employer_org', 'full_name', 'display_name'])) {
      let jobTitle = '';
      const jobId = input.job ?? prev.job;
      if (typeof jobId === 'string' && jobId !== '') {
        const job = (await api.object('ats_job').findOne({ where: { id: jobId } })) as Row | null;
        // The public may apply only to what the public may see. Checked on
        // insert and whenever a write re-points the inquiry at another job.
        if ((inserting || input.job !== undefined) && (!job || job.status !== 'published')) {
          const refusal = new Error('This job is not accepting applications.') as Error & { status?: number; code?: string };
          refusal.status = 400;
          refusal.code = 'VALIDATION_FAILED';
          throw refusal;
        }
        if (job) {
          if (job.employer != null) input.employer = job.employer;
          if (job.employer_org != null) input.employer_org = job.employer_org;
          jobTitle = String(job.title ?? '');
        }
      }
      const who = String(input.full_name ?? prev.full_name ?? '').trim();
      if (who !== '' || jobTitle !== '') input.display_name = `${who} → ${jobTitle}`.trim();
    }

    if (inserting && input.submitted_at == null) {
      input.submitted_at = new Date().toISOString();
    }
  },
});

/**
 * `ats_inquiry` conversion — the write that turns a quarantined inquiry into
 * the two rows the pipeline runs on.
 *
 * Fires on the update that moves `status` to `converted` (the "Convert to
 * Application" action, or a status edit), and only then:
 *
 *   1. the candidate is found by e-mail, or created — `hidden`, because an
 *      anonymous applicant consented to ONE employer seeing them for ONE job,
 *      not to the talent pool (DESIGN.md §03, consent-gated pool). A second
 *      inquiry from the same e-mail therefore attaches to the same candidate;
 *   2. the application for (job, candidate) is found — the unique index makes
 *      a second one impossible, so a repeat inquiry attaches to it — or
 *      created; its `employer` / `employer_org` come from the job, which is
 *      what puts the converting employer's staff into the row's read scope
 *      and the candidate into their `applicant_candidate_ids` (#13);
 *   3. both ids and `converted_at` are written onto the inquiry in the SAME
 *      update, so a failure anywhere leaves the inquiry `new` and unlinked.
 *
 * It runs `runAs: 'system'` because the converting user — an employer
 * administrator, a recruiter — has no create grant on `ats_candidate` and
 * none is wanted; conversion is the one sanctioned path from an anonymous row
 * to a candidate row. WHO may trigger it is decided before this hook runs, by
 * the caller's own update grant and row-level policy on `ats_inquiry`: a user
 * who cannot read the inquiry cannot convert it.
 *
 * Bulk shape refused: a predicate update sends ONE payload to every matched
 * row (ADR-0058 Addendum II D3), so per-row candidate/application links cannot
 * be carried by it. `claimSeedOwnership`'s boot-time sweep never reaches the
 * guard — its payload does not name `status`.
 */
export const InquiryConvertHook = defineHook({
  name: 'ats_inquiry_convert',
  object: 'ats_inquiry',
  events: ['beforeUpdate'],
  priority: 110,
  runAs: 'system',
  description: 'On the update that sets status to converted: find the candidate by e-mail or create one (hidden), file the application for the job, and link both back onto the inquiry.',
  handler: async (ctx: HookContext) => {
    const api = ctx.api;
    if (!api) throw new Error('ats_inquiry_convert: ctx.api is unavailable, the candidate and application cannot be written');
    const input = ctx.input as Row;
    const prev = (ctx.previous ?? {}) as Row;
    if (input.status !== 'converted' || prev.status === 'converted') return;

    const refuse = (message: string): never => {
      const refusal = new Error(message) as Error & { status?: number; code?: string };
      refusal.status = 400;
      refusal.code = 'VALIDATION_FAILED';
      throw refusal;
    };

    const options = (input as { options?: { multi?: boolean } }).options;
    if (options?.multi) refuse('Convert inquiries one at a time: a bulk update cannot carry per-row candidate and application links.');
    if (prev.status !== 'new') refuse(`Only a new inquiry can be converted; this one is ${String(prev.status ?? 'unknown')}.`);

    const email = String(input.email ?? prev.email ?? '').trim().toLowerCase();
    const fullName = String(input.full_name ?? prev.full_name ?? '').trim();
    const jobId = input.job ?? prev.job;
    if (email === '' || fullName === '' || typeof jobId !== 'string' || jobId === '') {
      refuse('An inquiry needs a job, a name and an e-mail before it can be converted.');
    }
    const phone = input.phone ?? prev.phone;
    const resume = input.resume ?? prev.resume;
    const coverLetter = input.cover_letter ?? prev.cover_letter;
    const submittedAt = prev.submitted_at;

    // 1. The candidate: matched by e-mail, else created hidden.
    let candidate = (await api.object('ats_candidate').findOne({ where: { email } })) as Row | null;
    if (!candidate) {
      const created = (await api.object('ats_candidate').insert({
        full_name: fullName,
        email,
        ...(phone != null && phone !== '' ? { phone } : {}),
        ...(resume != null && resume !== '' ? { resume_file: resume } : {}),
        seeking_status: 'actively_looking',
        profile_visibility: 'hidden',
      })) as Row | null;
      candidate = created && created.id != null
        ? created
        : ((await api.object('ats_candidate').findOne({ where: { email } })) as Row | null);
      if (!candidate || candidate.id == null) refuse('Conversion could not create the candidate row.');
    }
    const candidateId = String((candidate as Row).id);
    const candidateName = String((candidate as Row).full_name ?? fullName);

    // 2. The application for (job, candidate): attached when it exists, else filed.
    let application = (await api.object('ats_application').findOne({ where: { job: jobId, candidate: candidateId } })) as Row | null;
    if (!application) {
      const job = (await api.object('ats_job').findOne({ where: { id: jobId } })) as Row | null;
      const created = (await api.object('ats_application').insert({
        job: jobId,
        candidate: candidateId,
        ...(job?.employer != null ? { employer: job.employer } : {}),
        ...(job?.employer_org != null ? { employer_org: job.employer_org } : {}),
        ...((candidate as Row).user != null ? { candidate_user: (candidate as Row).user } : {}),
        display_name: `${candidateName} → ${String(job?.title ?? '')}`.trim(),
        stage: 'applied',
        source: 'direct',
        ...(coverLetter != null && coverLetter !== '' ? { cover_letter: coverLetter } : {}),
        ...(resume != null && resume !== '' ? { resume_snapshot: resume } : {}),
        ...(submittedAt != null ? { applied_at: submittedAt } : {}),
      })) as Row | null;
      application = created && created.id != null
        ? created
        : ((await api.object('ats_application').findOne({ where: { job: jobId, candidate: candidateId } })) as Row | null);
      if (!application || application.id == null) refuse('Conversion could not create the application row.');
    }

    // 3. The links ride the same write as the status change.
    input.candidate = candidateId;
    input.application = String((application as Row).id);
    input.converted_at = new Date().toISOString();
  },
});
