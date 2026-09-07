# Evidence — issue #37 (public application entry: `ats_inquiry`, the anonymous form, conversion) and #32 (the guest grant)

Captured on 2026-09-07 against `@objectstack/cli` 17.3.0, booted as
`OS_PLATFORM_OWNER_EMAIL=admin@objectos.ai npx objectstack dev --fresh [--database-driver memory] -p 4313 --log-level info`,
once on the memory driver and once on the default (sqlite) driver. Every "anonymous" request below carries **no cookie
and no token**. The probe scripts lived in the scratchpad and are not committed; every transcript names the request,
the status and the relevant fields of the reply.

| File | What it shows |
|:--|:--|
| `01-anonymous-form-and-conversion-memory.txt` | The full run on the memory driver: anonymous `GET /api/v1/forms/apply` (200, exactly the whitelisted fields) · anonymous `POST …/submit` (201, **exactly one** `ats_inquiry` row; the e-mail normalised) · smuggled keys inert · draft / pending / bogus job refused 400 · every anonymous read 401, the just-written row included · conversion by Quillstone's administrator (candidate + application in one write) · the converting employer reads the new `hidden` candidate and the application (#13 applicant path) while Harborline cannot · three inquiries from one e-mail → 1 candidate, 2 applications · a seeded candidate's inquiry attaches to the seeded row · the recruiter reads the queue with `email`/`phone` sealed and still converts · cross-employer triage 403 · seeker 403 · the state machine. Regression counts before/after. |
| `02-anonymous-form-and-conversion-sqlite.txt` | The same run on the default sqlite driver. |
| `03-guest-grant-inert-memory.txt` · `04-guest-grant-inert-sqlite.txt` | **#32.** Permission sets named `guest_portal` (the only set name the route ever puts on the context) and `ats_guest_apply` (the one this repository used to declare), both **denying** create/read on `ats_inquiry`, are declared, registered (`[Registry] Registered permission: ats:guest_portal`) and live — and the anonymous submit still answers **201**. Restore proven by blob hash against `HEAD`. The set was inert; it is deleted. |
| `05-ablation-rls-memory.txt` · `06-ablation-rls-sqlite.txt` | **Ablation A.** The two employer-side row-level policies on `ats_inquiry` removed: Harborline's administrator goes from its own 2 inquiries to all 8 across six organizations; restored (hash match) → 2 again. The guard is not vacuous. |
| `07-ablation-hook-guard-memory.txt` · `08-ablation-hook-guard-sqlite.txt` | **Ablation B.** The stamp hook's published-job guard removed: an anonymous submit against a **draft** job lands (201) where the shipped code refuses it (400); restored (hash match) → 400 again. |
| `20-anonymous-public-form-prefilled.png` · `21-anonymous-public-form-thank-you.png` | The console's public page `/_console/f/apply?prefill_job=JOB_ID` in a fresh browser context with no session: the job arrives by prefill; the browser submit lands one inquiry and shows the thank-you panel. |
| `22-platform-inquiries-queue.png` | Signed in as `admin@platform.example` (Platform group): the inquiry queue (`ats_inquiry.inbox`). |
| `23-platform-inquiry-record-new.png` · `24a-platform-convert-confirm.png` · `24-platform-inquiry-converted.png` · `25-platform-inquiry-converted-reloaded.png` · `26-platform-converted-application.png` | The same persona opens the browser-submitted inquiry, clicks **Convert to Application**, confirms, and the record shows `converted` with its candidate and application links; the application it became. |
| `09-triage-actions-sqlite.txt` | The triage action route across personas (`POST /api/v1/actions/ats_inquiry/ACTION/ID`): anonymous 401 · seeker refused · Harborline's administrator on a Quillstone inquiry refused (`recordLoadDenied`) and the row untouched · Quillstone's administrator and recruiter, and platform ops, convert · a second convert refused by the state machine · the Reject verb. |
| `browser-pass-anonymous-notes.txt` · `browser-pass-admin-notes.txt` | The notes the browser scripts printed while taking the shots above (what they filled, what the API reported after each step). |
| `30-api-target-not-interpolated-by-served-console.txt` | **Why the buttons are `script` bodies.** The first cut of the triage actions was the spec-recommended `type: 'api'` + `PATCH …/ats_inquiry/${ctx.recordId}`; the served console sent the token literally and the server answered `UnknownFilterTokenError`. Kept as the measurement behind the action file's header. |

## Numbers to hold the release to

Memory and sqlite agree on every row below (#39's tenancy-scoped zeros for platform personas on sqlite do not touch `ats_inquiry`, which is platform-global).

| Persona | employer / member / job / application / offer / candidate / inquiry — before any conversion |
|:--|:--|
| Quillstone admin | 1 / 3 / 5 / 27 / 2 / 70 / **2 seeded (+ whatever the probe submitted to Quillstone jobs)** |
| Harborline admin | 1 / 3 / 5 / 31 / 2 / 69 / **2** |

After Quillstone converts an inquiry from a person with no candidate row: candidate 70 → **71**, application 27 → **28**; Harborline unchanged (69 / 31) and answers 404 on both new ids.

Two things in the browser shots worth knowing: the platform administrator's **Employers Pending** queue is empty on sqlite — that is #39 (tenancy-scoped objects read 0 to platform personas on that driver), not this card; and the browser-converted inquiry attached to an **existing** application (`ub-gh2NhbQ_sBQ4v`), because the same e-mail had already been converted for the same job over REST a minute earlier (`09-…`, step 6) — the `(job, candidate)` de-duplication doing its job in the UI too.
