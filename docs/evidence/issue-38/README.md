# Evidence — #38, the app declares `membershipPolicy: 'invite-only'`

Every file was produced on `claude/issue-38-invite-only`, `@objectstack/cli` 17.3.0, port 4621, with
`OS_PLATFORM_OWNER_EMAIL=admin@objectos.ai npx objectstack dev --fresh --log-level info`. Counts were
taken only after `[Seeder] Seed loading complete`; REST list reads assert `hasMore == false` and
`len(records) == total` before they are counted.

**BEFORE** is not `origin/main`: it is this same branch with `AtsAuthMembershipPolicyPlugin` removed
from the `plugins` array of `objectstack.config.ts` and the artifact rebuilt (`Runtime: 2 plugins`),
so the only difference between the two columns is the declaration itself. The file was restored with
`git checkout HEAD -- objectstack.config.ts` and verified byte-identical (`git hash-object` back to
`a712287646e095fc1e37716a5efa847ac8de60ba`, `git diff HEAD` clean) after each pass.

| File | What it holds |
|:--|:--|
| `01-backfill-and-personas-memory.txt` | Driver `memory`: the `bound 82` backfill line before, its absence after, and the seven-persona read table on both sides. |
| `02-backfill-and-personas-sqlite.txt` | Driver `sqlite`: the same pair, with `sys_member` read straight out of the database file (the REST census is itself organization-filtered on sqlite). |
| `03-precedence-persistence-and-admin-create-user.txt` | `OS_AUTH_MEMBERSHIP_POLICY=auto` overriding the declaration; a second boot over a persistent sqlite file; and the upstream admin create-user path that binds regardless of the policy. |

The backfill logs **only when it binds someone** (`if (res.bound > 0)`, `plugin-auth/src/auth-plugin.ts`),
so "0 bound" has no line of its own — the absence of the line is the reading, and the BEFORE column
is its control.
