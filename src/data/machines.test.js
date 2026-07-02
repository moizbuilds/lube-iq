// Guardrails for the machinery dataset — including the most important test in
// the app: every machine must have at least one fitting oil, so no user ever
// hits a dead end the data team didn't know about.
import { describe, it, expect } from 'vitest';
import { MACHINES } from './machines.js';
import { PRODUCTS } from './products.js';
import { recommendOils } from '../logic/matching.js';

describe('MACHINES dataset', () => {
  it('has at least 45 machines across all three categories', () => {
    expect(MACHINES.length).toBeGreaterThanOrEqual(45);
    const count = (c) => MACHINES.filter((m) => m.category === c).length;
    expect(count('car')).toBeGreaterThanOrEqual(28);
    expect(count('motorcycle')).toBeGreaterThanOrEqual(7);
    expect(count('heavy-duty')).toBeGreaterThanOrEqual(6);
  });
  it('every machine has a complete, well-typed record', () => {
    const ids = new Set();
    for (const m of MACHINES) {
      expect(ids.has(m.id), `duplicate id ${m.id}`).toBe(false);
      ids.add(m.id);
      expect(m.allowedViscosities.length).toBeGreaterThan(0);
      for (const v of m.allowedViscosities) expect(v).toMatch(/^\d{1,2}W-\d{2}$/);
      expect(m.sumpCapacityL).toBeGreaterThan(0.5);
      expect(m.drain.severeKm).toBeLessThanOrEqual(m.drain.normalKm);
      expect(m.drain.normalKm).toBeGreaterThanOrEqual(3000);
      expect(m.drain.normalKm).toBeLessThanOrEqual(120000);
    }
  });
  it('every machine has at least one fitting oil in the catalogue', () => {
    for (const m of MACHINES) {
      const recs = recommendOils(m, PRODUCTS);
      expect(recs.length, `${m.id} has no fitting oil`).toBeGreaterThan(0);
    }
  });
});
