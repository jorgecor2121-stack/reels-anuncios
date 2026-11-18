export type Pt = [number, number];

export type HandType =
  | "open"
  | "fist"
  | "point"
  | "pointFront"
  | "two"
  | "three"
  | "thumbsUp"
  | "phone"
  | "claw"
  | "ok"
  | "peace"
  | "four";

export type ArmPose = {
  shoulder?: Pt;
  elbow: Pt;
  wrist: Pt;
  hand: HandType;
  /** Ángulo absoluto de la mano (0 = dedos hacia arriba). Si se omite, sigue al antebrazo. */
  handAngle?: number;
  handScale?: number;
  /** Dibujar el brazo por delante de la cabeza */
  front?: boolean;
};

export type Eyes = "open" | "closed" | "happy" | "wide" | "up" | "wink" | "side" | "left" | "right" | "down" | "half";
export type Brows = "normal" | "raised" | "doubt" | "confident" | "worried" | "angry";
export type Mouth =
  | "smile"
  | "grin"
  | "A"
  | "O"
  | "E"
  | "M"
  | "bigSmile"
  | "laugh"
  | "surprise"
  | "shh"
  | "flat"
  | "I"
  | "U"
  | "F"
  | "L"
  | "S"
  | "sad";

export type Face = { eyes: Eyes; brows: Brows; mouth: Mouth };

export type Pose = {
  /** Brazo derecho del personaje (a la izquierda de la pantalla) */
  right: ArmPose;
  /** Brazo izquierdo del personaje (a la derecha de la pantalla, lleva el reloj) */
  left: ArmPose;
  face: Face;
  headTilt?: number;
  /** Giro de cabeza: -1 = mira a la izquierda de la pantalla, 1 = a la derecha */
  headTurn?: number;
  headY?: number;
  shoulderLift?: number;
};
