// Machine finder: a three-step drill-down (category -> make -> model) that
// narrows the 49-machine dataset down to the one page results need. Nothing
// here is stored data — every list is derived live from MACHINES by filtering,
// so adding a new machine to the dataset automatically shows up here.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MACHINES } from '../data/machines.js';

// Category buttons are shown in a fixed, sensible order rather than however
// they first appear in the dataset.
const CATEGORIES = [
  { id: 'car', label: 'Cars' },
  { id: 'motorcycle', label: 'Motorcycles' },
  { id: 'heavy-duty', label: 'Heavy duty' },
];

export default function MachineFinder() {
  // CONCEPT: two pieces of state track how far into the drill-down the user
  // is. Picking a category resets any previously chosen make, so a stale
  // make from a different category can never linger.
  const [category, setCategory] = useState(null);
  const [make, setMake] = useState(null);

  const selectCategory = (id) => {
    setCategory(id);
    setMake(null);
  };

  // Step 2's list: unique makes within the chosen category, alphabetical.
  const makesInCategory = category
    ? [...new Set(MACHINES.filter((m) => m.category === category).map((m) => m.make))].sort()
    : [];

  // Step 3's list: machines matching both the chosen category and make.
  const modelsForMake = category && make
    ? MACHINES.filter((m) => m.category === category && m.make === make)
    : [];

  return (
    <div className="finder">
      <p className="eyebrow">Machine finder</p>
      <h1>What are you running?</h1>
      <p className="muted finder-lede">
        Pick a category, then a make, then your exact model to see every oil that fits.
      </p>

      {/* Breadcrumb: only appears once a step has been taken, and each past
          step is a button that jumps back and clears everything after it. */}
      {category && (
        <nav className="finder-crumbs" aria-label="Selection">
          <button type="button" className="finder-crumb" onClick={() => selectCategory(null)}>
            {CATEGORIES.find((c) => c.id === category)?.label}
          </button>
          {make && (
            <>
              <span aria-hidden="true">/</span>
              <button type="button" className="finder-crumb" onClick={() => setMake(null)} translate="no">
                {make}
              </button>
            </>
          )}
        </nav>
      )}

      {/* Step 1: category. */}
      {!category && (
        <div className="finder-grid" role="region" aria-label="Choose a category">
          {CATEGORIES.map((c) => {
            const count = MACHINES.filter((m) => m.category === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                className="card finder-tile"
                onClick={() => selectCategory(c.id)}
              >
                <h2>{c.label}</h2>
                <p className="muted finder-tile-count">{count} machines</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: make. */}
      {category && !make && (
        <div className="finder-chip-grid" role="region" aria-label="Choose a make">
          {makesInCategory.map((m) => (
            <button key={m} type="button" className="finder-make" onClick={() => setMake(m)} translate="no">
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Step 3: model. */}
      {category && make && (
        <div className="finder-grid" role="region" aria-label="Choose a model">
          {modelsForMake.map((m) => (
            <Link key={m.id} to={`/machines/${m.id}`} className="card finder-model">
              <h3 translate="no">{m.model}</h3>
              <p className="muted finder-model-engine" translate="no">{m.engine}</p>
              <p className="finder-model-years">{m.years}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
