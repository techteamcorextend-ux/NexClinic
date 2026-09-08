"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const STRAND_POINTS = 140;
const RADIUS = 1.4;
const HEIGHT = 6;
const TURNS = 4;

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function useHelixPositions() {
  return useMemo(() => {
    const strandA: THREE.Vector3[] = [];
    const strandB: THREE.Vector3[] = [];
    const rungs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < STRAND_POINTS; i++) {
      const t = i / (STRAND_POINTS - 1);
      const angle = t * Math.PI * 2 * TURNS;
      const y = (t - 0.5) * HEIGHT;
      const a = new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS);
      const b = new THREE.Vector3(Math.cos(angle + Math.PI) * RADIUS, y, Math.sin(angle + Math.PI) * RADIUS);
      strandA.push(a);
      strandB.push(b);
      if (i % 6 === 0) rungs.push([a, b]);
    }
    return { strandA, strandB, rungs };
  }, []);
}

function ParticleStrand({ points, color }: { points: THREE.Vector3[]; color: string }) {
  const ref = useRef<THREE.Points>(null!);
  const progress = useRef(0);
  const { origin, target } = useMemo(() => {
    const origin = new Float32Array(points.length * 3);
    const target = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      origin[i * 3] = (Math.random() - 0.5) * 10;
      origin[i * 3 + 1] = (Math.random() - 0.5) * 10;
      origin[i * 3 + 2] = (Math.random() - 0.5) * 10;
      target[i * 3] = p.x;
      target[i * 3 + 1] = p.y;
      target[i * 3 + 2] = p.z;
    });
    return { origin, target };
  }, [points]);
  useFrame((_, delta) => {
    progress.current = Math.min(1, progress.current + delta * 0.4);
    const eased = easeOutCubic(progress.current);
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < points.length * 3; i++) {
      pos.array[i] = THREE.MathUtils.lerp(origin[i], target[i], eased);
    }
    pos.needsUpdate = true;
    ref.current.rotation.y += delta * 0.15;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length} array={origin.slice()} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.055} color={color} transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

function Rungs({ rungs }: { rungs: [THREE.Vector3, THREE.Vector3][] }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.15;
  });
  return (
    <group ref={groupRef}>
      {rungs.map(([a, b], i) => (
        <line key={i}>
          <bufferGeometry attach="geometry" onUpdate={(g) => g.setFromPoints([a, b])} />
          <lineBasicMaterial attach="material" color="#A78BFA" transparent opacity={0.25} />
        </line>
      ))}
    </group>
  );
}

function HelixScene() {
  const { strandA, strandB, rungs } = useHelixPositions();
  return (
    <>
      <ParticleStrand points={strandA} color="#7C6FF0" />
      <ParticleStrand points={strandB} color="#A78BFA" />
      <Rungs rungs={rungs} />
    </>
  );
}

export default function DnaHelix() {
  return (
    <div className="h-[420px] w-full md:h-[520px]" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <HelixScene />
      </Canvas>
    </div>
  );
}
