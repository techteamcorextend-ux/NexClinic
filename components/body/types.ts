/**
 * Shared types for the 3D body viewer.
 *
 * This folder is framework-portable on purpose: no Next.js imports, no
 * Vite `import.meta`, no top-level `window` access. It runs anywhere React
 * and react-three-fiber do.
 */

export type RegionId =
  | "head"
  | "neck"
  | "shoulder"
  | "chest"
  | "abdomen"
  | "pelvis"
  | "upper_arm"
  | "forearm"
  | "hand"
  | "thigh"
  | "knee"
  | "lower_leg"
  | "foot";

/** `full` is the neutral, no-region-focused pose. */
export type FocusTarget = RegionId | "full";

/**
 * Which half of the body a vertex belongs to, from the patient's own
 * perspective: their left arm is on +X because the model faces +Z.
 */
export type BodySide = -1 | 0 | 1;

/** `-2` in the shader means "either side matches". */
export const SIDE_ANY = -2;

export type Severity = "normal" | "watch" | "alert";

export type Vital = {
  id: string;
  name: string;
  value: string;
  unit: string;
  severity: Severity;
};

export type RegionVitals = {
  label: string;
  /** Clinical grouping shown above the label, e.g. "Cardiac". */
  system?: string;
  vitals: Vital[];
  /** Free-text lines (diet plan, mobility notes) rendered under the vitals. */
  notes?: string[];
};

export type RegionVitalsMap = Partial<Record<RegionId, RegionVitals>>;

export type CameraPose = {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  fov: number;
};

export type RegionDefinition = {
  id: RegionId;
  index: number;
  label: string;
  pose: CameraPose;
};

/** What `useRegionBaking` produces once the GLB is in memory. */
export type BakedRegions = {
  /** World-space centroid per region, both sides pooled. */
  centroids: Record<RegionId, [number, number, number]>;
  /** Centroid of just the +X (patient's left) half, for lateral regions. */
  sideCentroids: Partial<Record<RegionId, [number, number, number]>>;
  counts: Record<RegionId, number>;
  /** Runtime-measured height, used to normalise every threshold. */
  height: number;
  /** Y offset applied so the feet sit on y = 0. */
  yOffset: number;
};

/** Highest-precedence input wins; see `useRegionFocus`. */
export type FocusSource = "locked" | "hover" | "scroll" | "idle";
