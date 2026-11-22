// Video de venta de un vehículo: fotos con movimiento (Ken Burns), cortes al ritmo de la voz,
// tarjetas de datos, precio grande y cierre con el teléfono.
import { AbsoluteFill, Composition, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

const { fontFamily: bebas } = loadBebas();
const { fontFamily: mont } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const FPS = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sp = (t: number, s: number, d = 11, k = 170) => spring({ frame: Math.round((t - s) * FPS), fps: FPS, config: { damping: d, stiffness: k } });
const ORO = "#FFD23F", ROJO = "#E11D2E";

type Palabra = { w: string; s: number; e: number };
type Toma = { s: number; img: string; z: [number, number]; x?: [number, number]; y?: [number, number]; foco?: string };
export type VentaProps = { words: Palabra[]; fin: number; tomas: Toma[]; tel: string; piezas: number[] };

const Foto: React.FC<{ toma: Toma; t: number; e: number }> = ({ toma, t, e }) => {
  const u = interpolate(t, [toma.s, e], [0, 1], clamp);
  const z = interpolate(u, [0, 1], toma.z);
  const x = interpolate(u, [0, 1], toma.x ?? [0, 0]);
  const y = interpolate(u, [0, 1], toma.y ?? [0, 0]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      {/* fondo desenfocado para fotos horizontales */}
      <Img src={staticFile(toma.img)} style={{ position: "absolute", inset: -60, width: 1200, height: 2040, objectFit: "cover", filter: "blur(40px) brightness(.55)" }} />
      <Img src={staticFile(toma.img)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover", objectPosition: toma.foco ?? "center",
        transform: `translate(${x}px, ${y}px) scale(${z})` }} />
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ t: number; s: number; txt: string; i: number; c?: string }> = ({ t, s, txt, i, c = "#fff" }) => {
  if (t < s) return null;
  const p = sp(t, s, 12, 190);
  return (
    <div style={{ transform: `translateX(${interpolate(p, [0, 1], [-700, 0])}px)`, marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 14,
      background: "rgba(8,8,12,.82)", border: `3px solid ${c === "#fff" ? ORO : c}`, borderRadius: 18, padding: "12px 24px", fontFamily: mont, fontWeight: 900, fontSize: 42, color: c }}>
      <span>{c === "#fff" ? "✅" : "⚠️"}</span>{txt}
    </div>
  );
};

export const ReelVentaAuto: React.FC<VentaProps> = (p) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const P = p.piezas;
  const k = p.tomas.reduce((a, x, i) => (t >= x.s ? i : a), 0);
  const toma = p.tomas[k];
  const e = p.tomas[k + 1]?.s ?? p.fin;
  const flash = interpolate(t - toma.s, [0, 0.05, 0.22], [0, 0.55, 0], clamp);
  // subtítulo palabra por palabra
  const wi = p.words.findIndex((w, i) => t >= w.s && t < (p.words[i + 1]?.s ?? w.e + 0.5));
  const g = Math.max(0, Math.floor(wi / 3) * 3);
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: mont }}>
      <Foto toma={toma} t={t} e={e} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 58%, rgba(0,0,0,.8) 100%)" }} />

      {/* 0 · GANCHO */}
      {t < P[1] ? (
        <div style={{ position: "absolute", top: 170, left: 50, right: 50, textAlign: "center", transform: `scale(${sp(t, 0.1, 9, 170)})` }}>
          <div style={{ fontFamily: bebas, fontSize: 120, color: "#fff", lineHeight: 0.95, textShadow: "0 8px 30px rgba(0,0,0,.85)" }}>¿BUSCAS UN CARRO QUE</div>
          <div style={{ fontFamily: bebas, fontSize: 130, color: ORO, lineHeight: 0.95, textShadow: "0 8px 30px rgba(0,0,0,.85)" }}>GASTE POCO? ⛽</div>
          {t > 3.7 ? <div style={{ marginTop: 14, display: "inline-block", background: ROJO, color: "#fff", fontWeight: 900, fontSize: 44, padding: "8px 26px", borderRadius: 14, transform: `scale(${sp(t, 3.8, 8, 220)})` }}>👀 MIRA ESTE</div> : null}
        </div>
      ) : null}
      {/* 1 · INTRODUCCIÓN */}
      {t >= P[1] && t < P[2] ? (
        <div style={{ position: "absolute", top: 160, left: 0, right: 0, textAlign: "center", transform: `scale(${sp(t, P[1], 9, 160)})` }}>
          <div style={{ display: "inline-block", background: ROJO, color: "#fff", fontWeight: 900, fontSize: 40, padding: "8px 24px", borderRadius: 12, letterSpacing: 3 }}>🚗 EN VENTA</div>
          <div style={{ fontFamily: bebas, fontSize: 170, color: "#fff", lineHeight: 0.95, marginTop: 10, textShadow: "0 8px 30px rgba(0,0,0,.8)" }}>TOYOTA VITZ</div>
          <div style={{ fontFamily: bebas, fontSize: 90, color: ORO, lineHeight: 1, textShadow: "0 6px 20px rgba(0,0,0,.8)" }}>2011 · JAPONÉS 🇯🇵</div>
          <div style={{ marginTop: 8, fontWeight: 900, fontSize: 40, color: "#fff", textShadow: "0 4px 14px #000" }}>📍 La Vega</div>
        </div>
      ) : null}
      <div style={{ position: "absolute", top: 210, left: 50, right: 50 }}>
        {/* 2 · CUERPO 1: lo técnico */}
        {t >= P[2] && t < P[3] ? <><Chip t={t} s={P[2] + 0.2} txt="Motor 1.5 L" i={0} /><br /><Chip t={t} s={P[2] + 1.8} txt="Bajo consumo ⛽" i={1} /><br /><Chip t={t} s={P[2] + 4.0} txt="226,600 km reales" i={2} /></> : null}
        {/* 4 · CUERPO 2: las 3 claves */}
        {t >= P[4] && t < P[5] ? <>
          <div style={{ fontFamily: bebas, fontSize: 90, color: ORO, textShadow: "0 6px 20px #000", marginBottom: 10, transform: `scale(${sp(t, P[4], 10)})`, transformOrigin: "0 50%" }}>3 COSAS QUE CASI NUNCA ENCUENTRAS</div>
          <Chip t={t} s={P[4] + 3.1} txt="1 · Mantenimiento al día" i={0} /><br /><Chip t={t} s={P[4] + 4.7} txt="2 · Diagnóstico realizado" i={1} /><br /><Chip t={t} s={P[4] + 6.4} txt="3 · Solo 2 dueñas en el país" i={2} />
        </> : null}
        {/* 5 · SEGUNDO BUCLE: lo honesto */}
        {t >= P[5] && t < P[6] ? <>
          <div style={{ fontFamily: bebas, fontSize: 86, color: "#fff", textShadow: "0 6px 20px #000", marginBottom: 12, transform: `scale(${sp(t, P[5], 10)})`, transformOrigin: "0 50%" }}>LO QUE NADIE TE DICE 🤫</div>
          <Chip t={t} s={P[5] + 2.2} txt="Pintura con desgaste por el sol" i={0} c="#FFB4A8" />
          {t > P[5] + 4.8 ? <div style={{ marginTop: 10, fontFamily: bebas, fontSize: 80, color: ORO, textShadow: "0 6px 20px #000" }}>POR ESO EL PRECIO…</div> : null}
        </> : null}
      </div>
      {/* 3 · BUCLE ABIERTO */}
      {t >= P[3] && t < P[4] ? (
        <div style={{ position: "absolute", top: 700, left: 0, right: 0, textAlign: "center", transform: `scale(${sp(t, P[3], 8, 200)}) rotate(-3deg)` }}>
          <span style={{ fontFamily: bebas, fontSize: 150, color: "#fff", background: "rgba(8,8,12,.75)", padding: "0 34px", borderRadius: 24, textShadow: `0 0 30px ${ORO}` }}>PERO ESO NO ES LO MEJOR…</span>
        </div>
      ) : null}
      {/* 6 · EXPECTATIVA: el precio */}
      {t >= P[6] && t < P[7] ? (
        <div style={{ position: "absolute", top: 760, left: 0, right: 0, textAlign: "center", transform: `scale(${sp(t, P[6] + 0.3, 7, 220)}) rotate(-4deg)` }}>
          <div style={{ display: "inline-block", background: `linear-gradient(135deg, ${ORO}, #FF8A3D)`, color: "#1A1205", fontFamily: bebas, fontSize: 170, padding: "0 40px", borderRadius: 26,
            border: "6px solid #fff", boxShadow: `0 0 70px ${ORO}` }}>RD$369,000</div>
          <div style={{ marginTop: 10, fontWeight: 900, fontSize: 52, color: "#fff", textShadow: "0 4px 14px #000" }}>NEGOCIABLE</div>
        </div>
      ) : null}
      {/* 7 · LLAMADO A LA ACCIÓN */}
      {t >= P[7] ? (
        <div style={{ position: "absolute", top: 520, left: 60, right: 60, textAlign: "center", transform: `scale(${sp(t, P[7] + 0.1, 10, 160)})` }}>
          <div style={{ background: "rgba(8,8,12,.9)", border: `4px solid ${ORO}`, borderRadius: 34, padding: "34px 30px", boxShadow: `0 0 60px ${ORO}88` }}>
            <div style={{ fontFamily: bebas, fontSize: 90, color: "#fff", lineHeight: 1 }}>TOYOTA VITZ 2011</div>
            <div style={{ fontFamily: bebas, fontSize: 120, color: ORO, lineHeight: 1.05 }}>RD$369,000</div>
            <div style={{ fontWeight: 800, fontSize: 38, color: "#ddd", marginTop: 6 }}>📍 La Vega, R.D.</div>
            <div style={{ marginTop: 24, display: "inline-block", background: "#25D366", color: "#05210F", fontWeight: 900, fontSize: 58, padding: "14px 34px", borderRadius: 22,
              transform: `scale(${1 + Math.sin(t * 7) * 0.03})` }}>📲 {p.tel}</div>
            <div style={{ marginTop: 16, fontWeight: 900, fontSize: 36, color: ROJO }}>⏳ ¡Antes de que se vaya!</div>
          </div>
        </div>
      ) : null}
      {/* subtítulos */}
      {wi >= 0 ? (
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 170, textAlign: "center", fontWeight: 900, fontSize: 58, textTransform: "uppercase" }}>
          {p.words.slice(g, g + 3).map((w, i) => (
            <span key={i} style={{ margin: "0 10px", color: g + i === wi ? ORO : "#fff", opacity: g + i <= wi ? 1 : 0.35, WebkitTextStroke: "3px #000", paintOrder: "stroke" }}>{w.w}</span>
          ))}
        </div>
      ) : null}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

export const VentaAutoComposition = () => (
  <Composition id="ReelVentaAuto" component={ReelVentaAuto} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 47}
    defaultProps={{ words: [], fin: 47, tomas: [{ s: 0, img: "vitz/08.jpg", z: [1, 1.1] }], tel: "", piezas: [0, 5, 10, 15, 20, 25, 30, 35] } as VentaProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
