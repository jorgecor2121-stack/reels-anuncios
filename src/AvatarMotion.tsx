// Reel completo: estudio de pódcast con el avatar 2D (gestos + boca con la voz) abajo,
// escena animada que ilustra cada frase arriba y subtítulos palabra a palabra en medio.
import { AbsoluteFill, Composition, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Esc, MotionProps, Subs, palabras } from "./Motion";
import { Studio } from "./scenes/Studio";
import { StudioNeon } from "./scenes/StudioNeon";
import { StudioSunset } from "./scenes/StudioSunset";
import { StudioCafe } from "./scenes/StudioCafe";
import { StudioBoutique } from "./scenes/StudioBoutique";
import { StudioEscenario } from "./scenes/StudioEscenario";
import { OutfitProvider, Vestimenta } from "./avatar2d/outfit";
import { poseAtFrame, Segment } from "./avatar2d/timeline";
import { mouthAt, speechDuration } from "./avatar2d/lipsync";
import { Mouth } from "./avatar2d/types";

const { fontFamily } = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const FPS = 30;
const S = (s: number) => Math.round(s * FPS);
const BAJAR = 330; // cuánto se baja el estudio para dejar arriba el espacio de las escenas

export type AvatarMotionProps = MotionProps & {
  audio: string; // narración en public/ (solo para mover la boca; el audio se mezcla aparte)
  gestos: Segment[]; // poses del avatar por segundo
  entorno?: "clasico" | "neon" | "atardecer" | "cafe" | "boutique" | "escenario";
  vestimenta?: Vestimenta;
  escalaEscena?: number; // tamaño de las escenas de arriba (0.6 por defecto)
  // Datos que aparecen flotando a los lados del avatar mientras hablas
  chips?: { start: number; texto: string; lado: "izq" | "der"; color?: string; dur?: number }[];
  // Ráfagas de emojis que suben (likes, fuego, dinero…)
  reacciones?: { start: number; emoji: string }[];
  arriba?: boolean; // avatar más grande y más arriba (ojos sobre la mitad de la pantalla)
  // Cámara por frase: "general" (1x), "medio" (1.12x) o "primer" (primer plano 1.3x), con acercamiento lento dentro de cada frase.
  planos?: ("general" | "medio" | "primer")[];
  // Modo historia: lugar distinto por frase (el personaje protagoniza) y look de cine.
  entornos?: AvatarMotionProps["entorno"][];
  cine?: boolean; // franjas negras, grano, viñeta, fundido a negro al cambiar de lugar y subtítulos abajo
};

const lineaEn = (p: AvatarMotionProps, t: number) => Math.max(0, p.lineas.reduce((a, l, i) => (t >= l.start ? i : a), -1));
const entornoEn = (p: AvatarMotionProps, t: number) => (p.entornos?.length ? p.entornos[Math.min(lineaEn(p, t), p.entornos.length - 1)] : p.entorno) ?? p.entorno;

const ZOOM = { general: 1, medio: 1.07, primer: 1.15 } as const;
const zoomCamara = (p: AvatarMotionProps, t: number) => {
  if (!p.planos?.length) return 1;
  const z = (i: number) => ZOOM[p.planos![Math.min(i, p.planos!.length - 1)] ?? "general"];
  const li = Math.max(0, p.lineas.reduce((a, l, i) => (t >= l.start ? i : a), -1));
  const l = p.lineas[li];
  const prog = l ? Math.min(1, Math.max(0, (t - l.start) / Math.max(0.5, l.duration))) : 0;
  const entra = li > 0 ? interpolate(t - (l?.start ?? 0), [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const base = z(Math.max(0, li - 1)) + (z(li) - z(Math.max(0, li - 1))) * (1 - Math.pow(1 - entra, 3));
  return base * (1 + 0.035 * prog); // empuje lento de cámara
};

const Chip: React.FC<{ c: NonNullable<AvatarMotionProps["chips"]>[number]; i: number }> = ({ c, i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f0 = S(c.start);
  const dur = S(c.dur ?? 2.6);
  if (frame < f0 || frame > f0 + dur + 10) return null;
  const p = spring({ frame: frame - f0, fps, config: { damping: 10, stiffness: 180 } });
  const outP = interpolate(frame - f0 - dur, [0, 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const float = Math.sin((frame + i * 20) / 12) * 10;
  const left = c.lado === "izq";
  const col = c.color ?? "#22D3EE";
  return (
    <div style={{ position: "absolute", top: 1060 + (i % 3) * 120 + float, [left ? "left" : "right"]: 30,
      transform: `translateX(${interpolate(p, [0, 1], [left ? -300 : 300, 0])}px) scale(${interpolate(p, [0, 1], [0.6, 1])})`, opacity: outP,
      background: "rgba(10,8,22,.82)", border: `3px solid ${col}`, borderRadius: 26, padding: "16px 26px", fontSize: 40, fontWeight: 900,
      color: "#fff", boxShadow: `0 0 30px ${col}66`, whiteSpace: "nowrap" }}>{c.texto}</div>
  );
};

const Reaccion: React.FC<{ r: { start: number; emoji: string } }> = ({ r }) => {
  const frame = useCurrentFrame();
  const f0 = S(r.start);
  if (frame < f0 || frame > f0 + 60) return null;
  return (
    <>
      {Array.from({ length: 7 }).map((_, k) => {
        const t = (frame - f0 - k * 3) / 50;
        if (t < 0 || t > 1) return null;
        const x = 540 + Math.sin(k * 2.3) * 300 + Math.sin(t * 6 + k) * 30;
        const y = 1500 - t * 700;
        return <div key={k} style={{ position: "absolute", left: x, top: y, fontSize: 70 + (k % 3) * 20, opacity: 1 - t, transform: `rotate(${Math.sin(k + t * 4) * 20}deg)` }}>{r.emoji}</div>;
      })}
    </>
  );
};

// Figuras geométricas que flotan en el fondo (alrededor del avatar)
const Figuras: React.FC = () => {
  const frame = useCurrentFrame();
  const cols = ["#22D3EE", "#A855F7", "#FF8A3D", "#FFD23F"];
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => {
        const x = i % 2 === 0 ? 20 + ((i * 53) % 200) : 860 + ((i * 47) % 190);
        const y = 980 + ((i * 97 + frame * (0.8 + (i % 3) * 0.4)) % 520);
        const rot = frame * (i % 2 ? 1.5 : -1.2) + i * 40;
        const sz = 26 + (i % 4) * 10;
        const col = cols[i % 4];
        const shape = i % 3;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 2480 - y, width: sz, height: sz, opacity: 0.55,
            border: shape === 2 ? `5px solid ${col}` : "none", background: shape === 2 ? "transparent" : col,
            borderRadius: shape === 0 ? "50%" : 6, transform: `rotate(${rot}deg)` }} />
        );
      })}
    </>
  );
};

const Personaje: React.FC<{ p: AvatarMotionProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({ src: staticFile(p.audio), frame, fps, windowInSeconds: 10 });
  let volume: number | undefined;
  if (audioData) {
    const bins = visualizeAudio({ fps, frame, audioData, numberOfSamples: 32, optimizeFor: "speed", dataOffsetInSeconds });
    volume = bins.slice(1, 10).reduce((a, b) => a + b, 0) / 9;
  }
  // Boca: sigue cada letra del texto (A, E, I, O, U, M, F, L, S…), estirada al tiempo real de tu voz;
  // en las pausas (volumen bajo) se cierra. Las bocas propias del gesto (risa, shh, sorpresa) se respetan.
  const base = poseAtFrame(p.gestos.map((g) => ({ ...g, talk: false })), frame, fps);
  const t = frame / fps;
  const li = p.lineas.findIndex((l) => t >= l.start && t < l.start + l.duration);
  let mouth: Mouth = base.face.mouth;
  const locked: Mouth[] = ["laugh", "shh", "surprise"];
  let hablando = false;
  if (li >= 0 && !locked.includes(mouth)) {
    const l = p.lineas[li];
    const factor = speechDuration(l.text) / Math.max(0.3, l.duration);
    const m = mouthAt(l.text, (t - l.start) * factor);
    const silencio = volume !== undefined && volume < 0.025;
    if (m && !silencio) { mouth = m; hablando = true; } else if (silencio) mouth = "M";
  }
  const pose = { ...base, headY: (base.headY ?? 0) + (hablando ? Math.sin(t * 9) * 2 + Math.min(4, (volume ?? 0) * 25) : 0), face: { ...base.face, mouth } };
  const glow = 0.85 + Math.min(0.3, (volume ?? 0) * 1.5);
  const ent = entornoEn(p, t);
  return (
    <div style={{ position: "absolute", left: 0, top: p.arriba ? -311 : BAJAR, width: 1080, height: 1920, transform: `${p.arriba ? "scale(1.25) " : ""}scale(${zoomCamara(p, t)})`, transformOrigin: p.planos?.length ? "540px 700px" : "540px 0" }}>
      <OutfitProvider vestimenta={p.vestimenta}>
        {ent === "neon" ? <StudioNeon pose={pose} frame={frame} energia={Math.min(1, (volume ?? 0) * 3)} />
          : ent === "atardecer" ? <StudioSunset pose={pose} frame={frame} energia={Math.min(1, (volume ?? 0) * 3)} />
          : ent === "cafe" ? <StudioCafe pose={pose} frame={frame} energia={Math.min(1, (volume ?? 0) * 3)} />
          : ent === "escenario" ? <StudioEscenario pose={pose} frame={frame} energia={Math.min(1, (volume ?? 0) * 3)} />
          : ent === "boutique" ? <StudioBoutique pose={pose} frame={frame} energia={Math.min(1, (volume ?? 0) * 3)} />
          : <Studio pose={pose} glow={glow} />}
      </OutfitProvider>
    </div>
  );
};


// Look de cine: grano, viñeta, franjas y fundido a negro cuando cambia el lugar.
const Cine: React.FC<{ p: AvatarMotionProps; t: number }> = ({ p, t }) => {
  const frame = useCurrentFrame();
  const li = lineaEn(p, t);
  const cambia = li > 0 && p.entornos && p.entornos[li] !== p.entornos[li - 1];
  const dt = t - (p.lineas[li]?.start ?? 0);
  const negro = (cambia ? interpolate(dt, [0, 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0)
    + interpolate(t, [0, 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 45%, rgba(0,0,0,.55) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${frame % 7}'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70, background: "#000" }} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.min(1, negro) }} />
    </>
  );
};

export const ReelAvatarMotion: React.FC<AvatarMotionProps> = (p) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ws = palabras(p);
  const e = entornoEn(p, t);
  const li = Math.max(0, p.lineas.reduce((a, l, i) => (t >= l.start ? i : a), -1));
  const ls = p.lineas[li]?.start ?? 0;
  const out = interpolate(S(p.lineas[li + 1]?.start ?? p.fin) - frame, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0A0503", fontFamily, color: "#fff", overflow: "hidden" }}>
      <Personaje p={p} />
      {e === "neon" || e === "atardecer" || e === "cafe" || e === "boutique" || e === "escenario" ? <Figuras /> : null}
      {(p.reacciones ?? []).map((r, i) => <Reaccion key={i} r={r} />)}
      {(p.chips ?? []).map((c, i) => <Chip key={i} c={c} i={i} />)}
      {/* oscurece arriba para que las escenas se lean */}
      <AbsoluteFill style={{ background: e === "escenario" ? "linear-gradient(180deg, rgba(6,11,34,1) 0%, rgba(6,11,34,.92) 32%, rgba(6,11,34,0) 46%)" : e === "boutique" ? (p.arriba ? "linear-gradient(180deg, rgba(58,30,36,1) 0%, rgba(58,30,36,.92) 26%, rgba(58,30,36,0) 38%)" : "linear-gradient(180deg, rgba(58,30,36,1) 0%, rgba(58,30,36,.92) 32%, rgba(58,30,36,0) 48%)") : e === "cafe" ? "linear-gradient(180deg, rgba(30,16,10,1) 0%, rgba(30,16,10,.92) 32%, rgba(30,16,10,0) 48%)" : e === "atardecer" ? "linear-gradient(180deg, rgba(26,18,32,1) 0%, rgba(26,18,32,.92) 32%, rgba(26,18,32,0) 48%)" : e === "neon" ? "linear-gradient(180deg, rgba(7,6,15,1) 0%, rgba(7,6,15,.92) 32%, rgba(7,6,15,0) 50%)" : "linear-gradient(180deg, rgba(10,5,3,1) 0%, rgba(10,5,3,.9) 32%, rgba(10,5,3,0) 50%)" }} />
      {/* barra de progreso + marca */}
      <div style={{ position: "absolute", top: 110, left: 90, right: 90, height: 8, borderRadius: 4, background: "rgba(255,255,255,.12)" }}>
        <div style={{ width: `${Math.min(1, t / p.fin) * 100}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#FF8A3D,#FFD23F)" }} />
      </div>
      <div style={{ position: "absolute", top: 140, width: "100%", textAlign: "center", fontSize: 34, fontWeight: 800, color: "#A9A6B8", letterSpacing: 2 }}>{p.marca}</div>
      {/* escena de la frase, reducida al espacio de arriba */}
      <div style={{ position: "absolute", top: p.arriba ? 150 : 190, height: p.arriba ? 430 : 640, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: out }}>
        <div key={li} style={{ transform: `scale(${p.escalaEscena ?? 0.6})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sequence from={S(ls)} layout="none"><Esc e={p.escenas[Math.min(li, p.escenas.length - 1)]} /></Sequence>
        </div>
      </div>
      {/* subtítulos entre la escena y la cabeza */}
      <div style={{ position: "absolute", top: p.cine ? 1620 : p.arriba || e === "escenario" ? 1690 : 850, left: 30, right: 30, textAlign: "center", ...(p.cine || p.arriba || e === "escenario" ? { background: "rgba(40,18,24,.82)", borderRadius: 28, padding: "14px 10px" } : {}) }}><Subs p={p} t={t} ws={ws} /></div>
      {p.cine ? <Cine p={p} t={t} /> : null}
    </AbsoluteFill>
  );
};

export const AvatarMotionComposition = () => (
  <Composition id="ReelAvatarMotion" component={ReelAvatarMotion} durationInFrames={S(10)} fps={FPS} width={1080} height={1920}
    defaultProps={{ lineas: [], escenas: [], resaltar: [], marca: "@almonte.suarez", fin: 10, audio: "narracion.wav", gestos: [{ start: 0, pose: "base" }] } as AvatarMotionProps}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.fin) })} />
);
