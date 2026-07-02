// Schema + coverage guardrails for the product dataset. If a future edit
// breaks a field or drops coverage, these fail loudly.
import { describe, it, expect } from 'vitest';
import { PRODUCTS } from './products.js';

const SPEC_KEYS = ['visc40', 'visc100', 'viscosityIndex', 'flashPoint', 'pourPoint', 'tbn', 'density'];

describe('PRODUCTS dataset', () => {
  it('has at least 50 products across at least 6 brands', () => {
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(50);
    expect(new Set(PRODUCTS.map((p) => p.brand)).size).toBeGreaterThanOrEqual(6);
  });
  it('covers all three categories with sensible minimums', () => {
    const count = (c) => PRODUCTS.filter((p) => p.category === c).length;
    expect(count('car')).toBeGreaterThanOrEqual(30);
    expect(count('motorcycle')).toBeGreaterThanOrEqual(7);
    expect(count('heavy-duty')).toBeGreaterThanOrEqual(7);
  });
  it('every product has a complete, well-typed record', () => {
    const ids = new Set();
    for (const p of PRODUCTS) {
      expect(ids.has(p.id), `duplicate id ${p.id}`).toBe(false);
      ids.add(p.id);
      expect(p.id).toMatch(/^[a-z0-9-]+$/);
      expect(p.viscosity).toMatch(/^\d{1,2}W-\d{2}$/);
      expect(['full-synthetic', 'semi-synthetic', 'mineral']).toContain(p.baseType);
      expect(['car', 'motorcycle', 'heavy-duty']).toContain(p.category);
      expect(Array.isArray(p.acea)).toBe(true);
      expect(Array.isArray(p.oemApprovals)).toBe(true);
      expect(p.datasheetUrl).toMatch(/^https:\/\//);
      for (const k of SPEC_KEYS) {
        expect(typeof p.specs[k], `${p.id}.specs.${k}`).toBe('number');
      }
      // Physical sanity: catches typos like a flash point of 22 or pour point of +42.
      expect(p.specs.flashPoint).toBeGreaterThan(150);
      expect(p.specs.pourPoint).toBeLessThan(0);
      expect(p.specs.visc100).toBeGreaterThan(4);
      expect(p.specs.visc100).toBeLessThan(30);
    }
  });
  it('motorcycle oils carry a JASO rating; others may not', () => {
    for (const p of PRODUCTS.filter((p) => p.category === 'motorcycle')) {
      expect(['MA', 'MA2', 'MB']).toContain(p.jaso);
    }
  });
});
