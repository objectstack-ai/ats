/**
 * The signable demo personas — the handful of seeded people who get a
 * `sys_account` credential row and can therefore actually sign in.
 *
 * Why a handful and not all 112 humans: a demo needs named, documented logins
 * that each land on a different surface, not an anonymous crowd. The set is
 * the minimum that exercises every audience group of the `ats` app
 * (DESIGN.md §04) plus the platform owner:
 *
 *   platform owner     admin@objectos.ai           kernel-level standing via OS_PLATFORM_OWNER_EMAIL
 *   platform admin     admin@platform.example      platform_admin      → Platform group
 *   platform ops       ops@platform.example        platform_ops        → Platform group
 *   employer admin     admin@quillstone.example    employer_admin      → Hiring group (Quillstone)
 *   recruiter          talent1@quillstone.example  employer_recruiter  → Hiring group (Quillstone)
 *   employer admin     admin@harborline.example    employer_admin      → Hiring group (Harborline)
 *   job seeker         candidate01@mail.example    job_seeker          → Job Seeker group
 *
 * Two employer administrators at DIFFERENT employers are deliberate: that is
 * the pair the isolation acceptance ("two employer accounts see disjoint
 * pipelines") is checked with once #18 lifts.
 *
 * ## The passwords are public on purpose
 *
 * These are fictional demo accounts in a public repository; the password is
 * documented in the README and is not a secret. Every persona shares
 * `demo1234`; the platform owner keeps the runtime's own documented dev
 * default (`admin123`) so the login-page hint and every ObjectStack guide
 * that mentions it stay true. Do not deploy the demo seed anywhere that
 * matters — that is true of all of `src/data/`, and truer of this file.
 *
 * ## Why the platform owner is seeded here at all
 *
 * The runtime mints `admin@objectos.ai` itself at `kernel:ready` — but only
 * while the database holds NO local password login anywhere
 * (`plugin-auth/src/dev-admin-seed-gate.ts`, reason `local-login-exists`).
 * The seed loader runs first, so the moment this file seeds one credential
 * row the runtime's own dev admin is never created and the platform owner
 * cannot sign in. Seeding the owner's row here, with the same address and
 * password, keeps that door open; the runtime then recognises the row as its
 * default credential and still surfaces the hint. `email_verified: true` is
 * load-bearing: the `OS_PLATFORM_OWNER_EMAIL` anchor ignores an unverified
 * row (`@objectstack/core`, `matchesConfiguredPlatformAdmin`).
 *
 * ## How the digests were produced — do not invent another format
 *
 * `sys_account.password` holds the digest better-auth verifies with
 * (`@better-auth/utils/password`, scrypt N=16384 r=16 p=1 dkLen=64, stored as
 * `{saltHex}:{keyHex}`, password NFKC-normalised). The literals below were
 * minted with Node's own scrypt, which is the same primitive:
 *
 *   node -e 'const {scryptSync,randomBytes}=require("node:crypto");
 *            const s=randomBytes(16).toString("hex");
 *            console.log(s+":"+scryptSync(process.argv[1].normalize("NFKC"),s,64,
 *              {N:16384,r:16,p:1,maxmem:128*16384*16*2}).toString("hex"))' 'demo1234'
 *
 * and each one was round-tripped through better-auth's `verifyPassword`
 * before it was committed. They are literals rather than computed at build
 * time so two consecutive builds stay byte-identical and the config keeps
 * evaluating where `node:crypto` is absent. Change a password ⇒ re-mint its
 * digest with the recipe above and update the README table.
 */

import { adminEmail, candidateEmail, candidateUserId, recruiterEmail, staffUserId, PLATFORM_ADMIN, PLATFORM_OPS } from './identity.js';
import {
  EmployerAdminPosition,
  EmployerRecruiterPosition,
  JobSeekerPosition,
  PlatformAdminPosition,
  PlatformOpsPosition,
} from '../../security/positions.js';

/** The one password every seeded ATS persona signs in with. Public by design (see header). */
export const DEMO_PASSWORD = 'demo1234';

/**
 * The platform owner: the address `OS_PLATFORM_OWNER_EMAIL` names in the `dev`
 * script, on the runtime's own documented dev credentials. Locale-independent
 * (the name is the runtime's default, not a pack string) and holds NO ATS
 * position: owner standing confers the kernel capabilities only, so this
 * account sees Setup and the `ats` app, and inside it the groups of the
 * positions it holds — none. The ATS surfaces are demonstrated by the
 * personas below.
 *
 * ⚠️ The id, the seed order and the `created_at` on this row are load-bearing
 * together. Under the `single` tenancy posture the security bootstrap still
 * runs its first-user carve-out: it reads an UNORDERED 50-row window of
 * `sys_user`, sorts it by `created_at`, and hands the legacy
 * `admin_full_access` grant — and ownership of every seeded row — to the
 * first user in it that has a `sys_account`. Before this file nobody had one,
 * so the door stayed shut; now seven people do, and whoever wins is whoever
 * the driver happens to return first: insertion order on the memory driver,
 * id order on SQL. Measured on sqlite before this was pinned: the window was
 * `usr_ats_c01..c50`, the owner was not in it, and the job seeker
 * `candidate01@mail.example` was promoted to platform admin. So the owner is
 * (a) inserted first, (b) given an id that collates before every other user
 * id (`0` sorts before every letter in ASCII, UTF-8 and MySQL's
 * case-insensitive collations alike), and (c) stamped a `created_at` a year
 * older than the rest — each covers a driver ordering the others do not.
 * Do not rename this id without re-checking the promotion line on BOTH
 * drivers (`[security] first user promoted to platform admin: ...`).
 */
export const PLATFORM_OWNER = {
  id: 'usr_ats_0_owner',
  email: 'admin@objectos.ai',
  name: 'Dev Admin',
  password: 'admin123',
  passwordHash:
    '7441e5757422fb78692a1277f39dc8f8:ebbc25818f12eb0e8f3b6ee49160608a9aad75042a6ae1af680e093b2aa194fabe9e6c59c6c13e190f88f608ff0ca1a06892bb0a1d26e57f1d165d1e838bff51',
} as const;

export interface SignablePersona {
  /** Stable handle, used in the `sys_account` row id. */
  key: string;
  /** The `sys_user.id` the seed assigns — `sys_account.account_id` must equal it (better-auth matches on it). */
  userId: string;
  /** Sign-in address; also the natural key `sys_account.user_id` resolves through. */
  email: string;
  /** The ATS position this persona holds (`sys_user_position.position`). */
  position: string;
  /** scrypt digest of `DEMO_PASSWORD` under a per-row salt (recipe in the header). */
  passwordHash: string;
}

const QUILLSTONE = 'quillstone';
const HARBORLINE = 'harborline';

/** Six ATS personas, one per audience surface, in README order. */
export const SIGNABLE_PERSONAS: readonly SignablePersona[] = [
  {
    key: 'platform_admin',
    userId: PLATFORM_ADMIN.id,
    email: PLATFORM_ADMIN.email,
    position: PlatformAdminPosition.name,
    passwordHash:
      'dfd835a28613879a929da5285374b8f5:5b598036dc50823faeb0ef5ae3f7d2c6f3c0009cb571d0002c0c30416dabe3c185aebea7730a0879fff3bf25d0827192b1f04713350cd2577a52693104deb649',
  },
  {
    key: 'platform_ops',
    userId: PLATFORM_OPS.id,
    email: PLATFORM_OPS.email,
    position: PlatformOpsPosition.name,
    passwordHash:
      '8fc9c4c8228d34ace79961192648e954:c442b538f9dd076e32dda4994febf84d060069d026a3b96491eac00cc1efed52afe8b73e3235bd49baa15105be55733e6eabfd3005bf3e47e005ebbf1a37ba43',
  },
  {
    key: 'quillstone_admin',
    userId: staffUserId(QUILLSTONE, 'admin'),
    email: adminEmail(QUILLSTONE),
    position: EmployerAdminPosition.name,
    passwordHash:
      '80bb5a951ffb2b09d2b016ffcdc8c1a7:872a4509dce3da33ba0a0e814f42df2bcf30c19dd4b8cfd60d29bec32fced45d2cea63debe22179e681713fa7d6664a0953a3507f5e2e8029231806581baf98f',
  },
  {
    key: 'quillstone_recruiter',
    userId: staffUserId(QUILLSTONE, 'r1'),
    email: recruiterEmail(QUILLSTONE, 0),
    position: EmployerRecruiterPosition.name,
    passwordHash:
      '507d3a2697290edbce0b680694f48ff5:e7b2472cb3c5cec8a83c3fec94aed3b1ef1f4b9a834943c97f6e10ba0402ecc3369f4cf0c9b6800718426d024194f063720dd65986092c10fd404bc083011a62',
  },
  {
    key: 'harborline_admin',
    userId: staffUserId(HARBORLINE, 'admin'),
    email: adminEmail(HARBORLINE),
    position: EmployerAdminPosition.name,
    passwordHash:
      '6548e19e63af2a1c900a3576a9d05753:f6fbe8139e3187d22ce2b4a9f19be89d15688c7d71878388c8f99b5785cb27936d1a79d4c3205f6537edaf630d997f5b9056547e54f872773fe6457d4c09dee8',
  },
  {
    key: 'job_seeker',
    userId: candidateUserId(0),
    email: candidateEmail(0),
    position: JobSeekerPosition.name,
    passwordHash:
      'c9dc6848a3a2a82f3cc3a5faf64fda58:d3f72fcf35e76b983a769a2de4034ad963682d47cc111078fb67230615bedae1c201ff5bab9f35790c4a71fd2d239928cb68c2e626f3be057aa684f81df4a1e3',
  },
];

/** E-mails of every row that carries a credential — the owner plus the six personas. */
export const SIGNABLE_EMAILS: ReadonlySet<string> = new Set([
  PLATFORM_OWNER.email,
  ...SIGNABLE_PERSONAS.map((p) => p.email),
]);
