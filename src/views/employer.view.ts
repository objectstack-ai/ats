import { defineView } from '@objectstack/spec';
import type { ListColumn } from '@objectstack/spec/ui';

/**
 * Platform-side views over `ats_employer` (card 08). The platform group's
 * "Employers" entry is bare (no `viewName`), and a bare entry lands on the
 * container's default `list` — the shell synthesises an "All Records" tab
 * only for an object that declares NO views at all, so once a container
 * exists the `all` list has to be authored or the entry lands on whichever
 * named view is declared first. Named `all` so the `default` key stays free
 * for the form below (see application.view.ts).
 *
 * The verification queue is NOT a view here. `platform.nav.ts` already
 * defines "Employers Pending" as a `filters: { verification_status: 'pending' }`
 * slice on the bare data surface, and equality is the whole definition of
 * that queue; a second definition under `listViews` would drift from the
 * first and be reachable only through the view switcher. One owner: the nav
 * slice. Which employers a caller sees is the permission set's row-level
 * rule, never a view filter.
 */

const data = { provider: 'object' as const, object: 'ats_employer' };

const columns = [
  { field: 'name', link: true },
  { field: 'industry' },
  { field: 'size' },
  { field: 'city' },
  { field: 'verification_status' },
  { field: 'service_tier' },
  // `owner_name`, not `owner` — the pointer renders as a bare `usr_ats_*` for
  // the platform reviewer this list is for; the stored mirror carries the name
  // (#67, employer.object.ts).
  { field: 'owner_name' },
] satisfies ListColumn[];

export const EmployerViews = defineView({
  name: 'ats_employer',
  label: 'Employers',
  object: 'ats_employer',

  list: {
    name: 'all',
    label: 'All Employers',
    type: 'grid',
    data,
    columns,
    userFilters: {
      element: 'dropdown',
      fields: [{ field: 'verification_status' }, { field: 'industry' }, { field: 'service_tier' }],
    },
    sort: [{ field: 'name', order: 'asc' }],
    exportOptions: { formats: ['csv', 'xlsx'] },
  },

  formViews: {
    /**
     * The record form (`form ?? formViews.default` is the key the shell binds
     * the create/edit surface to). Sections are enumerated because the object
     * declares no `fieldGroups`; the verification section is the platform's
     * review surface — `verification_note` is masked by field-level security
     * for every non-platform role, so the same form serves both audiences.
     */
    default: {
      type: 'simple',
      data,
      sections: [
        {
          name: 'company',
          label: 'Company',
          columns: 2,
          fields: ['name', 'short_name', 'logo', 'industry', 'size', 'city', 'website', 'intro'],
        },
        {
          name: 'verification',
          label: 'Verification',
          columns: 2,
          fields: ['verification_docs', 'verification_status', 'verification_note'],
        },
        {
          name: 'service',
          label: 'Service',
          columns: 2,
          fields: ['service_tier', 'service_expires_at', 'organization', 'owner'],
        },
      ],
    },
  },
});
