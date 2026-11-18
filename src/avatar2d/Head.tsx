import React from "react";
import { C, SW } from "./colors";
import { Brows, Eyes, Face, Mouth } from "./types";

// Coordenadas internas de la cabeza (se escala en Character.tsx)
const EYE_L = 488; // ojo derecho del personaje (izquierda en pantalla)
const EYE_R = 592;
const EYE_Y = 388;
const MX = 540;
const MY = 516;

const ol = { stroke: C.outline, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const Eye: React.FC<{ cx: number; type: Eyes; side: -1 | 1 }> = ({ cx, type, side }) => {
  const cy = EYE_Y;
  if (type === "closed" || (type === "wink" && side === 1)) {
    return <path d={`M ${cx - 20} ${cy + 2} Q ${cx} ${cy + 12} ${cx + 20} ${cy + 2}`} fill="none" stroke={C.pupil} strokeWidth={6} strokeLinecap="round" />;
  }
  if (type === "happy") {
    return <path d={`M ${cx - 20} ${cy + 6} Q ${cx} ${cy - 14} ${cx + 20} ${cy + 6}`} fill="none" stroke={C.pupil} strokeWidth={6} strokeLinecap="round" />;
  }
  const k = type === "wide" ? 1.15 : 1; // sorpresa: mismo ojo, un poco más grande
  const [lx, ly] = type === "up" ? [side * 2 + 3, -7] : type === "side" ? [6, 0] : [0, 0];
  // Ojo como en tu avatar: óvalo negro grande con brillo y línea de pestañas
  return (
    <g>
      <g transform={`translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`}>
        <ellipse cx={cx - 2} cy={cy} rx={22} ry={25} fill={C.eyeWhite} />
        <ellipse cx={cx + lx + 1} cy={cy + ly} rx={18} ry={22} fill={C.pupil} />
        <circle cx={cx + lx + 7} cy={cy + ly - 8} r={6.5} fill="#FFF" />
        <circle cx={cx + lx - 5} cy={cy + ly + 8} r={2.8} fill="#FFF" opacity={0.85} />
        <path d={`M ${cx - 24} ${cy - 10} Q ${cx} ${cy - 31} ${cx + 24} ${cy - 13}`} fill="none" stroke={C.pupil} strokeWidth={4.5} strokeLinecap="round" />
      </g>
    </g>
  );
};

const Brow: React.FC<{ cx: number; side: -1 | 1; type: Brows }> = ({ cx, side, type }) => {
  let dyIn = 0;
  let dyOut = 0;
  if (type === "raised") (dyIn = -12), (dyOut = -10);
  if (type === "confident") (dyIn = 5), (dyOut = -2);
  if (type === "worried") (dyIn = -12), (dyOut = 5);
  if (type === "doubt") side === -1 ? ((dyIn = -16), (dyOut = -18)) : ((dyIn = 6), (dyOut = 2));
  const inner = cx - side * 26;
  const outer = cx + side * 38;
  const y = 340;
  const mid = (dyIn + dyOut) / 2;
  // ceja gruesa y recta: ancha por dentro, más fina por fuera
  return (
    <path
      d={`M ${inner} ${y + dyIn + 9} L ${inner} ${y + dyIn - 8} Q ${cx} ${y - 14 + mid} ${outer} ${y + dyOut - 3} L ${outer} ${y + dyOut + 4} Q ${cx} ${y - 1 + mid} ${inner} ${y + dyIn + 9} Z`}
      fill={C.hair}
      stroke={C.hair}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  );
};

const MouthShape: React.FC<{ type: Mouth }> = ({ type }) => {
  const x = MX;
  const y = MY;
  switch (type) {
    case "smile": // sonrisa de tu avatar: dientes asomando
      return (
        <g>
          <path d={`M ${x - 38} ${y - 6} Q ${x} ${y - 2} ${x + 38} ${y - 8} Q ${x + 6} ${y + 22} ${x - 38} ${y - 6} Z`} fill={C.teeth} {...ol} />
          <path d={`M ${x - 26} ${y + 10} Q ${x} ${y + 24} ${x + 24} ${y + 9}`} fill="none" stroke={C.lip} strokeWidth={5} strokeLinecap="round" />
        </g>
      );
    case "grin":
      return <path d={`M ${x - 42} ${y - 8} Q ${x} ${y - 2} ${x + 42} ${y - 8} Q ${x} ${y + 32} ${x - 42} ${y - 8} Z`} fill={C.teeth} {...ol} />;
    case "M":
      return (
        <>
          <path d={`M ${x - 30} ${y} Q ${x} ${y + 8} ${x + 30} ${y}`} fill="none" stroke={C.lip} strokeWidth={12} strokeLinecap="round" />
          <path d={`M ${x - 30} ${y} Q ${x} ${y + 8} ${x + 30} ${y}`} fill="none" stroke={C.outline} strokeWidth={4} strokeLinecap="round" />
        </>
      );
    case "flat":
      return <path d={`M ${x - 28} ${y + 2} Q ${x} ${y + 6} ${x + 28} ${y + 2}`} fill="none" stroke={C.lip} strokeWidth={7} strokeLinecap="round" />;
    case "O":
    case "surprise":
    case "shh": {
      const [rx, ry] = type === "O" ? [18, 24] : type === "surprise" ? [22, 30] : [10, 8];
      return (
        <g>
          <ellipse cx={x} cy={y + 8} rx={rx + 5} ry={ry + 5} fill={C.lip} stroke={C.outline} strokeWidth={4} />
          <ellipse cx={x} cy={y + 8} rx={rx} ry={ry} fill={C.mouth} />
          {type !== "shh" && <ellipse cx={x} cy={y + 8 + ry * 0.55} rx={rx * 0.6} ry={ry * 0.3} fill={C.tongue} />}
        </g>
      );
    }
    case "E":
      return (
        <g>
          <path d={`M ${x - 42} ${y - 6} Q ${x} ${y - 12} ${x + 42} ${y - 6} Q ${x + 38} ${y + 24} ${x} ${y + 26} Q ${x - 38} ${y + 24} ${x - 42} ${y - 6} Z`} fill={C.mouth} {...ol} />
          <path d={`M ${x - 36} ${y - 5} Q ${x} ${y - 10} ${x + 36} ${y - 5} L ${x + 34} ${y + 8} Q ${x} ${y + 4} ${x - 34} ${y + 8} Z`} fill={C.teeth} />
          <path d={`M ${x - 28} ${y + 20} Q ${x} ${y + 11} ${x + 28} ${y + 20} Q ${x} ${y + 24} ${x - 28} ${y + 20} Z`} fill={C.teeth} />
        </g>
      );
    case "A":
    case "bigSmile":
    case "laugh": {
      const h = type === "A" ? 46 : type === "bigSmile" ? 38 : 52;
      const w = type === "A" ? 30 : 44;
      const top = -8;
      return (
        <g>
          <path
            d={`M ${x - w} ${y + top} Q ${x} ${y + top - 6} ${x + w} ${y + top} Q ${x + w - 4} ${y + h} ${x} ${y + h + 2} Q ${x - w + 4} ${y + h} ${x - w} ${y + top} Z`}
            fill={C.mouth}
            {...ol}
          />
          <path d={`M ${x - w + 5} ${y + top + 1} Q ${x} ${y + top - 4} ${x + w - 5} ${y + top + 1} L ${x + w - 7} ${y + top + 12} Q ${x} ${y + top + 8} ${x - w + 7} ${y + top + 12} Z`} fill={C.teeth} />
          <ellipse cx={x} cy={y + h - 10} rx={w * 0.55} ry={9} fill={C.tongue} />
        </g>
      );
    }
  }
};

// ---------- PELO: rizos cortos con volumen arriba + fade a los lados ----------
const hash = (n: number) => {
  const v = Math.sin(n * 91.7 + 13.1) * 43758.5453;
  return v - Math.floor(v);
};

const hairPath = () => {
  // Masa ancha de rizos: frente recta, costados que bajan hasta la sien
  const cx = 540;
  const cy = 266;
  const rx = 146;
  const ry = 106;
  const n = 30;
  let d = `M 410 284 L 401 ${cy - 6}`;
  for (let i = 1; i <= n; i++) {
    const a = Math.PI * (1.04 + (i / n) * 0.92);
    const jitter = 1 + (hash(i) - 0.5) * 0.08;
    const x = cx + Math.cos(a) * rx * jitter;
    const y = cy + Math.sin(a) * ry * jitter;
    const r = 8 + hash(i + 50) * 7;
    d += ` A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  d += ` L 679 ${cy - 6} L 670 284 L 652 282 Q 650 270 634 268 L 446 268 Q 430 270 428 282 Z`;
  return d;
};

const curlMarks = (() => {
  const m: [number, number, number][] = [];
  let k = 0;
  for (let y = 176; y <= 262; y += 13) {
    for (let x = 410; x <= 670; x += 17) {
      const xx = x + (hash(k) - 0.5) * 10 + (((y - 176) / 13) % 2) * 8;
      const yy = y + (hash(k + 99) - 0.5) * 7;
      k++;
      if (Math.pow((xx - 540) / 134, 2) + Math.pow((yy - 268) / 98, 2) < 0.9 && yy < 262) m.push([xx, yy, hash(k)]);
    }
  }
  return m;
})();

const Hair: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="fadeSide" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E1714" stopOpacity={0.95} />
        <stop offset="35%" stopColor="#4A342A" stopOpacity={0.7} />
        <stop offset="75%" stopColor="#9A6A4E" stopOpacity={0.25} />
        <stop offset="100%" stopColor={C.skin} stopOpacity={0} />
      </linearGradient>
    </defs>
    {/* fade: desde el pelo hasta la mitad de la oreja */}
    <path d="M 408 278 L 434 278 L 434 420 L 408 424 Z" fill="url(#fadeSide)" />
    <path d="M 672 278 L 646 278 L 646 420 L 672 424 Z" fill="url(#fadeSide)" />
    {/* masa de rizos */}
    <path d={hairPath()} fill={C.hair} stroke={C.outline} strokeWidth={SW} strokeLinejoin="round" />
    {curlMarks.map(([x, y, r], i) => (
      <path
        key={i}
        d={`M ${x - 5} ${y + 3} q -2 -8 5 -8 q 7 0 5 7`}
        transform={`rotate(${r * 80 - 40} ${x} ${y})`}
        fill="none"
        stroke={C.hairLight}
        strokeWidth={3}
        strokeLinecap="round"
      />
    ))}
  </g>
);

export const Head: React.FC<{ face: Face }> = ({ face }) => {
  const { eyes, brows, mouth } = face;
  return (
    <g>
      {/* orejas */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={540 + s * 136} cy={404} rx={22} ry={38} fill={C.skin} stroke={C.outline} strokeWidth={SW} />
          <path d={`M ${540 + s * 140} ${388} q ${s * 8} 16 0 32`} fill="none" stroke={C.skinShade} strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      {/* cara: ancha, mandíbula cuadrada */}
      <path d="M 408 300 Q 408 232 540 228 Q 672 232 672 300 L 672 420 Q 668 522 620 570 Q 584 600 540 602 Q 496 600 460 570 Q 412 522 408 420 Z" fill={C.skin} stroke={C.outline} strokeWidth={SW} />
      <Hair />
      {/* barba recortada: patillas, mandíbula y perilla; mejillas libres */}
      <path
        d="M 408 424 L 422 424 L 424 468 Q 432 506 466 518 L 488 502 Q 514 478 540 482 Q 566 478 592 500 L 614 518 Q 648 506 656 468 L 658 424 L 672 424 Q 670 532 622 584 Q 586 616 540 618 Q 494 616 458 584 Q 410 532 408 420 Z"
        fill={C.hair}
        stroke={C.outline}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* bigote */}
      <path d="M 484 500 Q 510 476 540 486 Q 570 476 596 500 Q 570 492 540 496 Q 510 492 484 500 Z" fill={C.hair} stroke={C.hair} strokeWidth={3} />
      {/* piel bajo el labio + perilla */}
      <path d="M 520 548 Q 540 542 560 548 L 553 570 Q 540 576 527 570 Z" fill={C.skin} />
      <path d="M 531 558 L 549 558 L 540 578 Z" fill={C.hair} />
      {/* nariz */}
      <path d="M 552 404 Q 562 436 556 452" fill="none" stroke={C.skinShade} strokeWidth={5} strokeLinecap="round" />
      <path d="M 522 458 Q 540 468 558 458" fill="none" stroke={C.skinShade} strokeWidth={5} strokeLinecap="round" />
      <Eye cx={EYE_L} type={eyes} side={-1} />
      <Eye cx={EYE_R} type={eyes} side={1} />
      <Brow cx={EYE_L} side={-1} type={brows} />
      <Brow cx={EYE_R} side={1} type={brows} />
      <MouthShape type={mouth} />
    </g>
  );
};
