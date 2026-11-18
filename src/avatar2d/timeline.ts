import { POSE_BY_ID } from "./poses";
import { ArmPose, Mouth, Pose, Pt } from "./types";
import { forward, mixJoints, solveArm } from "./ik";

/** Un tramo del guion: desde `start` (segundos) el personaje hace la pose `pose`. */
export type Segment = { start: number; pose: string; talk?: boolean; text?: string };

const TRANSITION = 9; // frames que tarda en pasar de una pose a otra

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixPt = (a: Pt, b: Pt, t: number): Pt => [mix(a[0], b[0], t), mix(a[1], b[1], t)];

const mixArm = (a: ArmPose, b: ArmPose, t: number, shoulderA: Pt, shoulderB: Pt): ArmPose => {
  const sa = a.shoulder ?? shoulderA;
  const sb = b.shoulder ?? shoulderB;
  const s = mixPt(sa, sb, t);
  // Se mezclan ÁNGULOS (hombro y codo), no posiciones: el brazo gira y no se deforma.
  const j = mixJoints(solveArm(sa, a), solveArm(sb, b), t);
  const { elbow, wrist } = forward(s, j);
  return {
    shoulder: s,
    elbow,
    wrist,
    hand: t < 0.5 ? a.hand : b.hand,
    handAngle:
      a.handAngle !== undefined && b.handAngle !== undefined ? mixAngle(a.handAngle, b.handAngle, t) : t < 0.5 ? a.handAngle : b.handAngle,
    handScale: mix(a.handScale ?? 1.6, b.handScale ?? 1.6, t) * (a.hand === b.hand ? 1 : 1 - 0.22 * Math.sin(Math.PI * t)),
    front: t < 0.5 ? a.front : b.front,
  };
};

const mixAngle = (a: number, b: number, t: number) => a + ((((b - a) % 360) + 540) % 360 - 180) * t;

/** Mezcla dos poses (t = 0 → a, t = 1 → b). */
export const blendPose = (a: Pose, b: Pose, t: number): Pose => {
  const la = a.shoulderLift ?? 0;
  const lb = b.shoulderLift ?? 0;
  return {
    right: mixArm(a.right, b.right, t, [262, 790 - la], [262, 790 - lb]),
    left: mixArm(a.left, b.left, t, [818, 790 - la], [818, 790 - lb]),
    face: t < 0.5 ? a.face : b.face,
    headTilt: mix(a.headTilt ?? 0, b.headTilt ?? 0, t),
    headY: mix(a.headY ?? 0, b.headY ?? 0, t),
    shoulderLift: mix(la, lb, t),
  };
};

/** Bocas que pertenecen al gesto y no se sustituyen al hablar. */
const LOCKED_MOUTHS: Mouth[] = ["laugh", "shh", "surprise"];

// Ruido determinista (mismo resultado en cada render)
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const isBlinking = (frame: number, fps: number) => {
  // Un parpadeo cada 2.5–4.5 s, de 4 frames
  let t = Math.round(fps * 1.2);
  let i = 0;
  while (t <= frame) {
    if (frame - t < 4) return true;
    t += Math.round(fps * (2.5 + hash(i++) * 2));
  }
  return false;
};

/** Boca según el volumen de la voz (0–1). */
export const mouthFromVolume = (v: number, frame: number): Mouth => {
  if (v < 0.05) return "M";
  if (v < 0.13) return hash(frame >> 1) > 0.5 ? "E" : "smile";
  if (v < 0.24) return hash(frame >> 1) > 0.4 ? "O" : "E";
  return "A";
};

/** Boca de "habla falsa" para cuando no hay audio. */
export const fakeTalkMouth = (frame: number): Mouth => {
  const seq: Mouth[] = ["A", "E", "O", "M", "A", "E", "smile", "O", "A", "M"];
  return seq[Math.floor(hash(Math.floor(frame / 3)) * seq.length)];
};

export const poseAtFrame = (
  script: Segment[],
  frame: number,
  fps: number,
  opts: { volume?: number } = {},
): Pose => {
  const idx = Math.max(0, script.reduce((acc, s, i) => (s.start * fps <= frame ? i : acc), -1));
  const seg = script[idx];
  const cur = POSE_BY_ID[seg.pose] ?? POSE_BY_ID.base;
  const prev = idx > 0 ? POSE_BY_ID[script[idx - 1].pose] ?? cur : cur;
  const since = frame - seg.start * fps;
  const t = idx === 0 ? 1 : ease(Math.min(1, Math.max(0, since / TRANSITION)));
  const pose = blendPose(prev, cur, t);

  let mouth = pose.face.mouth;
  if (!LOCKED_MOUTHS.includes(mouth)) {
    if (opts.volume !== undefined) mouth = mouthFromVolume(opts.volume, frame);
    else if (seg.talk) mouth = fakeTalkMouth(frame);
  }
  const blink = isBlinking(frame, fps) && pose.face.eyes !== "happy" && pose.face.eyes !== "closed";
  return { ...pose, face: { ...pose.face, mouth, eyes: blink ? "closed" : pose.face.eyes } };
};
