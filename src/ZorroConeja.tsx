// Escena animada: el zorro y la coneja en la cama (recreación libre del video de las suricatas).
// Imágenes recortadas en public/zc/ (zorro.png, coneja.png); música en public/zc/musica.wav.
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

const FPS = 30;
const DUR = 12 * FPS;
const s = (seg: number) => seg * FPS;

const ease = Easing.inOut(Easing.cubic);
const lerp = (f: number, input: number[], output: number[]) =>
  interpolate(f, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

// Cámara: punto del mundo (1080x1920) que queda al centro y zoom
const CAM = { t: [0, s(2.5), s(5.5), s(6.2), s(8.6), s(9.3), s(12)], x: [540, 540, 470, 300, 300, 440, 440], y: [850, 850, 860, 560, 560, 780, 760], z: [1.12, 1.12, 1.25, 2.3, 2.3, 1.45, 1.5] };

const Cama: React.FC = () => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="sabana" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5a73b8" />
        <stop offset="1" stopColor="#34488a" />
      </linearGradient>
      <linearGradient id="almohada" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7189cc" />
        <stop offset="1" stopColor="#4c63a6" />
      </linearGradient>
      <radialGradient id="lampara" cx="0.05" cy="0.12" r="0.75">
        <stop offset="0" stopColor="#ffb766" stopOpacity="0.55" />
        <stop offset="0.5" stopColor="#ff9a4a" stopOpacity="0.12" />
        <stop offset="1" stopColor="#ff9a4a" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="1080" height="1920" fill="url(#sabana)" />
    {/* pliegues de la sábana */}
    {[[120, 700, 380, 820], [640, 640, 980, 760], [80, 1100, 420, 1180], [700, 1050, 1040, 1150]].map(([a, b, c, d], i) => (
      <path key={i} d={`M ${a} ${b} Q ${(a + c) / 2} ${b - 50} ${c} ${d}`} stroke="#2b3c78" strokeOpacity={0.35} strokeWidth={14} fill="none" strokeLinecap="round" />
    ))}
    {/* almohadas */}
    <rect x="-40" y="120" width="560" height="420" rx="90" fill="url(#almohada)" />
    <rect x="560" y="120" width="560" height="420" rx="90" fill="url(#almohada)" />
    <path d="M 40 470 Q 260 520 480 470" stroke="#3a4f92" strokeOpacity={0.5} strokeWidth={10} fill="none" />
    <path d="M 600 470 Q 820 520 1040 470" stroke="#3a4f92" strokeOpacity={0.5} strokeWidth={10} fill="none" />
    <rect width="1080" height="1920" fill="url(#lampara)" />
  </svg>
);

const Cobija: React.FC<{ y: number }> = ({ y }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="cobija" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6c84c8" />
        <stop offset="0.15" stopColor="#4d65ab" />
        <stop offset="1" stopColor="#2e3f80" />
      </linearGradient>
    </defs>
    <path d={`M -20 ${y + 40} Q 200 ${y - 30} 420 ${y + 20} Q 700 ${y + 80} 900 ${y} Q 1000 ${y - 30} 1100 ${y + 10} L 1100 1940 L -20 1940 Z`} fill="url(#cobija)" />
    <path d={`M 60 ${y + 170} Q 300 ${y + 120} 520 ${y + 200} M 560 ${y + 260} Q 800 ${y + 200} 1040 ${y + 280}`} stroke="#25356e" strokeOpacity={0.5} strokeWidth={16} fill="none" strokeLinecap="round" />
  </svg>
);

const Zzz: React.FC<{ x: number; y: number; f: number; hasta: number; desfase: number }> = ({ x, y, f, hasta, desfase }) => {
  const fin = interpolate(f, [hasta - 10, hasta], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      {[0, 1, 2].map((i) => {
        const p = ((f + desfase + i * 20) % 60) / 60;
        return (
          <div key={i} style={{ position: "absolute", left: x + p * 70 + i * 6, top: y - p * 160, fontSize: 38 + i * 10, fontWeight: 800, color: "#ffffff",
            opacity: Math.sin(p * Math.PI) * 0.9 * fin, fontFamily: "Arial Rounded MT Bold, Arial, sans-serif", textShadow: "0 3px 8px rgba(0,0,0,.35)" }}>z</div>
        );
      })}
    </>
  );
};

const Corazones: React.FC<{ f: number; desde: number; x: number; y: number; n?: number }> = ({ f, desde, x, y, n = 9 }) => (
  <>
    {Array.from({ length: n }).map((_, i) => {
      const t0 = desde + i * 22;
      const p = (f - t0) / 50;
      if (p < 0 || p > 1) return null;
      const dx = Math.sin(i * 2.3) * 120 + Math.sin(p * 6 + i) * 18;
      return (
        <div key={i} style={{ position: "absolute", left: x + dx, top: y - p * 260, fontSize: 54 + (i % 3) * 16, opacity: Math.sin(p * Math.PI),
          transform: `scale(${interpolate(p, [0, 0.2], [0.3, 1], { extrapolateRight: "clamp" })})` }}>{i % 4 === 3 ? "💕" : "❤️"}</div>
      );
    })}
  </>
);

export const ZorroConeja: React.FC = () => {
  const f = useCurrentFrame();
  const cx = lerp(f, CAM.t, CAM.x);
  const cy = lerp(f, CAM.t, CAM.y);
  const z = lerp(f, CAM.t, CAM.z);
  const shake = f > s(6.3) && f < s(7.1) ? Math.sin(f * 2.1) * 6 : 0;

  // respiración
  const resp = (fase: number) => 1 + Math.sin(f / 22 + fase) * 0.012;

  // zorro: se sobresalta en 6.4 s
  const susto = interpolate(f, [s(6.3), s(6.5), s(7.0)], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zorroW = 560, zorroH = (zorroW * 1704) / 901;
  const zorroX = 300, zorroY = 300;

  // coneja: se acerca rodando y se acurruca
  const conejaW = 440, conejaH = (conejaW * 1926) / 738;
  const conejaX = lerp(f, [s(2.8), s(5.2)], [800, 620]);
  const conejaRot = lerp(f, [s(2.8), s(3.6), s(5.2)], [6, 18, -9]);
  const conejaY = lerp(f, [s(2.8), s(4.0), s(5.2)], [250, 230, 270]);

  const cobijaY = lerp(f, [0, s(9.2), s(11)], [1170, 1170, 1110]);
  const fade = interpolate(f, [0, 12, DUR - 18, DUR], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#1d2650", opacity: fade }}>
      <Audio src={staticFile("zc/musica.wav")} />
      <AbsoluteFill style={{ transform: `translate(${540 - cx * z + shake}px, ${960 - cy * z}px) scale(${z})`, transformOrigin: "0 0" }}>
        <Cama />
        {/* zorro */}
        <div style={{ position: "absolute", left: zorroX - zorroW / 2, top: zorroY - susto * 40, width: zorroW, height: zorroH,
          transform: `scale(${resp(0) + susto * 0.08}, ${resp(0) + susto * 0.1})`, transformOrigin: "50% 80%",
          filter: "drop-shadow(0 18px 22px rgba(10,15,45,.45))" }}>
          <Img src={staticFile("zc/zorro.png")} style={{ width: "100%", height: "100%" }} />
        </div>
        {/* coneja */}
        <div style={{ position: "absolute", left: conejaX - conejaW / 2, top: conejaY, width: conejaW, height: conejaH,
          transform: `rotate(${conejaRot}deg) scale(${resp(1.7)})`, transformOrigin: "50% 75%",
          filter: "drop-shadow(0 18px 22px rgba(10,15,45,.45))" }}>
          <Img src={staticFile("zc/coneja.png")} style={{ width: "100%", height: "100%" }} />
        </div>
        <Cobija y={cobijaY} />
        <Zzz x={410} y={330} f={f} hasta={s(6.3)} desfase={0} />
        <Zzz x={930} y={300} f={f} hasta={s(3.0)} desfase={25} />
        {f >= s(6.35) && f < s(8.6) && (
          <div style={{ position: "absolute", left: 120, top: 230 - susto * 30, fontSize: 120, fontWeight: 900, color: "#FFD23F",
            transform: `rotate(12deg) scale(${interpolate(f, [s(6.35), s(6.6)], [0.2, 1], { extrapolateRight: "clamp" })})`,
            textShadow: "0 6px 0 #c2410c, 0 10px 18px rgba(0,0,0,.4)", fontFamily: "Arial Black, Arial, sans-serif" }}>!</div>
        )}
        <Corazones f={f} desde={s(4.6)} x={620} y={260} n={3} />
        <Corazones f={f} desde={s(9.2)} x={470} y={250} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ZorroConejaComposition = () => (
  <Composition id="ZorroConeja" component={ZorroConeja} fps={FPS} width={1080} height={1920} durationInFrames={DUR} />
);
