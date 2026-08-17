// Derives cost/CO2 estimates server-side from raw kWh input — the client only ever sends
// consumptionKwh (see lib/validations.ts), never the estimates themselves, so a citizen can't
// submit a fabricated cost or emissions figure.
//
// The constants below are approximations for demo purposes, not certified figures:
// - TARIFF_RP_PER_KWH mirrors PLN's long-standing R1/TR 1300-2200 VA residential rate.
// - EMISSION_KG_CO2_PER_KWH mirrors commonly-cited approximations for Indonesia's grid mix.
// Replace both with the current official figures for the pilot area if precision matters for judging.
const TARIFF_RP_PER_KWH = 1444.7;
const EMISSION_KG_CO2_PER_KWH = 0.87;

export function estimateCost(consumptionKwh: number): number {
  return Math.round(consumptionKwh * TARIFF_RP_PER_KWH);
}

export function estimateCo2(consumptionKwh: number): number {
  return Number((consumptionKwh * EMISSION_KG_CO2_PER_KWH).toFixed(2));
}
