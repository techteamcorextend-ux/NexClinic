import * as THREE from "three";
import { MATERIAL, SEVERITY_COLOR } from "../config/regions";
import { SIDE_ANY } from "../types";

/**
 * The body's material: ONE `MeshPhysicalMaterial`, patched through
 * `onBeforeCompile`. It has to stay a physical material rather than a raw
 * `ShaderMaterial` — a raw shader would throw away three's lighting, and an
 * untextured mesh lit by nothing reads as a flat silhouette.
 *
 * Three things are injected:
 *   1. a fresnel rim, which is what gives an untextured mesh its edge;
 *   2. a region highlight driven by the baked `aRegionId` / `aSide` attributes;
 *   3. a dim pass that drops every non-focused region's alpha.
 */

export type BodyUniforms = {
  uActiveRegion: THREE.IUniform<number>;
  uActiveSide: THREE.IUniform<number>;
  uHighlight: THREE.IUniform<number>;
  uSeverityColor: THREE.IUniform<THREE.Color>;
  uRimColor: THREE.IUniform<THREE.Color>;
  uDimOpacity: THREE.IUniform<number>;
};

export function createBodyUniforms(): BodyUniforms {
  return {
    uActiveRegion: { value: -1 },
    uActiveSide: { value: SIDE_ANY },
    uHighlight: { value: 0 },
    uSeverityColor: { value: new THREE.Color(SEVERITY_COLOR.normal) },
    uRimColor: { value: new THREE.Color(MATERIAL.rim) },
    uDimOpacity: { value: MATERIAL.dimOpacity },
  };
}

const VERTEX_HEAD = /* glsl */ `
  attribute float aRegionId;
  attribute float aSide;
  varying float vRegionId;
  varying float vBodySide;
`;

const VERTEX_BODY = /* glsl */ `
  vRegionId = aRegionId;
  vBodySide = aSide;
`;

const FRAGMENT_HEAD = /* glsl */ `
  uniform float uActiveRegion;
  uniform float uActiveSide;
  uniform float uHighlight;
  uniform vec3  uSeverityColor;
  uniform vec3  uRimColor;
  uniform float uDimOpacity;
  varying float vRegionId;
  varying float vBodySide;
`;

/**
 * Runs after the fragment colour is resolved.
 *
 * The region id is carried as a plain varying and rounded here rather than
 * declared `flat`: three compiles its shaders as GLSL ES 1.00 even on a
 * WebGL2 context, where `flat` isn't available. Every vertex of a triangle
 * inside one region carries the same value, so interpolation is a no-op —
 * only triangles straddling a boundary interpolate, and rounding snaps
 * those to whichever region owns the majority of the fragment.
 */
const FRAGMENT_BODY = /* glsl */ `
  float regionId = floor(vRegionId + 0.5);
  float bodySide = floor(vBodySide + 0.5);

  float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0), 2.5);

  bool focusing     = uActiveRegion >= 0.0;
  bool regionMatch  = focusing && abs(regionId - uActiveRegion) < 0.5;
  bool sideMatch    = uActiveSide < -1.5 || abs(bodySide - uActiveSide) < 0.5;
  bool isActive     = regionMatch && sideMatch;

  float rimGain = isActive ? mix(1.0, 2.5, uHighlight) : 1.0;
  gl_FragColor.rgb += uRimColor * fresnel * 0.55 * rimGain;

  if (isActive) {
    gl_FragColor.rgb = mix(gl_FragColor.rgb, uSeverityColor, uHighlight * 0.55);
  } else if (focusing) {
    gl_FragColor.a *= mix(1.0, uDimOpacity, uHighlight);
  }
`;

/**
 * three renamed this chunk in r155; accept either so the patch survives a
 * version bump instead of silently no-op'ing.
 */
function fragmentOutputToken(shader: string): string | null {
  if (shader.includes("#include <opaque_fragment>")) return "#include <opaque_fragment>";
  if (shader.includes("#include <output_fragment>")) return "#include <output_fragment>";
  return null;
}

export function createBodyMaterial(uniforms: BodyUniforms): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(MATERIAL.color),
    transmission: MATERIAL.transmission,
    thickness: MATERIAL.thickness,
    opacity: MATERIAL.opacity,
    roughness: MATERIAL.roughness,
    metalness: MATERIAL.metalness,
    envMapIntensity: MATERIAL.envMapIntensity,
    transparent: true,
    side: THREE.DoubleSide,
  });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERTEX_HEAD}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n${VERTEX_BODY}`);

    const token = fragmentOutputToken(shader.fragmentShader);
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>\n${FRAGMENT_HEAD}`,
    );

    if (token) {
      shader.fragmentShader = shader.fragmentShader.replace(
        token,
        `${token}\n${FRAGMENT_BODY}`,
      );
    } else if (typeof console !== "undefined") {
      console.warn(
        "[BodyViewer] Could not find the fragment output chunk; region highlight is inactive.",
      );
    }
  };

  // Changing onBeforeCompile after first compile needs a new program key.
  material.customProgramCacheKey = () => "nexclinic-body-v1";

  return material;
}
