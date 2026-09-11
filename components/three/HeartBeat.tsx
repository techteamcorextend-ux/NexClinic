"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

/**
 * A beating heart.
 *
 * The GLB carries no animation track, so the beat is driven here. Scale
 * follows a keyframed pulse — up 10%, up 20%, hold, down 10%, back to
 * rest — which gives the two-stage squeeze a real heartbeat has, rather
 * than the single sine swell that reads as "breathing". The mesh also
 * turns slowly on its X axis so the silhouette keeps changing.
 */

const MODEL_URL = "/models/realistic_human_heart.glb";

/** Beats per minute; 72 is a resting adult heart. */
const BPM = 72;
const BEAT_SECONDS = 60 / BPM;

/**
 * [phase 0-1 through the beat, scale offset]. The plateau between 0.20 and
 * 0.30 is what separates the "lub" from the "dub"; the long tail of zeros
 * is diastole, when the heart is simply at rest.
 */
const PULSE: [number, number][] = [
  [0.0, 0.0],
  [0.1, 0.1],
  [0.2, 0.2],
  [0.3, 0.2],
  [0.42, 0.1],
  [0.55, 0.0],
  [1.0, 0.0],
];

/** Smoothstep between keyframes so the squeeze eases instead of snapping. */
function pulseAt(phase: number): number {
  for (let i = 0; i < PULSE.length - 1; i += 1) {
    const [t0, v0] = PULSE[i];
    const [t1, v1] = PULSE[i + 1];
    if (phase >= t0 && phase <= t1) {
      const span = t1 - t0;
      const local = span === 0 ? 0 : (phase - t0) / span;
      const eased = local * local * (3 - 2 * local);
      return v0 + (v1 - v0) * eased;
    }
  }
  return 0;
}

function HeartMesh({ reduced, baseScale }: { reduced: boolean; baseScale: number }) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);

  // useGLTF caches by URL and hands every consumer the same object, so it
  // has to be cloned before this component starts transforming it.
  const model = useMemo(() => scene.clone(true), [scene]);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;

    if (reduced) {
      node.scale.setScalar(baseScale);
      return;
    }

    elapsed.current += delta;
    const phase = (elapsed.current % BEAT_SECONDS) / BEAT_SECONDS;
    node.scale.setScalar(baseScale * (1 + pulseAt(phase)));
  });

  return (
    <group ref={group} scale={baseScale}>
      <primitive object={model} />
    </group>
  );
}

/**
 * Sizes the renderer from the host box directly.
 *
 * R3F measures its container with react-use-measure, and in this spot it
 * kept leaving the canvas at the HTML default 300x150 — the height tracked
 * the box but the width never did. Rather than keep guessing at why its
 * observer misses, this owns the measurement: one ResizeObserver on the
 * host, setSize plus an aspect update on every change.
 */
function Resizer({ host }: { host: RefObject<HTMLDivElement> }) {
  const { gl, camera } = useThree();

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const apply = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      gl.setSize(w, h, true);
      const perspective = camera as THREE.PerspectiveCamera;
      perspective.aspect = w / h;
      perspective.updateProjectionMatrix();
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [gl, camera, host]);

  return null;
}

export type HeartBeatProps = {
  className?: string;
  /** Multiplier on the fitted size; 1 fills the canvas height. */
  scale?: number;
};

export default function HeartBeat({ className, scale = 1 }: HeartBeatProps) {
  const reduced = useReducedMotionSafe();
  const host = useRef<HTMLDivElement>(null);

  // The model measures ~1.08 x 1.60 x 0.88, so this brings it to roughly a
  // unit tall before the caller's own scale is applied.
  const baseScale = 1.15 * scale;

  return (
    <div
      className={className}
      // Decorative, but draggable: give it a name and let it take focus so
      // it is not a mouse-only affordance.
      data-heart-host=""
      role="img"
      aria-label="Interactive 3D heart — drag to rotate"
      tabIndex={0}
    >
      <Canvas
        // Far enough back that the heart never clips its own frustum:
        // rotating about X swings the 0.88 depth into the vertical extent,
        // so the tallest it ever gets is sqrt(1.60^2 + 0.88^2) ~= 1.83 units,
        // and the beat adds another 20% on top of that.
        camera={{ position: [0, 0, 3.9], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent", touchAction: "pan-y" }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 3, 4]} intensity={1.6} />
        <directionalLight position={[-3, -1, -2]} intensity={0.5} color="#ffd9e0" />

        {/* Built locally — drei's HDR presets stream from a CDN. */}
        <Environment resolution={64} frames={1}>
          <Lightformer intensity={1.5} position={[0, 3, 2]} scale={[8, 8, 1]} color="#ffffff" />
          <Lightformer intensity={0.8} position={[-4, 0, 3]} scale={[6, 6, 1]} color="#ffe0e6" />
        </Environment>

        <Resizer host={host} />

        <Suspense fallback={null}>
          <HeartMesh reduced={reduced} baseScale={baseScale} />
        </Suspense>

        {/*
          Drag to turn it any way you like. autoRotate orbits the camera
          around Y, which is the left-to-right turn you see on screen;
          rotating the mesh on its own X axis tumbles it top-over-bottom
          instead, which is what it was doing before.

          enableZoom is off for the same reason it is on the body viewer:
          the wheel belongs to the page, never to a widget embedded in it.
        */}
        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate={!reduced}
          autoRotateSpeed={1.1}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.85}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
