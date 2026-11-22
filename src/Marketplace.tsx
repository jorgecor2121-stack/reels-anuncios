// Imágenes cuadradas para Facebook Marketplace: portada con precio, ficha técnica y fotos con etiqueta.
import { AbsoluteFill, Composition, Img, staticFile } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";

const { fontFamily: bebas } = loadBebas();
const { fontFamily: mont } = loadMont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const ORO = "#FFD23F", ROJO = "#E11D2E";

type Props = { tipo: "portada" | "ficha" | "foto"; img: string; etiqueta?: string; foco?: string };

const Fondo: React.FC<{ img: string; foco?: string }> = ({ img, foco }) => (
  <>
    <Img src={staticFile(img)} style={{ position: "absolute", inset: -40, width: 1160, height: 1160, objectFit: "cover", filter: "blur(30px) brightness(.5)" }} />
    <Img src={staticFile(img)} style={{ position: "absolute", inset: 0, width: 1080, height: 1080, objectFit: "cover", objectPosition: foco ?? "center" }} />
  </>
);

export const MarketplaceImg: React.FC<Props> = ({ tipo, img, etiqueta, foco }) => (
  <AbsoluteFill style={{ background: "#000", fontFamily: mont, color: "#fff" }}>
    <Fondo img={img} foco={foco} />
    {tipo === "portada" ? (
      <>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 60%, rgba(0,0,0,.85) 100%)" }} />
        <div style={{ position: "absolute", top: 40, left: 50 }}>
          <div style={{ display: "inline-block", background: ROJO, fontWeight: 900, fontSize: 34, padding: "6px 20px", borderRadius: 10, letterSpacing: 2 }}>EN VENTA</div>
          <div style={{ fontFamily: bebas, fontSize: 130, lineHeight: 0.95, marginTop: 8, textShadow: "0 6px 20px #000" }}>TOYOTA VITZ 2011</div>
          <div style={{ fontFamily: bebas, fontSize: 64, color: ORO, textShadow: "0 4px 14px #000" }}>JAPONÉS 🇯🇵 · 1.5 L · 226,600 KM</div>
        </div>
        <div style={{ position: "absolute", bottom: 50, left: 50, right: 50, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-block", background: `linear-gradient(135deg, ${ORO}, #FF8A3D)`, color: "#1A1205", fontFamily: bebas, fontSize: 120, padding: "0 26px", borderRadius: 18, border: "5px solid #fff", transform: "rotate(-2deg)" }}>RD$369,000</div>
            <div style={{ fontWeight: 900, fontSize: 34, marginTop: 8 }}>NEGOCIABLE · 📍 LA VEGA</div>
          </div>
          <div style={{ background: "#25D366", color: "#05210F", fontWeight: 900, fontSize: 34, padding: "12px 20px", borderRadius: 16 }}>📲 829-413-1489</div>
        </div>
      </>
    ) : null}
    {tipo === "ficha" ? (
      <>
        <AbsoluteFill style={{ background: "rgba(5,5,10,.78)" }} />
        <div style={{ position: "absolute", inset: 60 }}>
          <div style={{ fontFamily: bebas, fontSize: 96, color: ORO, lineHeight: 1 }}>TOYOTA VITZ 2011 · FICHA</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 26 }}>
            {[["⚙️", "Motor 1.5 L"], ["⛽", "Bajo consumo"], ["🛣️", "226,600 km reales"], ["🔧", "Mantenimiento al día"], ["🩺", "Diagnóstico realizado"], ["📄", "Marbete al día"], ["🛞", "Aros"], ["🖤", "Color negro"], ["💺", "Interior original"], ["👩", "Solo 2 dueñas en RD"]].map(([e, t]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,.08)", border: "2px solid rgba(255,210,63,.5)", borderRadius: 18, padding: "16px 18px", fontWeight: 800, fontSize: 32 }}>
                <span style={{ fontSize: 40 }}>{e}</span>{t}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: bebas, fontSize: 84, color: "#fff" }}>RD$369,000 <span style={{ fontSize: 46, color: ORO }}>NEG.</span></div>
            <div style={{ background: "#25D366", color: "#05210F", fontWeight: 900, fontSize: 34, padding: "12px 20px", borderRadius: 16 }}>📲 829-413-1489</div>
          </div>
        </div>
      </>
    ) : null}
    {tipo === "foto" && etiqueta ? (
      <div style={{ position: "absolute", bottom: 40, left: 40, background: "rgba(8,8,12,.82)", border: `3px solid ${ORO}`, borderRadius: 16, padding: "10px 22px", fontWeight: 900, fontSize: 36 }}>{etiqueta}</div>
    ) : null}
  </AbsoluteFill>
);

export const MarketplaceComposition = () => (
  <Composition id="MarketplaceImg" component={MarketplaceImg} fps={30} width={1080} height={1080} durationInFrames={1}
    defaultProps={{ tipo: "portada", img: "vitz/08.jpg" } as Props} />
);
