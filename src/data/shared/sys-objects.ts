/**
 * Minimal shapes of the three platform identity tables the demo seeds.
 *
 * Why shapes and not imports: the real definitions live in
 * `@objectstack/platform-objects`, which this app does not depend on (and must
 * not start depending on for a seed — AGENTS.md, capability expansion). All
 * `defineSeed()` needs for compile-time key checking is `{ name, fields }`,
 * and the loader resolves the REAL definition from the metadata service at
 * boot, so these literals carry no runtime weight. Only the columns the seed
 * writes are listed; a typo in a record key is still a compile error.
 *
 * Why seeding them is legitimate: the tables are `managedBy: 'better-auth'`,
 * and the identity write guard (ADR-0092 D2) refuses USER-context writes to
 * them. The seed loader writes as the system (`isSystem: true`), the same
 * path the platform's own default-organization bootstrap uses to insert its
 * `sys_organization` / `sys_member` rows.
 *
 * Why the demo needs them at all: every employer-side row-level policy is
 * `employer_org IN (current_user.accessible_org_ids)`, and that set is derived
 * from `sys_member`. An employer without an organization and members shows
 * ZERO rows to its own staff (DESIGN.md §03). The users seeded here are
 * directory rows only — no credential is created, so nobody can sign in as
 * them until an operator sets a password from Setup.
 */

export const SysOrganization = {
  name: 'sys_organization',
  fields: {
    id: {},
    name: {},
    slug: {},
  },
} as const;

export const SysUser = {
  name: 'sys_user',
  fields: {
    id: {},
    name: {},
    email: {},
    locale: {},
  },
} as const;

export const SysMember = {
  name: 'sys_member',
  fields: {
    id: {},
    organization_id: { type: 'lookup', reference: 'sys_organization' },
    user_id: { type: 'lookup', reference: 'sys_user' },
    role: {},
  },
} as const;

/**
 * `sys_user_position` — the record that actually confers an ATS persona
 * (ADR-0090 D3: capability = position). `position` is the position's machine
 * name as TEXT, so this is seedable without waiting for the security bootstrap.
 * Only the personas DESIGN.md §03 ties to a seeded row are granted here:
 * `access_level: admin → employer_admin`, `recruiter → employer_recruiter`,
 * candidate → `job_seeker`. Platform positions are NOT granted by seed data.
 */
export const SysUserPosition = {
  name: 'sys_user_position',
  fields: {
    id: {},
    user_id: { type: 'lookup', reference: 'sys_user' },
    position: {},
  },
} as const;
