import { defineView } from '@objectstack/spec';
import type { ListColumn, ListView } from '@objectstack/spec/ui';

/**
 * Views over `ats_inquiry` — the public application form and the queue it
 * feeds (DESIGN.md §04, 公开投递入口; maintainer ruling on #3, option (b)).
 *
 * ## `formViews.apply_public` IS the anonymous boundary
 *
 * `sharing.allowAnonymous` + `publicLink` is what mounts the anonymous
 * endpoints — `GET /api/v1/forms/apply` (the whitelisted schema) and
 * `POST /api/v1/forms/apply/submit` (one insert) — and the console page
 * `/_console/f/apply`. The route DERIVES the authorization from this
 * declaration (a request-scoped `publicFormGrant: { object: 'ats_inquiry' }`,
 * ADR-0056 Option A) and accepts ONLY the fields the `sections` below name;
 * everything else in the body is dropped, the server-managed anchors
 * (`owner_id`, `organization_id`, …) unconditionally. There is no guest
 * permission set behind it and none could act (#32). So the `sections` of
 * this one form are the field whitelist of the anonymous write surface: add a
 * field here and an anonymous visitor can set it. `status`, `employer`,
 * `employer_org`, `candidate`, `application` are deliberately absent — the
 * stamp hook owns the first three, conversion the last two.
 *
 * ## The job arrives by prefill, not by search
 *
 * `job` is declared with a `publicPicker` because the form route strips an
 * undeclared lookup from the served sections, and the console page then
 * neither renders it nor forwards a prefill for it. The picker's search leg
 * (`GET /api/v1/forms/apply/lookup/job`) is broken upstream for every query
 * (objectstack#16581, `400 INVALID_FILTER`), so today the value arrives
 * through the job page's apply link — `/_console/f/apply?prefill_job=JOB_ID`
 * (`src/actions/apply-link.action.ts`) — and the picker becomes an
 * enhancement once the route is fixed. Its `filter` pins the picker to
 * published jobs so that fix can never turn it into an anonymous listing of
 * drafts; the stamp hook refuses an unpublished job on insert regardless.
 *
 * ## The queue
 *
 * `list` is named `all` so a bare navigation entry lands on it (#36);
 * `inbox` is the working slice (`status == 'new'`). Which rows a person sees
 * is the permission set's decision — platform staff read the whole queue,
 * an employer's staff the inquiries for their own jobs (`employer_org`) —
 * never a view filter.
 */

const data = { provider: 'object' as const, object: 'ats_inquiry' };

const columns = [
  { field: 'display_name', link: true },
  { field: 'job' },
  { field: 'email' },
  { field: 'status' },
  { field: 'submitted_at' },
  { field: 'candidate' },
  { field: 'application' },
] satisfies ListColumn[];

/** Newest inquiries first, on every grid. */
const sort = [{ field: 'submitted_at', order: 'desc' }] satisfies ListView['sort'];

const exportOptions = { formats: ['csv', 'xlsx'] } satisfies ListView['exportOptions'];

export const InquiryViews = defineView({
  name: 'ats_inquiry',
  label: 'Inquiries',
  object: 'ats_inquiry',

  list: {
    name: 'all',
    label: 'All Inquiries',
    type: 'grid',
    data,
    columns,
    sort,
    userFilters: {
      element: 'dropdown',
      fields: [{ field: 'status' }, { field: 'job' }],
    },
    exportOptions,
  },

  listViews: {
    /** The working queue: what has arrived and not yet been triaged. */
    inbox: {
      label: 'Inquiries · New',
      type: 'grid',
      data,
      columns,
      sort,
      filter: [{ field: 'status', operator: 'equals', value: 'new' }],
      exportOptions,
    },
  },

  formViews: {
    /** The internal record form — triage happens through the actions, so the triage section is read-only by convention. */
    default: {
      type: 'simple',
      data,
      columns: 2,
      sections: [
        {
          name: 'applicant',
          label: 'Applicant',
          columns: 2,
          fields: ['full_name', 'email', 'phone'],
        },
        {
          name: 'application',
          label: 'Application',
          columns: 2,
          fields: ['job', 'submitted_at', 'cover_letter', 'resume'],
        },
        {
          name: 'triage',
          label: 'Triage',
          columns: 2,
          fields: ['status', 'candidate', 'application', 'converted_at'],
        },
      ],
    },

    /**
     * PUBLIC — anonymous. The `sections` below are the whitelist of what an
     * anonymous visitor may set (header). Served at `/_console/f/apply`;
     * `GET/POST /api/v1/forms/apply`.
     */
    apply_public: {
      type: 'simple',
      data,
      title: 'Apply',
      description: 'Tell the employer who you are. They will be in touch through the platform.',
      columns: 1,
      sections: [
        {
          name: 'apply',
          label: 'Your application',
          columns: 1,
          fields: [
            {
              field: 'job',
              required: true,
              publicPicker: {
                displayFields: ['title'],
                maxResults: 10,
                filter: [{ field: 'status', operator: 'equals', value: 'published' }],
              },
            },
            { field: 'full_name', required: true },
            { field: 'email', required: true },
            { field: 'phone' },
            { field: 'cover_letter' },
            { field: 'resume' },
          ],
        },
      ],
      sharing: {
        enabled: true,
        allowAnonymous: true,
        publicLink: '/forms/apply',
      },
      submitBehavior: {
        kind: 'thank-you',
        title: 'Application received',
        message: 'Thank you — the employer will review your application and be in touch.',
      },
    },
  },
});
