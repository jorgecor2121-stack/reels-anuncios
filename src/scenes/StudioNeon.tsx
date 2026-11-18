import React from "react";
import { CharacterLayer } from "../avatar2d/Character";
import { Pose } from "../avatar2d/types";

// Estudio "neón": pared oscura violeta, marco de neón violeta→cian detrás del personaje,
// estantería con libros y planta, ventana con ciudad de noche, luces bokeh que flotan,
// escritorio con borde cian. Animado con `frame`.
export const W = 1080;
export const H = 1920;
const DESK_BACK = 1495;
const DESK_FRONT = 1650;
const CHAR_Y = 590;

export const StudioNeon: React.FC<{ pose: Pose; frame: number; energia?: number }> = ({ pose, frame, energia = 0 }) => {
  const flicker = 0.85 + 0.15 * Math.sin(frame / 3.1) * Math.sin(frame / 7.7) + energia * 0.4;
  const bokeh = Array.from({ length: 18 }).map((_, i) => {
    const x = (i * 197) % W;
    const y = 700 + ((i * 131 + frame * (0.6 + (i % 4) * 0.25)) % 800);
    const r = 10 + (i % 5) * 7;
    const c = i % 3 === 0 ? "#22D3EE" : i % 3 === 1 ? "#A855F7" : "#FF8A3D";
    return <circle key={i} cx={x} cy={1500 - (y - 700)} r={r} fill={c} opacity={0.12 + (i % 4) * 0.05} />;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#07060F" />
          <stop offset="60%" stopColor="#15102B" />
          <stop offset="100%" stopColor="#1C1238" />
        </linearGradient>
        <linearGradient id="neon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.55 + energia * 0.3} />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="deskTopN" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141127" />
          <stop offset="100%" stopColor="#221B3F" />
        </linearGradient>
        <linearGradient id="deskN" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E1838" />
          <stop offset="100%" stopColor="#0B0918" />
        </linearGradient>
        <linearGradient id="city" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1030" />
          <stop offset="100%" stopColor="#1B1446" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#wall)" />
      {/* paneles acústicos en la pared */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={20 + i * 180} y={760} width={160} height={700} rx={14} fill="#120E24" opacity={0.7} />
      ))}
      {bokeh}

      {/* ventana con ciudad (izquierda) */}
      <g transform="translate(40 860)">
        <rect width={250} height={330} rx={16} fill="url(#city)" stroke="#2A2350" strokeWidth={10} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={14 + i * 39} y={330 - (90 + ((i * 53) % 140))} width={32} height={90 + ((i * 53) % 140)} fill="#0A0820" />
        ))}
        {Array.from({ length: 22 }).map((_, i) => (
          <rect key={"w" + i} x={20 + ((i * 37) % 210)} y={170 + ((i * 29) % 140)} width={6} height={8}
            fill="#FFD27A" opacity={(Math.sin(frame / 20 + i) + 1) / 2 > 0.3 ? 0.9 : 0.15} />
        ))}
        <line x1={125} y1={0} x2={125} y2={330} stroke="#2A2350" strokeWidth={8} />
        <line x1={0} y1={165} x2={250} y2={165} stroke="#2A2350" strokeWidth={8} />
      </g>

      {/* estantería (derecha) con libros, trofeo y planta */}
      <g transform="translate(800 880)">
        <rect x={0} y={120} width={250} height={14} rx={6} fill="#2E2557" />
        <rect x={0} y={290} width={250} height={14} rx={6} fill="#2E2557" />
        {[["#A855F7", 26, 90], ["#22D3EE", 22, 76], ["#FF8A3D", 30, 100], ["#F5C518", 20, 70]].map(([c, w, h], i) => (
          <rect key={i} x={20 + i * 34} y={120 - (h as number)} width={w as number} height={h as number} rx={4} fill={c as string} opacity={0.85} />
        ))}
        <text x={190} y={110} fontSize={70} textAnchor="middle">🏆</text>
        <text x={60} y={285} fontSize={90} textAnchor="middle">🪴</text>
        <rect x={130} y={215} width={100} height={75} rx={8} fill="#0F0C20" stroke="#22D3EE" strokeWidth={4} />
        <polyline points="140,275 165,255 185,265 220,228" fill="none" stroke="#22D3EE" strokeWidth={5} />
      </g>

      {/* halo + marco de neón detrás del personaje */}
      <rect width={W} height={H} fill="url(#halo)" />
      <rect x={250} y={760} width={580} height={620} rx={60} fill="none" stroke="url(#neon)" strokeWidth={14} opacity={0.9 * flicker} />
      <rect x={250} y={760} width={580} height={620} rx={60} fill="none" stroke="url(#neon)" strokeWidth={46} opacity={0.18 * flicker} />

      {/* silla */}
      <path d="M 300 1180 Q 300 1110 380 1105 L 700 1105 Q 780 1110 780 1180 L 790 1500 L 290 1500 Z" fill="#17142A" stroke="#000" strokeWidth={6} />
      <path d="M 330 1190 L 330 1480 M 750 1190 L 750 1480" stroke="#A855F7" strokeWidth={6} opacity={0.7} />

      <g transform={`translate(0 ${CHAR_Y})`}>
        <CharacterLayer pose={pose} layer="body" />
      </g>

      {/* mesa */}
      <path d={`M 0 ${DESK_BACK} L ${W} ${DESK_BACK} L ${W} ${DESK_FRONT} L 0 ${DESK_FRONT} Z`} fill="url(#deskTopN)" />
      <rect x={0} y={DESK_BACK - 3} width={W} height={6} fill="#3B2F70" />
      <rect x={0} y={DESK_FRONT} width={W} height={H - DESK_FRONT} fill="url(#deskN)" />
      <rect x={0} y={DESK_FRONT - 4} width={W} height={10} fill="#22D3EE" opacity={0.9} />
      <rect x={0} y={DESK_FRONT + 6} width={W} height={30} fill="#22D3EE" opacity={0.22} />

      {/* micrófono */}
      <g>
        <path d="M 1090 1000 L 1000 1060 L 930 1150" fill="none" stroke="#000" strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 1090 1000 L 1000 1060 L 930 1150" fill="none" stroke="#2A2540" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={1000} cy={1060} r={18} fill="#3A3360" stroke="#000" strokeWidth={6} />
        <g transform="translate(925 1150) rotate(55) scale(0.8)">
          <rect x={-50} y={0} width={100} height={200} rx={46} fill="#141221" stroke="#000" strokeWidth={6} />
          <rect x={-44} y={170} width={88} height={22} rx={10} fill="#22D3EE" opacity={0.9} />
          {[40, 70, 100].map((y) => <line key={y} x1={-32} y1={y} x2={32} y2={y} stroke="#2E2A45" strokeWidth={5} />)}
        </g>
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
