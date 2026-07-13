# KL × Kota Kinabalu — Booked Trip Console

Single-page dashboard for the **booked** Kuala Lumpur + Kota Kinabalu trip
(Jul 16–25, 2026, 2 pax). Every number and reservation on the page mirrors the
actual confirmations kept in the repo root (Trip.com receipts, restaurant
bookings, Daeng Travel island-trip order, Generali insurance schedule).

- **Budget & payments** — pooled trip fund (RM 15,636) vs. actual spend
  (RM 14,629): four prepaid bookings plus the planned on-trip categories,
  with a live gauge and buffer readout.
- **Itinerary** — ten collapsible day cards, Jul 16–25, with booked times,
  confirmation numbers, flight blocks (Batik Air OD1004 / OD1017) and
  per-day costs.
- **Trip details** — flights, booked transfers, the four stays
  (Park Hyatt KL · Shangri-La Rasa Ria · The Shore KK · Le Méridien PJ),
  five reserved dinners, experiences, insurance/essentials, packing list
  and a booked-state checklist.

No build step — open `index.html` in any modern browser.

## Project structure

```
index.html              markup + element hooks
assets/css/styles.css   all styling (dark/light theme, responsive, print)
assets/js/data.js       booked itinerary, stays, flights, transfers, money
assets/js/i18n.js       dictionary-based EN / 中文 internationalization
assets/js/render.js     pure render functions (budget, itinerary, details)
assets/js/main.js       theme + language toggles, print/share, accordion
```

Scripts are plain classic scripts (no bundler) loaded in order, so the page
still opens straight from the filesystem.

## Languages

The 🌐 button (top-right) toggles between **English** and **简体中文**.
Static UI copy uses `data-i18n` attributes; bilingual data fields are
`{ en, zh }` pairs read through `I18N.L()`. The choice persists in
`localStorage('trip-lang')`; the theme in `localStorage('trip-theme')`.

## Source documents

Booking confirmations live in the repo root, named `<city> <date> <what>`
(e.g. `KL 16 Park Hyatt.pdf`, `KK 22 Flight.pdf`), plus `INSURANCE.pdf`
and `plan.png` (the day-by-day budget spreadsheet the console mirrors).
