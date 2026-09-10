"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  AUTO_ROTATE_SPEED,
  HIGHLIGHT_MS,
  IDLE_MS,
  NEUTRAL_POSE,
  REGION_INDEX,
  REGION_POSES,
  TWEEN_MS,
} from "../config/regions";
import type { CameraPose, FocusTarget } from "../types";
import { useRegionFocus, useResolvedFocus } from "./useRegionFocus";
import type { BodyUniforms } from "../shaders/bodyMaterial";

/** Standard ease-in-out cubic. */
function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function poseFor(target: FocusTarget, side: number): CameraPose {
  if (target === "full") return NEUTRAL_POSE;
  const pose = REGION_POSES[target];
  // The patient's right is −X, so mirror the pose to fly to the limb the
  // user actually pointed at instead of always the left one.
  if (side === 1) {
    return {
      position: [-pose.position[0], pose.position[1], pose.position[2]],
      target: [-pose.target[0], pose.target[1], pose.target[2]],
      fov: pose.fov,
    };
  }
  return pose;
}

type RigOptions = {
  controls: React.MutableRefObject<OrbitControlsImpl | null>;
  uniforms: BodyUniforms;
  /** Highlight colour for the focused region's worst severity. */
  severityColor: string;
  reduced: boolean;
  /** False while the canvas is scrolled out of view — stops the loop. */
  active: boolean;
};

/**
 * Drives camera position, orbit target and fov toward the focused region,
 * and cross-fades the shader's highlight.
 *
 * Everything is tweened on wall-clock time inside `useFrame`, never bound to
 * scroll offset. Under `prefers-reduced-motion` the tween is replaced by an
 * instant cut and auto-rotate never starts.
 */
export function useCameraRig({
  controls,
  uniforms,
  severityColor,
  reduced,
  active,
}: RigOptions): void {
  const { camera, invalidate } = useThree();

  const from = useRef({
    position: new THREE.Vector3().fromArray(NEUTRAL_POSE.position as unknown as number[]),
    target: new THREE.Vector3().fromArray(NEUTRAL_POSE.target as unknown as number[]),
    fov: NEUTRAL_POSE.fov,
  });
  const to = useRef({
    position: new THREE.Vector3().fromArray(NEUTRAL_POSE.position as unknown as number[]),
    target: new THREE.Vector3().fromArray(NEUTRAL_POSE.target as unknown as number[]),
    fov: NEUTRAL_POSE.fov,
  });
  const progress = useRef(1);
  const highlight = useRef(0);
  const highlightTo = useRef(0);
  const colorFrom = useRef(new THREE.Color(severityColor));
  const colorTo = useRef(new THREE.Color(severityColor));

  // Must go through the memoised resolver: a selector that allocates a new
  // object per read makes useSyncExternalStore re-render forever.
  const resolved = useResolvedFocus();
  const focus =
    resolved.target === "full"
      ? null
      : { region: resolved.target, side: resolved.side };

  const lastInputAt = useRegionFocus((state) => state.lastInputAt);
  const locked = useRegionFocus((state) => state.locked);
  const setIdle = useRegionFocus((state) => state.setIdle);
  const idle = useRegionFocus((state) => state.idle);

  const focusKey = focus ? `${focus.region}:${focus.side}` : "full";

  // Retarget whenever the winning focus changes.
  useEffect(() => {
    const targetName: FocusTarget = focus ? focus.region : "full";
    const pose = poseFor(targetName, focus?.side ?? -2);

    from.current.position.copy(camera.position);
    if (controls.current) from.current.target.copy(controls.current.target);
    from.current.fov = (camera as THREE.PerspectiveCamera).fov;

    to.current.position.fromArray(pose.position as unknown as number[]);
    to.current.target.fromArray(pose.target as unknown as number[]);
    to.current.fov = pose.fov;

    progress.current = reduced ? 1 : 0;

    if (reduced) {
      camera.position.copy(to.current.position);
      if (controls.current) controls.current.target.copy(to.current.target);
      (camera as THREE.PerspectiveCamera).fov = to.current.fov;
      camera.updateProjectionMatrix();
    }

    // Highlight target: 1 when a region owns the focus, 0 at neutral.
    highlightTo.current = focus ? 1 : 0;
    uniforms.uActiveRegion.value = focus ? REGION_INDEX[focus.region] : -1;
    uniforms.uActiveSide.value = focus ? focus.side : -2;

    colorFrom.current.copy(uniforms.uSeverityColor.value);
    colorTo.current.set(severityColor);

    invalidate();
    // `focusKey` collapses the object identity into a stable primitive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, severityColor, reduced]);

  // Idle watchdog. Locked never goes idle — the user asked for that view.
  useEffect(() => {
    if (reduced || locked || !active) return;
    const handle = window.setTimeout(() => setIdle(true), IDLE_MS);
    return () => window.clearTimeout(handle);
  }, [lastInputAt, locked, reduced, active, setIdle]);

  useFrame((_, delta) => {
    if (!active) return;
    const orbit = controls.current;
    let needsAnotherFrame = false;

    // ── Camera tween ──
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + (delta * 1000) / TWEEN_MS);
      const t = ease(progress.current);

      camera.position.lerpVectors(from.current.position, to.current.position, t);
      if (orbit) orbit.target.lerpVectors(from.current.target, to.current.target, t);

      const perspective = camera as THREE.PerspectiveCamera;
      perspective.fov = from.current.fov + (to.current.fov - from.current.fov) * t;
      perspective.updateProjectionMatrix();

      needsAnotherFrame = true;
    }

    // ── Highlight cross-fade ──
    if (highlight.current !== highlightTo.current) {
      const step = (delta * 1000) / HIGHLIGHT_MS;
      const direction = Math.sign(highlightTo.current - highlight.current);
      highlight.current = THREE.MathUtils.clamp(
        highlight.current + step * direction,
        0,
        1,
      );
      uniforms.uHighlight.value = highlight.current;
      needsAnotherFrame = true;
    }

    if (!uniforms.uSeverityColor.value.equals(colorTo.current)) {
      uniforms.uSeverityColor.value.lerp(colorTo.current, Math.min(1, delta * 6));
      needsAnotherFrame = true;
    }

    // ── Idle auto-rotate ──
    if (orbit) {
      const shouldRotate = idle && !reduced && !locked;
      orbit.autoRotate = shouldRotate;
      orbit.autoRotateSpeed = AUTO_ROTATE_SPEED;
      if (shouldRotate) needsAnotherFrame = true;
      orbit.update();
    }

    if (needsAnotherFrame) invalidate();
  });
}
