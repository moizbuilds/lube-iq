// Compare page: the app's signature feature. Lays 2-4 oils side by side as
// one wide data-sheet table — identity rows first (grade, base type,
// standards, approvals), then every SPEC_FIELDS row with the matching
// engine's compareSpec() deciding which column wins and why. Reached via the
// compare tray's "Compare (n)" link, or a direct /compare visit.
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products.js';
import { SPEC_FIELDS } from '../data/specKnowledge.js';
import { compareSpec } from '../logic/matching.js';
import { useCompare } from '../CompareContext.jsx';

const BASE_TYPE_LABEL = {
  'full-synthetic': 'Full synthetic',
  'semi-synthetic': 'Semi-synthetic',
  mineral: 'Mineral',
};

export default function Compare() {
  // CONCEPT: useCompare reads the shared "tray" state — the same list of ids
  // that CompareTray and every "Add to compare" button read and write.
  const { ids, remove } = useCompare();

  // Turn stored ids into full product records (filter(Boolean) drops any id
  // that no longer matches a product, same guard CompareTray uses).
  const oils = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);

  // Real boundary: fewer than two oils has nothing to compare. This covers
  // both an empty tray and someone landing on /compare directly via a link.
  if (oils.length < 2) {
    return (
      <div className="results-empty">
        <p className="eyebrow">Compare</p>
        <h1>Add at least two oils to compare</h1>
        <p className="muted">
          Pick oils from search, a machine&rsquo;s recommendations, or a product page,
          then open the tray at the bottom of the screen.
        </p>
        <Link className="btn" to="/">Back home</Link>
      </div>
    );
  }

  // JASO only matters for motorcycle oils; skip the whole row when nobody in
  // this comparison carries one rather than showing a row of blank dashes.
  const showJaso = oils.some((o) => o.jaso);

  return (
    <div className="compare">
      <p className="eyebrow">Compare</p>
      <h1>{oils.length} oils, side by side</h1>
      <p className="muted compare-lede">
        Every row below is read straight from each oil&rsquo;s technical data sheet. Where one
        oil measurably wins a property, its column is marked BEST — small gaps inside a
        property&rsquo;s tolerance are called out as no practical difference instead.
      </p>

      {/* Mobile-only hint: the wrapper below scrolls horizontally under 720px,
          this line is the visible affordance that it's scrollable. */}
      <p className="muted compare-scroll-hint" aria-hidden="true">Scroll to compare &rarr;</p>

      {/* tabindex="0" + aria-label make the scroll region itself reachable and
          announced by a keyboard/screen reader, not just the elements inside it. */}
      <div
        className="compare-scroll"
        tabIndex="0"
        aria-label="Oil comparison table, scroll horizontally to see all columns"
      >
        <table className="table compare-table">
          <thead>
            <tr>
              <th scope="col">Property</th>
              {oils.map((oil) => (
                <th key={oil.id} scope="col">
                  <div className="compare-col-head">
                    <div translate="no">
                      <p className="eyebrow compare-col-brand">{oil.brand}</p>
                      <p className="compare-col-name">{oil.name}</p>
                    </div>
                    <button
                      type="button"
                      className="compare-col-remove"
                      aria-label={`Remove ${oil.name} from compare`}
                      onClick={() => remove(oil.id)}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Identity rows: the facts a data sheet leads with, before any of
                the measured properties below. Plain values, no winner logic —
                these describe what the oil is, not how it performs. */}
            <tr>
              <th scope="row">Viscosity grade</th>
              {oils.map((oil) => (
                <td key={oil.id} translate="no">{oil.viscosity}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Base type</th>
              {oils.map((oil) => (
                <td key={oil.id}>{BASE_TYPE_LABEL[oil.baseType]}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">API</th>
              {oils.map((oil) => (
                <td key={oil.id} translate="no">{oil.api ?? '—'}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">ACEA</th>
              {oils.map((oil) => (
                <td key={oil.id} translate="no">{oil.acea.length > 0 ? oil.acea.join(', ') : '—'}</td>
              ))}
            </tr>
            {showJaso && (
              <tr>
                <th scope="row">JASO</th>
                {oils.map((oil) => (
                  <td key={oil.id} translate="no">{oil.jaso ?? '—'}</td>
                ))}
              </tr>
            )}
            <tr>
              <th scope="row">OEM approvals</th>
              {oils.map((oil) => (
                <td key={oil.id} translate="no">
                  {oil.oemApprovals.length > 0 ? oil.oemApprovals.join(', ') : '—'}
                </td>
              ))}
            </tr>

            {/* Measured spec rows: one per SPEC_FIELDS entry. compareSpec()
                is the single source of truth for who wins and why — this
                component only renders its answer, it never re-derives it. */}
            {SPEC_FIELDS.map((field) => {
              const values = oils.map((oil) => oil.specs[field.key]);
              const { winnerIndex, equal, explanation } = compareSpec(field.key, values);
              return (
                <tr key={field.key}>
                  <th scope="row">
                    {field.label}
                    <span className="product-tds-explain">{field.explanation}</span>
                    {/* Verdict line: winner rows repeat the field's real-world
                        consequence, equal rows show compareSpec's own
                        explanation ("no practical difference" or a context note). */}
                    <span className="compare-verdict">{explanation}</span>
                  </th>
                  {oils.map((oil, i) => {
                    const isWinner = !equal && i === winnerIndex;
                    return (
                      <td key={oil.id} className={isWinner ? 'compare-cell-best' : undefined}>
                        {oil.specs[field.key]}
                        {field.unit && <span className="muted"> {field.unit}</span>}
                        {isWinner && <span className="compare-best-tag">Best</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
