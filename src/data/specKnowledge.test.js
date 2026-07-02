// Tests for the standards helpers: the rules that decide whether one oil's
// certification "meets or exceeds" a machine's minimum requirement.
import { describe, it, expect } from 'vitest';
import { SPEC_FIELDS, apiMeets, aceaMeets, jasoMeets } from './specKnowledge.js';

describe('apiMeets', () => {
  it('newer gasoline rating satisfies older minimum', () => {
    expect(apiMeets('SP', 'SN')).toBe(true);
  });
  it('older rating fails newer minimum', () => {
    expect(apiMeets('SL', 'SN')).toBe(false);
  });
  it('equal rating passes', () => {
    expect(apiMeets('SN', 'SN')).toBe(true);
  });
  it('diesel C-series works the same way', () => {
    expect(apiMeets('CK-4', 'CI-4')).toBe(true);
    expect(apiMeets('CH-4', 'CJ-4')).toBe(false);
  });
  it('mixed series never satisfies (S oil vs C requirement)', () => {
    expect(apiMeets('SP', 'CI-4')).toBe(false);
  });
  it('no requirement always passes; no rating fails a requirement', () => {
    expect(apiMeets('SP', null)).toBe(true);
    expect(apiMeets(null, 'SN')).toBe(false);
  });
});

describe('aceaMeets', () => {
  it('passes when the oil lists the exact required class', () => {
    expect(aceaMeets(['C3', 'A3/B4'], 'C3')).toBe(true);
  });
  it('fails when the class is missing (C2 is NOT a lower C3)', () => {
    expect(aceaMeets(['C2'], 'C3')).toBe(false);
  });
  it('no requirement always passes', () => {
    expect(aceaMeets([], null)).toBe(true);
  });
});

describe('jasoMeets', () => {
  it('MA2 satisfies MA (MA2 is the higher-friction subset of MA)', () => {
    expect(jasoMeets('MA2', 'MA')).toBe(true);
  });
  it('MB does not satisfy MA', () => {
    expect(jasoMeets('MB', 'MA')).toBe(false);
  });
  it('no requirement always passes', () => {
    expect(jasoMeets(null, null)).toBe(true);
  });
});

describe('SPEC_FIELDS', () => {
  it('covers all seven TDS fields with explanations', () => {
    const keys = SPEC_FIELDS.map((f) => f.key);
    expect(keys).toEqual(['visc40', 'visc100', 'viscosityIndex', 'flashPoint', 'pourPoint', 'tbn', 'density']);
    for (const f of SPEC_FIELDS) {
      expect(f.explanation.length).toBeGreaterThan(20);
      expect(f.consequence.length).toBeGreaterThan(20);
      expect(['higher', 'lower', 'context']).toContain(f.better);
    }
  });
});
