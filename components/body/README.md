# 3D Body Viewer

An interactive vitals viewer: one translucent human model whose regions light
up as you scroll, hover, or tab through the legend.

Live on two screens:

| Screen | Route | Driver |
|---|---|---|
| Surgeon consultation | `/surgeon/consultation/[id]` | scroll + hover + click + legend |
| Patient dashboard | `/patient/dashboard` | hover + click + legend |

## Running it

```bash
npm install
npm run dev     # http://localhost:3000/surgeon/consultation/p-1001
npm run build   # production build
npm run typecheck
```

Open the console on first load: the viewer logs a table of per-region vertex
counts against the reference model.

## What each file does

```
components/body/                 ← framework-portable; no next/*, no import.meta
  BodyViewer.tsx                 Canvas, lights, OrbitControls, fallbacks, layout
  BodyModel.tsx                  loads the GLB, owns the material, raycast hover
  RegionHotspots.tsx             drei <Html> pins at region centroids
  BodyLegend.tsx                 keyboard-navigable region list (a11y + fallback)
  VitalCallout.tsx               the floating vitals card
  hooks/
    useRegionBaking.ts           world-space classification -> aRegionId / aSide
    useRegionFocus.ts            the state machine + a ~40-line store
    useScrollRegion.ts           IntersectionObserver -> active region
    useCameraRig.ts              per-frame camera + highlight tweening
    useReducedMotion.ts          prefers-reduced-motion / min-width
  config/
    regions.ts                   thresholds, camera poses, palette, timings
    vitals.ts                    region<->vital mapping, severity bands
  shaders/bodyMaterial.ts        onBeforeCompile: fresnel + highlight + dim
  types.ts

components/portal/BodyVitalsPanel.tsx   app-side adapter: ssr:false + clinic store
public/models/human_body.glb            the model
public/models/LICENSE.txt               CC BY 4.0 attribution
```

`components/body/` imports nothing from Next.js or the clinic store on
purpose — everything app-specific lives in `BodyVitalsPanel`, which is also
where the `next/dynamic({ ssr: false })` boundary sits. Drop the folder into
another React app as-is.

## What to tune first

Everything worth touching is in `config/regions.ts`:

- **`REGION_POSES`** — camera position/target/fov per region. The first thing
  you'll want to adjust if a region frames badly.
- **`MATERIAL`** — `color`, `rim`, `transmission`, `dimOpacity`. Drop
  `transmission` to 0 if the translucency costs too much on low-end GPUs;
  the look survives on fresnel alone.
- **`TWEEN_MS` / `HIGHLIGHT_MS` / `IDLE_MS`** — pacing.
- **`NECK_HALF_WIDTH`, `BANDS`, `ARM_CUTS`** — the segmentation itself.
- `config/vitals.ts` **`BANDS`** — the severity thresholds. These are demo
  values, not clinical guidance.

## Deviations from the brief

**1. Built into the Next.js app, not a standalone Vite prototype.**
Requested. `components/body/` still meets the portability contract the brief
set for it, so the port step the brief anticipated is already done.

**2. No zustand.** The brief pinned `zustand@4.5.5`. This environment's npm
registry returns 403 for every package, so shipping a new dependency would
have made the project uninstallable locally. `useRegionFocus.ts` carries a
~40-line store on React's own `useSyncExternalStore` with the same call
signature (`useStore(selector)`, `.getState()`, `.setState()`). Swapping
zustand back in is a two-line change if you'd rather have it.

**3. No `<Environment preset="city" />`.** drei's presets stream an HDR from a
CDN at runtime — a network dependency on a clinical screen, and blocked here
outright. The environment is built locally from three `<Lightformer>`s
instead. Same job, nothing fetched.

**4. Two corrections to the §3 segmentation table.** The brief said a count
mismatch means the world transform is wrong. It wasn't — the transform
reproduces the stated bounds exactly (height 4.4694, arm span 3.6264, depth
0.9031) and 10 of 13 regions matched to the vertex. The other three were the
rules:

- **Neck `|x| < 0.35` → `0.165`.** At 0.35 the cut swallowed ~333 shoulder
  vertices: neck came out at 683 against an expected 350, shoulder 24% short.
- **Chest/abdomen `|x| < 0.45` gate removed.** Because arms are classified
  first, the gate is redundant — and harmful: it orphaned the 223 vertices
  between the top of the arm band (t=0.761) and the top of the chest band
  (t=0.772), the armpit shelf, leaving them in no region at all. That was
  exactly the chest deficit.

With those two changes all 13 regions land within 5% and nothing is
unassigned:

```
head 2394/2394   neck 346/350    shoulder 1317/1300  chest 1430/1430
abdomen 935/935  pelvis 784/784  upper_arm 1152/1152 forearm 1315/1315
hand 4422/4422   thigh 812/806   knee 514/520        lower_leg 1136/1136
foot 1500/1500                                       unassigned: 0
```

**5. Added `hooks/useReducedMotion.ts`,** which isn't in the brief's file
list. The app's existing hook lives in `components/admin/`, and importing it
would have broken this folder's portability.

**6. Per-side centroids.** Pooling both arms averages to x ≈ 0, which parks
the "Blood pressure" pin in the middle of the chest. Lateral regions store a
one-sided centroid and the camera mirrors its pose when you point at the
patient's right.

## Verification status

Verified in a real browser (Chrome, dev server):

- The figure loads, is upright, and frames correctly at the neutral pose.
- Console logs `region segmentation — height 4.469, all within 5%` on load,
  confirming the offline segmentation math against the live model.
- Hover works end to end: raycast -> region id -> camera tween -> shader
  highlight -> callout -> legend sync. Hovering a thigh highlights only that
  thigh and dims the rest.
- The canvas sizes to its container (675x380 at a 1440px viewport) and the
  under-768px fallback renders the standalone legend with every reading as
  DOM text.

Also verified statically: `tsc --noEmit` strict clean, `next lint` clean,
no module-scope `window`/`document`, `THREE.ShaderChunk.opaque_fragment`
present in three@0.169, all drei exports resolve.

**Still unverified:** a full `next build` (the dev machine can't finish one
inside the agent's command timeout), scroll choreography on the consultation
screen, and the wheel-never-zooms rule.

### Three bugs worth remembering

1. **`aria-hidden` on a drei `<Html>`.** R3F's `applyProps` treats dashes in
   an unknown prop as a nested property path, so it resolved
   `instance.aria.hidden` and threw at scene construction. DOM attributes go
   on the rendered child, never on a three object.

2. **`occlude="blending"` rewrites the canvas's own inline styles** —
   `position: absolute`, `pointer-events: none`, and a z-index derived from
   `zIndexRange`. That stopped the canvas sizing to its container and
   silently killed every pointer event on the mesh. Removed.

3. **A percentage height can't resolve against `min-height`.** R3F measures
   its container with a ResizeObserver; the wrapper's `height: 100%` saw a
   parent whose height came from `min-h-[380px]` rather than `height`,
   measured 0, and the canvas stayed at the HTML default 300x150. The canvas
   wrapper is now `absolute inset-0` inside the positioned parent.

## Licence

Model: "HUMAN_BODY" by vistaalienprime, CC BY 4.0. Attribution is rendered in
the viewer's footer, as the licence requires. See `public/models/LICENSE.txt`.
