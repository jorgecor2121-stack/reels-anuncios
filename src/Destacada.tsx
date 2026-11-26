// Portada para historia destacada (1080x1920). Instagram muestra solo el círculo central, así que el icono va centrado.
import React from "react";
import { AbsoluteFill, Composition, Img, staticFile } from "remotion";

type Props = { icono?: string; imagen?: string; color?: string };

export const Destacada: React.FC<Props> = ({ icono, imagen, color = "#FF8A3D" }) => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #1E1830 0%, #0B0814 70%)", alignItems: "center", justifyContent: "center" }}>
    {/* aro de marca */}
    <div style={{ width: 860, height: 860, borderRadius: "50%", padding: 26, background: "linear-gradient(135deg,#FFD23F,#FF8A3D 55%,#FF3B5C)", boxShadow: `0 0 120px ${color}55` }}>
      <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden",
        background: `radial-gradient(circle at 50% 40%, ${color}66 0%, #15111F 68%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {imagen ? <Img src={staticFile(imagen)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ fontSize: 430, lineHeight: 1, filter: "drop-shadow(0 20px 26px rgba(0,0,0,.55))" }}>{icono}</div>}
      </div>
    </div>
  </AbsoluteFill>
);

export const DestacadaComposition = () => (
  <Composition id="Destacada" component={Destacada} durationInFrames={1} fps={30} width={1080} height={1920}
    defaultProps={{ icono: "📣", color: "#FF8A3D" } as Props} />
);
