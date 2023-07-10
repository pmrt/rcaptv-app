import { useEffect } from "react";

import Player from "./Player";
import TimelineBar from "./TimelineBar";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import ClipsList from "./ClipList";
import "./Timeline.scss";
import { CLIP_NEAR_THRESHOLD } from "./constants";
import {
  selectStatusError,
  selectStatusIsPlayerLoading,
  selectVodsAnchor,
  setThresholdAreaNearThreshold,
} from "./slice";

type TimelineProps = {
  user: string | null;
};
const Timeline = ({ user }: TimelineProps) => {
  const dispatch = useAppDispatch();
  const vod = useAppSelector(selectVodsAnchor);

  useEffect(
    function initialThresholdArea() {
      dispatch(setThresholdAreaNearThreshold(CLIP_NEAR_THRESHOLD));
    },
    [dispatch, vod?.duration_seconds]
  );

  if (!vod) {
    return <p>Invalid VOD</p>;
  }

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
        <Player />
        <ClipsList />
        <TimelineBar />
      </main>
    </>
  );
};

const TimelineState = () => {
  const error = useAppSelector(selectStatusError);
  const isPlayerLoading = useAppSelector(selectStatusIsPlayerLoading);

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
