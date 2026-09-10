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
 * No `distanceFactor` either: it scales the label with camera distance, so
 * zooming into a region blew its pin up to fill the panel. Labels want a
 * constant screen size.
 *
 * No `occlude` here, and specifically not `occlude="blending"`: that mode
 * reaches into the R3F canvas and rewrites its inline styles — position:
 * absolute, pointer-events: none, and a z-index derived from zIndexRange.
 * That stops the canvas sizing to its container (it sticks at whatever
 * height it had when the style was applied) and silently kills every
 * pointer event on the mesh, so hover and click stop working. The body is
 * translucent anyway, so hiding pins behind it buys little.
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
          >
            {/*
              aria-hidden belongs on this div, never on <Html> itself: R3F's
              applyProps treats an unknown prop's dashes as a nested path, so
              `aria-hidden` on a three object resolves `instance.aria.hidden`
              and throws. The DOM list in BodyLegend is the accessible
              surface; these pins are decorative duplicates.
            */}
            <div
              aria-hidden="true"
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
