// Prueba: objetos y gráficas que aparecen sobre las manos mientras habla (siguen la palma frame a frame).
import { AbsoluteFill, Composition, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", { weights: ["800", "900"], subsets: ["latin"] });
const FPS = 30;
type Lado = "izq" | "der";
type Item = { s: number; e: number; tipo: string; lado?: Lado; mano?: boolean };

// Orden del guion (tiempos del video ya recortado)
export const ITEMS: Item[] = [
  { s: 0.1, e: 2.3, tipo: "bajando" },
  { s: 3.0, e: 4.1, tipo: "corazon" },
  { s: 5.0, e: 8.5, tipo: "noventa" },
  { s: 8.6, e: 10.2, tipo: "preguntas" },
  { s: 10.3, e: 11.6, tipo: "doble" },
  { s: 11.7, e: 16.5, tipo: "chat", mano: true },
  { s: 16.7, e: 19.5, tipo: "nocampana" },
  { s: 19.7, e: 24.8, tipo: "ia" },
  { s: 24.9, e: 27.0, tipo: "libro" },
  { s: 27.7, e: 31.5, tipo: "envivo" },
  { s: 31.7, e: 34.8, tipo: "calendario" },
  { s: 34.9, e: 36.4, tipo: "precio", mano: true },
  { s: 36.5, e: 38.9, tipo: "cohete" },
];

export type Pos = { izq: number[][]; der: number[][] };
let P: Pos = { izq: [[0, 0]], der: [[0, 0]] };
export const setPos = (p: Pos) => { P = p; };

const ladoDe = (it: Item): Lado => {
  if (it.lado) return it.lado;
  // la mano que esté más arriba (más visible) durante ese tramo
  const a = Math.round(it.s * FPS), b = Math.min(P.izq.length - 1, Math.round(it.e * FPS));
  let yi = 0, yd = 0;
  for (let i = a; i <= b; i++) { yi += P.izq[i][1]; yd += P.der[i][1]; }
  return yi <= yd ? "izq" : "der";
};

const card: React.CSSProperties = { background: "rgba(12,10,24,.78)", border: "3px solid rgba(255,255,255,.35)", borderRadius: 28,
  boxShadow: "0 18px 50px rgba(0,0,0,.45), 0 0 40px rgba(255,210,63,.25)", backdropFilter: "blur(6px)", color: "#fff", padding: "18px 24px" };

const Objeto: React.FC<{ tipo: string; f: number }> = ({ tipo, f }) => {
  const { fps } = useVideoConfig();
  const t = f / fps;
  const grow = (d = 0) => spring({ frame: f - d, fps, config: { damping: 12, stiffness: 120 } });
  switch (tipo) {
    case "bajando": {
      const pts = [0, 1, 2, 3, 4, 5].map((i) => [i * 44, 20 + i * 22 + (i % 2) * 18]);
      const n = interpolate(t, [0.1, 1.2], [1, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return (
        <div style={{ ...card, width: 280 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#FF6B6B" }}>VENTAS ▼</div>
          <svg width={230} height={160}><polyline points={pts.slice(0, Math.ceil(n)).map((p) => p.join(",")).join(" ")} fill="none" stroke="#FF4D4D" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      );
    }
    case "corazon":
      return <div style={{ fontSize: 150, transform: `scale(${1 + Math.sin(t * 10) * 0.06})`, filter: "drop-shadow(0 0 25px #ff4fa3)" }}>💖</div>;
    case "noventa": {
      const v = Math.round(interpolate(t, [0, 1.4], [0, 90], { extrapolateRight: "clamp" }));
      const r = 90, c = 2 * Math.PI * r;
      return (
        <div style={{ position: "relative", width: 240, height: 240 }}>
          <svg width={240} height={240} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={120} cy={120} r={r} fill="rgba(12,10,24,.75)" stroke="rgba(255,255,255,.15)" strokeWidth={22} />
            <circle cx={120} cy={120} r={r} fill="none" stroke="#2EE6A6" strokeWidth={22} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ filter: "drop-shadow(0 0 12px #2EE6A6)" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, fontWeight: 900 }}>{v}%</div>
        </div>
      );
    }
    case "preguntas":
      return (
        <div style={{ position: "relative", width: 260, height: 260 }}>
          {[0, 1, 2, 3].map((k) => {
            const p = grow(k * 6);
            const up = ((t * 60 + k * 30) % 120);
            return <div key={k} style={{ position: "absolute", left: 20 + (k % 2) * 120, top: 160 - up, opacity: p * (1 - up / 140), transform: `scale(${p})`,
              ...card, padding: "8px 22px", fontSize: 60, fontWeight: 900, color: "#FFD23F" }}>?</div>;
          })}
        </div>
      );
    case "doble":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 110 }}>💸</div>
          <div style={{ ...card, fontSize: 64, fontWeight: 900, color: "#FF6B6B", padding: "6px 20px", transform: `rotate(${Math.sin(t * 8) * 6}deg)` }}>x2</div>
        </div>
      );
    case "chat": {
      const lines = ["Hola, ¿precio? 👋", "¡Quiero inscribirme!", "¿Cuándo empieza?"];
      return (
        <div style={{ width: 230, height: 400, borderRadius: 40, background: "#111", border: "8px solid #2A2A2E", padding: 16, boxShadow: "0 20px 50px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", gap: 12, justifyContent: "flex-end" }}>
          {lines.map((l, k) => {
            const p = grow(10 + k * 25);
            return <div key={k} style={{ alignSelf: k % 2 ? "flex-end" : "flex-start", background: k % 2 ? "#2F7BF6" : "#3A3A40", color: "#fff", fontSize: 21, fontWeight: 800, borderRadius: 18, padding: "10px 12px", transform: `scale(${p})`, opacity: p }}>{l}</div>;
          })}
          <div style={{ ...card, padding: "6px 10px", fontSize: 22, fontWeight: 900, color: "#2EE6A6", textAlign: "center", borderRadius: 14 }}>costo ▼ 50%</div>
        </div>
      );
    }
    case "nocampana":
      return (
        <div style={{ position: "relative", fontSize: 140 }}>
          📣
          <div style={{ position: "absolute", left: -10, top: 70, width: 190, height: 18, borderRadius: 9, background: "#FF3B3B", transform: `rotate(-30deg) scaleX(${grow(12)})`, boxShadow: "0 0 18px #FF3B3B" }} />
        </div>
      );
    case "ia":
      return (
        <div style={{ position: "relative", width: 250, height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{ position: "absolute", width: 120 + k * 60, height: 120 + k * 60, borderRadius: "50%", border: `4px solid ${["#22D3EE", "#A855F7", "#FF4FA3"][k]}`,
              transform: `rotate(${t * (60 + k * 40) * (k % 2 ? -1 : 1)}deg) scaleY(.45)`, boxShadow: `0 0 16px ${["#22D3EE", "#A855F7", "#FF4FA3"][k]}` }} />
          ))}
          <div style={{ width: 110, height: 110, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #fff, #22D3EE 40%, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, fontWeight: 900, color: "#fff", boxShadow: `0 0 ${40 + Math.sin(t * 6) * 15}px #22D3EE` }}>IA</div>
        </div>
      );
    case "libro":
      return <div style={{ fontSize: 140, transform: `rotate(${Math.sin(t * 4) * 8}deg)`, filter: "drop-shadow(0 0 20px #FFD23F)" }}>📚</div>;
    case "envivo":
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ background: "#E11D48", color: "#fff", fontSize: 34, fontWeight: 900, borderRadius: 14, padding: "8px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fff", opacity: Math.sin(t * 8) > 0 ? 1 : 0.3 }} /> EN VIVO
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {[1, 2, 3].map((k) => {
              const p = grow(k * 12);
              return <div key={k} style={{ ...card, width: 66, height: 50 + k * 40, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: "#FFD23F", transform: `scaleY(${p})`, transformOrigin: "bottom" }}>{k}</div>;
            })}
          </div>
        </div>
      );
    case "calendario":
      return (
        <div style={{ width: 250, borderRadius: 26, overflow: "hidden", background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,.5)" }}>
          <div style={{ background: "#E11D48", color: "#fff", fontSize: 30, fontWeight: 900, textAlign: "center", padding: 8 }}>NOVIEMBRE</div>
          <div style={{ display: "flex", justifyContent: "space-around", padding: "14px 0", color: "#111" }}>
            {[["SÁB", "21", 0], ["JUE", "26", 40]].map(([d, n, dl]) => (
              <div key={d as string} style={{ textAlign: "center", transform: `scale(${grow(dl as number)})` }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#666" }}>{d}</div>
                <div style={{ fontSize: 64, fontWeight: 900, border: "5px solid #E11D48", borderRadius: 40, width: 96, lineHeight: "90px" }}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "precio":
      return (
        <div style={{ transform: `rotate(${-8 + Math.sin(t * 6) * 4}deg)`, background: "linear-gradient(135deg,#FFD23F,#FF8A3D)", color: "#1A1205", fontSize: 54, fontWeight: 900,
          borderRadius: 18, padding: "12px 26px", boxShadow: "0 0 40px rgba(255,210,63,.7)", border: "4px solid #fff" }}>RD$2,000</div>
      );
    case "cohete": {
      const up = interpolate(t, [0, 2.2], [0, 60]);
      return (
        <div style={{ ...card, width: 270 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#2EE6A6" }}>VENTAS ▲</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150 }}>
            {[30, 55, 80, 125].map((h, k) => <div key={k} style={{ width: 44, height: h * grow(k * 5), borderRadius: 8, background: "linear-gradient(#2EE6A6,#0E9F6E)" }} />)}
            <div style={{ fontSize: 60, transform: `translateY(${-up}px)` }}>🚀</div>
          </div>
        </div>
      );
    }
  }
  return null;
};

export const EnMano: React.FC<{ it: Item; idx?: number }> = ({ it, idx = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = Math.round(it.s * fps), b = Math.round(it.e * fps);
  if (frame < a || frame > b) return null;
  const pin = spring({ frame: frame - a, fps, config: { damping: 11, stiffness: 160 } });
  const pout = interpolate(frame, [b - 6, b], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = pin * pout;
  const flot = Math.sin(frame / 9) * 8;
  if (it.mano) {
    const lado = ladoDe(it);
    const [x, y] = P[lado][Math.min(P[lado].length - 1, frame)];
    return (
      <>
        {/* brillo en la palma */}
        <div style={{ position: "absolute", left: x - 90, top: y - 90, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,220,120,.55), rgba(255,220,120,0) 70%)", opacity: s }} />
        <div style={{ position: "absolute", left: x, top: y - 40 + flot, transform: `translate(-50%, -100%) scale(${s * 1.15})`, transformOrigin: "50% 100%" }}>
          <Objeto tipo={it.tipo} f={frame - a} />
        </div>
      </>
    );
  }
  // presentada: entra desde un lado, girando en 3D, con un barrido de luz, al costado de la cabeza
  const izq = idx % 2 === 0;
  const x = izq ? 205 : 875;
  const slide = interpolate(pin, [0, 1], [izq ? -420 : 420, 0]);
  const giro = interpolate(pin, [0, 1], [izq ? -60 : 60, izq ? 8 : -8]);
  const barrido = interpolate(frame - a, [6, 22], [-120, 420], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x, top: 900 + flot, perspective: 900, opacity: pout }}>
      <div style={{ transform: `translate(-50%, -100%) translateX(${slide}px) rotateY(${giro}deg) scale(${1.05 + (1 - pout) * 0.2})`, transformOrigin: "50% 100%", position: "relative" }}>
        <Objeto tipo={it.tipo} f={frame - a} />
        <div style={{ position: "absolute", top: -40, bottom: -40, left: barrido, width: 70, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0))", transform: "skewX(-20deg)", mixBlendMode: "screen", pointerEvents: "none" }} />
      </div>
    </div>
  );
};

export const ReelManos: React.FC<{ pos: Pos }> = ({ pos }) => { P = pos; return (
  <AbsoluteFill style={{ fontFamily, background: "#000" }}>
    <OffthreadVideo src={staticFile("prueba/manos.mp4")} />
    {ITEMS.map((it, i) => <EnMano key={i} it={it} idx={i} />)}
  </AbsoluteFill>
); };

export const ManosComposition = () => (
  <Composition id="ReelManos" component={ReelManos} durationInFrames={Math.round(38.93 * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ pos: { izq: [[0, 0]], der: [[0, 0]] } }} />
);
