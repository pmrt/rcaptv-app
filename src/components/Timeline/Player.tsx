import { useAppDispatch, useAppSelector, useExternalScript } from "@/lib/hooks";
import { useEffect, useRef } from "react";
import { TwitchPlayer } from "types/global";

const playerElementID = "rcap-player";

import { ClipWithNonNullableVodOffset } from "@/lib/api/clips";
import "./Player.scss";
import { TWITCH_PLAYER_SCRIPT } from "./constants";
import { duration } from "./helpers";
import {
  hidePlayer,
  selectPlayer,
  selectStatus,
  selectTime,
  setError,
  setIsPlayerLoading,
  setPlayerLoadingAndNotReady,
  setPlayerReady,
  setPlaying,
  setTime,
  setTimeAndShowPlayer,
  showPlayer,
} from "./slice";

// hacky, unstable way to check for buffering. Twitch does not provide an
// official way to check this. Especially, when we seek manually with
// player.seek(), the player is paused and we want to know when did it stop
// buffering.
const wantStates = { Idle: 1, Ready: 1, Playing: 1, Buffering: 0 };
function waitForBuffering(el: TwitchPlayer.Player | null, cb: () => void) {
  if (!el) return;

  let i: NodeJS.Timer | undefined = undefined;
  let t: NodeJS.Timeout | undefined = undefined;
  const h = () => {
    cb();
    if (i) clearInterval(i);
    if (t) clearTimeout(t);
  };

  t = setTimeout(h, 8 * 1000);
  i = setInterval(() => {
    if (el._player._playerState.playback === "Ended") {
      el.setVideo(el.getVideo(), 0);
      el.setMuted(false);
      el.setVolume(1);
      h();
    } else if (wantStates[el._player._playerState.playback]) {
      h();
    }
  }, 5);
}

type PlayerProps = {
  vid: string;
  initialClip: ClipWithNonNullableVodOffset | null;
};
const Player = ({ vid, initialClip }: PlayerProps) => {
  const playerRef = useRef<TwitchPlayer.Player | null>(null);

  const dispatch = useAppDispatch();
  const { isForeground } = useAppSelector(selectPlayer);
  const { isPlayerReady } = useAppSelector(selectStatus);
  const time = useAppSelector(selectTime);

  const isScriptReady = useExternalScript(TWITCH_PLAYER_SCRIPT);
  const initialOffset = initialClip?.vod_offset ?? 0;

  useEffect(() => {
    let firstPlay = true;
    if (!isScriptReady) return;
    if (!window.Twitch) {
      throw new Error("Error while loading twitch player script");
    }
    // Max one instance at a time
    if (!playerRef.current) {
      dispatch(setPlayerLoadingAndNotReady());
      playerRef.current = new window.Twitch.Player(playerElementID, {
        width: "100%",
        height: "100%",
        video: vid,
        time: duration(initialOffset),
      });
      playerRef.current?.setMuted(false);
      playerRef.current?.setVolume(1);
    }
    const p = playerRef.current as unknown as TwitchPlayer.Player;

    const onSeek = (params: { position: number }) => {
      // ignore first seek events
      if (firstPlay) return;
      dispatch(setTime(params.position));
    };
    const onReady = () => {
      dispatch(setPlayerReady());
      playerRef.current?.pause();
      playerRef.current?.setMuted(false);
      playerRef.current?.setVolume(1);
    };
    const onPause = () => {
      dispatch(hidePlayer());
    };
    const onPlay = () => {
      const p = playerRef.current;
      if (!p) return;
      if (p.getVideo() !== vid) {
        p.setVideo(vid, 0);
        p.setMuted(false);
        p.setVolume(1);
        dispatch(
          setError("Twitch loaded a different video, resetting video state.")
        );
        return;
      }
      firstPlay = false;
      dispatch(setPlaying());
    };
    const onEnd = () => {
      const p = playerRef.current;
      if (!p) return;
      p.setVideo(vid, 0);
      p.setMuted(false);
      p.setVolume(1);
    };
    p.addEventListener("seek", onSeek);
    p.addEventListener("ready", onReady);
    p.addEventListener("pause", onPause);
    p.addEventListener("play", onPlay);
    p.addEventListener("ended", onEnd);
    return () => {
      if (!playerRef.current) return;
      const p = playerRef.current as TwitchPlayer.Player;
      p.removeEventListener("seek", onSeek);
      p.removeEventListener("ready", onReady);
      p.removeEventListener("pause", onPause);
      p.removeEventListener("play", onPlay);
      p.removeEventListener("ended", onEnd);
    };
  }, [isScriptReady, playerRef, vid, initialOffset, dispatch]);

  useEffect(
    function initialTimePosition() {
      if (isPlayerReady) {
        dispatch(setTime(initialOffset));
      }
    },
    [dispatch, initialOffset, isPlayerReady]
  );

  useEffect(
    function handleEnteringAndLeaving() {
      if (isForeground) {
        if (playerRef.current?.isPaused()) {
          playerRef.current?.play();
        }
      }
    },
    [isForeground, playerRef]
  );

  useEffect(
    function handleTimeMarkChange() {
      if (playerRef.current) {
        playerRef.current.seek(time.seconds);
        dispatch(setIsPlayerLoading(true));
        waitForBuffering(playerRef.current, () => {
          dispatch(setIsPlayerLoading(false));
        });
      }
    },
    [time.seconds, dispatch, playerRef]
  );

  useEffect(
    function setupKeybindings() {
      const handleKey = (e: KeyboardEvent) => {
        const playerEl = playerRef.current;
        if (!playerEl) return;

        switch (e.key) {
          case " ":
            if (playerEl.isPaused()) {
              dispatch(showPlayer());
              playerEl.play();
            } else {
              playerEl.pause();
              dispatch(hidePlayer());
            }
            break;
          case "ArrowLeft": {
            const t = playerEl.getCurrentTime();
            dispatch(setTimeAndShowPlayer(t - 10));
            playerEl.play();
            break;
          }
          case "ArrowRight": {
            const t = playerEl.getCurrentTime();
            dispatch(setTimeAndShowPlayer(t + 30));
            playerEl.play();
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
    <div
      className={`rcap-player-wrapper${isForeground ? " foreground" : ""}`}
      tabIndex={-1}
    >
      <div id={playerElementID}></div>
    </div>
  );
};

export default Player;
