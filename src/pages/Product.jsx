// Product page: the full technical-data-sheet (TDS) view for one oil. Shows
// its identity chips, a link to the manufacturer's own datasheet, the full
// spec table (this is where a novice learns to actually read a TDS), and
// every cross-brand equivalent in the catalogue, grouped by how close a
// substitute it is. Reached via /oils/:id (from search, OilCard "Details",
// or a machine's recommendation list).
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products.js';
import { SPEC_FIELDS } from '../data/specKnowledge.js';
import { findEquivalents } from '../logic/matching.js';
import { useCompare } from '../CompareContext.jsx';
import OilCard from '../components/OilCard.jsx';

const BASE_TYPE_LABEL = {
  'full-synthetic': 'Full synthetic',
  'semi-synthetic': 'Semi-synthetic',
  mineral: 'Mineral',
};

// Tier order + heading text for the equivalents section. 'none' is filtered
// out upstream by findEquivalents, so it never needs a heading here.
const TIER_HEADINGS = [
  ['direct', 'Direct equivalents'],
  ['close', 'Close matches'],
  ['partial', 'Partial matches'],
];

export default function Product() {
  // CONCEPT: useParams reads the :id segment from the URL, e.g. /oils/shell-x -> id = 'shell-x'.
  const { id } = useParams();
  const oil = PRODUCTS.find((p) => p.id === id);
  // CONCEPT: hooks must run in the same order on every render, so useCompare
  // is called unconditionally — even on the "not found" branch below.
  const { has, toggle } = useCompare();

  // Real boundary: the id in the URL doesn't match any product (typo, stale
  // link, deleted oil).
  if (!oil) {
    return (
      <div className="results-empty">
        <p className="eyebrow">Not found</p>
        <h1>Oil not found</h1>
        <p className="muted">We don&rsquo;t have a product matching that link.</p>
        <Link className="btn" to="/">Back home</Link>
      </div>
    );
  }

  const inTray = has(oil.id);
  const equivalents = findEquivalents(oil, PRODUCTS);
  const hasEquivalents = equivalents.length > 0;

  return (
    <div className="product">
      {/* Header: identity, at-a-glance chips, and the two actions a visitor
          takes from here — add to the compare tray, or go read the source. */}
      <p className="eyebrow" translate="no">{oil.brand}</p>
      <h1 translate="no">{oil.name}</h1>

      {/* translate="no": grade/spec codes are identifiers, not prose — this
          stops browser auto-translate from garbling them. */}
      <div className="oil-card-chips product-chips" translate="no">
        <span className="chip chip-accent">{oil.viscosity}</span>
        <span className="chip">{BASE_TYPE_LABEL[oil.baseType]}</span>
        {oil.api && <span className="chip">API {oil.api}</span>}
        {oil.acea.map((a) => (
          <span key={a} className="chip">ACEA {a}</span>
        ))}
        {oil.jaso && <span className="chip">JASO {oil.jaso}</span>}
      </div>

      <div className="product-actions">
        <button
          type="button"
          className={`btn${inTray ? ' btn-ghost' : ''}`}
          aria-pressed={inTray}
          onClick={() => toggle(oil.id)}
        >
          {inTray ? 'In tray' : 'Add to compare'}
        </button>
        {/* External link to the manufacturer's own page — target/rel keep the
            new tab from being able to control this window (a security best
            practice for any target="_blank" link). */}
        <a
          className="btn btn-ghost"
          href={oil.datasheetUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View official datasheet <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* OEM approvals: hard manufacturer sign-offs (e.g. "MB 229.51"). Omitted
          entirely when the oil carries none, rather than showing an empty section. */}
      {oil.oemApprovals.length > 0 && (
        <section className="product-section" aria-label="OEM approvals">
          <h2 className="product-section-heading">OEM approvals</h2>
          <div className="oil-card-chips" translate="no">
            {oil.oemApprovals.map((a) => (
              <span key={a} className="chip">{a}</span>
            ))}
          </div>
        </section>
      )}

      {/* The data-sheet table: one row per SPEC_FIELDS entry. Each label sits
          above a plain-English explanation line, so the table itself teaches
          how to read a TDS instead of just listing numbers. */}
      <section className="product-section">
        <h2 className="product-section-heading">Technical data sheet</h2>
        <table className="table product-tds">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {SPEC_FIELDS.map((field) => (
              <tr key={field.key}>
                <th scope="row">
                  {field.label}
                  <span className="product-tds-explain">{field.explanation}</span>
                </th>
                <td>
                  {oil.specs[field.key]}
                  {field.unit && <span className="muted"> {field.unit}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Cross-brand equivalents, grouped by how interchangeable they are.
          Empty tiers are skipped; if nothing in the catalogue qualifies at
          all, that's the third real boundary this page handles. */}
      <section className="product-section">
        <h2 className="product-section-heading">Cross-brand equivalents</h2>
        {!hasEquivalents ? (
          <p className="muted">No cross-brand equivalent in our catalogue yet.</p>
        ) : (
          TIER_HEADINGS.map(([tier, heading]) => {
            const items = equivalents.filter((e) => e.tier === tier);
            if (items.length === 0) return null;
            return (
              <div key={tier} className="product-tier">
                <h3 className="product-tier-heading">{heading}</h3>
                <div className="results-recs">
                  {items.map((e) => (
                    <div key={e.oil.id} className="product-equivalent">
                      <OilCard oil={e.oil} reasons={e.reasons} />
                      {/* Score + differences sit in a "meta plate" attached
                          under the card, so it's unambiguous which oil the
                          readout belongs to. */}
                      <div className="product-equivalent-meta">
                        <p className="product-equivalent-score">{e.score}/100 match</p>
                        {e.differences.length > 0 && (
                          <div className="product-equivalent-diffs">
                            <p className="product-equivalent-diffs-label">Differences</p>
                            <ul className="oil-card-reasons">
                              {e.differences.map((d) => (
                                <li key={d}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
