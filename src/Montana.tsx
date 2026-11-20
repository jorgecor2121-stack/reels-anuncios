// Reel estilo "montaña rusa": un carrito recorre una montaña rusa blanca y limpia; en cada estación
// se enciende un bombillo y aparece la idea (con datos de ejemplo de campañas reales). Subtítulos palabra a palabra arriba.
import { AbsoluteFill, Composition, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";

const { fontFamily: inter } = loadInter("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
const { fontFamily: bebas } = loadBebas();
const FPS = 30;

type Palabra = { w: string; s: number; e: number };
export type MontanaProps = { words: Palabra[]; fin: number; marca: string };

// Momentos de cada estación (inicio de cada frase)
const EST = [0.0, 4.38, 12.96, 19.76, 26.54, 32.9, 40.5];

// ---------- Recorrido en el piso (coordenadas del mundo) ----------
const PTS: [number, number][] = [
  [540, 0], [300, 500], [760, 1000], [380, 1600], [820, 2150], [300, 2700], [700, 3300], [260, 3900],
  [780, 4500], [340, 5100], [760, 5700], [300, 6300], [700, 6900], [420, 7500], [540, 8000],
];
const suave = (p: [number, number][]) => {
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
};
const PISO = suave(PTS);
const LARGO = getLength(PISO);
const PASO = 14;
const MUESTRAS = Array.from({ length: Math.floor(LARGO / PASO) + 1 }, (_, i) => getPointAtLength(PISO, i * PASO) ?? { x: 540, y: 0 });
const ESTL = EST.map((_, k) => 250 + (k * (LARGO - 600)) / (EST.length - 1)); // dónde está cada estación
const alto = (s: number) => {
  // altura de la vía: sube cerca de cada estación, baja (y acelera) entre ellas
  let h = 70 + 50 * Math.sin(s / 300);
  for (const L of ESTL) h += 170 * Math.exp(-((s - L) ** 2) / (2 * 260 ** 2));
  return h;
};
const proy = (s: number) => {
  const i = Math.max(0, Math.min(MUESTRAS.length - 1, Math.round(s / PASO)));
  const p = MUESTRAS[i];
  return { x: p.x, y: p.y - alto(s), fx: p.x, fy: p.y };
};

// distancia recorrida: llega a cada estación cuando empieza su frase y frena un poco ahí
const recorrido = (t: number) => {
  const times = EST.map((e) => e + 0.5).concat([45.5]);
  const dist = ESTL.concat([LARGO - 50]);
  if (t <= times[0]) return interpolate(t, [0, times[0]], [0, dist[0]], { extrapolateLeft: "clamp" });
  for (let k = 0; k < times.length - 1; k++) {
    if (t <= times[k + 1]) return interpolate(t, [times[k], times[k + 1]], [dist[k], dist[k + 1]], { easing: Easing.bezier(0.55, 0, 0.35, 1) });
  }
  return dist[dist.length - 1];
};

const COLOR_TRAMO = ["#F5B700", "#8B7CF6", "#F5B700", "#8B7CF6", "#F5B700", "#8B7CF6", "#F5B700"];

const Via: React.FC = () => {
  // vía dividida en tramos de color (amarilla / morada) como en la referencia
  const tramos: string[][] = [];
  let cur: string[] = [], col = 0;
  MUESTRAS.forEach((_, i) => {
    const s = i * PASO;
    const k = ESTL.findIndex((L, j) => s < (ESTL[j + 1] ?? 1e9) && s >= L - 1e9);
    const c = Math.max(0, ESTL.filter((L) => s >= L - 200).length - 1);
    if (c !== col && cur.length) { tramos.push(cur); cur = [cur[cur.length - 1]]; col = c; }
    const p = proy(s);
    cur.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    void k;
  });
  tramos.push(cur);
  const sombra = MUESTRAS.map((p, i) => `${(p.x + alto(i * PASO) * 0.35).toFixed(1)},${(p.y + 6).toFixed(1)}`).join(" ");
  const postes = MUESTRAS.filter((_, i) => i % 9 === 0).map((p, j) => {
    const s = j * 9 * PASO, h = alto(s);
    return (
      <g key={j}>
        <line x1={p.x + h * 0.35} y1={p.y + 6} x2={p.x} y2={p.y + 4} stroke="#00000010" strokeWidth={8} />
        <line x1={p.x} y1={p.y - h + 10} x2={p.x} y2={p.y} stroke="#C9CCD3" strokeWidth={9} strokeLinecap="round" />
        <ellipse cx={p.x} cy={p.y} rx={9} ry={4} fill="#B5B8C0" />
      </g>
    );
  });
  return (
    <g>
      <polyline points={sombra} fill="none" stroke="#00000014" strokeWidth={30} strokeLinejoin="round" />
      {postes}
      {tramos.map((pts, i) => {
        const c = COLOR_TRAMO[i % COLOR_TRAMO.length];
        const P = pts.join(" ");
        return (
          <g key={i}>
            <polyline points={P} fill="none" stroke={c} strokeWidth={34} strokeLinejoin="round" strokeLinecap="round" />
            <polyline points={P} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinejoin="round" opacity={0.85} />
            <polyline points={P} fill="none" stroke="#6B6F7A" strokeWidth={30} strokeDasharray="4 16" strokeLinejoin="round" opacity={0.55} />
          </g>
        );
      })}
    </g>
  );
};

// pórtico con bombillo en cada estación
const Bombillo: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const p = proy(ESTL[k]);
  const on = t >= EST[k] + 0.5;
  const pr = spring({ frame: Math.round((t - EST[k] - 0.5) * FPS), fps: FPS, config: { damping: 8 } });
  const glow = on ? 0.6 + 0.4 * pr : 0;
  const top = p.y - 330, sw = Math.sin(t * 2 + k) * 4;
  return (
    <g>
      <line x1={p.x - 150} y1={p.fy} x2={p.x - 150} y2={top} stroke="#C9CCD3" strokeWidth={12} strokeLinecap="round" />
      <line x1={p.x + 150} y1={p.fy} x2={p.x + 150} y2={top} stroke="#C9CCD3" strokeWidth={12} strokeLinecap="round" />
      <line x1={p.x - 165} y1={top} x2={p.x + 165} y2={top} stroke="#D5D8DE" strokeWidth={14} strokeLinecap="round" />
      <g transform={`rotate(${sw} ${p.x} ${top})`}>
        <line x1={p.x} y1={top} x2={p.x} y2={top + 50} stroke="#555" strokeWidth={4} />
        {on ? <circle cx={p.x} cy={top + 120} r={110} fill="#FFE27A" opacity={0.35 * glow} /> : null}
        <rect x={p.x - 24} y={top + 50} width={48} height={34} rx={5} fill="#A9ADB5" stroke="#6B6F7A" strokeWidth={3} />
        {[0, 1, 2].map((i) => <line key={i} x1={p.x - 24} y1={top + 58 + i * 9} x2={p.x + 24} y2={top + 60 + i * 9} stroke="#6B6F7A" strokeWidth={2} />)}
        <path d={`M ${p.x - 24} ${top + 84} C ${p.x - 70} ${top + 110} ${p.x - 62} ${top + 170} ${p.x} ${top + 172} C ${p.x + 62} ${top + 170} ${p.x + 70} ${top + 110} ${p.x + 24} ${top + 84} Z`}
          fill={on ? "#FFF6C8" : "#F7F7F8"} stroke="#B9BCC4" strokeWidth={3} />
        <path d={`M ${p.x - 12} ${top + 120} l 6 10 l 6 -10 l 6 10 l 6 -10`} fill="none" stroke={on ? "#F5A300" : "#A0A4AC"} strokeWidth={3} />
      </g>
    </g>
  );
};

// aro vertical (loop) decorativo en algunos tramos
const Aro: React.FC<{ s: number }> = ({ s }) => {
  const p = proy(s);
  return (
    <g>
      <ellipse cx={p.x} cy={p.y - 230} rx={150} ry={235} fill="none" stroke="#8B7CF6" strokeWidth={30} />
      <ellipse cx={p.x} cy={p.y - 230} rx={150} ry={235} fill="none" stroke="#fff" strokeWidth={8} opacity={0.8} />
      <ellipse cx={p.x} cy={p.y - 230} rx={150} ry={235} fill="none" stroke="#6B6F7A" strokeWidth={26} strokeDasharray="4 16" opacity={0.5} />
      <line x1={p.x} y1={p.y - 465} x2={p.x} y2={p.fy} stroke="#C9CCD3" strokeWidth={8} />
    </g>
  );
};

const Carrito: React.FC<{ s: number; t: number }> = ({ s, t }) => {
  const a = proy(s), b = proy(s + 20);
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  const flip = Math.abs(ang) > 90;
  const bob = Math.sin(t * 22) * 1.5;
  return (
    <g transform={`translate(${a.x} ${a.y - 14 + bob}) rotate(${ang}) scale(1.35 ${flip ? -1.35 : 1.35})`}>
      <rect x={-38} y={-28} width={76} height={34} rx={8} fill="#2F6BFF" stroke="#1B3FA8" strokeWidth={3} />
      <rect x={-38} y={-8} width={76} height={8} fill="#FFD23F" />
      {[["#FF4FA3", -22], ["#22D3EE", -2], ["#FF8A3D", 18]].map(([c, x], i) => (
        <g key={i}><circle cx={x as number} cy={-36} r={10} fill={c as string} /><rect x={(x as number) - 7} y={-30} width={14} height={8} rx={3} fill={c as string} /></g>
      ))}
      <circle cx={-24} cy={8} r={7} fill="#333" /><circle cx={24} cy={8} r={7} fill="#333" />
    </g>
  );
};

// ---------- Ideas de cada estación ----------
const tarjeta: React.CSSProperties = { background: "#fff", borderRadius: 28, boxShadow: "0 18px 50px rgba(30,30,60,.18), 0 2px 0 rgba(0,0,0,.04)", padding: "20px 26px", fontFamily: inter, color: "#16161D" };
const SP = (t: number, s: number, d = 11) => spring({ frame: Math.round((t - s) * FPS), fps: FPS, config: { damping: d, stiffness: 160 } });

const MiniAd: React.FC<{ c: string; estado?: "bien" | "mal" | null; corona?: boolean; barra?: number }> = ({ c, estado, corona, barra }) => (
  <div style={{ position: "relative", width: 110, height: 150, borderRadius: 18, background: estado === "mal" ? "#E5E7EB" : "#fff", border: `4px solid ${estado === "mal" ? "#C4C7CF" : c}`,
    boxShadow: "0 8px 20px rgba(0,0,0,.1)", padding: 10, opacity: estado === "mal" ? 0.6 : 1 }}>
    <div style={{ height: 60, borderRadius: 10, background: estado === "mal" ? "#D1D5DB" : `${c}33` }} />
    <div style={{ marginTop: 8, height: 10, width: "80%", borderRadius: 5, background: "#E5E7EB" }} />
    <div style={{ marginTop: 6, height: 10, width: "55%", borderRadius: 5, background: "#E5E7EB" }} />
    {barra !== undefined ? <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, height: 12, borderRadius: 6, background: "#EEF0F3" }}><div style={{ width: `${barra * 100}%`, height: "100%", borderRadius: 6, background: c }} /></div> : null}
    {estado === "mal" ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>❌</div> : null}
    {estado === "bien" ? <div style={{ position: "absolute", top: -26, right: -18, fontSize: 50 }}>📈</div> : null}
    {corona ? <div style={{ position: "absolute", top: -54, left: 26, fontSize: 60 }}>👑</div> : null}
  </div>
);

const Idea: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const s = EST[k], e = EST[k + 1] ?? 99;
  if (t < s + 0.4 || t > e + 0.2) return null;
  const p = SP(t, s + 0.4);
  const out = interpolate(t, [e - 0.1, e + 0.2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cols = ["#F5B700", "#8B7CF6", "#22C3EE", "#FF4FA3"];
  let body: React.ReactNode = null;
  if (k === 0) {
    body = <div style={{ ...tarjeta, textAlign: "center" }}><div style={{ fontSize: 90 }}>💵</div><div style={{ fontWeight: 900, fontSize: 52 }}>TU DINERO</div><div style={{ fontWeight: 600, fontSize: 32, color: "#6B6F7A" }}>bien estructurado en Meta</div></div>;
  } else if (k === 1) {
    const ya = t > 7.7;
    body = !ya ? (
      <div style={{ ...tarjeta, textAlign: "center" }}><div style={{ fontWeight: 900, fontSize: 46, color: "#E11D48" }}>❌ 1 campaña</div><div style={{ fontWeight: 900, fontSize: 46, color: "#E11D48" }}>por anuncio</div></div>
    ) : (
      <div style={{ ...tarjeta, textAlign: "center", padding: "24px 30px" }}>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {cols.map((c, i) => <div key={i} style={{ transform: `translateY(${interpolate(SP(t, 7.8 + i * 0.12), [0, 1], [-120, 0])}px)`, opacity: SP(t, 7.8 + i * 0.12) }}><MiniAd c={c} /></div>)}
        </div>
        <div style={{ marginTop: 14, border: "4px dashed #8B7CF6", borderRadius: 18, padding: "8px 0", fontWeight: 900, fontSize: 40 }}>📦 1 CONJUNTO</div>
        {t > 11.2 ? <div style={{ marginTop: 12, display: "inline-block", background: "#16A34A", color: "#fff", fontWeight: 900, fontSize: 40, borderRadius: 16, padding: "8px 22px", transform: `scale(${SP(t, 11.2, 8)})` }}>💰 1 PRESUPUESTO</div> : null}
      </div>
    );
  } else if (k === 2) {
    const prog = interpolate(t, [14.5, 17.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fin = [0.35, 0.55, 1, 0.45];
    body = (
      <div style={{ ...tarjeta, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#16161D", color: "#fff", fontWeight: 900, fontSize: 40, borderRadius: 40, padding: "8px 24px" }}>🤖 ANDRÓMEDA</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40 }}>
          {cols.map((c, i) => <MiniAd key={i} c={c} barra={fin[i] * prog} corona={i === 2 && t > 17.3} />)}
        </div>
        {t > 17.3 ? <div style={{ marginTop: 12, fontWeight: 900, fontSize: 38, color: "#16A34A", transform: `scale(${SP(t, 17.3, 8)})` }}>💸 el dinero va al ganador</div> : null}
      </div>
    );
  } else if (k === 3) {
    const n = Math.round(interpolate(t, [20.4, 21.8], [0, 385], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
    body = (
      <div style={{ ...tarjeta, textAlign: "center", padding: "20px 40px" }}>
        <div style={{ fontFamily: bebas, fontSize: 200, lineHeight: 0.9, color: "#16161D" }}>{n}</div>
        <div style={{ fontWeight: 900, fontSize: 40, color: "#6B6F7A" }}>💬 CONVERSACIONES</div>
        {t > 23.8 ? <div style={{ marginTop: 14, display: "inline-block", background: "#F5B700", fontWeight: 900, fontSize: 52, borderRadius: 18, padding: "6px 24px", transform: `scale(${SP(t, 23.8, 8)}) rotate(-3deg)` }}>$0.19 c/u</div> : null}
      </div>
    );
  } else if (k === 4) {
    const mal = t > 28.6, bien = t > 30.3;
    body = (
      <div style={{ ...tarjeta, textAlign: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 110px)", gap: 14 }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ transform: `scale(${SP(t, 27.0 + i * 0.06)})` }}><MiniAd c={cols[i % 4]} estado={i % 2 === 0 ? (mal ? "mal" : null) : bien ? "bien" : null} /></div>)}
        </div>
        {bien ? <div style={{ marginTop: 14, fontWeight: 900, fontSize: 44, color: "#16A34A", transform: `scale(${SP(t, 30.3, 8)})` }}>4 ESCALAN TU NEGOCIO 🚀</div> : null}
      </div>
    );
  } else if (k === 5) {
    const g1 = interpolate(t, [34.2, 34.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const g2 = interpolate(t, [37.2, 38.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    body = (
      <div style={{ ...tarjeta, textAlign: "center", padding: "22px 40px" }}>
        <div style={{ fontWeight: 900, fontSize: 38 }}>🎓 Resultado de una alumna</div>
        <div style={{ display: "flex", gap: 60, justifyContent: "center", alignItems: "flex-end", height: 420, marginTop: 10 }}>
          <div><div style={{ fontFamily: bebas, fontSize: 70, color: "#E11D48", opacity: g1 }}>$7.36</div><div style={{ width: 130, height: 30 * g1, background: "#FF6B6B", borderRadius: "14px 14px 0 0", margin: "0 auto" }} /><div style={{ fontWeight: 800, fontSize: 30, color: "#6B6F7A" }}>INVIRTIÓ</div></div>
          <div><div style={{ fontFamily: bebas, fontSize: 70, color: "#16A34A", opacity: g2 }}>RD$9,250</div><div style={{ width: 130, height: 260 * g2, background: "#2EE6A6", borderRadius: "14px 14px 0 0", margin: "0 auto" }} /><div style={{ fontWeight: 800, fontSize: 30, color: "#6B6F7A" }}>VENDIÓ</div></div>
        </div>
      </div>
    );
  } else if (k === 6) {
    body = (
      <div style={{ ...tarjeta, textAlign: "center", padding: "26px 40px" }}>
        <div style={{ fontSize: 100 }}>🏁</div>
        <div style={{ fontWeight: 900, fontSize: 54 }}>📌 GUÁRDALO</div>
        <div style={{ marginTop: 8, display: "inline-block", background: "#2F6BFF", color: "#fff", fontWeight: 900, fontSize: 40, borderRadius: 16, padding: "8px 24px", transform: `scale(${SP(t, 42.0, 8)})` }}>SÍGUEME ➜</div>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", opacity: out, transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px) scale(${interpolate(p, [0, 1], [0.6, 1])})` }}>
      {body}
    </div>
  );
};

const Subtitulo: React.FC<{ words: Palabra[]; t: number }> = ({ words, t }) => {
  const i = words.findIndex((w) => t >= w.s && t < w.e + 0.35);
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  return (
    <div style={{ position: "absolute", top: 230, left: 40, right: 40, textAlign: "center", fontFamily: inter, fontWeight: 800, fontSize: 76, letterSpacing: -1 }}>
      {words.slice(g, g + 3).map((w, k) => (
        <span key={k} style={{ margin: "0 12px", color: g + k === i ? "#16161D" : "#A3A6AE", textShadow: "0 0 16px #fff, 0 0 4px #fff" }}>{w.w.replace(/[.,]+$/, "")}</span>
      ))}
    </div>
  );
};

export const ReelMontana: React.FC<MontanaProps> = ({ words, fin, marca }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const s = recorrido(t);
  const c = proy(s);
  // cámara: sigue al carrito (un poco por delante), con acercamiento suave al llegar a cada estación
  const ade = proy(Math.min(LARGO, s + 160));
  const k = EST.reduce((a, e, j) => (t >= e ? j : a), 0);
  const llegada = interpolate(t - EST[k] - 0.5, [0, 0.4, 2.5], [1, 1.12, 1.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const z = 0.95 * llegada;
  const cx = (c.x * 2 + ade.x) / 3, cy = (c.y * 2 + ade.y) / 3;
  const rot = Math.sin(t * 0.5) * 2;
  const visibles = (L: number) => Math.abs(L - s) < 1800;
  return (
    <AbsoluteFill style={{ background: "#F4F5F7", overflow: "hidden" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 1300) rotate(${rot}) scale(${z}) translate(${-cx} ${-cy})`}>
          <rect x={cx - 3000} y={cy - 3000} width={6000} height={7000} fill="#F7F8FA" />
          <Via />
          {[ESTL[1] + 700, ESTL[3] + 700, ESTL[5] + 600].filter(visibles).map((L, i) => <Aro key={i} s={L} />)}
          {ESTL.map((L, j) => (visibles(L) ? <Bombillo key={j} k={j} t={t} /> : null))}
          <Carrito s={s} t={t} />
        </g>
      </svg>
      {/* luz suave arriba para que el texto se lea */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(244,245,247,.95) 0%, rgba(244,245,247,.6) 22%, rgba(244,245,247,0) 34%)" }} />
      {EST.map((_, j) => <Idea key={j} k={j} t={t} />)}
      <Subtitulo words={words} t={t} />
      <div style={{ position: "absolute", top: 120, right: 50, fontFamily: inter, fontWeight: 800, fontSize: 30, color: "#B5B8C0" }}>{marca}</div>
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(t / fin) * 100}%`, background: "linear-gradient(90deg,#F5B700,#8B7CF6)" }} />
    </AbsoluteFill>
  );
};

export const MontanaComposition = () => (
  <Composition id="ReelMontana" component={ReelMontana} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 45}
    defaultProps={{ words: [], fin: 45, marca: "@almonte_suarez.ia" } as MontanaProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
