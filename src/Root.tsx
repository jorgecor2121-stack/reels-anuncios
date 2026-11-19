import { MyComposition } from "./Composition";
import { TipsComposition } from "./Tips";
import { PodcastComposition } from "./Podcast";
import { MotionComposition } from "./Motion";
import { AvatarMotionComposition } from "./AvatarMotion";
import { PromoComposition } from "./Promo";
import { PruebaComposition } from "./Prueba";
import { CineComposition, PortadaComposition } from "./Cine";
import { ManosComposition } from "./Manos";
import { ManosCineComposition } from "./ManosCine";
import { PantallaComposition } from "./Pantalla";
import { DetrasComposition } from "./Detras";
import { AnuncioTenisComposition } from "./AnuncioTenis";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <TipsComposition />
      <PodcastComposition />
      <MotionComposition />
      <AvatarMotionComposition />
      <PromoComposition />
      <PruebaComposition />
      <CineComposition />
      <PortadaComposition />
      <ManosComposition />
      <ManosCineComposition />
      <PantallaComposition />
      <DetrasComposition />
      <AnuncioTenisComposition />
    </>
  );
};
