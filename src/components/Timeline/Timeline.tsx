import { type ClipWithNonNullableVodOffset } from "@/lib/api/clips";

import { type VOD } from "@/lib/api/vods";
import { useCallback, useState } from "react";
import TimelineBar, { TimeMark } from "./TimelineBar";

import Clip from "./Clip";
import "./Timeline.scss";

const nearThreshold = 5;

type TimelineProps = {
  clips: ClipWithNonNullableVodOffset[];
  vod: VOD;
};
const Timeline = ({ clips, vod }: TimelineProps) => {
  const [timeMark, setTimeMark] = useState<TimeMark>({
    seconds: 0,
    duration: "",
  });
  const onTimeMarkChange = useCallback((sec: number, duration: string) => {
    setTimeMark({
      seconds: sec,
      duration: duration,
    });
  }, []);

  const thresholdArea = (vod.duration_seconds * nearThreshold) / 100;
  const clipsCtx = clips.filter(
    (c) =>
      c.vod_offset >= timeMark.seconds - thresholdArea &&
      c.vod_offset <= timeMark.seconds + thresholdArea
  );
  return (
    <>
      <main>
        <section>
          <h2>Contextual clips</h2>
          <span>{timeMark.duration}</span>
          <div className="clips-list">
            {clipsCtx.map((c) => (
              <Clip
                key={c.id}
                title={c.title}
                seconds={c.duration}
                thumbnailUrl={c.thumbnail_url}
                creator={c.creator_name}
              />
            ))}
          </div>
        </section>

        <TimelineBar
          clips={clips}
          vod={vod}
          onTimeMarkChange={onTimeMarkChange}
          nearThreshold={nearThreshold}
        />
      </main>
    </>
  );
};

export default Timeline;
