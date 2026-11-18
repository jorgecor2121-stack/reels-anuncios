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
  iconos?: string[]; // un emoji por línea, salta junto al avatar
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

// Palabras con su tiempo (proporcional al largo de cada palabra dentro de su línea)
type Palabra = { w: string; start: number; end: number; line: number };
const palabras = (p: PodcastProps): Palabra[] => {
  const out: Palabra[] = [];
  p.lineas.forEach((l, li) => {
    const ws = l.text.split(/\s+/).filter(Boolean);
    const total = ws.reduce((a, w) => a + w.length + 2, 0);
    let t = l.start;
    ws.forEach((w) => {
      const d = (l.duration * (w.length + 2)) / total;
      out.push({ w, start: t, end: t + d, line: li });
      t += d;
    });
  });
  return out;
};

// Subtítulos: grupos de 3 palabras; cada palabra aparece con rebote cuando la dices y la actual se marca
const Subtitulos: React.FC<{ p: PodcastProps; t: number; ws: Palabra[] }> = ({ p, t, ws }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = ws.findIndex((x) => t >= x.start && t < x.end + 0.15);
  if (i < 0) return null;
  const line = ws[i].line;
  const lineWs = ws.filter((x) => x.line === line);
  const k = lineWs.indexOf(ws[i]);
  const g0 = Math.floor(k / 3) * 3;
  const group = lineWs.slice(g0, g0 + 3);
  const hl = new Set(p.resaltar.map(norm));
  return (
    <div style={{ fontSize: 66, fontWeight: 900, lineHeight: 1.2, textShadow: "0 6px 24px rgba(0,0,0,.7)" }}>
      {group.map((x, j) => {
        const pop = spring({ frame: frame - S(x.start), fps, config: { damping: 11, stiffness: 220 } });
        const active = x === ws[i];
        const isHl = hl.has(norm(x.w));
        return (
          <span key={j} style={{ display: "inline-block", margin: "0 8px", opacity: t >= x.start ? 1 : 0.25,
            transform: `scale(${t >= x.start ? interpolate(pop, [0, 1], [0.6, active ? 1.12 : 1]) : 0.9}) translateY(${active ? -4 : 0}px)`,
            color: isHl ? C.yellow : C.text,
            background: active ? "rgba(255,138,61,.9)" : "transparent", borderRadius: 14, padding: "0 10px" }}>
            {x.w}
          </span>
        );
      })}
    </div>
  );
};

// Sticker (emoji) que salta junto al avatar en cada frase
const Sticker: React.FC<{ emoji: string; start: number; side: number }> = ({ emoji, start, side }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - S(start), fps, config: { damping: 8, stiffness: 160 } });
  const float = Math.sin(frame / 10) * 12;
  const x = side > 0 ? 760 : 90;
  return (
    <div style={{ position: "absolute", left: x, top: 760 + float, fontSize: 150,
      transform: `scale(${pop}) rotate(${interpolate(pop, [0, 1], [-40 * side, 8 * side])}deg)`,
      filter: "drop-shadow(0 12px 30px rgba(0,0,0,.6))" }}>{emoji}</div>
  );
};

export const ReelPodcast: React.FC<PodcastProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const audio = useAudioData(staticFile(p.audio));
  const ws = palabras(p);

  // Boca y energía de la voz en este frame (suavizada)
  let mouth = 0;
  if (audio) {
    const v = visualizeAudio({ fps, frame, audioData: audio, numberOfSamples: 32 });
    const prev = visualizeAudio({ fps, frame: Math.max(0, frame - 1), audioData: audio, numberOfSamples: 32 });
    const e = (arr: number[]) => arr.slice(1, 10).reduce((a, b) => a + b, 0) / 9;
    mouth = Math.min(1, ((e(v) + e(prev)) / 2) * 9);
  }
  const speaking = p.lineas.some((l) => t >= l.start && t < l.start + l.duration);
  const voz = speaking ? mouth : 0;

  const li = Math.max(0, p.lineas.reduce((acc, l, i) => (t >= l.start ? i : acc), -1));
  const ls = p.lineas[li]?.start ?? 0;
  const titulo = p.titulos[Math.min(li, p.titulos.length - 1)] ?? "";
  const tIn = spring({ frame: frame - S(ls), fps, config: { damping: 12, stiffness: 150 } });
  const bar = spring({ frame: frame - S(ls) - 6, fps, config: { damping: 200 } });

  // Cámara: acercamiento suave al rostro en cada frase (alterna) + golpe al empezar
  const punch = spring({ frame: frame - S(ls), fps, config: { damping: 14, stiffness: 90 } });
  const zoomTarget = li % 2 === 0 ? 1.0 : 1.08;
  const zoomPrev = li % 2 === 0 ? 1.08 : 1.0;
  const zoom = li === 0 ? 1 + 0.04 * (1 - punch) : interpolate(punch, [0, 1], [zoomPrev, zoomTarget]);
  const flash = interpolate(frame - S(ls), [0, 4, 10], [0.18, 0.1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const progreso = Math.min(1, t / p.fin);

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily, color: C.text, overflow: "hidden" }}>
      {/* Avatar con cámara */}
      <AbsoluteFill style={{ transformOrigin: "50% 58%", transform: `scale(${zoom})` }}>
        {p.avatarImg ? (
          <AvatarImagen p={p} mouth={voz} talk={Math.min(1, voz * 1.5)} />
        ) : (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <Avatar mouth={voz} talk={Math.min(1, voz * 1.5)} width={1000} />
          </div>
        )}
      </AbsoluteFill>
      {/* Brillo naranja que late con la voz */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 62%, rgba(255,138,61,0.55) 0%, rgba(255,138,61,0) 55%)",
        mixBlendMode: "screen", opacity: 0.15 + voz * 0.45 }} />
      {/* Degradado arriba para que el texto se lea */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,5,8,.85) 0%, rgba(5,5,8,.55) 30%, rgba(5,5,8,0) 45%)" }} />
      {/* Flash de cambio de frase */}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />

      {/* Barra de progreso */}
      <div style={{ position: "absolute", top: 120, left: 90, right: 90, height: 8, borderRadius: 4, background: "rgba(255,255,255,.15)" }}>
        <div style={{ width: `${progreso * 100}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${C.accent}, ${C.yellow})` }} />
      </div>
      {/* Marca */}
      <div style={{ position: "absolute", top: 160, width: "100%", textAlign: "center", fontSize: 38, fontWeight: 800, color: C.muted, letterSpacing: 2 }}>{p.marca}</div>
      {/* Título del momento con subrayado que se dibuja */}
      <div style={{ position: "absolute", top: 240, left: 70, right: 70, textAlign: "center" }}>
        <div style={{ display: "inline-block", transform: `translateY(${interpolate(tIn, [0, 1], [60, 0])}px) scale(${interpolate(tIn, [0, 1], [0.8, 1])})`, opacity: tIn }}>
          <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.05 }}>
            {titulo.split(/(\d+)/).map((part, i) => (/^\d+$/.test(part) ? <span key={i} style={{ color: C.yellow }}>{part}</span> : <span key={i}>{part}</span>))}
          </div>
          <div style={{ height: 10, marginTop: 14, borderRadius: 5, background: C.accent, transformOrigin: "left", transform: `scaleX(${bar})` }} />
        </div>
      </div>
      {/* Subtítulos palabra por palabra */}
      <div style={{ position: "absolute", top: 510, left: 40, right: 40, textAlign: "center", whiteSpace: "nowrap" }}>
        <Subtitulos p={p} t={t} ws={ws} />
      </div>
      {/* Sticker de la frase */}
      {p.iconos?.[li] ? <Sticker key={li} emoji={p.iconos[li]} start={ls} side={li % 2 === 0 ? 1 : -1} /> : null}
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
