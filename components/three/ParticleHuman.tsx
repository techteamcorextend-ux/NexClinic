/**
 * ParticleHuman.tsx
 * ============================================================================
 * A human silhouette rendered as a heartbeat-driven point cloud, in one file.
 *
 * Self-contained by design — no local imports, no asset to copy, no GSAP.
 * Drop it into an existing hero as a background layer and it works:
 *
 *     <section className="my-hero">
 *       <ParticleHuman />
 *       <div className="my-hero__copy"> … your existing markup … </div>
 *     </section>
 *
 * The wrapper is `position: absolute; inset: 0` with pointer events off, so it
 * fills whatever positioned ancestor you put it in and never eats clicks.
 *
 * Dependencies: react, three, @react-three/fiber.  (Not drei, not gsap.)
 *
 *     npm install three @react-three/fiber
 *     npm install -D @types/three
 *
 * ── How it works ────────────────────────────────────────────────────────────
 *
 * The silhouette is a 5.6 KB PNG embedded below as a data URI. At mount it is
 * read through a 2D canvas and given real depth: for every scanline, each
 * contiguous run of body pixels becomes an ellipse in the XZ plane. A row
 * through the chest yields one wide span; a row through the arms yields three,
 * so the limbs come out as separate round tubes rather than one flat slab.
 * Depth scales with span width and flattens for wide spans — which is how a
 * human cross-section actually behaves.
 *
 * A second, sparser system sheds particles off the silhouette outline: each is
 * walked outward along a drift vector, faded out and reborn. `life` is
 * `fract()` of a per-particle clock, so there is no CPU particle pool, no
 * respawn bookkeeping, and no per-frame allocation — it is one draw call whose
 * entire state is a single float.
 *
 * The beat is a pure function of elapsed time (no timeline library). It drives
 * a global flare plus a wavefront that launches from the anatomical heart at
 * the R peak and travels outward carrying the accent colour, so the body reads
 * as pulsing rather than strobing.
 *
 * ── Common tweaks ───────────────────────────────────────────────────────────
 *
 *   <ParticleHuman motionScale={1} />        // full speed (default is 0.5)
 *   <ParticleHuman bpm={72} />               // faster beat
 *   <ParticleHuman looseRatio={0} />         // no shedding layer
 *   <ParticleHuman colorHigh="#9BE8A0" />    // repalette
 *   <ParticleHuman src="/models/mine.png" /> // your own silhouette
 *
 * To drive the scroll dissolve from your own ScrollTrigger, keep `morph` in a
 * ref and pass it — the component reads it every frame without re-rendering:
 *
 *     const morph = useRef(0);
 *     useLayoutEffect(() => {
 *       const st = ScrollTrigger.create({
 *         trigger: heroRef.current, start: 'top top', end: '+=120%',
 *         pin: true, scrub: 0.6,
 *         onUpdate: (self) => { morph.current = self.progress; },
 *       });
 *       return () => st.kill();
 *     }, []);
 *     <ParticleHuman morphRef={morph} />
 * ============================================================================
 */

import {
  useEffect, useMemo, useRef, useState,
  type CSSProperties, type MutableRefObject,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ══════════════════════════════════════════════════════════ the silhouette ══
   478×880 black-on-transparent PNG. Swap it by passing `src` instead — any
   front-facing silhouette on transparency works, no code change. */
const SILHOUETTE_PNG =
  'data:image/png;base64,'
  + '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'
  + 'rkJggg==';

/* ══════════════════════════════════════════════════════════════════ types ══ */

export interface ParticleHumanProps {
  /** Silhouette image URL. Defaults to the one embedded in this file. */
  src?: string;
  /** Body particles. Falls back to a responsive budget when omitted. */
  count?: number;
  /** Beats per minute of the underlying rhythm, before `motionScale`. */
  bpm?: number;
  /** 1 = real time, 0.5 = half speed. Scales beat, drift, shed rate and sway. */
  motionScale?: number;
  /** Scroll dissolve, 0…1. Read every frame — no re-render when it changes. */
  morphRef?: MutableRefObject<number>;
  /** Static dissolve, if you aren't animating it. Ignored when `morphRef` is set. */
  morph?: number;
  /** Drive the beat externally (e.g. to sync an ECG). Overrides the internal clock. */
  clockRef?: MutableRefObject<{ trace: number; pulse: number }>;

  colorLow?: string;    // feet
  colorHigh?: string;   // head
  colorPulse?: string;  // accent carried by the beat wavefront
  pointSize?: number;
  /** Resting opacity of the main body cloud. Lower = dimmer, less overlap glare. */
  opacity?: number;
  /** Anatomical heart in body space; the body spans y −1…1. */
  heart?: [number, number, number];

  /** Shedding particles as a fraction of `count`. 0 disables the layer. */
  looseRatio?: number;
  /** Birth→fade loops per second, before `motionScale`. */
  looseSpeed?: number;
  /** Resting opacity of the shedding layer — it is meant to stay faint. */
  looseOpacity?: number;

  /** Distance the camera sits back. Larger = smaller body. */
  cameraDistance?: number;
  /** Vertical framing offset, in world units. */
  offsetY?: number;
  className?: string;
  style?: CSSProperties;
  onReady?: () => void;
}

interface Cloud {
  positions: Float32Array;
  scatter: Float32Array;
  seeds: Float32Array;
  count: number;
  loose: { positions: Float32Array; drift: Float32Array; seeds: Float32Array; count: number };
}

/* ═══════════════════════════════════════════════════ image → point cloud ══ */

/** Mulberry32 — deterministic, so the cloud is byte-identical on every load. */
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function buildCloud(
  src: string,
  count: number,
  looseRatio: number,
  { threshold = 128, roundRatio = 0.95, flatRatio = 0.55, shell = 0.42, height = 2, seed = 7 } = {},
): Promise<Cloud> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = () => rej(new Error(`ParticleHuman: could not load ${src}`));
    i.src = src;
  });

  const w = img.naturalWidth, h = img.naturalHeight;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('ParticleHuman: no 2D context');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;

  // One tight pass into a flat mask. Testing per lookup instead costs ~3x on a
  // phone, and this runs on the main thread while the hero is painting.
  const mask = new Uint8Array(w * h);
  for (let i = 0, p = 0; p < mask.length; p++, i += 4) {
    const a = data[i + 3];
    mask[p] = a > 8 && (a >= threshold || data[i] < threshold) ? 1 : 0;
  }

  // Every horizontal run of body pixels: [rowY, centreX, halfWidth]
  const rows: number[] = [];
  for (let y = 0; y < h; y++) {
    const off = y * w;
    let x = 0;
    while (x < w) {
      while (x < w && mask[off + x] === 0) x++;
      if (x >= w) break;
      const s0 = x;
      while (x < w && mask[off + x] === 1) x++;
      const e0 = x - 1;
      if (e0 - s0 + 1 >= 2) rows.push(y, (s0 + e0) * 0.5, (e0 - s0 + 1) * 0.5);
    }
  }
  if (!rows.length) throw new Error('ParticleHuman: silhouette had no opaque pixels');

  const spans = rows.length / 3;
  const widths = new Float64Array(spans);
  for (let i = 0; i < spans; i++) widths[i] = rows[i * 3 + 2];
  const sorted = Float64Array.from(widths).sort();
  const maxA = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.995))];

  // Depth semi-axis per span: limbs round, torso flatter.
  const depth = new Float64Array(spans);
  const cdf = new Float64Array(spans);
  let total = 0;
  const lo = 0.1 * maxA, hi = 0.8 * maxA;
  for (let i = 0; i < spans; i++) {
    const a = widths[i];
    let t = Math.min(1, Math.max(0, (a - lo) / Math.max(hi - lo, 1e-9)));
    t = t * t * (3 - 2 * t);
    depth[i] = a * (roundRatio + (flatRatio - roundRatio) * t);
    total += a + depth[i];
    cdf[i] = total;
  }
  const pick = (arr: Float64Array, tot: number, r: number) => {
    const target = r * tot;
    let l = 0, hh = spans - 1;
    while (l < hh) { const m = (l + hh) >> 1; if (arr[m] < target) l = m + 1; else hh = m; }
    return l;
  };

  const rng = makeRng(seed);
  const positions = new Float32Array(count * 3);
  for (let p = 0; p < count; p++) {
    const l = pick(cdf, total, rng());
    const s3 = l * 3, th = rng() * Math.PI * 2;
    const rad = 1 - shell * Math.pow(rng(), 1.7);   // shell-biased
    const i3 = p * 3;
    positions[i3]     = rows[s3 + 1] + widths[l] * rad * Math.cos(th);
    positions[i3 + 1] = -(rows[s3] + (rng() - 0.5));   // image Y is down
    positions[i3 + 2] = depth[l] * rad * Math.sin(th);
  }

  // Shedding emitters on the left/right outline — the edge you actually read
  // at this camera angle. sqrt weighting so the head and limbs shed too,
  // instead of everything pouring off the torso.
  const looseCount = Math.max(0, Math.round(count * looseRatio));
  const lPos = new Float32Array(looseCount * 3);
  const lDrift = new Float32Array(looseCount * 3);
  const lSeeds = new Float32Array(looseCount);
  if (looseCount) {
    const lcdf = new Float64Array(spans);
    let ltot = 0;
    for (let i = 0; i < spans; i++) { ltot += Math.sqrt(widths[i]); lcdf[i] = ltot; }
    for (let p = 0; p < looseCount; p++) {
      const l = pick(lcdf, ltot, rng());
      const s3 = l * 3, i3 = p * 3;
      const side = rng() < 0.5 ? -1 : 1;
      const th = (rng() - 0.5) * 0.9;                // spread, so it isn't a hard line
      lPos[i3]     = rows[s3 + 1] + side * widths[l] * Math.cos(th);
      lPos[i3 + 1] = -(rows[s3] + (rng() - 0.5));
      lPos[i3 + 2] = depth[l] * Math.sin(th);
      // outward and rising — material coming off a body reads as evaporating
      const dist = 0.1 + rng() * 0.3;
      lDrift[i3]     = side * (0.6 + rng() * 0.7) * dist;
      lDrift[i3 + 1] = (0.25 + rng() * 0.9) * dist;
      lDrift[i3 + 2] = (rng() - 0.5) * 0.8 * dist;
      lSeeds[p] = rng();
    }
  }

  // Centre and normalise to `height`; the shed layer shares the transform.
  let mnX = Infinity, mnY = Infinity, mnZ = Infinity;
  let mxX = -Infinity, mxY = -Infinity, mxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    mnX = Math.min(mnX, positions[i]); mxX = Math.max(mxX, positions[i]);
    mnY = Math.min(mnY, positions[i + 1]); mxY = Math.max(mxY, positions[i + 1]);
    mnZ = Math.min(mnZ, positions[i + 2]); mxZ = Math.max(mxZ, positions[i + 2]);
  }
  const cx = (mnX + mxX) / 2, cy = (mnY + mxY) / 2, cz = (mnZ + mxZ) / 2;
  const s = height / Math.max(mxY - mnY, 1e-6);
  const xf = (arr: Float32Array) => {
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = (arr[i] - cx) * s;
      arr[i + 1] = (arr[i + 1] - cy) * s;
      arr[i + 2] = (arr[i + 2] - cz) * s;
    }
  };
  xf(positions); xf(lPos);

  const scatter = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3, ox = positions[i3], oz = positions[i3 + 2];
    const len = Math.hypot(ox, oz) || 1e-4;
    const spread = 0.6 + rng() * 1.9;
    scatter[i3]     = (ox / len) * spread + (rng() - 0.5) * 1.1;
    scatter[i3 + 1] = (rng() - 0.35) * 1.6;
    scatter[i3 + 2] = (oz / len) * spread + (rng() - 0.5) * 1.1;
    seeds[i] = rng();
  }

  return {
    positions, scatter, seeds, count,
    loose: { positions: lPos, drift: lDrift, seeds: lSeeds, count: looseCount },
  };
}

/* ═════════════════════════════════════════════════════════════ the beat ══
   A pure function of elapsed time — no timeline library. `R_PEAK_AT` is where
   the R spike of an ECG would sit in the cycle; the flare fires there, so if
   you later sync a real trace to this the two already agree.
   Durations are in unscaled cycle-seconds; `motionScale` is applied to the
   clock feeding them, which is exactly what GSAP's timeScale would do. */

export const R_PEAK_AT = 0.295;

const ATTACK = 0.14;
const DECAY = 0.68;
const easeOut2 = (x: number) => 1 - (1 - x) * (1 - x);

/** Cardiac state at cycle-time `ct` seconds. Allocation-free: writes into `out`. */
function beatAt(ct: number, period: number, out: { trace: number; pulse: number }) {
  const ph = ct % period;
  out.trace = ph / period;

  const pk = period * R_PEAK_AT;
  let pulse = 0;
  const since = ph - pk;
  if (since >= 0 && since < ATTACK) {
    pulse = easeOut2(since / ATTACK);
  } else if (since >= ATTACK && since < ATTACK + DECAY) {
    pulse = 1 - easeOut2((since - ATTACK) / DECAY);
  }

  // Small echo under where the T wave would be — ventricular repolarisation.
  // Subtle, but it's why the loop feels organic instead of metronomic.
  const t0 = period * 0.455, t1 = period * 0.56;
  if (ph >= t0 && ph < t1) {
    const u = (ph - t0) / (t1 - t0);
    pulse = Math.max(pulse, 0.16 * Math.sin(u * Math.PI));
  }
  out.pulse = pulse;
}

/* ═══════════════════════════════════════════════════════════════ shaders ══ */

const BODY_VERT = /* glsl */ `
uniform float uTime, uPulse, uTrace, uRPeak, uMorph, uSize, uPixelRatio;
uniform vec3  uHeart;
attribute vec3  aScatter;
attribute float aSeed;
varying float vGrad, vBand, vFade;

void main() {
  vec3 p = position;

  // idle drift — each particle on its own slow lissajous, so the body breathes
  // between beats. Three sines: orders of magnitude cheaper than curl noise
  // and, at 0.012 world units of travel, indistinguishable from it.
  float s = aSeed * 6.2831853;
  p += vec3(
    sin(uTime * 0.55 + s       + p.y * 1.7),
    sin(uTime * 0.47 + s * 1.7 + p.x * 1.9),
    sin(uTime * 0.61 + s * 2.3 + p.z * 2.3)
  ) * 0.012;

  // pulse wavefront: launched from the heart at the R peak, expanding
  // monotonically across the rest of the cycle so it can never retract
  float wave   = clamp((uTrace - uRPeak) / 0.42, 0.0, 1.0);
  float d      = distance(position, uHeart);
  float band   = exp(-pow((d - wave * 2.6) * 2.9, 2.0)) * (1.0 - wave) * step(0.0001, wave);
  vBand = band;

  // flare outward from the body's vertical axis on the beat
  vec3 outward = normalize(vec3(position.x, position.y * 0.18, position.z) + 0.0001);
  p += outward * (uPulse * 0.045 + band * 0.075) * (0.7 + aSeed * 0.6);

  // scroll dissolve, smoothstepped so it starts gently then commits
  float m = uMorph * uMorph * (3.0 - 2.0 * uMorph);
  p += aScatter * m * 1.35;
  p.y += m * 0.35;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  vGrad = clamp(position.y * 0.5 + 0.5, 0.0, 1.0);
  vFade = (1.0 - m * 0.85) * (0.55 + aSeed * 0.45);

  gl_PointSize = uSize * (0.75 + aSeed * 0.5)
    * (1.0 + uPulse * 0.35 + band * 1.25)
    * (1.0 - m * 0.35)
    * uPixelRatio * (10.0 / max(-mv.z, 0.1));
}
`;

const BODY_FRAG = /* glsl */ `
precision mediump float;
uniform vec3  uColorLow, uColorHigh, uColorPulse;
uniform float uOpacity;
varying float vGrad, vBand, vFade;

void main() {
  vec2  c  = gl_PointCoord - 0.5;
  float d2 = dot(c, c);
  if (d2 > 0.25) discard;
  float alpha = smoothstep(0.25, 0.015, d2);

  vec3 col = mix(uColorLow, uColorHigh, smoothstep(0.04, 0.96, vGrad));
  col = mix(col, uColorPulse, clamp(vBand * 1.15, 0.0, 1.0));
  // hot core only where the wave is, so additive blending doesn't clip the
  // whole body to white
  col += vBand * 0.35 * smoothstep(0.25, 0.0, d2);

  gl_FragColor = vec4(col, alpha * vFade * uOpacity);
}
`;

const LOOSE_VERT = /* glsl */ `
uniform float uTime, uPulse, uMorph, uSize, uPixelRatio, uSpeed;
attribute vec3  aDrift;
attribute float aSeed;
varying float vGrad, vFade, vPulseMix;

void main() {
  // per-particle phase, so the layer never pulses as one mass
  float life = fract(uTime * uSpeed * (0.55 + aSeed * 0.85) + aSeed * 7.13);

  vec3 p = position + aDrift * life * (1.0 + uPulse * 0.55);

  // wander widens as the particle ages — it loosens up as it leaves the body
  // instead of running along a straight ray
  float s = aSeed * 6.2831853;
  p += vec3(
    sin(uTime * 0.60 + s)       * 0.030,
    cos(uTime * 0.45 + s * 1.7) * 0.045 + life * 0.10,
    sin(uTime * 0.50 + s * 2.1) * 0.030
  ) * (0.35 + life);

  float m = uMorph * uMorph * (3.0 - 2.0 * uMorph);
  p += aDrift * m * 6.0;
  p.y += m * 0.5;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  vGrad = clamp(position.y * 0.5 + 0.5, 0.0, 1.0);
  vFade = smoothstep(0.0, 0.10, life) * pow(1.0 - life, 1.7) * (1.0 - m * 0.6);
  // resolved here rather than in the fragment stage, so uPulse is never a
  // uniform shared across stages with mismatched default precision
  vPulseMix = clamp(uPulse * 0.55 * (1.0 - life), 0.0, 1.0);

  gl_PointSize = uSize * (0.55 + aSeed * 0.6)
    * (1.0 - life * 0.45)
    * (1.0 + uPulse * 0.5)
    * uPixelRatio * (10.0 / max(-mv.z, 0.1));
}
`;

const LOOSE_FRAG = /* glsl */ `
precision mediump float;
uniform vec3  uColorLow, uColorHigh, uColorPulse;
uniform float uOpacity;
varying float vGrad, vFade, vPulseMix;

void main() {
  vec2  c  = gl_PointCoord - 0.5;
  float d2 = dot(c, c);
  if (d2 > 0.25) discard;
  float alpha = smoothstep(0.25, 0.015, d2);

  vec3 col = mix(uColorLow, uColorHigh, smoothstep(0.04, 0.96, vGrad));
  // shed material takes the accent only lightly — it should read as residue,
  // not as a second light source
  col = mix(col, uColorPulse, vPulseMix);

  gl_FragColor = vec4(col, alpha * vFade * uOpacity);
}
`;

/* ══════════════════════════════════════════════════════════════ the scene ══ */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fill rate, not vertex count, is what costs on mobile GPUs. */
function defaultBudget() {
  if (typeof window === 'undefined') return 9000;
  const w = window.innerWidth;
  if (w < 640) return 4200;
  if (w < 1100) return 6500;
  return 9000;
}

/**
 * The points themselves. Use this directly if you already have a <Canvas>;
 * otherwise use <ParticleHuman>, which sets one up for you.
 */
export function ParticleHumanPoints({
  src = SILHOUETTE_PNG,
  count,
  bpm = 60,
  motionScale = 0.5,
  morphRef,
  morph = 0,
  clockRef,
  colorLow = '#7C8CF8',
  colorHigh = '#4FD1E0',
  colorPulse = '#FF5D6C',
  pointSize = 1.55,
  opacity = 1,
  heart = [-0.055, 0.28, 0.05],
  looseRatio = 0.17,
  looseSpeed = 0.14,
  looseOpacity = 0.42,
  offsetY = 0,
  onReady,
}: ParticleHumanProps) {
  const [cloud, setCloud] = useState<Cloud | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.ShaderMaterial>(null);
  const looseMat = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const reduced = useMemo(prefersReducedMotion, []);

  // resolved once — resizing must not re-sample the cloud
  const [budget] = useState(() => count ?? defaultBudget());

  // held in a ref so an inline callback can't retrigger the sampling effect
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    let alive = true;
    buildCloud(src, budget, looseRatio)
      .then((c) => { if (alive) { setCloud(c); onReadyRef.current?.(); } })
      .catch((e) => console.error(e));
    return () => { alive = false; };
  }, [src, budget, looseRatio]);

  const bodyGeo = useMemo(() => {
    if (!cloud) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(cloud.positions, 3));
    g.setAttribute('aScatter', new THREE.BufferAttribute(cloud.scatter, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(cloud.seeds, 1));
    // hand-set: the shader displaces past the base bounds, and recomputing
    // this per frame would be pointless work
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    return g;
  }, [cloud]);

  const looseGeo = useMemo(() => {
    if (!cloud || !cloud.loose.count) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(cloud.loose.positions, 3));
    g.setAttribute('aDrift', new THREE.BufferAttribute(cloud.loose.drift, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(cloud.loose.seeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6);
    return g;
  }, [cloud]);

  useEffect(() => () => { bodyGeo?.dispose(); }, [bodyGeo]);
  useEffect(() => () => { looseGeo?.dispose(); }, [looseGeo]);

  const bodyUniforms = useMemo(() => ({
    uTime: { value: 0 }, uPulse: { value: 0 }, uTrace: { value: 0 },
    uRPeak: { value: R_PEAK_AT }, uMorph: { value: 0 },
    uSize: { value: pointSize }, uPixelRatio: { value: 1 }, uOpacity: { value: opacity },
    uHeart: { value: new THREE.Vector3(...heart) },
    uColorLow: { value: new THREE.Color(colorLow) },
    uColorHigh: { value: new THREE.Color(colorHigh) },
    uColorPulse: { value: new THREE.Color(colorPulse) },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const looseUniforms = useMemo(() => ({
    uTime: { value: 0 }, uPulse: { value: 0 }, uMorph: { value: 0 },
    uSize: { value: pointSize * 0.85 }, uPixelRatio: { value: 1 },
    uSpeed: { value: looseSpeed * motionScale }, uOpacity: { value: looseOpacity },
    uColorLow: { value: new THREE.Color(colorLow) },
    uColorHigh: { value: new THREE.Color(colorHigh) },
    uColorPulse: { value: new THREE.Color(colorPulse) },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  useEffect(() => {
    const px = Math.min(dpr, 2);
    bodyUniforms.uPixelRatio.value = px;
    looseUniforms.uPixelRatio.value = px;
  }, [dpr, bodyUniforms, looseUniforms]);

  useEffect(() => {
    bodyUniforms.uColorLow.value.set(colorLow);
    bodyUniforms.uColorHigh.value.set(colorHigh);
    bodyUniforms.uColorPulse.value.set(colorPulse);
    bodyUniforms.uSize.value = pointSize;
    bodyUniforms.uOpacity.value = opacity;
    bodyUniforms.uHeart.value.set(...heart);

    looseUniforms.uColorLow.value.set(colorLow);
    looseUniforms.uColorHigh.value.set(colorHigh);
    looseUniforms.uColorPulse.value.set(colorPulse);
    looseUniforms.uSize.value = pointSize * 0.85;
    looseUniforms.uSpeed.value = looseSpeed * motionScale;
    looseUniforms.uOpacity.value = looseOpacity;
  }, [colorLow, colorHigh, colorPulse, pointSize, opacity, heart, looseSpeed, looseOpacity,
      motionScale, bodyUniforms, looseUniforms]);

  // module-scope-free scratch: written every frame, never reallocated
  const beat = useRef({ trace: 0, pulse: 0 });
  const period = 60 / bpm;

  useFrame((state) => {
    const bu = bodyMat.current?.uniforms;
    if (!bu) return;

    const m = morphRef ? morphRef.current : morph;
    const ct = state.clock.elapsedTime * motionScale;

    let trace = 0, pulse = 0;
    if (!reduced) {
      if (clockRef) {
        // read only — never write into a clock object the caller owns
        trace = clockRef.current.trace;
        pulse = clockRef.current.pulse;
      } else {
        beatAt(ct, period, beat.current);
        trace = beat.current.trace;
        pulse = beat.current.pulse;
      }
    }

    bu.uTime.value = reduced ? 0 : ct;
    bu.uPulse.value = pulse;
    bu.uTrace.value = trace;
    bu.uMorph.value = m;

    const lu = looseMat.current?.uniforms;
    if (lu) {
      // frozen mid-life under reduced motion, so the layer still reads as a
      // soft edge rather than vanishing entirely
      lu.uTime.value = reduced ? 0.4 : ct;
      lu.uPulse.value = pulse;
      lu.uMorph.value = m;
    }

    const g = groupRef.current;
    if (!g) return;
    g.position.y = offsetY - m * 0.55;
    g.position.z = m * 1.15;
    // held to ±5°: the cloud has real depth, but it is built from a front
    // silhouette, so it must never be shown in true profile
    g.rotation.y = reduced ? 0 : Math.sin(ct * 0.18) * 0.085 + m * 0.16;
  });

  if (!bodyGeo) return null;

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
        <primitive object={bodyGeo} attach="geometry" />
        <shaderMaterial
          ref={bodyMat}
          uniforms={bodyUniforms}
          vertexShader={BODY_VERT}
          fragmentShader={BODY_FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {looseGeo && (
        <points frustumCulled={false}>
          <primitive object={looseGeo} attach="geometry" />
          <shaderMaterial
            ref={looseMat}
            uniforms={looseUniforms}
            vertexShader={LOOSE_VERT}
            fragmentShader={LOOSE_FRAG}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════ the wrapper ══ */

/**
 * Drop-in layer: absolutely positioned, transparent, click-through.
 * Put it inside any `position: relative` container.
 */
export default function ParticleHuman({
  className,
  style,
  cameraDistance = 4.6,
  ...rest
}: ParticleHumanProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // stop rendering entirely when the layer scrolls out of view — the single
  // biggest battery win available here
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}
    >
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.1, cameraDistance], fov: 42 }}
        style={{ display: 'block' }}
      >
        <ParticleHumanPoints {...rest} />
      </Canvas>
    </div>
  );
}
