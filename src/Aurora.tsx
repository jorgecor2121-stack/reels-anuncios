// Ambiente "aurora de cristal", sin avatar: fondo de aurora en movimiento, la escena dentro de una tarjeta
// de vidrio que gira al cambiar de frase, y un riel a un lado que marca las 8 piezas de la estructura.
import { AbsoluteFill, Composition, Sequence, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Esc, MotionProps, Subs, palabras } from "./Motion";

const { fontFamily } = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const FPS = 30;
const S = (s: number) => Math.round(s * FPS);
const PIEZAS = ["Gancho", "Introducción", "Cuerpo", "Bucle abierto", "Cuerpo", "Bucle abierto", "Cuerpo", "Acción"];

const Aurora: React.FC<{ f: number }> = ({ f }) => {
  const blob = (c: string, x: number, y: number, r: number, k: number) => (
    <div style={{ position: "absolute", left: x + Math.sin(f / (60 + k * 13) + k) * 160 - r, top: y + Math.cos(f / (70 + k * 11) + k) * 140 - r, width: r * 2, height: r * 2,
      borderRadius: "50%", background: c, filter: "blur(120px)", opacity: 0.75 }} />
  );
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #050816 0%, #0B1033 55%, #12062A 100%)", overflow: "hidden" }}>
      {blob("#00E0C6", 200, 400, 380, 1)}
      {blob("#7C3AED", 900, 700, 420, 2)}
      {blob("#FF4FA3", 400, 1500, 360, 3)}
      {blob("#2D7BFF", 950, 1700, 300, 4)}
      {/* estrellas */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 137) % 1080, top: (i * 263 + f * (0.3 + (i % 3) * 0.2)) % 1920, width: 3 + (i % 3), height: 3 + (i % 3), borderRadius: 4, background: "#fff", opacity: 0.25 + 0.25 * Math.sin(f / 9 + i) }} />
      ))}
      {/* piso en perspectiva */}
      <div style={{ position: "absolute", left: -400, right: -400, bottom: -200, height: 700, transform: "perspective(600px) rotateX(62deg)",
        backgroundImage: "linear-gradient(rgba(0,224,198,.25) 2px, transparent 2px), linear-gradient(90deg, rgba(0,224,198,.25) 2px, transparent 2px)", backgroundSize: "90px 90px", backgroundPosition: `0 ${(f * 2) % 90}px`,
        maskImage: "linear-gradient(0deg, #000 30%, transparent 100%)" }} />
    </AbsoluteFill>
  );
};

const Riel: React.FC<{ li: number; f: number }> = ({ li, f }) => (
  <div style={{ position: "absolute", right: 34, top: 330, display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-end" }}>
    {PIEZAS.map((n, i) => {
      const on = i <= li, act = i === li;
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: on ? 1 : 0.35 }}>
          <span style={{ fontSize: act ? 26 : 20, fontWeight: 800, color: act ? "#fff" : "#B9C2E8", opacity: act ? 1 : 0.8, transform: `translateX(${act ? 0 : 6}px)` }}>{act ? n : ""}</span>
          <div style={{ width: act ? 22 : 14, height: act ? 22 : 14, borderRadius: 11, background: on ? "#00E0C6" : "transparent", border: "3px solid #00E0C6",
            boxShadow: act ? `0 0 ${14 + Math.sin(f / 5) * 6}px #00E0C6` : "none" }} />
        </div>
      );
    })}
  </div>
);

export const ReelAurora: React.FC<MotionProps> = (p) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const ws = palabras(p);
  const li = Math.max(0, p.lineas.reduce((a, l, i) => (t >= l.start ? i : a), -1));
  const ls = p.lineas[li]?.start ?? 0;
  const local = f - S(ls);
  const pin = spring({ frame: local, fps: FPS, config: { damping: 14, stiffness: 120 } });
  const out = interpolate(S(p.lineas[li + 1]?.start ?? p.fin) - f, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const giro = interpolate(pin, [0, 1], [li % 2 ? -70 : 70, 0]) + interpolate(out, [0, 1], [li % 2 ? 50 : -50, 0]);
  const flot = Math.sin(f / 30) * 10;
  return (
    <AbsoluteFill style={{ fontFamily, color: "#fff", overflow: "hidden" }}>
      <Aurora f={f} />
      <div style={{ position: "absolute", top: 100, left: 90, right: 90, height: 8, borderRadius: 4, background: "rgba(255,255,255,.15)" }}>
        <div style={{ width: `${Math.min(1, t / p.fin) * 100}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#00E0C6,#7C3AED,#FF4FA3)" }} />
      </div>
      <div style={{ position: "absolute", top: 135, width: "100%", textAlign: "center", fontSize: 34, fontWeight: 800, color: "#B9C2E8", letterSpacing: 2 }}>{p.marca}</div>
      {/* tarjeta de vidrio con la escena */}
      <div style={{ position: "absolute", left: 50, right: 110, top: 260, height: 1080, perspective: 1600 }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 60, background: "rgba(255,255,255,.07)", border: "2px solid rgba(255,255,255,.22)", backdropFilter: "blur(24px)",
          boxShadow: "0 40px 120px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.35)", transform: `translateY(${flot}px) rotateY(${giro}deg) scale(${interpolate(pin, [0, 1], [0.9, 1])})`,
          opacity: Math.min(out, 0.3 + pin), display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div key={li} style={{ transform: "scale(0.8)" }}>
            <Sequence from={S(ls)} layout="none"><Esc e={p.escenas[Math.min(li, p.escenas.length - 1)]} /></Sequence>
          </div>
        </div>
      </div>
      <Riel li={li} f={f} />
      <div style={{ position: "absolute", top: 1440, left: 30, right: 30, textAlign: "center" }}><Subs p={p} t={t} ws={ws} /></div>
    </AbsoluteFill>
  );
};

export const AuroraComposition = () => (
  <Composition id="ReelAurora" component={ReelAurora} durationInFrames={S(10)} fps={FPS} width={1080} height={1920}
    defaultProps={{ lineas: [], escenas: [], resaltar: [], marca: "", fin: 10 } as MotionProps}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.fin) })} />
);
