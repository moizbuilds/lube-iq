// Machine results: the payoff screen of the wizard. Given a machine id from
// the URL, this shows what it requires (viscosity/API/ACEA/approvals), how
// often to change the oil (with a Gulf-specific "severe" schedule), and every
// oil in the catalogue that actually fits it, best match first.
import { useParams, Link } from 'react-router-dom';
import { MACHINES } from '../data/machines.js';
import { PRODUCTS } from '../data/products.js';
import { recommendOils } from '../logic/matching.js';
import OilCard from '../components/OilCard.jsx';

export default function MachineResults() {
  // CONCEPT: useParams reads the dynamic part of the URL — for a route like
  // /machines/:id, visiting /machines/toyota-camry-2-5 gives id = 'toyota-camry-2-5'.
  const { id } = useParams();
  const machine = MACHINES.find((m) => m.id === id);

  // Real boundary #1: the id in the URL doesn't match anything in the dataset
  // (typo, stale link, deleted machine).
  if (!machine) {
    return (
      <div className="results-empty">
        <p className="eyebrow">Not found</p>
        <h1>Machine not found</h1>
        <p className="muted">
          We don&rsquo;t have a machine matching that link. Try the finder instead.
        </p>
        <Link className="btn" to="/machines">Back to machine finder</Link>
      </div>
    );
  }

  const recs = recommendOils(machine, PRODUCTS);
  const { drain } = machine;

  return (
    <div className="results">
      <p className="eyebrow" translate="no">{machine.category.replace('-', ' ')}</p>
      <h1 translate="no">{machine.make} {machine.model}</h1>
      <p className="muted results-meta" translate="no">{machine.engine} &middot; {machine.years}</p>

      {/* Requirement chips: what this engine actually calls for, at a glance. */}
      <div className="oil-card-chips results-req-chips" aria-label="Requirements">
        {machine.allowedViscosities.map((v) => (
          <span key={v} className="chip chip-accent">{v}</span>
        ))}
        {machine.minApi && <span className="chip">Min API {machine.minApi}</span>}
        {machine.minAcea && <span className="chip">Min ACEA {machine.minAcea}</span>}
        {machine.requiredJaso && <span className="chip">JASO {machine.requiredJaso}</span>}
        {machine.requiredApprovals.map((a) => (
          <span key={a} className="chip">{a}</span>
        ))}
      </div>

      {/* Drain interval panel: the signature "data plate" — normal vs. severe
          service side by side, read like gauge figures rather than prose. */}
      <section className="drain-panel" role="region" aria-label="Drain interval">
        <div className="drain-col">
          <p className="drain-label">Normal service</p>
          <p className="drain-figure">
            every {drain.normalKm.toLocaleString()} km
            <span className="drain-or">or {drain.normalMonths} months</span>
          </p>
        </div>
        <div className="drain-divider" aria-hidden="true" />
        <div className="drain-col drain-col-severe">
          <p className="drain-label">Severe service</p>
          <p className="drain-figure drain-figure-accent">
            every {drain.severeKm.toLocaleString()} km
            <span className="drain-or">or {drain.severeMonths} months</span>
          </p>
          <p className="muted drain-severe-note">Gulf heat, dust, towing, short trips</p>
        </div>
      </section>

      <p className="muted drain-sump">Sump capacity: {machine.sumpCapacityL} L</p>
      <p className="drain-tip">In Gulf conditions, treat the severe schedule as your default.</p>

      {/* Recommendations, or the second real boundary: nothing in the
          catalogue fits this machine's requirements. */}
      <h2 className="results-recs-heading">Oils that fit</h2>
      {recs.length === 0 ? (
        <p className="muted">
          No oil in our catalogue currently fits this machine. Check your owner&rsquo;s manual
          for the required specification.
        </p>
      ) : (
        <div className="results-recs">
          {recs.map(({ oil, reasons }, i) => (
            <OilCard key={oil.id} oil={oil} reasons={reasons} best={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
