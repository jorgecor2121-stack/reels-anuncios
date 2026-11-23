// Reel de lanzamiento estilo "video oficial de congreso": música manda, cortes al beat, tipografía en bloques,
// figuras doradas flotando, tarjeta de predicadora, fechas en tarjetas y cierre con marca. Paleta Kabod: oro/fuego/negro.
import { AbsoluteFill, Composition, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

const { fontFamily: anton } = loadAnton();
const { fontFamily: mont } = loadMont("normal", { weights: ["500", "800", "900"], subsets: ["latin"] });
const { fontFamily: playfair } = loadPlayfair("italic", { weights: ["800"], subsets: ["latin"] });
const FPS = 30;
const S = (s: number) => Math.round(s * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sp = (t: number, s: number, d = 11, k = 190) => spring({ frame: Math.round((t - s) * FPS), fps: FPS, config: { damping: d, stiffness: k } });
const ORO = "#F2B640", FUEGO = "#FF6A1A", CREMA = "#FFF1D6", VINO = "#5A1608", NEGRO = "#0B0604";
const D = 1.0; // la voz entra al segundo 1
export type Kabod2Props = { fin: number };

// figuras doradas que flotan (esferas, anillos, cápsulas)
const Figuras: React.FC<{ f: number; o?: number; semilla?: number }> = ({ f, o = 1, semilla = 0 }) => (
  <>
    {Array.from({ length: 7 }).map((_, i) => {
      const k = i + semilla;
      const x = ((k * 173) % 980) + Math.sin(f / 18 + k) * 40;
      const y = ((k * 331) % 1500) + 150 + Math.cos(f / 22 + k) * 50;
      const s = 70 + (k % 3) * 50;
      const tipo = k % 3;
      const rot = f * (k % 2 ? 2 : -2) + k * 40;
      const base: React.CSSProperties = { position: "absolute", left: x, top: y, width: s, height: tipo === 2 ? s * 0.45 : s, transform: `rotate(${rot}deg)`, opacity: o };
      if (tipo === 0) return <div key={i} style={{ ...base, borderRadius: "50%", background: `radial-gradient(circle at 30% 30%, #FFF4C8, ${ORO} 45%, #8A4F0E 100%)`, boxShadow: `0 0 30px ${ORO}88` }} />;
      if (tipo === 1) return <div key={i} style={{ ...base, borderRadius: "50%", border: `${s * 0.16}px solid ${FUEGO}`, boxShadow: `0 0 24px ${FUEGO}` }} />;
      return <div key={i} style={{ ...base, borderRadius: s, background: `linear-gradient(90deg, ${FUEGO}, ${ORO})` }} />;
    })}
  </>
);

const Clip: React.FC<{ src: string; s: number; e: number; t: number; rate?: number; z?: [number, number]; filtro?: string }> = ({ src, s, e, t, rate = 1, z = [1.08, 1.2], filtro }) => (
  <Sequence from={S(s)} durationInFrames={Math.max(1, S(e - s))} layout="none">
    <AbsoluteFill style={{ transform: `scale(${interpolate(t, [s, e], z, clamp)})` }}>
      <OffthreadVideo src={staticFile(src)} muted playbackRate={rate} style={{ width: 1080, height: 1920, objectFit: "cover", filter: filtro ?? "saturate(1.15) contrast(1.1) brightness(.85)" }} />
    </AbsoluteFill>
  </Sequence>
);

const Bloque: React.FC<{ txt: string; bg: string; c: string; t: number; s: number; size?: number; lado?: 1 | -1 }> = ({ txt, bg, c, t, s, size = 150, lado = 1 }) => {
  if (t < s) return null;
  const p = sp(t, s, 13, 220);
  return (
    <div style={{ background: bg, color: c, fontFamily: anton, fontSize: size, lineHeight: 1.05, padding: "6px 40px", textAlign: "center", letterSpacing: 2,
      transform: `translateX(${interpolate(p, [0, 1], [lado * 1200, 0])}px)` }}>{txt}</div>
  );
};

export const ReelKabod2: React.FC<Kabod2Props> = ({ fin }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  // cortes al beat
  const cortes = [D + 1.96, D + 5.5, D + 7.02, D + 8.7, D + 12.76, D + 13.86, D + 14.96, D + 16.22, D + 17.86, D + 19.44, D + 21.1, D + 26.9, D + 30.86];
  const g = Math.max(...cortes.filter((x) => x <= t), -9);
  const flash = interpolate(t - g, [0, 0.04, 0.2], [0, 0.7, 0], clamp);
  const punch = interpolate(t - g, [0, 0.12, 0.5], [1.12, 1.03, 1], clamp);
  const seg = (a: number, b: number) => t >= D + a && t < D + b;
  return (
    <AbsoluteFill style={{ background: NEGRO, overflow: "hidden", fontFamily: mont }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        {/* 0 · apertura en negro, texto que se escribe */}
        {t < D + 1.96 ? (
          <AbsoluteFill style={{ background: NEGRO, alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: mont, fontWeight: 500, fontSize: 50, color: CREMA, letterSpacing: 4 }}>
              {"Este 5 de diciembre…".slice(0, Math.max(0, Math.floor((t - 0.3) * 14)))}<span style={{ opacity: Math.sin(f / 4) > 0 ? 1 : 0 }}>|</span>
            </div>
          </AbsoluteFill>
        ) : null}
        {/* 1 · llega el congreso: escalera + logo */}
        <Clip src="kabod/escalera.mp4" s={D + 1.96} e={D + 5.5} t={t} rate={1.4} z={[1.3, 1.05]} filtro="sepia(.4) saturate(1.2) contrast(1.15) brightness(.55)" />
        {seg(1.96, 5.5) ? (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <Figuras f={f} />
            <div style={{ textAlign: "center", transform: `scale(${interpolate(sp(t, D + 2.5, 9, 160), [0, 1], [2.4, 1])})` }}>
              <div style={{ display: "inline-block", background: ORO, color: NEGRO, fontFamily: anton, fontSize: 62, padding: "4px 30px", letterSpacing: 14 }}>CONGRESO</div>
              <div style={{ position: "relative", lineHeight: 0.9 }}>
                <span style={{ fontFamily: anton, fontSize: 250, color: CREMA, textShadow: `0 0 40px ${ORO}` }}>ESCOGI</span>
                <span style={{ fontFamily: anton, fontSize: 330, color: FUEGO, textShadow: `0 0 ${50 + Math.sin(t * 14) * 20}px #FF3B00` }}>2</span>
              </div>
              <div style={{ fontFamily: anton, fontSize: 110, color: ORO, letterSpacing: 30, opacity: interpolate(t, [D + 3.6, D + 3.9], [0, 1], clamp) }}>2026</div>
            </div>
          </AbsoluteFill>
        ) : null}
        {/* 2 · no es casualidad / es propósito: bloques */}
        {seg(5.5, 8.7) ? (
          <AbsoluteFill style={{ background: `linear-gradient(160deg, ${VINO}, ${NEGRO})`, justifyContent: "center" }}>
            <Figuras f={f} o={0.8} semilla={3} />
            <Bloque txt="NO ES" bg={CREMA} c={NEGRO} t={t} s={D + 5.5} size={170} />
            <Bloque txt="CASUALIDAD" bg={NEGRO} c={CREMA} t={t} s={D + 5.92} size={170} lado={-1} />
            <Bloque txt="ES PROPÓSITO" bg={ORO} c={NEGRO} t={t} s={D + 7.02} size={150} />
          </AbsoluteFill>
        ) : null}
        {/* 3 · tarjeta de la predicadora */}
        <Clip src="kabod/profeta.mp4" s={D + 8.7} e={D + 12.0} t={t} z={[1.15, 1.05]} />
        {seg(8.7, 12.0) ? (
          <>
            <AbsoluteFill style={{ background: `linear-gradient(0deg, ${NEGRO} 0%, rgba(11,6,4,.6) 30%, rgba(0,0,0,0) 55%)` }} />
            <div style={{ position: "absolute", left: 50, bottom: 260, right: 50 }}>
              <div style={{ display: "inline-block", background: FUEGO, color: "#fff", fontWeight: 900, fontSize: 38, padding: "6px 20px", letterSpacing: 4, transform: `scale(${sp(t, D + 9.0)})`, transformOrigin: "0 50%" }}>PASTORA Y PROFETA</div>
              <div style={{ fontFamily: anton, fontSize: 190, color: CREMA, lineHeight: 0.92, transform: `translateX(${interpolate(sp(t, D + 10.2, 13, 200), [0, 1], [-900, 0])}px)`, textShadow: "0 8px 30px #000" }}>NIKAURIS</div>
              <div style={{ fontFamily: anton, fontSize: 130, color: ORO, lineHeight: 0.95, transform: `translateX(${interpolate(sp(t, D + 10.9, 13, 200), [0, 1], [900, 0])}px)` }}>DE TEJADA</div>
            </div>
            <Figuras f={f} o={0.9} semilla={5} />
          </>
        ) : null}
        {/* 4 · adoración / oración / palabra — un clip y una palabra por golpe */}
        <Clip src="kabod/oracion2.mp4" s={D + 12.0} e={D + 13.86} t={t} />
        <Clip src="kabod/oracion1.mp4" s={D + 13.86} e={D + 14.96} t={t} />
        <Clip src="kabod/oracion2.mp4" s={D + 14.96} e={D + 16.22} t={t} z={[1.3, 1.4]} />
        {seg(12.0, 16.22) ? (
          <div style={{ position: "absolute", top: 820, left: 0, right: 0, textAlign: "center" }}>
            {t < D + 12.76 ? <div style={{ fontFamily: playfair, fontWeight: 800, fontSize: 90, color: CREMA, textShadow: "0 6px 24px #000" }}>Una tarde de…</div> : null}
            {t >= D + 12.76 && t < D + 13.86 ? <Bloque txt="ADORACIÓN" bg={ORO} c={NEGRO} t={t} s={D + 12.76} size={160} /> : null}
            {t >= D + 13.86 && t < D + 14.96 ? <Bloque txt="ORACIÓN" bg={FUEGO} c="#fff" t={t} s={D + 13.86} size={170} lado={-1} /> : null}
            {t >= D + 14.96 ? <Bloque txt="PALABRA" bg={CREMA} c={NEGRO} t={t} s={D + 14.96} size={170} /> : null}
          </div>
        ) : null}
        {/* 5 · para los escogidos / quebrantados / con llamado */}
        <Clip src="kabod/profeta2.mp4" s={D + 16.22} e={D + 21.1} t={t} z={[1.05, 1.2]} filtro="saturate(1.1) contrast(1.1) brightness(.6)" />
        {seg(16.22, 21.1) ? (
          <AbsoluteFill style={{ justifyContent: "center" }}>
            <div style={{ fontFamily: mont, fontWeight: 900, fontSize: 48, color: CREMA, textAlign: "center", letterSpacing: 8, marginBottom: 14 }}>PARA LOS…</div>
            <Bloque txt="ESCOGIDOS" bg={ORO} c={NEGRO} t={t} s={D + 16.62} size={150} />
            <Bloque txt="QUEBRANTADOS" bg={NEGRO} c={CREMA} t={t} s={D + 18.14} size={130} lado={-1} />
            <Bloque txt="CON UN LLAMADO" bg={FUEGO} c="#fff" t={t} s={D + 20.0} size={120} />
          </AbsoluteFill>
        ) : null}
        {/* 6 · fecha, hora, lugar */}
        {seg(21.1, 26.9) ? (
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #6B2A0C, ${NEGRO} 70%)`, alignItems: "center", justifyContent: "center" }}>
            <Figuras f={f} o={0.8} semilla={8} />
            <div style={{ display: "flex", gap: 24, transform: `scale(${sp(t, D + 21.1, 10, 170)})` }}>
              <div style={{ background: CREMA, color: NEGRO, borderRadius: 28, overflow: "hidden", width: 400, textAlign: "center", boxShadow: `0 0 60px ${ORO}88` }}>
                <div style={{ background: FUEGO, color: "#fff", fontFamily: anton, fontSize: 70, padding: "6px 0" }}>SÁBADO</div>
                <div style={{ fontFamily: anton, fontSize: 250, lineHeight: 1 }}>05</div>
                <div style={{ fontFamily: anton, fontSize: 70, paddingBottom: 12 }}>DICIEMBRE</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 24, opacity: interpolate(t, [D + 23.6, D + 23.9], [0, 1], clamp) }}>
                <div style={{ background: ORO, color: NEGRO, borderRadius: 28, padding: "30px 30px", fontFamily: anton, fontSize: 120, lineHeight: 1 }}>4:00<div style={{ fontSize: 60 }}>P. M.</div></div>
              </div>
            </div>
            <div style={{ position: "absolute", top: 1340, left: 60, right: 60, textAlign: "center", opacity: interpolate(t, [D + 25.0, D + 25.3], [0, 1], clamp), transform: `translateY(${interpolate(sp(t, D + 25.0), [0, 1], [80, 0])}px)` }}>
              <div style={{ fontFamily: anton, fontSize: 90, color: CREMA }}>📍 PALMA DE ALMA ROSA</div>
              <div style={{ fontFamily: mont, fontWeight: 800, fontSize: 38, color: ORO }}>Calle D, casi esquina San Vicente</div>
            </div>
          </AbsoluteFill>
        ) : null}
        {/* 7 · cupo limitado + contacto */}
        {seg(26.9, 30.86) ? (
          <AbsoluteFill style={{ background: `linear-gradient(160deg, ${NEGRO}, ${VINO})`, alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: anton, fontSize: 170, color: FUEGO, border: `12px solid ${FUEGO}`, padding: "0 40px", transform: `rotate(-8deg) scale(${interpolate(sp(t, D + 26.9, 7, 260), [0, 1], [2.5, 1])})`, textShadow: "0 0 30px #FF3B00" }}>CUPO LIMITADO</div>
            <div style={{ marginTop: 90, textAlign: "center", transform: `scale(${sp(t, D + 28.36)})` }}>
              <div style={{ display: "inline-block", background: "#25D366", color: "#05210F", fontWeight: 900, fontSize: 64, padding: "14px 34px", borderRadius: 20 }}>📲 1-849-570-0228</div>
              <div style={{ marginTop: 20, fontWeight: 900, fontSize: 48, color: CREMA }}>@somoskabodedios</div>
            </div>
          </AbsoluteFill>
        ) : null}
        {/* 8 · cierre con marca y afiche */}
        {t >= D + 30.86 ? (
          <AbsoluteFill>
            <Img src={staticFile("kabod/flyer.jpg")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover", filter: "blur(26px) brightness(.4)" }} />
            <Figuras f={f} o={0.7} semilla={11} />
            <div style={{ position: "absolute", left: 110, right: 110, top: 260, transform: `scale(${interpolate(sp(t, D + 30.86, 12, 140), [0, 1], [0.7, 1]) * interpolate(t, [D + 31, fin], [1, 1.04])})`, boxShadow: `0 0 80px ${ORO}99`, borderRadius: 18, overflow: "hidden" }}>
              <Img src={staticFile("kabod/flyer.jpg")} style={{ width: "100%", display: "block" }} />
            </div>
            <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, textAlign: "center", fontFamily: playfair, fontWeight: 800, fontSize: 96, color: ORO, textShadow: "0 6px 24px #000", transform: `scale(${sp(t, D + 32.5, 9, 180)})` }}>¡Te esperamos!</div>
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${CREMA}, ${ORO}aa 35%, transparent 70%)`, opacity: flash, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.7) 100%)" }} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(t, [fin - 0.6, fin], [0, 1], clamp) }} />
    </AbsoluteFill>
  );
};

export const Kabod2Composition = () => (
  <Composition id="ReelKabod2" component={ReelKabod2} fps={FPS} width={1080} height={1920} durationInFrames={S(36.5)} defaultProps={{ fin: 36.5 }}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.fin) })} />
);
