#!/usr/bin/env node
/**
 * check-i18n-source — does `src/translations/en.ts` still say what the source says?
 *
 * ## The hole this closes (#63)
 *
 * `en` is the SOURCE locale: every inline `label:` in `src/` already is the English
 * text, and the runtime falls back to it. `src/translations/en.ts` restates those
 * strings anyway, so the two locale files have the same shape and a translator can
 * diff them line for line (#62 kept the file for exactly that). The cost is a
 * silent-override trap the file's own header names: rename `ats_job.fields.status`
 * from "Status" to "Review status" in `job.object.ts` and the bundle keeps serving
 * "Status" to every English user, forever — a stale entry WINS over the source
 * label at runtime.
 *
 * Nothing caught it. Measured on this repository before this script existed:
 * `pnpm validate`, `pnpm typecheck` and `pnpm lint --i18n-strict` are all green
 * with a drifted entry, and green with a MISSING `en` entry too — `os i18n check`
 * reports `en` at 100 % coverage (expected 1265 / translated 1265) because the
 * source label counts as the translation for the default locale. Coverage cannot
 * see this class of bug: it counts whether a key EXISTS, never whether it still
 * says what the metadata says.
 *
 * ## What this checks
 *
 * Both directions between the bundle and the labels the metadata declares:
 *
 *   mismatch — the key exists on both sides and the strings differ  (the trap)
 *   orphan   — the bundle has a key the metadata declares no text for (a deleted
 *              or renamed field leaves its entry behind, overriding nothing a
 *              reader will ever see, and still diffed by a translator)
 *   missing  — the metadata declares text the bundle never restates (a new field
 *              lands, `zh-CN` gets its entry and `en.ts` does not, and the
 *              side-by-side the file exists for is broken)
 *
 * All three are drift and all three fail. `missing` is in scope precisely because
 * no other gate covers it: `--i18n-strict` gates the NON-default locales.
 *
 * ## Where the two sides come from
 *
 * Both are in `dist/objectstack.json`, so the comparison needs no TypeScript
 * parsing and reads what actually ships:
 *
 *   bundle side — `translations[].<defaultLocale>`, the parsed `en.ts`.
 *   source side — two collectors, deliberately not one:
 *
 *     1. `os i18n extract --json` for this stack. That command is built on
 *        `collectExpectedEntries`, which the CLI documents as the SINGLE
 *        definition of what is translatable at all (`os lint`'s coverage gate
 *        consumes the same walk). Using it means a surface the platform adds
 *        later — a new key face, a new metadata kind — arrives here for free
 *        instead of waiting for someone to notice this file is behind.
 *     2. A local resolver for the view-nested text the platform walk does not
 *        address: a view document's default `list`, its `listViews` and its
 *        `formViews`. `en.ts` restates 25 of these; without collector 2 they
 *        would be 25 keys compared against nothing.
 *
 * `metadataForms.*` is dropped from collector 1 — Studio metadata-form copy the
 * platform packages own and ship, the bucket `pnpm lint` reports as
 * "platform built-ins: 773 i18n issue(s) hidden" (#60). Not this app's strings,
 * and not in `en.ts`. The count printed below is 769, not 773: 773 is the number
 * of metadata-form ADDRESSES the walk records, 769 of them carry a string the
 * extract can seed. Both numbers are the platform's, and neither is compared.
 *
 * ## Why an unknown key is a failure and never a skip
 *
 * A gate whose coverage is invisible is the defect class this card closes, so this
 * script has no skip path. Every bundle key is either compared or reported as an
 * `orphan`; a key shape neither collector knows lands in `orphan` with its own
 * count, loudly, rather than passing quietly. Two more guards keep a green run
 * meaningful: `--self-test` proves the comparator still reports a mismatch, an
 * orphan and a missing key on synthetic input (it runs first, in the same npm
 * script and in CI), and the real run refuses to report success when either side
 * came back empty — a build that emitted no translations, or an extract that
 * returned nothing, is a failure here, not a pass.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ARTIFACT = join(ROOT, 'dist', 'objectstack.json');
const CLI = join(ROOT, 'node_modules', '.bin', 'objectstack');

/** The platform-owned bucket: Studio metadata-form copy, shipped by the platform packages. */
const PLATFORM_GROUP = 'metadataForms';

// ───────────────────────────────────────────────────────────────────────────────
// Small helpers
// ───────────────────────────────────────────────────────────────────────────────

const ESC = '\u001b';
const paint = (code, s) => `${ESC}[${code}m${s}${ESC}[0m`;
const bold = (s) => paint('1', s);
const red = (s) => paint('31', s);
const green = (s) => paint('32', s);
const dim = (s) => paint('2', s);

class CheckError extends Error {}

/** Fail with a located, corrective message rather than a stack trace. */
function fail(message) {
  throw new CheckError(message);
}

/**
 * Flatten a translation tree into dotted keys.
 *
 * Every leaf must be a string: `TranslationData` has no array or number leaves,
 * so one is a shape this script does not understand and must not silently drop.
 */
function flatten(tree, prefix, into = new Map()) {
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') {
      into.set(path, value);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path, into);
    } else {
      fail(`translation leaf "${path}" is a ${Array.isArray(value) ? 'array' : typeof value}, not a string — `
        + 'this script only understands string leaves, and refuses to skip one it cannot compare.');
    }
  }
  return into;
}

// ───────────────────────────────────────────────────────────────────────────────
// The comparator — the part `--self-test` exercises
// ───────────────────────────────────────────────────────────────────────────────

/**
 * Compare a bundle against the source labels.
 *
 * Pure: `bundle` and `source` are `Map` of dotted key to string, `origins` is a
 * `Map` naming where each source string was read from (used only in the report).
 * Returns the three finding lists, each sorted by key.
 */
export function compare(bundle, source, origins = new Map()) {
  const mismatches = [];
  const orphans = [];
  const missing = [];

  for (const [key, bundleValue] of bundle) {
    if (!source.has(key)) {
      orphans.push({ key, bundleValue });
      continue;
    }
    const sourceValue = source.get(key);
    if (sourceValue !== bundleValue) {
      mismatches.push({ key, bundleValue, sourceValue, origin: origins.get(key) });
    }
  }
  for (const [key, sourceValue] of source) {
    if (!bundle.has(key)) missing.push({ key, sourceValue, origin: origins.get(key) });
  }

  const byKey = (a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
  mismatches.sort(byKey);
  orphans.sort(byKey);
  missing.sort(byKey);

  const compared = [...bundle.keys()].filter((key) => source.has(key)).length;
  return { mismatches, orphans, missing, compared };
}

// ───────────────────────────────────────────────────────────────────────────────
// Collector 1 — the platform's own definition of the translatable surface
// ───────────────────────────────────────────────────────────────────────────────

/**
 * Run `os i18n extract --json` and return its default-locale skeleton, minus the
 * platform-owned group.
 *
 * `--no-merge` is load-bearing: without it the extractor omits every key the
 * bundle already has, which is every key this check exists to compare.
 * `--no-objects-only` is load-bearing too: the default emits only the objects
 * subtree, and `en.ts` also carries apps, dashboards and datasets.
 */
function collectPlatformSurface(defaultLocale) {
  if (!existsSync(CLI)) {
    fail(`the ObjectStack CLI is not installed at ${CLI} — run \`pnpm install\` first.`);
  }
  let raw;
  try {
    raw = execFileSync(
      CLI,
      ['i18n', 'extract', '--json', '--no-merge', '--no-objects-only',
        `--locales=${defaultLocale}`, `--default-locale=${defaultLocale}`],
      { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] },
    );
  } catch (error) {
    const stderr = String(error.stderr ?? '').trim();
    fail(`\`os i18n extract --json\` failed (exit ${error.status ?? '?'}).\n${stderr || error.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail('`os i18n extract --json` did not print JSON. This check reads the platform\'s own translatable '
      + 'surface from that command; it will not fall back to a partial surface of its own.');
  }

  const skeleton = parsed?.bundles?.[defaultLocale];
  if (!skeleton || typeof skeleton !== 'object') {
    fail(`\`os i18n extract --json\` returned no "${defaultLocale}" bundle (bundles: `
      + `${Object.keys(parsed?.bundles ?? {}).join(', ') || 'none'}). The extract shape changed; teach this `
      + 'script the new one rather than letting it compare against nothing.');
  }

  const appOnly = Object.fromEntries(
    Object.entries(skeleton).filter(([group]) => group !== PLATFORM_GROUP),
  );
  const platformGroup = skeleton[PLATFORM_GROUP];
  const platformKeys = platformGroup ? flatten({ [PLATFORM_GROUP]: platformGroup }, '').size : 0;
  return { source: flatten(appOnly, ''), platformKeys };
}

// ───────────────────────────────────────────────────────────────────────────────
// Collector 2 — view-nested text the platform walk does not address
// ───────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the `objects.OBJECT._views.NAME.label` / `.description` keys whose text
 * lives INSIDE a view document rather than on it:
 *
 *   view.list                the default list view (`_views.all.*` here, since
 *                            every view document in this app names its list "all")
 *   view.listViews[NAME]     the saved list views (pipeline, inbox_*, mine, …)
 *   view.formViews[NAME]     the form views; a form view spells its heading
 *                            `title`, and the bundle key face spells it `label`
 *
 * A name that resolves to two different strings within one object is an ambiguity,
 * not a coin flip: it is reported and fails.
 */
export function collectViewNestedSurface(views) {
  const source = new Map();
  const origins = new Map();
  const ambiguous = [];

  const put = (objectName, viewName, key, value, origin) => {
    if (typeof value !== 'string' || value.length === 0) return;
    const path = `objects.${objectName}._views.${viewName}.${key}`;
    const seen = source.get(path);
    if (seen !== undefined && seen !== value) {
      ambiguous.push({
        key: path,
        a: `${origins.get(path)} = ${JSON.stringify(seen)}`,
        b: `${origin} = ${JSON.stringify(value)}`,
      });
      return;
    }
    source.set(path, value);
    origins.set(path, origin);
  };

  for (const view of views ?? []) {
    const objectName = view?.object;
    if (!objectName || !view?.name) continue;

    const list = view.list;
    if (list && typeof list === 'object' && typeof list.name === 'string') {
      put(objectName, list.name, 'label', list.label, `views.${view.name}.list.label`);
      put(objectName, list.name, 'description', list.description, `views.${view.name}.list.description`);
    }
    for (const [name, listView] of Object.entries(view.listViews ?? {})) {
      put(objectName, name, 'label', listView?.label, `views.${view.name}.listViews.${name}.label`);
      put(objectName, name, 'description', listView?.description, `views.${view.name}.listViews.${name}.description`);
    }
    for (const [name, formView] of Object.entries(view.formViews ?? {})) {
      put(objectName, name, 'label', formView?.title, `views.${view.name}.formViews.${name}.title`);
      put(objectName, name, 'description', formView?.description, `views.${view.name}.formViews.${name}.description`);
    }
  }

  return { source, origins, ambiguous };
}

// ───────────────────────────────────────────────────────────────────────────────
// Freshness — a stale artifact is a check that measured yesterday's tree
// ───────────────────────────────────────────────────────────────────────────────

function newestSourceMtime() {
  let newest = 0;
  const visit = (path) => {
    const stat = statSync(path);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path)) visit(join(path, entry));
    } else if (stat.mtimeMs > newest) {
      newest = stat.mtimeMs;
    }
  };
  visit(join(ROOT, 'src'));
  visit(join(ROOT, 'objectstack.config.ts'));
  return newest;
}

// ───────────────────────────────────────────────────────────────────────────────
// Report
// ───────────────────────────────────────────────────────────────────────────────

function printFindings(title, rows, render) {
  console.log('');
  console.log(`  ${red(bold(`${title} (${rows.length})`))}`);
  for (const row of rows) {
    for (const line of render(row)) console.log(`    ${line}`);
  }
}

function run() {
  console.log('');
  console.log(bold('◆ i18n source parity'));
  console.log('────────────────────────────────────────');

  if (!existsSync(ARTIFACT)) {
    fail('no build artifact at dist/objectstack.json — this check reads both sides from it.\n'
      + '  Run `pnpm check:i18n-source` (it builds first) or `npx objectstack build`.');
  }
  const artifactMtime = statSync(ARTIFACT).mtimeMs;
  if (newestSourceMtime() > artifactMtime) {
    fail('dist/objectstack.json is older than src/ — it would be compared against a tree that has moved.\n'
      + '  Run `pnpm check:i18n-source` (it builds first) or `npx objectstack build`.');
  }

  const artifact = JSON.parse(readFileSync(ARTIFACT, 'utf8'));
  const defaultLocale = artifact?.i18n?.defaultLocale ?? 'en';

  const trees = (artifact.translations ?? []).map((entry) => entry?.[defaultLocale]).filter(Boolean);
  if (trees.length === 0) {
    fail(`the artifact carries no "${defaultLocale}" translation bundle. Either src/translations/index.ts `
      + 'stopped registering it, or the source locale changed — both make this comparison meaningless.');
  }
  const bundle = new Map();
  for (const tree of trees) for (const [key, value] of flatten(tree, '')) bundle.set(key, value);

  const { source: platformSource, platformKeys } = collectPlatformSurface(defaultLocale);
  const { source: viewSource, origins: viewOrigins, ambiguous } = collectViewNestedSurface(artifact.views);

  if (ambiguous.length > 0) {
    printFindings('ambiguous view-nested keys', ambiguous, (row) => [bold(row.key), `  ${row.a}`, `  ${row.b}`]);
    fail('one bundle key resolves to two different source strings — the resolver cannot choose, and will '
      + 'not guess. Rename one of the nested views so each key names one string.');
  }

  const source = new Map(platformSource);
  const origins = new Map();
  for (const key of platformSource.keys()) origins.set(key, 'os i18n extract');
  const conflicts = [];
  for (const [key, value] of viewSource) {
    if (source.has(key) && source.get(key) !== value) {
      conflicts.push({
        key,
        a: `os i18n extract = ${JSON.stringify(source.get(key))}`,
        b: `${viewOrigins.get(key)} = ${JSON.stringify(value)}`,
      });
      continue;
    }
    source.set(key, value);
    origins.set(key, viewOrigins.get(key));
  }
  if (conflicts.length > 0) {
    printFindings('collector conflicts', conflicts, (row) => [bold(row.key), `  ${row.a}`, `  ${row.b}`]);
    fail('the platform walk and the view-nested resolver disagree about what the source says. One of them '
      + 'is wrong; this script will not pick a winner.');
  }

  // Vacuity guard: a green run must mean "compared and equal", never "compared nothing".
  if (bundle.size === 0) {
    fail(`the "${defaultLocale}" bundle is empty — there is nothing to check, which is not a pass.`);
  }
  if (source.size === 0) {
    fail('no source labels were collected — there is nothing to check against, which is not a pass.');
  }

  const { mismatches, orphans, missing, compared } = compare(bundle, source, origins);
  if (compared === 0) {
    fail(`${bundle.size} bundle keys and ${source.size} source labels share no key at all. The two key `
      + 'spellings have diverged; this is a broken check, not a clean tree.');
  }

  console.log(`  bundle keys (src/translations/${defaultLocale}.ts)  ${String(bundle.size).padStart(5)}`);
  console.log(`  source labels collected                 ${String(source.size).padStart(5)}   `
    + dim(`(${platformSource.size} os i18n extract + ${viewSource.size} view-nested)`));
  console.log(`  compared, key present on both sides     ${String(compared).padStart(5)}`);
  console.log(`  excluded: platform built-in keys        ${String(platformKeys).padStart(5)}   `
    + dim(`(${PLATFORM_GROUP}.* — Studio copy the platform packages ship)`));

  if (mismatches.length === 0 && orphans.length === 0 && missing.length === 0) {
    console.log('');
    console.log(`  ${green('✓')} every bundle key restates the label its metadata declares`);
    console.log('');
    return 0;
  }

  if (mismatches.length > 0) {
    printFindings('drifted — the bundle overrides the source label', mismatches, (row) => [
      bold(row.key),
      `  bundle (${defaultLocale}.ts)  ${JSON.stringify(row.bundleValue)}`,
      `  source${' '.repeat(defaultLocale.length + 8)}${JSON.stringify(row.sourceValue)}`
        + (row.origin ? dim(`   [${row.origin}]`) : ''),
    ]);
  }
  if (orphans.length > 0) {
    printFindings('orphaned — no metadata declares text at this key', orphans, (row) => [
      bold(row.key),
      `  bundle (${defaultLocale}.ts)  ${JSON.stringify(row.bundleValue)}`,
    ]);
  }
  if (missing.length > 0) {
    printFindings(`missing — the metadata declares text ${defaultLocale}.ts never restates`, missing, (row) => [
      bold(row.key),
      `  source  ${JSON.stringify(row.sourceValue)}${row.origin ? dim(`   [${row.origin}]`) : ''}`,
    ]);
  }

  const total = mismatches.length + orphans.length + missing.length;
  console.log('');
  console.log(`  ${red(bold(`${total} i18n source-parity issue(s)`))}`);
  console.log(`  ${dim(`src/translations/${defaultLocale}.ts restates the source labels; a stale entry there wins at runtime.`)}`);
  console.log(`  ${dim('Fix the bundle to match the metadata, or fix the metadata — whichever is the mistake.')}`);
  console.log('');
  return 1;
}

// ───────────────────────────────────────────────────────────────────────────────
// Self-test — proof the comparator can still fail, run before every real run
// ───────────────────────────────────────────────────────────────────────────────

function selfTest() {
  const failures = [];
  let assertions = 0;
  const check = (name, condition, detail) => {
    assertions += 1;
    if (!condition) failures.push(`${name}: ${detail}`);
  };

  const clean = compare(new Map([['a.b', 'X']]), new Map([['a.b', 'X']]));
  check('a clean tree reports nothing',
    clean.mismatches.length === 0 && clean.orphans.length === 0 && clean.missing.length === 0
      && clean.compared === 1,
    JSON.stringify(clean));

  const drift = compare(
    new Map([['objects.o.fields.f.label', 'Status']]),
    new Map([['objects.o.fields.f.label', 'Review status']]),
  );
  check('a drifted value is reported as a mismatch, carrying both strings',
    drift.mismatches.length === 1
      && drift.mismatches[0].key === 'objects.o.fields.f.label'
      && drift.mismatches[0].bundleValue === 'Status'
      && drift.mismatches[0].sourceValue === 'Review status'
      && drift.orphans.length === 0 && drift.missing.length === 0,
    JSON.stringify(drift));

  const orphan = compare(
    new Map([['objects.o.fields.gone.label', 'Gone']]),
    new Map([['objects.o.label', 'O']]),
  );
  check('a bundle key with no source label is reported as an orphan',
    orphan.orphans.length === 1 && orphan.orphans[0].key === 'objects.o.fields.gone.label'
      && orphan.compared === 0,
    JSON.stringify(orphan));

  const gap = compare(new Map(), new Map([['objects.o.fields.new.label', 'New']]));
  check('a source label the bundle never restates is reported as missing',
    gap.missing.length === 1 && gap.missing[0].key === 'objects.o.fields.new.label',
    JSON.stringify(gap));

  const nested = collectViewNestedSurface([{
    name: 'v',
    object: 'o',
    list: { name: 'all', label: 'All Things' },
    listViews: { mine: { label: 'Mine' } },
    formViews: { apply: { title: 'Apply', description: 'Tell us who you are.' }, default: {} },
  }]);
  check('the view-nested resolver addresses list, listViews and formViews',
    nested.source.get('objects.o._views.all.label') === 'All Things'
      && nested.source.get('objects.o._views.mine.label') === 'Mine'
      && nested.source.get('objects.o._views.apply.label') === 'Apply'
      && nested.source.get('objects.o._views.apply.description') === 'Tell us who you are.'
      && !nested.source.has('objects.o._views.default.label')
      && nested.ambiguous.length === 0,
    JSON.stringify([...nested.source]));

  const clash = collectViewNestedSurface([{
    name: 'v',
    object: 'o',
    list: { name: 'dup', label: 'One' },
    listViews: { dup: { label: 'Two' } },
  }]);
  check('two source strings on one key are reported as ambiguous, not silently merged',
    clash.ambiguous.length === 1, JSON.stringify(clash.ambiguous));

  let refusedNonString = false;
  try {
    flatten({ a: [1, 2] }, '');
  } catch (error) {
    refusedNonString = error instanceof CheckError;
  }
  check('a non-string leaf is refused rather than skipped', refusedNonString,
    'flatten() accepted an array leaf');

  console.log('');
  console.log(bold('◆ i18n source parity — self-test'));
  console.log('────────────────────────────────────────');
  if (failures.length === 0) {
    console.log(`  ${green('✓')} ${assertions} assertions — the comparator still reports drift, orphans and gaps`);
    console.log('');
    return 0;
  }
  for (const line of failures) console.log(`  ${red('✗')} ${line}`);
  console.log('');
  console.log(`  ${red(bold(`${failures.length} self-test failure(s)`))} — the gate cannot be trusted to bite; `
    + 'fix it before trusting a green run.');
  console.log('');
  return 1;
}

// ───────────────────────────────────────────────────────────────────────────────

try {
  process.exitCode = process.argv.includes('--self-test') ? selfTest() : run();
} catch (error) {
  const message = error instanceof CheckError ? error.message : (error?.stack ?? String(error));
  console.log('');
  console.log(`  ${red(bold('x i18n source parity could not run'))}`);
  for (const line of String(message).split('\n')) console.log(`  ${line}`);
  console.log('');
  process.exitCode = 1;
}
