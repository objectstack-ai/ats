import { defineAction } from '@objectstack/spec/ui';

/**
 * Triage verbs on `ats_inquiry`: convert, reject, mark as spam.
 *
 * All three are the DECLARATIVE single-row write — `operation: 'update'` +
 * `patch` — which the platform action route performs on the data plane AS
 * THE CALLER, never system-elevated (spec: "the caller's permissions, the
 * object's hooks and its validations fire as for a user edit"). That is the
 * point: who may triage an inquiry is decided by the caller's own update grant
 * and row-level policy on `ats_inquiry` (platform staff, or the staff of the
 * employer whose job it is), and the state machine on `status` decides what
 * the write may do. The conversion itself — candidate found or created,
 * application filed, links written back — is the `beforeUpdate` hook that
 * fires on this write (`src/hooks/inquiry.hook.ts`), so a status edit made
 * any other way converts identically.
 *
 * The `has()` half of each `visible` guards the sparse action face (#8990):
 * on `list_item` the bound record is the projected row, and a grid that does
 * not project `status` would otherwise abort the predicate and hide the
 * button on every row.
 */

const ON_NEW = 'has(record.status) && record.status == "new"';

export const ConvertInquiryAction = defineAction({
  name: 'ats_convert_inquiry',
  label: 'Convert to Application',
  description: 'Creates the candidate (or matches one by e-mail) and files the application for this job.',
  icon: 'user-round-plus',
  objectName: 'ats_inquiry',
  operation: 'update',
  patch: { status: 'converted' },
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
  operation: 'update',
  patch: { status: 'rejected' },
  locations: ['record_header', 'list_item'],
  visible: ON_NEW,
  successMessage: 'Inquiry rejected.',
  undoable: true,
  refreshAfter: true,
});

export const SpamInquiryAction = defineAction({
  name: 'ats_spam_inquiry',
  label: 'Mark as Spam',
  icon: 'shield-ban',
  objectName: 'ats_inquiry',
  operation: 'update',
  patch: { status: 'spam' },
  locations: ['record_more', 'list_item'],
  visible: ON_NEW,
  successMessage: 'Inquiry marked as spam.',
  undoable: true,
  refreshAfter: true,
});
