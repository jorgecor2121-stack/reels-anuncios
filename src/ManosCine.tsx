// Edición cinematográfica de un video hablado: la persona recortada sobre un fondo nuevo por secciones,
// palabra gigante detrás, gráficas en las manos, cámara con empujes, franjas de cine, grano, destellos y subtítulos.
import { AbsoluteFill, Composition, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { EnMano, ITEMS, Pos, setPos } from "./Manos";

const { fontFamily: bebas } = loadBebas();
const { fontFamily: mont } = loadMont("normal", { weights: ["800", "900"], subsets: ["latin"] });
const FPS = 30;
const BARRA = 120;

type Palabra = { w: string; s: number; e: number };
export type ManosCineProps = { pos: Pos; face: number[][]; words: Palabra[]; video: string; fin: number };

// Secciones: color del fondo, palabra gigante detrás y empuje de cámara
const SEC = [
  { s: 0, e: 2.35, word: "¿VENTAS?", c1: "#3A0508", c2: "#FF3B3B", zoom: [1.12, 1.0] },
  { s: 2.35, e: 4.1, word: "TRANQUILO", c1: "#2A1608", c2: "#FFB347", zoom: [1.0, 1.06] },
  { s: 4.1, e: 8.55, word: "90%", c1: "#04261C", c2: "#2EE6A6", zoom: [1.05, 1.12] },
  { s: 8.55, e: 11.65, word: "X2", c1: "#330609", c2: "#FF4D4D", zoom: [1.15, 1.02] },
  { s: 11.65, e: 16.6, word: "CHATS", c1: "#061633", c2: "#2F7BF6", zoom: [1.0, 1.08] },
  { s: 16.6, e: 19.65, word: "NO ERES TÚ", c1: "#1C0B2E", c2: "#C084FC", zoom: [1.1, 1.03] },
  { s: 19.65, e: 24.85, word: "ANDRÓMEDA", c1: "#05202B", c2: "#22D3EE", zoom: [1.0, 1.12] },
  { s: 24.85, e: 27.65, word: "APRENDE", c1: "#2B2205", c2: "#FFD23F", zoom: [1.12, 1.04] },
  { s: 27.65, e: 31.6, word: "EN VIVO", c1: "#33050F", c2: "#E11D48", zoom: [1.02, 1.1] },
  { s: 31.6, e: 34.9, word: "21 · 26 NOV", c1: "#2B1405", c2: "#FF8A3D", zoom: [1.1, 1.02] },
  { s: 34.9, e: 36.4, word: "OFERTA", c1: "#2E2203", c2: "#FFD23F", zoom: [1.0, 1.1] },
  { s: 36.4, e: 99, word: "ESCRÍBEME", c1: "#2E2203", c2: "#FFD23F", zoom: [1.1, 1.55] },
];
const CLAVE = /^(promociones|90|%|clientes|taller|doble|conversación|resultados|problema|campañas|inteligencia|artificial|andrómeda|completamente|aprender|vivo|paso|sábado|21|jueves|26|noviembre|2000|pesos|escríbeme|ventas)$/i;

const Fondo: React.FC<{ sec: (typeof SEC)[number]; t: number; f: number }> = ({ sec, t, f }) => {
  const lt = t - sec.s;
  const p = spring({ frame: Math.round(lt * FPS), fps: FPS, config: { damping: 14, stiffness: 90 } });
  const big = Math.min(560, 980 / (sec.word.length * 0.43));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${sec.c1} 0%, #050307 75%)` }}>
      {/* haces de luz */}
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ position: "absolute", left: 540 - 120 + (k - 1) * 260, top: -200, width: 240, height: 1700, transformOrigin: "50% 0",
          transform: `rotate(${(k - 1) * 18 + Math.sin(f / 40 + k) * 6}deg)`, background: `linear-gradient(180deg, ${sec.c2}55, ${sec.c2}00)`, filter: "blur(30px)", opacity: 0.7 }} />
      ))}
      {/* palabra gigante detrás */}
      <div style={{ position: "absolute", top: 380, left: -200, right: -200, textAlign: "center", fontFamily: bebas, fontSize: big, lineHeight: 0.85, color: "transparent",
        WebkitTextStroke: `4px ${sec.c2}`, opacity: 0.35 * p, transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px) scale(${1 + lt * 0.015})`, letterSpacing: 6 }}>{sec.word}</div>
      <div style={{ position: "absolute", top: 380, left: -200, right: -200, textAlign: "center", fontFamily: bebas, fontSize: big, lineHeight: 0.85, color: sec.c2,
        opacity: 0.9 * p, transform: `translateY(${interpolate(p, [0, 1], [140, 0])}px) scale(${1 + lt * 0.02})`, textShadow: `0 0 60px ${sec.c2}`, letterSpacing: 6 }}>{sec.word}</div>
      {/* bokeh */}
      {Array.from({ length: 16 }).map((_, k) => {
        const x = (k * 137 + f * (0.3 + (k % 4) * 0.2)) % 1180 - 50;
        const y = 300 + ((k * 211) % 1300) + Math.sin(f / 30 + k) * 30;
        const r = 20 + (k % 5) * 14;
        return <div key={k} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: "50%", background: sec.c2, opacity: 0.12 + (k % 3) * 0.05, filter: "blur(6px)" }} />;
      })}
      {/* luz de piso detrás de la persona */}
      <div style={{ position: "absolute", left: 140, top: 1150, width: 800, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${sec.c2}66, ${sec.c2}00 70%)` }} />
    </AbsoluteFill>
  );
};

const Subtitulo: React.FC<{ words: Palabra[]; t: number }> = ({ words, t }) => {
  const i = words.findIndex((w) => t >= w.s && t < w.e + 0.25);
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  const grupo = words.slice(g, g + 3);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: BARRA + 120, textAlign: "center", fontFamily: mont, fontWeight: 900, fontSize: 64, lineHeight: 1.1, textTransform: "uppercase" }}>
      {grupo.map((w, k) => {
        const on = t >= w.s;
        const clave = CLAVE.test(w.w.replace(/[.,¿?¡!]/g, ""));
        const pop = spring({ frame: Math.round((t - w.s) * FPS), fps: FPS, config: { damping: 10, stiffness: 220 } });
        return (
          <span key={k} style={{ display: "inline-block", margin: "0 10px", color: clave ? "#FFD23F" : "#fff", opacity: on ? 1 : 0.0,
            transform: `scale(${on ? interpolate(pop, [0, 1], [1.4, 1]) : 1})`, WebkitTextStroke: "3px #000", paintOrder: "stroke", textShadow: "0 6px 20px rgba(0,0,0,.8)" }}>{w.w.replace(/[.,]$/, "")}</span>
        );
      })}
    </div>
  );
};

export const ReelManosCine: React.FC<ManosCineProps> = (p) => {
  setPos(p.pos);
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const si = SEC.findIndex((s) => t >= s.s && t < s.e);
  const sec = SEC[Math.max(0, si)];
  const lt = (t - sec.s) / Math.min(sec.e - sec.s, p.fin - sec.s);
  // cámara: empuje suave por sección, centrado en la cara (último tramo = slow push lento)
  const last = si === SEC.length - 1;
  const z = interpolate(last ? Math.pow(lt, 0.8) : lt, [0, 1], sec.zoom as [number, number], { extrapolateRight: "clamp" });
  const fc = p.face[Math.min(p.face.length - 1, f)] ?? [540, 700, 200];
  const ox = fc[0], oy = fc[1];
  const shake = (t - sec.s) < 0.25 ? Math.sin(f * 3) * 6 * (1 - (t - sec.s) / 0.25) : 0;
  const flash = interpolate(t - sec.s, [0, 0.05, 0.25], [0, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${shake}px, 0) scale(${z})`, transformOrigin: `${ox}px ${oy}px`, filter: last ? `blur(0px)` : undefined }}>
        <div style={{ position: "absolute", inset: 0, filter: last ? `blur(${interpolate(lt, [0, 1], [0, 10])}px)` : undefined }}>
          <Fondo sec={sec} t={t} f={f} />
        </div>
        <OffthreadVideo src={staticFile(p.video)} transparent muted
          style={{ position: "absolute", inset: 0, width: 1080, height: 1920, filter: `drop-shadow(0 0 14px ${sec.c2}aa) drop-shadow(0 30px 40px rgba(0,0,0,.6))` }} />
        {ITEMS.map((it, i) => <EnMano key={i} it={it} />)}
      </AbsoluteFill>
      {/* destello en cada cambio + viñeta + grano */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 80% 20%, ${sec.c2}, #fff 40%, transparent 70%)`, opacity: flash, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.75) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.12, mixBlendMode: "overlay" }}>
        <filter id={`gr${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 6} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={1080} height={1920} filter={`url(#gr${f % 6})`} />
      </svg>
      <Subtitulo words={p.words} t={t} />
      {/* franjas de cine con marca y barra de progreso */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: BARRA, background: "#000" }}>
        <div style={{ position: "absolute", bottom: 26, left: 50, fontFamily: mont, fontWeight: 800, fontSize: 30, color: "#bbb", letterSpacing: 3 }}>@almonte_suarez.ia</div>
        <div style={{ position: "absolute", bottom: 30, right: 50, fontFamily: mont, fontWeight: 800, fontSize: 26, color: "#E11D48", letterSpacing: 3, opacity: Math.sin(f / 6) > 0 ? 1 : 0.35 }}>● TALLER</div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: BARRA, background: "#000" }}>
        <div style={{ position: "absolute", top: 0, left: 0, height: 6, width: `${(t / p.fin) * 100}%`, background: `linear-gradient(90deg, ${sec.c2}, #fff)` }} />
      </div>
    </AbsoluteFill>
  );
};

export const ManosCineComposition = () => (
  <Composition id="ReelManosCine" component={ReelManosCine} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 10}
    defaultProps={{ pos: { izq: [[0, 0]], der: [[0, 0]] }, face: [], words: [], video: "prueba/persona.webm", fin: 10 } as ManosCineProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
