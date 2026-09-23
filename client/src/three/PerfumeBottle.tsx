import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import type { BottleSpec } from '../types';
import { SHAPES, latheGeometry, liquidLatheGeometry, profileRadiusAt } from './shapes';
import { labelTexture } from './labelTexture';

export type Quality = 'high' | 'low';

interface Props {
  spec: BottleSpec;
  name: string;
  quality?: Quality;
}

const GOLD = '#C9B27C';

const useMaterials = (spec: BottleSpec, quality: Quality) =>
  useMemo(() => {
    const transmissive = quality === 'high';
    let glass: THREE.Material;
    if (spec.glass === 'black') {
      glass = new THREE.MeshPhysicalMaterial({
        color: '#0D0E10',
        roughness: 0.12,
        metalness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.4,
      });
    } else if (transmissive) {
      glass = new THREE.MeshPhysicalMaterial({
        color: spec.glass === 'smoke' ? '#8f8579' : '#ffffff',
        transmission: 1,
        thickness: 0.9,
        roughness: 0.03,
        ior: 1.52,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        attenuationColor: new THREE.Color(spec.glass === 'smoke' ? '#6b5d4c' : '#f3efe4'),
        attenuationDistance: spec.glass === 'smoke' ? 1.2 : 6,
        specularIntensity: 1,
        envMapIntensity: 1.25,
      });
    } else {
      // Cheaper path for low-power devices: classic alpha-blended glass.
      glass = new THREE.MeshPhysicalMaterial({
        color: spec.glass === 'smoke' ? '#1f1a15' : '#ffffff',
        transparent: true,
        opacity: spec.glass === 'smoke' ? 0.5 : 0.14,
        roughness: 0.05,
        clearcoat: spec.glass === 'smoke' ? 0.6 : 1,
        envMapIntensity: spec.glass === 'smoke' ? 0.7 : 1.5,
        depthWrite: false,
      });
    }

    const liquid = new THREE.MeshPhysicalMaterial({
      color: spec.liquid,
      roughness: 0.12,
      metalness: 0,
      clearcoat: 0.8,
      emissive: new THREE.Color(spec.liquid),
      emissiveIntensity: 0.04,
      envMapIntensity: 0.7,
    });

    const cap =
      spec.cap === 'gold'
        ? new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: 0.2, clearcoat: 0.4, envMapIntensity: 1.3 })
        : spec.cap === 'black'
          ? new THREE.MeshPhysicalMaterial({ color: '#0D0E10', metalness: 0.35, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2 })
          : new THREE.MeshPhysicalMaterial({ color: '#F1EEE6', metalness: 0, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 1 });

    const metal = new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: 0.16, envMapIntensity: 1.4 });
    return { glass, liquid, cap, metal };
  }, [spec.glass, spec.liquid, spec.cap, quality]);

const Cap = ({ spec, y, material, segments }: { spec: (typeof SHAPES)['classic']['cap']; y: number; material: THREE.Material; segments: number }) => {
  if (spec.kind === 'box') {
    return (
      <RoundedBox args={[spec.w, spec.h, spec.d]} radius={spec.r} smoothness={4} position={[0, y + spec.h / 2, 0]} material={material} castShadow />
    );
  }
  if (spec.kind === 'prism') {
    return (
      <mesh position={[0, y + spec.h / 2, 0]} rotation={[0, Math.PI / (spec.sides || 8), 0]} material={material} castShadow>
        <cylinderGeometry args={[spec.r, spec.r, spec.h, spec.sides || 8, 1]} />
      </mesh>
    );
  }
  if (spec.kind === 'dome') {
    return (
      <group position={[0, y, 0]}>
        <mesh position={[0, spec.h * 0.3, 0]} material={material} castShadow>
          <cylinderGeometry args={[spec.r, spec.r, spec.h * 0.6, segments]} />
        </mesh>
        <mesh position={[0, spec.h * 0.6, 0]} scale={[1, 0.62, 1]} material={material} castShadow>
          <sphereGeometry args={[spec.r, segments, segments / 2, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      </group>
    );
  }
  return (
    <mesh position={[0, y + spec.h / 2, 0]} material={material} castShadow>
      <cylinderGeometry args={[spec.r, spec.r, spec.h, segments]} />
    </mesh>
  );
};

/**
 * A procedurally built luxury perfume bottle: thick-based glass body, liquid,
 * gold collar, cap and a foil label. Origin sits at the base of the bottle.
 */
const PerfumeBottle = forwardRef<THREE.Group, Props>(({ spec, name, quality = 'high' }, ref) => {
  const shape = SHAPES[spec.shape] || SHAPES.classic;
  const mats = useMaterials(spec, quality);
  const segments = quality === 'high' ? 96 : 48;

  const liquidTop = shape.baseThickness + (shape.height - shape.baseThickness) * shape.fill;
  const liquidHeight = liquidTop - shape.baseThickness;

  const geo = useMemo(() => {
    if (shape.kind !== 'lathe') return null;
    return { body: latheGeometry(shape.profile!, segments), liquid: liquidLatheGeometry(shape, segments) };
  }, [shape, segments]);

  const labelTone = spec.glass === 'clear' && spec.cap === 'ivory' ? 'ink' : 'gold';
  const label = useMemo(() => labelTexture(name, labelTone, shape.label.w / shape.label.h), [name, labelTone, shape.label.w, shape.label.h]);
  const labelMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: label,
        transparent: true,
        metalness: labelTone === 'gold' ? 0.85 : 0,
        roughness: labelTone === 'gold' ? 0.3 : 0.6,
        envMapIntensity: 1.2,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    [label, labelTone]
  );

  const neckY = shape.height;
  const collarY = neckY + shape.neck.h * 0.4;
  const capY = neckY + shape.neck.h;

  let body: JSX.Element;
  let liquid: JSX.Element;
  let labelMesh: JSX.Element;

  if (shape.kind === 'box') {
    body = (
      <RoundedBox args={[shape.width, shape.height, shape.depth]} radius={shape.radius} smoothness={5} position={[0, shape.height / 2, 0]} material={mats.glass} castShadow />
    );
    liquid = (
      <RoundedBox
        args={[shape.width - shape.wall * 2, liquidHeight, shape.depth - shape.wall * 2]}
        radius={Math.max(0.02, shape.radius - shape.wall / 2)}
        smoothness={4}
        position={[0, shape.baseThickness + liquidHeight / 2, 0]}
        material={mats.liquid}
      />
    );
    labelMesh = (
      <mesh position={[0, shape.label.y, shape.depth / 2 + 0.003]} material={labelMat} renderOrder={2}>
        <planeGeometry args={[shape.label.w, shape.label.h]} />
      </mesh>
    );
  } else if (shape.kind === 'prism') {
    const sides = shape.sides || 8;
    const apothem = shape.radius * Math.cos(Math.PI / sides);
    body = (
      <mesh position={[0, shape.height / 2, 0]} rotation={[0, Math.PI / sides, 0]} material={mats.glass} castShadow>
        <cylinderGeometry args={[shape.radius, shape.radius, shape.height, sides, 1]} />
      </mesh>
    );
    liquid = (
      <mesh position={[0, shape.baseThickness + liquidHeight / 2, 0]} rotation={[0, Math.PI / sides, 0]} material={mats.liquid}>
        <cylinderGeometry args={[shape.radius - shape.wall, shape.radius - shape.wall, liquidHeight, sides, 1]} />
      </mesh>
    );
    labelMesh = (
      <mesh position={[0, shape.label.y, apothem + 0.003]} material={labelMat} renderOrder={2}>
        <planeGeometry args={[shape.label.w, shape.label.h]} />
      </mesh>
    );
  } else {
    const r = profileRadiusAt(shape.profile!, shape.label.y) + 0.004;
    const theta = shape.label.w / r;
    body = <mesh geometry={geo!.body} material={mats.glass} castShadow />;
    liquid = <mesh geometry={geo!.liquid} material={mats.liquid} />;
    labelMesh = (
      <mesh position={[0, shape.label.y, 0]} material={labelMat} renderOrder={2}>
        {/* open cylinder segment centred on +Z */}
        <cylinderGeometry args={[r, r, shape.label.h, 48, 1, true, -theta / 2, theta]} />
      </mesh>
    );
  }

  return (
    <group ref={ref}>
      {liquid}
      {body}
      {labelMesh}
      {/* neck */}
      <mesh position={[0, neckY + shape.neck.h / 2, 0]} material={mats.glass}>
        <cylinderGeometry args={[shape.neck.r, shape.neck.r, shape.neck.h, 32]} />
      </mesh>
      {/* gold collar */}
      <mesh position={[0, collarY, 0]} material={mats.metal} castShadow>
        <cylinderGeometry args={[shape.collar.r, shape.collar.r, shape.collar.h, 48]} />
      </mesh>
      <Cap spec={shape.cap} y={capY} material={mats.cap} segments={segments} />
      {/* thin gold band at the base of the cap */}
      {spec.cap !== 'gold' && (
        <mesh position={[0, capY + 0.012, 0]} material={mats.metal}>
          {shape.cap.kind === 'box' ? (
            <boxGeometry args={[shape.cap.w + 0.006, 0.024, shape.cap.d + 0.006]} />
          ) : (
            <cylinderGeometry args={[shape.cap.r + 0.004, shape.cap.r + 0.004, 0.024, shape.cap.sides || 48]} />
          )}
        </mesh>
      )}
    </group>
  );
});

PerfumeBottle.displayName = 'PerfumeBottle';

/** Total height including cap, used to frame the camera. */
export const bottleHeight = (spec: BottleSpec) => {
  const s = SHAPES[spec.shape] || SHAPES.classic;
  return s.height + s.neck.h + s.cap.h;
};

export default PerfumeBottle;
