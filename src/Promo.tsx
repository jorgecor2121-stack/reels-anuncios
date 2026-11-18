// Anuncio del taller "Meta Ads y Andrómeda": 5 escenas a pantalla completa, estilo agencia.
// Sin logos de terceros: Meta y Zoom solo se mencionan en texto.
import { AbsoluteFill, Composition, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Character } from "./avatar2d/Character";
import { poseAtFrame, Segment } from "./avatar2d/timeline";
import { MotionProps, Subs, palabras } from "./Motion";

const { fontFamily } = loadFont("normal", { weights: ["600", "700", "800", "900"], subsets: ["latin"] });
const FPS = 30;
const S = (s: number) => Math.round(s * FPS);
const K = { bg1: "#040714", bg2: "#0B1438", blue: "#2D7BFF", cyan: "#22D3EE", violet: "#8B5CF6", o: "#FF8A3D", y: "#FFD23F", red: "#FF3B5C", green: "#2BD576", t: "#FFFFFF", m: "#9BA3C7", card: "rgba(14,20,48,.88)", line: "rgba(120,140,220,.25)" };
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export type PromoProps = MotionProps & { audio: string; gestos: Segment[] };

const sp = (frame: number, delay: number, fps: number, damping = 12, stiffness = 160) => spring({ frame: frame - delay, fps, config: { damping, stiffness } });
const ease = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });

// ---------- Fondo tecnológico ----------
const Fondo: React.FC<{ tint: string }> = ({ tint }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, ${K.bg2} 0%, ${K.bg1} 70%)` }}>
      {/* piso en perspectiva */}
      <div style={{ position: "absolute", left: -600, right: -600, bottom: -200, height: 900, transform: "perspective(600px) rotateX(62deg)",
        backgroundImage: `linear-gradient(${tint}55 2px, transparent 2px), linear-gradient(90deg, ${tint}55 2px, transparent 2px)`,
        backgroundSize: "90px 90px", backgroundPosition: `0 ${(f * 3) % 90}px`, opacity: 0.5 }} />
      {/* partículas */}
      {Array.from({ length: 40 }).map((_, i) => {
        const x = (i * 263) % 1080, y = (i * 997 - f * (1 + (i % 4))) % 1920;
        return <div key={i} style={{ position: "absolute", left: x, top: (y + 1920) % 1920, width: 4 + (i % 3) * 3, height: 4 + (i % 3) * 3, borderRadius: "50%", background: i % 2 ? K.cyan : tint, opacity: 0.35 }} />;
      })}
      {/* barrido de luz */}
      <div style={{ position: "absolute", top: -400, left: ((f * 14) % 2600) - 900, width: 260, height: 2800, transform: "rotate(20deg)",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent)" }} />
    </AbsoluteFill>
  );
};

// ---------- Titular de impacto (palabras que caen con golpe) ----------
const Titular: React.FC<{ texto: string; resaltar?: string[]; color?: string; size?: number; delay?: number; top?: number }> = ({ texto, resaltar = [], color = K.y, size = 92, delay = 0, top = 170 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = texto.split(" ");
  const hl = new Set(resaltar.map((w) => w.toUpperCase()));
  return (
    <div style={{ position: "absolute", top, left: 50, right: 50, textAlign: "center", lineHeight: 1.04 }}>
      {words.map((w, i) => {
        const p = sp(f, delay + i * 3, fps, 9, 220);
        const glitch = f - delay - i * 3 < 6 ? Math.sin(f * 7) * 6 : 0;
        const on = hl.has(w.replace(/[¡!¿?:,.]/g, "").toUpperCase());
        return (
          <span key={i} style={{ display: "inline-block", margin: "0 12px", fontSize: size, fontWeight: 900, color: on ? color : K.t,
            transform: `scale(${interpolate(p, [0, 1], [2.2, 1])}) translateX(${glitch}px)`, opacity: Math.min(1, p * 2),
            textShadow: on ? `0 0 40px ${color}AA, ${glitch}px 0 0 ${K.red}88, ${-glitch}px 0 0 ${K.cyan}88` : "0 8px 30px rgba(0,0,0,.6)" }}>{w}</span>
        );
      })}
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: K.card, border: `3px solid ${K.line}`, borderRadius: 34, boxShadow: "0 30px 90px rgba(0,0,0,.45)", ...style }}>{children}</div>
);

// ---------- Avatar pequeño (con boca sincronizada) ----------
const Avatar: React.FC<{ p: PromoProps; x: number; y: number; scale: number }> = ({ p, x, y, scale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({ src: staticFile(p.audio), frame, fps, windowInSeconds: 10 });
  let volume: number | undefined;
  if (audioData) volume = visualizeAudio({ fps, frame, audioData, numberOfSamples: 32, optimizeFor: "speed", dataOffsetInSeconds }).slice(1, 10).reduce((a, b) => a + b, 0) / 9;
  const pose = poseAtFrame(p.gestos, frame, fps, { volume });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 1080 * scale, height: 1080 * scale }}>
      <div style={{ position: "absolute", inset: "12% 8% 0 8%", borderRadius: "50% 50% 0 0", background: `radial-gradient(circle at 50% 60%, ${K.blue}66, transparent 70%)` }} />
      <div style={{ transform: `scale(${scale})`, transformOrigin: "0 0", width: 1080, height: 1080 }}><Character pose={pose} /></div>
    </div>
  );
};

// ---------- ESCENA 1: el problema ----------
const Escena1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = sp(f, 4, fps);
  const gasto = 18350 * ease(f, S(0.6), S(6));
  const msj = 124 * ease(f, S(1.5), S(6));
  const ventas = 3 * ease(f, S(2.5), S(5));
  const pts = (fn: (x: number) => number) => Array.from({ length: 20 }).map((_, i) => `${i * 40},${fn(i)}`).slice(0, Math.max(2, Math.floor(ease(f, S(0.5), S(6)) * 20))).join(" ");
  return (
    <AbsoluteFill>
      <Titular texto="¡TUS PROMOCIONES YA NO FUNCIONAN!" resaltar={["PROMOCIONES"]} color={K.red} />
      <div style={{ position: "absolute", top: 470, left: 70, right: 70, transform: `translateY(${interpolate(inP, [0, 1], [300, 0])}px) rotateX(${interpolate(inP, [0, 1], [25, 0])}deg)`, opacity: inP }}>
        <Card style={{ padding: "30px 36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: K.m }}>📊 Administrador de anuncios</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: K.green }}>● Activa</div>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            {[["💸 Gastado", `RD$${fmt(gasto)}`, K.o], ["💬 Mensajes", fmt(msj), K.cyan], ["🛒 Ventas", fmt(ventas), K.red]].map(([l, v, c], i) => (
              <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.05)", borderRadius: 22, padding: "20px 18px", border: `2px solid ${K.line}` }}>
                <div style={{ fontSize: 26, color: K.m, fontWeight: 700 }}>{l}</div>
                <div style={{ fontSize: 50, fontWeight: 900, color: c as string, marginTop: 6 }}>{v}</div>
              </div>
            ))}
          </div>
          <svg width="800" height="230" style={{ marginTop: 24 }}>
            <polyline points={pts((i) => 210 - i * 10)} fill="none" stroke={K.o} strokeWidth="8" strokeLinecap="round" />
            <polyline points={pts((i) => 200 - Math.sin(i) * 6)} fill="none" stroke={K.red} strokeWidth="8" strokeLinecap="round" strokeDasharray="14 10" />
            <text x="560" y="40" fill={K.o} fontSize="26" fontWeight="800">gasto ↑</text>
            <text x="560" y="190" fill={K.red} fontSize="26" fontWeight="800">ventas →</text>
          </svg>
        </Card>
      </div>
      {/* billetes que se van volando */}
      {Array.from({ length: 10 }).map((_, i) => {
        const t0 = S(1 + i * 0.5), t = (f - t0) / 40;
        if (t < 0 || t > 1) return null;
        return <div key={i} style={{ position: "absolute", left: 180 + ((i * 173) % 700) + t * 120, top: 820 - t * 600, fontSize: 70, opacity: 1 - t, transform: `rotate(${t * 200 * (i % 2 ? 1 : -1)}deg)` }}>💸</div>;
      })}
    </AbsoluteFill>
  );
};

// ---------- ESCENA 2: Andrómeda (galaxia + IA) ----------
const Escena2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(f, 0, fps, 14, 90);
  const rot = f * 0.6;
  const stars = Array.from({ length: 260 }).map((_, i) => {
    const arm = i % 2, k = i / 260;
    const ang = k * 9 + arm * Math.PI + (rot * Math.PI) / 180;
    const r = 30 + k * 360 + Math.sin(i) * 14;
    return { x: Math.cos(ang) * r, y: Math.sin(ang) * r * 0.55, s: 2 + (i % 4), c: i % 3 === 0 ? K.cyan : i % 3 === 1 ? K.violet : "#fff" };
  });
  const nodes = Array.from({ length: 8 }).map((_, i) => ({ x: Math.cos(i * 0.785 + f / 40) * 330, y: Math.sin(i * 0.785 + f / 40) * 330 }));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540, top: 860, transform: `scale(${interpolate(p, [0, 1], [0.2, 1])}) rotate(-18deg)`, opacity: p }}>
        {stars.map((s, i) => <div key={i} style={{ position: "absolute", left: s.x, top: s.y, width: s.s, height: s.s, borderRadius: "50%", background: s.c, opacity: 0.85, boxShadow: `0 0 8px ${s.c}` }} />)}
      </div>
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
        {nodes.map((n, i) => {
          const pulse = (f / 20 + i / 8) % 1;
          return (
            <g key={i} opacity={ease(f, S(0.8 + i * 0.1), S(1.3 + i * 0.1))}>
              <line x1="540" y1="820" x2={540 + n.x} y2={820 + n.y} stroke={K.cyan} strokeWidth="2" opacity="0.5" />
              <circle cx={540 + n.x * pulse} cy={820 + n.y * pulse} r="6" fill={K.cyan} />
              <circle cx={540 + n.x} cy={820 + n.y} r="16" fill={K.bg1} stroke={K.violet} strokeWidth="5" />
            </g>
          );
        })}
      </svg>
      {/* núcleo de IA */}
      <div style={{ position: "absolute", left: 540 - 110, top: 820 - 110, width: 220, height: 220, borderRadius: "50%", transform: `scale(${p * (1 + Math.sin(f / 6) * 0.05)})`,
        background: `radial-gradient(circle, #fff 0%, ${K.cyan} 25%, ${K.violet} 60%, transparent 72%)`, boxShadow: `0 0 120px ${K.violet}` }} />
      {[1, 2].map((k) => <div key={k} style={{ position: "absolute", left: 540 - 140 * k, top: 820 - 140 * k, width: 280 * k, height: 280 * k, borderRadius: "50%",
        border: `4px solid ${k === 1 ? K.cyan : K.violet}`, transform: `rotate(${f * (k === 1 ? 2 : -1.5)}deg) scaleY(.55)`, borderTopColor: "transparent", opacity: p * 0.8 }} />)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontSize: 40, fontWeight: 800, color: K.cyan, letterSpacing: 6, opacity: ease(f, S(1), S(1.6)) }}>INTELIGENCIA ARTIFICIAL</div>
      <Titular texto="META ANDRÓMEDA:" resaltar={["ANDRÓMEDA:"]} color={K.cyan} size={96} top={150} />
      <Titular texto="¡CAMBIÓ EL JUEGO!" color={K.y} size={88} delay={14} top={380} resaltar={["¡CAMBIÓ", "EL", "JUEGO!"]} />
    </AbsoluteFill>
  );
};

// ---------- ESCENA 3: información de valor ----------
const Escena3: React.FC<{ marcas: number[] }> = ({ marcas }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items: [string, string, string][] = [
    ["🎨", "Creatividades estratégicas", K.o],
    ["🎯", "Nuevos ángulos publicitarios", K.y],
    ["🧱", "Estructura de campañas", K.cyan],
    ["🤖", "Inteligencia artificial y optimización", K.violet],
  ];
  const btn = sp(f, 0, fps);
  const tachar = ease(f, S(1.4), S(2));
  const activo = marcas.reduce((a, m, i) => (f >= m ? i : a), -1);
  const fin = marcas[3] + S(4.2);
  return (
    <AbsoluteFill>
      {/* "Promocionar" ya no basta */}
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: interpolate(f, [marcas[0] - 6, marcas[0]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <div style={{ position: "relative", transform: `scale(${btn})` }}>
          <div style={{ background: K.blue, color: "#fff", fontSize: 64, fontWeight: 900, padding: "28px 70px", borderRadius: 26 }}>🚀 Promocionar</div>
          <div style={{ position: "absolute", left: -20, top: "50%", height: 12, width: `${tachar * 110}%`, background: K.red, borderRadius: 6, transform: "rotate(-6deg)" }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 190, left: 60, right: 60, opacity: ease(f, marcas[0] - 4, marcas[0] + 4), textAlign: "center", fontSize: 54, fontWeight: 900 }}>
        Lo que <span style={{ color: K.y }}>SÍ</span> funciona ahora 👇
      </div>
      <div style={{ position: "absolute", top: 330, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 24 }}>
        {items.map(([ic, tx, col], i) => {
          const p = sp(f, marcas[i], fps, 11, 170);
          const on = activo === i;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, padding: "26px 34px", borderRadius: 30, background: on ? `${col}22` : K.card,
              border: `4px solid ${on ? col : K.line}`, transform: `translateX(${interpolate(p, [0, 1], [i % 2 ? 900 : -900, 0])}px) scale(${on ? 1.04 : 1})`,
              boxShadow: on ? `0 0 60px ${col}55` : "none", opacity: f >= marcas[i] ? 1 : 0 }}>
              <div style={{ fontSize: 76 }}>{ic}</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: on ? col : K.t, lineHeight: 1.1 }}>{tx}</div>
            </div>
          );
        })}
      </div>
      {/* señales → compradores */}
      <div style={{ position: "absolute", top: 1130, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26, opacity: ease(f, fin - S(2.5), fin - S(2)) }}>
        {["💬", "💬", "💬"].map((e, i) => {
          const conv = f > fin - S(1.6) + i * 6;
          return <div key={i} style={{ fontSize: 50, fontWeight: 900, background: conv ? K.green : K.card, color: conv ? "#04140A" : K.t, padding: "16px 26px", borderRadius: 24, border: `3px solid ${conv ? K.green : K.line}`,
            transform: `scale(${conv ? 1.08 : 1})` }}>{conv ? "💰 Venta" : e}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 4: expectativa ----------
const Escena4: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ventas = 3 + 45 * ease(f, S(0.4), S(3.2));
  const p = sp(f, 0, fps);
  return (
    <AbsoluteFill>
      <Titular texto="¡APRENDE A PROMOCIONAR CON ESTRATEGIA!" resaltar={["PROMOCIONAR", "ESTRATEGIA!"]} color={K.y} size={86} />
      <div style={{ position: "absolute", top: 520, left: 80, right: 80, transform: `scale(${p})` }}>
        <Card style={{ padding: "34px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 34, color: K.m, fontWeight: 800 }}>🛒 Ventas del mes (ejemplo)</div>
            <div style={{ fontSize: 150, fontWeight: 900, color: K.green, lineHeight: 1, textShadow: `0 0 50px ${K.green}66` }}>{fmt(ventas)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 220 }}>
            {[0.2, 0.35, 0.5, 0.7, 1].map((h, i) => <div key={i} style={{ width: 44, height: 220 * h * ease(f, S(0.3 + i * 0.25), S(1 + i * 0.25)), borderRadius: 10, background: `linear-gradient(180deg, ${K.green}, #0E6B3A)` }} />)}
          </div>
        </Card>
      </div>
      <div style={{ position: "absolute", top: 930, left: 0, right: 0, textAlign: "center", fontSize: 46, fontWeight: 900, color: K.cyan, opacity: ease(f, S(2), S(2.6)) }}>
        Deja de desperdiciar tu presupuesto 💸❌
      </div>
    </AbsoluteFill>
  );
};

// ---------- ESCENA 5: oferta + CTA ----------
const Escena5: React.FC<{ tPrecio: number; tCta: number }> = ({ tPrecio, tCta }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const live = 0.5 + 0.5 * Math.sin(f / 4);
  const card = sp(f, 0, fps, 13, 120);
  const precio = sp(f, tPrecio, fps, 8, 200);
  const cta = sp(f, tCta, fps, 8, 200);
  const shine = ((f - tPrecio) * 18) % 900;
  const filas: [string, string][] = [["📅", "Sábado 21 o jueves 26"], ["🕢", "7:30 PM"], ["💻", "Vía Zoom"]];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ background: K.red, color: "#fff", fontWeight: 900, fontSize: 40, padding: "10px 30px", borderRadius: 40, boxShadow: `0 0 ${30 * live}px ${K.red}` }}>● TALLER EN VIVO</div>
      </div>
      <div style={{ position: "absolute", top: 250, left: 50, right: 50, textAlign: "center", fontSize: 80, fontWeight: 900, lineHeight: 1.05, transform: `scale(${card})` }}>
        META ADS Y <span style={{ color: K.cyan, textShadow: `0 0 40px ${K.cyan}` }}>ANDRÓMEDA</span>
      </div>
      {/* llamada en vivo (genérica) */}
      <div style={{ position: "absolute", top: 450, left: 90, right: 90, transform: `translateY(${interpolate(card, [0, 1], [200, 0])}px)`, opacity: card }}>
        <Card style={{ padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[K.o, K.blue, K.violet, K.green, K.y, K.cyan].map((c, i) => (
              <div key={i} style={{ height: 120, borderRadius: 16, background: `${c}33`, border: i === 0 ? `4px solid ${K.y}` : `2px solid ${K.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>
                {i === 0 ? "🎤" : "🙂"}
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{ position: "absolute", top: 775, left: 120, right: 120, display: "flex", flexDirection: "column", gap: 10 }}>
        {filas.map(([ic, tx], i) => {
          const p = sp(f, S(0.6 + i * 0.4), fps);
          return <div key={i} style={{ display: "flex", gap: 22, alignItems: "center", fontSize: 50, fontWeight: 900, transform: `translateX(${interpolate(p, [0, 1], [-700, 0])}px)` }}><span>{ic}</span><span>{tx}</span></div>;
        })}
      </div>
      {/* precio */}
      <div style={{ position: "absolute", top: 1015, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${interpolate(precio, [0, 1], [2.5, 1])}) rotate(${interpolate(precio, [0, 1], [-12, -3])}deg)`, opacity: Math.min(1, precio * 2) }}>
        <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${K.y}, ${K.o})`, color: "#1A0A00", fontWeight: 900, fontSize: 70, padding: "18px 46px", borderRadius: 26, boxShadow: `0 0 70px ${K.o}AA` }}>
          🔥 INVERSIÓN: RD$2,000
          <div style={{ position: "absolute", top: -50, left: shine - 200, width: 120, height: 300, background: "rgba(255,255,255,.45)", transform: "rotate(20deg)" }} />
        </div>
      </div>
      {/* llamado a la acción */}
      <div style={{ position: "absolute", top: 1145, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: cta, transform: `scale(${cta * (1 + Math.sin(f / 4) * 0.05)})` }}>
        <div style={{ background: K.green, color: "#04140A", fontWeight: 900, fontSize: 60, padding: "22px 50px", borderRadius: 40, boxShadow: `0 0 60px ${K.green}AA` }}>📩 ¡ESCRÍBEME AHORA!</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Composición ----------
export const ReelPromo: React.FC<PromoProps> = (p) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const L = p.lineas.map((l) => S(l.start));
  const cortes = [0, L[2], L[3], L[4], L[5]];
  const fin = S(p.fin);
  const esc = cortes.reduce((a, c, i) => (f >= c ? i : a), 0);
  const desde = cortes[esc];
  const hasta = cortes[esc + 1] ?? fin;
  const zoomIn = interpolate(f - desde, [0, 8], [1.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(f - desde, [0, 2, 8], [0.55, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = interpolate(hasta - f, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tint = [K.red, K.violet, K.blue, K.green, K.o][esc];
  // momentos del texto de la escena 3 (cuando dice cada concepto) y de la 5 (precio, "Escríbeme")
  const ws = palabras(p);
  const momento = (line: number, palabra: string, base: number) => {
    const w = ws.find((x) => x.line === line && x.w.toLowerCase().includes(palabra));
    return w ? S(w.start) - base : 0;
  };
  const marcas = [momento(3, "creatividades", L[3]), momento(3, "ángulos", L[3]) - 8, momento(3, "estructura", L[3]), momento(3, "inteligencia", L[3])];
  const shake = f - desde < 6 ? Math.sin(f * 9) * 8 : 0;
  return (
    <AbsoluteFill style={{ background: K.bg1, fontFamily, color: K.t, overflow: "hidden" }}>
      <Fondo tint={tint} />
      <AbsoluteFill style={{ transform: `scale(${zoomIn}) translateX(${shake}px)`, opacity: out }}>
        <Sequence from={cortes[esc]} layout="none" key={esc}>
          {esc === 0 ? <Escena1 /> : esc === 1 ? <Escena2 /> : esc === 2 ? <Escena3 marcas={marcas} /> : esc === 3 ? <Escena4 /> : <Escena5 tPrecio={Math.max(0, momento(5, "rd$2,000", L[5]) - 4)} tCta={momento(6, "¡escríbeme", L[5])} />}
        </Sequence>
      </AbsoluteFill>
      {/* avatar presentador en las escenas 1, 4 y 5 */}
      {esc === 0 || esc === 3 || esc === 4 ? <Avatar p={p} x={216} y={1330} scale={0.6} /> : null}
      {/* subtítulos */}
      <div style={{ position: "absolute", top: 1270, left: 30, right: 30, textAlign: "center", transform: "scale(0.72)", transformOrigin: "50% 0" }}>
        <Subs p={p} t={t} ws={ws} />
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      {/* barra de progreso */}
      <div style={{ position: "absolute", top: 90, left: 90, right: 90, height: 8, borderRadius: 4, background: "rgba(255,255,255,.12)" }}>
        <div style={{ width: `${Math.min(1, t / p.fin) * 100}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${K.cyan}, ${K.violet})` }} />
      </div>
    </AbsoluteFill>
  );
};

export const PromoComposition = () => (
  <Composition id="ReelPromo" component={ReelPromo} durationInFrames={S(10)} fps={FPS} width={1080} height={1920}
    defaultProps={{ lineas: [], escenas: [], resaltar: [], marca: "", fin: 10, audio: "narracion-promo.wav", gestos: [{ start: 0, pose: "base" }] } as PromoProps}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.fin) })} />
);
