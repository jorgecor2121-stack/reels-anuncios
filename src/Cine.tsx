// Reel cinematográfico: franjas de cine, grano de película, movimientos de cámara lentos,
// fundidos a negro entre planos, títulos tipo créditos y tu avatar en planos cerrados.
import { AbsoluteFill, Composition, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { StudioCafe } from "./scenes/StudioCafe";
import { OutfitProvider } from "./avatar2d/outfit";
import { poseAtFrame, Segment } from "./avatar2d/timeline";
import { mouthAt, speechDuration } from "./avatar2d/lipsync";
import { Mouth } from "./avatar2d/types";

const { fontFamily: bebas } = loadBebas("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: corm } = loadCormorant("italic", { weights: ["500", "600"], subsets: ["latin"] });
const FPS = 30;
const S = (s: number) => Math.round(s * FPS);
const ORO = "#E9C77B";
const BARRA = 250; // alto de cada franja negra

type Linea = { text: string; start: number; duration: number };
// Plano de cada frase: qué se ve y cómo se mueve la cámara
type Plano =
  | { tipo: "reloj"; titulo: string }
  | { tipo: "feed"; titulo: string }
  | { tipo: "avatar"; encuadre: "medio" | "cerca" | "rostro"; titulo: string; detalle?: string }
  | { tipo: "patron"; titulo: string }
  | { tipo: "creditos"; palabras: string[] }
  | { tipo: "final"; usuario: string }
  | { tipo: "tachar"; palabra: string; cambio?: string; numero?: string }
  | { tipo: "apertura"; lineas: string[]; rojo: string };
export type CineProps = { lineas: Linea[]; planos: Plano[]; gestos: Segment[]; audio: string; fin: number };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

// ---------- Avatar en el estudio, con boca por sonido y gestos ----------
const Avatar: React.FC<{ p: CineProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({ src: staticFile(p.audio), frame, fps, windowInSeconds: 10 });
  let volume: number | undefined;
  if (audioData) volume = visualizeAudio({ fps, frame, audioData, numberOfSamples: 32, optimizeFor: "speed", dataOffsetInSeconds }).slice(1, 10).reduce((a, b) => a + b, 0) / 9;
  const base = poseAtFrame(p.gestos.map((g) => ({ ...g, talk: false })), frame, fps);
  const t = frame / fps;
  const li = p.lineas.findIndex((l) => t >= l.start && t < l.start + l.duration);
  let mouth: Mouth = base.face.mouth;
  if (li >= 0 && !["laugh", "shh", "surprise"].includes(mouth)) {
    const l = p.lineas[li];
    const m = mouthAt(l.text, (t - l.start) * (speechDuration(l.text) / Math.max(0.3, l.duration)));
    const silencio = volume !== undefined && volume < 0.025;
    mouth = m && !silencio ? m : "M";
  }
  return (
    <OutfitProvider vestimenta="hoodie">
      <StudioCafe pose={{ ...base, face: { ...base.face, mouth } }} frame={frame} energia={Math.min(1, (volume ?? 0) * 3)} />
    </OutfitProvider>
  );
};

// Cámara sobre el estudio: medio, cerca o rostro, con un empuje lento (dolly)
const Camara: React.FC<{ p: CineProps; encuadre: "medio" | "cerca" | "rostro"; dur: number }> = ({ p, encuadre, dur }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, dur], [0, 1], clamp);
  const [z0, z1, cy] = encuadre === "rostro" ? [2.5, 2.8, 1090] : encuadre === "cerca" ? [1.7, 1.9, 1120] : [1.15, 1.3, 1150];
  const z = z0 + (z1 - z0) * ease(k);
  const dx = Math.sin(f / 70) * 12;
  return (
    <AbsoluteFill style={{ transform: `translate(${540 - 540 * z + dx}px, ${960 - cy * z}px) scale(${z})`, transformOrigin: "0 0" }}>
      <Avatar p={p} />
    </AbsoluteFill>
  );
};

// ---------- Títulos tipo créditos ----------
const Titulo: React.FC<{ texto: string; detalle?: string; arriba?: boolean }> = ({ texto, detalle, arriba }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [6, 26], [0, 1], clamp);
  const track = interpolate(f, [6, 60], [30, 12], clamp);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: arriba ? BARRA + 70 : undefined, bottom: arriba ? undefined : BARRA + 260, textAlign: "center" }}>
      <div style={{ fontFamily: bebas, fontSize: 132, color: "#fff", letterSpacing: track, opacity: a, lineHeight: 0.95, textShadow: "0 6px 40px rgba(0,0,0,.7)" }}>{texto}</div>
      {detalle ? <div style={{ fontFamily: corm, fontStyle: "italic", fontSize: 54, color: ORO, opacity: interpolate(f, [20, 40], [0, 1], clamp), marginTop: 6 }}>{detalle}</div> : null}
      <div style={{ height: 3, background: ORO, margin: "18px auto 0", width: `${interpolate(f, [14, 44], [0, 260], clamp)}px`, opacity: 0.9 }} />
    </div>
  );
};

// ---------- Planos ilustrados ----------
const PlanoReloj: React.FC<{ titulo: string; dur: number }> = ({ titulo, dur }) => {
  const f = useCurrentFrame();
  const z = 1.05 + 0.25 * ease(interpolate(f, [0, dur], [0, 1], clamp));
  const sec = Math.floor(f / 30);
  const ang = sec * 6 + interpolate(f % 30, [0, 4], [0, 6], clamp) - 6; // aguja que salta cada segundo
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #2A2018 0%, #07060A 70%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${z})` }}>
        <svg width="760" height="760" viewBox="-380 -380 760 760">
          <circle r="340" fill="#120E0A" stroke={ORO} strokeWidth="6" />
          <circle r="320" fill="none" stroke="#3A2E22" strokeWidth="2" />
          {Array.from({ length: 60 }).map((_, i) => (
            <line key={i} x1="0" y1={-300} x2="0" y2={i % 5 === 0 ? -260 : -285} stroke={i % 5 === 0 ? ORO : "#6B5A44"} strokeWidth={i % 5 === 0 ? 8 : 3} transform={`rotate(${i * 6})`} />
          ))}
          <line x1="0" y1="40" x2="0" y2="-280" stroke="#C83A3A" strokeWidth="6" strokeLinecap="round" transform={`rotate(${ang})`} />
          <circle r="16" fill={ORO} />
        </svg>
      </div>
      <Titulo texto={titulo} arriba />
    </AbsoluteFill>
  );
};

const PlanoFeed: React.FC<{ titulo: string }> = ({ titulo }) => {
  const f = useCurrentFrame();
  const y = (f * 26) % 900;
  const cards = [0, 1, 2, 3];
  return (
    <AbsoluteFill style={{ background: "#0B0A10", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "relative", width: 560, height: 1100, borderRadius: 60, border: "12px solid #25232C", background: "#141219", overflow: "hidden", transform: "rotate(-4deg)" }}>
        {cards.map((i) => {
          const top = i * 900 - y - 900;
          const quieto = i === 2;
          return (
            <div key={i} style={{ position: "absolute", left: 30, right: 30, top: top + 100, height: 800, borderRadius: 30,
              background: quieto ? "linear-gradient(180deg,#3A3A44,#2A2A32)" : `linear-gradient(180deg, hsl(${(i * 70) % 360} 45% 35%), hsl(${(i * 70 + 40) % 360} 45% 22%))`,
              filter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {quieto ? <div style={{ fontFamily: corm, fontStyle: "italic", fontSize: 58, color: "#9A98A6" }}>Hola, hoy les vengo a contar…</div> : null}
            </div>
          );
        })}
        <div style={{ position: "absolute", right: 30, top: 520 - Math.sin(f / 3) * 30, fontSize: 120, filter: "drop-shadow(0 10px 20px rgba(0,0,0,.6))" }}>👆</div>
      </div>
      <Titulo texto={titulo} arriba />
    </AbsoluteFill>
  );
};

const PlanoPatron: React.FC<{ titulo: string }> = ({ titulo }) => {
  const f = useCurrentFrame();
  const salto = f > 40;
  return (
    <AbsoluteFill style={{ background: "#0B0A10", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 150px)", gap: 22, transform: `scale(${1 + 0.06 * ease(interpolate(f, [0, 120], [0, 1], clamp))})` }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const elegido = i === 12;
          const p = elegido && salto ? interpolate(f, [40, 52, 64], [0, 1, 0.9], clamp) : 0;
          return (
            <div key={i} style={{ width: 150, height: 150, borderRadius: elegido && salto ? "50%" : 18,
              background: elegido && salto ? `radial-gradient(circle, #FFE1A1, ${ORO} 60%, #B98A2E)` : "#24222B",
              transform: `translateY(${-p * 80}px) scale(${1 + p * 0.35}) rotate(${p * 20}deg)`, boxShadow: elegido && salto ? `0 0 90px ${ORO}` : "none" }} />
          );
        })}
      </div>
      <Titulo texto={titulo} />
    </AbsoluteFill>
  );
};

const PlanoCreditos: React.FC<{ palabras: string[] }> = ({ palabras }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#07060A", alignItems: "center", justifyContent: "center", gap: 34, flexDirection: "column" }}>
      {palabras.map((w, i) => {
        const a = interpolate(f, [i * 22, i * 22 + 20], [0, 1], clamp);
        return (
          <div key={i} style={{ fontFamily: bebas, fontSize: 170, color: i === palabras.length - 1 ? ORO : "#fff", letterSpacing: interpolate(f, [i * 22, i * 22 + 60], [40, 14], clamp),
            opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>{w}</div>
        );
      })}
    </AbsoluteFill>
  );
};

const PlanoTachar: React.FC<{ palabra: string; cambio?: string; numero?: string; dur: number }> = ({ palabra, cambio, numero, dur }) => {
  const f = useCurrentFrame();
  const parpadeo = f < 14 ? (f % 4 < 2 ? 0.35 : 1) : 0.92 + 0.08 * Math.sin(f / 3);
  const z = 1 + 0.08 * ease(interpolate(f, [0, dur], [0, 1], clamp));
  const raya = interpolate(f, [30, 44], [0, 1], { ...clamp, easing: ease });
  const cambioA = interpolate(f, [50, 70], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(140,20,20,${0.35 * parpadeo}) 0%, #050405 65%)`, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      {numero ? <div style={{ fontFamily: corm, fontStyle: "italic", fontSize: 60, color: "#B9B2A6", marginBottom: 10, opacity: parpadeo }}>{numero}</div> : null}
      <div style={{ position: "relative", transform: `scale(${z})` }}>
        <div style={{ fontFamily: bebas, fontSize: palabra.length > 8 ? 190 : 250, color: "#F4EFE6", letterSpacing: 10, opacity: parpadeo, textShadow: "0 0 60px rgba(255,60,60,.35)", lineHeight: 1 }}>{palabra}</div>
        <div style={{ position: "absolute", left: -20, top: "48%", height: 18, width: `calc(${raya * 100}% + 40px)`, background: "#D42B2B", transform: "rotate(-4deg)", boxShadow: "0 0 30px #D42B2B" }} />
      </div>
      {cambio ? <div style={{ fontFamily: corm, fontStyle: "italic", fontWeight: 600, fontSize: 70, color: ORO, marginTop: 40, opacity: cambioA, transform: `translateY(${(1 - cambioA) * 30}px)` }}>{cambio}</div> : null}
    </AbsoluteFill>
  );
};

// Apertura tipo póster: líneas de título que entran una a una, una palabra en rojo
const PlanoApertura: React.FC<{ lineas: string[]; rojo: string; p: CineProps; dur: number }> = ({ lineas, rojo, p, dur }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#050405" }}>
      <AbsoluteFill style={{ opacity: 0.55 }}><Camara p={p} encuadre="rostro" dur={dur} /></AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,4,5,.2) 0%, rgba(5,4,5,.85) 70%), radial-gradient(circle at 50% 40%, rgba(180,20,20,.35), transparent 60%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingTop: 300 }}>
        {lineas.map((l, i) => {
          const a = interpolate(f, [8 + i * 10, 22 + i * 10], [0, 1], clamp);
          const rojoL = l === rojo;
          return <div key={i} style={{ fontFamily: bebas, fontSize: rojoL ? 230 : 140, lineHeight: 0.95, color: rojoL ? "#E23434" : "#F4EFE6", letterSpacing: interpolate(f, [8 + i * 10, 80], [26, 8], clamp),
            opacity: a, transform: `scale(${1 + (1 - a) * 0.2})`, textShadow: rojoL ? "0 0 60px rgba(226,52,52,.7)" : "0 6px 30px rgba(0,0,0,.8)" }}>{l}</div>;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PlanoFinal: React.FC<{ usuario: string }> = ({ usuario }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 24], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#07060A", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, opacity: a }}>
      <div style={{ fontFamily: corm, fontStyle: "italic", fontSize: 54, color: "#B9B2A6" }}>una producción de</div>
      <div style={{ fontFamily: bebas, fontSize: 92, color: "#fff", letterSpacing: interpolate(f, [0, 90], [16, 5], clamp) }}>@{usuario}</div>
      <div style={{ height: 3, width: 300, background: ORO }} />
      <div style={{ fontFamily: bebas, fontSize: 70, color: ORO, letterSpacing: 8, opacity: interpolate(f, [20, 40], [0, 1], clamp) }}>GUARDA · SÍGUEME</div>
    </AbsoluteFill>
  );
};

// ---------- Subtítulos de cine (cursiva, discretos, sobre la franja inferior) ----------
const Subtitulo: React.FC<{ lineas: Linea[] }> = ({ lineas }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const l = lineas.find((x) => t >= x.start && t < x.start + x.duration + 0.15);
  if (!l) return null;
  // trozo de la frase según el avance (máx. ~7 palabras a la vez)
  const ws = l.text.split(/\s+/);
  const n = Math.ceil(ws.length / 7);
  const k = Math.min(n - 1, Math.floor(((t - l.start) / l.duration) * n));
  const trozo = ws.slice(Math.floor((k * ws.length) / n), Math.floor(((k + 1) * ws.length) / n)).join(" ");
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: BARRA + 40, textAlign: "center", fontFamily: corm, fontStyle: "italic", fontWeight: 600,
      fontSize: 52, color: "#FFF8EA", lineHeight: 1.2, textShadow: "0 2px 12px rgba(0,0,0,.95), 0 0 2px #000" }}>{trozo}</div>
  );
};

// ---------- Grano de película y viñeta ----------
const Grano: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.35 }}>
      <svg width="1080" height="1920">
        <filter id={`g${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 6} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="1080" height="1920" filter={`url(#g${f % 6})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const ReelCine: React.FC<CineProps> = (p) => {
  const f = useCurrentFrame();
  const fin = S(p.fin);
  const cortes = p.lineas.map((l) => S(l.start));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {p.planos.map((pl, i) => {
        const desde = cortes[i];
        const hasta = cortes[i + 1] ?? fin;
        const dur = hasta - desde;
        // fundido a negro corto entre planos
        const op = interpolate(f, [desde, desde + 8, hasta - 6, hasta], [0, 1, 1, 0], clamp);
        return (
          <Sequence key={i} from={desde} durationInFrames={dur} layout="none">
            <AbsoluteFill style={{ opacity: i === 0 ? Math.min(1, op + (f < 8 ? 1 : 0)) : op }}>
              {pl.tipo === "reloj" ? <PlanoReloj titulo={pl.titulo} dur={dur} />
                : pl.tipo === "feed" ? <PlanoFeed titulo={pl.titulo} />
                : pl.tipo === "avatar" ? (
                  <AbsoluteFill>
                    <Sequence from={-desde} layout="none"><Camara p={p} encuadre={pl.encuadre} dur={dur} /></Sequence>
                    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: BARRA + 360, background: "linear-gradient(180deg, rgba(0,0,0,.85), rgba(0,0,0,0))" }} />
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BARRA + 260, background: "linear-gradient(0deg, rgba(0,0,0,.85), rgba(0,0,0,0))" }} />
                    <Titulo texto={pl.titulo} detalle={pl.detalle} arriba />
                  </AbsoluteFill>
                )
                : pl.tipo === "patron" ? <PlanoPatron titulo={pl.titulo} />
                : pl.tipo === "creditos" ? <PlanoCreditos palabras={pl.palabras} />
                : pl.tipo === "tachar" ? <PlanoTachar palabra={pl.palabra} cambio={pl.cambio} numero={pl.numero} dur={dur} />
                : pl.tipo === "apertura" ? <Sequence from={-desde} layout="none"><PlanoApertura lineas={pl.lineas} rojo={pl.rojo} p={p} dur={dur} /></Sequence>
                : <PlanoFinal usuario={pl.usuario} />}
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {/* viñeta + grano */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.6) 100%)", pointerEvents: "none" }} />
      <Grano />
      <Subtitulo lineas={p.lineas} />
      {/* franjas de cine */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: BARRA, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: BARRA, background: "#000" }} />
    </AbsoluteFill>
  );
};

// Portada tipo póster de película (imagen fija para Instagram)
export const PortadaCine: React.FC<CineProps & { portada: { lineas: string[]; rojo: string; tagline: string; usuario: string } }> = (p) => {
  const t = p.portada;
  return (
    <AbsoluteFill style={{ background: "#050405" }}>
      {/* rostro en la mitad de arriba */}
      <AbsoluteFill style={{ transform: "translate(0px, -330px)" }}><Camara p={p} encuadre="rostro" dur={1} /></AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 28%, rgba(210,30,30,.38), transparent 45%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,4,5,.55) 0%, rgba(5,4,5,0) 18%, rgba(5,4,5,0) 36%, rgba(5,4,5,.92) 52%, #050405 64%)" }} />
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", fontFamily: corm, fontStyle: "italic", fontSize: 52, color: "#E9E1D6", textShadow: "0 2px 12px #000" }}>{t.tagline}</div>
      <div style={{ position: "absolute", top: 1000, left: 40, right: 40, textAlign: "center" }}>
        {t.lineas.map((l, i) => (
          <div key={i} style={{ fontFamily: bebas, fontSize: l === t.rojo ? 280 : 140, lineHeight: 0.9, color: l === t.rojo ? "#E23434" : "#F4EFE6", letterSpacing: 8,
            textShadow: l === t.rojo ? "0 0 70px rgba(226,52,52,.8)" : "0 8px 40px rgba(0,0,0,.9)" }}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 90, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ height: 3, width: 260, background: ORO, margin: "0 auto 18px" }} />
        <div style={{ fontFamily: bebas, fontSize: 60, color: "#F4EFE6", letterSpacing: 8 }}>@{t.usuario}</div>
      </div>
      <Grano />
    </AbsoluteFill>
  );
};

export const CineComposition = () => (
  <Composition id="ReelCine" component={ReelCine} durationInFrames={S(10)} fps={FPS} width={1080} height={1920}
    defaultProps={{ lineas: [], planos: [], gestos: [{ start: 0, pose: "base" }], audio: "narracion.wav", fin: 10 } as CineProps}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.fin) })} />
);

export const PortadaComposition = () => (
  <Composition id="PortadaCine" component={PortadaCine} durationInFrames={1} fps={FPS} width={1080} height={1920}
    defaultProps={{ lineas: [], planos: [], gestos: [{ start: 0, pose: "base" }], audio: "narracion.wav", fin: 1, portada: { lineas: [], rojo: "", tagline: "", usuario: "" } } as CineProps & { portada: { lineas: string[]; rojo: string; tagline: string; usuario: string } }} />
);
