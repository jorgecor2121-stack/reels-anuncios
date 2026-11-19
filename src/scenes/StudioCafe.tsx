import React from "react";
import { CharacterLayer } from "../avatar2d/Character";
import { Pose } from "../avatar2d/types";

// Cafetería: pared de ladrillo, bombillos colgantes que se balancean, letrero de neón "ABIERTO",
// pizarra con el menú, estante con tazas y plantas, mesa de madera con laptop y café humeante.
export const W = 1080;
export const H = 1920;
const DESK_BACK = 1495;
const DESK_FRONT = 1650;
const CHAR_Y = 590;

export const StudioCafe: React.FC<{ pose: Pose; frame: number; energia?: number }> = ({ pose, frame, energia = 0 }) => {
  const neon = 0.75 + 0.25 * Math.sin(frame / 2.7) * Math.sin(frame / 9.1) + energia * 0.2;
  const ladrillos = [];
  for (let r = 0; r < 20; r++) {
    for (let c = 0; c < 9; c++) {
      const x = c * 130 + (r % 2 ? 65 : 0) - 65, y = 640 + r * 52;
      const tone = ["#7A3B2A", "#86432F", "#6E3424", "#8E4B35"][(r * 3 + c * 7) % 4];
      ladrillos.push(<rect key={`${r}-${c}`} x={x} y={y} width={124} height={46} rx={4} fill={tone} />);
    }
  }
  const bombillo = (x: number, largo: number, i: number) => {
    const sw = Math.sin(frame / 25 + i) * 4;
    return (
      <g key={i} transform={`rotate(${sw} ${x} 600)`}>
        <line x1={x} y1={600} x2={x} y2={600 + largo} stroke="#1A120E" strokeWidth={4} />
        <rect x={x - 12} y={600 + largo} width={24} height={20} rx={4} fill="#2A201A" />
        <circle cx={x} cy={600 + largo + 38} r={60} fill="#FFC66B" opacity={0.16 + energia * 0.1} />
        <ellipse cx={x} cy={600 + largo + 36} rx={20} ry={26} fill="#FFE1A3" stroke="#C88A3A" strokeWidth={3} />
      </g>
    );
  };
  const vapor = [0, 1, 2].map((i) => {
    const t = ((frame + i * 20) % 60) / 60;
    return <path key={i} d={`M ${120 + i * 14} ${DESK_FRONT - 160 - t * 80} q 10 -15 0 -30 q -10 -15 0 -30`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.5 * (1 - t)} />;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="deskC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B4426" />
          <stop offset="100%" stopColor="#3A2414" />
        </linearGradient>
        <linearGradient id="deskTopC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A5A34" />
          <stop offset="100%" stopColor="#A9713F" />
        </linearGradient>
        <radialGradient id="calidez" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#FFB86B" stopOpacity={0.25 + energia * 0.1} />
          <stop offset="100%" stopColor="#1A0E08" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#2B1810" />
      {ladrillos}
      {/* letrero de neón */}
      <g opacity={neon}>
        <rect x={640} y={720} width={340} height={120} rx={60} fill="none" stroke="#FF4FA3" strokeWidth={30} opacity={0.25} />
        <rect x={640} y={720} width={340} height={120} rx={60} fill="none" stroke="#FF7CC0" strokeWidth={8} />
        <text x={810} y={800} textAnchor="middle" fontSize={62} fontWeight={900} fill="#FFD6EC" fontFamily="Montserrat, sans-serif">ABIERTO</text>
      </g>
      {/* pizarra con menú */}
      <g transform="translate(60 720)">
        <rect width={300} height={380} rx={14} fill="#1E2420" stroke="#6E4A2A" strokeWidth={14} />
        <text x={150} y={70} textAnchor="middle" fontSize={44} fontWeight={800} fill="#F2EDE2" fontFamily="Montserrat, sans-serif">MENÚ</text>
        {["Café ........ 150", "Latte ....... 220", "Ideas ....... gratis"].map((t, i) => (
          <text key={i} x={30} y={140 + i * 70} fontSize={30} fill="#E8E2D2" fontFamily="Montserrat, sans-serif">{t}</text>
        ))}
        <text x={150} y={350} textAnchor="middle" fontSize={50}>☕</text>
      </g>
      {/* estante con tazas y planta (derecha) */}
      <g transform="translate(760 1170)">
        <rect x={0} y={110} width={300} height={16} rx={6} fill="#4A2E1A" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${20 + i * 70} 56)`}>
            <rect width={50} height={54} rx={8} fill={["#F2EFE6", "#FFD23F", "#FF8A3D"][i]} stroke="#1A120E" strokeWidth={4} />
          </g>
        ))}
        <text x={255} y={106} fontSize={80} textAnchor="middle">🪴</text>
      </g>
      {bombillo(200, 120, 0)}
      {bombillo(540, 60, 1)}
      {bombillo(880, 140, 2)}
      <rect width={W} height={H} fill="url(#calidez)" />

      {/* silla */}
      <path d="M 300 1180 Q 300 1110 380 1105 L 700 1105 Q 780 1110 780 1180 L 790 1500 L 290 1500 Z" fill="#3B2A20" stroke="#000" strokeWidth={6} />
      <g transform={`translate(0 ${CHAR_Y})`}>
        <CharacterLayer pose={pose} layer="body" />
      </g>

      {/* mesa */}
      <path d={`M 0 ${DESK_BACK} L ${W} ${DESK_BACK} L ${W} ${DESK_FRONT} L 0 ${DESK_FRONT} Z`} fill="url(#deskTopC)" />
      <rect x={0} y={DESK_BACK - 3} width={W} height={6} fill="#5A3820" />
      <rect x={0} y={DESK_FRONT} width={W} height={H - DESK_FRONT} fill="url(#deskC)" />
      <rect x={0} y={DESK_FRONT - 4} width={W} height={8} fill="#C9905A" />
      {/* laptop con stickers */}
      <g transform={`translate(820 ${DESK_BACK - 150})`}>
        <rect x={0} y={0} width={230} height={150} rx={12} fill="#C9CCD3" stroke="#000" strokeWidth={6} />
        <circle cx={60} cy={50} r={18} fill="#FF4FA3" />
        <rect x={120} y={70} width={60} height={30} rx={8} fill="#22D3EE" />
        <text x={150} y={130} fontSize={30} textAnchor="middle">⚡</text>
        <rect x={-20} y={150} width={270} height={16} rx={6} fill="#9EA2AA" stroke="#000" strokeWidth={5} />
      </g>
      {/* café humeante */}
      {vapor}
      <g transform={`translate(70 ${DESK_FRONT - 150}) scale(0.8)`}>
        <path d="M 90 30 q 50 0 50 40 q 0 40 -50 40" fill="none" stroke="#000" strokeWidth={24} />
        <path d="M 90 30 q 50 0 50 40 q 0 40 -50 40" fill="none" stroke="#F2EFE6" strokeWidth={14} />
        <rect x={0} y={0} width={100} height={130} rx={14} fill="#F2EFE6" stroke="#000" strokeWidth={6} />
        <rect x={10} y={10} width={80} height={20} rx={6} fill="#6B3A1E" />
      </g>
      <g transform={`translate(0 ${CHAR_Y})`}>
        <CharacterLayer pose={pose} layer="arms" />
      </g>
    </svg>
  );
};
