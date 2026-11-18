import { MyComposition } from "./Composition";
import { TipsComposition } from "./Tips";
import { PodcastComposition } from "./Podcast";
import { MotionComposition } from "./Motion";
import { AvatarMotionComposition } from "./AvatarMotion";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <TipsComposition />
      <PodcastComposition />
      <MotionComposition />
      <AvatarMotionComposition />
    </>
  );
};
