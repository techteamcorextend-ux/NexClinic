"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  EXPECTED_COUNTS,
  MIDLINE_EPSILON,
  REGION_ORDER,
  classifyVertex,
} from "../config/regions";
import type { BakedRegions, RegionId } from "../types";

export type BakedResult = {
  geometry: THREE.BufferGeometry;
  regions: BakedRegions;
};

/**
 * Turns the raw GLB mesh into a region-aware geometry.
 *
 * The model has one mesh, one primitive and no per-body-part nodes, so a
 * region can't be picked by name. Instead every vertex is classified by its
 * WORLD-space position — the node chain (Sketchfab_model → root →
 * GLTF_SceneRootNode → BaseSpiderMan_0 → Object_4) carries a scale and a
 * rotation, so classifying raw local positions puts the head in the wrong
 * band entirely.
 *
 * The transform is baked into a cloned geometry rather than applied to the
 * loaded scene: `useGLTF` caches by URL and hands the same object to every
 * consumer, so mutating it would corrupt a second mount.
 *
 * Two attributes come out:
 *   `aRegionId` — 0–12, indexing REGION_ORDER
 *   `aSide`     — −1 patient's left (+X), 0 midline, +1 patient's right (−X)
 */
export function bakeRegions(source: THREE.Mesh): BakedResult {
  const geometry = source.geometry.clone();

  // Full node chain, then drop the mesh's own offset so world == local.
  source.updateWorldMatrix(true, false);
  geometry.applyMatrix4(source.matrixWorld);

  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) throw new Error("[BodyViewer] geometry has no bounding box");

  // Stand the model on y = 0 so every threshold is a clean fraction of height.
  const yOffset = -box.min.y;
  if (yOffset !== 0) {
    geometry.translate(0, yOffset, 0);
    geometry.computeBoundingBox();
  }

  const bounds = geometry.boundingBox;
  if (!bounds) throw new Error("[BodyViewer] geometry lost its bounding box");
  const height = bounds.max.y - bounds.min.y;

  const position = geometry.getAttribute("position");
  const count = position.count;

  const regionIds = new Float32Array(count);
  const sides = new Float32Array(count);

  const sums: Record<string, [number, number, number, number]> = {};
  const sideSums: Record<string, [number, number, number, number]> = {};

  for (let i = 0; i < count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    // Normalise by MEASURED height, never a baked-in literal, so swapping
    // the model for a taller one doesn't silently shift every band.
    const t = y / height;
    const ax = Math.abs(x);

    const regionIndex = classifyVertex(t, ax);
    regionIds[i] = regionIndex;

    // The model faces +Z, so the patient's own left is +X.
    const side = ax < MIDLINE_EPSILON ? 0 : x > 0 ? -1 : 1;
    sides[i] = side;

    const key = REGION_ORDER[regionIndex];
    const bucket = sums[key] ?? (sums[key] = [0, 0, 0, 0]);
    bucket[0] += x;
    bucket[1] += y;
    bucket[2] += z;
    bucket[3] += 1;

    // Lateral regions need a one-sided centroid: pooling both arms puts the
    // "hand" callout floating in the middle of the chest.
    if (side === -1) {
      const sideBucket = sideSums[key] ?? (sideSums[key] = [0, 0, 0, 0]);
      sideBucket[0] += x;
      sideBucket[1] += y;
      sideBucket[2] += z;
      sideBucket[3] += 1;
    }
  }

  geometry.setAttribute("aRegionId", new THREE.BufferAttribute(regionIds, 1));
  geometry.setAttribute("aSide", new THREE.BufferAttribute(sides, 1));
  geometry.computeBoundingSphere();

  const centroids = {} as Record<RegionId, [number, number, number]>;
  const counts = {} as Record<RegionId, number>;
  const sideCentroids: Partial<Record<RegionId, [number, number, number]>> = {};

  for (const id of REGION_ORDER) {
    const bucket = sums[id];
    counts[id] = bucket ? bucket[3] : 0;
    centroids[id] = bucket
      ? [bucket[0] / bucket[3], bucket[1] / bucket[3], bucket[2] / bucket[3]]
      : [0, 0, 0];

    const sideBucket = sideSums[id];
    if (sideBucket && sideBucket[3] > 0) {
      sideCentroids[id] = [
        sideBucket[0] / sideBucket[3],
        sideBucket[1] / sideBucket[3],
        sideBucket[2] / sideBucket[3],
      ];
    }
  }

  return { geometry, regions: { centroids, counts, sideCentroids, height, yOffset } };
}

/**
 * Logs measured counts against the reference model's. A drift beyond ~5%
 * means the world-space transform is wrong — fix that rather than nudging
 * the thresholds until the numbers agree.
 */
export function logRegionCounts(regions: BakedRegions): void {
  if (typeof console === "undefined") return;

  const rows = REGION_ORDER.map((id) => {
    const got = regions.counts[id];
    const expected = EXPECTED_COUNTS[id];
    const drift = expected ? ((got - expected) / expected) * 100 : 0;
    return {
      region: id,
      vertices: got,
      expected,
      drift: `${drift >= 0 ? "+" : ""}${drift.toFixed(1)}%`,
      ok: Math.abs(drift) <= 5,
    };
  });

  const bad = rows.filter((row) => !row.ok);
  console.groupCollapsed(
    `[BodyViewer] region segmentation — height ${regions.height.toFixed(3)}, ${bad.length ? `${bad.length} region(s) off` : "all within 5%"}`,
  );
  console.table(rows);
  if (bad.length) {
    console.warn(
      "[BodyViewer] Vertex counts drifted. This usually means the node-chain transform was not applied before classifying.",
      bad,
    );
  }
  console.groupEnd();
}

export function useRegionBaking(source: THREE.Mesh | null): BakedResult | null {
  return useMemo(() => {
    if (!source) return null;
    const baked = bakeRegions(source);
    logRegionCounts(baked.regions);
    return baked;
  }, [source]);
}
