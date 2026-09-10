import type { RegionId, RegionVitals, RegionVitalsMap, Severity } from "../types";

/**
 * Region ↔ vitals mapping.
 *
 * `DEFAULT_REGION_VITALS` is the standalone demo dataset. In the app the
 * viewer is instead handed live values built by `buildRegionVitals`, so a
 * vital edited in the consultation screen moves the highlight colour here
 * too. Nothing clinical is hard-coded into JSX.
 */

/** Where each chart vital id lands on the body. */
export const VITAL_REGION: Record<string, RegionId> = {
  temp: "head",
  hr: "chest",
  spo2: "chest",
  bp: "upper_arm",
  weight: "abdomen",
  sugar: "abdomen",
};

/** The clinical system each region is presented under. */
export const REGION_SYSTEM: Partial<Record<RegionId, string>> = {
  head: "Neurological",
  chest: "Cardiac",
  upper_arm: "Circulation",
  abdomen: "Metabolic",
  knee: "Musculoskeletal",
};

/**
 * Severity bands, evaluated against the numeric part of a vital's value.
 * Deliberately conservative demo thresholds — not clinical guidance.
 */
type Band = { watch?: (n: number) => boolean; alert?: (n: number) => boolean };

const BANDS: Record<string, Band> = {
  temp: { watch: (n) => n >= 37.5 || n < 35.5, alert: (n) => n >= 38.5 },
  hr: { watch: (n) => n > 90 || n < 55, alert: (n) => n > 120 || n < 45 },
  // SpO2 at 95 lands in `alert` so the red highlight is visible in the demo.
  spo2: { watch: (n) => n < 97, alert: (n) => n <= 95 },
  bp: { watch: (n) => n >= 80, alert: (n) => n >= 90 },
  weight: {},
  sugar: { watch: (n) => n >= 110, alert: (n) => n >= 140 },
};

/** First number in a string like "80 / 120" or "36.6". */
export function firstNumber(value: string): number {
  const match = value.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : Number.NaN;
}

export function severityFor(id: string, value: string): Severity {
  const band = BANDS[id];
  const n = firstNumber(value);
  if (!band || Number.isNaN(n)) return "normal";
  if (band.alert?.(n)) return "alert";
  if (band.watch?.(n)) return "watch";
  return "normal";
}

/** A chart vital, structurally identical to the app's `PatientChart` vitals. */
export type ChartVital = { id: string; label: string; value: string; unit: string };

/**
 * Fold a patient's chart into per-region vitals. Unmapped vitals are
 * dropped rather than guessed at.
 */
export function buildRegionVitals(
  vitals: readonly ChartVital[],
  extras?: { diet?: readonly string[]; mobility?: string },
): RegionVitalsMap {
  const map: RegionVitalsMap = {};

  for (const vital of vitals) {
    const region = VITAL_REGION[vital.id];
    if (!region) continue;
    const entry: RegionVitals = map[region] ?? {
      label: REGION_SYSTEM[region] ?? "",
      system: REGION_SYSTEM[region],
      vitals: [],
    };
    entry.vitals = [
      ...entry.vitals,
      {
        id: vital.id,
        name: vital.label,
        value: vital.value,
        unit: vital.unit,
        severity: severityFor(vital.id, vital.value),
      },
    ];
    map[region] = entry;
  }

  if (extras?.diet?.length) {
    const abdomen = map.abdomen ?? {
      label: "Metabolic",
      system: "Metabolic",
      vitals: [],
    };
    map.abdomen = { ...abdomen, notes: [...extras.diet] };
  }

  if (extras?.mobility) {
    map.knee = {
      label: "Musculoskeletal",
      system: "Musculoskeletal",
      vitals: [
        { id: "rom", name: "Mobility", value: extras.mobility, unit: "", severity: "normal" },
      ],
    };
  }

  return map;
}

/** Standalone demo data — mirrors the seeded chart for Clara Martin. */
export const DEFAULT_REGION_VITALS: RegionVitalsMap = buildRegionVitals(
  [
    { id: "temp", label: "Temperature", value: "36.6", unit: "°C" },
    { id: "hr", label: "Heart rate", value: "88", unit: "bpm" },
    { id: "spo2", label: "Oxygen saturation", value: "95", unit: "%" },
    { id: "bp", label: "Blood pressure", value: "80 / 120", unit: "mmHg" },
    { id: "weight", label: "Weight", value: "61", unit: "kg" },
  ],
  {
    diet: [
      "Low-sodium: under 2 g salt per day",
      "Two portions of oily fish per week",
      "No caffeine after 16:00",
      "30 minutes brisk walking, five days a week",
    ],
    mobility: "Full range, no effusion",
  },
);

/** Worst severity present in a region — drives the highlight colour. */
export function regionSeverity(entry: RegionVitals | undefined): Severity {
  if (!entry?.vitals.length) return "normal";
  if (entry.vitals.some((v) => v.severity === "alert")) return "alert";
  if (entry.vitals.some((v) => v.severity === "watch")) return "watch";
  return "normal";
}
