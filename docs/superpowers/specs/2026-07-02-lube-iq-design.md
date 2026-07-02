# Lube IQ — Design Spec

**Date:** 2026-07-02
**App:** 30-in-30 challenge build
**Baseline reference:** https://valvoline-eu.lubricantadvisor.com/

## What it is

A consumer web app for engine-oil intelligence. Users either (a) pick their
machine and get ranked oil recommendations with drain intervals, or (b) pick
the oil they currently use and find cross-brand equivalents. Any oils can be
compared side-by-side with plain-English explanations of which spec wins and
why. A guidelines page teaches correct oil usage.

## Architecture

Static React SPA: Vite + React, client-side routing, all data in bundled JSON.
No backend, no database, no accounts. Search, matching, scoring, and comparison
all run in the browser. Real spec data is gathered once at build time (scraped
/ transcribed from public manufacturer technical data sheets) and baked into
the dataset; each product links out to its official datasheet page for live
verification.

## Dataset (single JSON module, three parts)

### 1. Products (~50–60 oils, 6–7 brands)

Brands: Valvoline, Shell, Mobil, Castrol, Total, Liqui Moly, Petromin
(Gulf-relevant mix). Each product:

- `id`, `brand`, `name`, `viscosity` (e.g. "5W-30"), `baseType`
  (full-synthetic | semi-synthetic | mineral), `category`
  (car | motorcycle | heavy-duty)
- Standards: `api` (e.g. "SP"), `acea` (e.g. "C3"), `jaso` (bikes only),
  `oemApprovals` (e.g. ["MB 229.52", "VW 504.00"])
- TDS physicals: `visc40`, `visc100`, `viscosityIndex`, `flashPoint`,
  `pourPoint`, `tbn`, `density`
- `datasheetUrl` — official manufacturer PDS/TDS page

### 2. Machinery (~45–50 entries)

Cars (Gulf-popular: Toyota Camry / Land Cruiser / Corolla, Nissan Patrol /
Altima, Honda, Hyundai, BMW, Mercedes, etc.), motorcycles, and heavy-duty
trucks. Each entry:

- `id`, `category`, `make`, `model`, `engine` (variant label), `years`
- Requirements: `allowedViscosities`, `minApi` and/or `minAcea` / `jaso`,
  `requiredApprovals` (hard OEM requirements, may be empty)
- `sumpCapacityL`
- Drain intervals: `normalKm`/`normalMonths` and `severeKm`/`severeMonths`
  (severe = Gulf heat, dust, towing, short trips)

### 3. Spec knowledge base

For every TDS field: a plain-English explanation (novice-friendly), the
"better" direction (higher/lower/context-dependent), and a practical
consequence sentence used in comparisons (e.g. "TBN measures how well an oil
neutralizes combustion acids — higher TBN keeps protecting longer between
drains"). Also includes orderings for API and ACEA levels so "meets or
exceeds" can be computed.

## Features

### Flow A — Find by machinery

Wizard: category → make → model/engine. Results page shows:

- All fitting oils ranked best-match first, each with fit reasons
  ("matches required 0W-20", "holds VW 504.00")
- Drain interval panel: normal vs severe schedule + sump capacity
- Contextual usage tips
- Honest empty state if no oil in the dataset fits

### Flow B — Find my oil's equivalent

Search or browse to the user's current oil → list of cross-brand equivalents
scored 0–100 and tiered:

- **Direct equivalent** — same viscosity, equal-or-better standards,
  matching approvals
- **Close match** — same viscosity, standards equal-or-better, approvals
  partially overlap
- **Partial match** — usable in some cases; differences called out explicitly

Each result explains why it qualifies and where it differs.

### Compare

A persistent compare tray (bottom bar) collects 2–4 oils from any screen.
Compare page renders a side-by-side data-sheet table; each row highlights the
winning value and explains why it matters using the knowledge base. Rows where
values are effectively equal (within meaningful tolerance) are marked "no
practical difference" — never manufacture a winner.

### Guidelines

Static content page: reading an oil label (viscosity code, API donut, ACEA),
checking and topping up correctly, when to shorten drain intervals, mixing
dos-and-don'ts, storage. Footer disclaimer on every page: "Always confirm
against your owner's manual."

## Matching logic (pure functions, unit-tested)

- `fitsMachine(oil, machine)` — viscosity ∈ allowed grades AND API/ACEA/JASO
  meets-or-exceeds minimum AND all hard-required approvals held.
- `equivalenceScore(oilA, oilB)` — weighted: viscosity grade 40%, standards
  level 40%, OEM approval overlap 20%. Tier thresholds map score → direct /
  close / partial.
- `compareSpec(field, values[])` — returns winner index or "equal within
  tolerance", plus the explanation string.

## Screens

1. **Home** — two entry cards ("I know my machine" / "I know my oil") +
   universal search (matches both machines and products)
2. **Machinery wizard → results**
3. **Product page** — full TDS, official datasheet link, "find equivalents",
   "add to compare"
4. **Compare**
5. **Guidelines**

Design executed via `superpowers:frontend-design` skill at build time —
Tier A standard, no generic AI aesthetics.

## Error handling

Only real boundaries exist: empty search results and machines with no fitting
oil get honest, helpful empty states. No network at runtime, so no other
failure modes.

## Testing

- Unit tests for `fitsMachine`, `equivalenceScore`, `compareSpec`
  (including API/ACEA ordering edge cases)
- Playwright end-to-end pass via `superpowers:webapp-testing`: wizard flow,
  equivalents flow, compare table, search, empty states
- `/code-review` after each implementation step

## Out of scope (v1)

- Agriculture / marine / industrial categories
- Runtime scraping or live data
- Prices, shop links, user accounts, saved garages
- Coolants, greases, transmission fluids (engine oil only)
