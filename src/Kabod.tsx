// Tráiler cinematográfico para el lanzamiento del Congreso Escogi2 2026 (Ministerio Kabod de Dios).
// Franjas de cine, grano, destellos dorados, brasas y títulos que golpean al ritmo de la voz de locutor.
import { AbsoluteFill, Composition, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

const { fontFamily: cinzel } = loadCinzel("normal", { weights: ["700", "900"], subsets: ["latin"] });
const { fontFamily: playfair } = loadPlayfair("italic", { weights: ["700", "800"], subsets: ["latin"] });
const { fontFamily: mont } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const FPS = 30;
const S = (s: number) => Math.round(s * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sp = (t: number, s: number, d = 14, k = 120) => spring({ frame: Math.round((t - s) * FPS), fps: FPS, config: { damping: d, stiffness: k } });
const ORO = "#E8B04B", ORO2 = "#FFE3A3", CAFE = "#3A1F0E";
const BARRA = 150;
// inicio de cada frase de la voz
// frases de la voz: 0 · 3.28 · 7.02 · 10.61 · 14.2 · 17.48 · 24.51 · 28.73 · 33.6
export type KabodProps = { fin: number };

const oro = (size: number): React.CSSProperties => ({
  background: `linear-gradient(180deg, ${ORO2} 0%, ${ORO} 45%, #9A6420 100%)`, WebkitBackgroundClip: "text", color: "transparent",
  filter: "drop-shadow(0 0 18px rgba(232,176,75,.55)) drop-shadow(0 6px 0 rgba(0,0,0,.6))", fontSize: size,
});

const Brasas: React.FC<{ f: number; n?: number; o?: number }> = ({ f, n = 40, o = 1 }) => (
  <>
    {Array.from({ length: n }).map((_, i) => {
      const y = 1920 - ((i * 211 + f * (2 + (i % 5))) % 2100);
      const x = (i * 137) % 1080 + Math.sin(f / 20 + i) * 30;
      const r = 2 + (i % 4);
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: i % 3 ? "#FFB347" : "#FFE3A3", opacity: (0.35 + (i % 3) * 0.2) * o, boxShadow: "0 0 10px #FFB347" }} />;
    })}
  </>
);

const Clip: React.FC<{ src: string; desde: number; rate?: number; tono?: string; zoom?: [number, number]; t: number; dur: number }> = ({ src, desde, rate = 1, tono, zoom = [1.05, 1.18], t, dur }) => {
  const z = interpolate(t - desde, [0, dur], zoom, clamp);
  return (
    <Sequence from={S(desde)} durationInFrames={S(dur)} layout="none">
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <OffthreadVideo src={staticFile(src)} muted playbackRate={rate} style={{ width: 1080, height: 1920, objectFit: "cover", filter: tono ?? "sepia(.35) saturate(.85) contrast(1.15) brightness(.8)" }} />
      </AbsoluteFill>
    </Sequence>
  );
};

const Linea: React.FC<{ t: number; s: number; e: number; children: React.ReactNode; top?: number }> = ({ t, s, e, children, top = 760 }) => {
  if (t < s || t > e) return null;
  const inn = interpolate(t, [s, s + 0.6], [0, 1], clamp), out = interpolate(t, [e - 0.4, e], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, textAlign: "center", opacity: Math.min(inn, out), transform: `translateY(${interpolate(inn, [0, 1], [30, 0])}px)`, letterSpacing: interpolate(inn, [0, 1], [18, 4]) }}>
      {children}
    </div>
  );
};

export const ReelKabod: React.FC<KabodProps> = ({ fin }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const golpes = [7.02, 10.61, 14.2, 17.48, 24.51, 28.73, 33.6];
  const g = Math.max(...golpes.filter((x) => x <= t), -9);
  const flash = interpolate(t - g, [0, 0.06, 0.4], [0, 0.85, 0], clamp);
  const shake = t - g < 0.25 ? Math.sin(f * 3.1) * 8 * (1 - (t - g) / 0.25) : 0;
  const titulo = sp(t, 14.35, 9, 90);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden", fontFamily: mont }}>
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
        {/* 0–7 s: la escalera, en cámara lenta */}
        <Clip src="kabod/escalera.mp4" desde={0} rate={0.7} t={t} dur={7.02} zoom={[1.25, 1.05]} tono="grayscale(.55) sepia(.45) contrast(1.25) brightness(.75)" />
        {/* 7–10.6: presenta (negro con luz) */}
        {t >= 7.02 && t < 10.61 ? (
          <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #5A3410 0%, #120804 55%, #000 80%)` }}>
            <Brasas f={f} n={30} />
          </AbsoluteFill>
        ) : null}
        {/* 10.6–14.2 y 17.5–24.5: oración */}
        <Clip src="kabod/oracion1.mp4" desde={10.61} t={t} dur={3.59} />
        <Clip src="kabod/oracion2.mp4" desde={17.48} t={t} dur={7.03} zoom={[1.1, 1.25]} />
        {/* 14.2–17.5: título; 24.5–33.6: fondo dorado; 33.6–fin: afiche */}
        {(t >= 14.2 && t < 17.48) || (t >= 24.51 && t < 33.6) ? (
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #6B3E12 0%, #1C0E05 60%, #000 90%)` }}>
            <div style={{ position: "absolute", left: 340, right: 340, top: -200, height: 1700, background: "linear-gradient(180deg, rgba(255,214,140,.35), transparent)", clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)", filter: "blur(20px)" }} />
            <Brasas f={f} n={45} />
          </AbsoluteFill>
        ) : null}
        {t >= 33.6 ? (
          <AbsoluteFill>
            <Img src={staticFile("kabod/flyer.jpg")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover", filter: "blur(28px) brightness(.45)" }} />
            <div style={{ position: "absolute", left: 90, right: 90, top: 330, transform: `scale(${interpolate(t, [33.6, fin], [0.92, 1.02])})`, opacity: sp(t, 33.6), boxShadow: `0 0 80px ${ORO}88`, borderRadius: 20, overflow: "hidden" }}>
              <Img src={staticFile("kabod/flyer.jpg")} style={{ width: "100%", display: "block" }} />
            </div>
            <Brasas f={f} n={25} o={0.7} />
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>

      {/* TEXTOS */}
      <Linea t={t} s={0.3} e={3.2}><div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 64, color: "#F5E6C8" }}>HAY PASOS…</div></Linea>
      <Linea t={t} s={1.6} e={3.2} top={850}><div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 54, color: ORO2 }}>QUE NO SON CASUALIDAD</div></Linea>
      <Linea t={t} s={3.4} e={6.9}><div style={{ fontFamily: playfair, fontWeight: 800, fontSize: 70, color: "#F5E6C8" }}>Cada escalón…</div></Linea>
      <Linea t={t} s={4.6} e={6.9} top={860}><div style={{ fontFamily: playfair, fontWeight: 800, fontSize: 70, ...oro(70) }}>te acerca a tu propósito</div></Linea>
      {t >= 7.02 && t < 10.61 ? (
        <div style={{ position: "absolute", top: 700, left: 0, right: 0, textAlign: "center", opacity: interpolate(t, [7.1, 7.8, 10.2, 10.6], [0, 1, 1, 0], clamp) }}>
          <div style={{ fontFamily: mont, fontWeight: 300, fontSize: 54, color: "#F5E6C8", letterSpacing: 10 }}>MINISTERIO</div>
          <div style={{ fontFamily: mont, fontWeight: 900, fontSize: 200, lineHeight: 0.95, ...oro(200), letterSpacing: interpolate(t, [7.1, 9], [40, 6], clamp) }}>KABOD</div>
          <div style={{ fontFamily: mont, fontWeight: 300, fontSize: 54, color: "#F5E6C8", letterSpacing: 10 }}>DE DIOS</div>
          <div style={{ marginTop: 40, fontFamily: cinzel, fontWeight: 700, fontSize: 46, color: ORO, letterSpacing: 16, opacity: interpolate(t, [8.8, 9.4], [0, 1], clamp) }}>PRESENTA</div>
        </div>
      ) : null}
      {t >= 10.61 && t < 14.2 ? (
        <div style={{ position: "absolute", top: 700, left: 40, right: 40, textAlign: "center" }}>
          <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: 84, color: "#fff", textShadow: "0 6px 30px #000", transform: `scale(${sp(t, 10.65, 9, 180)})` }}>NO ES CASUALIDAD,</div>
          {t > 12.0 ? <div style={{ fontFamily: playfair, fontWeight: 800, ...oro(130), transform: `scale(${interpolate(sp(t, 12.05, 8, 200), [0, 1], [2.2, 1])})` }}>es propósito</div> : null}
        </div>
      ) : null}
      {t >= 14.2 && t < 17.48 ? (
        <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ display: "inline-block", fontFamily: cinzel, fontWeight: 900, fontSize: 56, color: CAFE, background: `linear-gradient(90deg, #9A6420, ${ORO2}, #9A6420)`, padding: "8px 40px", letterSpacing: 18, opacity: titulo }}>CONGRESO</div>
          <div style={{ position: "relative", marginTop: 10, transform: `scale(${interpolate(titulo, [0, 1], [1.6, 1])})`, opacity: Math.min(1, titulo * 1.4) }}>
            <span style={{ fontFamily: playfair, fontWeight: 800, ...oro(210) }}>ESCOGI</span>
            <span style={{ fontFamily: playfair, fontWeight: 800, fontSize: 280, color: "#FFB347", textShadow: `0 0 ${40 + Math.sin(t * 12) * 15}px #FF7A00, 0 0 80px #FF5A00` }}>2</span>
          </div>
          <div style={{ fontFamily: cinzel, fontWeight: 700, fontSize: 80, color: ORO2, letterSpacing: 30, opacity: interpolate(t, [15.6, 16.2], [0, 1], clamp) }}>2026</div>
        </div>
      ) : null}
      {t >= 17.48 && t < 24.51 ? (
        <div style={{ position: "absolute", top: 620, left: 60, right: 60, textAlign: "center" }}>
          <div style={{ fontFamily: playfair, fontWeight: 800, fontSize: 74, color: "#fff", lineHeight: 1.15, textShadow: "0 6px 30px #000", opacity: interpolate(t, [17.6, 18.4], [0, 1], clamp) }}>«Ustedes no me eligieron a mí,</div>
          <div style={{ fontFamily: playfair, fontWeight: 800, fontSize: 84, lineHeight: 1.15, ...oro(84), opacity: interpolate(t, [19.9, 20.7], [0, 1], clamp) }}>yo los elegí a ustedes»</div>
          <div style={{ marginTop: 24, fontFamily: mont, fontWeight: 800, fontSize: 40, color: "#F5E6C8", letterSpacing: 6, opacity: interpolate(t, [22.4, 23], [0, 1], clamp) }}>📖 JUAN 15:16</div>
        </div>
      ) : null}
      {t >= 24.51 && t < 33.6 ? (
        <div style={{ position: "absolute", top: 560, left: 80, right: 80 }}>
          {[
            { s: 24.6, ico: "📅", a: "SÁBADO", b: "5 DE DICIEMBRE" },
            { s: 26.4, ico: "🕓", a: "HORA", b: "4:00 P. M." },
            { s: 28.8, ico: "📍", a: "CALLE D, PALMA DE ALMA ROSA", b: "CASI ESQ. SAN VICENTE" },
          ].map((x, i) => {
            const p = sp(t, x.s, 12, 150);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 34, opacity: p, transform: `translateX(${interpolate(p, [0, 1], [-500, 0])}px)`,
                background: "rgba(20,10,4,.75)", border: `3px solid ${ORO}`, borderRadius: 26, padding: "26px 30px", boxShadow: `0 0 40px ${ORO}44` }}>
                <div style={{ fontSize: 80 }}>{x.ico}</div>
                <div>
                  <div style={{ fontFamily: mont, fontWeight: 800, fontSize: i === 2 ? 34 : 40, color: "#F5E6C8", letterSpacing: 4 }}>{x.a}</div>
                  <div style={{ fontFamily: cinzel, fontWeight: 900, fontSize: i === 2 ? 44 : 70, ...oro(i === 2 ? 44 : 70) }}>{x.b}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {t >= 33.6 ? (
        <div style={{ position: "absolute", bottom: BARRA + 40, left: 0, right: 0, textAlign: "center", transform: `scale(${sp(t, 34.6, 8, 160)})` }}>
          <span style={{ fontFamily: playfair, fontWeight: 800, ...oro(120) }}>¡Te esperamos!</span>
        </div>
      ) : null}

      {/* efectos de cine */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #FFE3A3, rgba(255,180,80,.6) 30%, transparent 70%)`, opacity: flash, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,.8) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.13, mixBlendMode: "overlay" }}>
        <filter id={`gk${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 6} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={1080} height={1920} filter={`url(#gk${f % 6})`} />
      </svg>
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(t, [0, 0.6, fin - 0.8, fin], [1, 0, 0, 1], clamp) }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: BARRA, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: BARRA, background: "#000" }} />
    </AbsoluteFill>
  );
};

export const KabodComposition = () => (
  <Composition id="ReelKabod" component={ReelKabod} fps={FPS} width={1080} height={1920} durationInFrames={S(39)} defaultProps={{ fin: 39 }}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.fin) })} />
);

void Easing;
