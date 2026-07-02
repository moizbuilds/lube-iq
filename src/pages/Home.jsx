// Home: the two ways into the app — search anything, or start the machine
// wizard. Search runs over both datasets at once so users don't have to know
// which kind of thing they're typing. This is the first screen most people
// see, so its job is to prove in one glance that the app knows real oils and
// real machines, not just a generic form.
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products.js';
import { MACHINES } from '../data/machines.js';

export default function Home() {
  // CONCEPT: useState holds a value that, when changed, tells React to
  // re-render — here, whatever the visitor has typed into the search box.
  const [query, setQuery] = useState('');
  // CONCEPT: useRef gives us a handle to the actual <input> DOM node so the
  // "I know my oil" card can call .focus() on it without React re-rendering.
  const inputRef = useRef(null);

  const q = query.trim().toLowerCase();
  // Below 2 characters a substring match is too noisy to be useful, so both
  // groups stay empty and no results panel renders at all.
  const oils = q.length < 2 ? [] : PRODUCTS.filter((p) =>
    `${p.brand} ${p.name} ${p.viscosity}`.toLowerCase().includes(q)).slice(0, 8);
  const machines = q.length < 2 ? [] : MACHINES.filter((m) =>
    `${m.make} ${m.model}`.toLowerCase().includes(q)).slice(0, 8);
  const empty = q.length >= 2 && oils.length === 0 && machines.length === 0;
  const showResults = oils.length > 0 || machines.length > 0 || empty;

  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">Lube IQ — Lookup</p>
        <h1>Know your oil.</h1>
        <p className="hero-lede">
          Exactly what your machine needs — and what else would do the job.
        </p>

        {/* The search "bezel": styled like an instrument readout rather than
            a generic pill search bar, to match the gauge/data-plate language
            used elsewhere (chips, table). */}
        <div className="search-bezel">
          <label className="search-label" htmlFor="home-search">Scan</label>
          <input
            id="home-search"
            ref={inputRef}
            role="searchbox"
            className="search-input"
            placeholder="Search an oil or a machine — e.g. Helix Ultra, Land Cruiser"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>

        {showResults && (
          <div className="search-results">
            {oils.length > 0 && (
              <div className="result-group" aria-label="Matching oils">
                <h2 className="result-heading">Oils</h2>
                <ul className="result-list">
                  {oils.map((p) => (
                    <li key={p.id}>
                      <Link className="result-row" to={`/oils/${p.id}`}>
                        <span translate="no">{p.brand} {p.name}</span>
                        <span className="chip">{p.viscosity}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {machines.length > 0 && (
              <div className="result-group" aria-label="Matching machines">
                <h2 className="result-heading">Machines</h2>
                <ul className="result-list">
                  {machines.map((m) => (
                    <li key={m.id}>
                      <Link className="result-row" to={`/machines/${m.id}`}>
                        <span translate="no">{m.make} {m.model}</span>
                        <span className="chip">{m.years}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {empty && (
              <p className="search-empty">
                No match for &ldquo;{query}&rdquo;. <Link to="/machines">Try the machine finder instead.</Link>
              </p>
            )}
          </div>
        )}
      </section>

      <section className="entries">
        <Link className="card entry-card" to="/machines">
          <h2>I know my machine</h2>
          <p className="muted">Pick your car, bike or truck and get every oil that fits — plus drain intervals.</p>
        </Link>
        <button type="button" className="card entry-card" onClick={() => inputRef.current?.focus()}>
          <h2>I know my oil</h2>
          <p className="muted">Search the oil you use today and find its equivalents from other brands.</p>
        </button>
      </section>
    </div>
  );
}
