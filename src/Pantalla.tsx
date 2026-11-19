// Edición de cine para una grabación de pantalla (Meta Ads): el celular flota en un set oscuro,
// la cámara se acerca a cada número cuando se menciona, con recuadro brillante, contador grande y subtítulos.
import { AbsoluteFill, Composition, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

const { fontFamily: bebas } = loadBebas();
const { fontFamily: mont } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const FPS = 30;
const BARRA = 110;
const ESC = 0.86; // tamaño del celular en reposo
const MIRA_Y = 1180; // a qué altura de la pantalla se lleva el número enfocado

type Palabra = { w: string; s: number; e: number };
export type PantallaProps = { words: Palabra[]; fin: number; video: string };

// Enfoques de cámara: cuándo, cuánto zoom y qué punto del video (coordenadas del video 1080x1920)
type Foco = { s: number; e: number; z: number; x: number; y: number; caja?: [number, number, number, number]; color?: string };
const FOCOS: Foco[] = [
  { s: 0.2, e: 2.4, z: 1.35, x: 510, y: 505, caja: [140, 440, 880, 570], color: "#2EE6A6" },
  { s: 4.9, e: 7.3, z: 1.25, x: 540, y: 950 },
  { s: 8.7, e: 11.2, z: 1.5, x: 475, y: 1720, caja: [150, 1670, 800, 1770], color: "#FFD23F" },
  { s: 11.4, e: 13.8, z: 1.5, x: 475, y: 1360, caja: [150, 1310, 800, 1410], color: "#22D3EE" },
  { s: 14.5, e: 15.3, z: 1.6, x: 460, y: 685, caja: [150, 630, 770, 740], color: "#C084FC" },
  { s: 18.0, e: 19.3, z: 1.35, x: 510, y: 710, caja: [140, 650, 880, 770], color: "#FF8A3D" },
];

// Rótulos grandes que aparecen arriba (lejos del número enfocado)
type Rotulo = { s: number; e: number; grande: string; sub: string; color: string; contar?: number; pre?: string; post?: string };
const ROTULOS: Rotulo[] = [
  { s: 0.4, e: 2.9, grande: "193", contar: 193, sub: "conversaciones", color: "#2EE6A6" },
  { s: 5.2, e: 7.3, grande: "7", contar: 7, sub: "anuncios", color: "#FFFFFF" },
  { s: 7.4, e: 8.6, grande: "1", sub: "solo presupuesto", color: "#22D3EE" },
  { s: 8.9, e: 11.2, grande: "156", contar: 156, sub: "a solo $0,07 c/u", color: "#FFD23F" },
  { s: 11.5, e: 13.8, grande: "$0,05", sub: "por conversación", color: "#22D3EE" },
  { s: 14.5, e: 15.3, grande: "12,235", contar: 12235, sub: "impresiones", color: "#C084FC" },
  { s: 15.5, e: 17.9, grande: "RD$2,000", sub: "taller paso a paso", color: "#FFD23F" },
  { s: 18.0, e: 20.25, grande: "21 · 26 NOV", sub: "vía Zoom", color: "#FF8A3D" },
];

const CLAVE = /^(7|1|solo|presupuesto|resultados|locura|paso|estructurar|taller|RD\$2,000|pesos|Zoom|sábado|21|jueves|26|noviembre|dinero|botar)$/i;

const ease = Easing.bezier(0.65, 0, 0.35, 1);

const camara = (t: number) => {
  // devuelve zoom y punto enfocado, con entradas y salidas suaves
  let z = 1, x = 540, y = 960, k = 0;
  for (const f of FOCOS) {
    const inn = interpolate(t, [f.s - 0.35, f.s + 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
    const out = interpolate(t, [f.e - 0.1, f.e + 0.3], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
    const a = Math.min(inn, out);
    if (a > k) {
      k = a;
      const drift = 1 + (t - f.s) * 0.025;
      z = 1 + (f.z * drift - 1) * a; x = 540 + (f.x - 540) * a; y = 960 + (f.y - 960) * a;
    }
  }
  return { z, x, y, k };
};

const Set: React.FC<{ f: number; color: string }> = ({ f, color }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${color}33 0%, #06040A 70%)` }}>
    {[0, 1, 2, 3].map((k) => (
      <div key={k} style={{ position: "absolute", left: 120 + k * 230, top: -300, width: 200, height: 2000, transformOrigin: "50% 0",
        transform: `rotate(${(k - 1.5) * 14 + Math.sin(f / 45 + k) * 5}deg)`, background: `linear-gradient(180deg, ${color}40, transparent)`, filter: "blur(36px)" }} />
    ))}
    {Array.from({ length: 22 }).map((_, k) => {
      const x = (k * 151 + f * (0.4 + (k % 4) * 0.25)) % 1200 - 60;
      const y = ((k * 263) % 1900) + Math.sin(f / 25 + k) * 40;
      const r = 10 + (k % 5) * 12;
      return <div key={k} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: "50%", background: color, opacity: 0.1 + (k % 3) * 0.05, filter: "blur(5px)" }} />;
    })}
  </AbsoluteFill>
);

const Caja: React.FC<{ foco: Foco; t: number }> = ({ foco, t }) => {
  if (!foco.caja || t < foco.s || t > foco.e + 0.2) return null;
  const [x1, y1, x2, y2] = foco.caja;
  const p = spring({ frame: Math.round((t - foco.s - 0.15) * FPS), fps: FPS, config: { damping: 12, stiffness: 140 } });
  const out = interpolate(t, [foco.e, foco.e + 0.2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c = foco.color ?? "#FFD23F";
  const brillo = 0.6 + 0.4 * Math.sin(t * 8);
  return (
    <div style={{ position: "absolute", left: x1 - 14, top: y1 - 14, width: x2 - x1 + 28, height: y2 - y1 + 28, borderRadius: 22,
      border: `5px solid ${c}`, boxShadow: `0 0 ${24 * brillo}px ${c}, inset 0 0 ${18 * brillo}px ${c}55`, opacity: p * out,
      transform: `scale(${interpolate(p, [0, 1], [1.25, 1])})` }} />
  );
};

const RotuloGrande: React.FC<{ r: Rotulo; t: number }> = ({ r, t }) => {
  if (t < r.s || t > r.e + 0.15) return null;
  const lt = t - r.s;
  const p = spring({ frame: Math.round(lt * FPS), fps: FPS, config: { damping: 11, stiffness: 150 } });
  const out = interpolate(t, [r.e - 0.05, r.e + 0.15], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let texto = r.grande;
  if (r.contar) {
    const v = Math.round(interpolate(lt, [0, Math.min(0.9, (r.e - r.s) * 0.45)], [0, r.contar], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
    texto = v.toLocaleString("en-US");
  }
  const size = Math.min(300, 900 / (r.grande.length * 0.42));
  return (
    <div style={{ position: "absolute", top: BARRA + 90, left: 0, right: 0, textAlign: "center", opacity: out,
      transform: `translateY(${interpolate(p, [0, 1], [-60, 0])}px) scale(${interpolate(p, [0, 1], [1.4, 1])})` }}>
      <div style={{ fontFamily: bebas, fontSize: size, lineHeight: 0.9, color: r.color, textShadow: `0 0 40px ${r.color}, 0 8px 30px rgba(0,0,0,.8)`, letterSpacing: 4 }}>{texto}</div>
      <div style={{ display: "inline-block", marginTop: 6, fontFamily: mont, fontWeight: 900, fontSize: 46, color: "#0A0A0A", background: r.color, padding: "6px 26px", borderRadius: 14, textTransform: "uppercase",
        transform: `scaleX(${spring({ frame: Math.round(lt * FPS) - 6, fps: FPS, config: { damping: 14 } })})` }}>{r.sub}</div>
    </div>
  );
};

const Subtitulo: React.FC<{ words: Palabra[]; t: number }> = ({ words, t }) => {
  const i = words.findIndex((w) => t >= w.s && t < w.e + 0.25);
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: BARRA + 70, textAlign: "center", fontFamily: mont, fontWeight: 900, fontSize: 62, lineHeight: 1.1, textTransform: "uppercase" }}>
      {words.slice(g, g + 3).map((w, k) => {
        const on = t >= w.s;
        const clave = CLAVE.test(w.w.replace(/[.,¿?¡!]$/g, ""));
        const pop = spring({ frame: Math.round((t - w.s) * FPS), fps: FPS, config: { damping: 10, stiffness: 220 } });
        return <span key={k} style={{ display: "inline-block", margin: "0 16px", color: clave ? "#FFD23F" : "#fff", opacity: on ? 1 : 0,
          transform: `scale(${on ? interpolate(pop, [0, 1], [1.4, 1]) : 1})`, WebkitTextStroke: "3px #000", paintOrder: "stroke", textShadow: "0 6px 20px rgba(0,0,0,.9)" }}>{w.w.replace(/[.,]$/, "")}</span>;
      })}
    </div>
  );
};

export const ReelPantalla: React.FC<PantallaProps> = (p) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = camara(t);
  const foco = FOCOS.find((x) => t >= x.s - 0.35 && t <= x.e + 0.3);
  const color = ROTULOS.find((r) => t >= r.s && t <= r.e)?.color ?? "#7C5CFF";
  // en reposo el celular flota inclinado; al enfocar se endereza y crece
  const flot = Math.sin(t * 1.3) * 10 * (1 - cam.k);
  const giro = (Math.sin(t * 0.8) * 6) * (1 - cam.k);
  const escala = ESC * (1 - cam.k) + cam.z * cam.k + (cam.k === 0 ? 0 : 0);
  // punto enfocado → llevarlo a (540, MIRA_Y)
  const tx = (540 - cam.x) * escala * cam.k;
  const ty = ((MIRA_Y - 960) - (cam.y - 960) * escala) * cam.k;
  const cortes = FOCOS.map((x) => x.s).concat(ROTULOS.map((r) => r.s));
  const ult = Math.max(...cortes.filter((c) => c <= t), -9);
  const flash = interpolate(t - ult, [0, 0.05, 0.3], [0, 0.45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = t - ult < 0.2 ? Math.sin(f * 2.7) * 5 * (1 - (t - ult) / 0.2) : 0;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Set f={f} color={color} />
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920,
          transform: `translate(${tx + shake}px, ${ty + flot}px) scale(${escala}) rotateY(${giro}deg) rotateX(${giro * 0.4}deg)`, transformOrigin: "540px 960px" }}>
          {/* marco del celular */}
          <div style={{ position: "absolute", left: 82, top: -18, width: 916, height: 1956, borderRadius: 90, background: "#0B0B10",
            boxShadow: `0 0 0 6px #2A2A33, 0 0 90px ${color}66, 0 60px 120px rgba(0,0,0,.8)` }} />
          <div style={{ position: "absolute", left: 100, top: 0, width: 880, height: 1920, borderRadius: 74, overflow: "hidden" }}>
            <OffthreadVideo src={staticFile(p.video)} style={{ position: "absolute", left: -100, top: 0, width: 1080, height: 1920 }} />
          </div>
          {foco ? <Caja foco={foco} t={t} /> : null}
        </div>
      </AbsoluteFill>
      {/* oscurecer arriba para que el rótulo se lea, sin tocar el número enfocado */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.45) 28%, rgba(0,0,0,0) 45%)", opacity: ROTULOS.some((r) => t >= r.s && t <= r.e) ? 1 : 0.3 }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 100% 0%, ${color}, transparent 45%)`, opacity: flash, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.7) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.1, mixBlendMode: "overlay" }}>
        <filter id={`gp${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 6} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={1080} height={1920} filter={`url(#gp${f % 6})`} />
      </svg>
      {ROTULOS.map((r, i) => <RotuloGrande key={i} r={r} t={t} />)}
      <Subtitulo words={p.words} t={t} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: BARRA, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: BARRA, background: "#000" }}>
        <div style={{ position: "absolute", top: 0, left: 0, height: 6, width: `${(t / p.fin) * 100}%`, background: `linear-gradient(90deg, ${color}, #fff)` }} />
      </div>
    </AbsoluteFill>
  );
};

export const PantallaComposition = () => (
  <Composition id="ReelPantalla" component={ReelPantalla} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 10}
    defaultProps={{ words: [], fin: 10, video: "prueba/pantalla.mp4" } as PantallaProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
