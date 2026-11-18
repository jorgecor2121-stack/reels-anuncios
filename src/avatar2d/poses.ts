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

const BASE_POSES: PoseDef[] = [
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

// ------------------------------------------------------------------
// 26–100: nuevas poses (bocas, miradas, cabeza, emociones, gestos y combinaciones)
// ------------------------------------------------------------------
const L = (a: ArmPose) => mirrorArm(a); // mismo gesto con el brazo izquierdo

const G = {
  wave: up(176, 196, 660, "open", -8),
  idea: up(186, 228, 676, "point", 6),
  you: up(236, 410, 840, "pointFront", 10),
  thumbsUp: up(196, 262, 730, "thumbsUp", 0),
  one: up(186, 232, 690, "point", 0),
  pointSide: up(214, 186, 772, "point", -76),
  presentSide: up(200, 140, 800, "open", -60),
  heart: { elbow: [330, ELBOW_Y], wrist: [520, 860], hand: "open", handAngle: 50 } as ArmPose,
  listen: { elbow: [180, 780], wrist: [300, 500], hand: "open", handAngle: -8 } as ArmPose,
  stop: up(250, 420, 760, "open", 0, { handScale: 1.85 }),
  ok: up(186, 232, 690, "ok", 0),
  peace: up(186, 232, 690, "peace", -6),
  four: up(186, 232, 690, "four", 0),
  five: up(186, 232, 690, "open", 0),
  fistUp: up(180, 210, 640, "fist", -4),
  temple: { elbow: [170, 760], wrist: [330, 420], hand: "point", handAngle: 30 } as ArmPose,
  forehead: { elbow: [220, 700], wrist: [380, 370], hand: "open", handAngle: 75, handScale: 1.6 } as ArmPose,
  coverMouth: { elbow: [320, 900], wrist: [466, 560], hand: "open", handAngle: 30, handScale: 1.6 } as ArmPose,
  thumbsDown: up(196, 262, 790, "thumbsUp", 180),
  wagNo: up(186, 232, 680, "point", -15),
  beckon: up(220, 330, 770, "claw", 20),
  chinRest: { elbow: [360, ELBOW_Y], wrist: [470, 720], hand: "fist", handAngle: 10 } as ArmPose,
  handsUp: up(170, 170, 620, "open", -14),
  pray: up(300, 516, 770, "open", 8),
  armsWide: up(176, 96, 770, "open", -62),
  chinBoth: { elbow: [330, ELBOW_Y], wrist: [470, 700], hand: "fist", handAngle: 15 } as ArmPose,
  phone: up(250, 400, 870, "phone", 0, { handScale: 1.5 }),
  explain: up(192, 112, 800, "open", -50),
  clap: up(282, 478, 790, "open", 18),
  shrug: up(226, 140, 840, "open", -48),
  thinking: up(330, 478, 740, "fist", 22),
  down: up(196, 330, 870, "point", 162),
};

type Extra = [string, string, Face, Partial<Pose>?];
const E = (eyes: Face["eyes"], brows: Face["brows"], mouth: Face["mouth"]) => F(eyes, brows, mouth);

const EXTRA: Extra[] = [
  // Bocas extra para hablar (26–30)
  ["I", "Boca I", E("open", "normal", "I")],
  ["U", "Boca U", E("open", "normal", "U")],
  ["F", "Boca F/V", E("open", "normal", "F")],
  ["L", "Boca L/N/T/D", E("open", "normal", "L")],
  ["S", "Boca S/Z/C", E("open", "normal", "S")],
  // Miradas (31–35)
  ["lookLeft", "Mira a la izquierda", E("left", "normal", "smile")],
  ["lookRight", "Mira a la derecha", E("right", "normal", "smile")],
  ["lookDown", "Mira abajo", E("down", "normal", "smile")],
  ["lookUp", "Mira arriba", E("up", "raised", "smile")],
  ["wink", "Guiño", E("wink", "raised", "grin")],
  // Cabeza (36–41)
  ["tiltLeft", "Cabeza inclinada izq.", E("open", "raised", "smile"), { headTilt: -9 }],
  ["tiltRight", "Cabeza inclinada der.", E("open", "raised", "smile"), { headTilt: 9 }],
  ["turnLeft", "Gira la cabeza izq.", E("left", "normal", "smile"), { headTurn: -1 }],
  ["turnRight", "Gira la cabeza der.", E("right", "normal", "smile"), { headTurn: 1 }],
  ["nod", "Asiente (abajo)", E("down", "normal", "smile"), { headY: -14 }],
  ["headBack", "Cabeza atrás", E("up", "raised", "bigSmile"), { headY: 14, headTilt: -3 }],
  // Emociones (42–48)
  ["sad", "Triste", E("down", "worried", "sad"), { headTilt: 4 }],
  ["angry", "Enojado", E("open", "angry", "flat")],
  ["proud", "Orgulloso", E("half", "confident", "grin"), { headY: 6 }],
  ["skeptic", "Escéptico", E("side", "doubt", "flat"), { headTurn: 0.5 }],
  ["excited", "Emocionado", E("wide", "raised", "bigSmile")],
  ["tired", "Cansado", E("half", "worried", "M"), { headTilt: 6 }],
  ["love", "Encantado", E("happy", "raised", "smile"), { headTilt: -6 }],
  // Gestos nuevos (49–76)
  ["waveBoth", "Saluda con las dos manos", E("happy", "raised", "bigSmile"), { right: G.wave, left: L(G.wave) }],
  ["pointLeft", "Señala a la izquierda", E("left", "raised", "smile"), { right: G.pointSide, headTurn: -0.5 }],
  ["pointRight", "Señala a la derecha", E("right", "raised", "smile"), { left: L(G.pointSide), headTurn: 0.5 }],
  ["presentLeft", "Presenta a la izquierda", E("left", "raised", "grin"), { right: G.presentSide }],
  ["presentRight", "Presenta a la derecha", E("right", "raised", "grin"), { left: L(G.presentSide) }],
  ["heart", "Mano en el corazón", E("happy", "worried", "smile"), { right: G.heart }],
  ["listen", "Escucha (mano en la oreja)", E("side", "raised", "O"), { right: G.listen, headTilt: -5 }],
  ["stop", "Alto / espera", E("open", "angry", "flat"), { right: G.stop }],
  ["ok", "Señal de OK", E("wink", "raised", "grin"), { right: G.ok }],
  ["peace", "Paz (V)", E("happy", "raised", "grin"), { right: G.peace, headTilt: -4 }],
  ["fourFingers", "Cuatro", E("open", "raised", "smile"), { right: G.four }],
  ["fiveFingers", "Cinco", E("open", "raised", "smile"), { right: G.five }],
  ["fistPump", "Puño arriba ¡sí!", E("happy", "raised", "bigSmile"), { right: G.fistUp }],
  ["thumbsBoth", "Dos pulgares arriba", E("happy", "raised", "grin"), { right: G.thumbsUp, left: L(G.thumbsUp) }],
  ["celebrate", "Celebra (puños arriba)", E("happy", "raised", "laugh"), { right: G.fistUp, left: L(G.fistUp), headY: 8 }],
  ["smart", "Señala la cabeza (listo)", E("side", "raised", "grin"), { right: G.temple, headTilt: 4 }],
  ["ohNo", "Mano en la frente", E("closed", "worried", "O"), { right: G.forehead, headTilt: 5 }],
  ["oops", "Se tapa la boca", E("wide", "raised", "flat"), { right: G.coverMouth }],
  ["thumbsDown", "Pulgar abajo", E("open", "angry", "sad"), { right: G.thumbsDown }],
  ["wagNo", "Dedo que dice no", E("half", "confident", "flat"), { right: G.wagNo, headTilt: 5 }],
  ["beckon", "Ven aquí", E("open", "raised", "grin"), { right: G.beckon, headTilt: -4 }],
  ["chinRest", "Apoya la barbilla", E("up", "normal", "M"), { right: G.chinRest, headTilt: 6 }],
  ["handsUp", "Manos arriba", E("wide", "raised", "surprise"), { right: G.handsUp, left: L(G.handsUp) }],
  ["please", "Por favor (manos juntas)", E("open", "worried", "smile"), { right: G.pray, left: L(G.pray) }],
  ["welcome", "Brazos abiertos", E("happy", "raised", "bigSmile"), { right: G.armsWide, left: L(G.armsWide) }],
  ["dreamy", "Soñando (barbilla en manos)", E("up", "raised", "smile"), { right: G.chinBoth, left: L(G.chinBoth), headTilt: -5 }],
  ["countOnHand", "Cuenta con la otra mano", E("right", "raised", "A"), { left: L(G.five), right: up(300, 600, 790, "point", 40), headTurn: 0.4 }],
  ["leanIn", "Se acerca (confidencia)", E("half", "raised", "smile"), { headY: -10, headTilt: 3 }],
  // Combinaciones (77–100)
  ["waveTurn", "Saluda girando", E("happy", "raised", "bigSmile"), { right: G.wave, headTurn: 0.6, headTilt: -4 }],
  ["ideaUp", "Idea mirando arriba", E("up", "raised", "O"), { right: G.idea, headY: 6 }],
  ["youTilt", "Tú (cabeza inclinada)", E("open", "confident", "grin"), { right: G.you, headTilt: -6 }],
  ["explainTurn", "Explica girando", E("left", "raised", "E"), { right: G.explain, left: L(G.explain), headTurn: -0.6 }],
  ["phoneLook", "Mira el celular", E("down", "raised", "O"), { right: G.phone, headY: -8, headTurn: -0.4 }],
  ["thumbsWink", "Pulgar y guiño", E("wink", "raised", "grin"), { right: G.thumbsUp, headTilt: -5 }],
  ["oneRaised", "Uno con cejas arriba", E("wide", "raised", "O"), { right: G.one }],
  ["crossedTilt", "Brazos cruzados inclinado", E("half", "confident", "smile"), {
    right: { elbow: [220, ELBOW_Y], wrist: [690, 962], hand: "fist", handAngle: 92 },
    left: { elbow: [860, ELBOW_Y - 8], wrist: [392, 948], hand: "fist", handAngle: -92 },
    headTilt: 7,
  }],
  ["shrugSide", "Encoge hombros mirando", E("side", "worried", "flat"), { right: G.shrug, left: L(G.shrug), shoulderLift: 24, headTurn: 0.5 }],
  ["thinkUp", "Piensa mirando arriba", E("up", "doubt", "U"), { right: G.thinking, headTurn: -0.4, headY: 4 }],
  ["clapLaugh", "Aplaude riendo", E("happy", "raised", "laugh"), { right: G.clap, left: L(G.clap), headTilt: -6, headY: 10 }],
  ["downLook", "Señala y mira abajo", E("down", "raised", "smile"), { right: G.down, headY: -10 }],
  ["pointLeftLook", "Señala izq. girando", E("left", "raised", "A"), { right: G.pointSide, headTurn: -1 }],
  ["pointRightLook", "Señala der. girando", E("right", "raised", "A"), { left: L(G.pointSide), headTurn: 1 }],
  ["heartTilt", "Corazón inclinado", E("closed", "raised", "smile"), { right: G.heart, headTilt: -8 }],
  ["listenTurn", "Escucha girando", E("left", "raised", "U"), { right: G.listen, headTurn: -0.7 }],
  ["stopTurn", "Alto girando", E("right", "angry", "flat"), { right: G.stop, headTurn: 0.5 }],
  ["okTilt", "OK inclinado", E("happy", "raised", "grin"), { right: G.ok, headTilt: 6 }],
  ["peaceWink", "Paz y guiño", E("wink", "raised", "bigSmile"), { right: G.peace, headTilt: -7 }],
  ["fistLaugh", "Puño riendo", E("happy", "raised", "laugh"), { right: G.fistUp, headY: 10 }],
  ["celebrateBack", "Celebra cabeza atrás", E("happy", "raised", "laugh"), { right: G.handsUp, left: L(G.handsUp), headY: 14 }],
  ["facepalmTurn", "Facepalm girando", E("closed", "worried", "sad"), { right: { elbow: [320, 930], wrist: [450, 505], hand: "open", handAngle: 16, handScale: 1.75 }, headTurn: -0.4 }],
  ["surpriseBack", "Sorpresa cabeza atrás", E("wide", "raised", "surprise"), { headY: 12 }],
  ["doubtTurn", "Duda girando", E("right", "doubt", "flat"), { right: { elbow: [150, 640], wrist: [320, 350], hand: "claw", handAngle: 40 }, headTurn: 0.6 }],
];

export const POSES: PoseDef[] = [
  ...BASE_POSES,
  ...EXTRA.map(([id, label, face, extra], i) => ({
    id,
    file: String(26 + i).padStart(2, "0"),
    label,
    pose: base(face, extra ?? {}),
  })),
];

export const POSE_BY_ID: Record<string, Pose> = Object.fromEntries(POSES.map((p) => [p.id, p.pose]));
