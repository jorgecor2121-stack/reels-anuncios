// Reel estilo "3D oscuro cinemático": sin personas, una metáfora visual por frase,
// código de color (rojo = error, morado = explicación, verde = solución) y cierre en espejo.
import { AbsoluteFill, Composition, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["500", "700", "800", "900"], subsets: ["latin"] });
const FPS = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sp = (t: number, s: number, d = 14, k = 120) => spring({ frame: Math.round((t - s) * FPS), fps: FPS, config: { damping: d, stiffness: k } });
const lin = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

type Palabra = { w: string; s: number; e: number };
export type OscuroProps = { words: Palabra[]; fin: number; marca: string; clave: string[] };

// Escenas (inicio en segundos)
const E = [0, 7.5, 9.0, 15.3, 20.6, 28.0, 33.2, 38.8, 44.7];
const COLOR = ["#8B5CF6", "#8B5CF6", "#FF3B4E", "#FF3B4E", "#8B5CF6", "#8B5CF6", "#8B5CF6", "#22E39A", "#22E39A"];

// ---------- piezas 3D ----------
const Escenario: React.FC<{ c: string; f: number }> = ({ c, f }) => (
  <AbsoluteFill style={{ background: "#05040A" }}>
    {/* cono de luz */}
    <div style={{ position: "absolute", left: 140, right: 140, top: -100, height: 1500, background: `linear-gradient(180deg, ${c}55, ${c}10 60%, transparent)`,
      clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)", filter: "blur(18px)", opacity: 0.8 }} />
    {/* piso con rejilla en perspectiva */}
    <div style={{ position: "absolute", left: -600, right: -600, top: 1180, height: 1100, transform: "perspective(700px) rotateX(70deg)", transformOrigin: "50% 0",
      backgroundImage: `linear-gradient(${c}33 2px, transparent 2px), linear-gradient(90deg, ${c}33 2px, transparent 2px)`, backgroundSize: "110px 110px",
      backgroundPosition: `0 ${(f * 1.2) % 110}px`, maskImage: "linear-gradient(180deg, #000, transparent 85%)" }} />
    {/* niebla y polvo */}
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 62%, ${c}30, transparent 55%)` }} />
    {Array.from({ length: 30 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: (i * 157) % 1080, top: 300 + ((i * 271 + f * (0.4 + (i % 4) * 0.15)) % 1300), width: 3, height: 3, borderRadius: 2, background: "#fff", opacity: 0.15 + (i % 3) * 0.08 }} />
    ))}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,.85) 100%)" }} />
  </AbsoluteFill>
);

// tarjeta de anuncio (estilo publicación de Instagram) con una "persona" ilustrada
const Tarjeta: React.FC<{ tono: string; fondo: string; w?: number; brillo?: string; apagada?: boolean }> = ({ tono, fondo, w = 220, brillo, apagada }) => (
  <div style={{ width: w, height: w * 1.45, borderRadius: w * 0.07, background: "#111018", border: `3px solid ${brillo ?? "rgba(255,255,255,.15)"}`, overflow: "hidden",
    boxShadow: brillo ? `0 0 40px ${brillo}, 0 30px 60px rgba(0,0,0,.7)` : "0 30px 60px rgba(0,0,0,.7)", filter: apagada ? "grayscale(1) brightness(.5)" : undefined }}>
    <div style={{ height: w * 0.16, display: "flex", alignItems: "center", gap: w * 0.04, padding: `0 ${w * 0.06}px` }}>
      <div style={{ width: w * 0.09, height: w * 0.09, borderRadius: "50%", background: "#E1306C" }} />
      <div style={{ width: w * 0.35, height: w * 0.03, borderRadius: 4, background: "#444" }} />
    </div>
    <div style={{ height: w * 0.95, background: fondo, position: "relative" }}>
      <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", width: w * 0.6, height: w * 0.42, borderRadius: `${w * 0.3}px ${w * 0.3}px 0 0`, background: tono }} />
      <div style={{ position: "absolute", left: "50%", bottom: w * 0.36, transform: "translateX(-50%)", width: w * 0.3, height: w * 0.3, borderRadius: "50%", background: "#C98B6B" }} />
    </div>
    <div style={{ padding: w * 0.05, display: "flex", flexDirection: "column", gap: w * 0.03 }}>
      <div style={{ width: "70%", height: w * 0.035, borderRadius: 4, background: "#555" }} />
      <div style={{ width: "100%", height: w * 0.09, borderRadius: 6, background: "#2D7BFF" }} />
    </div>
  </div>
);
const ADS = [
  { tono: "#3B82F6", fondo: "linear-gradient(#2B2140,#4C3A75)" },
  { tono: "#E11D48", fondo: "linear-gradient(#F59E0B,#3B82F6)" },
  { tono: "#16A34A", fondo: "linear-gradient(#0F766E,#111827)" },
  { tono: "#F97316", fondo: "linear-gradient(#FDE68A,#BE185D)" },
];

const Burbuja: React.FC<{ x: number; y: number; o: number; c: string; s?: number }> = ({ x, y, o, c, s = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `scale(${s})`, width: 110, height: 70, borderRadius: 22, background: c, boxShadow: `0 0 24px ${c}`,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
    {[0, 1, 2].map((i) => <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: "#fff" }} />)}
  </div>
);

// bandeja de mensajes (inicio y final en espejo)
const Bandeja: React.FC<{ t: number; s: number; lleno: number; c: string; numero: number }> = ({ t, s, lleno, c, numero }) => {
  const lt = t - s;
  return (
    <div style={{ position: "absolute", left: 540, top: 1000, transform: "translate(-50%,-50%) perspective(1200px) rotateX(18deg)" }}>
      {Array.from({ length: 16 }).map((_, i) => {
        const u = ((lt * 0.9 + i * 0.13) % 1);
        return <Burbuja key={i} x={60 + ((i * 97) % 420)} y={-420 + u * 520} o={u < 0.85 ? 1 : (1 - u) * 6} c={c} s={0.8} />;
      })}
      <div style={{ width: 620, height: 420, borderRadius: 40, background: "rgba(10,10,20,.92)", border: `4px solid ${c}`, boxShadow: `0 0 60px ${c}88, inset 0 0 40px ${c}33`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${lleno * 100}%`, background: `linear-gradient(0deg, ${c}aa, ${c}22)` }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily, fontWeight: 900, fontSize: 190, color: "#fff", textShadow: `0 0 40px ${c}`, lineHeight: 1 }}>{numero}</div>
          <div style={{ fontFamily, fontWeight: 800, fontSize: 40, color: "#ddd", letterSpacing: 4 }}>CONVERSACIONES</div>
        </div>
      </div>
    </div>
  );
};

const Escena: React.FC<{ i: number; t: number; f: number }> = ({ i, t, f }) => {
  const s = E[i];
  const lt = t - s;
  const p = sp(t, s);
  switch (i) {
    case 0: { // 385 personas escribieron, a 19 centavos
      const n = Math.round(interpolate(lt, [0.2, 2.8], [0, 385], { ...clamp, easing: Easing.out(Easing.cubic) }));
      const tag = sp(t, 5.6, 9, 180);
      return (
        <>
          <Bandeja t={t} s={s} lleno={lin(t, 0.3, 5)} c="#8B5CF6" numero={n} />
          <div style={{ position: "absolute", left: 640, top: 1180, transform: `scale(${tag}) rotate(-8deg)`, fontFamily, fontWeight: 900, fontSize: 70, color: "#05040A",
            background: "linear-gradient(135deg,#FFD23F,#FF8A3D)", padding: "8px 26px", borderRadius: 18, boxShadow: "0 0 50px #FFD23F" }}>$0.19 c/u</div>
        </>
      );
    }
    case 1: { // no fue suerte: dado que cae y se tacha
      const cae = interpolate(lt, [0, 0.5], [-600, 0], { ...clamp, easing: Easing.bounce });
      const x = sp(t, s + 0.6, 8, 200);
      return (
        <div style={{ position: "absolute", left: 540, top: 1000, transform: `translate(-50%,-50%) translateY(${cae}px) perspective(800px) rotateX(${18 + Math.sin(lt * 3) * 10}deg) rotateY(${-25 + lt * 18}deg)` }}>
          <div style={{ width: 260, height: 260, borderRadius: 40, background: "linear-gradient(135deg,#fff,#cfcfe0)", boxShadow: "0 30px 60px rgba(0,0,0,.6)", display: "grid", gridTemplateColumns: "repeat(3,1fr)", padding: 36, gap: 20 }}>
            {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((v, k) => <div key={k} style={{ borderRadius: "50%", background: v ? "#111" : "transparent" }} />)}
          </div>
          <div style={{ position: "absolute", inset: -60, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 360, color: "#FF3B4E", fontWeight: 900, fontFamily,
            transform: `scale(${x})`, textShadow: "0 0 40px #FF3B4E" }}>✕</div>
        </div>
      );
    }
    case 2: { // una campaña por anuncio: el dinero se parte en pedacitos
      const parte = lin(t, 12.6, 14.2);
      return (
        <div style={{ position: "absolute", left: 540, top: 1020, transform: "translate(-50%,-50%) perspective(1200px) rotateX(25deg)" }}>
          <div style={{ display: "flex", gap: 30 }}>
            {[0, 1, 2, 3, 4].map((k) => (
              <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${sp(t, s + 0.4 + k * 0.25)})` }}>
                <Tarjeta {...ADS[k % 4]} w={150} />
                <div style={{ marginTop: 20, width: 150, height: 34, borderRadius: 10, border: "3px solid #FF3B4E", fontFamily, fontWeight: 800, fontSize: 20, color: "#FF8A95", display: "flex", alignItems: "center", justifyContent: "center" }}>CAMPAÑA {k + 1}</div>
              </div>
            ))}
          </div>
          {/* montón de monedas que se divide */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 200 }}>
            {[0, 1, 2, 3, 4].map((k) => {
              const x = interpolate(parte, [0, 1], [400, 75 + k * 180]);
              const alto = interpolate(parte, [0, 1], [150, 26]);
              return <div key={k} style={{ position: "absolute", left: x - 60, top: 150 - alto, width: 120, height: alto, borderRadius: 14, background: "linear-gradient(#FFD23F,#B8860B)", boxShadow: "0 0 30px #FFD23F88", opacity: k === 0 || parte > 0.05 ? 1 : 0 }} />;
            })}
          </div>
        </div>
      );
    }
    case 3: { // Meta nunca aprende: barras atascadas con "?"
      return (
        <div style={{ position: "absolute", left: 540, top: 1000, transform: "translate(-50%,-50%)", display: "flex", gap: 34, alignItems: "flex-end" }}>
          {[0, 1, 2, 3, 4].map((k) => {
            const h = 60 + Math.abs(Math.sin(f / 9 + k)) * 30;
            return (
              <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                <div style={{ fontFamily, fontWeight: 900, fontSize: 70, color: "#FF3B4E", opacity: 0.6 + 0.4 * Math.sin(f / 5 + k), textShadow: "0 0 20px #FF3B4E" }}>?</div>
                <div style={{ width: 120, height: 480, borderRadius: 60, border: "3px solid rgba(255,59,78,.5)", background: "rgba(255,59,78,.06)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: h * p, background: "linear-gradient(0deg,#FF3B4E,#FF3B4E44)", boxShadow: "0 0 30px #FF3B4E" }} />
                </div>
                <div style={{ fontFamily, fontWeight: 800, fontSize: 18, color: "#FF8A95" }}>APRENDIENDO…</div>
              </div>
            );
          })}
        </div>
      );
    }
    case 4: { // 4 anuncios distintos en 1 conjunto con 1 presupuesto
      const caja = sp(t, 25.4, 12, 140);
      const monedas = sp(t, 27.2, 10, 160);
      return (
        <div style={{ position: "absolute", left: 540, top: 980, transform: "translate(-50%,-50%) perspective(1400px) rotateX(16deg)" }}>
          <div style={{ display: "flex", gap: 22, transform: `translateY(${interpolate(caja, [0, 1], [0, 60])}px)` }}>
            {ADS.map((a, k) => {
              const e = sp(t, 23.0 + k * 0.25, 11, 150);
              return <div key={k} style={{ transform: `translateY(${interpolate(e, [0, 1], [-700, 0])}px) rotateZ(${(k - 1.5) * 4}deg)` }}><Tarjeta {...a} w={190} /></div>;
            })}
          </div>
          <div style={{ position: "absolute", left: -40, right: -40, top: 140, height: 340, borderRadius: 40, border: "4px solid #8B5CF6", background: "rgba(139,92,246,.10)",
            boxShadow: "0 0 60px #8B5CF6aa, inset 0 0 40px #8B5CF655", opacity: caja, transform: `scale(${interpolate(caja, [0, 1], [1.3, 1])})` }}>
            <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 34, color: "#C4B5FD", letterSpacing: 4 }}>1 CONJUNTO</div>
          </div>
          <div style={{ position: "absolute", left: "50%", top: 560, transform: `translateX(-50%) scale(${monedas})`, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 170, height: 110, borderRadius: 18, background: "linear-gradient(#FFD23F,#B8860B)", boxShadow: "0 0 50px #FFD23F" }} />
            <div style={{ fontFamily, fontWeight: 900, fontSize: 40, color: "#FFE58A" }}>1 PRESUPUESTO</div>
          </div>
        </div>
      );
    }
    case 5: { // Meta los prueba y le pasa el dinero al ganador
      const scan = ((lt * 0.9) % 1);
      const gana = t > 30.9;
      const hs = [0.35, 0.5, 1, 0.4].map((v) => v * lin(t, 28.6, 30.6));
      return (
        <div style={{ position: "absolute", left: 540, top: 980, transform: "translate(-50%,-50%) perspective(1400px) rotateX(14deg)" }}>
          <div style={{ display: "flex", gap: 22, alignItems: "flex-end" }}>
            {ADS.map((a, k) => (
              <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, transform: `scale(${gana && k === 2 ? 1.12 : 1})` }}>
                <Tarjeta {...a} w={190} brillo={gana && k === 2 ? "#22E39A" : undefined} apagada={gana && k !== 2} />
                <div style={{ width: 190, height: 280, borderRadius: 18, background: "rgba(255,255,255,.04)", position: "relative", overflow: "hidden", border: "2px solid rgba(255,255,255,.1)" }}>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${hs[k] * 100}%`, background: k === 2 && gana ? "linear-gradient(0deg,#22E39A,#22E39A44)" : "linear-gradient(0deg,#8B5CF6,#8B5CF644)" }} />
                </div>
              </div>
            ))}
          </div>
          {!gana ? <div style={{ position: "absolute", left: -30, right: -30, top: scan * 300, height: 8, background: "#22D3EE", boxShadow: "0 0 30px #22D3EE" }} /> : null}
          {gana ? Array.from({ length: 10 }).map((_, k) => {
            const u = ((lt - 2.9) * 1.2 + k * 0.1) % 1;
            return <div key={k} style={{ position: "absolute", left: 120 + (k % 4) * 40 + u * 330, top: 700 - Math.sin(u * Math.PI) * 220, width: 34, height: 34, borderRadius: 17, background: "#FFD23F", boxShadow: "0 0 18px #FFD23F", opacity: 1 - u * 0.3 }} />;
          }) : null}
        </div>
      );
    }
    case 6: { // ecuación: 1 presupuesto + muchos anuncios = la IA decide
      const a = sp(t, 33.3, 12), b = sp(t, 34.6, 12), c = sp(t, 36.4, 10);
      const caja = (o: number, el: React.ReactNode, sub: string) => (
        <div style={{ transform: `scale(${o}) perspective(900px) rotateY(${(1 - o) * 60}deg)`, opacity: o, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ width: 230, height: 230, borderRadius: 36, background: "rgba(139,92,246,.12)", border: "3px solid #8B5CF6", boxShadow: "0 0 40px #8B5CF677", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120 }}>{el}</div>
          <div style={{ fontFamily, fontWeight: 900, fontSize: 30, color: "#DDD6FE", letterSpacing: 2 }}>{sub}</div>
        </div>
      );
      const op = (o: number, s: string) => <div style={{ fontFamily, fontWeight: 900, fontSize: 110, color: "#fff", opacity: o }}>{s}</div>;
      return (
        <div style={{ position: "absolute", left: 540, top: 1000, transform: "translate(-50%,-50%)", display: "flex", alignItems: "center", gap: 18 }}>
          {caja(a, "💰", "1 PRESUPUESTO")}{op(b, "+")}{caja(b, "🃏", "MUCHOS ANUNCIOS")}
          <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, opacity: c, transform: `scale(${c})` }}>
            {op(1, "=")}
            <div style={{ fontFamily, fontWeight: 900, fontSize: 64, color: "#05040A", background: "linear-gradient(135deg,#C4B5FD,#22D3EE)", padding: "16px 34px", borderRadius: 24, boxShadow: "0 0 50px #22D3EE" }}>🤖 LA IA DECIDE</div>
          </div>
        </div>
      );
    }
    case 7: { // espejo: la bandeja ahora llena, en verde
      const n = Math.round(interpolate(t, [42.2, 43.4], [0, 385], { ...clamp, easing: Easing.out(Easing.cubic) }));
      return <Bandeja t={t} s={s} lleno={0.2 + 0.8 * lin(t, 39.5, 42.5)} c="#22E39A" numero={t < 42.2 ? 0 : n} />;
    }
    case 8: { // comenta 385
      const escribe = Math.floor(interpolate(t, [45.2, 46.0], [0, 3], clamp));
      const env = sp(t, 46.5, 9, 180);
      return (
        <>
          <Bandeja t={t} s={s} lleno={1} c="#22E39A" numero={385} />
          <div style={{ position: "absolute", left: 90, right: 90, top: 1340, display: "flex", alignItems: "center", gap: 18, background: "rgba(20,20,30,.95)", border: "3px solid #22E39A",
            borderRadius: 60, padding: "22px 30px", boxShadow: "0 0 40px #22E39A88", transform: `scale(${sp(t, s, 12)})` }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)" }} />
            <div style={{ fontFamily, fontWeight: 800, fontSize: 44, color: "#fff", flex: 1 }}>{"385".slice(0, escribe)}<span style={{ opacity: Math.sin(f / 4) > 0 ? 1 : 0 }}>|</span></div>
            <div style={{ fontFamily, fontWeight: 900, fontSize: 34, color: "#05040A", background: "#22E39A", padding: "10px 22px", borderRadius: 30, transform: `scale(${1 + env * 0.1})` }}>{env > 0.5 ? "✓ Enviado" : "Publicar"}</div>
          </div>
        </>
      );
    }
  }
  return null;
};

const Subtitulo: React.FC<{ words: Palabra[]; t: number; clave: string[] }> = ({ words, t, clave }) => {
  const i = words.findIndex((w) => t >= w.s && t < (words[words.indexOf(w) + 1]?.s ?? w.e + 0.6));
  if (i < 0) return null;
  const g = Math.floor(i / 4) * 4;
  return (
    <div style={{ position: "absolute", top: 240, left: 90, right: 90, textAlign: "center", fontFamily, fontWeight: 700, fontSize: 46, lineHeight: 1.35 }}>
      {words.slice(g, g + 4).map((w, k) => {
        const on = g + k <= i, act = g + k === i;
        const esClave = clave.includes(w.w.toLowerCase().replace(/[.,¿?¡!:]/g, ""));
        return <span key={k} style={{ margin: "0 7px", color: on ? "#fff" : "rgba(255,255,255,.35)", fontWeight: act ? 800 : 600,
          padding: esClave && on ? "0 8px" : 0, border: esClave && on ? "2px solid #7AA7FF" : "2px solid transparent", borderRadius: 6, background: esClave && on ? "rgba(45,123,255,.18)" : "transparent" }}>{w.w}</span>;
      })}
    </div>
  );
};

export const ReelOscuro: React.FC<OscuroProps> = (p) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = E.reduce((a, s, k) => (t >= s ? k : a), 0);
  const s = E[i], e = E[i + 1] ?? p.fin;
  const entra = sp(t, s, 16, 90);
  const sale = interpolate(t, [e - 0.25, e], [1, 0], clamp);
  // cámara lenta: leve empuje y giro continuo
  const cam = `perspective(1600px) rotateY(${Math.sin(t / 4) * 3}deg) scale(${1.2 + (t - s) * 0.012})`;
  return (
    <AbsoluteFill style={{ background: "#05040A", overflow: "hidden" }}>
      <Escenario c={COLOR[i]} f={f} />
      <AbsoluteFill style={{ transform: cam, opacity: Math.min(entra * 1.5, sale), filter: `blur(${(1 - Math.min(1, entra * 1.3)) * 10}px)` }}>
        <Escena i={i} t={t} f={f} />
      </AbsoluteFill>
      <Subtitulo words={p.words} t={t} clave={p.clave} />
      <div style={{ position: "absolute", top: 170, right: 70, fontFamily, fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,.4)" }}>{p.marca}</div>
    </AbsoluteFill>
  );
};

export const OscuroComposition = () => (
  <Composition id="ReelOscuro" component={ReelOscuro} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 50}
    defaultProps={{ words: [], fin: 50, marca: "", clave: [] } as OscuroProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
