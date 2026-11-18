import React from "react";
import { CharacterLayer } from "../avatar2d/Character";
import { Pose } from "../avatar2d/types";

export const W = 1080;
export const H = 1920;
const DESK_BACK = 1495; // borde de atrás de la mesa (pecho del personaje)
const DESK_FRONT = 1650; // borde de adelante, iluminado
const CHAR_Y = 590; // desplazamiento vertical del personaje dentro del reel

/** Escenario de podcast + personaje, todo en un SVG 1080x1920. */
export const Studio: React.FC<{ pose: Pose; glow?: number }> = ({ pose, glow = 1 }) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glow" cx="50%" cy="58%" r="55%">
        <stop offset="0%" stopColor="#FF8A1F" stopOpacity={0.95 * glow} />
        <stop offset="45%" stopColor="#B04A05" stopOpacity={0.7 * glow} />
        <stop offset="100%" stopColor="#0A0503" stopOpacity={1} />
      </radialGradient>
      <linearGradient id="deskTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2A170D" />
        <stop offset="100%" stopColor="#4A2C1A" />
      </linearGradient>
      <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5A3420" />
        <stop offset="100%" stopColor="#2A160C" />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="#0A0503" />
    <rect width={W} height={H} fill="url(#glow)" />
    {/* línea de luz del fondo */}
    <rect x={0} y={1150} width={W} height={10} fill="#FF8A1F" opacity={0.85} />
    <rect x={0} y={1140} width={W} height={30} fill="#FF8A1F" opacity={0.18} />
    {/* silla gamer */}
    <path d="M 300 1180 Q 300 1110 380 1105 L 700 1105 Q 780 1110 780 1180 L 790 1500 L 290 1500 Z" fill="#1B1B1E" stroke="#000" strokeWidth={6} />
    <path d="M 330 1190 L 330 1480 M 750 1190 L 750 1480" stroke="#FF8A1F" strokeWidth={6} opacity={0.6} />

    {/* 1) cuerpo y cabeza */}
    <g transform={`translate(0 ${CHAR_Y})`}>
      <CharacterLayer pose={pose} layer="body" />
    </g>

    {/* 2) MESA vista desde arriba: superficie a la altura del pecho, borde frontal iluminado */}
    <path d={`M 0 ${DESK_BACK} L ${W} ${DESK_BACK} L ${W} ${DESK_FRONT} L 0 ${DESK_FRONT} Z`} fill="url(#deskTop)" />
    <rect x={0} y={DESK_BACK - 3} width={W} height={6} fill="#6B3E22" />
    <rect x={0} y={DESK_FRONT} width={W} height={H - DESK_FRONT} fill="url(#desk)" />
    <rect x={0} y={DESK_FRONT - 4} width={W} height={10} fill="#FFB05A" />
    <rect x={0} y={DESK_FRONT + 6} width={W} height={26} fill="#FF8A1F" opacity={0.3} />
    {/* micrófono con brazo articulado (a la derecha de la cara) */}
    <g>
      <path d="M 1090 1000 L 1000 1060 L 930 1150" fill="none" stroke="#000" strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 1090 1000 L 1000 1060 L 930 1150" fill="none" stroke="#262626" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={1000} cy={1060} r={18} fill="#333" stroke="#000" strokeWidth={6} />
      <g transform="translate(925 1150) rotate(55) scale(0.8)">
        <rect x={-50} y={0} width={100} height={200} rx={46} fill="#151515" stroke="#000" strokeWidth={6} />
        <rect x={-44} y={170} width={88} height={22} rx={10} fill="#FF8A1F" opacity={0.9} />
        {[40, 70, 100].map((y) => (
          <line key={y} x1={-32} y1={y} x2={32} y2={y} stroke="#2E2E2E" strokeWidth={5} />
        ))}
      </g>
    </g>
    {/* taza amarilla sobre la mesa */}
    <g transform={`translate(26 ${DESK_FRONT - 150}) scale(0.8)`}>
      <path d="M 90 30 q 50 0 50 40 q 0 40 -50 40" fill="none" stroke="#000" strokeWidth={24} />
      <path d="M 90 30 q 50 0 50 40 q 0 40 -50 40" fill="none" stroke="#F5C518" strokeWidth={14} />
      <rect x={0} y={0} width={100} height={130} rx={14} fill="#F5C518" stroke="#000" strokeWidth={6} />
      <rect x={14} y={10} width={16} height={100} rx={8} fill="#FFE27A" />
    </g>
    {/* 3) brazos SIEMPRE delante: sobre la mesa y por delante del micrófono */}
    <g transform={`translate(0 ${CHAR_Y})`}>
      <CharacterLayer pose={pose} layer="arms" />
    </g>
  </svg>
);
