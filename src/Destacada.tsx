// Portada para historia destacada (1080x1920). Instagram muestra solo el círculo central, así que el icono va centrado.
import React from "react";
import { AbsoluteFill, Composition, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", { weights: ["800"], subsets: ["latin"] });

type Props = { icono?: string; imagen?: string; color?: string; svg?: "ia" | "marketing" | "resultados" | "persona"; etiqueta?: string };

const Y = "#FFD23F", O = "#FF8A3D";
const trazo = { fill: "none", stroke: Y, strokeWidth: 22, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// Íconos de línea propios (sin logos de terceros)
const Svg: React.FC<{ k: NonNullable<Props["svg"]> }> = ({ k }) => (
  <svg viewBox="0 0 400 400" width={520} height={520}>
    {k === "ia" ? (
      <g>
        <rect x={110} y={110} width={180} height={180} rx={28} {...trazo} />
        {[150, 200, 250].map((p) => (
          <g key={p}>
            <line x1={p} y1={110} x2={p} y2={60} {...trazo} /><circle cx={p} cy={48} r={13} fill={Y} />
            <line x1={p} y1={290} x2={p} y2={340} {...trazo} /><circle cx={p} cy={352} r={13} fill={Y} />
            <line x1={110} y1={p} x2={60} y2={p} {...trazo} /><circle cx={48} cy={p} r={13} fill={Y} />
            <line x1={290} y1={p} x2={340} y2={p} {...trazo} /><circle cx={352} cy={p} r={13} fill={Y} />
          </g>
        ))}
        <text x={200} y={232} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={96} fill={O}>IA</text>
      </g>
    ) : k === "marketing" ? (
      <g>
        {[[70, 250, 80], [140, 200, 130], [210, 150, 180], [280, 95, 235]].map(([x, y, h]) => (
          <rect key={x} x={x} y={y} width={50} height={h} rx={10} fill={O} stroke={Y} strokeWidth={14} />
        ))}
        <line x1={50} y1={345} x2={350} y2={345} {...trazo} />
        <path d="M60 190 Q170 150 330 50" {...trazo} />
        <path d="M285 45 L335 48 L320 95" {...trazo} />
      </g>
    ) : k === "resultados" ? (
      <g>
        <path d="M120 60 H280 V150 A80 80 0 0 1 120 150 Z" {...trazo} />
        <path d="M120 85 H75 Q70 160 140 185" {...trazo} />
        <path d="M280 85 H325 Q330 160 260 185" {...trazo} />
        <line x1={200} y1={230} x2={200} y2={290} {...trazo} />
        <path d="M140 340 H260 L245 295 H155 Z" {...trazo} />
        <path d="M200 92 L212 122 L244 124 L219 144 L227 175 L200 158 L173 175 L181 144 L156 124 L188 122 Z" fill={O} />
      </g>
    ) : (
      <g>
        <circle cx={200} cy={200} r={170} {...trazo} />
        <circle cx={200} cy={160} r={60} fill={O} stroke={Y} strokeWidth={18} />
        <path d="M85 318 Q200 200 315 318" fill={O} stroke={Y} strokeWidth={18} />
      </g>
    )}
  </svg>
);

export const Destacada: React.FC<Props> = ({ icono, imagen, color = O, svg, etiqueta }) => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #1E1830 0%, #0B0814 70%)", alignItems: "center", justifyContent: "center", fontFamily }}>
    {/* aro de marca */}
    <div style={{ width: 860, height: 860, borderRadius: "50%", padding: 26, background: `linear-gradient(135deg,${Y},${O} 55%,#FF3B5C)`, boxShadow: `0 0 120px ${color}55` }}>
      <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", position: "relative",
        background: `radial-gradient(circle at 50% 40%, ${color}44 0%, #15111F 68%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {imagen ? <Img src={staticFile(imagen)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : svg ? <div style={{ marginTop: etiqueta ? -60 : 0 }}><Svg k={svg} /></div>
          : <div style={{ fontSize: 430, lineHeight: 1, filter: "drop-shadow(0 20px 26px rgba(0,0,0,.55))" }}>{icono}</div>}
        {etiqueta ? (
          <div style={{ position: "absolute", bottom: imagen ? 70 : 120, left: 0, right: 0, textAlign: "center", color: "#fff", fontSize: 50, fontWeight: 800,
            letterSpacing: 2, textTransform: "uppercase", textShadow: "0 4px 18px rgba(0,0,0,.9)" }}>{etiqueta}</div>
        ) : null}
      </div>
    </div>
  </AbsoluteFill>
);

export const DestacadaComposition = () => (
  <Composition id="Destacada" component={Destacada} durationInFrames={1} fps={30} width={1080} height={1920}
    defaultProps={{ icono: "📣", color: O } as Props} />
);
