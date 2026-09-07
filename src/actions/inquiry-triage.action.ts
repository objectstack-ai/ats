import { defineAction } from '@objectstack/spec/ui';

/**
 * Triage verbs on `ats_inquiry`: convert, reject, mark as spam.
 *
 * Each is ONE field write on the current record — `status` — and the work
 * behind "convert" (candidate found or created, application filed, links
 * written back) is the `beforeUpdate` hook that fires on that write
 * (`src/hooks/inquiry.hook.ts`), so a status edit made any other way — the
 * record form, a REST `PATCH /api/v1/data/ats_inquiry/ID` — converts
 * identically. The state machine on `status` decides what the write may do.
 *
 * ## Shape: a `script` body, gated on the caller-scope record load
 *
 * The spec's intended spelling for exactly this is the declarative
 * `operation: 'update'` + `patch: { status }` (#14092) — the platform writes
 * the patch AS THE CALLER, so the caller's own update grant and row-level
 * policy are the gate. On cli 17.3.0 the runtime does not read it yet:
 * `objectstack validate` says `liveness-planned-property … not read YET`,
 * boot logs `[action-governance] declared script actions with NO handler —
 * a button wired to nothing`, and `POST /api/v1/actions/ats_inquiry/…`
 * answers 404 (all measured, `docs/evidence/issue-37/`). The second spelling
 * the spec documents — `type: 'api'` + `PATCH …/ats_inquiry/${ctx.recordId}`
 * — dispatches from the console, and the console this runtime serves does
 * not interpolate the token: the request reached the server as the literal
 * `{ctx.recordId}` (`UnknownFilterTokenError`, measured through the browser).
 *
 * So the button is a sandboxed `script` body. An action body runs
 * system-elevated (settled design, #3914), which is why the first line is
 * the guard: the runtime loads the subject record in the CALLER's own scope
 * before the body runs and reports `ctx.recordLoadDenied` when that load did
 * not deliver the row (#14143) — an employer's staff cannot read another
 * employer's inquiry (row-level policy, 404 measured), so they cannot triage
 * it either (403 measured through this route). On this object every set that
 * may read an inquiry may also edit it, so "could read it" is the edit gate
 * exactly; the comment above the permission sets says so, and a future
 * read-only role on `ats_inquiry` must revisit this action. The hook runs
 * `runAs: 'system'` regardless of who triggers it; the state machine
 * refuses an illegal transition whoever the caller is.
 *
 * Move these back to `operation` / `patch` once the runtime reads it.
 *
 * The `has()` half of each `visible` guards the sparse action face (#8990):
 * on `list_item` the bound record is the projected row, and a grid that does
 * not project `status` would otherwise abort the predicate and hide the
 * button on every row.
 */

const ON_NEW = 'has(record.status) && record.status == "new"';

/** The one write, as a self-contained sandbox body (no free identifiers — the sandbox refuses them). */
const triageBody = (status: 'converted' | 'rejected' | 'spam') => ({
  language: 'js' as const,
  source: `
    if (ctx.recordLoadDenied) {
      const denied = new Error('You cannot triage this inquiry.');
      denied.status = 403; denied.code = 'PERMISSION_DENIED';
      throw denied;
    }
    const id = ctx.recordId || (ctx.record && ctx.record.id);
    if (!id) {
      const missing = new Error('Open an inquiry to triage it.');
      missing.status = 400; missing.code = 'VALIDATION_FAILED';
      throw missing;
    }
    await ctx.api.object('ats_inquiry').update({ id: id, status: '${status}' });
    return { id: id, status: '${status}' };
  `,
  capabilities: ['api.write' as const],
  timeoutMs: 10000,
});

export const ConvertInquiryAction = defineAction({
  name: 'ats_convert_inquiry',
  label: 'Convert to Application',
  description: 'Creates the candidate (or matches one by e-mail) and files the application for this job.',
  icon: 'user-round-plus',
  objectName: 'ats_inquiry',
  type: 'script',
  body: triageBody('converted'),
  locations: ['record_header', 'list_item'],
  visible: ON_NEW,
  confirmText: 'Convert this inquiry? A candidate is created (or matched by e-mail) and an application is filed for the job.',
  successMessage: 'Inquiry converted — the application is in the pipeline.',
  errorMessage: 'The inquiry could not be converted.',
  refreshAfter: true,
});

export const RejectInquiryAction = defineAction({
  name: 'ats_reject_inquiry',
  label: 'Reject',
  icon: 'x-circle',
  objectName: 'ats_inquiry',
  type: 'script',
  body: triageBody('rejected'),
  locations: ['record_header', 'list_item'],
  visible: ON_NEW,
  successMessage: 'Inquiry rejected.',
  refreshAfter: true,
});

export const SpamInquiryAction = defineAction({
  name: 'ats_spam_inquiry',
  label: 'Mark as Spam',
  icon: 'shield-ban',
  objectName: 'ats_inquiry',
  type: 'script',
  body: triageBody('spam'),
  locations: ['record_more', 'list_item'],
  visible: ON_NEW,
  successMessage: 'Inquiry marked as spam.',
  refreshAfter: true,
});
