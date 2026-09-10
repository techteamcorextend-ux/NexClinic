"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HOVER_THROTTLE_MS, MODEL_URL, REGION_ORDER } from "./config/regions";
import { useRegionBaking } from "./hooks/useRegionBaking";
import { useRegionFocus } from "./hooks/useRegionFocus";
import type { BodyUniforms } from "./shaders/bodyMaterial";
import { createBodyMaterial } from "./shaders/bodyMaterial";
import type { BakedRegions, BodySide, RegionId } from "./types";

type BodyModelProps = {
  uniforms: BodyUniforms;
  /** Suppresses hover while the user is orbiting the camera. */
  draggingRef: React.MutableRefObject<boolean>;
  onBaked?: (regions: BakedRegions) => void;
};

/** First mesh in the scene — the GLB has exactly one. */
function findMesh(scene: THREE.Object3D): THREE.Mesh | null {
  let found: THREE.Mesh | null = null;
  scene.traverse((child) => {
    if (!found && (child as THREE.Mesh).isMesh) found = child as THREE.Mesh;
  });
  return found;
}

export default function BodyModel({ uniforms, draggingRef, onBaked }: BodyModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const { invalidate } = useThree();

  const source = useMemo(() => findMesh(scene), [scene]);
  const baked = useRegionBaking(source);

  const material = useMemo(() => createBodyMaterial(uniforms), [uniforms]);

  const setHover = useRegionFocus((state) => state.setHover);
  const clearHover = useRegionFocus((state) => state.clearHover);
  const toggleLock = useRegionFocus((state) => state.toggleLock);

  const lastHoverAt = useRef(0);

  useEffect(() => {
    if (baked && onBaked) onBaked(baked.regions);
  }, [baked, onBaked]);

  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => baked?.geometry.dispose(), [baked]);

  /**
   * Read the region straight off the hit triangle.
   *
   * `intersect.face` gives three vertex indices; the correct one is whichever
   * is nearest the hit point. Interpolating instead would produce fractional
   * ids along every region seam and make boundaries pick the wrong region.
   */
  const regionAt = (event: ThreeEvent<MouseEvent>): { region: RegionId; side: BodySide } | null => {
    const face = event.face;
    const geometry = baked?.geometry;
    if (!face || !geometry) return null;

    const position = geometry.getAttribute("position");
    const regionAttr = geometry.getAttribute("aRegionId");
    const sideAttr = geometry.getAttribute("aSide");
    if (!regionAttr || !sideAttr) return null;

    const point = event.point;
    let best = face.a;
    let bestDistance = Infinity;

    for (const index of [face.a, face.b, face.c]) {
      const dx = position.getX(index) - point.x;
      const dy = position.getY(index) - point.y;
      const dz = position.getZ(index) - point.z;
      const distance = dx * dx + dy * dy + dz * dz;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    }

    const regionIndex = Math.round(regionAttr.getX(best));
    const region = REGION_ORDER[regionIndex];
    if (!region) return null;

    const side = Math.round(sideAttr.getX(best)) as BodySide;
    return { region, side };
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (draggingRef.current) return;

    const now = performance.now();
    if (now - lastHoverAt.current < HOVER_THROTTLE_MS) return;
    lastHoverAt.current = now;

    const hit = regionAt(event);
    if (!hit) return;
    event.stopPropagation();
    setHover(hit.region, hit.side);
    invalidate();
  };

  const handlePointerOut = () => {
    clearHover();
    invalidate();
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (draggingRef.current) return;
    const hit = regionAt(event);
    if (!hit) return;
    event.stopPropagation();
    toggleLock(hit.region, hit.side);
    invalidate();
  };

  if (!baked) return null;

  return (
    <mesh
      geometry={baked.geometry}
      material={material}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      frustumCulled={false}
    />
  );
}

useGLTF.preload(MODEL_URL);
