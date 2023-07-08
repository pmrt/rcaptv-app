import { type ClipWithNonNullableVodOffset } from "@/lib/api/clips";
import { useEffect, useRef } from "react";

import { type VOD } from "@/lib/api/vods";
import { TwitchPlayer } from "types/global";

import Player from "./Player";
import TimelineBar from "./TimelineBar";

import { useAppDispatch } from "@/lib/hooks";
import ClipsList from "./ClipList";
import "./Timeline.scss";
import { CLIP_NEAR_THRESHOLD } from "./constants";
import { hidePlayer, setThresholdArea, setTime, showPlayer } from "./slice";

type TimelineProps = {
  clips: ClipWithNonNullableVodOffset[];
  vod: VOD;
  user: string | null;
};
const Timeline = ({ clips, vod, user }: TimelineProps) => {
  const playerRef = useRef<TwitchPlayer.Player | null>(null);

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

  const topClipOffset = clips.length > 0 ? clips[0].vod_offset : 0;
  useEffect(
    function initialTimePosition() {
      dispatch(setTime(topClipOffset));
    },
    [dispatch, topClipOffset]
  );

  useEffect(
    function setupKeybindings() {
      const handleKey = (e: KeyboardEvent) => {
        const playerEl = playerRef.current;
        if (!playerEl) return;

        switch (e.key) {
          case "Escape":
          case " ":
            if (playerEl.isPaused()) {
              dispatch(showPlayer());
            } else {
              dispatch(hidePlayer());
            }
            break;
          case "ArrowLeft": {
            const t = playerEl.getCurrentTime();
            dispatch(setTime(t - 10));
            break;
          }
          case "ArrowRight": {
            const t = playerEl.getCurrentTime();
            dispatch(setTime(t + 30));
            break;
          }
          case "m":
            if (playerEl.getMuted()) {
              playerEl.setMuted(false);
            } else {
              playerEl.setMuted(true);
            }
            break;
          default:
            break;
        }
      };

      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    },
    [dispatch]
  );

  return (
    <>
      <main>
        <header className="timeline-header">
          <h1>Timeline</h1>
          {user ? <h1>{user}</h1> : null}
          <h3>{vod.title}</h3>
        </header>
        <Player vid={vod.id} playerRef={playerRef} startAt={topClipOffset} />
        <ClipsList clips={clips} />
        <TimelineBar clips={clips} vod={vod} playerRef={playerRef} />
      </main>
    </>
  );
};

export default Timeline;
