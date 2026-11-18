import { ArmPose, Pt } from "./types";

/**
 * El brazo se describe con ángulos (hombro y codo) y largos de hueso.
 * Para pasar de una pose a otra se GIRAN las articulaciones en vez de mover
 * codo y muñeca en línea recta, así el brazo no se deforma a mitad de camino.
 * El largo puede variar un poco entre poses (escorzo: brazo hacia la cámara),
 * pero cambia de forma gradual.
 */
export type Joints = { a1: number; a2: number; u: number; f: number };

const norm = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

export const solveArm = (s: Pt, arm: ArmPose): Joints => {
  const [ex, ey] = arm.elbow;
  const [wx, wy] = arm.wrist;
  const a1 = Math.atan2(ey - s[1], ex - s[0]);
  const a2 = norm(Math.atan2(wy - ey, wx - ex) - a1);
  return { a1, a2, u: Math.hypot(ex - s[0], ey - s[1]), f: Math.hypot(wx - ex, wy - ey) };
};

export const forward = (s: Pt, j: Joints): { elbow: Pt; wrist: Pt } => {
  const elbow: Pt = [s[0] + j.u * Math.cos(j.a1), s[1] + j.u * Math.sin(j.a1)];
  const a = j.a1 + j.a2;
  return { elbow, wrist: [elbow[0] + j.f * Math.cos(a), elbow[1] + j.f * Math.sin(a)] };
};

/** Mezcla ángulos por el camino más corto y largos de forma lineal. */
export const mixJoints = (a: Joints, b: Joints, t: number): Joints => ({
  a1: a.a1 + norm(b.a1 - a.a1) * t,
  a2: a.a2 + norm(b.a2 - a.a2) * t,
  u: a.u + (b.u - a.u) * t,
  f: a.f + (b.f - a.f) * t,
});
