// Tests for the matching engine — the pure functions that power every feature.
// CONCEPT: a pure function's output depends only on its inputs (no network, no
// state), which is why we can test it with tiny hand-made objects like these.
import { describe, it, expect } from 'vitest';
import { fitsMachine, recommendOils, equivalenceScore, findEquivalents, compareSpec } from './matching.js';

const oil = (over = {}) => ({
  id: 'test-oil', brand: 'BrandA', name: 'Test 5W-30', viscosity: '5W-30',
  baseType: 'full-synthetic', category: 'car', api: 'SP', acea: ['C3'],
  jaso: null, oemApprovals: ['MB 229.51'],
  specs: { visc40: 68, visc100: 12, viscosityIndex: 170, flashPoint: 226, pourPoint: -42, tbn: 7.8, density: 0.852 },
  datasheetUrl: 'https://example.com', ...over,
});
const machine = (over = {}) => ({
  id: 'test-car', category: 'car', make: 'Test', model: 'Car', engine: '2.0L', years: '2020',
  allowedViscosities: ['5W-30'], minApi: 'SN', minAcea: null, requiredJaso: null,
  requiredApprovals: [], sumpCapacityL: 4.5,
  drain: { normalKm: 10000, normalMonths: 12, severeKm: 5000, severeMonths: 6 }, ...over,
});

describe('fitsMachine', () => {
  it('fits when viscosity, API and category all line up', () => {
    const r = fitsMachine(oil(), machine());
    expect(r.fits).toBe(true);
    expect(r.reasons.length).toBeGreaterThan(0);
  });
  it('fails on wrong viscosity, with the failure explained', () => {
    const r = fitsMachine(oil({ viscosity: '10W-40' }), machine());
    expect(r.fits).toBe(false);
    expect(r.failures.join(' ')).toMatch(/viscosity/i);
  });
  it('fails on insufficient API rating', () => {
    expect(fitsMachine(oil({ api: 'SL' }), machine()).fits).toBe(false);
  });
  it('fails on missing hard OEM approval', () => {
    const m = machine({ requiredApprovals: ['VW 504.00'] });
    expect(fitsMachine(oil(), m).fits).toBe(false);
  });
  it('fails across categories (motorcycle oil in a car)', () => {
    expect(fitsMachine(oil({ category: 'motorcycle' }), machine()).fits).toBe(false);
  });
  it('honours ACEA requirement exactly', () => {
    const m = machine({ minAcea: 'C3' });
    expect(fitsMachine(oil(), m).fits).toBe(true);
    expect(fitsMachine(oil({ acea: ['C2'] }), m).fits).toBe(false);
  });
});

describe('recommendOils', () => {
  it('returns only fitting oils, full synthetics ranked first', () => {
    const products = [
      oil({ id: 'a', baseType: 'mineral', api: 'SN' }),
      oil({ id: 'b', baseType: 'full-synthetic' }),
      oil({ id: 'c', viscosity: '0W-20' }), // wrong grade -> excluded
    ];
    const recs = recommendOils(machine(), products);
    expect(recs.map((r) => r.oil.id)).toEqual(['b', 'a']);
  });
  it('returns empty array when nothing fits', () => {
    expect(recommendOils(machine({ allowedViscosities: ['0W-16'] }), [oil()])).toEqual([]);
  });
});

describe('equivalenceScore', () => {
  it('same grade, same standards, same approvals -> direct equivalent', () => {
    const r = equivalenceScore(oil(), oil({ id: 'x', brand: 'BrandB' }));
    expect(r.score).toBeGreaterThanOrEqual(85);
    expect(r.tier).toBe('direct');
  });
  it('different viscosity grade tanks the score', () => {
    const r = equivalenceScore(oil(), oil({ id: 'x', brand: 'BrandB', viscosity: '0W-20' }));
    expect(r.tier).not.toBe('direct');
    expect(r.differences.join(' ')).toMatch(/viscosity/i);
  });
  it('cross-category is never an equivalent', () => {
    const r = equivalenceScore(oil(), oil({ id: 'x', brand: 'BrandB', category: 'heavy-duty' }));
    expect(r.tier).toBe('none');
  });
});

describe('findEquivalents', () => {
  it('excludes same brand and the reference itself, sorts by score', () => {
    const ref = oil();
    const products = [
      ref,
      oil({ id: 'same-brand', brand: 'BrandA' }),
      oil({ id: 'perfect', brand: 'BrandB' }),
      oil({ id: 'partial', brand: 'BrandC', acea: [], oemApprovals: [] }),
    ];
    const eq = findEquivalents(ref, products);
    expect(eq.map((e) => e.oil.id)).toEqual(['perfect', 'partial']);
  });
});

describe('compareSpec', () => {
  it('lower pour point wins with an explanation', () => {
    const r = compareSpec('pourPoint', [-42, -33]);
    expect(r.winnerIndex).toBe(0);
    expect(r.explanation.length).toBeGreaterThan(20);
  });
  it('values inside the tolerance are equal — never manufacture a winner', () => {
    const r = compareSpec('flashPoint', [226, 224]);
    expect(r.equal).toBe(true);
    expect(r.winnerIndex).toBe(null);
  });
  it('context fields (plain viscosity) never pick a winner', () => {
    const r = compareSpec('visc100', [12, 14]);
    expect(r.winnerIndex).toBe(null);
  });
});
