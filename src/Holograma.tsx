// Edición "holograma": la persona sostiene pantallas de luz entre sus manos (siguen sus movimientos),
// sus manos dejan estelas y sueltan chispas cuando se mueven rápido, y palabras gigantes pasan detrás de él.
// Estructura: gancho, introducción, cuerpo 1, bucle abierto, cuerpo 2, segundo bucle, expectativa, llamado a la acción.
import { AbsoluteFill, Composition, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

const { fontFamily: bebas } = loadBebas();
const { fontFamily: mont } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const FPS = 30;
const C = { cyan: "#38E8FF", azul: "#3B82F6", rojo: "#FF3B5C", verde: "#2EE6A6", oro: "#FFD23F", morado: "#A78BFA" };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sp = (t: number, s: number, d = 11, k = 170) => spring({ frame: Math.round((t - s) * FPS), fps: FPS, config: { damping: d, stiffness: k } });

type Palabra = { w: string; s: number; e: number };
type Mano = [number, number, number, number]; // x, y, visible(0/1), velocidad px/frame
export type HoloProps = { video: string; persona: string; fin: number; words: Palabra[]; face: number[][]; izq: Mano[]; der: Mano[] };

// Piezas (segundos del video recortado)
const PZ = { gancho: 0, intro: 2.2, cuerpo1: 8.0, bucle: 16.6, cuerpo2: 20.35, bucle2: 24.8, expect: 27.5, cta: 30.85 };

// ---------------- Contenido de los hologramas ----------------
const Grafica: React.FC<{ lt: number; cae: number }> = ({ lt, cae }) => {
  const sube = [0.2, 0.35, 0.3, 0.55, 0.5, 0.75, 0.9];
  const pts = sube.map((v, i) => [i * 60, 170 - interpolate(cae, [0, 1], [v, i < 3 ? v : Math.max(0.05, v - (i - 2) * 0.28)]) * 160]);
  const n = Math.min(pts.length, Math.ceil(lt * 6) + 1);
  const col = cae > 0.3 ? C.rojo : C.verde;
  return (
    <svg width={380} height={190} viewBox="0 0 380 190">
      <polyline points={pts.slice(0, n).map((p) => p.join(",")).join(" ")} fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
      {pts.slice(0, n).map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={6} fill={col} />)}
    </svg>
  );
};

const Contenido: React.FC<{ t: number }> = ({ t }) => {
  const txt = (s: string, c = "#fff", size = 46) => <div style={{ fontFamily: mont, fontWeight: 900, fontSize: size, color: c, textShadow: `0 0 18px ${c}` }}>{s}</div>;
  if (t < PZ.intro) return <><Grafica lt={t} cae={0} />{txt("VENDÍAS ✅", C.verde)}</>;
  if (t < PZ.cuerpo1) {
    const cae = interpolate(t, [PZ.intro + 0.2, PZ.intro + 1.2], [0, 1], clamp);
    return <><Grafica lt={9} cae={cae} />{txt(t > 5.3 ? "RESULTADOS ≠ 📉" : "INVIERTES… 💸", C.rojo)}</>;
  }
  if (t < PZ.bucle) {
    if (t < 11.5) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
        {[["TU PRODUCTO", 9.9], ["EL COSTO", 10.9]].map(([l, s]) => (
          <div key={l as string} style={{ fontFamily: mont, fontWeight: 900, fontSize: 44, color: "#fff", opacity: t > (s as number) - 0.3 ? 1 : 0.25, textDecoration: t > (s as number) ? `line-through 6px ${C.rojo}` : "none" }}>❌ {l}</div>
        ))}
      </div>
    );
    return <>{txt("🤖 META ANDRÓMEDA", C.cyan, 44)}{txt("NUEVA IA = NUEVAS REGLAS", "#fff", 32)}</>;
  }
  if (t < PZ.cuerpo2) {
    const rompe = interpolate(t, [19.0, 19.5], [0, 1], clamp);
    return (
      <div style={{ display: "flex", gap: 16 }}>
        {["🎯 MANUAL", "📋 INTERESES"].map((l, i) => (
          <div key={i} style={{ border: `3px solid ${rompe > 0 ? C.rojo : C.cyan}`, borderRadius: 18, padding: "14px 18px", fontFamily: mont, fontWeight: 900, fontSize: 34, color: "#fff",
            transform: `translate(${(i ? 1 : -1) * rompe * 60}px, ${rompe * 40}px) rotate(${(i ? 1 : -1) * rompe * 18}deg)`, opacity: 1 - rompe * 0.5 }}>{l}</div>
        ))}
      </div>
    );
  }
  if (t < PZ.bucle2) {
    const claves = [["🎨", "CREATIVIDADES", 20.6], ["🎯", "ÁNGULOS", 21.6], ["🧱", "ESTRUCTURA", 22.5]];
    return (
      <>
        {txt("LAS 3 CLAVES", C.oro, 40)}
        <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
          {claves.map(([e, n, s]) => {
            const p = sp(t, s as number, 8, 200);
            return <div key={n as string} style={{ transform: `scale(${p})`, textAlign: "center", border: `3px solid ${C.oro}`, borderRadius: 18, padding: "10px 12px", minWidth: 150 }}>
              <div style={{ fontSize: 60 }}>{e}</div><div style={{ fontFamily: mont, fontWeight: 900, fontSize: 22, color: "#fff" }}>{n}</div></div>;
          })}
        </div>
      </>
    );
  }
  if (t < PZ.expect) {
    const scan = ((t - PZ.bucle2) * 0.8) % 1;
    return (
      <div style={{ position: "relative", padding: "6px 10px", textAlign: "center" }}>
        <div style={{ fontSize: 90 }}>🔒</div>
        {txt("EL SECRETO DE LAS SEÑALES", C.morado, 36)}
        {txt("lo revelo en el taller", "#fff", 28)}
        <div style={{ position: "absolute", left: -20, right: -20, top: `${scan * 100}%`, height: 4, background: C.morado, boxShadow: `0 0 20px ${C.morado}` }} />
      </div>
    );
  }
  if (t < PZ.cta) {
    const plazas = Math.max(4, Math.round(interpolate(t, [27.6, 29.0], [20, 6], clamp)));
    return (
      <>
        {txt(`🪑 PLAZAS: ${plazas}`, C.oro, 44)}
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          {[["SÁB", "21", 28.8], ["JUE", "26", 29.66]].map(([d, n, s]) => (
            <div key={d as string} style={{ transform: `scale(${sp(t, s as number, 8)})`, background: "#fff", borderRadius: 18, overflow: "hidden", width: 130, textAlign: "center" }}>
              <div style={{ background: C.rojo, color: "#fff", fontFamily: mont, fontWeight: 900, fontSize: 22 }}>NOV · {d}</div>
              <div style={{ fontFamily: bebas, fontSize: 80, color: "#111", lineHeight: 1.1 }}>{n}</div>
            </div>
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <div style={{ fontFamily: mont, fontWeight: 900, fontSize: 30, color: "#fff" }}>TALLER EN VIVO · META ADS</div>
      <div style={{ fontFamily: bebas, fontSize: 110, color: C.oro, lineHeight: 1, textShadow: `0 0 30px ${C.oro}` }}>RD$2,000</div>
      {t > 32.7 ? <div style={{ transform: `scale(${sp(t, 32.7, 8)})`, background: C.verde, color: "#04210F", fontFamily: mont, fontWeight: 900, fontSize: 36, padding: "8px 22px", borderRadius: 14 }}>📩 ESCRÍBEME AHORA</div> : null}
    </>
  );
};

// cambia de "tarjeta" en cada pieza (para el parpadeo de encendido)
const cortes = [PZ.gancho, PZ.intro, PZ.cuerpo1, 11.5, PZ.bucle, PZ.cuerpo2, PZ.bucle2, PZ.expect, PZ.cta];

const Holo: React.FC<{ t: number; izq: Mano; der: Mano; face: number[] }> = ({ t, izq, der, face }) => {
  const s = Math.max(...cortes.filter((c) => c <= t));
  const lt = t - s;
  const enc = lt < 0.3 ? (Math.floor(lt * 40) % 2 ? 0.3 : 1) : 1; // parpadeo al encender
  const ambos = izq[2] > 0.5 && der[2] > 0.5;
  // centro entre las manos (o sobre la mano visible), siempre por debajo de la cara
  const mx = ambos ? (izq[0] + der[0]) / 2 : izq[2] > 0.5 ? izq[0] + 200 : der[0] - 200;
  const my = ambos ? Math.min(izq[1], der[1]) : izq[2] > 0.5 ? izq[1] : der[1];
  const ancho = Math.max(460, Math.min(780, ambos ? Math.abs(der[0] - izq[0]) + 140 : 520));
  const minTop = face[1] + face[2] * 0.95;
  const cx = Math.max(ancho / 2 + 20, Math.min(1060 - ancho / 2, mx));
  const bottom = Math.max(minTop + 300, my - 40);
  const p = sp(t, s, 12, 180);
  return (
    <>
      {/* haces de luz desde las manos hacia la pantalla */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="haz" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={C.cyan} stopOpacity={0.55} /><stop offset="100%" stopColor={C.cyan} stopOpacity={0.05} /></linearGradient>
        </defs>
        {[izq, der].filter((h) => h[2] > 0.5).map((h, i) => (
          <polygon key={i} points={`${h[0] - 18},${h[1]} ${h[0] + 18},${h[1]} ${cx + (i ? ancho / 2 : -ancho / 2) * 0.9},${bottom} ${cx + (i ? ancho / 2 - 120 : -ancho / 2 + 120)},${bottom}`} fill="url(#haz)" opacity={enc * p} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: cx - ancho / 2, top: bottom, width: ancho, transform: `translateY(-100%) scale(${interpolate(p, [0, 1], [0.6, 1])}) perspective(900px) rotateX(8deg)`, transformOrigin: "50% 100%", opacity: enc,
        background: "linear-gradient(180deg, rgba(56,232,255,.18), rgba(30,80,160,.28))", border: `3px solid ${C.cyan}`, borderRadius: 26, boxShadow: `0 0 40px ${C.cyan}88, inset 0 0 40px ${C.cyan}33`,
        padding: "18px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, overflow: "hidden" }}>
        {/* líneas de escaneo */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 2px, transparent 2px 6px)", pointerEvents: "none" }} />
        <Contenido t={t} />
      </div>
    </>
  );
};

// estelas de luz y chispas en las manos
const Estelas: React.FC<{ f: number; izq: Mano[]; der: Mano[] }> = ({ f, izq, der }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    {[izq, der].map((arr, k) => {
      const pts = [];
      for (let j = Math.max(0, f - 10); j <= f; j++) if (arr[j] && arr[j][2] > 0.5) pts.push(`${arr[j][0]},${arr[j][1]}`);
      const v = arr[f]?.[3] ?? 0;
      const col = k ? C.cyan : C.morado;
      const chispas = v > 22 ? Array.from({ length: 8 }).map((_, i) => {
        const a = i * 0.8 + f * 0.3, r = 20 + ((f * 7 + i * 13) % 50);
        return <circle key={i} cx={arr[f][0] + Math.cos(a) * r} cy={arr[f][1] + Math.sin(a) * r} r={4} fill="#fff" opacity={0.9} style={{ filter: `drop-shadow(0 0 6px ${col})` }} />;
      }) : null;
      return (
        <g key={k}>
          {pts.length > 1 ? <polyline points={pts.join(" ")} fill="none" stroke={col} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} style={{ filter: `blur(3px) drop-shadow(0 0 10px ${col})` }} /> : null}
          {arr[f]?.[2] > 0.5 ? <circle cx={arr[f][0]} cy={arr[f][1]} r={16 + Math.sin(f / 4) * 4} fill={col} opacity={0.35} style={{ filter: "blur(6px)" }} /> : null}
          {chispas}
        </g>
      );
    })}
  </svg>
);

// palabras gigantes detrás de la persona
const DETRAS = [
  { s: 7.2, e: 8.0, txt: "¡ATENCIÓN!", c: C.oro },
  { s: 13.7, e: 15.7, txt: "2025", c: C.rojo, tacha: true },
  { s: 15.7, e: 16.6, txt: "2026", c: C.cyan },
  { s: 19.0, e: 20.3, txt: "¿ENTONCES?", c: C.morado },
  { s: 31.7, e: 33.0, txt: "RD$2,000", c: C.oro },
];
const Detras: React.FC<{ t: number }> = ({ t }) => {
  const d = DETRAS.find((x) => t >= x.s && t <= x.e);
  if (!d) return null;
  const p = sp(t, d.s, 9, 160);
  const tacha = d.tacha ? interpolate(t, [15.2, 15.5], [0, 1], clamp) : 0;
  return (
    <div style={{ position: "absolute", top: 220, left: -60, right: -60, textAlign: "center", fontFamily: bebas, fontSize: Math.min(420, 1150 / (d.txt.length * 0.47)), lineHeight: 1, color: d.c,
      transform: `scale(${interpolate(p, [0, 1], [0.4, 1]) * (1 + (t - d.s) * 0.03)})`, textShadow: `0 0 60px ${d.c}`, letterSpacing: 6 }}>
      <span style={{ position: "relative" }}>{d.txt}
        {tacha > 0 ? <span style={{ position: "absolute", left: -10, top: "48%", height: 26, width: `${tacha * 105}%`, background: "#fff", boxShadow: "0 0 20px #fff", transform: "rotate(-8deg)" }} /> : null}
      </span>
    </div>
  );
};

const CLAVE = /^(promocionabas|vendías|resultados|atención|problema|producto|costo|2026|2025|métodos|segmentar|intereses|nada|aprender|taller|vivo|plazas|sábado|21|jueves|26|noviembre|2|mil|pesos|escríbeme|ventas)$/i;
const Subtitulos: React.FC<{ words: Palabra[]; t: number }> = ({ words, t }) => {
  const i = words.findIndex((w) => t >= w.s && t < w.e + 0.3);
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 150, textAlign: "center", fontFamily: mont, fontWeight: 900, fontSize: 58, textTransform: "uppercase" }}>
      {words.slice(g, g + 3).map((w, k) => {
        const on = t >= w.s, clave = CLAVE.test(w.w.replace(/[.,¿?¡!]+$/g, ""));
        return <span key={k} style={{ display: "inline-block", margin: "0 10px", opacity: on ? 1 : 0, color: clave ? C.cyan : "#fff", transform: `scale(${on ? interpolate(sp(t, w.s, 10, 240), [0, 1], [1.4, 1]) : 1})`,
          WebkitTextStroke: "3px #000", paintOrder: "stroke", textShadow: clave ? `0 0 20px ${C.cyan}` : "0 6px 16px rgba(0,0,0,.8)" }}>{w.w.replace(/[.,]+$/, "")}</span>;
      })}
    </div>
  );
};

export const ReelHolograma: React.FC<HoloProps> = (p) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const fc = p.face[Math.min(p.face.length - 1, f)] ?? [540, 520, 220];
  const izq = p.izq[Math.min(p.izq.length - 1, f)] ?? [300, 1300, 0, 0];
  const der = p.der[Math.min(p.der.length - 1, f)] ?? [780, 1300, 0, 0];
  const corte = Math.max(...cortes.filter((c) => c <= t));
  const flash = interpolate(t - corte, [0, 0.04, 0.22], [0, 0.45, 0], clamp);
  const punch = interpolate(t - corte, [0, 0.1, 0.6], [1.08, 1.04, 1], clamp);
  const z = Math.max(punch, interpolate(t, [PZ.cta, p.fin], [1, 1.18], clamp));
  // tono de sala: un poco más frío y oscuro el fondo, la persona intacta
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${fc[0]}px ${fc[1]}px` }}>
        <OffthreadVideo src={staticFile(p.video)} muted style={{ width: 1080, height: 1920, filter: "brightness(.55) saturate(.8)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(56,232,255,.18), rgba(10,10,30,.55) 75%)" }} />
        <Detras t={t} />
        <OffthreadVideo src={staticFile(p.persona)} transparent muted style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
        <Estelas f={f} izq={p.izq} der={p.der} />
        <Holo t={t} izq={izq} der={der} face={fc} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, ${C.cyan}, transparent 60%)`, opacity: flash, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 60%, rgba(0,0,0,.6) 100%)" }} />
      <Subtitulos words={p.words} t={t} />
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(t / p.fin) * 100}%`, background: `linear-gradient(90deg, ${C.morado}, ${C.cyan})` }} />
    </AbsoluteFill>
  );
};

export const HologramaComposition = () => (
  <Composition id="ReelHolograma" component={ReelHolograma} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 10}
    defaultProps={{ video: "prueba/holo.mp4", persona: "prueba/holo-persona.webm", fin: 10, words: [], face: [], izq: [], der: [] } as HoloProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
