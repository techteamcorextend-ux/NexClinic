"use client";

import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  MOBILE_BREAKPOINT,
  MODEL_ATTRIBUTION,
  NEUTRAL_POSE,
  SEVERITY_COLOR,
} from "./config/regions";
import { DEFAULT_REGION_VITALS, regionSeverity } from "./config/vitals";
import BodyLegend from "./BodyLegend";
import BodyModel from "./BodyModel";
import RegionHotspots from "./RegionHotspots";
import VitalCallout from "./VitalCallout";
import { useCameraRig } from "./hooks/useCameraRig";
import { usePrefersReducedMotion, useMinWidth } from "./hooks/useReducedMotion";
import { useRegionFocus, useResolvedFocus } from "./hooks/useRegionFocus";
import { createBodyUniforms } from "./shaders/bodyMaterial";
import type { BakedRegions, BodySide, RegionId, RegionVitalsMap } from "./types";

/* ─────────────────────── WebGL failure fallback ────────────────────── */

class CanvasBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[BodyViewer] canvas failed, falling back to the legend", error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

/* ──────────────────────────── Scene ────────────────────────────────── */

type SceneProps = {
  uniforms: ReturnType<typeof createBodyUniforms>;
  draggingRef: React.MutableRefObject<boolean>;
  vitals: RegionVitalsMap;
  activeRegion: RegionId | null;
  severityColor: string;
  reduced: boolean;
  active: boolean;
};

function Scene({
  uniforms,
  draggingRef,
  vitals,
  activeRegion,
  severityColor,
  reduced,
  active,
}: SceneProps) {
  const controls = useRef<OrbitControlsImpl | null>(null);
  const [regions, setRegions] = useState<BakedRegions | null>(null);
  useCameraRig({ controls, uniforms, severityColor, reduced, active });

  return (
    <>
      <ambientLight intensity={0.55} />
      {/* Key from the front-upper-left, cool fill from behind-right: the mesh
          is untextured, so the silhouette has to come from lighting + fresnel. */}
      <directionalLight position={[-4, 6, 6]} intensity={1.2} />
      <directionalLight position={[5, 3, -6]} intensity={0.4} color="#a5f3fc" />

      {/*
        The brief asked for <Environment preset="city" />, but drei's presets
        stream an HDR from a CDN at runtime. That is a network dependency on
        a clinical screen — and it is blocked outright in this environment —
        so the environment is built locally from lightformers instead.
      */}
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={1.4} position={[0, 4, -6]} scale={[12, 12, 1]} color="#ccfbf1" />
        <Lightformer intensity={0.8} position={[-6, 2, 4]} scale={[8, 8, 1]} color="#e0f2fe" />
        <Lightformer intensity={0.5} position={[6, -2, 3]} scale={[8, 8, 1]} color="#ffffff" />
      </Environment>

      <Suspense fallback={null}>
        <BodyModel uniforms={uniforms} draggingRef={draggingRef} onBaked={setRegions} />
        {regions ? (
          <RegionHotspots regions={regions} vitals={vitals} activeRegion={activeRegion} />
        ) : null}
      </Suspense>

      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={12} blur={2.4} far={4} />

      <OrbitControls
        ref={controls}
        makeDefault
        target={[...NEUTRAL_POSE.target]}
        // The single most important rule here: the wheel belongs to the page.
        // Camera distance is a consequence of which region is focused, never
        // of the scroll wheel.
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI * 0.39}
        maxPolarAngle={Math.PI * 0.61}
        onStart={() => {
          draggingRef.current = true;
        }}
        onEnd={() => {
          draggingRef.current = false;
        }}
      />
    </>
  );
}

/* ──────────────────────────── Viewer ───────────────────────────────── */

export type BodyViewerProps = {
  vitals?: RegionVitalsMap;
  className?: string;
  /** Optional caption under the canvas. */
  caption?: string;
};

export default function BodyViewer({ vitals, className, caption }: BodyViewerProps) {
  const data = vitals ?? DEFAULT_REGION_VITALS;

  const reduced = usePrefersReducedMotion();
  const wideEnough = useMinWidth(MOBILE_BREAKPOINT);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [crashed, setCrashed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const lostAt = useRef<number | null>(null);
  const [inView, setInView] = useState(true);

  const uniforms = useMemo(() => createBodyUniforms(), []);

  const focus = useResolvedFocus();
  const locked = useRegionFocus((state) => state.locked);
  const unlock = useRegionFocus((state) => state.unlock);
  const setHover = useRegionFocus((state) => state.setHover);
  const clearHover = useRegionFocus((state) => state.clearHover);
  const toggleLock = useRegionFocus((state) => state.toggleLock);

  const activeRegion: RegionId | null = focus.target === "full" ? null : focus.target;
  const entry = activeRegion ? data[activeRegion] : undefined;
  const severityColor = SEVERITY_COLOR[regionSeverity(entry)];

  useEffect(() => setWebgl(hasWebGL()), []);

  // Pause the render loop entirely while the panel is off-screen.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([observed]) => setInView(observed?.isIntersecting ?? true),
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Esc releases a pinned region.
  useEffect(() => {
    if (!locked) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") unlock();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [locked, unlock]);

  // …and so does a click anywhere outside the viewer.
  useEffect(() => {
    if (!locked) return;
    const onPointerDown = (event: PointerEvent) => {
      const node = containerRef.current;
      if (node && !node.contains(event.target as Node)) unlock();
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [locked, unlock]);

  const handleLegendFocus = useCallback(
    (region: RegionId, side: BodySide) => setHover(region, side),
    [setHover],
  );
  const handleLegendSelect = useCallback(
    (region: RegionId, side: BodySide) => toggleLock(region, side),
    [toggleLock],
  );

  const showCanvas = wideEnough && webgl === true && !crashed;

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50 to-white ${className ?? ""}`}
    >
      {/* A real floor for the canvas. Without it the 13-row legend and the
          footer consume the panel's min-height and leave the 3D view a
          ~150px letterbox with the figure cropped out of frame. */}
      <div className="relative flex-1 min-h-[380px]">
        {showCanvas ? (
          <>
            {/*
              absolute inset-0 is load-bearing. R3F sizes its canvas from a
              ResizeObserver on this wrapper, and the wrapper's own height:100%
              can't resolve against a parent whose height comes from
              min-height rather than height — it measures 0 and the canvas
              stays at the HTML default 300x150. Anchoring to the positioned
              parent gives it a definite box to measure.
            */}
            <div className="absolute inset-0">
            <CanvasBoundary onError={() => setCrashed(true)}>
              <Canvas
                // The canvas is decorative. Every number in it also exists as
                // DOM text in the legend and the callout below.
                aria-hidden="true"
                frameloop="demand"
                dpr={[1, 1.75]}
                gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
                camera={{ position: [...NEUTRAL_POSE.position], fov: NEUTRAL_POSE.fov, near: 0.1, far: 100 }}
                onCreated={({ gl }) => {
                  const canvas = gl.domElement;
                  // preventDefault is what makes a lost context restorable at
                  // all; without it the browser never fires contextrestored.
                  canvas.addEventListener("webglcontextlost", (event) => {
                    event.preventDefault();
                    lostAt.current = Date.now();
                  });
                  canvas.addEventListener("webglcontextrestored", () => {
                    lostAt.current = null;
                  });
                }}
                style={{ touchAction: "pan-y" }}
              >
                <Scene
                  uniforms={uniforms}
                  draggingRef={draggingRef}
                  vitals={data}
                  activeRegion={activeRegion}
                  severityColor={severityColor}
                  reduced={reduced}
                  active={inView}
                />
              </Canvas>
            </CanvasBoundary>
            </div>

            <VitalCallout
              region={activeRegion}
              entry={entry}
              locked={Boolean(locked)}
              onClose={unlock}
            />
          </>
        ) : (
          <div className="flex h-full flex-col p-4">
            <div className="mb-3 rounded-xl bg-slate-100/70 p-3 text-center">
              <p className="text-xs font-semibold text-slate-700">
                {wideEnough ? "3D view unavailable" : "3D view hidden on small screens"}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {wideEnough
                  ? "All readings are listed below."
                  : "Shipping a 1 MB model to a phone for a decorative visual isn't worth it — the full readings are below."}
              </p>
            </div>
            <BodyLegend
              vitals={data}
              activeRegion={activeRegion}
              onFocus={handleLegendFocus}
              onBlur={clearHover}
              onSelect={handleLegendSelect}
              standalone
            />
          </div>
        )}
      </div>

      {showCanvas ? (
        <div className="px-4 pb-3">
          <BodyLegend
            vitals={data}
            activeRegion={activeRegion}
            onFocus={handleLegendFocus}
            onBlur={clearHover}
            onSelect={handleLegendSelect}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 px-4 py-2">
        <p className="truncate text-[10px] text-slate-400 dark:text-slate-400">{caption ?? "Hover or click a region"}</p>
        <a
          href={MODEL_ATTRIBUTION.href}
          target="_blank"
          rel="noreferrer noopener"
          className="shrink-0 text-[10px] text-slate-400 dark:text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
        >
          {MODEL_ATTRIBUTION.text}
        </a>
      </div>
    </div>
  );
}
