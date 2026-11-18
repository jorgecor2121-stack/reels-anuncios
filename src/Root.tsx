import { MyComposition } from "./Composition";
import { TipsComposition } from "./Tips";
import { PodcastComposition } from "./Podcast";
import { MotionComposition } from "./Motion";
import { AvatarMotionComposition } from "./AvatarMotion";
import { PromoComposition } from "./Promo";
import { PruebaComposition } from "./Prueba";

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
    </>
  );
};
