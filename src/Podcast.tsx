// Reel con avatar (estilo pódcast): título del momento arriba, subtítulos palabra a palabra al centro,
// avatar hablando abajo con la boca sincronizada a la voz.
import { AbsoluteFill, Composition, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Avatar } from "./Avatar";

const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
const C = { bg: "#0A0A10", accent: "#FF8A3D", yellow: "#FFD23F", text: "#FFFFFF", muted: "#A9A6B8" };
const FPS = 30;
const S = (s: number) => Math.round(s * FPS);

export type Linea = { text: string; start: number; duration: number };
export type PodcastProps = {
  marca: string; // texto pequeño arriba, p. ej. "@almonte.suarez"
  titulos: string[]; // un título grande por línea del guion (7)
  lineas: Linea[]; // tiempos de la narración (de tiempos.json)
  resaltar: string[]; // palabras a resaltar en los subtítulos
  audio: string; // archivo en public/ (narración) para mover la boca
  fin: number; // duración total en segundos
  // Avatar en imagen (public/), 1080x1920, con la boca en (bocaX, bocaY) y ancho de labios bocaW
  avatarImg?: string;
  bocaX?: number;
  bocaY?: number;
  bocaW?: number;
};

// Avatar a partir de una imagen: respira, mueve un poco la cabeza y abre la boca con la voz
const AvatarImagen: React.FC<{ p: PodcastProps; mouth: number; talk: number }> = ({ p, mouth, talk }) => {
  const f = useCurrentFrame();
  const breathe = 1 + Math.sin(f / 30) * 0.006;
  const nod = Math.sin(f / 5) * talk * 3;
  const sway = Math.sin(f / 45) * 4;
  const x = p.bocaX ?? 540, y = p.bocaY ?? 1080, w = p.bocaW ?? 120;
  const h = Math.max(0, mouth) * w * 0.26;
  return (
    <AbsoluteFill style={{ transformOrigin: "50% 75%", transform: `translate(${sway}px, ${nod}px) scale(${breathe})` }}>
      <Img src={staticFile(p.avatarImg!)} style={{ width: "100%", height: "100%" }} />
      {h > 1 ? (
        <div style={{ position: "absolute", left: x - w * 0.36, top: y - h * 0.35, width: w * 0.72, height: h,
          borderRadius: "50%", background: "radial-gradient(ellipse at 50% 40%, #3a0d10 0%, #24070a 70%)",
          boxShadow: "0 0 6px 2px rgba(140,60,55,.55)", filter: "blur(1.4px)" }} />
      ) : null}
    </AbsoluteFill>
  );
};

export const defaultPodcast: PodcastProps = {
  marca: "@almonte.suarez",
  titulos: ["3 frases", "La primera frase", "1 · Pregunta que duela", "2 · Resultado primero", "3 · Esto es para ti si…", "En resumen", "📌 Guárdalo"],
  lineas: [{ text: "Tres frases para que nadie pase tu anuncio.", start: 0, duration: 3 }],
  resaltar: [],
  audio: "narracion.wav",
  fin: 5,
};

const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");

// Subtítulos: grupos de hasta 4 palabras, repartidos en la duración de la línea
const Subtitulos: React.FC<{ p: PodcastProps; t: number }> = ({ p, t }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const li = p.lineas.findIndex((l) => t >= l.start && t < l.start + l.duration + 0.25);
  if (li < 0) return null;
  const l = p.lineas[li];
  const words = l.text.split(/\s+/).filter(Boolean);
  const groups: string[][] = [];
  for (let i = 0; i < words.length; i += 3) groups.push(words.slice(i, i + 3));
  const per = l.duration / groups.length;
  const gi = Math.min(groups.length - 1, Math.floor((t - l.start) / per));
  const gStart = l.start + gi * per;
  const pop = spring({ frame: frame - S(gStart), fps, config: { damping: 14, stiffness: 180 } });
  const hl = new Set(p.resaltar.map(norm));
  return (
    <div style={{ transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])})`, opacity: pop, fontSize: 64, fontWeight: 900, lineHeight: 1.15, textShadow: "0 6px 24px rgba(0,0,0,.6)" }}>
      {groups[gi].map((w, i) => (
        <span key={i} style={{ color: hl.has(norm(w)) ? C.accent : C.text }}>{w} </span>
      ))}
    </div>
  );
};

export const ReelPodcast: React.FC<PodcastProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const audio = useAudioData(staticFile(p.audio));

  // Boca: energía de la voz en este frame (suavizada)
  let mouth = 0;
  if (audio) {
    const v = visualizeAudio({ fps, frame, audioData: audio, numberOfSamples: 32 });
    const prev = visualizeAudio({ fps, frame: Math.max(0, frame - 1), audioData: audio, numberOfSamples: 32 });
    const e = (arr: number[]) => arr.slice(1, 10).reduce((a, b) => a + b, 0) / 9;
    mouth = Math.min(1, ((e(v) + e(prev)) / 2) * 9);
  }
  const speaking = p.lineas.some((l) => t >= l.start && t < l.start + l.duration);

  const li = Math.max(0, p.lineas.reduce((acc, l, i) => (t >= l.start ? i : acc), -1));
  const titulo = p.titulos[Math.min(li, p.titulos.length - 1)] ?? "";
  const tIn = spring({ frame: frame - S(p.lineas[li]?.start ?? 0), fps, config: { damping: 13 } });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 78%, #3A1A0C 0%, ${C.bg} 60%)`, fontFamily, color: C.text }}>
      {p.avatarImg ? <AvatarImagen p={p} mouth={speaking ? mouth : 0} talk={speaking ? Math.min(1, mouth * 1.5) : 0} /> : null}
      {/* Marca arriba */}
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", fontSize: 40, fontWeight: 800, color: C.muted, letterSpacing: 2 }}>
        {p.marca}
      </div>
      {/* Título del momento */}
      <div style={{ position: "absolute", top: 260, left: 90, right: 90, textAlign: "center" }}>
        <div style={{ transform: `translateY(${interpolate(tIn, [0, 1], [40, 0])}px)`, opacity: tIn, fontSize: 88, fontWeight: 900, lineHeight: 1.05 }}>
          {titulo.split(/(\d+)/).map((part, i) => (/^\d+$/.test(part) ? <span key={i} style={{ color: C.yellow }}>{part}</span> : <span key={i}>{part}</span>))}
        </div>
      </div>
      {/* Subtítulos */}
      <div style={{ position: "absolute", top: 500, left: 60, right: 60, whiteSpace: "nowrap", textAlign: "center" }}>
        <Subtitulos p={p} t={t} />
      </div>
      {/* Avatar dibujado (solo si no hay imagen) */}
      {p.avatarImg ? null : (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Avatar mouth={speaking ? mouth : 0} talk={speaking ? Math.min(1, mouth * 1.5) : 0} width={1000} />
        </div>
      )}
    </AbsoluteFill>
  );
};

export const PodcastComposition = () => (
  <Composition
    id="ReelPodcast"
    component={ReelPodcast}
    durationInFrames={S(defaultPodcast.fin)}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={defaultPodcast}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.fin) })}
  />
);
