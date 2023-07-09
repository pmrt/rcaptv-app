import { type ClipWithNonNullableVodOffset } from "@/lib/api/clips";
import { useEffect } from "react";

import { type VOD } from "@/lib/api/vods";

import Player from "./Player";
import TimelineBar from "./TimelineBar";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import ClipsList from "./ClipList";
import "./Timeline.scss";
import { CLIP_NEAR_THRESHOLD } from "./constants";
import { selectStatus, setThresholdArea } from "./slice";

type TimelineProps = {
  clips: ClipWithNonNullableVodOffset[];
  vod: VOD;
  user: string | null;
};
const Timeline = ({ clips, vod, user }: TimelineProps) => {
  const dispatch = useAppDispatch();

  useEffect(
    function initialThresholdArea() {
      dispatch(
        setThresholdArea({
          areaSeconds: (vod.duration_seconds * CLIP_NEAR_THRESHOLD) / 100,
          vodDurationSeconds: vod.duration_seconds,
        })
      );
    },
    [dispatch, vod.duration_seconds]
  );

  return (
    <>
      <main>
        <header className="timeline-header">
          <div className="timeline-info">
            <div className="title">
              <h1>Timeline</h1>
              <span className="divider" />
              {user ? <h2 className="user">{user}</h2> : null}
            </div>
            <h3 className="vod-title">{vod.title}</h3>
          </div>
          <TimelineState />
        </header>
        <Player vid={vod.id} initialClip={clips.length > 0 ? clips[0] : null} />
        <ClipsList clips={clips} />
        <TimelineBar clips={clips} vod={vod} />
      </main>
    </>
  );
};

const TimelineState = () => {
  const { error, isPlayerLoading } = useAppSelector(selectStatus);
  return (
    <div className="state">
      <div className="error" style={error === "" ? { display: "none" } : {}}>
        <p className="message">{error}</p>
      </div>
      <p>{isPlayerLoading ? "Video Loading..." : ""}</p>
    </div>
  );
};

export default Timeline;
