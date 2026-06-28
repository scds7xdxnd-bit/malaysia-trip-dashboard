# KL × Penang — Trip Console

Interactive single-page dashboard for planning a 7-night **Kuala Lumpur + Penang**
trip (Jul 16–23, 2026, 2 pax). It bundles three things into one screen:

- **Budget console** — pick a hotel per city, split the nights, set a daily spend,
  and watch a live gauge redline if the plan exceeds the RM 5,824 budget.
- **Itinerary** — seven day-cards that reflow as you change the night split, with the
  KUL → PEN flight chip auto-placed.
- **AHP hotel ranking** — pairwise Analytic Hierarchy Process scores for 11 KL and
  10 Penang hotels, with stacked bars showing *why* each scored as it did.

No build step — open `index.html` in any modern browser.

## Project structure

```
index.html              markup + element hooks
assets/css/styles.css   all styling (dark theme, responsive)
assets/js/data.js       trip constants, criteria, hotels, itinerary plans
assets/js/i18n.js       dictionary-based EN / 中文 internationalization
assets/js/render.js     pure render functions driven by app state
assets/js/main.js       state, event wiring, bootstrap
```

Scripts are plain classic scripts (no bundler) loaded in order, so the page
still opens straight from the filesystem.

## Languages

The 🌐 button (top-right) toggles between **English** and **简体中文 (Mandarin)**.

i18n is a small dictionary layer in `assets/js/i18n.js`:

- Static UI copy carries `data-i18n="key"` (text) or `data-i18n-html="key"`
  (rich text) attributes; `I18N.apply()` fills them from the active dictionary.
- Bilingual data fields (hotel `area`, itinerary plans, dates) are `{ en, zh }`
  pairs read through `I18N.L()`.
- Dynamic strings are built with `t('key', { token: value })` interpolation.
- The choice persists in `localStorage('trip-lang')`. Chinese uses native system
  CJK fonts, so no extra web font is downloaded.

To add a language, add a dictionary to `DICT` in `i18n.js` and a `zh`-style key to
the bilingual data fields.

## Method

Hotels are ranked with the Analytic Hierarchy Process over five weighted criteria
(Luxury 0.35 · Value 0.21 · Reviews 0.185 · Location 0.14 · Amenities 0.11),
consistency ratio CR = 0.016. Rates are mid-range estimates for July 2026 and move
with dates/availability.
