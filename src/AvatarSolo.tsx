// Imagen limpia del personaje (de frente, fondo liso) para usar como referencia en Kling Motion Control.
import { AbsoluteFill, Composition } from "remotion";
import { Character } from "./avatar2d/Character";
import { OutfitProvider, Vestimenta } from "./avatar2d/outfit";
import { POSE_BY_ID } from "./avatar2d/poses";

export const AvatarSolo: React.FC<{ vestimenta: Vestimenta; fondo: string; pose: string }> = ({ vestimenta, fondo, pose }) => (
  <AbsoluteFill style={{ background: fondo, alignItems: "center", justifyContent: "center" }}>
    <OutfitProvider vestimenta={vestimenta}>
      <Character pose={POSE_BY_ID[pose] ?? POSE_BY_ID.base} />
    </OutfitProvider>
  </AbsoluteFill>
);

export const AvatarSoloComposition = () => (
  <Composition id="AvatarSolo" component={AvatarSolo} fps={30} width={1080} height={1080} durationInFrames={1}
    defaultProps={{ vestimenta: "hoodie" as Vestimenta, fondo: "#E9EBEF", pose: "base" }} />
);
