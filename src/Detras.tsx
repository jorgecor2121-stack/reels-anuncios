// Edición de cine: gráficos y objetos que pasan POR DETRÁS de la persona y luego vuelan AL FRENTE;
// en los primeros planos de la laptop, la cámara sigue la pantalla, hace zoom y resalta cada número.
import { AbsoluteFill, Composition, Easing, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

const { fontFamily: bebas } = loadBebas();
const { fontFamily: mont } = loadMont("normal", { weights: ["800", "900"], subsets: ["latin"] });
const FPS = 30;
const BARRA = 90;

export type DetrasProps = {
  video: string; persona: string; fin: number;
  face: number[][]; // [x, y, ancho] de la cara por frame
  homo: Record<string, number[][]>; // homografía (frame de referencia → frame actual) en los planos de la laptop
};

// Cuándo se ve la persona entera (para recortarla y pasar cosas por detrás)
const PERSONA: [number, number][] = [[0, 2.95], [6.55, 12.3], [24.5, 99]];
const conPersona = (t: number) => PERSONA.some(([a, b]) => t >= a && t < b);

// ---------- Gráficos que vuelan de atrás hacia adelante ----------
type Vuelo = { s: number; e: number; tipo: "texto" | "emoji" | "fecha"; texto: string; sub?: string; emoji?: string; color: string; desde: "izq" | "der" };
const VUELOS: Vuelo[] = [
  { s: 0.3, e: 2.9, tipo: "texto", texto: "TU RESULTADO", emoji: "📈", color: "#2EE6A6", desde: "der" },
  { s: 6.6, e: 8.3, tipo: "texto", texto: "4", sub: "ANUNCIOS", color: "#FFD23F", desde: "izq" },
  { s: 8.3, e: 10.2, tipo: "texto", texto: "1", sub: "PRESUPUESTO", emoji: "💰", color: "#22D3EE", desde: "der" },
  { s: 10.25, e: 12.25, tipo: "emoji", texto: "LOCURA", emoji: "🤯", color: "#FF4FA3", desde: "izq" },
  { s: 24.6, e: 27.5, tipo: "texto", texto: "SÍ O SÍ", emoji: "✅", color: "#2EE6A6", desde: "der" },
  { s: 27.7, e: 29.6, tipo: "texto", texto: "8", sub: "ANUNCIOS", color: "#FFFFFF", desde: "izq" },
  { s: 29.7, e: 31.05, tipo: "texto", texto: "4", sub: "NO FUNCIONAN", emoji: "❌", color: "#FF4D4D", desde: "der" },
  { s: 31.1, e: 33.3, tipo: "texto", texto: "4", sub: "ESCALAN TU NEGOCIO", emoji: "🚀", color: "#2EE6A6", desde: "izq" },
  { s: 33.5, e: 36.6, tipo: "texto", texto: "ESTRUCTURA", emoji: "🧱", color: "#FF8A3D", desde: "der" },
  { s: 36.8, e: 39.0, tipo: "texto", texto: "CLIENTES", emoji: "👥", color: "#22D3EE", desde: "izq" },
  { s: 39.1, e: 43.4, tipo: "fecha", texto: "", color: "#E11D48", desde: "der" },
  { s: 43.5, e: 46.5, tipo: "texto", texto: "EN VIVO", sub: "VÍA ZOOM", emoji: "🔴", color: "#E11D48", desde: "izq" },
  { s: 46.6, e: 50.0, tipo: "texto", texto: "PASO A PASO", emoji: "🪜", color: "#FFD23F", desde: "der" },
  { s: 50.3, e: 52.5, tipo: "texto", texto: "BLACK FRIDAY", emoji: "🛍️", color: "#FFFFFF", desde: "izq" },
  { s: 52.6, e: 54.8, tipo: "texto", texto: "RD$2,000", sub: "TALLER COMPLETO", color: "#FFD23F", desde: "der" },
  { s: 54.9, e: 57.2, tipo: "emoji", texto: "CONTENIDO DE VALOR", emoji: "💎", color: "#22D3EE", desde: "izq" },
];

const Grafico: React.FC<{ v: Vuelo; lt: number }> = ({ v, lt }) => {
  if (v.tipo === "fecha") {
    return (
      <div style={{ width: 420, borderRadius: 34, overflow: "hidden", background: "#fff", boxShadow: "0 30px 70px rgba(0,0,0,.6)" }}>
        <div style={{ background: "#E11D48", color: "#fff", fontFamily: bebas, fontSize: 64, textAlign: "center", padding: "6px 0", letterSpacing: 3 }}>NOVIEMBRE</div>
        <div style={{ display: "flex", justifyContent: "space-around", padding: "14px 0 6px", color: "#111", fontFamily: mont }}>
          {[["SÁB", "21"], ["JUE", "26"]].map(([d, n]) => (
            <div key={d} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#666" }}>{d}</div>
              <div style={{ fontFamily: bebas, fontSize: 120, lineHeight: 1, border: "7px solid #E11D48", borderRadius: 80, width: 150 }}>{n}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontFamily: mont, fontWeight: 900, fontSize: 38, color: "#111", paddingBottom: 14 }}>🕢 7:30 PM</div>
      </div>
    );
  }
  const grande = v.texto.length <= 3;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {v.emoji ? <div style={{ fontSize: v.tipo === "emoji" ? 220 : 120, lineHeight: 1, transform: `rotate(${Math.sin(lt * 5) * 8}deg)`, filter: `drop-shadow(0 0 30px ${v.color})` }}>{v.emoji}</div> : null}
      <div style={{ fontFamily: bebas, fontSize: v.tipo === "emoji" ? 90 : grande ? 300 : Math.min(190, 640 / (v.texto.length * 0.47)), lineHeight: 0.9, letterSpacing: 4, whiteSpace: "nowrap",
        background: `linear-gradient(180deg, #fff 0%, ${v.color} 55%, ${v.color} 100%)`, WebkitBackgroundClip: "text", color: "transparent",
        filter: `drop-shadow(0 6px 0 rgba(0,0,0,.55)) drop-shadow(0 0 26px ${v.color}aa)` }}>{v.texto}</div>
      {v.sub ? <div style={{ marginTop: 4, fontFamily: mont, fontWeight: 900, fontSize: 44, color: "#0A0A0A", background: v.color, padding: "6px 22px", borderRadius: 14, whiteSpace: "nowrap" }}>{v.sub}</div> : null}
    </div>
  );
};

// Trayectoria: entra chiquito por un lado DETRÁS de la cabeza, la cruza, y gira hacia la cámara quedando AL FRENTE a un costado
const posVuelo = (v: Vuelo, t: number, face: number[]) => {
  const d = v.e - v.s, lt = t - v.s, u = lt / d;
  const dir = v.desde === "izq" ? 1 : -1;
  const [fx, fy, fw] = face;
  const CRUCE = 0.38; // momento en que pasa al frente
  if (u < CRUCE) {
    const k = interpolate(u, [0, CRUCE], [0, 1], { easing: Easing.inOut(Easing.sin) });
    return { atras: true, x: fx + dir * interpolate(k, [0, 1], [-640, 260]), y: fy - fw * 0.2 + Math.sin(k * Math.PI) * -60, s: interpolate(k, [0, 1], [0.35, 0.6]), rot: dir * interpolate(k, [0, 1], [-25, 10]), op: interpolate(u, [0, 0.08], [0, 1], { extrapolateRight: "clamp" }) };
  }
  const k = spring({ frame: Math.round((lt - CRUCE * d) * FPS), fps: FPS, config: { damping: 12, stiffness: 120 } });
  const out = interpolate(u, [0.9, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lado = fx + dir * 260 > 540 ? 1 : -1; // queda del lado hacia donde iba
  const xf = Math.max(340, Math.min(740, fx + lado * 300));
  return { atras: false, x: interpolate(k, [0, 1], [fx + dir * 260, xf]), y: interpolate(k, [0, 1], [fy - fw * 0.2, Math.min(1500, fy + fw * 1.6)]) + Math.sin(lt * 2.5) * 10,
    s: interpolate(k, [0, 1], [0.6, 1]) * (1 + (1 - out) * 0.4), rot: interpolate(k, [0, 1], [dir * 10, dir * -4]), op: out };
};

const CapaVuelos: React.FC<{ t: number; face: number[]; atras: boolean }> = ({ t, face, atras }) => (
  <>
    {VUELOS.filter((v) => t >= v.s && t <= v.e).map((v, i) => {
      const p = posVuelo(v, t, face);
      if (p.atras !== atras) return null;
      // sin persona recortada no hay "detrás": se muestra directo al frente
      return (
        <div key={i} style={{ position: "absolute", left: p.x, top: p.y, opacity: p.op, transform: `translate(-50%, -50%) scale(${p.s}) rotate(${p.rot}deg)`, filter: p.atras ? "blur(1.5px) brightness(.85)" : undefined }}>
          <Grafico v={v} lt={t - v.s} />
        </div>
      );
    })}
  </>
);

// ---------- Laptop: números resaltados ----------
type Num = { s: number; e: number; ref: "A" | "B"; caja: [number, number, number, number]; z: number; titulo: string; sub: string; color: string };
const NUMS: Num[] = [
  { s: 3.0, e: 4.7, ref: "A", caja: [450, 495, 780, 580], z: 1.6, titulo: "385", sub: "CONVERSACIONES", color: "#2EE6A6" },
  { s: 4.7, e: 6.45, ref: "A", caja: [440, 190, 760, 260], z: 1.6, titulo: "$0,14", sub: "POR CONVERSACIÓN", color: "#FFD23F" },
  { s: 12.3, e: 15.9, ref: "B", caja: [460, 980, 680, 1015], z: 2.1, titulo: "385", sub: "CONVERSACIONES A $0,19", color: "#2EE6A6" },
  { s: 16.0, e: 18.4, ref: "B", caja: [450, 800, 660, 978], z: 1.7, titulo: "4", sub: "CAMPAÑAS", color: "#22D3EE" },
  { s: 18.5, e: 20.8, ref: "B", caja: [450, 800, 660, 840], z: 2.1, titulo: "23", sub: "A $0,14 C/U", color: "#FFD23F" },
  { s: 20.85, e: 21.45, ref: "B", caja: [450, 848, 660, 885], z: 2.1, titulo: "58", sub: "A $0,14 C/U", color: "#FFD23F" },
  { s: 21.5, e: 23.0, ref: "B", caja: [450, 895, 660, 932], z: 2.1, titulo: "295", sub: "A $0,20 C/U", color: "#FF8A3D" },
  { s: 23.05, e: 24.45, ref: "B", caja: [450, 945, 660, 978], z: 2.1, titulo: "9", sub: "A $0,26 C/U", color: "#C084FC" },
];

const proyecta = (H: number[][], x: number, y: number) => {
  const w = H[2][0] * x + H[2][1] * y + H[2][2];
  return [(H[0][0] * x + H[0][1] * y + H[0][2]) / w, (H[1][0] * x + H[1][1] * y + H[1][2]) / w];
};
const esquinas = (H: number[][], c: number[]) => [[c[0], c[1]], [c[2], c[1]], [c[2], c[3]], [c[0], c[3]]].map(([x, y]) => proyecta(H, x, y));

const ease = Easing.bezier(0.65, 0, 0.35, 1);

export const ReelDetras: React.FC<DetrasProps> = (p) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const fc = p.face[Math.min(p.face.length - 1, f)] ?? [540, 450, 220];
  const H = p.homo[String(f)];
  const n = NUMS.find((x) => t >= x.s - 0.2 && t <= x.e + 0.2);
  // cámara: en los números, zoom centrado en la caja (siguiendo la pantalla); si no, un respiro suave
  let z = 1 + Math.sin(t * 0.6) * 0.015, cx = 540, cy = 960, poly: number[][] | null = null, k = 0;
  if (n && H) {
    poly = esquinas(H, n.caja);
    const mx = poly.reduce((a, q) => a + q[0], 0) / 4, my = poly.reduce((a, q) => a + q[1], 0) / 4;
    k = Math.min(interpolate(t, [n.s - 0.2, n.s + 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }),
      interpolate(t, [n.e - 0.05, n.e + 0.2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
    // sin saltos entre números seguidos: si el siguiente empieza enseguida, no soltar el zoom
    const sig = NUMS.find((x) => x.s > n.s && x.s - n.e < 0.2);
    if (sig && t > n.e - 0.05) k = 1;
    const ant = NUMS.find((x) => x.e < n.e && n.s - x.e < 0.2);
    if (ant && t < n.s + 0.15) k = 1;
    z = 1 + (n.z - 1) * k; cx = 540 + (mx - 540) * k; cy = 960 + (my - 190 / z - 960) * k;
  }
  // llevar (cx, cy) al centro con zoom z
  const tf = `translate(${540 - cx}px, ${960 - cy}px) scale(${z})`;
  const origin = `${cx}px ${cy}px`;
  const persona = conPersona(t);
  const vEnCurso = VUELOS.find((v) => t >= v.s && t < v.s + 0.25);
  const nEnCurso = NUMS.find((x) => t >= x.s && t < x.s + 0.25);
  const flash = vEnCurso || nEnCurso ? interpolate(t - (vEnCurso?.s ?? nEnCurso!.s), [0, 0.04, 0.25], [0, 0.35, 0], { extrapolateRight: "clamp" }) : 0;
  const colorAct = (n?.color ?? VUELOS.find((v) => t >= v.s && t <= v.e)?.color) ?? "#FFD23F";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: tf, transformOrigin: origin }}>
        <OffthreadVideo src={staticFile(p.video)} muted style={{ width: 1080, height: 1920 }} />
        {persona ? <CapaVuelos t={t} face={fc} atras /> : null}
        {persona ? <OffthreadVideo src={staticFile(p.persona)} transparent muted style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} /> : null}
        {poly && n ? (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <mask id="foco"><rect width={1080} height={1920} fill="#fff" /><polygon points={poly.map((q) => q.join(",")).join(" ")} fill="#000" /></mask>
            </defs>
            <rect width={1080} height={1920} fill="#000" opacity={0.55 * k} mask="url(#foco)" />
            <polygon points={poly.map((q) => q.join(",")).join(" ")} fill="none" stroke={n.color} strokeWidth={5 / Math.max(1, z)} strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 ${8 + Math.sin(t * 9) * 4}px ${n.color})` }} opacity={k} />
          </svg>
        ) : null}
      </AbsoluteFill>
      {/* al frente: lo que salió de atrás, o todo directo si no hay persona */}
      <AbsoluteFill style={{ transform: tf, transformOrigin: origin }}>
        <CapaVuelos t={t} face={fc} atras={false} />
        {!persona ? <CapaVuelos t={t} face={fc} atras /> : null}
      </AbsoluteFill>
      {/* rótulo grande del número de la laptop */}
      {n && k > 0.05 ? (() => {
        const lt = t - n.s;
        const sp = spring({ frame: Math.round(lt * FPS), fps: FPS, config: { damping: 11, stiffness: 150 } });
        const num = parseInt(n.titulo.replace(/\D/g, ""), 10);
        const cuenta = /^\d+$/.test(n.titulo) ? Math.round(interpolate(lt, [0, Math.min(0.7, (n.e - n.s) * 0.5)], [0, num], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) })).toString() : n.titulo;
        return (
          <div style={{ position: "absolute", top: BARRA + 70, left: 0, right: 0, textAlign: "center", opacity: k, transform: `scale(${interpolate(sp, [0, 1], [1.5, 1])})` }}>
            <div style={{ fontFamily: bebas, fontSize: 280, lineHeight: 0.9, color: n.color, textShadow: `0 0 50px ${n.color}, 0 10px 30px rgba(0,0,0,.9)` }}>{cuenta}</div>
            <div style={{ display: "inline-block", fontFamily: mont, fontWeight: 900, fontSize: 48, color: "#0A0A0A", background: n.color, padding: "6px 24px", borderRadius: 14 }}>{n.sub}</div>
          </div>
        );
      })() : null}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 0% 0%, ${colorAct}, transparent 50%)`, opacity: flash, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.65) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.1, mixBlendMode: "overlay" }}>
        <filter id={`gd${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 6} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={1080} height={1920} filter={`url(#gd${f % 6})`} />
      </svg>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: BARRA, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: BARRA, background: "#000" }}>
        <div style={{ height: 6, width: `${(t / p.fin) * 100}%`, background: `linear-gradient(90deg, ${colorAct}, #fff)` }} />
      </div>
    </AbsoluteFill>
  );
};

export const DetrasComposition = () => (
  <Composition id="ReelDetras" component={ReelDetras} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 10}
    defaultProps={{ video: "prueba/detras.mp4", persona: "prueba/detras-persona.webm", fin: 10, face: [], homo: {} } as DetrasProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
