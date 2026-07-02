// The matching engine. Four pure functions power the whole app:
//   fitsMachine       -> does this oil suit this machine? (wizard results)
//   recommendOils     -> ranked list of fitting oils for a machine
//   equivalenceScore  -> how interchangeable are two oils? (equivalents finder)
//   compareSpec       -> which value wins a data-sheet row, and why? (compare page)
import { apiMeets, aceaMeets, jasoMeets, SPEC_FIELDS } from '../data/specKnowledge.js';

// An oil fits a machine when the category matches, the viscosity grade is one
// the maker allows, every standard meets-or-exceeds the minimum, and every
// hard OEM approval is held. Reasons/failures are user-facing sentences.
export function fitsMachine(oil, machine) {
  const reasons = [];
  const failures = [];

  if (oil.category !== machine.category) {
    failures.push(`Made for ${oil.category} engines, not ${machine.category}.`);
  }
  if (machine.allowedViscosities.includes(oil.viscosity)) {
    reasons.push(`Viscosity ${oil.viscosity} matches the manufacturer's specified grade.`);
  } else {
    failures.push(`Viscosity ${oil.viscosity} is not an approved grade (needs ${machine.allowedViscosities.join(' or ')}).`);
  }
  if (machine.minApi) {
    if (apiMeets(oil.api, machine.minApi)) {
      reasons.push(`API ${oil.api} meets or exceeds the required API ${machine.minApi}.`);
    } else {
      failures.push(`API rating ${oil.api ?? 'none'} does not meet the required API ${machine.minApi}.`);
    }
  }
  if (machine.minAcea) {
    if (aceaMeets(oil.acea, machine.minAcea)) {
      reasons.push(`Carries the required ACEA ${machine.minAcea} classification.`);
    } else {
      failures.push(`Missing the required ACEA ${machine.minAcea} classification.`);
    }
  }
  if (machine.requiredJaso) {
    if (jasoMeets(oil.jaso, machine.requiredJaso)) {
      reasons.push(`JASO ${oil.jaso} is wet-clutch safe (requirement: ${machine.requiredJaso}).`);
    } else {
      failures.push(`Not certified JASO ${machine.requiredJaso} — unsafe for a wet clutch.`);
    }
  }
  for (const approval of machine.requiredApprovals) {
    if (oil.oemApprovals.includes(approval)) {
      reasons.push(`Holds the required ${approval} approval.`);
    } else {
      failures.push(`Missing the required ${approval} approval.`);
    }
  }
  return { fits: failures.length === 0, reasons, failures };
}

// Rank fitting oils: full synthetic before semi before mineral, then by
// viscosity index (more temperature-stable first).
const BASE_RANK = { 'full-synthetic': 3, 'semi-synthetic': 2, mineral: 1 };

export function recommendOils(machine, products) {
  return products
    .map((oil) => ({ oil, ...fitsMachine(oil, machine) }))
    .filter((r) => r.fits)
    .sort(
      (a, b) =>
        BASE_RANK[b.oil.baseType] - BASE_RANK[a.oil.baseType] ||
        b.oil.specs.viscosityIndex - a.oil.specs.viscosityIndex
    )
    .map(({ oil, reasons }) => ({ oil, reasons }));
}

// Equivalence scoring (0-100): viscosity grade 40, standards 40, approvals 20.
// Tiers: >=85 direct, >=65 close, >=40 partial, else none.
export function equivalenceScore(reference, candidate) {
  const reasons = [];
  const differences = [];

  // Different machine categories are never interchangeable, full stop.
  if (reference.category !== candidate.category) {
    return { score: 0, tier: 'none', reasons, differences: ['Different machinery category.'] };
  }

  let score = 0;

  // Viscosity: 40 for the same grade; 15 if only the winter number matches.
  if (candidate.viscosity === reference.viscosity) {
    score += 40;
    reasons.push(`Same viscosity grade (${reference.viscosity}).`);
  } else if (candidate.viscosity.split('W')[0] === reference.viscosity.split('W')[0]) {
    score += 15;
    differences.push(`Different viscosity grade: ${candidate.viscosity} vs ${reference.viscosity}.`);
  } else {
    differences.push(`Different viscosity grade: ${candidate.viscosity} vs ${reference.viscosity}.`);
  }

  // Standards: API 25 (meets-or-exceeds the reference's rating), ACEA/JASO 15.
  if (apiMeets(candidate.api, reference.api)) {
    score += 25;
    reasons.push(`API ${candidate.api ?? '—'} meets or exceeds API ${reference.api ?? '—'}.`);
  } else {
    differences.push(`Lower API rating (${candidate.api ?? 'none'} vs ${reference.api ?? 'none'}).`);
  }
  const sharedAcea = reference.acea.filter((c) => candidate.acea.includes(c));
  const jasoOk = jasoMeets(candidate.jaso, reference.jaso);
  if (reference.acea.length === 0 && !reference.jaso) {
    score += 15; // reference asks nothing here
  } else if (sharedAcea.length > 0 || (reference.jaso && jasoOk)) {
    score += 15;
    if (sharedAcea.length > 0) reasons.push(`Shares ACEA ${sharedAcea.join(', ')}.`);
    if (reference.jaso && jasoOk) reasons.push(`Matches JASO ${reference.jaso} wet-clutch rating.`);
  } else {
    differences.push('Does not carry the same ACEA/JASO classification.');
  }

  // OEM approvals: 20 scaled by how many of the reference's approvals it shares.
  if (reference.oemApprovals.length === 0) {
    score += 20;
  } else {
    const shared = reference.oemApprovals.filter((a) => candidate.oemApprovals.includes(a));
    score += Math.round((shared.length / reference.oemApprovals.length) * 20);
    if (shared.length > 0) reasons.push(`Shares OEM approvals: ${shared.join(', ')}.`);
    const missing = reference.oemApprovals.filter((a) => !candidate.oemApprovals.includes(a));
    if (missing.length > 0) differences.push(`Missing approvals: ${missing.join(', ')}.`);
  }

  const tier = score >= 85 ? 'direct' : score >= 65 ? 'close' : score >= 40 ? 'partial' : 'none';
  return { score, tier, reasons, differences };
}

// Cross-brand equivalents for one oil: other brands, same category, scored.
export function findEquivalents(reference, products) {
  return products
    .filter((p) => p.id !== reference.id && p.brand !== reference.brand)
    .map((p) => ({ oil: p, ...equivalenceScore(reference, p) }))
    .filter((e) => e.tier !== 'none')
    .sort((a, b) => b.score - a.score);
}

// Decide the winner of one data-sheet row. Honest by design: values within the
// field's tolerance are "no practical difference", and context fields (like
// plain viscosity) never get a winner because they are targets, not scores.
export function compareSpec(fieldKey, values) {
  const field = SPEC_FIELDS.find((f) => f.key === fieldKey);
  if (field.better === 'context') {
    return { winnerIndex: null, equal: true, explanation: field.consequence };
  }
  const best = field.better === 'higher' ? Math.max(...values) : Math.min(...values);
  const worst = field.better === 'higher' ? Math.min(...values) : Math.max(...values);
  if (Math.abs(best - worst) <= field.tolerance) {
    return { winnerIndex: null, equal: true, explanation: 'No practical difference between these oils here.' };
  }
  return { winnerIndex: values.indexOf(best), equal: false, explanation: field.consequence };
}
