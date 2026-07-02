// One oil recommendation, rendered as a card: brand/name, its viscosity grade,
// base oil type, the standards it carries (API/ACEA), why it fits the machine
// that was searched, a link to its full data sheet, and a button to add it to
// the compare tray. Task 9's equivalents list reuses this exact component, so
// its shape (props: oil, reasons) is a contract other pages depend on.
import { Link } from 'react-router-dom';
import { useCompare } from '../CompareContext.jsx';

// Base type reads better in a sentence than the raw dataset value
// ("full-synthetic" -> "Full synthetic").
const BASE_TYPE_LABEL = {
  'full-synthetic': 'Full synthetic',
  'semi-synthetic': 'Semi-synthetic',
  mineral: 'Mineral',
};

export default function OilCard({ oil, reasons, best = false }) {
  // CONCEPT: useCompare reads the shared compare-tray state so this button
  // always shows the correct label/state no matter which page renders it.
  const { has, toggle } = useCompare();
  const inTray = has(oil.id);

  return (
    <article className="card oil-card">
      {best && <span className="oil-card-badge chip-accent">Best match</span>}

      <div className="oil-card-head">
        <p className="eyebrow" translate="no">{oil.brand}</p>
        <h3 translate="no">{oil.name}</h3>
      </div>

      <div className="oil-card-chips">
        <span className="chip chip-accent">{oil.viscosity}</span>
        <span className="chip">{BASE_TYPE_LABEL[oil.baseType]}</span>
        {oil.api && <span className="chip">API {oil.api}</span>}
        {oil.acea.map((a) => (
          <span key={a} className="chip">ACEA {a}</span>
        ))}
        {oil.jaso && <span className="chip">JASO {oil.jaso}</span>}
      </div>

      {reasons.length > 0 && (
        <ul className="oil-card-reasons">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}

      <div className="oil-card-actions">
        <Link className="btn btn-ghost" to={`/oils/${oil.id}`}>
          Details
        </Link>
        {/* CONCEPT: toggle() both adds and removes — the context also enforces
            a 4-item max, silently no-op-ing past it, so no extra check needed here. */}
        <button
          type="button"
          className={`btn${inTray ? ' btn-ghost' : ''}`}
          aria-pressed={inTray}
          onClick={() => toggle(oil.id)}
        >
          {inTray ? 'In tray' : 'Add to compare'}
        </button>
      </div>
    </article>
  );
}
