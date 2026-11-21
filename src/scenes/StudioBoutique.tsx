import React from "react";
import { CharacterLayer } from "../avatar2d/Character";
import { Pose } from "../avatar2d/types";

// Boutique: pared rosa empolvado con paneles, perchero con ropa que se mece, espejo redondo con luces,
// repisa con ropa doblada, mostrador con bolsas de compra, celular grabando y caja registradora.
export const W = 1080;
export const H = 1920;
const DESK_BACK = 1495;
const DESK_FRONT = 1650;
const CHAR_Y = 590;

const PRENDAS = ["#E85D75", "#F2C14E", "#5BC0BE", "#F7F3E9", "#8E7DBE", "#2E2E3A", "#F49D6E"];

export const StudioBoutique: React.FC<{ pose: Pose; frame: number; energia?: number }> = ({ pose, frame, energia = 0 }) => {
  const percha = (x: number, i: number, base: number) => {
    const sw = Math.sin(frame / 30 + i * 0.9) * 3;
    const c = PRENDAS[i % PRENDAS.length];
    return (
      <g key={i} transform={`rotate(${sw} ${x} ${base})`}>
        <path d={`M ${x} ${base} q 0 -14 10 -14 q 10 0 6 10`} fill="none" stroke="#8C7B6B" strokeWidth={4} />
        <path d={`M ${x - 40} ${base + 18} L ${x} ${base} L ${x + 40} ${base + 18}`} fill="none" stroke="#8C7B6B" strokeWidth={5} />
        <path d={`M ${x - 46} ${base + 22} L ${x - 30} ${base + 14} L ${x + 30} ${base + 14} L ${x + 46} ${base + 22} L ${x + 40} ${base + 200} L ${x - 40} ${base + 200} Z`}
          fill={c} stroke="#2B1D1A" strokeWidth={4} strokeLinejoin="round" />
        <path d={`M ${x - 12} ${base + 14} Q ${x} ${base + 34} ${x + 12} ${base + 14}`} fill="none" stroke="#2B1D1A" strokeWidth={3} />
      </g>
    );
  };
  const brilloEspejo = 0.6 + 0.2 * Math.sin(frame / 20) + energia * 0.2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="paredB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E9C9C1" />
          <stop offset="100%" stopColor="#D9A9A0" />
        </linearGradient>
        <linearGradient id="mostrador" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4EFEA" />
          <stop offset="100%" stopColor="#D8CFC6" />
        </linearGradient>
        <radialGradient id="calidezB" cx="50%" cy="55%" r="65%">
          <stop offset="0%" stopColor="#FFE3C2" stopOpacity={0.25 + energia * 0.1} />
          <stop offset="100%" stopColor="#5A2E2A" stopOpacity={0.35} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#paredB)" />
      {/* paneles de pared */}
      {[0, 1, 2].map((i) => <rect key={i} x={40 + i * 340} y={640} width={300} height={760} rx={18} fill="none" stroke="#C98F86" strokeWidth={6} opacity={0.6} />)}
      {/* letrero */}
      <text x={540} y={700} textAnchor="middle" fontSize={64} fontWeight={900} fill="#7A3E48" fontFamily="Georgia, serif" letterSpacing={10}>BOUTIQUE</text>
      {/* espejo redondo con luces (izquierda) */}
      <g transform="translate(180 960)">
        <circle r={150} fill="#F7EFE8" stroke="#C9A05A" strokeWidth={14} />
        <circle r={128} fill="#DDEAF0" opacity={0.85} />
        <path d="M -80 -60 L -20 -110 M -60 -10 L 20 -90" stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.7} />
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(a) * 172} cy={Math.sin(a) * 172} r={12} fill="#FFE9A8" opacity={brilloEspejo} />;
        })}
      </g>
      {/* perchero (derecha) */}
      <g>
        <line x1={640} y1={880} x2={1060} y2={880} stroke="#8C7B6B" strokeWidth={10} strokeLinecap="round" />
        <line x1={660} y1={880} x2={660} y2={1480} stroke="#8C7B6B" strokeWidth={8} />
        <line x1={1040} y1={880} x2={1040} y2={1480} stroke="#8C7B6B" strokeWidth={8} />
        {[700, 770, 840, 910, 980].map((x, i) => percha(x, i + 1, 880))}
      </g>
      {/* repisa con ropa doblada (izquierda abajo) */}
      <g transform="translate(60 1230)">
        <rect x={0} y={110} width={260} height={14} rx={6} fill="#B98B6E" />
        {[0, 1, 2].map((i) => <rect key={i} x={20 + (i % 2) * 8} y={84 - i * 26} width={200} height={26} rx={8} fill={PRENDAS[i + 2]} stroke="#2B1D1A" strokeWidth={3} />)}
      </g>
      <text x={980} y={1320} fontSize={90} textAnchor="middle">🪴</text>
      <rect width={W} height={H} fill="url(#calidezB)" />

      {/* silla */}
      <path d="M 300 1180 Q 300 1110 380 1105 L 700 1105 Q 780 1110 780 1180 L 790 1500 L 290 1500 Z" fill="#7A3E48" stroke="#2B1D1A" strokeWidth={6} />
      <g transform={`translate(0 ${CHAR_Y})`}>
        <CharacterLayer pose={pose} layer="body" />
      </g>

      {/* mostrador */}
      <path d={`M 0 ${DESK_BACK} L ${W} ${DESK_BACK} L ${W} ${DESK_FRONT} L 0 ${DESK_FRONT} Z`} fill="url(#mostrador)" />
      <rect x={0} y={DESK_BACK - 3} width={W} height={6} fill="#C9A05A" />
      <rect x={0} y={DESK_FRONT} width={W} height={H - DESK_FRONT} fill="#E3D6CB" />
      <rect x={0} y={DESK_FRONT - 4} width={W} height={8} fill="#C9A05A" />
      {/* bolsas de compra */}
      <g transform={`translate(70 ${DESK_BACK - 190})`}>
        <rect x={0} y={40} width={130} height={150} rx={8} fill="#E85D75" stroke="#2B1D1A" strokeWidth={5} />
        <path d="M 35 40 Q 35 0 65 0 Q 95 0 95 40" fill="none" stroke="#2B1D1A" strokeWidth={6} />
        <rect x={100} y={70} width={110} height={120} rx={8} fill="#F2C14E" stroke="#2B1D1A" strokeWidth={5} />
        <path d="M 128 70 Q 128 36 155 36 Q 182 36 182 70" fill="none" stroke="#2B1D1A" strokeWidth={6} />
      </g>
      {/* celular en trípode grabando */}
      <g transform={`translate(860 ${DESK_BACK - 210})`}>
        <line x1={60} y1={150} x2={20} y2={210} stroke="#333" strokeWidth={6} />
        <line x1={60} y1={150} x2={100} y2={210} stroke="#333" strokeWidth={6} />
        <rect x={20} y={0} width={80} height={150} rx={14} fill="#1B1B22" stroke="#000" strokeWidth={5} />
        <circle cx={60} cy={20} r={7} fill={Math.sin(frame / 8) > 0 ? "#FF3B4E" : "#5A1A20"} />
      </g>
      <g transform={`translate(0 ${CHAR_Y})`}>
        <CharacterLayer pose={pose} layer="arms" />
      </g>
    </svg>
  );
};
