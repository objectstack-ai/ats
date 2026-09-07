import { defineAction } from '@objectstack/spec/ui';

/**
 * Triage verbs on `ats_inquiry`: convert, reject, mark as spam.
 *
 * Each is ONE field write on the current record — `status` — performed AS
 * THE CALLER through the data door: `type: 'api'`, `PATCH
 * /api/v1/data/ats_inquiry/RECORD_ID`, `bodyExtra: { status }`. That is the
 * point of the shape: who may triage an inquiry is decided by the caller's
 * own update grant and row-level policy on `ats_inquiry` (platform staff, or
 * the staff of the employer whose job it is — a Harborline administrator
 * PATCHing a Quillstone inquiry gets 403, measured), and the state machine on
 * `status` decides what the write may do. The conversion itself — candidate
 * found or created, application filed, links written back — is the
 * `beforeUpdate` hook that fires on this write (`src/hooks/inquiry.hook.ts`),
 * so a status edit made any other way converts identically.
 *
 * Why not the declarative form. The spec's intended spelling for exactly this
 * is `operation: 'update'` + `patch: { status }` (#14092): same data-plane
 * write as the caller, no endpoint to spell. On cli 17.3.0 the runtime does
 * not read it yet — `objectstack validate` says so
 * (`liveness-planned-property … not read YET`), and at boot
 * `[action-governance] declared script actions with NO handler — a button
 * wired to nothing` names all three, with `POST /api/v1/actions/ats_inquiry/…`
 * answering 404 (measured). The `type: 'api'` + `PATCH` form is the one the
 * spec documents as "the way to call an explicit endpoint" in the meantime;
 * move these back to `operation`/`patch` once the runtime reads it.
 *
 * Why not a `script` body: an action body runs system-elevated (settled
 * design, #3914), so the write would bypass the caller's own row-level policy
 * and the guard would have to be re-established by hand inside the body.
 * The data door already is that guard.
 *
 * `${ctx.recordId}` is the interpolation the schema documents for `target`;
 * a bare `{recordId}` is `newTabUrl`'s convention alone and is NOT
 * substituted here. The `has()` half of each `visible` guards the sparse
 * action face (#8990): on `list_item` the bound record is the projected row,
 * and a grid that does not project `status` would otherwise abort the
 * predicate and hide the button on every row.
 */

const TARGET = '/api/v1/data/ats_inquiry/${ctx.recordId}';
const ON_NEW = 'has(record.status) && record.status == "new"';

export const ConvertInquiryAction = defineAction({
  name: 'ats_convert_inquiry',
  label: 'Convert to Application',
  description: 'Creates the candidate (or matches one by e-mail) and files the application for this job.',
  icon: 'user-round-plus',
  objectName: 'ats_inquiry',
  type: 'api',
  method: 'PATCH',
  target: TARGET,
  bodyExtra: { status: 'converted' },
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
  type: 'api',
  method: 'PATCH',
  target: TARGET,
  bodyExtra: { status: 'rejected' },
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
  type: 'api',
  method: 'PATCH',
  target: TARGET,
  bodyExtra: { status: 'spam' },
  locations: ['record_more', 'list_item'],
  visible: ON_NEW,
  successMessage: 'Inquiry marked as spam.',
  refreshAfter: true,
});
