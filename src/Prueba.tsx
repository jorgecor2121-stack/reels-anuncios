// Prueba de edición profesional sobre un video real a cámara (no es para Instagram).
// Color, zooms dinámicos, subtítulos palabra a palabra, gráficos que ilustran lo que dice y cierre con llamado.
import { AbsoluteFill, Composition, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const FPS = 30;
const S = (s: number) => Math.round(s * FPS);
const K = { rosa: "#FF4FA3", oro: "#FFD23F", verde: "#25D366", t: "#FFFFFF", sombra: "rgba(0,0,0,.55)" };

type Palabra = { w: string; start: number; end: number };
export type PruebaProps = { palabras: Palabra[]; fin: number; momentos: Record<string, number> };

const sp = (f: number, d: number, fps: number, damping = 11, stiffness = 180) => spring({ frame: f - d, fps, config: { damping, stiffness } });
const RESALTAR = ["bellas", "nuevas", "promociones", "tienda", "física", "vega", "envíos", "país", "dm", "whatsapp", "envío"];
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");

// ---------- Subtítulos: grupos de 3 palabras, la palabra actual salta y se pinta ----------
const Subtitulos: React.FC<{ ws: Palabra[] }> = ({ ws }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const i = ws.findIndex((x, k) => t >= x.start && t < (ws[k + 1]?.start ?? x.end + 0.4));
  if (i < 0) return null;
  const g0 = Math.floor(i / 3) * 3;
  const grupo = ws.slice(g0, g0 + 3);
  const hl = new Set(RESALTAR.map(norm));
  return (
    <div style={{ position: "absolute", top: 1330, left: 30, right: 30, textAlign: "center" }}>
      {grupo.map((x, j) => {
        const on = t >= x.start;
        const act = g0 + j === i;
        const p = sp(f, S(x.start), fps, 10, 240);
        const color = hl.has(norm(x.w)) ? K.oro : K.t;
        return (
          <span key={j} style={{ display: "inline-block", margin: "0 14px", fontSize: 80, fontWeight: 900, color: act ? "#1A0010" : color,
            background: act ? K.rosa : "transparent", borderRadius: 18, padding: "0 14px", opacity: on ? 1 : 0.35,
            transform: `scale(${on ? interpolate(p, [0, 1], [0.6, act ? 1.04 : 1]) : 0.9}) rotate(${act ? -2 : 0}deg)`,
            WebkitTextStroke: act ? "0" : "3px #000", textShadow: act ? "none" : "0 6px 0 #000" }}>{x.w}</span>
        );
      })}
    </div>
  );
};

// ---------- Tarjeta animada que entra desde un lado ----------
const Tarjeta: React.FC<{ desde: number; hasta: number; lado: "izq" | "der"; top: number; children: React.ReactNode; color?: string }> = ({ desde, hasta, lado, top, children, color = K.rosa }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < S(desde) || f > S(hasta) + 10) return null;
  const p = sp(f, S(desde), fps);
  const out = interpolate(f, [S(hasta), S(hasta) + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(p, [0, 1], [lado === "izq" ? -700 : 700, 0]);
  return (
    <div style={{ position: "absolute", top, [lado === "izq" ? "left" : "right"]: 40, transform: `translateX(${x}px) rotate(${lado === "izq" ? -3 : 3}deg)`, opacity: out,
      background: "rgba(255,255,255,.96)", borderRadius: 34, padding: "22px 34px", boxShadow: `0 20px 60px rgba(0,0,0,.35), 0 0 0 6px ${color}`,
      color: "#1A1A22", fontWeight: 900, fontSize: 52, display: "flex", alignItems: "center", gap: 18 }}>{children}</div>
  );
};

// ---------- Brillos (sparkles) ----------
const Brillos: React.FC<{ desde: number; n?: number; zona?: [number, number, number, number] }> = ({ desde, n = 10, zona = [40, 820, 1040, 1250] }) => {
  const f = useCurrentFrame();
  const t = f - S(desde);
  if (t < 0 || t > 50) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const x = zona[0] + ((i * 263) % (zona[2] - zona[0])), y = zona[1] + ((i * 151) % (zona[3] - zona[1]));
        const s = Math.sin(((t - i * 2) / 30) * Math.PI);
        return <div key={i} style={{ position: "absolute", left: x, top: y, fontSize: 50 + (i % 3) * 20, opacity: Math.max(0, s), transform: `scale(${Math.max(0, s)}) rotate(${t * 4}deg)` }}>{i % 2 ? "✨" : "💖"}</div>;
      })}
    </>
  );
};

// ---------- Pin de mapa que cae ----------
const PinMapa: React.FC<{ desde: number; hasta: number }> = ({ desde, hasta }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < S(desde) || f > S(hasta) + 10) return null;
  const drop = sp(f, S(desde), fps, 8, 200);
  const out = interpolate(f, [S(hasta), S(hasta) + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring = ((f - S(desde)) % 30) / 30;
  return (
    <div style={{ position: "absolute", top: 860, right: 40, width: 380, opacity: out, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 340, height: 240, borderRadius: 30, background: "linear-gradient(135deg,#BDE6C8,#8FD3A8)", border: "6px solid #fff", boxShadow: "0 20px 60px rgba(0,0,0,.35)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 110, height: 18, background: "#fff", transform: "rotate(-12deg)" }} />
        <div style={{ position: "absolute", left: 160, top: -20, width: 18, height: 300, background: "#fff", transform: "rotate(18deg)" }} />
        <div style={{ position: "absolute", left: 170 - 60 * ring, top: 150 - 25 * ring, width: 120 * ring, height: 50 * ring, borderRadius: "50%", border: `5px solid ${K.rosa}`, opacity: 1 - ring }} />
        <div style={{ position: "absolute", left: 130, top: interpolate(drop, [0, 1], [-160, 40]), fontSize: 110 }}>📍</div>
      </div>
      <div style={{ marginTop: 14, background: K.rosa, color: "#fff", fontWeight: 900, fontSize: 48, padding: "10px 28px", borderRadius: 30, transform: `scale(${sp(f, S(desde) + 8, fps)})` }}>La Vega, RD</div>
    </div>
  );
};

// ---------- Camión de envíos que cruza ----------
const Camion: React.FC<{ desde: number; hasta: number }> = ({ desde, hasta }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < S(desde) || f > S(hasta) + 10) return null;
  const x = interpolate(f, [S(desde), S(hasta)], [-300, 1180], { extrapolateRight: "clamp" });
  const bump = Math.abs(Math.sin(f / 3)) * 6;
  const out = interpolate(f, [S(hasta), S(hasta) + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: out }}>
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, height: 10, background: "repeating-linear-gradient(90deg,#fff 0 40px,transparent 40px 80px)", opacity: 0.8 }} />
      <div style={{ position: "absolute", top: 1030 - bump, left: x, fontSize: 170, transform: "scaleX(-1)" }}>🚚</div>
      {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", top: 1110 + i * 18, left: x + 200 + i * 30, width: 60 - i * 15, height: 8, borderRadius: 4, background: "#fff", opacity: 0.6 }} />)}
      <div style={{ position: "absolute", top: 860, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${sp(f, S(desde) + 5, fps)})` }}>
        <div style={{ background: K.oro, color: "#1A1000", fontWeight: 900, fontSize: 60, padding: "14px 36px", borderRadius: 34, boxShadow: "0 16px 40px rgba(0,0,0,.35)" }}>📦 Envíos a todo el país</div>
      </div>
    </div>
  );
};

// ---------- Botones DM / WhatsApp ----------
const Botones: React.FC<{ dm: number; wa: number; hasta: number }> = ({ dm, wa, hasta }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < S(dm) || f > S(hasta) + 10) return null;
  const out = interpolate(f, [S(hasta), S(hasta) + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const b = (d: number, bg: string, txt: string, icon: string) => {
    const p = sp(f, S(d), fps, 8, 220);
    const pulse = 1 + Math.sin(f / 4) * 0.04;
    return (
      <div style={{ transform: `scale(${p * pulse})`, background: bg, color: "#fff", fontWeight: 900, fontSize: 56, padding: "20px 38px", borderRadius: 40,
        display: "flex", alignItems: "center", gap: 16, boxShadow: `0 16px 50px ${bg}99` }}><span style={{ fontSize: 64 }}>{icon}</span>{txt}</div>
    );
  };
  return (
    <div style={{ position: "absolute", top: 960, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: out }}>
      {b(dm, "linear-gradient(90deg,#8B5CF6,#FF4FA3,#FF8A3D)", "Escríbenos al DM", "💬")}
      {b(wa, K.verde, "o por WhatsApp", "📱")}
    </div>
  );
};

// ---------- Cierre ----------
const Cierre: React.FC<{ desde: number; fin: number }> = ({ desde, fin }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < S(desde)) return null;
  const p = sp(f, S(desde), fps, 12, 140);
  return (
    <AbsoluteFill style={{ background: `rgba(20,0,15,${0.55 * p})`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
      <div style={{ fontSize: 120, transform: `scale(${p}) rotate(${interpolate(p, [0, 1], [-20, 0])}deg)` }}>🛍️</div>
      <div style={{ fontSize: 84, fontWeight: 900, color: "#fff", textAlign: "center", lineHeight: 1.05, transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px)`, opacity: p }}>
        ¡Te esperamos!<br /><span style={{ color: K.oro }}>Tienda física · Envíos</span>
      </div>
      <div style={{ background: K.rosa, color: "#fff", fontWeight: 900, fontSize: 56, padding: "18px 44px", borderRadius: 40, transform: `scale(${sp(f, S(desde) + 10, fps, 8, 200) * (1 + Math.sin(f / 4) * 0.04)})` }}>📲 Escríbenos ahora</div>
    </AbsoluteFill>
  );
};

export const PruebaEdicion: React.FC<PruebaProps> = ({ palabras, fin, momentos: m }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Zoom dinámico: golpe de acercamiento en cada momento clave + leve deriva continua
  const golpes = [0, m.chicas, m.tienda, m.envios, m.dm];
  const g = golpes.reduce((a, x, i) => (f >= S(x) ? i : a), 0);
  const desde = S(golpes[g]);
  const punch = interpolate(f - desde, [0, 6, 16], [1.08, 1.03, 1.02], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = (g % 2 ? 1.06 : 1.0) * punch + ((f - desde) / fps) * 0.01;
  const ox = g % 2 ? -3 : 2;
  const flash = interpolate(f - desde, [0, 2, 7], [g ? 0.35 : 0, 0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = f - desde < 5 && g ? Math.sin(f * 9) * 6 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom}) translate(${ox}%, 0%) translateX(${shake}px)`, transformOrigin: "50% 22%" }}>
        <OffthreadVideo src={staticFile("prueba/fuente.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.1) saturate(1.18) brightness(1.04)" }} />
      </AbsoluteFill>
      {/* gradación cálida + viñeta + destellos de luz */}
      <AbsoluteFill style={{ background: "linear-gradient(160deg, rgba(255,120,170,.14), rgba(255,200,120,.08) 50%, rgba(120,80,255,.10))", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${20 + Math.sin(f / 40) * 15}% 10%, rgba(255,200,150,.22), transparent 40%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />

      {/* gráficos según lo que dice */}
      <Brillos desde={0.2} />
      <Tarjeta desde={0.2} hasta={3.4} lado="izq" top={1000}>💖 ¡Feliz y bendecido día!</Tarjeta>
      <Tarjeta desde={m.chicas} hasta={m.promos + 1.6} lado="der" top={1000}>👋 ¡Bienvenidas, chicas nuevas!</Tarjeta>
      <Tarjeta desde={m.promos} hasta={m.tienda - 0.1} lado="izq" top={1130} color={K.oro}>🔥 Promociones</Tarjeta>
      <Brillos desde={m.promos} n={8} zona={[40, 850, 1040, 1250]} />
      <Tarjeta desde={m.tienda} hasta={m.vega + 2.2} lado="izq" top={1050}>🏬 Tienda física</Tarjeta>
      <PinMapa desde={m.vega - 0.4} hasta={m.envios - 0.1} />
      <Camion desde={m.envios} hasta={m.escribir - 0.2} />
      <Botones dm={m.dm - 0.3} wa={m.wa - 0.2} hasta={m.cierre - 0.1} />

      <Subtitulos ws={palabras} />
      <Cierre desde={m.cierre} fin={fin} />
      {/* barra de progreso rosa */}
      <div style={{ position: "absolute", bottom: 0, left: 0, height: 10, width: `${Math.min(1, f / S(fin)) * 100}%`, background: `linear-gradient(90deg, ${K.rosa}, ${K.oro})` }} />
    </AbsoluteFill>
  );
};

export const PruebaComposition = () => (
  <Composition id="PruebaEdicion" component={PruebaEdicion} durationInFrames={S(10)} fps={FPS} width={1080} height={1920}
    defaultProps={{ palabras: [], fin: 10, momentos: {} } as PruebaProps}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.fin) })} />
);
