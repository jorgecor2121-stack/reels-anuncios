// Anuncio de 8 piezas (gancho, introducción, cuerpo, bucle abierto, cuerpo, bucle, expectativa, llamado a la acción)
// con la caricatura y la voz del usuario abajo, y arriba escenas tecnológicas tipo agencia.
import { AbsoluteFill, Composition, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { AvatarMotionProps, ReelAvatarMotion } from "./AvatarMotion";

const { fontFamily: mont } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const { fontFamily: bebas } = loadBebas();
const FPS = 30;
const K = { cyan: "#22D3EE", violet: "#8B5CF6", blue: "#2D7BFF", red: "#FF3B5C", green: "#2BD576", y: "#FFD23F", o: "#FF8A3D" };
const P = [0, 2.7, 6.8, 11.6, 16.4, 21.9, 26.8, 29.1, 99]; // inicio de cada pieza
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sp = (t: number, s: number, d = 11, k = 170) => spring({ frame: Math.round((t - s) * FPS), fps: FPS, config: { damping: d, stiffness: k } });

const Titulo: React.FC<{ t: number; s: number; txt: string; c?: string; size?: number; top?: number }> = ({ t, s, txt, c = K.y, size = 104, top = 170 }) => {
  const p = sp(t, s, 9, 200);
  const glitch = t - s < 0.25 ? Math.sin(t * 90) * 8 : 0;
  return (
    <div style={{ position: "absolute", top, left: 40, right: 40, textAlign: "center", fontFamily: bebas, fontSize: size, lineHeight: 0.95, color: c, letterSpacing: 2,
      transform: `scale(${interpolate(p, [0, 1], [1.6, 1])}) translateX(${glitch}px)`, opacity: Math.min(1, p * 2),
      textShadow: `4px 0 ${K.red}aa, -4px 0 ${K.cyan}aa, 0 0 40px ${c}88` }}>{txt}</div>
  );
};

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: "rgba(12,16,40,.9)", border: "2px solid rgba(120,160,255,.35)", borderRadius: 28, boxShadow: "0 0 50px rgba(45,123,255,.25)", padding: 24, color: "#fff", fontFamily: mont, ...style }}>{children}</div>
);

// 1-2: tablero de anuncios gastando dinero sin ventas
const Tablero: React.FC<{ t: number }> = ({ t }) => {
  const gasto = Math.round(interpolate(t, [0.2, 6.8], [1200, 8750], clamp));
  const msgs = Math.round(interpolate(t, [3.5, 5.0], [0, 126], clamp));
  return (
    <Card style={{ width: 760, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 28, color: "#9BA3C7" }}><span>📊 Administrador de anuncios</span><span style={{ color: K.green }}>● Activa</span></div>
      <div style={{ display: "flex", gap: 18, marginTop: 20 }}>
        {[["GASTADO", `RD$${gasto.toLocaleString("en-US")}`, K.o], ["MENSAJES", `${msgs}`, K.cyan], ["VENTAS", "0", K.red]].map(([l, v, c], i) => (
          <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.05)", borderRadius: 18, padding: "16px 10px", textAlign: "center", border: i === 2 && t > 5.2 ? `3px solid ${K.red}` : "3px solid transparent" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#9BA3C7" }}>{l}</div>
            <div style={{ fontFamily: bebas, fontSize: 70, color: c as string }}>{v}</div>
          </div>
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, k) => {
        const u = ((t * 0.9 + k * 0.17) % 1);
        return <div key={k} style={{ position: "absolute", left: 120 + k * 100, top: 120 - u * 260, fontSize: 52, opacity: 1 - u }}>💸</div>;
      })}
    </Card>
  );
};

// 3: núcleo de inteligencia artificial
const Nucleo: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - P[2];
  return (
    <div style={{ position: "relative", width: 520, height: 520 }}>
      {[0, 1, 2, 3].map((k) => (
        <div key={k} style={{ position: "absolute", left: 260 - (130 + k * 55), top: 260 - (130 + k * 55), width: (130 + k * 55) * 2, height: (130 + k * 55) * 2, borderRadius: "50%",
          border: `3px solid ${[K.cyan, K.violet, K.blue, K.cyan][k]}`, opacity: 0.7 - k * 0.12, transform: `rotate(${lt * (40 + k * 25) * (k % 2 ? -1 : 1)}deg) scaleY(${0.35 + k * 0.05})`, boxShadow: `0 0 20px ${[K.cyan, K.violet, K.blue, K.cyan][k]}` }} />
      ))}
      {Array.from({ length: 12 }).map((_, k) => {
        const a = (k / 12) * Math.PI * 2 + lt * 0.8, r = 220;
        return <div key={k} style={{ position: "absolute", left: 260 + Math.cos(a) * r - 7, top: 260 + Math.sin(a) * r * 0.5 - 7, width: 14, height: 14, borderRadius: 7, background: K.cyan, boxShadow: `0 0 14px ${K.cyan}` }} />;
      })}
      <div style={{ position: "absolute", left: 160, top: 160, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #fff, #22D3EE 35%, #6D28D9 80%)",
        boxShadow: `0 0 ${70 + Math.sin(lt * 6) * 25}px ${K.cyan}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: bebas, fontSize: 70, color: "#fff" }}>IA</div>
    </div>
  );
};

// 4-5: las 3 cosas (cerradas en el bucle, se abren en el cuerpo)
const TRES = [{ e: "🎨", n: "CREATIVIDADES\nESTRATÉGICAS", s: 16.45 }, { e: "🎯", n: "NUEVOS\nÁNGULOS", s: 18.4 }, { e: "🧱", n: "ESTRUCTURA DE\nCAMPAÑAS", s: 20.2 }];
const TresCajas: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", gap: 22 }}>
    {TRES.map((x, i) => {
      const abierta = t >= x.s;
      const p = sp(t, x.s, 9, 180);
      const entra = sp(t, P[3] + 1.8 + i * 0.15);
      return (
        <div key={i} style={{ width: 280, height: 330, borderRadius: 26, border: `3px solid ${abierta ? K.y : "rgba(150,170,255,.4)"}`, background: abierta ? "rgba(255,210,63,.1)" : "rgba(12,16,40,.9)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${entra}) rotateY(${abierta ? interpolate(p, [0, 1], [180, 0]) : 0}deg)`,
          boxShadow: abierta ? `0 0 40px ${K.y}66` : "none", color: "#fff", fontFamily: mont }}>
          {abierta ? (<><div style={{ fontSize: 110 }}>{x.e}</div><div style={{ fontWeight: 900, fontSize: 30, textAlign: "center", whiteSpace: "pre-line", marginTop: 10 }}>{x.n}</div></>)
            : (<><div style={{ fontSize: 120, fontFamily: bebas, color: "#6E7AB8" }}>?</div><div style={{ fontSize: 50 }}>🔒</div></>)}
        </div>
      );
    })}
  </div>
);

// 6: la IA lee señales y encuentra compradores
const Senales: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - P[5];
  const scan = (lt * 0.45) % 1;
  return (
    <Card style={{ width: 760, height: 470, position: "relative", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 18, padding: 10 }}>
        {Array.from({ length: 18 }).map((_, k) => {
          const comprador = [2, 7, 9, 14].includes(k) && lt > 1.6;
          return <div key={k} style={{ fontSize: 62, textAlign: "center", filter: comprador ? `drop-shadow(0 0 16px ${K.green})` : "grayscale(.6) opacity(.6)", transform: `scale(${comprador ? 1.2 : 1})` }}>{comprador ? "🛒" : "👤"}</div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: scan * 470, height: 6, background: K.cyan, boxShadow: `0 0 30px ${K.cyan}` }} />
      {lt > 2.8 ? <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center" }}><span style={{ background: K.green, color: "#05210F", fontWeight: 900, fontSize: 40, padding: "8px 24px", borderRadius: 16 }}>📡 SEÑALES CORRECTAS</span></div> : null}
    </Card>
  );
};

// 7: resultados subiendo
const Resultados: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - P[6];
  return (
    <Card style={{ width: 640, textAlign: "center" }}>
      <div style={{ fontWeight: 800, fontSize: 30, color: "#9BA3C7" }}>VENTAS CON ESTRATEGIA</div>
      <div style={{ fontFamily: bebas, fontSize: 150, color: K.green, lineHeight: 1 }}>MÁS VENTAS 📈</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, justifyContent: "center", height: 90 }}>
        {[20, 35, 50, 70, 90].map((h, i) => <div key={i} style={{ width: 50, height: h * Math.min(1, lt / 1.5), borderRadius: 8, background: `linear-gradient(${K.green}, #0E9F6E)` }} />)}
      </div>
      
    </Card>
  );
};

// 8: taller
const Taller: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - P[7];
  const fila = (s: number, ico: string, txt: string, c = "#fff") => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontWeight: 900, fontSize: 40, color: c, opacity: sp(t, s), transform: `translateX(${interpolate(sp(t, s), [0, 1], [-200, 0])}px)` }}><span style={{ fontSize: 46 }}>{ico}</span>{txt}</div>
  );
  const precio = sp(t, 31.6, 7, 200);
  return (
    <Card style={{ width: 820, padding: "26px 34px", border: `3px solid ${K.y}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ background: K.red, color: "#fff", fontWeight: 900, fontSize: 28, padding: "4px 14px", borderRadius: 10, opacity: Math.sin(lt * 7) > -0.3 ? 1 : 0.4 }}>● EN VIVO</span>
        <span style={{ fontWeight: 900, fontSize: 30, color: "#9BA3C7" }}>TALLER ONLINE</span>
      </div>
      <div style={{ fontFamily: bebas, fontSize: 84, lineHeight: 0.95, marginTop: 10 }}>META ADS Y <span style={{ color: K.cyan }}>ANDRÓMEDA</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {fila(32.9, "📅", "Sábado 21 o jueves 26")}
        {fila(35.3, "🕢", "7:30 PM")}
        {fila(30.2, "💻", "Vía Zoom")}
      </div>
      <div style={{ marginTop: 16, display: "inline-block", fontFamily: bebas, fontSize: 96, color: "#1A1205", background: `linear-gradient(135deg, ${K.y}, ${K.o})`, padding: "0 28px", borderRadius: 20,
        transform: `scale(${precio * (1 + Math.sin(t * 8) * 0.03)}) rotate(-2deg)`, boxShadow: `0 0 50px ${K.y}` }}>🔥 RD$2,000</div>
    </Card>
  );
};

const Arriba: React.FC<{ t: number }> = ({ t }) => {
  const i = P.findIndex((s, k) => t >= s && t < P[k + 1]);
  const s = P[i];
  const p = sp(t, s, 13, 150);
  const out = interpolate(t, [P[i + 1] - 0.12, P[i + 1]], [1, 0], clamp);
  let cuerpo: React.ReactNode = null, titulo: React.ReactNode = null;
  if (i === 0) titulo = <Titulo t={t} s={0} txt={"¡TUS PROMOCIONES\nYA NO FUNCIONAN!"} c={K.red} size={110} top={300} />;
  if (i === 1) cuerpo = <Tablero t={t} />;
  if (i === 2) { titulo = <Titulo t={t} s={s + 0.2} txt="META ANDRÓMEDA: ¡CAMBIÓ EL JUEGO!" c={K.cyan} size={72} top={170} />; cuerpo = <div style={{ marginTop: 120 }}><Nucleo t={t} /></div>; }
  if (i === 3) { titulo = <Titulo t={t} s={s + 1.9} txt="3 COSAS DECIDEN SI VENDES" c={K.y} size={80} top={170} />; cuerpo = <div style={{ marginTop: 110 }}><TresCajas t={t} /></div>; }
  if (i === 4) cuerpo = <div style={{ marginTop: 20 }}><TresCajas t={t} /></div>;
  if (i === 5) { titulo = <Titulo t={t} s={s} txt="¿LO MÁS IMPORTANTE?" c={K.violet} size={86} top={170} />; cuerpo = <div style={{ marginTop: 120 }}><Senales t={t} /></div>; }
  if (i === 6) { titulo = <Titulo t={t} s={s} txt="¡APRENDE A PROMOCIONAR CON ESTRATEGIA!" c={K.y} size={66} top={170} />; cuerpo = <div style={{ marginTop: 130 }}><Resultados t={t} /></div>; }
  if (i === 7) cuerpo = <Taller t={t} />;
  const flash = interpolate(t - s, [0, 0.05, 0.25], [0, 0.5, 0], clamp);
  return (
    <>
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, height: 720, background: "radial-gradient(ellipse at 50% 50%, rgba(10,14,40,.98), rgba(7,6,15,.98))" }} />
      {/* rejilla tecnológica */}
      <svg width={1080} height={740} style={{ position: "absolute", top: 120, opacity: 0.18 }}>
        {Array.from({ length: 12 }).map((_, k) => <line key={k} x1={k * 100 - ((t * 40) % 100)} y1={0} x2={k * 100 - ((t * 40) % 100)} y2={740} stroke={K.cyan} strokeWidth={1} />)}
        {Array.from({ length: 8 }).map((_, k) => <line key={k} x1={0} y1={k * 100} x2={1080} y2={k * 100} stroke={K.cyan} strokeWidth={1} />)}
      </svg>
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, height: 720, display: "flex", alignItems: "center", justifyContent: "center", opacity: out,
        transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`, whiteSpace: "pre-line" }}>{cuerpo}</div>
      <div style={{ opacity: out, whiteSpace: "pre-line" }}>{titulo}</div>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, ${K.cyan}, transparent 60%)`, opacity: flash, mixBlendMode: "screen" }} />
    </>
  );
};

export const ReelAndromeda8: React.FC<AvatarMotionProps> = (p) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill>
      <ReelAvatarMotion {...p} />
      <Arriba t={t} />
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(t / p.fin) * 100}%`, background: `linear-gradient(90deg, ${K.cyan}, ${K.violet})` }} />
    </AbsoluteFill>
  );
};

export const Andromeda8Composition = () => (
  <Composition id="ReelAndromeda8" component={ReelAndromeda8} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 40}
    defaultProps={{ lineas: [], escenas: [], resaltar: [], marca: "", fin: 40, audio: "narracion-promo8.wav", gestos: [{ start: 0, pose: "base" }] } as AvatarMotionProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
