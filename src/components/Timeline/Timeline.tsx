import { type ClipWithNonNullableVodOffset } from "@/lib/api/clips";

import { type VOD } from "@/lib/api/vods";
import { useCallback, useState } from "react";
import TimelineBar, { TimeMark } from "./TimelineBar";

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
          <p>{timeMark.duration}</p>
        </section>
        {clipsCtx.map((c) => (
          <article key={c.id}>{c.title}</article>
        ))}
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
