// Reel educativo: "así se hace un anuncio que vende". Primero el anuncio animado (un chico pisa una cáscara
// de guineo y no resbala gracias a sus tenis), con la etiqueta de cada parte; al final, la fórmula paso a paso.
import { AbsoluteFill, Composition, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

const { fontFamily: bebas } = loadBebas();
const { fontFamily: mont } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const FPS = 30;

// Momentos clave (segundos de la narración)
const T = { anuncio: 4.8, repente: 7.86, cascara: 9.2, pero: 10.82, mueves: 12.08, suela: 13.84, calle: 16.84, lluvia: 17.84, donde: 18.62,
  oferta: 19.86, precio: 21.1, envio: 23.86, cta: 25.92, agoten: 28.96, formula: 30.0, guarda: 35.42 };
const PASOS = [
  { s: 30.0, n: "GANCHO", d: "Para el scroll en 2 segundos", e: "😱", c: "#FF4D4D", desde: T.anuncio },
  { s: 30.98, n: "DEMOSTRACIÓN", d: "Muestra que funciona", e: "🍌", c: "#FFD23F", desde: T.cascara },
  { s: 32.1, n: "BENEFICIO", d: "Qué gana el cliente", e: "👟", c: "#2EE6A6", desde: T.suela },
  { s: 33.08, n: "OFERTA", d: "Precio claro + un extra", e: "💰", c: "#22D3EE", desde: T.oferta },
  { s: 33.94, n: "LLAMADO A LA ACCIÓN", d: "Dile qué hacer ahora", e: "💬", c: "#C084FC", desde: T.cta },
];

// ---------------- Tenis (dibujo propio, sin marca) ----------------
export const Tenis: React.FC<{ w?: number; brillo?: number; agarre?: number }> = ({ w = 140, brillo = 0, agarre = 0 }) => (
  <svg width={w} height={w * 0.5} viewBox="0 0 140 70" style={{ overflow: "visible" }}>
    {brillo > 0 ? <path d="M4 50 Q2 22 30 17 L66 11 Q82 8 98 22 Q120 33 134 40 Q141 46 136 56 L4 56 Z" fill="none" stroke="#FFD23F" strokeWidth={10} opacity={brillo} style={{ filter: "blur(4px)" }} /> : null}
    {/* suela */}
    <path d="M2 52 L138 52 Q140 60 132 63 L8 63 Q1 61 2 52 Z" fill="#F4F4F4" stroke="#111" strokeWidth={2.5} />
    {[14, 30, 46, 62, 78, 94, 110, 124].map((x) => <rect key={x} x={x} y={62} width={7} height={3 + agarre * 6} rx={1.5} fill={agarre > 0 ? "#FFD23F" : "#999"} />)}
    {/* parte de arriba */}
    <path d="M4 52 Q2 24 30 19 L66 13 Q82 10 98 24 Q120 35 133 42 Q139 47 136 52 Z" fill="#141414" stroke="#000" strokeWidth={2.5} />
    {/* franja blanca curva (genérica) */}
    <path d="M22 50 Q46 28 92 27 Q98 30 94 33 Q56 36 34 52 Z" fill="#fff" />
    {/* cordones y talón */}
    {[0, 1, 2, 3].map((i) => <line key={i} x1={62 + i * 9} y1={16 + i * 3} x2={72 + i * 9} y2={24 + i * 3} stroke="#555" strokeWidth={3} strokeLinecap="round" />)}
    <path d="M4 52 Q3 34 12 26" fill="none" stroke="#333" strokeWidth={3} />
  </svg>
);

// ---------------- Chico caminando (vista de lado) ----------------
const Pierna: React.FC<{ cadera: number; rodilla: number; brillo: number; agarre: number; atras?: boolean }> = ({ cadera, rodilla, brillo, agarre, atras }) => (
  <g transform={`rotate(${-cadera})`} opacity={atras ? 0.85 : 1}>
    <rect x={-22} y={0} width={44} height={170} rx={20} fill={atras ? "#1E3A8A" : "#2B4FB8"} />
    <g transform={`translate(0 165) rotate(${rodilla})`}>
      <rect x={-20} y={0} width={40} height={160} rx={18} fill={atras ? "#1E3A8A" : "#2B4FB8"} />
      <g transform={`translate(-38 140) rotate(${cadera - rodilla} 38 30)`}>
        <Tenis w={140} brillo={brillo} agarre={agarre} />
      </g>
    </g>
  </g>
);

const Chico: React.FC<{ fase: number; tambaleo: number; brazosArriba: number; lentes: boolean; brillo: number; agarre: number; susto: number }> = ({ fase, tambaleo, brazosArriba, lentes, brillo, agarre, susto }) => {
  const piernaA = Math.sin(fase) * 28, piernaB = Math.sin(fase + Math.PI) * 28;
  const rod = (p: number) => Math.max(0, Math.sin(p + 1.3)) * 45;
  const brazo = -Math.sin(fase) * 26;
  const bob = -Math.abs(Math.sin(fase)) * 10;
  const hombro = (b: number) => b * (1 - brazosArriba) + (-150 + Math.sin(fase * 3) * 25) * brazosArriba;
  return (
    <g transform={`translate(0 ${bob}) rotate(${tambaleo} 0 330)`}>
      {/* brazo de atrás */}
      <g transform={`translate(0 -330) rotate(${hombro(-brazo)})`}><rect x={-18} y={0} width={36} height={230} rx={18} fill="#B91C3C" /><circle cx={0} cy={235} r={24} fill="#8D5B3E" /></g>
      <g transform="translate(0 0)"><Pierna cadera={piernaB} rodilla={rod(fase + Math.PI)} brillo={brillo} agarre={agarre} atras /></g>
      <g transform="translate(0 0)"><Pierna cadera={piernaA} rodilla={rod(fase)} brillo={brillo} agarre={agarre} /></g>
      {/* torso con sudadera */}
      <rect x={-62} y={-360} width={124} height={380} rx={50} fill="#E11D48" />
      <rect x={-62} y={-20} width={124} height={40} rx={14} fill="#BE123C" />
      {/* cabeza de lado */}
      <g transform="translate(6 -440)">
        <rect x={-18} y={40} width={36} height={50} fill="#8D5B3E" />
        <circle cx={0} cy={0} r={78} fill="#A0694A" />
        <path d="M-80 -10 Q-86 -80 -10 -88 Q60 -92 78 -30 Q50 -60 10 -50 Q-30 -40 -50 0 Z" fill="#1B120D" />
        {[-60, -35, -10, 15, 40].map((x, i) => <circle key={i} cx={x} cy={-70 + Math.abs(x) * 0.25} r={18} fill="#1B120D" />)}
        <circle cx={-48} cy={4} r={16} fill="#8D5B3E" />
        {lentes ? (
          <g><rect x={20} y={-22} width={62} height={26} rx={10} fill="#0A0A0A" /><line x1={0} y1={-12} x2={22} y2={-12} stroke="#0A0A0A" strokeWidth={6} /></g>
        ) : (
          <g><ellipse cx={46} cy={-10} rx={8 + susto * 4} ry={11 + susto * 6} fill="#fff" /><circle cx={50} cy={-9} r={5} fill="#111" /></g>
        )}
        <path d={susto > 0.5 ? "M44 38 Q56 30 66 40 Q56 52 44 38 Z" : "M40 34 Q58 46 72 30"} fill={susto > 0.5 ? "#3B0A0A" : "none"} stroke="#3B1A10" strokeWidth={5} strokeLinecap="round" />
        <path d="M76 2 Q88 12 76 20" fill="#A0694A" stroke="#7A4A30" strokeWidth={3} />
      </g>
      {/* brazo de adelante */}
      <g transform={`translate(0 -330) rotate(${hombro(brazo)})`}><rect x={-20} y={0} width={40} height={235} rx={20} fill="#F43F5E" /><circle cx={0} cy={240} r={26} fill="#A0694A" /></g>
    </g>
  );
};

const Cascara: React.FC<{ aplastada: number; desliz: number }> = ({ aplastada, desliz }) => (
  <g transform={`translate(${desliz} 0) scale(1 ${1 - aplastada * 0.6})`}>
    <path d="M-70 0 Q-60 -40 -20 -30 Q0 -70 20 -30 Q60 -40 70 0 Z" fill="#FACC15" stroke="#A16207" strokeWidth={5} />
    <path d="M-20 -30 Q-10 -20 0 -32 Q10 -20 20 -30" fill="none" stroke="#A16207" strokeWidth={4} />
    <ellipse cx={0} cy={-6} rx={36} ry={10} fill="#FEF3C7" />
    <rect x={-6} y={-78} width={12} height={22} rx={4} fill="#713F12" transform="rotate(-10)" />
  </g>
);

// posición del chico en el mundo (px): camina, frena en cámara lenta, se planta en la cáscara y sigue
const VEL = 300;
const caminado = (t: number) => {
  const a = T.anuncio, r = T.repente, c = T.cascara, m = T.mueves;
  if (t < a) return 0;
  if (t < r) return (t - a) * VEL;
  if (t < c) return (r - a) * VEL + (t - r) * VEL * 0.22;
  if (t < m) return (r - a) * VEL + (c - r) * VEL * 0.22;
  return (r - a) * VEL + (c - r) * VEL * 0.22 + (t - m) * VEL;
};

const Calle: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const wx = caminado(t);
  const PISO = 1520;
  const pisoCascara = caminado(T.cascara) - 65;
  // cámara: sigue al chico; zoom a los pies en el momento de la cáscara
  const zoomPies = interpolate(t, [T.repente - 0.2, T.cascara, T.pero, T.mueves + 0.3, T.suela], [1, 2.1, 2.3, 1.5, 1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const focoY = interpolate(zoomPies, [1, 2.3], [1150, 1430]);
  const shake = t > T.cascara && t < T.pero ? Math.sin(f * 2.3) * 8 * interpolate(t, [T.cascara, T.pero], [1, 0.2]) : 0;
  const enCascara = t >= T.cascara && t < T.mueves;
  const tamb = enCascara ? Math.sin((t - T.cascara) * 18) * 9 * interpolate(t, [T.cascara, T.pero, T.pero + 0.4], [1, 1, 0], { extrapolateRight: "clamp" }) : 0;
  const brazos = enCascara ? interpolate(t, [T.cascara, T.cascara + 0.2, T.pero, T.pero + 0.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const fase = t >= T.cascara && t < T.mueves ? caminado(T.cascara) / 45 : wx / 45;
  const brillo = t > T.pero && t < T.suela ? 0.6 + 0.4 * Math.sin(t * 10) : 0;
  const agarre = t > T.pero ? interpolate(t, [T.pero, T.pero + 0.3], [0, 1], { extrapolateRight: "clamp" }) : 0;
  const susto = t > T.repente && t < T.pero ? 1 : 0;
  const deslizC = t > T.cascara ? interpolate(t, [T.cascara, T.cascara + 0.25], [0, 26], { extrapolateRight: "clamp" }) : 0;
  const aplast = t > T.pero ? interpolate(t, [T.pero, T.pero + 0.2], [0, 1], { extrapolateRight: "clamp" }) : 0;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #7DD3FC 0%, #BAE6FD 45%, #FDE68A 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, 0) scale(${zoomPies})`, transformOrigin: `540px ${focoY}px` }}>
        <svg width={1080} height={1920}>
          {/* sol y nubes */}
          <circle cx={860} cy={300} r={110} fill="#FDE047" opacity={0.9} />
          {[0, 1, 2].map((i) => <ellipse key={i} cx={((i * 400 - wx * 0.05 + f * 0.6) % 1400) - 150} cy={220 + i * 90} rx={140} ry={45} fill="#fff" opacity={0.85} />)}
          {/* edificios con paralaje */}
          {Array.from({ length: 14 }).map((_, i) => {
            const x = ((i * 190 - wx * 0.35) % 2660 + 2660) % 2660 - 300;
            const h = 500 + ((i * 137) % 380);
            const col = ["#F59E0B", "#F97316", "#FB7185", "#A78BFA", "#34D399", "#60A5FA"][i % 6];
            return (
              <g key={i}>
                <rect x={x} y={PISO - 120 - h} width={170} height={h} fill={col} opacity={0.9} />
                {Array.from({ length: Math.floor(h / 90) }).map((_, r) => [0, 1].map((cc) => <rect key={`${r}-${cc}`} x={x + 30 + cc * 70} y={PISO - 80 - h + r * 90} width={40} height={50} rx={6} fill="#FFF7D6" opacity={0.75} />))}
              </g>
            );
          })}
          {/* acera */}
          <rect x={0} y={PISO - 120} width={1080} height={2000} fill="#D6D3D1" />
          {Array.from({ length: 12 }).map((_, i) => { const x = ((i * 160 - wx) % 1920 + 1920) % 1920 - 200; return <line key={i} x1={x} y1={PISO - 120} x2={x - 80} y2={1920} stroke="#A8A29E" strokeWidth={5} />; })}
          <rect x={0} y={PISO + 160} width={1080} height={30} fill="#78716C" />
          <rect x={0} y={PISO + 190} width={1080} height={400} fill="#3F3F46" />
          {/* cáscara en el piso */}
          {t > T.repente - 1.5 ? <g transform={`translate(${540 + pisoCascara - wx - 0} ${PISO + 66})`}><Cascara aplastada={aplast} desliz={deslizC} /></g> : null}
          {/* sombra y chico */}
          <ellipse cx={540} cy={PISO + 70} rx={150} ry={22} fill="#000" opacity={0.18} />
          <g transform={`translate(540 ${PISO - 320})`}>
            <Chico fase={fase} tambaleo={tamb} brazosArriba={brazos} lentes={t > T.mueves} brillo={brillo} agarre={agarre} susto={susto} />
          </g>
          {/* líneas de agarre */}
          {agarre > 0 && t < T.suela ? [0, 1, 2, 3, 4].map((i) => <line key={i} x1={470 + i * 22} y1={PISO + 70} x2={460 + i * 22} y2={PISO + 96 + (i % 2) * 8} stroke="#FFD23F" strokeWidth={6} strokeLinecap="round" opacity={agarre} />) : null}
        </svg>
      </div>
      {/* textos del anuncio */}
      <Texto t={t} s={T.anuncio + 0.1} e={T.repente} y={330} txt="¿TE HA PASADO?" color="#fff" />
      <Texto t={t} s={T.repente} e={T.cascara} y={330} txt="DE REPENTE…" color="#FFD23F" />
      <Texto t={t} s={T.cascara} e={T.pero} y={330} txt="¿SE CAE? 😱" color="#FF4D4D" grande />
      <Texto t={t} s={T.pero} e={T.mueves} y={330} txt="AGARRE TOTAL" color="#FFD23F" grande />
      <Texto t={t} s={T.mueves} e={T.suela} y={330} txt="NI SE MUEVE 😎" color="#2EE6A6" grande />
      {t > T.cascara && t < T.pero ? <AbsoluteFill style={{ background: "radial-gradient(circle, transparent 50%, rgba(220,30,30,.35) 100%)" }} /> : null}
    </AbsoluteFill>
  );
};

const Texto: React.FC<{ t: number; s: number; e: number; y: number; txt: string; color: string; grande?: boolean }> = ({ t, s, e, y, txt, color, grande }) => {
  if (t < s || t > e) return null;
  const p = spring({ frame: Math.round((t - s) * FPS), fps: FPS, config: { damping: 9, stiffness: 180 } });
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: bebas, fontSize: grande ? 170 : 130, color, letterSpacing: 3,
      WebkitTextStroke: "6px #000", paintOrder: "stroke", textShadow: "0 10px 0 rgba(0,0,0,.35)", transform: `scale(${interpolate(p, [0, 1], [2, 1])}) rotate(${interpolate(p, [0, 1], [-8, -3])}deg)`, opacity: Math.min(1, p * 2) }}>{txt}</div>
  );
};

// ---------------- Beneficio: la suela de cerca, calle y lluvia ----------------
const Beneficio: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const lt = t - T.suela;
  const lluvia = t > T.lluvia;
  const p = spring({ frame: Math.round(lt * FPS), fps: FPS, config: { damping: 12 } });
  const giro = interpolate(lt, [0, 2], [-25, 12], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: lluvia ? "linear-gradient(180deg,#1E3A5F,#0F172A)" : "linear-gradient(180deg,#FDE68A,#F97316)", overflow: "hidden" }}>
      {lluvia ? Array.from({ length: 60 }).map((_, i) => {
        const x = (i * 97) % 1080, y = ((i * 211 + f * 38) % 2100) - 100;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 4, height: 50, background: "rgba(186,230,253,.7)", borderRadius: 2, transform: "rotate(12deg)" }} />;
      }) : null}
      <div style={{ position: "absolute", left: 540, top: 1000, transform: `translate(-50%,-50%) scale(${interpolate(p, [0, 1], [0.4, 1])}) rotate(${giro}deg)` }}>
        <Tenis w={820} agarre={1} brillo={0.5 + 0.3 * Math.sin(t * 6)} />
      </div>
      {lluvia ? <div style={{ position: "absolute", left: 140, right: 140, top: 1300, height: 60, borderRadius: "50%", background: "rgba(96,165,250,.45)", boxShadow: "0 0 40px rgba(96,165,250,.6)" }} /> : null}
      <Texto t={t} s={T.suela} e={T.calle} y={330} txt="SUELA ANTIDESLIZANTE" color="#fff" />
      <Texto t={t} s={T.calle} e={T.lluvia} y={330} txt="EN LA CALLE 🏙️" color="#fff" />
      <Texto t={t} s={T.lluvia} e={T.donde} y={330} txt="EN LA LLUVIA 🌧️" color="#BAE6FD" />
      <Texto t={t} s={T.donde} e={T.oferta} y={330} txt="DONDE SEA ✅" color="#2EE6A6" grande />
    </AbsoluteFill>
  );
};

// ---------------- Oferta ----------------
const Oferta: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const lt = t - T.oferta;
  const p = spring({ frame: Math.round(lt * FPS), fps: FPS, config: { damping: 12 } });
  const pp = spring({ frame: Math.round((t - T.precio) * FPS), fps: FPS, config: { damping: 8, stiffness: 160 } });
  const pe = spring({ frame: Math.round((t - T.envio) * FPS), fps: FPS, config: { damping: 9, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #3B3B4F 0%, #0B0B12 70%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 340, top: -200, width: 400, height: 1500, background: "linear-gradient(180deg, rgba(255,255,255,.22), transparent)", clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)" }} />
      <div style={{ position: "absolute", left: 190, top: 1240, width: 700, height: 110, borderRadius: "50%", background: "radial-gradient(#FFD23F66, transparent 70%)" }} />
      <div style={{ position: "absolute", left: 540, top: 1020 + Math.sin(t * 2) * 14, transform: `translate(-50%,-50%) scale(${interpolate(p, [0, 1], [0.3, 1])}) rotate(${-8 + Math.sin(t * 1.5) * 4}deg)` }}>
        <Tenis w={760} brillo={0.3} />
      </div>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = i * 0.63 + t * 0.8, r = 430 + Math.sin(t * 3 + i) * 30;
        return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * r, top: 1000 + Math.sin(a) * r * 0.5, fontSize: 40, opacity: 0.8 }}>✨</div>;
      })}
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: bebas, fontSize: 110, color: "#fff", letterSpacing: 4, opacity: p }}>TENIS URBANOS</div>
      {t > T.precio ? (
        <div style={{ position: "absolute", top: 1420, left: 0, right: 0, textAlign: "center", transform: `scale(${pp}) rotate(-4deg)` }}>
          <span style={{ fontFamily: bebas, fontSize: 200, color: "#1A1205", background: "linear-gradient(135deg,#FFD23F,#FF8A3D)", padding: "0 40px", borderRadius: 30, border: "6px solid #fff", boxShadow: "0 0 60px rgba(255,210,63,.6)" }}>RD$3,500</span>
        </div>
      ) : null}
      {t > T.envio ? (
        <div style={{ position: "absolute", top: 450, left: 0, right: 0, textAlign: "center", transform: `scale(${pe}) rotate(3deg)` }}>
          <span style={{ fontFamily: mont, fontWeight: 900, fontSize: 56, color: "#fff", background: "#16A34A", padding: "14px 30px", borderRadius: 20 }}>🚚 ENVÍO GRATIS HOY</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- Llamado a la acción ----------------
const Accion: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const lt = t - T.cta;
  const p = spring({ frame: Math.round(lt * FPS), fps: FPS, config: { damping: 10, stiffness: 150 } });
  const quedan = Math.max(3, Math.round(interpolate(lt, [0, 3.5], [20, 3], { extrapolateRight: "clamp" })));
  const pulso = 1 + Math.sin(t * 9) * 0.04;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#14532D,#052E16)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 540, top: 820, transform: `translate(-50%,-50%) scale(${0.55 * p}) rotate(-6deg)` }}><Tenis w={760} /></div>
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, textAlign: "center", transform: `scale(${p * pulso})` }}>
        <span style={{ display: "inline-block", fontFamily: mont, fontWeight: 900, fontSize: 70, color: "#052E16", background: "#4ADE80", padding: "26px 50px", borderRadius: 80, boxShadow: "0 0 60px #4ADE80" }}>💬 ESCRÍBENOS AHORA</span>
      </div>
      <div style={{ position: "absolute", top: 1400, left: 140, right: 140, textAlign: "center", fontFamily: mont, fontWeight: 800, fontSize: 40, color: "#fff", opacity: p }}>
        ¡Quedan solo {quedan} pares!
        <div style={{ marginTop: 14, height: 26, borderRadius: 13, background: "rgba(255,255,255,.2)" }}>
          <div style={{ width: `${quedan * 5}%`, height: "100%", borderRadius: 13, background: "linear-gradient(90deg,#FF4D4D,#FFD23F)" }} />
        </div>
      </div>
      <Texto t={t} s={T.cta} e={T.formula} y={330} txt="¡ASEGURA TU PAR!" color="#fff" />
      {/* cursor tocando el botón */}
      <div style={{ position: "absolute", left: 700 + interpolate(lt, [0.5, 1.2], [200, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), top: 1240 + interpolate(lt, [0.5, 1.2], [300, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), fontSize: 110,
        transform: `scale(${lt > 1.2 && lt < 1.4 ? 0.85 : 1})` }}>👆</div>
    </AbsoluteFill>
  );
};

const Comercial: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  if (t < T.suela) return <Calle t={t} f={f} />;
  if (t < T.oferta) return <Beneficio t={t} f={f} />;
  if (t < T.cta) return <Oferta t={t} f={f} />;
  return <Accion t={t} f={f} />;
};

// etiqueta educativa de la parte del anuncio
const Etiqueta: React.FC<{ t: number }> = ({ t }) => {
  const i = PASOS.reduce((a, p, k) => (t >= p.desde ? k : a), -1);
  if (i < 0 || t >= T.formula) return null;
  const p = PASOS[i];
  const sp = spring({ frame: Math.round((t - p.desde) * FPS), fps: FPS, config: { damping: 12, stiffness: 160 } });
  return (
    <div style={{ position: "absolute", top: 120, left: 40, transform: `translateX(${interpolate(sp, [0, 1], [-500, 0])}px)`, display: "flex", alignItems: "center", gap: 14,
      background: "rgba(10,10,18,.85)", border: `4px solid ${p.c}`, borderRadius: 22, padding: "12px 24px", boxShadow: `0 0 30px ${p.c}88` }}>
      <div style={{ fontFamily: bebas, fontSize: 62, color: p.c, lineHeight: 1 }}>{i + 1}</div>
      <div style={{ fontFamily: mont, fontWeight: 900, fontSize: 36, color: "#fff" }}>{p.n}</div>
    </div>
  );
};

export const ReelAnuncioTenis: React.FC<{ fin: number }> = ({ fin }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  // pantalla del anuncio: arranca en un celular, crece a pantalla completa y al final vuelve al celular
  const crece = interpolate(t, [3.9, T.anuncio], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const vuelve = interpolate(t, [T.formula - 0.1, T.formula + 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const tAnuncio = t < T.anuncio ? T.anuncio : t > T.formula ? T.formula - 0.05 : t;
  const escala = t < T.formula ? interpolate(crece, [0, 1], [0.45, 1]) : interpolate(vuelve, [0, 1], [1, 0.36]);
  const topY = t < T.formula ? interpolate(crece, [0, 1], [560, 0]) : interpolate(vuelve, [0, 1], [0, 230]);
  const radio = interpolate(escala, [0.36, 1], [90, 0]);
  const hookP = spring({ frame: f, fps: FPS, config: { damping: 10, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #2A1B4A, #07060C 70%)", fontFamily: mont, overflow: "hidden" }}>
      {/* gancho del reel */}
      {t < T.anuncio ? (
        <div style={{ position: "absolute", top: 120, left: 40, right: 40, textAlign: "center", transform: `scale(${hookP})`, opacity: 1 - crece }}>
          <div style={{ fontFamily: bebas, fontSize: 130, lineHeight: 0.95, color: "#fff" }}>ASÍ SE HACE UN</div>
          <div style={{ fontFamily: bebas, fontSize: 150, lineHeight: 0.95, color: "#FFD23F", textShadow: "0 0 40px #FFD23F88" }}>ANUNCIO QUE VENDE</div>
          <div style={{ display: "inline-block", marginTop: 12, fontWeight: 900, fontSize: 40, color: "#0A0A0A", background: "#fff", padding: "6px 22px", borderRadius: 12 }}>MÍRALO 👇</div>
        </div>
      ) : null}
      {/* el anuncio */}
      <div style={{ position: "absolute", left: 0, top: topY, width: 1080, height: 1920, transform: `scale(${escala})`, transformOrigin: "50% 0", borderRadius: radio * 2, overflow: "hidden",
        boxShadow: escala < 0.99 ? "0 0 0 14px #1A1A22, 0 0 0 18px #3A3A48, 0 40px 120px rgba(0,0,0,.7)" : undefined }}>
        <Comercial t={tAnuncio} f={f} />
        {t < T.anuncio ? <AbsoluteFill style={{ background: "rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 260, color: "#fff" }}>▶</AbsoluteFill> : null}
      </div>
      <Etiqueta t={t} />
      {/* la fórmula */}
      {t >= T.formula ? (
        <div style={{ position: "absolute", top: 960, left: 50, right: 50 }}>
          {PASOS.map((p, i) => {
            if (t < p.s) return null;
            const sp = spring({ frame: Math.round((t - p.s) * FPS), fps: FPS, config: { damping: 11, stiffness: 160 } });
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18, transform: `translateX(${interpolate(sp, [0, 1], [700, 0])}px)`,
                background: "rgba(255,255,255,.06)", border: `3px solid ${p.c}`, borderRadius: 24, padding: "12px 22px" }}>
                <div style={{ fontSize: 60 }}>{p.e}</div>
                <div style={{ fontFamily: bebas, fontSize: 70, color: p.c, width: 40 }}>{i + 1}</div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 42, color: "#fff" }}>{p.n}</div>
                  <div style={{ fontWeight: 700, fontSize: 28, color: "#C9C4D8" }}>{p.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {t >= T.guarda ? (
        <div style={{ position: "absolute", bottom: 90, left: 0, right: 0, textAlign: "center", transform: `scale(${spring({ frame: Math.round((t - T.guarda) * FPS), fps: FPS, config: { damping: 9 } })})` }}>
          <span style={{ fontWeight: 900, fontSize: 52, color: "#0A0A0A", background: "#FFD23F", padding: "14px 30px", borderRadius: 18 }}>📌 GUÁRDALO PARA TU PRÓXIMO ANUNCIO</span>
          <div style={{ marginTop: 14, fontWeight: 800, fontSize: 34, color: "#A9A6B8" }}>@almonte_suarez.ia</div>
        </div>
      ) : null}
      {/* barra de progreso */}
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: `${(t / fin) * 100}%`, background: "linear-gradient(90deg,#FF8A3D,#FFD23F)" }} />
    </AbsoluteFill>
  );
};

export const AnuncioTenisComposition = () => (
  <Composition id="ReelAnuncioTenis" component={ReelAnuncioTenis} fps={FPS} width={1080} height={1920} durationInFrames={FPS * 39} defaultProps={{ fin: 38.8 }}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.fin * FPS) })} />
);
