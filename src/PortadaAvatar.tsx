// Portada ilustrada para el perfil (1080x1920). Lo importante queda dentro del recorte 3:4 de la cuadrícula
// (y 240–1680): título grande con palabra resaltada, una ilustración-icono gigante y la caricatura expresiva.
import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Studio } from "./scenes/Studio";
import { StudioNeon } from "./scenes/StudioNeon";
import { StudioSunset } from "./scenes/StudioSunset";
import { StudioCafe } from "./scenes/StudioCafe";
import { StudioBoutique } from "./scenes/StudioBoutique";
import { StudioEscenario } from "./scenes/StudioEscenario";
import { OutfitProvider, Vestimenta } from "./avatar2d/outfit";
import { poseAtFrame } from "./avatar2d/timeline";

const { fontFamily } = loadFont("normal", { weights: ["800", "900"], subsets: ["latin"] });

export type PortadaProps = {
  entorno?: "clasico" | "neon" | "atardecer" | "cafe" | "boutique" | "escenario";
  vestimenta?: Vestimenta;
  marca: string;
  limpia?: boolean; // solo estudio + caricatura (para animar con IA)
  portada: {
    lineas: string[]; // 2–4 líneas cortas
    resaltar?: number; // índice de la línea que va en caja amarilla
    icono: string; // emoji grande de la ilustración
    satelites?: string[]; // 2–4 emojis pequeños alrededor
    badge?: string; // etiqueta arriba (p. ej. "PROSPERIDAD")
    pose?: string;
    color?: string; // color del halo del icono
  };
};

const TINTE: Record<string, string> = {
  escenario: "6,11,34", boutique: "58,30,36", cafe: "30,16,10", atardecer: "26,18,32", neon: "7,6,15", clasico: "10,5,3",
};

export const PortadaAvatar: React.FC<PortadaProps> = (p) => {
  const c = p.portada;
  const ent = p.entorno ?? "cafe";
  const pose = poseAtFrame([{ start: 0, pose: c.pose ?? "surprised", talk: false }], 30, 30);
  const halo = c.color ?? "#FFD23F";
  const tinte = TINTE[ent] ?? TINTE.clasico;
  const sat = c.satelites ?? [];
  const pos = [[150, 1010], [140, 1420], [950, 1440], [930, 1650]];
  if (p.limpia) return (
    <AbsoluteFill style={{ background: "#0A0503", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: -120, width: 1080, height: 1920, transform: "scale(1.25)", transformOrigin: "540px 0" }}>
        <OutfitProvider vestimenta={p.vestimenta}>
          {ent === "neon" ? <StudioNeon pose={pose} frame={30} energia={0.4} />
            : ent === "atardecer" ? <StudioSunset pose={pose} frame={30} energia={0.4} />
            : ent === "cafe" ? <StudioCafe pose={pose} frame={30} energia={0.4} />
            : ent === "escenario" ? <StudioEscenario pose={pose} frame={30} energia={0.4} />
            : ent === "boutique" ? <StudioBoutique pose={pose} frame={30} energia={0.4} />
            : <Studio pose={pose} glow={1} />}
        </OutfitProvider>
      </div>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ background: "#0A0503", fontFamily, color: "#fff", overflow: "hidden" }}>
      {/* estudio + caricatura, más abajo y más grande para que se vea la cara en la cuadrícula */}
      <div style={{ position: "absolute", left: 0, top: 170, width: 1080, height: 1920, transform: "scale(1.12)", transformOrigin: "540px 0" }}>
        <OutfitProvider vestimenta={p.vestimenta}>
          {ent === "neon" ? <StudioNeon pose={pose} frame={30} energia={0.6} />
            : ent === "atardecer" ? <StudioSunset pose={pose} frame={30} energia={0.6} />
            : ent === "cafe" ? <StudioCafe pose={pose} frame={30} energia={0.6} />
            : ent === "escenario" ? <StudioEscenario pose={pose} frame={30} energia={0.6} />
            : ent === "boutique" ? <StudioBoutique pose={pose} frame={30} energia={0.6} />
            : <Studio pose={pose} glow={1} />}
        </OutfitProvider>
      </div>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(${tinte},1) 0%, rgba(${tinte},.96) 30%, rgba(${tinte},0) 44%)` }} />
      {/* rayos detrás del icono */}
      <div style={{ position: "absolute", left: 850 - 300, top: 1030 - 300, width: 600, height: 600, borderRadius: "50%",
        background: `repeating-conic-gradient(from 0deg, ${halo}33 0deg 10deg, transparent 10deg 20deg)`,
        maskImage: "radial-gradient(circle, #000 30%, transparent 70%)", WebkitMaskImage: "radial-gradient(circle, #000 30%, transparent 70%)" }} />
      {/* marca */}
      <div style={{ position: "absolute", top: 262, width: "100%", textAlign: "center", fontSize: 34, fontWeight: 800, color: "#D8D4E6", letterSpacing: 2 }}>{p.marca}</div>
      {/* título */}
      <div style={{ position: "absolute", top: 320, left: 50, right: 50, textAlign: "center" }}>
        {c.badge ? (
          <div style={{ display: "inline-block", background: "#FF3B5C", color: "#fff", fontWeight: 900, fontSize: 34, padding: "6px 22px", borderRadius: 12, letterSpacing: 2, marginBottom: 14, transform: "rotate(-2deg)" }}>{c.badge}</div>
        ) : null}
        {c.lineas.map((l, i) => (
          <div key={i} style={{ marginTop: 6 }}>
            <span style={{
              display: "inline-block", fontWeight: 900, fontSize: c.lineas.length > 3 ? 78 : 92, lineHeight: 1.08, letterSpacing: -1,
              textTransform: "uppercase", padding: i === c.resaltar ? "2px 22px" : 0, borderRadius: 16,
              background: i === c.resaltar ? "linear-gradient(135deg,#FFD23F,#FF8A3D)" : "none",
              color: i === c.resaltar ? "#1A1205" : "#fff",
              transform: i === c.resaltar ? "rotate(-1.5deg)" : undefined,
              textShadow: i === c.resaltar ? "none" : "0 6px 0 rgba(0,0,0,.45), 0 0 30px rgba(0,0,0,.6)",
            }}>{l}</span>
          </div>
        ))}
      </div>
      {/* ilustración: icono gigante con halo, encima del hombro */}
      <div style={{ position: "absolute", left: 850 - 150, top: 1030 - 150, width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${halo}AA 0%, ${halo}33 55%, transparent 72%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 200, lineHeight: 1, filter: "drop-shadow(0 14px 18px rgba(0,0,0,.55))", transform: "rotate(8deg)" }}>{c.icono}</div>
      </div>
      {sat.map((e, i) => (
        <div key={i} style={{ position: "absolute", left: pos[i % 4][0] - 55, top: pos[i % 4][1] - 55, fontSize: 96, transform: `rotate(${i % 2 ? 12 : -12}deg)`, filter: "drop-shadow(0 8px 10px rgba(0,0,0,.5))" }}>{e}</div>
      ))}
    </AbsoluteFill>
  );
};

export const PortadaAvatarComposition = () => (
  <Composition id="PortadaAvatar" component={PortadaAvatar} durationInFrames={1} fps={30} width={1080} height={1920}
    defaultProps={{ entorno: "cafe", vestimenta: "blazer", marca: "@jorgealmonteia",
      portada: { lineas: ["Los 3 números", "de tu anuncio", "que más importan"], resaltar: 1, icono: "📊", satelites: ["💬", "💰"], badge: "NO SON LOS LIKES" } } as PortadaProps} />
);
