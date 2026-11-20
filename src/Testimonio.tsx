// Testimonio llamativo: arranque "rompe esquema" con el resultado, números gigantes detrás de la persona,
// capturas de prueba presentadas con zoom, comparación invertido vs. vendido, subtítulos propios y llamado final.
import { AbsoluteFill, Composition, Easing, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

const { fontFamily: bebas } = loadBebas();
const { fontFamily: mont } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const FPS = 30;

type Palabra = { w: string; s: number; e: number };
export type TestimonioProps = { video: string; persona: string; fin: number; words: Palabra[]; face: number[][]; marca: string };

const sp = (t: number, s: number, cfg = { damping: 11, stiffness: 160 }) => spring({ frame: Math.round((t - s) * FPS), fps: FPS, config: cfg });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Palabras/números gigantes detrás de la cabeza
const DETRAS = [
  { s: 8.7, e: 10.5, txt: "$7.36", c: "#2EE6A6" },
  { s: 16.3, e: 18.65, txt: "RD$9,250", c: "#FFD23F" },
  { s: 23.4, e: 25.55, txt: "WOW", c: "#FF4FA3" },
];
// Tarjetas que tapan las capturas originales (y las presentan mejor)
const CAPTURAS = [
  { s: 10.5, e: 13.75, img: "prueba/testimonio-meta.png", w: 800, h: 500, zoom: { x: 600, y: 190 }, etiqueta: "💸 GASTÓ SOLO $7.36", c: "#2EE6A6" },
  { s: 18.65, e: 21.35, img: "prueba/testimonio-recibo.png", w: 550, h: 870, zoom: { x: 220, y: 230 }, etiqueta: "✅ PAGO DE RD$9,250", c: "#FFD23F" },
];
const CLAVE = /^(encantada|resultados|taller|7\.36|RD\$441|RD\$9,250|dólares|pesos|vendí|clienta|impresionantes|inscribirse|aprovechen|temporadas|promociones)$/i;
const ocultarSubs = (t: number) => CAPTURAS.some((c) => t >= c.s && t <= c.e) || (t >= 21.4 && t < 23.4) || t < 1.4;

const Subtitulos: React.FC<{ words: Palabra[]; t: number }> = ({ words, t }) => {
  if (ocultarSubs(t)) return null;
  const i = words.findIndex((w) => t >= w.s && t < w.e + 0.3);
  if (i < 0) return null;
  const g = Math.floor(i / 3) * 3;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1430, textAlign: "center", fontFamily: mont, fontWeight: 900, fontSize: 64, lineHeight: 1.15, textTransform: "uppercase" }}>
      {words.slice(g, g + 3).map((w, k) => {
        const on = t >= w.s;
        const clave = CLAVE.test(w.w.replace(/[.,¿?¡!]+$/g, ""));
        const p = sp(t, w.s, { damping: 10, stiffness: 240 });
        return <span key={k} style={{ display: "inline-block", margin: "0 12px", opacity: on ? 1 : 0, color: clave ? "#0A0A0A" : "#fff",
          background: clave && on ? "#FFD23F" : "transparent", padding: clave ? "0 14px" : 0, borderRadius: 14,
          transform: `scale(${on ? interpolate(p, [0, 1], [1.5, 1]) : 1}) rotate(${clave ? -3 : 0}deg)`, WebkitTextStroke: clave ? "0" : "3px #000", paintOrder: "stroke", textShadow: clave ? "none" : "0 6px 18px rgba(0,0,0,.85)" }}>{w.w.replace(/[.,]+$/, "")}</span>;
      })}
    </div>
  );
};

const Detras: React.FC<{ t: number }> = ({ t }) => {
  const d = DETRAS.find((x) => t >= x.s && t <= x.e);
  if (!d) return null;
  const p = sp(t, d.s, { damping: 9, stiffness: 140 });
  const out = interpolate(t, [d.e - 0.15, d.e], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 230, left: -100, right: -100, textAlign: "center", fontFamily: bebas, fontSize: Math.min(470, 1080 / (d.txt.length * 0.47)), lineHeight: 1,
      color: d.c, opacity: out, transform: `scale(${interpolate(p, [0, 1], [0.3, 1]) * (1 + (t - d.s) * 0.03)})`, textShadow: `0 0 70px ${d.c}, 0 14px 0 rgba(0,0,0,.35)`, letterSpacing: 6 }}>{d.txt}</div>
  );
};

const Captura: React.FC<{ t: number }> = ({ t }) => {
  const c = CAPTURAS.find((x) => t >= x.s - 0.15 && t <= x.e + 0.15);
  if (!c) return null;
  const lt = t - c.s;
  const p = sp(t, c.s - 0.15, { damping: 13, stiffness: 150 });
  const out = interpolate(t, [c.e, c.e + 0.15], [1, 0], clamp);
  const zoom = interpolate(lt, [0.9, 1.5], [1, 1.35], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const meta = c.w > c.h;
  // tamaño y lugar: tapa la captura original de abajo; la cara (arriba) queda libre
  const W = meta ? 960 : 600, H = W * (c.h / c.w);
  const left = meta ? 60 : 0, top = meta ? 1920 - H - 20 : 1920 - H + 10;
  const escala = W / c.w;
  const marcaP = sp(t, c.s + 0.4, { damping: 10, stiffness: 160 });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", left, top, width: W, height: H, borderRadius: 30, overflow: "hidden", border: `6px solid ${c.c}`,
        boxShadow: `0 0 50px ${c.c}88, 0 30px 70px rgba(0,0,0,.6)`, transform: `scale(${interpolate(p, [0, 1], [0.85, 1])}) rotate(${interpolate(p, [0, 1], [-4, 0])}deg)`, transformOrigin: "50% 100%", background: "#fff" }}>
        <Img src={staticFile(c.img)} style={{ width: W, height: H, transform: `scale(${zoom})`, transformOrigin: `${c.zoom.x * escala}px ${c.zoom.y * escala}px` }} />
        <div style={{ position: "absolute", top: -50, bottom: -50, width: 90, left: interpolate(lt, [0.1, 0.7], [-150, W + 150], clamp), background: "linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent)", transform: "skewX(-20deg)" }} />
      </div>
      <div style={{ position: "absolute", top: meta ? top - 110 : 1150, left: meta ? 0 : 620, right: meta ? 0 : 20, textAlign: "center", transform: `scale(${marcaP}) rotate(${meta ? -3 : 4}deg)` }}>
        <span style={{ display: "inline-block", fontFamily: mont, fontWeight: 900, fontSize: meta ? 54 : 40, lineHeight: 1.2, color: "#0A0A0A", background: c.c, padding: "10px 24px", borderRadius: 18, boxShadow: `0 0 40px ${c.c}` }}>{c.etiqueta}</span>
      </div>
    </AbsoluteFill>
  );
};

const Comparacion: React.FC<{ t: number }> = ({ t }) => {
  const s = 21.4, e = 23.4;
  if (t < s - 0.1 || t > e + 0.15) return null;
  const p = sp(t, s);
  const out = interpolate(t, [e, e + 0.15], [1, 0], clamp);
  const g = interpolate(t, [s + 0.2, s + 1.1], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const x21 = sp(t, s + 1.1, { damping: 8, stiffness: 180 });
  const barra = (lbl: string, val: string, h: number, c: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 260 }}>
      <div style={{ fontFamily: bebas, fontSize: 70, color: c }}>{val}</div>
      <div style={{ width: 170, height: h * g, background: `linear-gradient(180deg, ${c}, ${c}88)`, borderRadius: "18px 18px 0 0", boxShadow: `0 0 40px ${c}88` }} />
      <div style={{ fontFamily: mont, fontWeight: 900, fontSize: 34, color: "#fff", marginTop: 8 }}>{lbl}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 1080, bottom: 30, borderRadius: 40, background: "rgba(8,8,16,.82)", backdropFilter: "blur(12px)", border: "3px solid rgba(255,255,255,.15)",
        transform: `translateY(${interpolate(p, [0, 1], [900, 0])}px)` }}>
        <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 70 }}>
          {barra("INVIRTIÓ", "RD$441", 25, "#FF6B6B")}
          {barra("VENDIÓ", "RD$9,250", 440, "#2EE6A6")}
        </div>
        <div style={{ position: "absolute", bottom: 25, left: 0, right: 0, textAlign: "center", transform: `scale(${x21}) rotate(-3deg)` }}>
          <span style={{ fontFamily: bebas, fontSize: 100, color: "#0A0A0A", background: "linear-gradient(135deg,#FFD23F,#FF8A3D)", padding: "0 34px", borderRadius: 24, boxShadow: "0 0 50px #FFD23F" }}>21X DE RETORNO</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Chips: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const chip = (s: number, e: number, txt: string, c: string, x: number, y: number, rot: number) => {
    if (t < s || t > e) return null;
    const p = sp(t, s, { damping: 10, stiffness: 170 });
    const out = interpolate(t, [e - 0.15, e], [1, 0], clamp);
    return <div style={{ position: "absolute", left: x, top: y + Math.sin(f / 10 + x) * 8, transform: `translate(-50%,-50%) scale(${p}) rotate(${rot}deg)`, opacity: out,
      background: "rgba(10,10,20,.82)", border: `4px solid ${c}`, borderRadius: 24, padding: "12px 24px", fontFamily: mont, fontWeight: 900, fontSize: 40, color: "#fff", boxShadow: `0 0 30px ${c}88`, whiteSpace: "nowrap" }}>{txt}</div>;
  };
  return (
    <>
      {chip(3.3, 8.2, "📊 RESULTADOS REALES", "#22D3EE", 290, 1250, -4)}
      {chip(7.4, 10.5, "🎓 TALLER META ADS", "#C084FC", 800, 1130, 4)}
      {chip(11.9, 13.75, "≈ RD$441", "#2EE6A6", 540, 1720, 0)}
      {chip(14.4, 16.25, "💬 ME ESCRIBIERON", "#22D3EE", 300, 1250, -3)}
      {chip(16.25, 18.65, "🛍️ 1 CLIENTA", "#FFD23F", 790, 1200, 4)}
      {chip(25.6, 30.1, "📩 INSCRÍBETE", "#2EE6A6", 540, 1250, -2)}
    </>
  );
};

const Rafaga: React.FC<{ t: number; s: number; emoji: string }> = ({ t, s, emoji }) => {
  if (t < s || t > s + 2) return null;
  return (
    <>
      {Array.from({ length: 14 }).map((_, k) => {
        const u = (t - s - k * 0.05) / 1.6;
        if (u < 0 || u > 1) return null;
        return <div key={k} style={{ position: "absolute", left: k % 2 ? 10 + ((k * 53) % 200) : 860 + ((k * 47) % 190), top: -120 + u * 2100 + Math.sin(k) * 60, fontSize: 70 + (k % 3) * 25, transform: `rotate(${k * 40 + u * 200}deg)` }}>{emoji}</div>;
      })}
    </>
  );
};

export const ReelTestimonio: React.FC<TestimonioProps> = (p) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const fc = p.face[Math.min(p.face.length - 1, f)] ?? [540, 650, 260];
  // cámara: golpe inicial, acercamientos en los números y empuje lento al final
  const golpe = interpolate(t, [0, 0.15, 1.3, 1.6], [1.45, 1.35, 1.25, 1.0], clamp);
  const punch = (s: number) => interpolate(t, [s, s + 0.12, s + 0.9], [1, 1.14, 1.06], clamp) * (t > s && t < s + 2.2 ? 1 : 0) || 1;
  const z = Math.max(golpe, punch(8.7), punch(16.3), punch(23.4), interpolate(t, [30.2, p.fin], [1, 1.25], clamp));
  const glitch = t < 1.4 ? (Math.sin(f * 7.3) > 0.6 ? 1 : 0) : 0;
  const rebobina = t > 1.15 && t < 1.45;
  const flash = Math.max(...[0, 8.7, 10.5, 16.3, 18.65, 21.4, 23.4, 25.6].map((s) => interpolate(t - s, [0, 0.05, 0.3], [0, 0.5, 0], clamp)));
  const cola = interpolate(t, [p.fin - 4.6, p.fin - 4.2], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden", fontFamily: mont }}>
      <AbsoluteFill style={{ transform: `scale(${z}) translateX(${glitch * 14}px)`, transformOrigin: `${fc[0]}px ${fc[1]}px`, filter: rebobina ? "saturate(.3) contrast(1.3)" : undefined }}>
        <OffthreadVideo src={staticFile(p.video)} style={{ width: 1080, height: 1920 }} />
        <Detras t={t} />
        <OffthreadVideo src={staticFile(p.persona)} transparent muted style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
      </AbsoluteFill>
      {/* ROMPE ESQUEMA: arranca con el resultado, glitch y rebobinado */}
      {t < 1.45 ? (
        <AbsoluteFill style={{ background: glitch ? "rgba(255,0,80,.12)" : "transparent" }}>
          <div style={{ position: "absolute", top: 1180, left: 0, right: 0, textAlign: "center", transform: `scale(${sp(t, 0, { damping: 7, stiffness: 200 })}) rotate(-5deg) translateX(${glitch * -18}px)` }}>
            <div style={{ fontFamily: mont, fontWeight: 900, fontSize: 56, color: "#fff", background: "#E11D48", display: "inline-block", padding: "8px 26px", borderRadius: 14 }}>INVIRTIÓ $7.36…</div>
            <div style={{ fontFamily: bebas, fontSize: 200, lineHeight: 1, color: "#FFD23F", textShadow: "6px 0 #FF0050, -6px 0 #00E5FF, 0 0 60px #FFD23F" }}>Y VENDIÓ RD$9,250</div>
          </div>
          {rebobina ? <div style={{ position: "absolute", top: 1600, left: 0, right: 0, textAlign: "center", fontSize: 160, color: "#fff", textShadow: "0 0 30px #fff" }}>⏪</div> : null}
          {rebobina ? Array.from({ length: 8 }).map((_, k) => <div key={k} style={{ position: "absolute", left: 0, right: 0, top: ((k * 263 + f * 90) % 1920), height: 6 + (k % 3) * 6, background: "rgba(255,255,255,.35)" }} />) : null}
        </AbsoluteFill>
      ) : null}
      {/* etiqueta de testimonio */}
      {false ? (
        <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center", transform: `translateY(${interpolate(sp(t, 1.45), [0, 1], [-250, 0])}px)` }}>
          <span style={{ display: "inline-block", fontFamily: mont, fontWeight: 900, fontSize: 46, color: "#0A0A0A", background: "#fff", padding: "10px 28px", borderRadius: 40, boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>⭐⭐⭐⭐⭐ TESTIMONIO REAL</span>
          <div style={{ marginTop: 10, fontWeight: 800, fontSize: 34, color: "#fff", textShadow: "0 3px 12px rgba(0,0,0,.8)" }}>Alumna del taller de Meta Ads</div>
        </div>
      ) : null}
      <Chips t={t} f={f} />
      <Rafaga t={t} s={16.3} emoji="💸" />
      <Rafaga t={t} s={23.4} emoji="🤯" />
      <Rafaga t={t} s={24.3} emoji="🎉" />
      <Subtitulos words={p.words} t={t} />
      <Captura t={t} />
      <Comparacion t={t} />
      {/* cierre */}
      {cola > 0 ? (
        <div style={{ position: "absolute", top: 170, left: 50, right: 50, textAlign: "center", opacity: cola, transform: `scale(${interpolate(cola, [0, 1], [0.7, 1])})` }}>
          <div style={{ fontFamily: bebas, fontSize: 120, lineHeight: 0.95, color: "#fff", textShadow: "0 6px 20px rgba(0,0,0,.8)" }}>¿TÚ ERES EL PRÓXIMO?</div>
          <div style={{ display: "inline-block", marginTop: 10, fontWeight: 900, fontSize: 48, color: "#0A0A0A", background: "#FFD23F", padding: "10px 28px", borderRadius: 18 }}>📩 INSCRÍBETE AL TALLER</div>
          <div style={{ marginTop: 10, fontWeight: 800, fontSize: 36, color: "#fff", textShadow: "0 3px 12px rgba(0,0,0,.8)" }}>{p.marca}</div>
        </div>
      ) : null}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 100% 0%, #fff, transparent 50%)", opacity: flash, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 60%, rgba(0,0,0,.5) 100%)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(t / p.fin) * 100}%`, background: "linear-gradient(90deg,#FF8A3D,#FFD23F)" }} />
    </AbsoluteFill>
  );
};

export const TestimonioComposition = () => (
  <Composition id="ReelTestimonio" component={ReelTestimonio} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 10}
    defaultProps={{ video: "prueba/testimonio.mp4", persona: "prueba/testimonio-persona.webm", fin: 10, words: [], face: [], marca: "@almonte_suarez.ia" } as TestimonioProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
