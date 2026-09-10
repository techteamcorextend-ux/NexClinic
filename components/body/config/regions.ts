import type { CameraPose, RegionDefinition, RegionId, Severity } from "../types";

/**
 * ─────────────────────────────────────────────────────────────────────
 *  Region segmentation
 *
 *  The GLB is a single 18,057-vertex mesh with no per-part nodes, so a
 *  region can't be picked by object name — it's synthesised at load time
 *  from each vertex's world-space position. Every threshold is expressed
 *  as a fraction of the RUNTIME-MEASURED bounding-box height, so swapping
 *  the model doesn't silently break the map.
 *
 *  Reference model measures: height 4.4694, arm span 3.6264, feet at y=0.
 * ─────────────────────────────────────────────────────────────────────
 */

/** Ordered by `index` — the numeric id baked into the `aRegionId` attribute. */
export const REGION_ORDER: readonly RegionId[] = [
  "head",
  "neck",
  "shoulder",
  "chest",
  "abdomen",
  "pelvis",
  "upper_arm",
  "forearm",
  "hand",
  "thigh",
  "knee",
  "lower_leg",
  "foot",
] as const;

export const REGION_INDEX: Record<RegionId, number> = REGION_ORDER.reduce(
  (acc, id, i) => {
    acc[id] = i;
    return acc;
  },
  {} as Record<RegionId, number>,
);

export const REGION_LABEL: Record<RegionId, string> = {
  head: "Head",
  neck: "Neck",
  shoulder: "Shoulder",
  chest: "Chest",
  abdomen: "Abdomen",
  pelvis: "Pelvis",
  upper_arm: "Upper arm",
  forearm: "Forearm",
  hand: "Hand",
  thigh: "Thigh",
  knee: "Knee",
  lower_leg: "Lower leg",
  foot: "Foot",
};

/** The arm band, in normalised height. Evaluated BEFORE any torso rule. */
export const ARM_BAND = { min: 0.526, max: 0.761 } as const;

/** Lateral cuts along |x|, in world units (arm span is ~3.63 wide). */
export const ARM_CUTS = { upperArm: 0.45, forearm: 0.95, hand: 1.45 } as const;

/**
 * Neck is narrow: |x| < 0.165, not the 0.35 you might guess from the
 * silhouette. At 0.35 the cut swallows ~333 shoulder vertices and yields
 * 683 neck verts against an expected 350 — verified against the model.
 */
export const NECK_HALF_WIDTH = 0.165;

/** Vertical bands, as fractions of measured height. */
export const BANDS = {
  head: 0.868,
  neckTop: 0.868,
  neckBottom: 0.81,
  shoulderBottom: 0.772,
  chestBottom: 0.66,
  abdomenBottom: 0.548,
  pelvisBottom: 0.481,
  thighBottom: 0.313,
  kneeBottom: 0.257,
  lowerLegBottom: 0.078,
} as const;

/**
 * Classify one vertex. `t` is y/height (feet at 0), `ax` is |x| in world units.
 *
 * Arms are tested first so a vertex out at |x| ≥ 0.45 inside the arm band
 * resolves to an arm rather than to chest. Because of that ordering the
 * torso bands deliberately carry NO |x| gate of their own: gating chest at
 * |x| < 0.45 orphans the 223 vertices sitting between the top of the arm
 * band (t=0.761) and the top of the chest band (t=0.772) — the armpit
 * shelf — which then belong to no region at all.
 */
export function classifyVertex(t: number, ax: number): number {
  // 1. Arms, outermost cut first.
  if (t >= ARM_BAND.min && t <= ARM_BAND.max) {
    if (ax >= ARM_CUTS.hand) return REGION_INDEX.hand;
    if (ax >= ARM_CUTS.forearm) return REGION_INDEX.forearm;
    if (ax >= ARM_CUTS.upperArm) return REGION_INDEX.upper_arm;
  }
  // 2. Head and the neck/shoulder split.
  if (t >= BANDS.head) return REGION_INDEX.head;
  if (t >= BANDS.neckBottom) {
    return ax < NECK_HALF_WIDTH ? REGION_INDEX.neck : REGION_INDEX.shoulder;
  }
  if (t >= BANDS.shoulderBottom) return REGION_INDEX.shoulder;
  // 3. Torso — no lateral gate; the arm pass above already claimed the limbs.
  if (t >= BANDS.chestBottom) return REGION_INDEX.chest;
  if (t >= BANDS.abdomenBottom) return REGION_INDEX.abdomen;
  if (t >= BANDS.pelvisBottom) return REGION_INDEX.pelvis;
  // 4. Legs.
  if (t >= BANDS.thighBottom) return REGION_INDEX.thigh;
  if (t >= BANDS.kneeBottom) return REGION_INDEX.knee;
  if (t >= BANDS.lowerLegBottom) return REGION_INDEX.lower_leg;
  return REGION_INDEX.foot;
}

/** Vertices this close to x=0 count as midline (side 0). */
export const MIDLINE_EPSILON = 0.06;

/**
 * Expected per-region vertex counts for the reference model. `BodyModel`
 * logs actuals against these on load; drift beyond ~5% means the world
 * transform is wrong, not that the thresholds need tuning.
 */
export const EXPECTED_COUNTS: Record<RegionId, number> = {
  head: 2394,
  neck: 350,
  shoulder: 1300,
  chest: 1430,
  abdomen: 935,
  pelvis: 784,
  upper_arm: 1152,
  forearm: 1315,
  hand: 4422,
  thigh: 806,
  knee: 520,
  lower_leg: 1136,
  foot: 1500,
};

/* ───────────────────────────── Camera ────────────────────────────── */

export const NEUTRAL_POSE: CameraPose = {
  position: [0, 2.4, 9.0],
  target: [0, 2.2, 0],
  fov: 35,
};

export const REGION_POSES: Record<RegionId, CameraPose> = {
  head: { position: [0, 4.1, 2.4], target: [0, 4.1, 0], fov: 28 },
  neck: { position: [0, 3.8, 2.4], target: [0, 3.75, 0], fov: 28 },
  shoulder: { position: [0.9, 3.7, 2.8], target: [0.55, 3.55, 0], fov: 30 },
  chest: { position: [0, 3.2, 3.4], target: [0, 3.15, 0], fov: 30 },
  abdomen: { position: [0, 2.7, 3.4], target: [0, 2.7, 0], fov: 30 },
  pelvis: { position: [0, 2.3, 3.6], target: [0, 2.3, 0], fov: 32 },
  upper_arm: { position: [1.6, 3.1, 3.0], target: [0.7, 2.95, 0], fov: 30 },
  forearm: { position: [2.0, 2.9, 2.8], target: [1.2, 2.8, 0], fov: 30 },
  hand: { position: [2.4, 2.7, 2.4], target: [1.65, 2.6, 0], fov: 28 },
  thigh: { position: [0.8, 1.8, 3.6], target: [0.25, 1.78, 0], fov: 32 },
  knee: { position: [0.7, 1.3, 2.8], target: [0.3, 1.28, 0], fov: 30 },
  lower_leg: { position: [0.7, 0.8, 3.0], target: [0.3, 0.75, 0], fov: 32 },
  foot: { position: [0.7, 0.35, 2.4], target: [0.28, 0.2, 0], fov: 30 },
};

export const REGIONS: RegionDefinition[] = REGION_ORDER.map((id, index) => ({
  id,
  index,
  label: REGION_LABEL[id],
  pose: REGION_POSES[id],
}));

/* ──────────────────────── Look and motion ────────────────────────── */

export const SEVERITY_COLOR: Record<Severity, string> = {
  normal: "#14b8a6",
  watch: "#f59e0b",
  alert: "#f43f5e",
};

export const MATERIAL = {
  color: "#0f766e",
  rim: "#2dd4bf",
  transmission: 0.3,
  thickness: 0.8,
  roughness: 0.35,
  metalness: 0,
  envMapIntensity: 0.35,
  /** Non-focused regions fade to this alpha when something is focused. */
  dimOpacity: 0.45,
} as const;

/** Camera tween, ms. */
export const TWEEN_MS = 700;
/** Highlight cross-fade, ms. */
export const HIGHLIGHT_MS = 300;
/** No input for this long returns to neutral and resumes auto-rotate. */
export const IDLE_MS = 4000;
/**
 * OrbitControls counts autoRotateSpeed in units of (2π/60) rad per frame at
 * 60fps, so 0.15 rad/s is 0.15 · 60 / 2π.
 */
export const AUTO_ROTATE_SPEED = 1.432;
/** Hover raycast throttle, ms (~30 Hz). */
export const HOVER_THROTTLE_MS = 33;
/** Below this viewport width the canvas is never mounted. */
export const MOBILE_BREAKPOINT = 768;

export const MODEL_URL = "/models/human_body.glb";

export const MODEL_ATTRIBUTION = {
  text: "3D model by vistaalienprime · CC BY 4.0",
  href: "https://creativecommons.org/licenses/by/4.0/",
};
