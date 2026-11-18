import { Composition, AbsoluteFill, Sequence, Audio, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });

// Paleta de marca
const C = {
  bg: "#0B0B14",
  bg2: "#1A1030",
  accent: "#FFD23F",
  accent2: "#FF3E7F",
  text: "#FFFFFF",
  muted: "#B9B4D0",
};

export type ReelProps = {
  hook: string;
  hookSub: string;
  idea: string;
  ideaHighlight: string;
  tips: string[];
  secretTeaser: string;
  keyword: string;
  // Inicio de cada escena en segundos: hook, idea, timer, tips, secret, cta, end
  scenes: number[];
  audio?: string;
};

export const defaultReel: ReelProps = {
  hook: "¿Tu anuncio no vende?",
  hookSub: "No es tu producto.",
  idea: "Es el",
  ideaHighlight: "GANCHO",
  tips: ["Error 1: hablar de ti, no de tu cliente", "Error 2: no decir qué hacer después"],
  secretTeaser: "Hay un 3er error que casi nadie ve…",
  keyword: "GANCHO",
  scenes: [0, 3.2, 6.4, 10, 15, 18.5, 23],
};

const FPS = 30;
const S = (s: number) => Math.round(s * FPS);


const Pop: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 140 } });
  return (
    <div style={{ transform: `scale(${interpolate(p, [0, 1], [0.6, 1])}) translateY(${interpolate(p, [0, 1], [60, 0])}px)`, opacity: Math.min(1, p * 1.5), ...style }}>
      {children}
    </div>
  );
};

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const angle = 140 + frame * 0.4;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${angle}deg, ${C.bg} 0%, ${C.bg2} 100%)`, fontFamily, color: C.text }}>
      <Blobs />
      {/* Zona segura: evita UI de Instagram arriba, abajo y a la derecha */}
      <AbsoluteFill style={{ padding: "260px 120px 420px 100px", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Blobs: React.FC = () => {
  const frame = useCurrentFrame();
  const b = (x: number, y: number, r: number, color: string, sp: number) => (
    <div style={{ position: "absolute", left: x + Math.sin(frame / sp) * 60, top: y + Math.cos(frame / sp) * 80, width: r, height: r, borderRadius: "50%", background: color, filter: "blur(120px)", opacity: 0.35 }} />
  );
  return (
    <>
      {b(-150, 200, 600, C.accent2, 40)}
      {b(600, 1200, 700, C.accent, 55)}
    </>
  );
};

const HookScene: React.FC<{ p: ReelProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const shake = frame < 12 ? Math.sin(frame * 2.5) * (12 - frame) : 0;
  return (
    <Stage>
      <div style={{ transform: `translateX(${shake}px)` }}>
        <Pop><div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1.05 }}>{p.hook}</div></Pop>
        <Pop delay={30}><div style={{ fontSize: 64, fontWeight: 600, color: C.muted, marginTop: 50 }}>{p.hookSub}</div></Pop>
      </div>
    </Stage>
  );
};

const IdeaScene: React.FC<{ p: ReelProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hl = spring({ frame: frame - 18, fps, config: { damping: 200 } });
  return (
    <Stage>
      <Pop><div style={{ fontSize: 96, fontWeight: 800 }}>{p.idea}</div></Pop>
      <div style={{ position: "relative", marginTop: 20 }}>
        <div style={{ position: "absolute", left: -30, right: -30, top: "18%", bottom: "8%", background: C.accent2, transform: `scaleX(${hl}) rotate(-3deg)`, transformOrigin: "left", borderRadius: 20 }} />
        <Pop delay={10}><div style={{ position: "relative", fontSize: 170, fontWeight: 900, letterSpacing: 4 }}>{p.ideaHighlight}</div></Pop>
      </div>
    </Stage>
  );
};

const TimerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.max(1, 3 - Math.floor(frame / 30));
  const local = frame % 30;
  const scale = interpolate(local, [0, 8, 30], [1.4, 1, 0.95], { extrapolateRight: "clamp" });
  return (
    <Stage>
      <div style={{ fontSize: 64, fontWeight: 600, color: C.muted }}>Tienes solo</div>
      <div style={{ fontSize: 420, fontWeight: 900, color: C.accent, lineHeight: 1, transform: `scale(${scale})` }}>{n}</div>
      <div style={{ fontSize: 84, fontWeight: 800 }}>segundos para atrapar</div>
    </Stage>
  );
};

const TipsScene: React.FC<{ p: ReelProps }> = ({ p }) => (
  <Stage>
    <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>
      {p.tips.map((t, i) => {
        const [label, rest] = t.split(":");
        return (
          <Pop key={i} delay={i * 50}>
            <div style={{ background: "rgba(255,255,255,0.08)", border: `3px solid ${C.accent}`, borderRadius: 36, padding: "44px 40px" }}>
              <div style={{ fontSize: 56, fontWeight: 900, color: C.accent }}>❌ {label}</div>
              <div style={{ fontSize: 64, fontWeight: 700, marginTop: 14, lineHeight: 1.15 }}>{rest?.trim()}</div>
            </div>
          </Pop>
        );
      })}
    </div>
  </Stage>
);

const SecretScene: React.FC<{ p: ReelProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const flicker = 0.85 + Math.sin(frame / 3) * 0.15;
  return (
    <Stage>
      <Pop><div style={{ fontSize: 150 }}>🤫</div></Pop>
      <Pop delay={10}><div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.1, marginTop: 20 }}>{p.secretTeaser}</div></Pop>
      <Pop delay={30}>
        <div style={{ marginTop: 50, fontSize: 64, fontWeight: 800, filter: "blur(16px)", opacity: flicker, userSelect: "none" }}>
          Error 3: ████████ ███ ██████
        </div>
      </Pop>
    </Stage>
  );
};

const CtaScene: React.FC<{ p: ReelProps }> = ({ p }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 5) * 0.04;
  return (
    <Stage>
      <Pop><div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.15 }}>¿Quieres saberlo?</div></Pop>
      <Pop delay={15}><div style={{ fontSize: 64, fontWeight: 600, color: C.muted, marginTop: 30 }}>Escríbeme por DM la palabra</div></Pop>
      <Pop delay={30}>
        <div style={{ marginTop: 40, display: "inline-block", background: C.accent, color: C.bg, fontSize: 130, fontWeight: 900, padding: "20px 60px", borderRadius: 40, transform: `scale(${pulse})`, boxShadow: `0 0 80px ${C.accent}88` }}>
          {p.keyword}
        </div>
      </Pop>
      <Pop delay={50}><div style={{ fontSize: 56, fontWeight: 700, marginTop: 50 }}>y te lo cuento 📩</div></Pop>
    </Stage>
  );
};

export const Reel: React.FC<ReelProps> = (p) => {
  const [hook, idea, timer, tips, secret, cta, end] = p.scenes;
  const seq = (a: number, b: number) => ({ from: S(a), durationInFrames: Math.max(1, S(b) - S(a)) });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence {...seq(hook, idea)}><HookScene p={p} /></Sequence>
      <Sequence {...seq(idea, timer)}><IdeaScene p={p} /></Sequence>
      <Sequence {...seq(timer, tips)}><TimerScene /></Sequence>
      <Sequence {...seq(tips, secret)}><TipsScene p={p} /></Sequence>
      <Sequence {...seq(secret, cta)}><SecretScene p={p} /></Sequence>
      <Sequence {...seq(cta, end)}><CtaScene p={p} /></Sequence>
      {p.audio ? <Audio src={staticFile(p.audio)} /> : null}
    </AbsoluteFill>
  );
};

export const MyComposition = () => (
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={S(defaultReel.scenes[6])}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={defaultReel}
    calculateMetadata={({ props }) => ({ durationInFrames: S(props.scenes[props.scenes.length - 1]) })}
  />
);
