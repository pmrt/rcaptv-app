import { type ClipWithNonNullableVodOffset } from "@/lib/api/clips";
import Clip from "./Clip";

import { useAppSelector } from "@/lib/hooks";
import "./ClipList.scss";
import { selectPlayer, selectThresholdArea, selectTime } from "./slice";

type ClipListProps = {
  clips: ClipWithNonNullableVodOffset[];
};

const ClipsList = ({ clips }: ClipListProps) => {
  const time = useAppSelector(selectTime);
  const thresholdArea = useAppSelector(selectThresholdArea);
  const { isForeground } = useAppSelector(selectPlayer);

  const clipsCtx = clips.filter(
    (c) =>
      c.vod_offset >= time.seconds - thresholdArea.seconds &&
      c.vod_offset <= time.seconds + thresholdArea.seconds
  );

  return (
    <section className="clips-list-section">
      <div className={`clips-list-wrapper ${isForeground ? "" : "foreground"}`}>
        <header>
          <h2>Contextual clips</h2>
          {time.prettyDuration === "" ? (
            <span>
              <small>{time.prettyDuration}</small>
            </span>
          ) : null}
        </header>
        <div className="clips-list">
          {clipsCtx.map((c) => (
            <Clip
              key={c.id}
              title={c.title}
              seconds={c.duration}
              vod_offset={c.vod_offset}
              thumbnailUrl={c.thumbnail_url}
              creator={c.creator_name}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClipsList;
