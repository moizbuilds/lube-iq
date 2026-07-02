// Compare tray: a fixed instrument-readout bar docked at the bottom of every
// page. It shows the oils the user has flagged to compare, lets them drop any
// one, jump to the full comparison, or clear the lot. It renders nothing until
// at least one oil is selected, so it never gets in the way on an empty page.
import { Link } from 'react-router-dom';
import { useCompare } from '../CompareContext.jsx';
import { PRODUCTS } from '../data/products.js';

export default function CompareTray() {
  // CONCEPT: a custom hook (useCompare) reads the shared context we set up in
  // CompareContext — so this component always reflects the live selection.
  const { ids, remove, clear } = useCompare();

  // Nothing selected -> nothing to show.
  if (ids.length === 0) return null;

  // Turn the stored ids into the full product records so we can show names.
  // (filter(Boolean) drops any id that no longer matches a product.)
  const selected = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);

  // "Compare" needs at least two oils to mean anything; below that it's disabled.
  const canCompare = selected.length >= 2;

  return (
    <div className="tray" role="region" aria-label="Compare tray">
      <div className="container tray-inner">
        <span className="tray-label">Compare</span>

        <ul className="tray-items">
          {selected.map((p) => (
            <li key={p.id} className="tray-item">
              <span translate="no">{p.name}</span>
              <button
                type="button"
                className="tray-remove"
                aria-label={`Remove ${p.name} from compare`}
                onClick={() => remove(p.id)}
              >
                {/* Decorative glyph; the button's aria-label carries the meaning. */}
                <span aria-hidden="true">&times;</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="tray-actions">
          {/* CONCEPT: aria-disabled tells screen readers the link is inactive
              while is-disabled dims it and blocks the click visually. */}
          <Link
            to="/compare"
            className={`btn${canCompare ? '' : ' is-disabled'}`}
            aria-disabled={canCompare ? undefined : true}
            tabIndex={canCompare ? undefined : -1}
          >
            Compare ({selected.length})
          </Link>
          <button type="button" className="btn btn-ghost" onClick={clear}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
