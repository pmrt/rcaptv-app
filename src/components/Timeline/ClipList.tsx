import Clip from "./Clip";

import { useAppSelector } from "@/lib/hooks";
import "./ClipList.scss";
import {
  selectContextualClips,
  selectPlayerIsForeground,
  selectTimePrettyDuration,
} from "./slice";

const ClipsList = () => {
  const prettyDuration = useAppSelector(selectTimePrettyDuration);
  const isPlayerFg = useAppSelector(selectPlayerIsForeground);
  const ctxClips = useAppSelector(selectContextualClips);

  return (
    <section className="clips-list-section">
      <div className={`clips-list-wrapper ${isPlayerFg ? "" : "foreground"}`}>
        <header>
          <h2>Contextual clips</h2>
          {prettyDuration !== "" ? (
            <span>
              <small>{prettyDuration}</small>
            </span>
          ) : null}
        </header>
        {ctxClips.length === 0 ? (
          <p className="message">
            No clips at this position, use the timeline below.
          </p>
        ) : (
          <div className="clips-list">
            {ctxClips.map((c) => (
              <Clip
                key={c.id}
                title={c.title}
                seconds={c.duration}
                vod_offset={c.vod_offset}
                thumbnailUrl={c.thumbnail_url}
                creator={c.creator_name}
                view_count={c.view_count}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ClipsList;
