import React from "react";
import { CharacterLayer } from "../avatar2d/Character";
import { Pose } from "../avatar2d/types";

// Oficina con ventanal al atardecer: cielo naranja-rosa-violeta, sol, mar y ciudad,
// pájaros, estantes con libros y planta, escritorio de madera clara con laptop. Animado con `frame`.
export const W = 1080;
export const H = 1920;
const DESK_BACK = 1495;
const DESK_FRONT = 1650;
const CHAR_Y = 590;

export const StudioSunset: React.FC<{ pose: Pose; frame: number; energia?: number }> = ({ pose, frame, energia = 0 }) => {
  const sunY = 1080 + Math.sin(frame / 120) * 6;
  const waves = Array.from({ length: 6 }).map((_, i) => {
    const y = 1235 + i * 16;
    const off = (frame * (0.6 + i * 0.2)) % 120;
    return <path key={i} d={`M ${-120 + off} ${y} q 30 -6 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`} fill="none" stroke="#FFD1A6" strokeWidth={3} opacity={0.35 - i * 0.04} />;
  });
  const birds = [0, 1, 2].map((i) => {
    const x = ((frame * (1.2 + i * 0.3) + i * 300) % 1300) - 100;
    const y = 900 + i * 40 + Math.sin(frame / 10 + i) * 8;
    const flap = Math.sin(frame / 4 + i) * 6;
    return <path key={i} d={`M ${x - 14} ${y} q 7 ${-8 - flap} 14 0 q 7 ${-8 - flap} 14 0`} fill="none" stroke="#3B1F3A" strokeWidth={4} strokeLinecap="round" />;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A1B4A" />
          <stop offset="45%" stopColor="#8E3B78" />
          <stop offset="75%" stopColor="#FF7A59" />
          <stop offset="100%" stopColor="#FFC46B" />
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="60%" stopColor="#FFC15E" />
          <stop offset="100%" stopColor="#FF9A4D" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0647A" />
          <stop offset="100%" stopColor="#3D1F55" />
        </linearGradient>
        <linearGradient id="wallS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1220" />
          <stop offset="100%" stopColor="#2B1A2A" />
        </linearGradient>
        <linearGradient id="deskS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C98B5A" />
          <stop offset="100%" stopColor="#8A5630" />
        </linearGradient>
        <linearGradient id="deskTopS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B27443" />
          <stop offset="100%" stopColor="#D69A66" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#wallS)" />
      {/* ventanal */}
      <g>
        <rect x={60} y={720} width={960} height={720} rx={28} fill="url(#sky)" />
        <circle cx={540} cy={sunY} r={170} fill="url(#sun)" opacity={0.95 + energia * 0.05} />
        <circle cx={540} cy={sunY} r={95} fill="#FFE29A" />
        {/* ciudad */}
        {Array.from({ length: 16 }).map((_, i) => {
          const h = 60 + ((i * 47) % 150);
          return <rect key={i} x={60 + i * 60} y={1225 - h} width={52} height={h} fill="#3B1F3A" opacity={0.85} />;
        })}
        {Array.from({ length: 30 }).map((_, i) => (
          <rect key={"l" + i} x={72 + ((i * 97) % 920)} y={1110 + ((i * 31) % 100)} width={6} height={8} fill="#FFD27A"
            opacity={(Math.sin(frame / 25 + i * 1.3) + 1) / 2 > 0.35 ? 0.9 : 0.2} />
        ))}
        {/* mar */}
        <rect x={60} y={1225} width={960} height={215} fill="url(#sea)" />
        <rect x={470} y={1225} width={140} height={215} fill="#FFD9A0" opacity={0.25} />
        {waves}
        {birds}
        {/* marco del ventanal */}
        <rect x={60} y={720} width={960} height={720} rx={28} fill="none" stroke="#120B16" strokeWidth={22} />
        <line x1={380} y1={720} x2={380} y2={1440} stroke="#120B16" strokeWidth={14} />
        <line x1={700} y1={720} x2={700} y2={1440} stroke="#120B16" strokeWidth={14} />
      </g>
      {/* luz cálida que entra */}
      <rect width={W} height={H} fill="#FF9A4D" opacity={0.07 + energia * 0.05} />

      {/* planta (izquierda) y estante (derecha) */}
      <g transform="translate(40 1260)">
        <rect x={20} y={150} width={120} height={90} rx={14} fill="#E9E1D3" stroke="#120B16" strokeWidth={6} />
        {[-40, -15, 10, 35, 60].map((a, i) => (
          <ellipse key={i} cx={80 + Math.sin((a * Math.PI) / 180) * 50} cy={110 - Math.cos((a * Math.PI) / 180) * 40} rx={22} ry={60}
            fill={i % 2 ? "#2F8F5B" : "#3FAE6E"} stroke="#120B16" strokeWidth={4} transform={`rotate(${a + Math.sin(frame / 30 + i) * 3} ${80} 150)`} />
        ))}
      </g>
      <g transform="translate(860 1290)">
        <rect x={0} y={120} width={200} height={14} rx={6} fill="#6E4630" />
        {[["#FF8A3D", 24, 90], ["#F5C518", 20, 76], ["#E25D7F", 28, 100], ["#4C6FFF", 22, 80]].map(([c, w, h], i) => (
          <rect key={i} x={14 + i * 32} y={120 - (h as number)} width={w as number} height={h as number} rx={4} fill={c as string} stroke="#120B16" strokeWidth={3} />
        ))}
        <text x={168} y={112} fontSize={60} textAnchor="middle">☕</text>
      </g>

      {/* silla de oficina */}
      <path d="M 300 1180 Q 300 1110 380 1105 L 700 1105 Q 780 1110 780 1180 L 790 1500 L 290 1500 Z" fill="#3A2A33" stroke="#000" strokeWidth={6} />

      <g transform={`translate(0 ${CHAR_Y})`}>
        <CharacterLayer pose={pose} layer="body" />
      </g>

      {/* escritorio de madera clara */}
      <path d={`M 0 ${DESK_BACK} L ${W} ${DESK_BACK} L ${W} ${DESK_FRONT} L 0 ${DESK_FRONT} Z`} fill="url(#deskTopS)" />
      <rect x={0} y={DESK_BACK - 3} width={W} height={6} fill="#7A4A2A" />
      <rect x={0} y={DESK_FRONT} width={W} height={H - DESK_FRONT} fill="url(#deskS)" />
      <rect x={0} y={DESK_FRONT - 4} width={W} height={8} fill="#F2C18D" />
      {/* laptop (derecha) con gráfica */}
      <g transform={`translate(820 ${DESK_BACK - 150})`}>
        <rect x={0} y={0} width={230} height={150} rx={12} fill="#2B2B33" stroke="#000" strokeWidth={6} />
        <rect x={12} y={12} width={206} height={118} rx={6} fill="#151A2E" />
        <polyline points={`24,110 70,90 110,96 150,60 200,30`} fill="none" stroke="#2BD576" strokeWidth={6} strokeLinecap="round" />
        <circle cx={200} cy={30} r={8} fill="#2BD576" opacity={0.5 + 0.5 * Math.sin(frame / 6)} />
        <rect x={-20} y={150} width={270} height={16} rx={6} fill="#3A3A44" stroke="#000" strokeWidth={5} />
      </g>
      {/* taza */}
      <g transform={`translate(26 ${DESK_FRONT - 150}) scale(0.8)`}>
        <path d="M 90 30 q 50 0 50 40 q 0 40 -50 40" fill="none" stroke="#000" strokeWidth={24} />
        <path d="M 90 30 q 50 0 50 40 q 0 40 -50 40" fill="none" stroke="#F5C518" strokeWidth={14} />
        <rect x={0} y={0} width={100} height={130} rx={14} fill="#F5C518" stroke="#000" strokeWidth={6} />
        <rect x={14} y={10} width={16} height={100} rx={8} fill="#FFE27A" />
      </g>
      <g transform={`translate(0 ${CHAR_Y})`}>
        <CharacterLayer pose={pose} layer="arms" />
      </g>
    </svg>
  );
};
