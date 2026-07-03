# Featured Brand (Qatol) — Design Spec

**Date:** 2026-07-03
**Feature:** Transparent featured-brand placement for Qatol.

## Principle

Bias the **order**, never the **facts**. Fit rules, equivalence scores, tier
assignment, and compare verdicts are unchanged. A featured oil that does not
fit never appears; a featured partial match never outranks another brand's
direct match. Featuring is always visibly labeled.

## Changes

### 1. `src/data/featured.js` (new)

```js
export const FEATURED_BRAND = 'Qatol';
```

Single knob. Setting it to `null` disables all featuring. Teaching comment
explains what featuring does and does not affect.

### 2. `recommendOils(machine, products)` — src/logic/matching.js

- Rank neutrally exactly as today (base-type rank, then viscosity index).
- The neutral #1 is the genuine best match.
- Stable-partition: fitting oils whose `brand === FEATURED_BRAND` move to the
  front, preserving their relative neutral order; everything else follows in
  neutral order.
- Return shape gains two booleans per item:
  `{ oil, reasons, featured, bestMatch }`.
  - `featured`: brand equals FEATURED_BRAND (false everywhere when
    FEATURED_BRAND is null).
  - `bestMatch`: exactly one item — the neutral #1 (may itself be featured).

### 3. `findEquivalents(reference, products)` — src/logic/matching.js

Sort comparator becomes: tier (direct < close < partial), then
`featured` first within the tier, then score desc. Each item gains
`featured: boolean`. Scores and tiers are computed exactly as today.

### 4. Featured justification ("Why Qatol") — src/logic/matching.js

New pure function `featuredPitch(item, allRecs)` → string[] (1–3 lines),
computed ONLY from true data, strongest angles first. Candidate claims, each
emitted only when the data supports it, compared against the other fitting
oils in the same result set:

- Spec compliance framing: "Matches the manufacturer's required {grade}
  exactly" / "API {x} — exceeds the {y} this engine requires".
- Superlatives ONLY when literally true in this result set: highest TBN
  ("longest-lasting protection between drains"), highest viscosity index
  ("most temperature-stable"), highest flash point ("lowest burn-off in
  Gulf heat"). Ties count as shared-best and use "among the highest".
- Always available closer: "Blended in Qatar for Gulf conditions."

Rules: never a claim the spec table contradicts; never suppresses or moves
the bestMatch flag; renders on featured cards as a "Why {brand}" block.
Same function powers featured equivalents on the product page (compared
within the same tier group).

### 5. UI

- `OilCard` accepts `featured` prop → renders a "Featured" chip (visually
  distinct from "Best match"; uses existing chip styles).
- `MachineResults`: "Best match" badge moves from index-0 to the item with
  `bestMatch: true`; featured cards show the Featured chip.
- `Product` (equivalents): featured equivalents show the Featured chip;
  within-tier ordering comes from `findEquivalents` as-is.

### 6. Explicitly unchanged

Compare page and `compareSpec`, search, `fitsMachine`, `equivalenceScore`,
all datasets, guidelines.

## Testing

Unit (matching.test.js):
- Featured fitting oil is pinned first; non-fitting featured oil still absent.
- `bestMatch` lands on the neutral winner when a featured oil is pinned above
  it; when the featured oil is also the neutral winner, it carries both flags.
- `findEquivalents`: within a tier, featured sorts first; a featured
  lower-tier oil stays below a higher tier; scores unchanged.
- `featuredPitch`: emits a superlative only when the value is genuinely
  best (or tied-best with "among the highest" wording) in the result set;
  never emits for a mid-pack value; always includes the compliance line
  when the oil fits; output lines cap at 3.
- No-featured-present behaviour: with a fixture containing no
  FEATURED_BRAND oils, flags are all false and order is purely neutral
  (equivalent to FEATURED_BRAND = null, which is a module constant and
  not injectable in tests).

E2E (Playwright): Camry results show a Featured Qatol card above the
Best-match card; a product page shows Featured chips inside equivalents.
