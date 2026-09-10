"use client";

import { Html } from "@react-three/drei";
import { REGION_LABEL, SEVERITY_COLOR } from "./config/regions";
import { regionSeverity } from "./config/vitals";
import type { BakedRegions, RegionId, RegionVitalsMap } from "./types";

type RegionHotspotsProps = {
  regions: BakedRegions;
  vitals: RegionVitalsMap;
  activeRegion: RegionId | null;
};

/**
 * Small markers pinned to each region that actually carries a reading,
 * anchored to the centroid computed during baking.
 *
 * Lateral regions use the one-sided centroid: pooling both arms averages
 * out to x ≈ 0, which would leave the "Blood pressure" pin hovering in the
 * middle of the chest instead of on an arm.
 *
 * `occlude="blending"` lets the body hide pins that have rotated behind it,
 * so the far arm's marker doesn't float over the torso.
 */
export default function RegionHotspots({ regions, vitals, activeRegion }: RegionHotspotsProps) {
  const entries = Object.entries(vitals) as [RegionId, RegionVitalsMap[RegionId]][];

  return (
    <>
      {entries.map(([id, entry]) => {
        if (!entry?.vitals.length) return null;

        const anchor = regions.sideCentroids[id] ?? regions.centroids[id];
        if (!anchor) return null;

        const severity = regionSeverity(entry);
        const color = SEVERITY_COLOR[severity];
        const isActive = activeRegion === id;

        return (
          <Html
            key={id}
            position={anchor}
            center
            distanceFactor={8}
            occlude="blending"
            zIndexRange={[10, 0]}
            // The DOM list in BodyLegend is the accessible surface; these are
            // decorative duplicates and must not be announced twice.
            aria-hidden="true"
          >
            <div
              className="pointer-events-none flex select-none items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold shadow-sm transition-all duration-200"
              style={{
                backgroundColor: isActive ? color : "rgba(255,255,255,0.92)",
                color: isActive ? "#ffffff" : "#0f172a",
                transform: `scale(${isActive ? 1.08 : 1})`,
              }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: isActive ? "rgba(255,255,255,0.9)" : color }}
              />
              {REGION_LABEL[id]}
            </div>
          </Html>
        );
      })}
    </>
  );
}
