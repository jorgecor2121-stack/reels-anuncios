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







// ================= GRÁFICOS NUEVOS =================
// Corazones que suben como en un en vivo
const Corazones: React.FC<{ desde: number; hasta: number }> = ({ desde, hasta }) => {
  const f = useCurrentFrame();
  if (f < S(desde) || f > S(hasta) + 60) return null;
  return (
    <>
      {Array.from({ length: 16 }).map((_, i) => {
        const t0 = S(desde) + i * 6;
        const t = (f - t0) / 55;
        if (t < 0 || t > 1 || t0 > S(hasta)) return null;
        const x = 900 + Math.sin(t * 6 + i) * 40 - (i % 3) * 30;
        return <div key={i} style={{ position: "absolute", left: x, top: 1250 - t * 650, fontSize: 56 + (i % 3) * 16, opacity: 1 - t, transform: `scale(${Math.min(1, t * 5)}) rotate(${Math.sin(t * 5 + i) * 15}deg)` }}>{["💖", "💗", "🩷", "❤️"][i % 4]}</div>;
      })}
    </>
  );
};

// Confeti
const Confeti: React.FC<{ desde: number }> = ({ desde }) => {
  const f = useCurrentFrame();
  const t = (f - S(desde)) / 45;
  if (t < 0 || t > 1) return null;
  const cols = [K.rosa, K.oro, "#8B5CF6", "#22D3EE", "#fff"];
  return (
    <>
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2, v = 380 + (i % 5) * 60;
        const x = 540 + Math.cos(a) * v * t, y = 1050 + Math.sin(a) * v * t * 0.7 + 500 * t * t;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 10, borderRadius: 3, background: cols[i % 5], opacity: 1 - t, transform: `rotate(${t * 900 + i * 40}deg)` }} />;
      })}
    </>
  );
};

// Etiqueta de oferta que se balancea + bolsas que saltan
const Oferta: React.FC<{ desde: number; hasta: number }> = ({ desde, hasta }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < S(desde) || f > S(hasta) + 10) return null;
  const p = sp(f, S(desde), fps, 7, 160);
  const out = interpolate(f, [S(hasta), S(hasta) + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const swing = Math.sin((f - S(desde)) / 6) * 14 * Math.exp(-(f - S(desde)) / 60) + Math.sin(f / 12) * 3;
  return (
    <div style={{ position: "absolute", top: 820, right: 50, opacity: out, width: 360, height: 460 }}>
      <svg width="360" height="460" style={{ position: "absolute", transform: `scale(${p}) rotate(${swing}deg)`, transformOrigin: "180px 0px" }}>
        <line x1="180" y1="0" x2="180" y2="70" stroke="#fff" strokeWidth="5" />
        <path d="M80 110 L180 70 L280 110 L280 330 Q280 350 260 350 L100 350 Q80 350 80 330 Z" fill={K.rosa} stroke="#fff" strokeWidth="8" />
        <circle cx="180" cy="110" r="16" fill="#fff" />
        <text x="180" y="225" textAnchor="middle" fontSize="88" fontWeight="900" fill="#fff" fontFamily={fontFamily}>%</text>
        <text x="180" y="300" textAnchor="middle" fontSize="44" fontWeight="900" fill={K.oro} fontFamily={fontFamily}>OFERTAS</text>
      </svg>
      {[0, 1, 2].map((i) => {
        const b = sp(f, S(desde) + 10 + i * 6, fps, 6, 220);
        return <div key={i} style={{ position: "absolute", top: 360 + Math.sin(f / 7 + i) * 8, left: 30 + i * 105, fontSize: 90, transform: `scale(${b}) rotate(${(i - 1) * 12}deg)` }}>🛍️</div>;
      })}
    </div>
  );
};

// Tienda que se arma: paredes, toldo a rayas y letrero ABIERTO que se voltea
const Tienda: React.FC<{ desde: number; hasta: number }> = ({ desde, hasta }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < S(desde) || f > S(hasta) + 10) return null;
  const out = interpolate(f, [S(hasta), S(hasta) + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const muro = sp(f, S(desde), fps, 14, 140);
  const toldo = sp(f, S(desde) + 8, fps, 8, 180);
  const cartel = interpolate(f, [S(desde) + 16, S(desde) + 26], [90, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const luz = 0.6 + 0.4 * Math.sin(f / 5);
  return (
    <div style={{ position: "absolute", top: 830, left: 40, opacity: out }}>
      <svg width="440" height="420">
        <g transform={`translate(0 ${(1 - muro) * 300})`} opacity={muro}>
          <rect x="30" y="140" width="380" height="260" rx="10" fill="#FFF6FA" stroke="#2A1020" strokeWidth="7" />
          <rect x="70" y="210" width="130" height="120" rx="8" fill="#BEE3F8" stroke="#2A1020" strokeWidth="6" />
          <text x="135" y="290" textAnchor="middle" fontSize="60">👗</text>
          <rect x="250" y="210" width="110" height="190" rx="8" fill="#8B5CF6" stroke="#2A1020" strokeWidth="6" />
          <circle cx="342" cy="305" r="7" fill={K.oro} />
        </g>
        <g transform={`translate(0 ${(1 - toldo) * -200})`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={i} d={`M ${20 + i * 50} 90 L ${70 + i * 50} 90 L ${70 + i * 50} 150 Q ${45 + i * 50} 175 ${20 + i * 50} 150 Z`} fill={i % 2 ? "#fff" : K.rosa} stroke="#2A1020" strokeWidth="5" />
          ))}
          <rect x="15" y="70" width="410" height="26" rx="8" fill="#2A1020" />
        </g>
        <g transform={`translate(220 30) scale(1 ${Math.cos((cartel * Math.PI) / 180)})`}>
          <rect x="-110" y="-28" width="220" height="56" rx="14" fill={K.verde} stroke="#fff" strokeWidth="5" />
          <text x="0" y="14" textAnchor="middle" fontSize="36" fontWeight="900" fill="#fff" fontFamily={fontFamily}>ABIERTO</text>
        </g>
        {[60, 380].map((x, i) => <circle key={i} cx={x} cy={110} r="10" fill={K.oro} opacity={luz} />)}
      </svg>
      <div style={{ marginTop: -6, marginLeft: 70, display: "inline-block", background: "rgba(255,255,255,.96)", color: "#1A1A22", fontWeight: 900, fontSize: 46, padding: "10px 26px", borderRadius: 24,
        boxShadow: `0 0 0 5px ${K.rosa}`, transform: `scale(${sp(f, S(desde) + 20, fps)})` }}>🏬 Tienda física</div>
    </div>
  );
};

// Mapa: pin en La Vega y luego rutas de envío a todo el país con paquetes viajando
const Rutas: React.FC<{ pin: number; envios: number; hasta: number }> = ({ pin, envios, hasta }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < S(pin) || f > S(hasta) + 10) return null;
  const out = interpolate(f, [S(hasta), S(hasta) + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = sp(f, S(pin), fps, 13, 140);
  const drop = sp(f, S(pin) + 6, fps, 7, 200);
  const O: [number, number] = [250, 200]; // La Vega
  const destinos: [string, number, number][] = [["Santiago", 150, 130], ["Puerto Plata", 210, 60], ["Santo Domingo", 360, 300], ["Punta Cana", 560, 250], ["Barahona", 90, 330]];
  return (
    <div style={{ position: "absolute", top: 820, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ transform: `scale(${card})`, background: "rgba(255,255,255,.96)", borderRadius: 34, padding: 16, boxShadow: "0 24px 70px rgba(0,0,0,.35)" }}>
        <svg width="640" height="400">
          <path d="M30 220 Q40 120 130 90 Q210 30 320 70 Q430 90 520 150 Q620 190 610 260 Q600 320 470 320 Q380 360 280 340 Q160 370 80 330 Q20 300 30 220 Z" fill="#CDEFD9" stroke="#8FD3A8" strokeWidth="6" />
          {destinos.map(([n, x, y], i) => {
            const L = Math.hypot(x - O[0], y - O[1]);
            const d0 = S(envios) + i * 5;
            const draw = interpolate(f, [d0, d0 + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const pk = ((f - d0 - 10) % 40) / 40;
            return (
              <g key={n}>
                <line x1={O[0]} y1={O[1]} x2={x} y2={y} stroke={K.rosa} strokeWidth="6" strokeDasharray={`${L}`} strokeDashoffset={L * (1 - draw)} strokeLinecap="round" />
                {draw > 0.98 ? <text x={O[0] + (x - O[0]) * pk} y={O[1] + (y - O[1]) * pk + 12} fontSize="34" textAnchor="middle">📦</text> : null}
                <circle cx={x} cy={y} r={draw > 0.98 ? 12 : 0} fill={K.oro} stroke="#fff" strokeWidth="4" />
                {draw > 0.98 ? <text x={x} y={y - 20} fontSize="24" fontWeight="800" textAnchor="middle" fill="#1A1A22" fontFamily={fontFamily}>{n}</text> : null}
              </g>
            );
          })}
          <circle cx={O[0]} cy={O[1]} r={22 + ((f % 30) / 30) * 30} fill="none" stroke={K.rosa} strokeWidth="4" opacity={1 - (f % 30) / 30} />
          <text x={O[0]} y={O[1] + 8 - (1 - drop) * 200} fontSize="80" textAnchor="middle">📍</text>
          <rect x={O[0] - 80} y={O[1] + 22} width="160" height="44" rx="22" fill={K.rosa} />
          <text x={O[0]} y={O[1] + 53} fontSize="28" fontWeight="900" textAnchor="middle" fill="#fff" fontFamily={fontFamily}>La Vega</text>
        </svg>
        <div style={{ textAlign: "center", fontWeight: 900, fontSize: 48, color: "#1A1A22", opacity: f >= S(envios) ? 1 : 0, transform: `scale(${sp(f, S(envios), fps)})` }}>🚚 Envíos a todo el país</div>
      </div>
    </div>
  );
};

// Celular con chat que se escribe solo + botones DM / WhatsApp
const Chat: React.FC<{ desde: number; wa: number; hasta: number }> = ({ desde, wa, hasta }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < S(desde) || f > S(hasta) + 10) return null;
  const out = interpolate(f, [S(hasta), S(hasta) + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tel = sp(f, S(desde), fps, 12, 150);
  const b1 = sp(f, S(desde) + 12, fps, 9, 200);
  const typing = f > S(desde) + 26 && f < S(desde) + 50;
  const b2 = sp(f, S(desde) + 50, fps, 9, 200);
  const dots = [0, 1, 2].map((i) => 0.3 + 0.7 * Math.abs(Math.sin(f / 4 + i)));
  const btn = (d: number, bg: string, txt: string) => {
    const p = sp(f, S(d), fps, 8, 220);
    return <div style={{ transform: `scale(${p * (1 + Math.sin(f / 4) * 0.03)})`, background: bg, color: "#fff", fontWeight: 900, fontSize: 40, padding: "14px 26px", borderRadius: 30, boxShadow: `0 12px 30px ${bg}88`, whiteSpace: "nowrap" }}>{txt}</div>;
  };
  return (
    <div style={{ position: "absolute", top: 760, right: 40, opacity: out, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
      <div style={{ width: 400, height: 470, borderRadius: 48, background: "#111", padding: 14, transform: `translateY(${interpolate(tel, [0, 1], [400, 0])}px) rotate(4deg)`, boxShadow: "0 30px 80px rgba(0,0,0,.45)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 36, background: "#F2EEF5", padding: "50px 18px 18px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
          <div style={{ position: "absolute", top: 14, left: 0, right: 0, textAlign: "center", fontWeight: 800, fontSize: 22, color: "#555" }}>Mensajes</div>
          <div style={{ alignSelf: "flex-start", maxWidth: "85%", background: "#fff", borderRadius: "22px 22px 22px 6px", padding: "14px 18px", fontSize: 28, fontWeight: 700, color: "#222", transform: `scale(${b1})`, transformOrigin: "left bottom" }}>Hola 😍 ¿tienen esta blusa?</div>
          {typing ? <div style={{ alignSelf: "flex-end", background: K.rosa, borderRadius: 22, padding: "16px 20px", display: "flex", gap: 8 }}>{dots.map((o, i) => <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#fff", opacity: o }} />)}</div> : null}
          {f >= S(desde) + 50 ? <div style={{ alignSelf: "flex-end", maxWidth: "88%", background: K.rosa, color: "#fff", borderRadius: "22px 22px 6px 22px", padding: "14px 18px", fontSize: 28, fontWeight: 700, transform: `scale(${b2})`, transformOrigin: "right bottom" }}>¡Sí! Te envío todo lo disponible 📦✨</div> : null}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {btn(desde + 0.2, "linear-gradient(90deg,#8B5CF6,#FF4FA3)", "💬 DM")}
        {btn(wa, K.verde, "📱 WhatsApp")}
      </div>
    </div>
  );
};

// Cierre: tarjeta que sube desde abajo (sin oscurecer el video)
const CierreCard: React.FC<{ desde: number }> = ({ desde }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < S(desde)) return null;
  const p = sp(f, S(desde), fps, 13, 130);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1000, transform: `translateY(${interpolate(p, [0, 1], [900, 0])}px)`, background: "rgba(255,255,255,.97)", borderRadius: 40, padding: "34px 30px",
      boxShadow: `0 30px 80px rgba(0,0,0,.4), 0 0 0 6px ${K.rosa}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ fontSize: 70, fontWeight: 900, color: "#1A1A22", textAlign: "center", lineHeight: 1.05 }}>¡Te esperamos! 🛍️</div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        {["🏬 Tienda en La Vega", "🚚 Envíos a todo el país"].map((t, i) => (
          <div key={i} style={{ background: "#F4EEF7", borderRadius: 20, padding: "10px 18px", fontSize: 36, fontWeight: 800, color: "#1A1A22", transform: `scale(${sp(f, S(desde) + 8 + i * 5, fps)})` }}>{t}</div>
        ))}
      </div>
      <div style={{ background: K.rosa, color: "#fff", fontWeight: 900, fontSize: 52, padding: "16px 40px", borderRadius: 40, transform: `scale(${sp(f, S(desde) + 18, fps, 8, 200) * (1 + Math.sin(f / 4) * 0.04)})` }}>📲 Escríbenos ahora</div>
    </div>
  );
};

export const PruebaEdicion: React.FC<PruebaProps> = ({ palabras, fin, momentos: m }) => {
  const f = useCurrentFrame();
  // Solo un acercamiento suave en cada momento clave (sin filtros de color, flash ni sacudidas)
  const golpes = [0, m.chicas, m.tienda, m.envios, m.dm];
  const g = golpes.reduce((a, x, k) => (f >= S(x) ? k : a), 0);
  const desde = S(golpes[g]);
  const zoom = interpolate(f - desde, [0, 12], [g ? 1.04 : 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) }) * (g % 2 ? 1.03 : 1);
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 22%" }}>
        <OffthreadVideo src={staticFile("prueba/fuente.mp4")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      <Corazones desde={0.2} hasta={3.4} />
      <Tarjeta desde={0.2} hasta={3.4} lado="izq" top={1000}>💖 ¡Feliz y bendecido día!</Tarjeta>
      <Confeti desde={m.chicas} />
      <Tarjeta desde={m.chicas} hasta={m.promos - 0.1} lado="izq" top={1000}>👋 ¡Bienvenidas, chicas nuevas!</Tarjeta>
      <Oferta desde={m.promos - 0.2} hasta={m.tienda - 0.1} />
      <Tienda desde={m.tienda} hasta={m.vega - 0.5} />
      <Rutas pin={m.vega - 0.5} envios={m.envios} hasta={m.escribir + 0.4} />
      <Chat desde={m.dm - 0.9} wa={m.wa - 0.2} hasta={m.cierre - 0.1} />

      <Subtitulos ws={palabras} />
      <CierreCard desde={m.cierre} />
      <div style={{ position: "absolute", bottom: 0, left: 0, height: 10, width: `${Math.min(1, f / S(fin)) * 100}%`, background: `linear-gradient(90deg, ${K.rosa}, ${K.oro})` }} />
    </AbsoluteFill>
  );
};

export const PruebaComposition = () => (
  <Composition id="PruebaEdicion" component={PruebaEdicion} durationInFrames={S(10)} fps={FPS} width={1080} height={1920}
    defaultProps={{ palabras: [], fin: 10, momentos: {} } as PruebaProps}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.fin) })} />
);
