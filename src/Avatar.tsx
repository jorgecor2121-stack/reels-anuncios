// Avatar de caricatura de Almonte: pelo corto rizado con lados degradados, barba cerrada,
// polo negro, cadena dorada y reloj. Sentado en un escritorio con micrófono de pódcast.
// `mouth` (0..1) abre la boca; `talk` (0..1) mueve la cabeza; parpadea solo.
import { interpolate, useCurrentFrame } from "remotion";

const SKIN = "#C98B5F";
const SKIN_DARK = "#A86F48";
const HAIR = "#17110D";
const FADE = "#3A2E28";
const BEARD = "#1B140F";
const POLO = "#15151C";
const GOLD = "#E8B64A";

export const Avatar: React.FC<{ mouth: number; talk: number; width: number }> = ({ mouth, talk, width }) => {
  const f = useCurrentFrame();
  // Parpadeo cada ~3.3 s (dura 5 frames)
  const b = f % 100;
  const blink = b < 5 ? interpolate(b, [0, 2, 5], [1, 0.08, 1]) : 1;
  // Movimiento de cabeza: respiración + énfasis al hablar
  const tilt = Math.sin(f / 22) * 2 + talk * Math.sin(f / 4) * 2.5;
  const bob = Math.sin(f / 18) * 3 - talk * 4;
  const brow = -talk * 6 - (Math.sin(f / 37) > 0.92 ? 5 : 0);
  const m = Math.max(0, Math.min(1, mouth));
  const mouthH = 4 + m * 30;
  const mouthW = 44 + m * 10;
  const arm = Math.sin(f / 9) * talk * 6; // la mano derecha gesticula al hablar

  return (
    <svg viewBox="0 0 600 640" width={width} style={{ overflow: "visible" }}>
      {/* Brillo detrás */}
      <defs>
        <radialGradient id="glow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FF8A3D" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF8A3D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="300" cy="330" rx="300" ry="260" fill="url(#glow)" />

      {/* Silla */}
      <rect x="150" y="250" width="300" height="330" rx="40" fill="#2A2A35" />
      <rect x="170" y="270" width="260" height="290" rx="30" fill="#33333F" />

      <g transform={`translate(0 ${bob * 0.4})`}>
        {/* Torso: polo negro */}
        <path d="M150 600 Q150 430 230 400 L370 400 Q450 430 450 600 Z" fill={POLO} />
        {/* Cuello del polo */}
        <path d="M255 398 L300 450 L345 398 L330 392 L300 425 L270 392 Z" fill="#23232D" />
        <path d="M262 395 L300 440 L338 395" stroke="#0C0C11" strokeWidth="4" fill="none" />
        {/* Cuello (piel) */}
        <path d="M265 360 L335 360 L338 400 Q300 430 262 400 Z" fill={SKIN_DARK} />
        {/* Cadena dorada */}
        <path d="M262 402 Q300 470 338 402" stroke={GOLD} strokeWidth="5" fill="none" strokeDasharray="7 3" />
        {/* Brazo izquierdo (apoyado) */}
        <path d="M160 470 Q120 520 150 560 L210 560 Q200 520 215 480 Z" fill={POLO} />
        <path d="M150 548 Q140 575 175 585 L250 585 Q262 568 245 556 Z" fill={SKIN} />
        {/* Reloj */}
        <rect x="160" y="545" width="26" height="30" rx="6" fill="#111" />
        <rect x="165" y="551" width="16" height="18" rx="3" fill="#3B3B46" />
        {/* Brazo derecho (gesticula) */}
        <g transform={`rotate(${-arm} 420 480)`}>
          <path d="M440 470 Q480 520 450 560 L390 560 Q400 520 385 480 Z" fill={POLO} />
          <path d="M450 548 Q460 575 425 585 L350 585 Q338 568 355 556 Z" fill={SKIN} />
        </g>
      </g>

      {/* Cabeza */}
      <g transform={`translate(0 ${bob}) rotate(${tilt} 300 300)`}>
        {/* Orejas */}
        <ellipse cx="208" cy="265" rx="18" ry="28" fill={SKIN_DARK} />
        <ellipse cx="392" cy="265" rx="18" ry="28" fill={SKIN_DARK} />
        {/* Cara */}
        <path d="M215 200 Q215 120 300 115 Q385 120 385 200 L385 290 Q385 375 300 385 Q215 375 215 290 Z" fill={SKIN} />
        {/* Lados degradados */}
        <path d="M212 235 Q208 160 240 135 L250 175 Q232 195 228 240 Z" fill={FADE} />
        <path d="M388 235 Q392 160 360 135 L350 175 Q368 195 372 240 Z" fill={FADE} />
        {/* Pelo rizado arriba */}
        <g fill={HAIR}>
          <path d="M228 165 Q225 105 300 95 Q375 105 372 165 Q355 140 300 140 Q245 140 228 165 Z" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} cx={242 + i * 19.5} cy={108 + Math.abs(3 - i) * 4} r="15" />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={"b" + i} cx={252 + i * 19.5} cy={92 + Math.abs(2.5 - i) * 5} r="13" />
          ))}
        </g>
        {/* Cejas */}
        <g transform={`translate(0 ${brow})`} fill={HAIR}>
          <path d="M240 210 Q262 196 285 206 L284 214 Q262 206 242 218 Z" />
          <path d="M360 210 Q338 196 315 206 L316 214 Q338 206 358 218 Z" />
        </g>
        {/* Ojos */}
        <g transform={`translate(0 245) scale(1 ${blink}) translate(0 -245)`}>
          <ellipse cx="263" cy="245" rx="17" ry="13" fill="#fff" />
          <ellipse cx="337" cy="245" rx="17" ry="13" fill="#fff" />
          <circle cx="265" cy="246" r="8.5" fill="#2B1A10" />
          <circle cx="335" cy="246" r="8.5" fill="#2B1A10" />
          <circle cx="268" cy="243" r="2.6" fill="#fff" />
          <circle cx="338" cy="243" r="2.6" fill="#fff" />
        </g>
        {/* Nariz */}
        <path d="M300 255 Q292 285 286 295 Q300 304 314 295" stroke={SKIN_DARK} strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Barba cerrada */}
        <path d="M218 268 Q222 330 255 365 Q300 400 345 365 Q378 330 382 268 Q372 300 352 312 Q300 300 248 312 Q228 300 218 268 Z" fill={BEARD} />
        {/* Bigote */}
        <path d="M262 312 Q300 296 338 312 Q322 322 300 316 Q278 322 262 312 Z" fill={BEARD} />
        {/* Boca (se abre con la voz) */}
        <ellipse cx="300" cy={330 + mouthH / 2} rx={mouthW / 2} ry={mouthH / 2} fill="#3A0E12" />
        {m > 0.25 ? <rect x={300 - mouthW / 2 + 8} y={331} width={mouthW - 16} height={6} rx="3" fill="#F5EFE6" /> : null}
        <path d={`M${300 - mouthW / 2} 330 Q300 ${336 + mouthH * 0.15} ${300 + mouthW / 2} 330`} stroke="#B9634A" strokeWidth="3" fill="none" />
      </g>

      {/* Escritorio */}
      <rect x="-60" y="575" width="720" height="70" rx="14" fill="#1E1E28" />
      <rect x="-60" y="575" width="720" height="8" rx="4" fill="#FF8A3D" opacity="0.8" />

      {/* Micrófono de pódcast con brazo */}
      <path d="M560 575 L560 470 L440 360" stroke="#2E2E38" strokeWidth="12" fill="none" strokeLinecap="round" />
      <g transform="rotate(-35 420 345)">
        <rect x="398" y="300" width="44" height="88" rx="22" fill="#0E0E14" />
        <rect x="404" y="306" width="32" height="44" rx="16" fill="#2A2A33" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="408" y={312 + i * 9} width="24" height="3" rx="1.5" fill="#44444F" />
        ))}
      </g>

      {/* Taza con logo */}
      <rect x="40" y="515" width="62" height="62" rx="10" fill="#FFD23F" />
      <path d="M102 532 Q128 540 102 560" stroke="#FFD23F" strokeWidth="8" fill="none" />
      <text x="71" y="555" textAnchor="middle" fontSize="22" fontWeight="900" fill="#0B0B14" fontFamily="Montserrat">AD</text>
    </svg>
  );
};
