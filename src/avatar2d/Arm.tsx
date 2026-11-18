import React from "react";
import { C, SW } from "./colors";
import { Hand } from "./Hand";
import { useOutfit } from "./outfit";
import { ArmPose, Pt } from "./types";

/**
 * Brazo estilo caricatura ("rubber hose"): una sola pieza curva que sale del hombro,
 * SIN codo marcado. El punto `elbow` de la pose solo sirve como control de la curva.
 */
const ARM_W = 104;
const SLEEVE_W = ARM_W + 34;
const SLEEVE_T = 0.3; // fracción del brazo cubierta por la manga

export const armAngle = (a: Pt, b: Pt) => (Math.atan2(b[0] - a[0], -(b[1] - a[1])) * 180) / Math.PI;

const lerpPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Punto y dirección sobre la curva cuadrática s → (c) → w */
const onCurve = (s: Pt, c: Pt, w: Pt, t: number) => {
  const a = lerpPt(s, c, t);
  const b = lerpPt(c, w, t);
  return { p: lerpPt(a, b, t), a, b };
};

export const Arm: React.FC<{ pose: ArmPose; shoulder: Pt; mirror?: boolean; watch?: boolean }> = ({ pose, shoulder, mirror, watch }) => {
  const s = pose.shoulder ?? shoulder;
  const { elbow: c, wrist: w } = pose;
  const d = `M ${s[0]} ${s[1]} Q ${c[0]} ${c[1]} ${w[0]} ${w[1]}`;

  // manga = primer tramo de la misma curva
  const sl = onCurve(s, c, w, SLEEVE_T);
  const sleeveD = `M ${s[0]} ${s[1]} Q ${sl.a[0]} ${sl.a[1]} ${sl.p[0]} ${sl.p[1]}`;
  const sleeveAng = armAngle(sl.a, sl.b);

  const end = onCurve(s, c, w, 0.98);
  const handAng = pose.handAngle ?? armAngle(end.a, end.b);
  const o = useOutfit();
  const wt = onCurve(s, c, w, 0.86);

  return (
    <g>
      {/* brazo: contorno + piel, una sola curva */}
      <path d={d} fill="none" stroke={C.outline} strokeWidth={ARM_W + SW * 2} strokeLinecap="round" />
      <path d={d} fill="none" stroke={C.skin} strokeWidth={ARM_W} strokeLinecap="round" />
      {/* manga del polo */}
      <circle cx={s[0]} cy={s[1]} r={SLEEVE_W / 2 + SW} fill={C.outline} />
      <path d={sleeveD} fill="none" stroke={C.outline} strokeWidth={SLEEVE_W + SW * 2} strokeLinecap="butt" />
      <circle cx={s[0]} cy={s[1]} r={SLEEVE_W / 2} fill={o.shirt} />
      <path d={sleeveD} fill="none" stroke={o.shirt} strokeWidth={SLEEVE_W} strokeLinecap="butt" />
      <g transform={`translate(${sl.p[0]} ${sl.p[1]}) rotate(${sleeveAng})`}>
        <line x1={-SLEEVE_W / 2 + 6} y1={-14} x2={SLEEVE_W / 2 - 6} y2={-14} stroke={o.tipo === "blazer" ? o.inner : o.shirtLine} strokeWidth={o.tipo === "blazer" ? 8 : 4} />
      </g>
      <Hand x={w[0]} y={w[1]} angle={handAng} type={pose.hand} mirror={mirror} scale={pose.handScale} />
      {watch && (
        <g transform={`translate(${wt.p[0]} ${wt.p[1]}) rotate(${armAngle(wt.a, wt.b)})`}>
          <rect x={-ARM_W / 2 - 3} y={-14} width={ARM_W + 6} height={28} rx={8} fill={C.watch} stroke={C.outline} strokeWidth={4} />
          <circle cx={0} cy={0} r={22} fill={C.watch} stroke="#000" strokeWidth={4} />
          <circle cx={0} cy={0} r={15} fill="#2A2A2A" stroke="#555" strokeWidth={2} />
          <line x1={0} y1={0} x2={0} y2={-10} stroke="#DDD" strokeWidth={2.5} />
          <line x1={0} y1={0} x2={7} y2={3} stroke="#DDD" strokeWidth={2.5} />
        </g>
      )}
    </g>
  );
};
