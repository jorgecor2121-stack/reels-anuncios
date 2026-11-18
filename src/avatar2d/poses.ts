import { ArmPose, Face, Pose } from "./types";

/** Refleja un brazo del lado derecho del personaje al lado izquierdo */
export const mirrorArm = (a: ArmPose): ArmPose => ({
  ...a,
  shoulder: a.shoulder ? [1080 - a.shoulder[0], a.shoulder[1]] : undefined,
  elbow: [1080 - a.elbow[0], a.elbow[1]],
  wrist: [1080 - a.wrist[0], a.wrist[1]],
  handAngle: a.handAngle === undefined ? undefined : -a.handAngle,
});

/**
 * Los brazos van HACIA ADELANTE sobre la mesa: los codos se apoyan en la mesa (y ≈ 975)
 * y en cada gesto el antebrazo se levanta desde el codo, como en los avatares de podcast.
 */
export const ELBOW_Y = 975;
const REST_R: ArmPose = { elbow: [200, ELBOW_Y], wrist: [478, 1004], hand: "fist", handAngle: 96 };
const REST_L: ArmPose = mirrorArm({ elbow: [200, ELBOW_Y - 6], wrist: [450, 988], hand: "fist", handAngle: 96 });
/** Brazo derecho con el codo en la mesa y la mano en (x, y) */
const up = (ex: number, wx: number, wy: number, hand: ArmPose["hand"], handAngle: number, extra: Partial<ArmPose> = {}): ArmPose => ({
  elbow: [ex, ELBOW_Y],
  wrist: [wx, wy],
  hand,
  handAngle,
  ...extra,
});

const F = (eyes: Face["eyes"], brows: Face["brows"], mouth: Face["mouth"]): Face => ({ eyes, brows, mouth });
const base = (face: Face, extra: Partial<Pose> = {}): Pose => ({ right: REST_R, left: REST_L, face, ...extra });

export type PoseDef = { id: string; file: string; label: string; pose: Pose };

export const POSES: PoseDef[] = [
  // --- Bocas y parpadeo ---
  { id: "base", file: "01", label: "Base · sonrisa", pose: base(F("open", "normal", "smile")) },
  { id: "A", file: "02", label: "Boca A", pose: base(F("open", "normal", "A")) },
  { id: "O", file: "03", label: "Boca O", pose: base(F("open", "normal", "O")) },
  { id: "E", file: "04", label: "Boca E", pose: base(F("open", "normal", "E")) },
  { id: "M", file: "05", label: "Boca M", pose: base(F("open", "normal", "M")) },
  { id: "blink", file: "06", label: "Parpadeo", pose: base(F("closed", "normal", "smile")) },
  // --- Gestos ---
  {
    id: "wave", file: "07", label: "Saludo",
    pose: base(F("open", "raised", "bigSmile"), { right: up(176, 196, 660, "open", -8), headTilt: -3 }),
  },
  {
    id: "idea", file: "08", label: "¡Idea!",
    pose: base(F("wide", "raised", "bigSmile"), { right: up(186, 228, 676, "point", 6) }),
  },
  {
    id: "you", file: "09", label: "Señala a cámara",
    pose: base(F("open", "confident", "grin"), { right: up(236, 410, 840, "pointFront", 10) }),
  },
  {
    id: "doubt", file: "10", label: "Duda",
    pose: base(F("side", "doubt", "flat"), { right: { elbow: [150, 640], wrist: [320, 350], hand: "claw", handAngle: 40 }, headTilt: 5 }),
  },
  {
    id: "thumbsUp", file: "11", label: "Pulgar arriba",
    pose: base(F("happy", "raised", "grin"), { right: up(196, 262, 730, "thumbsUp", 0) }),
  },
  {
    id: "explain", file: "12", label: "Explicando",
    pose: base(F("open", "raised", "A"), {
      right: up(192, 112, 800, "open", -50),
      left: mirrorArm(up(192, 112, 800, "open", -50)),
    }),
  },
  {
    id: "facepalm", file: "13", label: "Facepalm",
    pose: base(F("closed", "worried", "flat"), { right: { elbow: [320, 930], wrist: [450, 505], hand: "open", handAngle: 16, handScale: 1.75 }, headTilt: 4 }),
  },
  {
    id: "crossed", file: "14", label: "Brazos cruzados",
    pose: base(F("open", "confident", "smile"), {
      right: { elbow: [220, ELBOW_Y], wrist: [690, 962], hand: "fist", handAngle: 92 },
      left: { elbow: [860, ELBOW_Y - 8], wrist: [392, 948], hand: "fist", handAngle: -92 },
    }),
  },
  {
    id: "surprised", file: "15", label: "Sorprendido",
    pose: base(F("wide", "raised", "surprise"), {
      right: { elbow: [262, 945], wrist: [364, 612], hand: "open", handAngle: 10 },
      left: mirrorArm({ elbow: [262, 945], wrist: [364, 612], hand: "open", handAngle: 10 }),
    }),
  },
  {
    id: "one", file: "16", label: "Uno",
    pose: base(F("open", "raised", "smile"), { right: up(186, 232, 690, "point", 0) }),
  },
  {
    id: "two", file: "17", label: "Dos",
    pose: base(F("open", "raised", "smile"), { right: up(186, 232, 690, "two", 0) }),
  },
  {
    id: "three", file: "18", label: "Tres",
    pose: base(F("open", "raised", "smile"), { right: up(186, 232, 690, "three", 0) }),
  },
  {
    id: "phone", file: "19", label: "Muestra el celular",
    pose: base(F("open", "raised", "grin"), { right: up(250, 400, 870, "phone", 0, { handScale: 1.5 }) }),
  },
  { id: "laugh", file: "20", label: "Risa", pose: base(F("happy", "raised", "laugh"), { headTilt: -6, headY: 12 }) },
  {
    id: "shrug", file: "21", label: "Encoge hombros",
    pose: base(F("open", "worried", "flat"), {
      right: up(226, 140, 840, "open", -48),
      left: mirrorArm(up(226, 140, 840, "open", -48)),
      shoulderLift: 24,
      headTilt: 5,
    }),
  },
  {
    id: "thinking", file: "22", label: "Pensando",
    pose: base(F("up", "doubt", "M"), { right: up(330, 478, 740, "fist", 22) }),
  },
  {
    id: "clap", file: "23", label: "Aplaude",
    pose: base(F("happy", "raised", "bigSmile"), {
      right: up(282, 478, 790, "open", 18),
      left: mirrorArm(up(282, 478, 790, "open", 18)),
    }),
  },
  {
    id: "shh", file: "24", label: "Shh (secreto)",
    pose: base(F("wink", "raised", "shh"), { right: { elbow: [372, 930], wrist: [505, 640], hand: "point", handAngle: 0 } }),
  },
  {
    id: "down", file: "25", label: "Señala abajo",
    pose: base(F("open", "raised", "grin"), { right: up(196, 330, 870, "point", 162) }),
  },
];

export const POSE_BY_ID: Record<string, Pose> = Object.fromEntries(POSES.map((p) => [p.id, p.pose]));
