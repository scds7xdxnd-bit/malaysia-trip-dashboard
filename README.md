# KL × Penang — Trip Console

Interactive single-page dashboard for planning a 7-night **Kuala Lumpur + Penang**
trip (Jul 16–23, 2026, 2 pax). It bundles three things into one screen:

- **Budget console** — pick a hotel per city, split the nights, set a daily spend,
  and watch a live gauge redline if the plan exceeds the RM 5,824 budget.
- **Itinerary** — seven day-cards that reflow as you change the night split, with the
  KUL → PEN flight chip auto-placed.
- **AHP hotel ranking** — pairwise Analytic Hierarchy Process scores for 11 KL and
  10 Penang hotels, with stacked bars showing *why* each scored as it did.

No build step — open the HTML in any modern browser.

## Method

Hotels are ranked with the Analytic Hierarchy Process over five weighted criteria
(Luxury 0.35 · Value 0.21 · Reviews 0.185 · Location 0.14 · Amenities 0.11),
consistency ratio CR = 0.016. Rates are mid-range estimates for July 2026 and move
with dates/availability.
