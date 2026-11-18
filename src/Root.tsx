import { MyComposition } from "./Composition";
import { TipsComposition } from "./Tips";
import { PodcastComposition } from "./Podcast";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <TipsComposition />
      <PodcastComposition />
    </>
  );
};
