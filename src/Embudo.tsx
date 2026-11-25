// Reel "bloques de color": la caricatura recortada abajo, fondo de un color por bloque,
// un gráfico por bloque que se arma con la voz, subtítulos pequeños arriba y cierre que filtra.
import { AbsoluteFill, Composition, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { CharacterLayer } from "./avatar2d/Character";
import { OutfitProvider, Vestimenta } from "./avatar2d/outfit";
import { poseAtFrame, Segment } from "./avatar2d/timeline";
import { mouthAt, speechDuration } from "./avatar2d/lipsync";
import { Mouth } from "./avatar2d/types";

const { fontFamily: mont } = loadMont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
const FPS = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sp = (t: number, s: number, d = 12, k = 200) => spring({ frame: Math.round((t - s) * FPS), fps: FPS, config: { damping: d, stiffness: k } });
const Y = "#FFC93C", R = "#F43F5E", G = "#22C55E", W = "#FFFFFF";

type Palabra = { w: string; s: number; e: number };
type Linea = { text: string; start: number; duration: number };
export type EmbudoProps = { words: Palabra[]; lineas: Linea[]; gestos: Segment[]; fin: number; vestimenta: Vestimenta; usuario: string; clave: string[]; sigue: string; sigueNombre: string };

// bloques (inicio, color de fondo)
const B = [
  { s: 0, bg: "radial-gradient(circle at 50% 30%, #4A2A06 0%, #0B0B0F 60%)" },
  { s: 4.6, bg: "#C81E3A" },
  { s: 8.46, bg: "#0B0B0F" },
  { s: 19.14, bg: "#F5B623" },
  { s: 23.7, bg: "#3B5BDB" },
  { s: 31.2, bg: "radial-gradient(circle at 50% 30%, #0F3B26 0%, #06140D 70%)" },
  { s: 38.2, bg: "radial-gradient(circle at 50% 30%, #0F3B26 0%, #06140D 70%)" },
];

const Personaje: React.FC<{ p: EmbudoProps; f: number; x: number; y: number; esc: number }> = ({ p, f, x, y, esc }) => {
  const t = f / FPS;
  const base = poseAtFrame(p.gestos.map((g) => ({ ...g, talk: false })), f, FPS);
  const li = p.lineas.findIndex((l) => t >= l.start && t < l.start + l.duration);
  let mouth: Mouth = base.face.mouth;
  if (li >= 0 && !["laugh", "shh", "surprise"].includes(mouth)) {
    const l = p.lineas[li];
    const m = mouthAt(l.text, (t - l.start) * (speechDuration(l.text) / Math.max(0.3, l.duration)));
    if (m) mouth = m;
  }
  const pose = { ...base, face: { ...base.face, mouth } };
  return (
    <div style={{ position: "absolute", left: x - 540 * esc, top: y, width: 1080 * esc, height: 1100 * esc }}>
      <svg viewBox="0 0 1080 1100" width={1080 * esc} height={1100 * esc} style={{ overflow: "visible", filter: "drop-shadow(0 20px 40px rgba(0,0,0,.45))" }}>
        <OutfitProvider vestimenta={p.vestimenta}><CharacterLayer pose={pose} /></OutfitProvider>
      </svg>
    </div>
  );
};

const Pildora: React.FC<{ t: number; s: number; txt: string; bg?: string; c?: string; size?: number; rot?: number }> = ({ t, s, txt, bg = W, c = "#111", size = 40, rot = -2 }) => {
  if (t < s) return null;
  const p = sp(t, s, 9, 240);
  return <div style={{ display: "inline-block", background: bg, color: c, fontWeight: 900, fontSize: size, padding: "8px 24px", borderRadius: 14, transform: `scale(${p}) rotate(${rot}deg)`, boxShadow: "0 8px 20px rgba(0,0,0,.3)" }}>{txt}</div>;
};

const Barra: React.FC<{ t: number; s: number; label: string; n: string; ancho: number; c: string }> = ({ t, s, label, n, ancho, c }) => {
  if (t < s) return null;
  const p = interpolate(t, [s, s + 0.35], [0, 1], clamp);
  return (
    <div style={{ height: 66, width: 880 * ancho * p, background: c, borderRadius: 12, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", overflow: "hidden",
      color: c === Y ? "#111" : "#fff", fontWeight: 900, fontSize: 32, whiteSpace: "nowrap", boxShadow: `0 0 24px ${c}66` }}>
      <span>{label}</span><span>{n}</span>
    </div>
  );
};

const Titulo: React.FC<{ txt: string; t: number; s: number; size?: number; c?: string }> = ({ txt, t, s, size = 110, c = W }) => (
  <div style={{ fontWeight: 900, fontSize: size, color: c, lineHeight: 1.02, textAlign: "center", letterSpacing: -2, transform: `scale(${interpolate(sp(t, s, 10, 200), [0, 1], [1.4, 1])})`, opacity: Math.min(1, sp(t, s) * 2), textShadow: "0 6px 20px rgba(0,0,0,.25)" }}>{txt}</div>
);

const Subs: React.FC<{ words: Palabra[]; t: number; clave: string[] }> = ({ words, t, clave }) => {
  const i = words.findIndex((w, k) => t >= w.s && t < (words[k + 1]?.s ?? w.e + 0.5));
  if (i < 0) return null;
  const g = Math.floor(i / 4) * 4;
  return (
    <div style={{ position: "absolute", top: 150, left: 60, right: 60, textAlign: "center", fontWeight: 800, fontSize: 40, color: W }}>
      {words.slice(g, g + 4).map((w, k) => {
        const on = g + k <= i, cl = clave.includes(w.w.toLowerCase().replace(/[.,¿?¡!]/g, ""));
        return <span key={k} style={{ margin: "0 7px", opacity: on ? 1 : 0.4, background: cl && on ? Y : "transparent", color: cl && on ? "#111" : W, padding: cl ? "0 8px" : 0, borderRadius: 6, textShadow: cl && on ? "none" : "0 2px 8px rgba(0,0,0,.6)" }}>{w.w}</span>;
      })}
    </div>
  );
};

export const ReelEmbudo: React.FC<EmbudoProps> = (p) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const k = B.reduce((a, b, i) => (t >= b.s ? i : a), 0);
  const bs = B[k].s;
  const entra = interpolate(t - bs, [0, 0.18], [0, 1], clamp);
  // posición del personaje: grande abajo, pequeño a la derecha en el bloque del embudo
  const chico = (k === 2 && t > 15.0) || (k === 4 && t < 30.0 && t > 24.0);
  const esc = chico ? 0.42 : 0.86;
  const px = chico ? 820 : 540;
  const py = chico ? 1450 : 1920 - 1100 * 0.86 + 40;
  return (
    <AbsoluteFill style={{ background: "#0B0B0F", fontFamily: mont, overflow: "hidden" }}>
      {/* fondo del bloque, entra con barrido */}
      {k > 0 ? <AbsoluteFill style={{ background: B[k - 1].bg }} /> : null}
      <AbsoluteFill style={{ background: B[k].bg, clipPath: `circle(${entra * 150}% at 50% 60%)` }} />
      <Subs words={p.words} t={t} clave={p.clave} />

      <div style={{ position: "absolute", top: 260, left: 70, right: 70, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {k === 0 ? (
          <>
            <div style={{ fontWeight: 900, fontSize: 230, color: "#FFB020", lineHeight: 1, textShadow: "0 0 60px #FF8A00" }}>{Math.round(interpolate(t, [0.1, 1.5], [0, 100], clamp))}</div>
            <div style={{ fontWeight: 900, fontSize: 70, color: W }}>MENSAJES 💬</div>
            <div style={{ marginTop: 26 }}><Pildora t={t} s={3.25} txt="¿Cuántos compran? 🤔" size={44} /></div>
          </>
        ) : null}
        {k === 1 ? (
          <>
            <Titulo txt={"¿NO SABES\nEL NÚMERO?"} t={t} s={4.6} />
            <div style={{ marginTop: 26 }}><Pildora t={t} s={6.9} txt="esa es tu 1ª fuga 🔴" size={46} /></div>
          </>
        ) : null}
        {k === 2 ? (
          <div style={{ width: "100%" }}>
            <div style={{ fontWeight: 900, fontSize: 76, color: W, textAlign: "center", marginBottom: 30 }}>TU EMBUDO DE DM</div>
            <Barra t={t} s={10.7} label="Mensajes" n="100" ancho={1} c={G} />
            <Barra t={t} s={13.5} label="Preguntan precio" n="60" ancho={0.72} c={G} />
            <Barra t={t} s={14.4} label="Pagan" n="2" ancho={0.3} c={R} />
            <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Pildora t={t} s={16.6} txt="⏰ le contestas tarde" size={36} />
              <Pildora t={t} s={18.2} txt="👋 y se va" bg={R} c={W} size={36} rot={3} />
            </div>
            <div style={{ marginTop: 18, fontSize: 24, fontWeight: 600, color: "#9CA3AF" }}>Cifras de ejemplo</div>
          </div>
        ) : null}
        {k === 3 ? (
          <>
            <Titulo txt="+PRESUPUESTO" t={t} s={19.2} size={96} c="#111" />
            <div style={{ marginTop: 26 }}><Pildora t={t} s={22.1} txt="el problema no es el anuncio" bg="#111" c={W} size={40} /></div>
          </>
        ) : null}
        {k === 4 ? (
          <div style={{ width: "100%", textAlign: "center" }}>
            <Titulo txt="+3 VENTAS" t={t} s={23.7} size={140} />
            <div style={{ fontWeight: 800, fontSize: 44, color: W, marginBottom: 30 }}>por cada 100 mensajes</div>
            <div style={{ textAlign: "left" }}>
              <Barra t={t} s={28.9} label="2 ventas → pierdes dinero" n="❌" ancho={0.62} c={R} />
              <Barra t={t} s={30.2} label="5 ventas → escalas" n="🚀" ancho={0.95} c={G} />
            </div>
          </div>
        ) : null}
        {k === 5 ? (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 30 }}><Pildora t={t} s={31.3} txt="TALLER DE META ADS" size={52} rot={0} /></div>
            {[["Dónde se te cae la gente", 34.0], ["Con el mismo presupuesto", 36.4], ["Cada mensaje vale más", 37.4]].map(([txt, s], i) => (
              t >= (s as number) ? (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(255,255,255,.08)", border: `2px solid ${G}`, borderRadius: 16, padding: "16px 22px", marginBottom: 14,
                  transform: `translateX(${interpolate(sp(t, s as number), [0, 1], [-600, 0])}px)`, color: W, fontWeight: 800, fontSize: 38 }}>
                  <span style={{ background: Y, color: "#111", borderRadius: 10, width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{i + 1}</span>{txt as string} ✅
                </div>
              ) : null
            ))}
          </div>
        ) : null}
        {k === 6 ? (
          <div style={{ width: "100%", textAlign: "center", transform: `scale(${sp(t, 38.2, 12, 160)})` }}>
            <div style={{ fontWeight: 800, fontSize: 40, color: "#D1D5DB", marginBottom: 18 }}>Si ya inviertes en anuncios…</div>
            <div style={{ background: "#111318", border: `3px solid ${G}`, borderRadius: 30, padding: "28px 26px", display: "flex", alignItems: "center", gap: 22, textAlign: "left", boxShadow: `0 0 50px ${G}55` }}>
              <div style={{ width: 120, height: 120, borderRadius: 60, padding: 6, background: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)", flexShrink: 0 }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1F2937", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 44, color: W }}>LD</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 44, color: W }}>@{p.sigue}</div>
                <div style={{ fontWeight: 700, fontSize: 30, color: "#9CA3AF" }}>{p.sigueNombre}</div>
                <div style={{ fontWeight: 700, fontSize: 28, color: Y, marginTop: 4 }}>🎯 Meta Ads y estrategias de ventas</div>
              </div>
            </div>
            <div style={{ marginTop: 26, display: "inline-block", background: t > 41.0 ? "#2A2F3A" : G, color: t > 41.0 ? W : "#05210F", fontWeight: 900, fontSize: 48, padding: "16px 44px", borderRadius: 40,
              transform: `scale(${t > 41.0 ? 0.92 + sp(t, 41.0, 8, 220) * 0.08 : 1 + Math.sin(t * 7) * 0.03})` }}>{t > 41.0 ? "Siguiendo ✓" : "➕ Seguir"}</div>
            <div style={{ marginTop: 20, fontWeight: 800, fontSize: 36, color: W }}>…y aprende cómo resolverlo</div>
          </div>
        ) : null}
      </div>

      <Personaje p={p} f={f} x={px} y={py} esc={esc} />
    </AbsoluteFill>
  );
};

export const EmbudoComposition = () => (
  <Composition id="ReelEmbudo" component={ReelEmbudo} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 44}
    defaultProps={{ words: [], lineas: [], gestos: [{ start: 0, pose: "base" }], fin: 44, vestimenta: "denim", usuario: "jorgealmonteia", clave: [], sigue: "", sigueNombre: "" } as EmbudoProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
