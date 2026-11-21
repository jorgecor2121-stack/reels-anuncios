import React from "react";
import { CharacterLayer } from "../avatar2d/Character";
import { Pose } from "../avatar2d/types";

// Escenario de presentador, de pie: fondo azul tecnológico con cuadrícula, pantalla LED con gráficas,
// reflectores que barren, piso iluminado. Sin silla ni escritorio: el personaje está parado (jeans + correa).
export const W = 1080;
export const H = 1920;
const CHAR_Y = 400;

export const StudioEscenario: React.FC<{ pose: Pose; frame: number; energia?: number }> = ({ pose, frame, energia = 0 }) => {
  const barra = (i: number) => 60 + Math.abs(Math.sin(frame / 22 + i)) * 140;
  const haz = (x: number, i: number) => {
    const a = Math.sin(frame / 45 + i * 2) * 14;
    return <polygon key={i} points={`${x - 20},560 ${x + 20},560 ${x + 240},1900 ${x - 240},1900`} fill="#7DB7FF" opacity={0.07 + energia * 0.05} transform={`rotate(${a} ${x} 560)`} />;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fondoE" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1A4A" />
          <stop offset="100%" stopColor="#060B22" />
        </linearGradient>
        <radialGradient id="pisoE" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#060B22" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#fondoE)" />
      {/* cuadrícula */}
      {Array.from({ length: 12 }).map((_, i) => <line key={`v${i}`} x1={i * 100} y1={560} x2={i * 100} y2={1720} stroke="#2D5BD8" strokeWidth={2} opacity={0.25} />)}
      {Array.from({ length: 12 }).map((_, i) => <line key={`h${i}`} x1={0} y1={600 + i * 100} x2={W} y2={600 + i * 100} stroke="#2D5BD8" strokeWidth={2} opacity={0.25} />)}
      {/* pantalla LED con gráfica de barras y una línea que sube */}
      <g transform="translate(110 760)">
        <rect width={860} height={520} rx={26} fill="#0A1230" stroke="#3B82F6" strokeWidth={6} />
        <rect x={10} y={10} width={840} height={500} rx={20} fill="none" stroke="#7DB7FF" strokeWidth={2} opacity={0.4} />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={50 + i * 100} y={470 - barra(i)} width={56} height={barra(i)} rx={8} fill={i % 3 === 0 ? "#22D3EE" : "#3B82F6"} opacity={0.75} />
        ))}
        <polyline points={Array.from({ length: 9 }).map((_, i) => `${40 + i * 100},${380 - i * 30 - Math.sin(frame / 15 + i) * 12}`).join(" ")} fill="none" stroke="#FFD23F" strokeWidth={6} strokeLinecap="round" />
      </g>
      {/* piso iluminado */}
      <rect x={0} y={1700} width={W} height={220} fill="#081236" />
      <ellipse cx={540} cy={1705} rx={620} ry={60} fill="url(#pisoE)" />
      <line x1={0} y1={1700} x2={W} y2={1700} stroke="#3B82F6" strokeWidth={4} opacity={0.6} />
      {[120, 540, 960].map((x, i) => haz(x, i))}
      {/* reflectores colgando */}
      {[200, 540, 880].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={560} x2={x} y2={620} stroke="#1A2350" strokeWidth={6} />
          <rect x={x - 30} y={610} width={60} height={40} rx={8} fill="#1A2350" stroke="#3B82F6" strokeWidth={3} />
          <circle cx={x} cy={652} r={12} fill="#CFE3FF" opacity={0.8 + 0.2 * Math.sin(frame / 10 + i)} />
        </g>
      ))}
      {/* sombra en el piso */}
      <ellipse cx={540} cy={1900} rx={300} ry={30} fill="#000" opacity={0.35} />
      {/* jeans y correa (de pie) */}
      <g transform={`translate(0 ${CHAR_Y})`}>
        <path d="M 272 1060 L 808 1060 L 820 1400 L 560 1400 L 540 1200 L 520 1400 L 260 1400 Z" fill="#2C3E66" stroke="#1A1410" strokeWidth={6} strokeLinejoin="round" />
        <rect x={268} y={1060} width={544} height={34} rx={8} fill="#3A2A20" stroke="#1A1410" strokeWidth={5} />
        <rect x={515} y={1062} width={50} height={30} rx={5} fill="#C9A05A" stroke="#6B4E1E" strokeWidth={3} />
        <path d="M 330 1110 Q 360 1200 350 1300 M 750 1110 Q 720 1200 730 1300" fill="none" stroke="#3E5583" strokeWidth={5} />
      </g>
      <g transform={`translate(0 ${CHAR_Y})`}>
        <CharacterLayer pose={pose} layer="body" />
      </g>
      <g transform={`translate(0 ${CHAR_Y})`}>
        <CharacterLayer pose={pose} layer="arms" />
      </g>
    </svg>
  );
};
