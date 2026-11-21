// "Así anuncia un novato… y así un experto": dos rondas con pantallas de anuncios arriba
// y la caricatura del usuario de pie abajo, reaccionando.
import { AbsoluteFill, Composition, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { AvatarMotionProps, ReelAvatarMotion } from "./AvatarMotion";

const { fontFamily: mont } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const { fontFamily: bebas } = loadBebas();
const FPS = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sp = (t: number, s: number, d = 11, k = 170) => spring({ frame: Math.round((t - s) * FPS), fps: FPS, config: { damping: d, stiffness: k } });
const R = "#FF3B5C", G = "#2BD576", B = "#3B82F6", Y = "#FFD23F", C = "#22D3EE";
const T = { r1: 0, res1: 8.7, trans: 13.4, r2: 16.2, gana: 24.8, leccion: 30.6, cta: 36.8 };

const Tarjeta: React.FC<{ children: React.ReactNode; borde?: string; w?: number }> = ({ children, borde = "rgba(120,160,255,.4)", w = 820 }) => (
  <div style={{ width: w, background: "rgba(10,16,44,.94)", border: `3px solid ${borde}`, borderRadius: 30, padding: 26, fontFamily: mont, color: "#fff", boxShadow: `0 0 50px ${borde}55` }}>{children}</div>
);
const Etiqueta: React.FC<{ txt: string; c: string }> = ({ txt, c }) => (
  <span style={{ display: "inline-block", background: c, color: "#0A0A14", fontFamily: mont, fontWeight: 900, fontSize: 30, padding: "8px 20px", borderRadius: 14, letterSpacing: 1 }}>{txt}</span>
);
const Pill: React.FC<{ txt: string; c: string; s: number }> = ({ txt, c, s }) => (
  <span style={{ display: "inline-block", transform: `scale(${s})`, border: `3px solid ${c}`, color: c, fontWeight: 900, fontSize: 28, padding: "8px 18px", borderRadius: 40, marginRight: 12 }}>{txt}</span>
);
const Sello: React.FC<{ txt: string; c: string; t: number; s: number }> = ({ txt, c, t, s }) => {
  const p = sp(t, s, 7, 260);
  if (t < s) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ fontFamily: bebas, fontSize: 120, color: c, border: `10px solid ${c}`, borderRadius: 24, padding: "0 30px", transform: `rotate(-10deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`, opacity: Math.min(1, p * 2), background: "rgba(10,10,20,.6)" }}>{txt}</div>
    </div>
  );
};
const MiniAd: React.FC<{ c: string; brillo?: boolean; apagado?: boolean }> = ({ c, brillo, apagado }) => (
  <div style={{ width: 150, height: 200, borderRadius: 18, background: "#14182E", border: `3px solid ${brillo ? G : "rgba(255,255,255,.2)"}`, boxShadow: brillo ? `0 0 30px ${G}` : "none", overflow: "hidden", filter: apagado ? "grayscale(1) brightness(.45)" : undefined }}>
    <div style={{ height: 120, background: `linear-gradient(${c}, #1d2240)`, position: "relative" }}>
      <div style={{ position: "absolute", left: 50, top: 30, width: 50, height: 50, borderRadius: "50%", background: "#C98B6B" }} />
      <div style={{ position: "absolute", left: 35, top: 78, width: 80, height: 42, borderRadius: "40px 40px 0 0", background: "#fff", opacity: 0.85 }} />
    </div>
    <div style={{ margin: 10, height: 12, borderRadius: 6, background: "#3A3F5C" }} />
    <div style={{ margin: "0 10px", height: 26, borderRadius: 8, background: B }} />
  </div>
);
const Contador: React.FC<{ n: number; c: string }> = ({ n, c }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
    <div style={{ fontSize: 64 }}>💬</div>
    <div style={{ fontFamily: bebas, fontSize: 130, color: c, lineHeight: 1, textShadow: `0 0 30px ${c}` }}>{n}</div>
    <div style={{ fontWeight: 900, fontSize: 34, color: "#C8D2F0" }}>MENSAJES</div>
  </div>
);

const Arriba: React.FC<{ t: number }> = ({ t }) => {
  let body: React.ReactNode = null;
  let s = 0;
  if (t < T.res1) { // ronda 1: novato promociona un post
    s = T.r1;
    const tap = t > 3.4;
    body = (
      <Tarjeta borde={R}>
        <Etiqueta txt="RONDA 1 · NOVATO" c={R} />
        <div style={{ display: "flex", gap: 24, marginTop: 22, alignItems: "center" }}>
          <MiniAd c="#E85D75" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 30, color: "#C8D2F0", marginBottom: 14 }}>1 sola foto</div>
            <div style={{ display: "inline-block", background: tap ? "#1E5BD8" : B, color: "#fff", fontWeight: 900, fontSize: 40, padding: "16px 30px", borderRadius: 16,
              transform: `scale(${tap && t < 3.7 ? 0.9 : 1})`, boxShadow: tap ? `0 0 30px ${B}` : "none" }}>Promocionar</div>
            <div style={{ marginTop: 18 }}>
              <Pill txt="🎯 Todos los intereses" c="#FF8A95" s={sp(t, 5.7)} />
              <Pill txt="RD$500" c={Y} s={sp(t, 7.4)} />
            </div>
          </div>
        </div>
      </Tarjeta>
    );
  } else if (t < T.trans) { // resultado: 2 mensajes, dinero quemado
    s = T.res1;
    const n = Math.round(interpolate(t, [9.2, 9.9], [0, 2], clamp));
    body = (
      <div style={{ position: "relative" }}>
        <Tarjeta borde={R}>
          <Etiqueta txt="RESULTADO" c={R} />
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}><Contador n={n} c={R} /></div>
          <div style={{ marginTop: 14, textAlign: "center", fontWeight: 800, fontSize: 30, color: "#FF8A95" }}>RD$500 gastados 💸</div>
        </Tarjeta>
        <Sello txt="DINERO QUEMADO 🔥" c={R} t={t} s={11.1} />
      </div>
    );
  } else if (t < T.r2) { // transición
    s = T.trans;
    const x = interpolate(t, [T.trans, T.trans + 0.5], [600, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
    body = (
      <div style={{ transform: `translateX(${x}px)`, textAlign: "center" }}>
        <div style={{ fontFamily: bebas, fontSize: 150, color: "#fff", lineHeight: 0.95 }}>AHORA EL</div>
        <div style={{ fontFamily: bebas, fontSize: 190, color: G, lineHeight: 0.95, textShadow: `0 0 40px ${G}` }}>EXPERTO →</div>
      </div>
    );
  } else if (t < T.gana) { // ronda 2: experto arma la campaña
    s = T.r2;
    const cols = ["#E85D75", "#F2C14E", "#5BC0BE", "#8E7DBE"];
    const caja = sp(t, 21.4, 12, 150);
    body = (
      <Tarjeta borde={G}>
        <Etiqueta txt="RONDA 2 · EXPERTO" c={G} />
        <div style={{ marginTop: 18 }}>
          <Pill txt="✓ Objetivo: Mensajes" c={G} s={sp(t, 17.6)} />
          <Pill txt="RD$500" c={Y} s={sp(t, 23.2)} />
        </div>
        <div style={{ position: "relative", marginTop: 22, padding: "18px 14px 50px", borderRadius: 24, border: `4px dashed ${caja > 0.1 ? C : "transparent"}` }}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            {cols.map((c, k) => <div key={k} style={{ transform: `translateY(${interpolate(sp(t, 19.3 + k * 0.2), [0, 1], [-400, 0])}px)` }}><MiniAd c={c} /></div>)}
          </div>
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", fontWeight: 900, fontSize: 30, color: C, opacity: caja }}>📦 1 CONJUNTO</div>
        </div>
      </Tarjeta>
    );
  } else if (t < T.leccion) { // Meta prueba y gana uno: 38 mensajes
    s = T.gana;
    const cols = ["#E85D75", "#F2C14E", "#5BC0BE", "#8E7DBE"];
    const gana = t > 26.9;
    const n = Math.round(interpolate(t, [28.0, 29.2], [0, 38], { ...clamp, easing: Easing.out(Easing.cubic) }));
    const scan = ((t - T.gana) * 1.1) % 1;
    body = (
      <div style={{ position: "relative" }}>
        <Tarjeta borde={G}>
          <div style={{ position: "relative", display: "flex", gap: 14, justifyContent: "center" }}>
            {cols.map((c, k) => <MiniAd key={k} c={c} brillo={gana && k === 2} apagado={gana && k !== 2} />)}
            {!gana ? <div style={{ position: "absolute", left: -10, right: -10, top: scan * 200, height: 6, background: C, boxShadow: `0 0 24px ${C}` }} /> : null}
          </div>
          <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}><Contador n={n} c={G} /></div>
          <div style={{ textAlign: "center", fontSize: 22, color: "#8A93B8", fontWeight: 700 }}>Cifras de ejemplo</div>
        </Tarjeta>
        <Sello txt="¡VENDIDO! 🎉" c={G} t={t} s={29.0} />
      </div>
    );
  } else if (t < T.cta) { // lección
    s = T.leccion;
    const fila = (txt: string, ok: boolean, st: number) => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,.06)", borderRadius: 18, padding: "18px 24px", marginTop: 16,
        transform: `translateX(${interpolate(sp(t, st), [0, 1], [-700, 0])}px)`, border: `3px solid ${ok ? G : R}` }}>
        <span style={{ fontWeight: 900, fontSize: 34 }}>{txt}</span><span style={{ fontSize: 46 }}>{ok ? "✅" : "❌"}</span>
      </div>
    );
    body = (
      <Tarjeta>
        <div style={{ fontFamily: bebas, fontSize: 70, textAlign: "center" }}>LA DIFERENCIA</div>
        {fila("Novato: promociona 1 post", false, 30.7)}
        {fila("Experto: le da opciones a Meta", true, 33.0)}
      </Tarjeta>
    );
  } else { // cierre
    s = T.cta;
    body = (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: bebas, fontSize: 130, color: "#fff", lineHeight: 1 }}>¿CUÁL ERES TÚ?</div>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 20 }}>
          <div style={{ transform: `scale(${sp(t, 37.1)})`, border: `4px solid ${R}`, color: R, fontFamily: mont, fontWeight: 900, fontSize: 44, padding: "14px 30px", borderRadius: 20 }}>🙈 NOVATO</div>
          <div style={{ transform: `scale(${sp(t, 37.4)})`, background: G, color: "#05210F", fontFamily: mont, fontWeight: 900, fontSize: 44, padding: "14px 30px", borderRadius: 20 }}>😎 EXPERTO</div>
        </div>
        <div style={{ marginTop: 24, transform: `scale(${sp(t, 38.7)})`, display: "inline-block", background: Y, color: "#1A1205", fontFamily: mont, fontWeight: 900, fontSize: 38, padding: "10px 26px", borderRadius: 16 }}>📌 Guárdalo y sígueme · @jorgealmonteia</div>
      </div>
    );
  }
  const p = sp(t, s, 13, 150);
  const flash = interpolate(t - s, [0, 0.05, 0.25], [0, 0.4, 0], clamp);
  return (
    <>
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, height: 680, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${interpolate(p, [0, 1], [0.88, 1])})`, opacity: Math.min(1, p * 1.5) }}>{body}</div>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 25%, ${C}, transparent 55%)`, opacity: flash, mixBlendMode: "screen", pointerEvents: "none" }} />
    </>
  );
};

export const ReelNovato: React.FC<AvatarMotionProps> = (p) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill>
      <ReelAvatarMotion {...p} />
      <Arriba t={t} />
    </AbsoluteFill>
  );
};

export const NovatoComposition = () => (
  <Composition id="ReelNovato" component={ReelNovato} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 41}
    defaultProps={{ lineas: [], escenas: [], resaltar: [], marca: "", fin: 41, audio: "narracion-novato.wav", gestos: [{ start: 0, pose: "base" }] } as AvatarMotionProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
