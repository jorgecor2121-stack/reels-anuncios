// Reel completo: estudio de pódcast con el avatar 2D (gestos + boca con la voz) abajo,
// escena animada que ilustra cada frase arriba y subtítulos palabra a palabra en medio.
import { AbsoluteFill, Composition, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Esc, MotionProps, Subs, palabras } from "./Motion";
import { Studio } from "./scenes/Studio";
import { poseAtFrame, Segment } from "./avatar2d/timeline";

const { fontFamily } = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const FPS = 30;
const S = (s: number) => Math.round(s * FPS);
const BAJAR = 330; // cuánto se baja el estudio para dejar arriba el espacio de las escenas

export type AvatarMotionProps = MotionProps & {
  audio: string; // narración en public/ (solo para mover la boca; el audio se mezcla aparte)
  gestos: Segment[]; // poses del avatar por segundo
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
  const pose = poseAtFrame(p.gestos, frame, fps, { volume });
  const glow = 0.85 + Math.min(0.3, (volume ?? 0) * 1.5);
  return (
    <div style={{ position: "absolute", left: 0, top: BAJAR, width: 1080, height: 1920 }}>
      <Studio pose={pose} glow={glow} />
    </div>
  );
};

export const ReelAvatarMotion: React.FC<AvatarMotionProps> = (p) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ws = palabras(p);
  const li = Math.max(0, p.lineas.reduce((a, l, i) => (t >= l.start ? i : a), -1));
  const ls = p.lineas[li]?.start ?? 0;
  const out = interpolate(S(p.lineas[li + 1]?.start ?? p.fin) - frame, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0A0503", fontFamily, color: "#fff", overflow: "hidden" }}>
      <Personaje p={p} />
      {/* oscurece arriba para que las escenas se lean */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,5,3,1) 0%, rgba(10,5,3,.9) 32%, rgba(10,5,3,0) 50%)" }} />
      {/* barra de progreso + marca */}
      <div style={{ position: "absolute", top: 110, left: 90, right: 90, height: 8, borderRadius: 4, background: "rgba(255,255,255,.12)" }}>
        <div style={{ width: `${Math.min(1, t / p.fin) * 100}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#FF8A3D,#FFD23F)" }} />
      </div>
      <div style={{ position: "absolute", top: 140, width: "100%", textAlign: "center", fontSize: 34, fontWeight: 800, color: "#A9A6B8", letterSpacing: 2 }}>{p.marca}</div>
      {/* escena de la frase, reducida al espacio de arriba */}
      <div style={{ position: "absolute", top: 190, height: 640, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: out }}>
        <div key={li} style={{ transform: "scale(0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sequence from={S(ls)} layout="none"><Esc e={p.escenas[Math.min(li, p.escenas.length - 1)]} /></Sequence>
        </div>
      </div>
      {/* subtítulos entre la escena y la cabeza */}
      <div style={{ position: "absolute", top: 850, left: 30, right: 30, textAlign: "center" }}><Subs p={p} t={t} ws={ws} /></div>
    </AbsoluteFill>
  );
};

export const AvatarMotionComposition = () => (
  <Composition id="ReelAvatarMotion" component={ReelAvatarMotion} durationInFrames={S(10)} fps={FPS} width={1080} height={1920}
    defaultProps={{ lineas: [], escenas: [], resaltar: [], marca: "@almonte.suarez", fin: 10, audio: "narracion.wav", gestos: [{ start: 0, pose: "base" }] } as AvatarMotionProps}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.fin) })} />
);
