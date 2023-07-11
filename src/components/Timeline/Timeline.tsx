import { useCallback, useEffect, useRef } from "react";

import Player from "./Player";
import TimelineBar from "./TimelineBar";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import ClipsList from "./ClipList";
import "./Timeline.scss";
import {
  CLIP_NEAR_THRESHOLD,
  ErrorTypes,
  LSKEY_MUTE_HIJACK_ACCEPTED,
} from "./constants";
import {
  resetError,
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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(
    function initialThresholdArea() {
      dispatch(setThresholdAreaNearThreshold(CLIP_NEAR_THRESHOLD));
    },
    [dispatch, vod?.duration_seconds]
  );

  useEffect(
    function showTimeline() {
      if (vod?.id) {
        containerRef.current?.style.setProperty("--translate", "0");
      }
    },
    [vod?.id]
  );

  if (!vod) {
    return null;
    // return <p>Invalid VOD</p>;
  }

  return (
    <>
      <main>
        <div className="timeline-container">
          <div className="timeline" ref={containerRef}>
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
          </div>
        </div>
      </main>
    </>
  );
};

type Error = {
  type: string;
  message: string;
};

const TimelineState = () => {
  const error = useAppSelector(selectStatusError);
  const isPlayerLoading = useAppSelector(selectStatusIsPlayerLoading);

  const ErrComp = ErrorToComponents[error.type] || null;
  return (
    <div className="state">
      {ErrComp && <ErrComp error={error} />}
      <p>{isPlayerLoading ? "Video Loading..." : ""}</p>
    </div>
  );
};

type ErrorProps = {
  error: Error;
};
const PluginsMuteHijackingsError = ({ error }: ErrorProps) => {
  const dispatch = useAppDispatch();

  const accept = useCallback(() => {
    dispatch(resetError());
    localStorage.setItem(LSKEY_MUTE_HIJACK_ACCEPTED, "1");
  }, [dispatch]);

  const accepted = localStorage.getItem(LSKEY_MUTE_HIJACK_ACCEPTED) === "1";
  if (accepted) {
    return null;
  }
  return (
    <div className="error">
      <h3 className="err-warn">Info</h3>
      <p className="message">{error.message}</p>
      <button type="button" onClick={accept}>
        Accept
      </button>
    </div>
  );
};

const DifferentVideoDetectedError = ({ error }: ErrorProps) => {
  return (
    <div className="error">
      <h3 className="err-error">Error</h3>
      <p className="message">{error.message}</p>
    </div>
  );
};

const ErrorToComponents = {
  [ErrorTypes.ERR_PLUGINS_MUTE_HIJACKED]: PluginsMuteHijackingsError,
  [ErrorTypes.ERR_DIFFERENT_VIDEO_DETECTED]: DifferentVideoDetectedError,
};

export default Timeline;
