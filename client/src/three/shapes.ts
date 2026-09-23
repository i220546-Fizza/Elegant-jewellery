import * as THREE from 'three';
import type { BottleShape } from '../types';

/**
 * Proportions for each bottle silhouette. Units are world units with the bottle
 * standing on y = 0. Everything else (liquid, label, cap) is derived from these.
 */
export interface ShapeSpec {
  kind: 'box' | 'prism' | 'lathe';
  height: number;
  width: number; // box width or max radius * 2
  depth: number;
  radius: number; // corner radius (box) / radius (prism)
  sides?: number;
  profile?: [number, number][]; // lathe (r, y) outer profile, bottom to neck
  baseThickness: number;
  wall: number;
  fill: number; // 0..1 of body height
  neck: { r: number; h: number };
  collar: { r: number; h: number };
  cap: { kind: 'box' | 'cylinder' | 'prism' | 'dome'; w: number; h: number; d: number; r: number; sides?: number };
  label: { w: number; h: number; y: number; curved?: boolean };
}

export const SHAPES: Record<BottleShape, ShapeSpec> = {
  classic: {
    kind: 'box',
    height: 1.42,
    width: 1.28,
    depth: 0.64,
    radius: 0.1,
    baseThickness: 0.16,
    wall: 0.07,
    fill: 0.9,
    neck: { r: 0.12, h: 0.1 },
    collar: { r: 0.19, h: 0.07 },
    cap: { kind: 'box', w: 0.74, h: 0.52, d: 0.52, r: 0.05 },
    label: { w: 0.62, h: 0.44, y: 0.66 },
  },
  tall: {
    kind: 'box',
    height: 1.9,
    width: 0.8,
    depth: 0.8,
    radius: 0.08,
    baseThickness: 0.18,
    wall: 0.07,
    fill: 0.9,
    neck: { r: 0.11, h: 0.1 },
    collar: { r: 0.17, h: 0.07 },
    cap: { kind: 'cylinder', w: 0.58, h: 0.58, d: 0.58, r: 0.29 },
    label: { w: 0.54, h: 0.62, y: 0.92 },
  },
  facet: {
    kind: 'prism',
    height: 1.34,
    width: 1.6,
    depth: 1.6,
    radius: 0.8,
    sides: 8,
    baseThickness: 0.16,
    wall: 0.08,
    fill: 0.88,
    neck: { r: 0.13, h: 0.1 },
    collar: { r: 0.2, h: 0.07 },
    cap: { kind: 'prism', w: 0.86, h: 0.5, d: 0.86, r: 0.43, sides: 8 },
    label: { w: 0.5, h: 0.46, y: 0.64 },
  },
  round: {
    kind: 'lathe',
    height: 1.22,
    width: 1.66,
    depth: 1.66,
    radius: 0.83,
    profile: [
      [0, 0],
      [0.62, 0],
      [0.74, 0.04],
      [0.81, 0.16],
      [0.83, 0.36],
      [0.83, 0.8],
      [0.8, 1.0],
      [0.7, 1.12],
      [0.5, 1.2],
      [0.2, 1.22],
      [0.13, 1.22],
    ],
    baseThickness: 0.14,
    wall: 0.07,
    fill: 0.78,
    neck: { r: 0.13, h: 0.1 },
    collar: { r: 0.2, h: 0.07 },
    cap: { kind: 'dome', w: 0.6, h: 0.52, d: 0.6, r: 0.3 },
    label: { w: 0.62, h: 0.42, y: 0.56, curved: true },
  },
  flacon: {
    kind: 'lathe',
    height: 1.55,
    width: 1.46,
    depth: 1.46,
    radius: 0.73,
    profile: [
      [0, 0],
      [0.54, 0],
      [0.64, 0.05],
      [0.72, 0.28],
      [0.73, 0.52],
      [0.7, 0.86],
      [0.62, 1.12],
      [0.46, 1.34],
      [0.24, 1.5],
      [0.14, 1.55],
    ],
    baseThickness: 0.15,
    wall: 0.07,
    fill: 0.74,
    neck: { r: 0.12, h: 0.1 },
    collar: { r: 0.18, h: 0.07 },
    cap: { kind: 'prism', w: 0.5, h: 0.66, d: 0.5, r: 0.25, sides: 8 },
    label: { w: 0.62, h: 0.4, y: 0.6, curved: true },
  },
};

/** Radius of a lathe profile at height y (linear interpolation). */
export const profileRadiusAt = (profile: [number, number][], y: number) => {
  for (let i = 1; i < profile.length; i += 1) {
    const [r0, y0] = profile[i - 1];
    const [r1, y1] = profile[i];
    if (y >= y0 && y <= y1) {
      const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
      return r0 + (r1 - r0) * t;
    }
  }
  return profile[profile.length - 1][0];
};

export const latheGeometry = (profile: [number, number][], segments: number) =>
  new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    segments
  );

/** Liquid volume inside a lathe body: the inset profile cut flat at the fill line. */
export const liquidLatheGeometry = (spec: ShapeSpec, segments: number) => {
  const profile = spec.profile!;
  const top = spec.baseThickness + (spec.height - spec.baseThickness) * spec.fill;
  const pts: [number, number][] = [[0, spec.baseThickness]];
  profile.forEach(([r, y]) => {
    if (y > spec.baseThickness && y < top) pts.push([Math.max(0.01, r - spec.wall), y]);
  });
  pts.splice(1, 0, [Math.max(0.01, profileRadiusAt(profile, spec.baseThickness) - spec.wall), spec.baseThickness]);
  const rTop = Math.max(0.01, profileRadiusAt(profile, top) - spec.wall);
  pts.push([rTop, top], [0, top]);
  return latheGeometry(pts, segments);
};
