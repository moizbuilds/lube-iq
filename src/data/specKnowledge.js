// The "why" layer of Lube IQ. Explains every data-sheet field in plain English,
// says which direction is better, and encodes how oil standards (API/ACEA/JASO)
// rank against each other. The matching engine and compare page both read this.

// API gasoline ("S") and diesel ("C") ratings, oldest -> newest. Newer ratings
// are backward compatible: an SP oil is fine where SN is required.
export const API_S_ORDER = ['SG', 'SH', 'SJ', 'SL', 'SM', 'SN', 'SN PLUS', 'SP'];
export const API_C_ORDER = ['CG-4', 'CH-4', 'CI-4', 'CI-4 PLUS', 'CJ-4', 'CK-4'];

// Does an oil's API rating meet or exceed a machine's minimum?
export function apiMeets(oilApi, minApi) {
  if (!minApi) return true;
  if (!oilApi) return false;
  const order = minApi.startsWith('C') ? API_C_ORDER : API_S_ORDER;
  const oilRank = order.indexOf(oilApi.toUpperCase());
  const minRank = order.indexOf(minApi.toUpperCase());
  if (oilRank === -1 || minRank === -1) return false; // different series or unknown
  return oilRank >= minRank;
}

// ACEA classes (C2, C3, A3/B4...) are categories, not a ladder: C2 is a
// low-friction variant, not a "lower C3". So we require the exact class.
export function aceaMeets(oilAcea, required) {
  if (!required) return true;
  return oilAcea.includes(required);
}

// JASO (motorcycle wet-clutch standard): MA2 is a subset of MA with higher
// friction, so MA2 satisfies an MA requirement. MB (low friction) never does.
export function jasoMeets(oilJaso, required) {
  if (!required) return true;
  if (!oilJaso) return false;
  if (oilJaso === required) return true;
  return oilJaso === 'MA2' && required === 'MA';
}

// One entry per TDS field. `better` drives compare-table highlighting;
// `tolerance` is the gap below which two values count as "no practical
// difference"; `consequence` is the plain-English line shown to users.
export const SPEC_FIELDS = [
  {
    key: 'visc40', label: 'Viscosity @ 40°C', unit: 'cSt', better: 'context', tolerance: 0,
    explanation: 'How thick the oil is at a warm-garage temperature. This is a target set by the viscosity grade, not a quality score.',
    consequence: 'Two oils of the same grade should sit close here; a big gap means they will feel different before the engine is fully warm.',
  },
  {
    key: 'visc100', label: 'Viscosity @ 100°C', unit: 'cSt', better: 'context', tolerance: 0,
    explanation: 'How thick the oil is at full operating temperature. Defined by the second number of the grade (the "30" in 5W-30).',
    consequence: 'This must match what your engine was designed for — thicker is not better, it is just different.',
  },
  {
    key: 'viscosityIndex', label: 'Viscosity index', unit: '', better: 'higher', tolerance: 5,
    explanation: 'How stable the oil\'s thickness stays as temperature changes. Higher means it behaves more consistently from cold start to desert heat.',
    consequence: 'A higher viscosity index protects more evenly across the day — especially valuable in Gulf summers.',
  },
  {
    key: 'flashPoint', label: 'Flash point', unit: '°C', better: 'higher', tolerance: 5,
    explanation: 'The temperature at which the oil\'s vapour can ignite. A rough proxy for how well it resists evaporating in a hot engine.',
    consequence: 'A higher flash point means less oil burn-off and less frequent topping up in hot climates.',
  },
  {
    key: 'pourPoint', label: 'Pour point', unit: '°C', better: 'lower', tolerance: 3,
    explanation: 'The coldest temperature at which the oil still flows. Lower is better for cold starts.',
    consequence: 'Most engine wear happens in the first seconds after start-up; an oil that flows sooner protects sooner.',
  },
  {
    key: 'tbn', label: 'TBN (Total Base Number)', unit: 'mg KOH/g', better: 'higher', tolerance: 0.5,
    explanation: 'The oil\'s reserve for neutralising the acids created by combustion. It gets used up over the oil\'s life.',
    consequence: 'A higher TBN keeps protecting longer between drains — it is one reason long-drain oils can go further.',
  },
  {
    key: 'density', label: 'Density @ 15°C', unit: 'kg/L', better: 'context', tolerance: 0,
    explanation: 'The oil\'s weight per litre. Mostly reflects the base-oil chemistry rather than performance.',
    consequence: 'Density differences are normal between formulations and do not make one oil better than another.',
  },
];
