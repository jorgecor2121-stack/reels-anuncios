import React from "react";
import { C, SW } from "./colors";
import { HandType } from "./types";

const sk = { fill: C.skin, stroke: C.outline, strokeWidth: SW, strokeLinejoin: "round" as const };

// Dedos ordenados desde el pulgar: índice, medio, anular, meñique.
const FX = [22, 7, -8, -23];
const FLEN = [56, 62, 58, 46];

const Finger: React.FC<{ i: number; len?: number }> = ({ i, len }) => {
  const h = len ?? FLEN[i];
  return <rect x={FX[i] - 8.5} y={-60 - h + 20} width={17} height={h} rx={8.5} {...sk} />;
};

const Knuckle: React.FC<{ i: number }> = ({ i }) => (
  <rect x={FX[i] - 9} y={-76} width={18} height={28} rx={9} {...sk} />
);

const Palm: React.FC<{ top?: number }> = ({ top = -64 }) => (
  <rect x={-32} y={top} width={64} height={4 - top} rx={24} {...sk} />
);

const FistThumb = () => (
  <rect x={-6} y={-46} width={40} height={17} rx={8.5} transform="rotate(-12 14 -38)" {...sk} />
);

const fist = (extended: number[], extLen?: number) => (
  <>
    {extended.map((i) => (
      <Finger key={"f" + i} i={i} len={extLen} />
    ))}
    <Palm top={-62} />
    {[0, 1, 2, 3]
      .filter((i) => !extended.includes(i))
      .map((i) => (
        <Knuckle key={"k" + i} i={i} />
      ))}
    <FistThumb />
  </>
);

export const HandShape: React.FC<{ type: HandType }> = ({ type }) => {
  switch (type) {
    case "open":
      return (
        <>
          {[0, 1, 2, 3].map((i) => (
            <Finger key={i} i={i} />
          ))}
          <rect x={18} y={-58} width={18} height={46} rx={9} transform="rotate(38 27 -20)" {...sk} />
          <Palm />
          <path d="M -12 -30 Q 0 -22 14 -30" fill="none" stroke={C.skinShade} strokeWidth={4} strokeLinecap="round" />
        </>
      );
    case "claw":
      return (
        <>
          {[0, 1, 2, 3].map((i) => (
            <Finger key={i} i={i} len={FLEN[i] * 0.62} />
          ))}
          <rect x={18} y={-52} width={18} height={38} rx={9} transform="rotate(30 27 -20)" {...sk} />
          <Palm />
        </>
      );
    case "fist":
      return fist([]);
    case "point":
      return fist([0], 70);
    case "two":
      return fist([0, 1]);
    case "three":
      return fist([0, 1, 2]);
    case "four": // cuatro dedos arriba, pulgar doblado
      return (
        <>
          {[0, 1, 2, 3].map((i) => (
            <Finger key={i} i={i} />
          ))}
          <Palm />
          <rect x={-4} y={-40} width={36} height={17} rx={8.5} transform="rotate(-10 14 -32)" {...sk} />
        </>
      );
    case "peace": // V: índice y medio separados
      return (
        <>
          <rect x={14} y={-118} width={17} height={66} rx={8.5} transform="rotate(14 22 -60)" {...sk} />
          <rect x={-3} y={-122} width={17} height={70} rx={8.5} transform="rotate(-10 5 -60)" {...sk} />
          <Palm top={-62} />
          {[2, 3].map((i) => (
            <Knuckle key={i} i={i} />
          ))}
          <FistThumb />
        </>
      );
    case "ok": // pulgar e índice en círculo, tres dedos arriba
      return (
        <>
          {[1, 2, 3].map((i) => (
            <Finger key={i} i={i} />
          ))}
          <Palm />
          <circle cx={28} cy={-68} r={17} fill="none" stroke={C.outline} strokeWidth={17 + SW * 2} />
          <circle cx={28} cy={-68} r={17} fill="none" stroke={C.skin} strokeWidth={17} />
        </>
      );
    case "pointFront":
      return (
        <>
          <Palm top={-62} />
          {[1, 2, 3].map((i) => (
            <Knuckle key={i} i={i} />
          ))}
          <rect x={10} y={-92} width={24} height={44} rx={12} {...sk} />
          <ellipse cx={22} cy={-80} rx={7} ry={6} fill={C.skinLight} stroke={C.outline} strokeWidth={3} />
          <FistThumb />
        </>
      );
    case "thumbsUp":
      return (
        <>
          <rect x={4} y={-112} width={22} height={64} rx={11} {...sk} />
          <rect x={-30} y={-62} width={62} height={66} rx={20} {...sk} />
          {[-44, -30, -16].map((y) => (
            <path key={y} d={`M -28 ${y} Q -8 ${y + 3} 6 ${y}`} fill="none" stroke={C.outline} strokeWidth={4} strokeLinecap="round" />
          ))}
        </>
      );
    case "phone":
      return (
        <>
          <Palm top={-62} />
          <g transform="translate(-8 -150)">
            <rect x={-48} y={0} width={96} height={170} rx={14} fill="#111" stroke={C.outline} strokeWidth={SW} />
            <rect x={-40} y={10} width={80} height={150} rx={8} fill="#1F2A44" />
            <rect x={-34} y={18} width={68} height={60} rx={6} fill="#F28C28" />
            <circle cx={0} cy={48} r={16} fill="#FFFFFF" />
            <path d="M -5 40 L 9 48 L -5 56 Z" fill="#F28C28" />
            <rect x={-34} y={86} width={52} height={8} rx={4} fill="#DDE3F0" />
            <rect x={-34} y={100} width={40} height={8} rx={4} fill="#8B97B3" />
            <rect x={-34} y={122} width={68} height={22} rx={8} fill="#2F80ED" />
          </g>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={30} y={-40 - i * 26} width={26} height={18} rx={9} {...sk} />
          ))}
          <rect x={-46} y={-70} width={20} height={40} rx={10} {...sk} />
        </>
      );
  }
};

export const Hand: React.FC<{
  x: number;
  y: number;
  angle: number;
  type: HandType;
  mirror?: boolean;
  scale?: number;
}> = ({ x, y, angle, type, mirror, scale = 1.6 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${mirror ? -scale : scale} ${scale})`}>
    <HandShape type={type} />
  </g>
);
