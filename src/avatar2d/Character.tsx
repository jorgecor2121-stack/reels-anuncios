import React from "react";
import { Arm } from "./Arm";
import { C, SW } from "./colors";
import { Head } from "./Head";
import { Pose, Pt } from "./types";

export const SIZE = 1080;
export const R_SHOULDER: Pt = [262, 790];
export const L_SHOULDER: Pt = [818, 790];

const Torso: React.FC<{ lift: number }> = ({ lift }) => {
  const L = lift;
  return (
    <g>
      <path
        d={`M 170 ${860 - L} Q 190 ${700 - L} 420 ${672 - L} L 660 ${672 - L} Q 890 ${700 - L} 910 ${860 - L} L 930 1090 L 150 1090 Z`}
        fill={C.shirt}
        stroke={C.outline}
        strokeWidth={SW}
      />
      {/* pliegues del polo */}
      <path d="M 330 900 Q 360 960 350 1060 M 750 900 Q 720 960 730 1060 M 420 1000 Q 470 980 500 1010" fill="none" stroke={C.shirtLine} strokeWidth={5} strokeLinecap="round" />
      {/* tapeta y botones */}
      <path d={`M 516 ${700 - L} L 516 880 L 564 880 L 564 ${700 - L}`} fill="none" stroke={C.shirtLine} strokeWidth={5} />
      {[760, 830].map((y) => (
        <circle key={y} cx={540} cy={y - L} r={9} fill="#2B2B2B" stroke="#000" strokeWidth={3} />
      ))}
      {/* cuello del polo, puntas grandes */}
      <path d={`M 476 ${652 - L} L 404 ${690 - L} L 470 ${800 - L} L 540 ${708 - L} Z`} fill={C.shirt} stroke={C.shirtLine} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M 604 ${652 - L} L 676 ${690 - L} L 610 ${800 - L} L 540 ${708 - L} Z`} fill={C.shirt} stroke={C.shirtLine} strokeWidth={5} strokeLinejoin="round" />
      {/* cadena dorada cubana */}
      <path d={`M 470 ${690 - L} Q 540 ${830 - L} 610 ${690 - L}`} fill="none" stroke={C.goldDark} strokeWidth={16} strokeLinecap="round" />
      <path d={`M 470 ${690 - L} Q 540 ${830 - L} 610 ${690 - L}`} fill="none" stroke={C.gold} strokeWidth={11} strokeDasharray="11 5" strokeLinecap="round" />
    </g>
  );
};

export type Layer = "all" | "body" | "arms";

/**
 * layer="body": cuerpo y cabeza · layer="arms": solo los brazos.
 * En el escenario se dibuja cuerpo → escritorio y micrófono → brazos,
 * así los brazos siempre quedan DELANTE, apoyados sobre la mesa.
 */
export const CharacterLayer: React.FC<{ pose: Pose; layer?: Layer }> = ({ pose, layer = "all" }) => {
  const lift = pose.shoulderLift ?? 0;
  const rs: Pt = [R_SHOULDER[0], R_SHOULDER[1] - lift];
  const ls: Pt = [L_SHOULDER[0], L_SHOULDER[1] - lift];
  const tilt = pose.headTilt ?? 0;
  const hy = (pose.headY ?? 0) + lift * 0.6;
  const body = layer !== "arms";
  const arms = layer !== "body";
  return (
    <g>
      {body && (
        <>
          {/* cuello (detrás del polo y la cadena) */}
          <path d={`M 462 ${560 - hy} L 462 ${720 - lift} L 618 ${720 - lift} L 618 ${560 - hy} Z`} fill={C.skinShade} stroke={C.outline} strokeWidth={SW} />
          <Torso lift={lift} />
          <g transform={`translate(0 ${-hy}) rotate(${tilt} 540 600) translate(540 652) scale(1.28) translate(-540 -612)`}>
            <Head face={pose.face} />
          </g>
        </>
      )}
      {arms && (
        <>
          <Arm pose={pose.right} shoulder={rs} />
          <Arm pose={pose.left} shoulder={ls} mirror watch />
        </>
      )}
    </g>
  );
};

/** Personaje completo en un SVG 1080x1080 (para exportar PNG). */
export const Character: React.FC<{ pose: Pose }> = ({ pose }) => (
  <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} xmlns="http://www.w3.org/2000/svg">
    <CharacterLayer pose={pose} />
  </svg>
);
