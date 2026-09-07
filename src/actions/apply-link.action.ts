import { defineAction } from '@objectstack/spec/ui';

/**
 * "Public apply link" on a published `ats_job` — opens the anonymous
 * application form with THIS job prefilled:
 *
 *   /_console/f/apply?prefill_job=JOB_ID
 *
 * The job arrives by prefill, not by search (issue #37, ruling on #3): the
 * public lookup route is broken upstream for every query
 * (objectstack#16581), so the form's job picker cannot find anything today,
 * and the link from the job page is the intended entry regardless — a
 * visitor applies to the job they are looking at. `prefill_<field>` is the
 * console form page's URL prefill contract (#4278 ruling).
 *
 * Shown to whoever can open the job record — an employer's staff, platform
 * staff — as the link to hand out or embed on a careers page. Nothing about
 * it is a permission: the form is anonymous by declaration
 * (`inquiry.view.ts`, `formViews.apply_public`).
 */
export const PublicApplyLinkAction = defineAction({
  name: 'ats_public_apply_link',
  label: 'Public Apply Link',
  description: 'Open the anonymous application form for this job — the link to share with applicants.',
  icon: 'external-link',
  objectName: 'ats_job',
  type: 'url',
  target: '/_console/f/apply?prefill_job=${record.id}',
  openIn: 'new-tab',
  locations: ['record_header'],
  visible: 'has(record.status) && record.status == "published"',
});
