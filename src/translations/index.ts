import { defineTranslationBundle } from '@objectstack/spec';
import { en } from './en.js';
import { zhCN } from './zh-CN.js';

/**
 * The app's translation bundle — one `TranslationData` per locale in
 * `i18n.supportedLocales` (objectstack.config.ts), registered on the stack
 * under `translations`. `defineTranslationBundle` parses the shape at
 * authoring time, so a misspelled group or key fails `pnpm validate` with the
 * offending path instead of being dropped and rendering in English.
 *
 * `en` is the source locale: the inline labels in src/ are the English text
 * and the runtime falls back to them, so `en.ts` restates rather than
 * translates (see its header for the one trap that creates). `zh-CN` is the
 * second locale; `pnpm lint --i18n-strict` refuses a key it lacks.
 *
 * Bundles translate METADATA (labels, options, sections, messages). The demo
 * seed's Chinese counterpart is a separate concern — `OS_SEED_LOCALE=zh`
 * selects `src/data/demo-zh/` (DESIGN.md §06) — and the two switch
 * independently: a Chinese UI over English demo rows is a valid combination.
 */
export const AtsTranslations = defineTranslationBundle({
  en,
  'zh-CN': zhCN,
});
