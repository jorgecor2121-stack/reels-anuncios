// Reel con animaciones que ilustran cada frase (estilo motion graphics, fondo oscuro y naranja).
// Cada línea del guion tiene una "escena" de un tipo reutilizable; abajo, subtítulos palabra a palabra.
import { AbsoluteFill, Composition, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin"] });
const C = { bg: "#07070B", card: "#14141C", line: "#2A2A36", o: "#FF8A3D", y: "#FFD23F", red: "#FF3B5C", green: "#2BD576", t: "#FFFFFF", m: "#9A97A8" };
const FPS = 30;
const S = (s: number) => Math.round(s * FPS);

export type Linea = { text: string; start: number; duration: number };
export type Escena =
  | { tipo: "telefono"; texto: string; sello?: string; deslizar?: boolean }
  | { tipo: "contador"; numero: string; etiqueta: string }
  | { tipo: "antesDespues"; antes: string; despues: string; badge?: string }
  | { tipo: "movimiento"; badge?: string; etiqueta: string }
  | { tipo: "sorpresa"; emoji: string; etiqueta: string; badge?: string }
  | { tipo: "checklist"; items: string[] }
  | { tipo: "seguir"; usuario: string };
export type MotionProps = { lineas: Linea[]; escenas: Escena[]; resaltar: string[]; marca: string; fin: number; tipo?: string };

const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
const useSpring = (delay: number, damping = 13, stiffness = 140) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness } });
};

// ---------- piezas comunes ----------
const Badge: React.FC<{ text: string }> = ({ text }) => {
  const p = useSpring(0, 12, 200);
  return (
    <div style={{ display: "inline-block", background: C.o, color: "#1A0A00", fontWeight: 900, fontSize: 38, padding: "10px 28px", borderRadius: 40,
      transform: `scale(${p})`, marginBottom: 34 }}>{text}</div>
  );
};

const Telefono: React.FC<{ children: React.ReactNode; scale?: number }> = ({ children, scale = 1 }) => (
  <div style={{ width: 430 * scale, height: 820 * scale, borderRadius: 64 * scale, background: "#0E0E14", border: `${10 * scale}px solid #2C2C38`,
    boxShadow: "0 40px 120px rgba(255,138,61,.25)", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 18 * scale, left: "50%", transform: "translateX(-50%)", width: 120 * scale, height: 30 * scale, borderRadius: 20, background: "#000", zIndex: 5 }} />
    {children}
  </div>
);

// Texto que se escribe letra a letra
const Typed: React.FC<{ text: string; delay?: number; cps?: number; style?: React.CSSProperties }> = ({ text, delay = 0, cps = 22, style }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.floor(((frame - delay) / FPS) * cps));
  const caret = Math.floor(frame / 15) % 2 === 0 && n < text.length;
  return <span style={style}>{text.slice(0, n)}{caret ? "▍" : ""}</span>;
};

// ---------- escenas ----------
const EscTelefono: React.FC<{ e: Extract<Escena, { tipo: "telefono" }> }> = ({ e }) => {
  const frame = useCurrentFrame();
  const inP = useSpring(0);
  const stamp = useSpring(S(1.4), 9, 220);
  const swipe = e.deslizar ? interpolate(frame, [S(2.4), S(3.2)], [0, -900], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => x * x }) : 0;
  const thumbY = e.deslizar ? interpolate(frame, [S(2.1), S(3.2)], [0, -260], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return (
    <div style={{ transform: `translateY(${interpolate(inP, [0, 1], [200, 0])}px) scale(${interpolate(inP, [0, 1], [0.8, 1])})`, opacity: inP, position: "relative" }}>
      <Telefono>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${swipe}px)` }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#2a2a35,#16161d)" }} />
          <div style={{ position: "absolute", top: 260, left: 40, right: 40, textAlign: "center", fontSize: 44, fontWeight: 800 }}>
            <Typed text={e.texto} delay={8} />
          </div>
          <div style={{ position: "absolute", bottom: 60, left: 30, fontSize: 26, color: C.m, fontWeight: 700 }}>@tu.negocio · 0:01</div>
        </div>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${swipe + 900}px)`, background: "linear-gradient(180deg,#3a1d0c,#120a06)" }} />
      </Telefono>
      {e.sello ? (
        <div style={{ position: "absolute", top: 300, left: -40, right: -40, textAlign: "center", transform: `rotate(-14deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`, opacity: stamp }}>
          <span style={{ border: `10px solid ${C.red}`, color: C.red, fontSize: 92, fontWeight: 900, padding: "6px 28px", borderRadius: 18, background: "rgba(7,7,11,.75)" }}>{e.sello}</span>
        </div>
      ) : null}
      {e.deslizar ? <div style={{ position: "absolute", bottom: 160, right: -10, fontSize: 120, transform: `translateY(${thumbY}px)`, opacity: frame > S(2) ? 1 : 0 }}>👆</div> : null}
    </div>
  );
};

const EscContador: React.FC<{ e: Extract<Escena, { tipo: "contador" }> }> = ({ e }) => {
  const frame = useCurrentFrame();
  const p = useSpring(0, 10);
  const ring = interpolate(frame, [0, S(2.5)], [0, 1], { extrapolateRight: "clamp" });
  const R = 230, L = 2 * Math.PI * R;
  // tarjetas del feed pasando rápido detrás
  return (
    <div style={{ position: "relative", width: 700, height: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = ((frame * 38 + i * 260) % 1300) - 650;
        return <div key={i} style={{ position: "absolute", width: 300, height: 200, borderRadius: 26, background: C.card, border: `2px solid ${C.line}`, transform: `translate(${i % 2 ? 260 : -260}px, ${-y}px)`, opacity: 0.35 }} />;
      })}
      <svg width="560" height="560" style={{ position: "absolute", transform: `scale(${p})` }}>
        <circle cx="280" cy="280" r={R} stroke={C.line} strokeWidth="26" fill="none" />
        <circle cx="280" cy="280" r={R} stroke={C.o} strokeWidth="26" fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - ring)} transform="rotate(-90 280 280)" />
      </svg>
      <div style={{ textAlign: "center", transform: `scale(${p})` }}>
        <div style={{ fontSize: 230, fontWeight: 900, color: C.y, lineHeight: 1 }}>{e.numero}</div>
      </div>
      <div style={{ position: "absolute", bottom: -40, left: -100, right: -100, textAlign: "center", fontSize: 50, fontWeight: 800, color: C.t, opacity: p }}>{e.etiqueta}</div>
    </div>
  );
};

const EscAntesDespues: React.FC<{ e: Extract<Escena, { tipo: "antesDespues" }> }> = ({ e }) => {
  const frame = useCurrentFrame();
  const a = useSpring(0);
  const strike = interpolate(frame, [S(1.2), S(1.7)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const d = useSpring(S(2.0));
  const card = (bg: string, border: string): React.CSSProperties => ({ width: 860, borderRadius: 34, background: bg, border: `4px solid ${border}`, padding: "34px 40px", textAlign: "left" });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {e.badge ? <Badge text={e.badge} /> : null}
      <div style={{ ...card(C.card, C.red), transform: `translateX(${interpolate(a, [0, 1], [-600, 0])}px)`, opacity: a * (1 - 0.45 * strike) }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: C.red, marginBottom: 10 }}>❌ ASÍ NO</div>
        <div style={{ fontSize: 50, fontWeight: 800, position: "relative", display: "inline-block" }}>
          {e.antes}
          <div style={{ position: "absolute", left: 0, top: "52%", height: 8, width: `${strike * 100}%`, background: C.red, borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ fontSize: 80, margin: "16px 0", opacity: d }}>⬇️</div>
      <div style={{ ...card("#1A140C", C.green), transform: `translateX(${interpolate(d, [0, 1], [600, 0])}px) scale(${interpolate(d, [0, 1], [0.9, 1])})`, opacity: d, boxShadow: "0 30px 90px rgba(43,213,118,.18)" }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: C.green, marginBottom: 10 }}>✅ ASÍ SÍ</div>
        <div style={{ fontSize: 56, fontWeight: 900 }}><Typed text={e.despues} delay={S(2.2)} cps={26} /></div>
      </div>
    </div>
  );
};

const EscMovimiento: React.FC<{ e: Extract<Escena, { tipo: "movimiento" }> }> = ({ e }) => {
  const frame = useCurrentFrame();
  const inP = useSpring(0);
  const zoom = 1 + 0.18 * (0.5 + 0.5 * Math.sin(frame / 9));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${inP})` }}>
      {e.badge ? <Badge text={e.badge} /> : null}
      <Telefono scale={0.9}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, #5a2a10, #120a06 70%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 200, transform: `scale(${zoom}) rotate(${Math.sin(frame / 7) * 8}deg)` }}>🎬</div>
          {[0, 1, 2].map((i) => {
            const r = ((frame * 6 + i * 60) % 180);
            return <div key={i} style={{ position: "absolute", width: r * 2.4, height: r * 2.4, borderRadius: "50%", border: `4px solid ${C.o}`, opacity: 1 - r / 180 }} />;
          })}
          <div style={{ position: "absolute", top: 70, right: 30, background: C.red, color: "#fff", fontWeight: 900, fontSize: 26, padding: "4px 14px", borderRadius: 10 }}>● 0:01</div>
        </div>
      </Telefono>
      <div style={{ fontSize: 54, fontWeight: 900, marginTop: 30, color: C.y }}>{e.etiqueta}</div>
    </div>
  );
};

const EscSorpresa: React.FC<{ e: Extract<Escena, { tipo: "sorpresa" }> }> = ({ e }) => {
  const frame = useCurrentFrame();
  const boom = useSpring(S(0.5), 7, 200);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {e.badge ? <Badge text={e.badge} /> : null}
      <div style={{ position: "relative", width: 600, height: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const ang = (i / 12) * Math.PI * 2;
          const d = interpolate(boom, [0, 1], [0, 260]);
          return <div key={i} style={{ position: "absolute", width: 18, height: 60, borderRadius: 9, background: i % 2 ? C.y : C.o,
            transform: `translate(${Math.cos(ang) * d}px, ${Math.sin(ang) * d}px) rotate(${(ang * 180) / Math.PI + 90}deg)`, opacity: 1 - Math.max(0, boom - 0.85) * 4 }} />;
        })}
        <div style={{ fontSize: 300, transform: `scale(${boom}) rotate(${Math.sin(frame / 8) * 6}deg)` }}>{e.emoji}</div>
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 50, fontWeight: 900 }}>
        <span style={{ fontSize: 70 }}>🔇</span><span>{e.etiqueta}</span>
      </div>
    </div>
  );
};

const EscChecklist: React.FC<{ e: Extract<Escena, { tipo: "checklist" }> }> = ({ e }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 34, width: 820 }}>
    {e.items.map((it, i) => <CheckItem key={i} text={it} delay={S(0.6 * i)} />)}
  </div>
);
const CheckItem: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const p = useSpring(delay);
  const tick = useSpring(delay + 10, 8, 260);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 34, background: C.card, border: `3px solid ${C.line}`, borderRadius: 30, padding: "30px 36px",
      transform: `translateX(${interpolate(p, [0, 1], [-500, 0])}px)`, opacity: p }}>
      <div style={{ width: 90, height: 90, borderRadius: 24, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, fontWeight: 900, color: "#06210f", transform: `scale(${tick})` }}>✓</div>
      <div style={{ fontSize: 60, fontWeight: 900 }}>{text}</div>
    </div>
  );
};

const EscSeguir: React.FC<{ e: Extract<Escena, { tipo: "seguir" }> }> = ({ e }) => {
  const frame = useCurrentFrame();
  const inP = useSpring(0);
  const save = useSpring(S(0.9), 8, 220);
  const clickT = S(2.3);
  const clicked = frame >= clickT;
  const cx = interpolate(frame, [S(1.4), clickT], [380, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cy = interpolate(frame, [S(1.4), clickT], [260, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const press = clicked ? interpolate(frame - clickT, [0, 3, 8], [1, 0.9, 1], { extrapolateRight: "clamp" }) : 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50, transform: `scale(${inP})` }}>
      <div style={{ fontSize: 210, transform: `scale(${save}) rotate(${interpolate(save, [0, 1], [-30, 0])}deg)` }}>🔖</div>
      <div style={{ fontSize: 64, fontWeight: 900 }}>Guarda este video</div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 26, background: C.card, border: `3px solid ${C.line}`, borderRadius: 36, padding: "26px 34px" }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", background: `linear-gradient(135deg, ${C.o}, ${C.y})` }} />
        <div style={{ fontSize: 44, fontWeight: 800 }}>{e.usuario}</div>
        <div style={{ marginLeft: 20, background: clicked ? C.line : C.o, color: clicked ? C.t : "#1A0A00", fontSize: 40, fontWeight: 900, padding: "16px 34px", borderRadius: 18, transform: `scale(${press})` }}>
          {clicked ? "Siguiendo ✓" : "Seguir"}
        </div>
        <div style={{ position: "absolute", right: 40 - cx, bottom: -40 - cy, fontSize: 90, opacity: frame > S(1.3) ? 1 : 0 }}>👆</div>
      </div>
    </div>
  );
};

const Esc: React.FC<{ e: Escena }> = ({ e }) => {
  switch (e.tipo) {
    case "telefono": return <EscTelefono e={e} />;
    case "contador": return <EscContador e={e} />;
    case "antesDespues": return <EscAntesDespues e={e} />;
    case "movimiento": return <EscMovimiento e={e} />;
    case "sorpresa": return <EscSorpresa e={e} />;
    case "checklist": return <EscChecklist e={e} />;
    case "seguir": return <EscSeguir e={e} />;
  }
};

// ---------- subtítulos ----------
type Pal = { w: string; start: number; end: number; line: number };
const palabras = (p: MotionProps): Pal[] => {
  const out: Pal[] = [];
  p.lineas.forEach((l, li) => {
    const ws = l.text.split(/\s+/).filter(Boolean);
    const total = ws.reduce((a, w) => a + w.length + 2, 0);
    let t = l.start;
    ws.forEach((w) => { const d = (l.duration * (w.length + 2)) / total; out.push({ w, start: t, end: t + d, line: li }); t += d; });
  });
  return out;
};
const Subs: React.FC<{ p: MotionProps; t: number; ws: Pal[] }> = ({ p, t, ws }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = ws.findIndex((x) => t >= x.start && t < x.end + 0.15);
  if (i < 0) return null;
  const lw = ws.filter((x) => x.line === ws[i].line);
  const g0 = Math.floor(lw.indexOf(ws[i]) / 3) * 3;
  const hl = new Set(p.resaltar.map(norm));
  return (
    <div style={{ fontSize: 64, fontWeight: 900, textShadow: "0 6px 24px rgba(0,0,0,.8)", whiteSpace: "nowrap" }}>
      {lw.slice(g0, g0 + 3).map((x, j) => {
        const pop = spring({ frame: frame - S(x.start), fps, config: { damping: 11, stiffness: 220 } });
        const on = t >= x.start;
        return <span key={j} style={{ display: "inline-block", margin: "0 9px", color: hl.has(norm(x.w)) ? C.o : C.t, opacity: on ? 1 : 0.2,
          transform: `scale(${on ? interpolate(pop, [0, 1], [0.6, 1]) : 0.9})` }}>{x.w}</span>;
      })}
    </div>
  );
};

// ---------- composición ----------
export const ReelMotion: React.FC<MotionProps> = (p) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ws = palabras(p);
  const li = Math.max(0, p.lineas.reduce((a, l, i) => (t >= l.start ? i : a), -1));
  const ls = p.lineas[li]?.start ?? 0;
  const local = frame - S(ls);
  const flash = interpolate(local, [0, 3, 9], [0.12, 0.06, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = interpolate(S(p.lineas[li + 1]?.start ?? p.fin) - frame, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily, color: C.t, overflow: "hidden" }}>
      {/* fondo: brillo naranja que respira + grilla sutil */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% ${44 + Math.sin(frame / 40) * 3}%, rgba(255,138,61,.28) 0%, rgba(255,138,61,0) 55%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px", transform: `translateY(${(frame * 0.6) % 60}px)` }} />
      {/* barra de progreso + marca */}
      <div style={{ position: "absolute", top: 120, left: 90, right: 90, height: 8, borderRadius: 4, background: "rgba(255,255,255,.12)" }}>
        <div style={{ width: `${Math.min(1, t / p.fin) * 100}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${C.o}, ${C.y})` }} />
      </div>
      <div style={{ position: "absolute", top: 155, width: "100%", textAlign: "center", fontSize: 36, fontWeight: 800, color: C.m, letterSpacing: 2 }}>{p.marca}</div>
      {/* escena de la frase actual */}
      <div style={{ position: "absolute", top: 230, bottom: 540, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: out }}>
        <div key={li} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShiftFrom from={S(ls)}><Esc e={p.escenas[Math.min(li, p.escenas.length - 1)]} /></ShiftFrom>
        </div>
      </div>
      {/* subtítulos */}
      <div style={{ position: "absolute", top: 1440, left: 30, right: 30, textAlign: "center" }}><Subs p={p} t={t} ws={ws} /></div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

// Hace que la escena "empiece" en su propio frame 0
import { Sequence } from "remotion";
const ShiftFrom: React.FC<{ from: number; children: React.ReactNode }> = ({ from, children }) => (
  <Sequence from={from} layout="none">{children}</Sequence>
);

export const MotionComposition = () => (
  <Composition id="ReelMotion" component={ReelMotion} durationInFrames={S(10)} fps={FPS} width={1080} height={1920}
    defaultProps={{ lineas: [], escenas: [], resaltar: [], marca: "@almonte.suarez", fin: 10 } as MotionProps}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.fin) })} />
);
