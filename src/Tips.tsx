// Reel de tips (entre semana): gancho → idea → 3 tips completos → resumen → cierre "guarda y sígueme".
// Sin palabra clave ni secreto oculto.
import { AbsoluteFill, Composition, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
const C = { bg: "#0B0B14", bg2: "#1A1030", accent: "#FFD23F", accent2: "#FF3E7F", text: "#FFFFFF", muted: "#B9B4D0" };
const FPS = 30;
const S = (s: number) => Math.round(s * FPS);

export type Tip = { titulo: string; detalle: string };
export type TipsProps = {
  hook: string;
  hookSub: string;
  idea: string;
  tips: Tip[]; // exactamente 3
  resumen: string;
  // Inicio de cada parte en segundos: hook, idea, tip1, tip2, tip3, resumen, cierre, fin
  scenes: number[];
};

export const defaultTips: TipsProps = {
  hook: "3 frases que hacen que nadie pase tu anuncio",
  hookSub: "Cópialas hoy mismo.",
  idea: "Tu primera frase decide todo",
  tips: [
    { titulo: "Pregunta que duela", detalle: "“¿Te pasa que…?” con el problema exacto de tu cliente" },
    { titulo: "Resultado primero", detalle: "Empieza por el después: “Así vendí 30 en una semana”" },
    { titulo: "“Esto es para ti si…”", detalle: "Filtra a tu cliente ideal en la primera línea" },
  ],
  resumen: "Problema, resultado o filtro. Elige una y pruébala.",
  scenes: [0, 3, 6, 10, 14, 18, 21, 24],
};

const Pop: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 140 } });
  return (
    <div style={{ transform: `scale(${interpolate(p, [0, 1], [0.6, 1])}) translateY(${interpolate(p, [0, 1], [60, 0])}px)`, opacity: Math.min(1, p * 1.5) }}>
      {children}
    </div>
  );
};

const Stage: React.FC<{ children: React.ReactNode; justify?: string }> = ({ children, justify = "center" }) => {
  const frame = useCurrentFrame();
  const b = (x: number, y: number, r: number, color: string, sp: number) => (
    <div style={{ position: "absolute", left: x + Math.sin(frame / sp) * 60, top: y + Math.cos(frame / sp) * 80, width: r, height: r, borderRadius: "50%", background: color, filter: "blur(120px)", opacity: 0.35 }} />
  );
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${140 + frame * 0.4}deg, ${C.bg} 0%, ${C.bg2} 100%)`, fontFamily, color: C.text }}>
      {b(-150, 200, 600, C.accent2, 40)}
      {b(600, 1200, 700, C.accent, 55)}
      <AbsoluteFill style={{ padding: "260px 120px 420px 100px", justifyContent: justify, alignItems: "center", textAlign: "center" }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const HookScene: React.FC<{ p: TipsProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const shake = frame < 12 ? Math.sin(frame * 2.5) * (12 - frame) : 0;
  return (
    <Stage>
      <div style={{ transform: `translateX(${shake}px)` }}>
        <Pop><div style={{ fontSize: 104, fontWeight: 900, lineHeight: 1.05 }}>{p.hook}</div></Pop>
        <Pop delay={25}><div style={{ fontSize: 60, fontWeight: 600, color: C.muted, marginTop: 50 }}>{p.hookSub}</div></Pop>
      </div>
    </Stage>
  );
};

const IdeaScene: React.FC<{ p: TipsProps }> = ({ p }) => (
  <Stage>
    <Pop><div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.1 }}>{p.idea}</div></Pop>
  </Stage>
);

// Una tarjeta grande por tip, con el número y el detalle completo
const TipScene: React.FC<{ tip: Tip; n: number }> = ({ tip, n }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bar = spring({ frame: frame - 6, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Pop><div style={{ fontSize: 260, fontWeight: 900, color: C.accent, lineHeight: 1 }}>{n}</div></Pop>
      <Pop delay={8}>
        <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
          <div style={{ position: "absolute", left: -20, right: -20, top: "20%", bottom: "5%", background: C.accent2, transform: `scaleX(${bar}) rotate(-2deg)`, transformOrigin: "left", borderRadius: 16 }} />
          <div style={{ position: "relative", fontSize: 84, fontWeight: 900, lineHeight: 1.1 }}>{tip.titulo}</div>
        </div>
      </Pop>
      <Pop delay={22}><div style={{ fontSize: 58, fontWeight: 700, color: C.text, marginTop: 50, lineHeight: 1.25 }}>{tip.detalle}</div></Pop>
    </Stage>
  );
};

const ResumenScene: React.FC<{ p: TipsProps }> = ({ p }) => (
  <Stage>
    <Pop><div style={{ fontSize: 56, fontWeight: 800, color: C.accent, letterSpacing: 4 }}>EN RESUMEN</div></Pop>
    <Pop delay={10}><div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1.15, marginTop: 30 }}>{p.resumen}</div></Pop>
  </Stage>
);

const CierreScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 5) * 0.04;
  return (
    <Stage>
      <Pop><div style={{ fontSize: 150 }}>📌</div></Pop>
      <Pop delay={8}><div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.1, marginTop: 10 }}>Guarda este video</div></Pop>
      <Pop delay={22}>
        <div style={{ marginTop: 50, display: "inline-block", background: C.accent, color: C.bg, fontSize: 64, fontWeight: 900, padding: "24px 50px", borderRadius: 40, transform: `scale(${pulse})`, boxShadow: `0 0 80px ${C.accent}88` }}>
          Sígueme para más tips
        </div>
      </Pop>
    </Stage>
  );
};

export const ReelTips: React.FC<TipsProps> = (p) => {
  const [hook, idea, t1, t2, t3, res, cierre, fin] = p.scenes;
  const seq = (a: number, b: number) => ({ from: S(a), durationInFrames: Math.max(1, S(b) - S(a)) });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence {...seq(hook, idea)}><HookScene p={p} /></Sequence>
      <Sequence {...seq(idea, t1)}><IdeaScene p={p} /></Sequence>
      <Sequence {...seq(t1, t2)}><TipScene tip={p.tips[0]} n={1} /></Sequence>
      <Sequence {...seq(t2, t3)}><TipScene tip={p.tips[1]} n={2} /></Sequence>
      <Sequence {...seq(t3, res)}><TipScene tip={p.tips[2]} n={3} /></Sequence>
      <Sequence {...seq(res, cierre)}><ResumenScene p={p} /></Sequence>
      <Sequence {...seq(cierre, fin)}><CierreScene /></Sequence>
    </AbsoluteFill>
  );
};

export const TipsComposition = () => (
  <Composition
    id="ReelTips"
    component={ReelTips}
    durationInFrames={S(defaultTips.scenes[7])}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={defaultTips}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.scenes[props.scenes.length - 1]) })}
  />
);
