import { useAppDispatch, useAppSelector, useExternalScript } from "@/lib/hooks";
import { useEffect, useRef } from "react";
import { TwitchPlayer } from "types/global";

const playerElementID = "rcap-player";

import "./Player.scss";
import { TWITCH_PLAYER_SCRIPT } from "./constants";
import { duration } from "./helpers";
import {
  hidePlayer,
  selectIsTimeFromPause,
  selectPlayerIsForeground,
  selectStatusIsPlayerReady,
  selectTimeSeconds,
  selectTopOffset,
  selectVodsAnchor,
  setError,
  setInitialTime,
  setIsPlayerLoading,
  setIsTimeFromPause,
  setPause,
  setPlayerLoadingAndNotReady,
  setPlayerReady,
  setPlaying,
  setTime,
  setTimeAndShowPlayer,
  showPlayer,
} from "./slice";

const UNREACHABLE_TIME = -1;

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
  }, 1);
}

const Player = () => {
  const playerRef = useRef<TwitchPlayer.Player | null>(null);

  const dispatch = useAppDispatch();

  const vid = useAppSelector(selectVodsAnchor)?.id ?? "0";
  const isPlayerReady = useAppSelector(selectStatusIsPlayerReady);
  const timeSec = useAppSelector(selectTimeSeconds);
  const isFg = useAppSelector(selectPlayerIsForeground);
  const initialOffset = useAppSelector(selectTopOffset);
  const isTimeFromPause = useAppSelector(selectIsTimeFromPause);

  const isScriptReady = useExternalScript(TWITCH_PLAYER_SCRIPT);

  useEffect(() => {
    let firstPlay = true;
    if (vid === "0") return;
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
      dispatch(setPause(playerRef.current?.getCurrentTime() || 0));
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
        dispatch(setInitialTime(initialOffset));
      } else {
        // Note: this may seem a little bit counter-intuitive but it's better
        // for the UX to go to the initialOffset if the player is not ready
        // yet, this provides visual feedback for the user so that they know
        // they don't have to wait for the player to load to play with the
        // timeline bar. When the player is ready, setInitialTime will set
        // the time only if it wasn't set before
        dispatch(setTime(initialOffset));
      }
    },
    [dispatch, initialOffset, isPlayerReady]
  );

  useEffect(
    function handleEnteringAndLeaving() {
      if (isFg && isPlayerReady) {
        if (playerRef.current?.isPaused()) {
          playerRef.current?.play();
        }
      }
    },
    [isFg, playerRef, isPlayerReady]
  );

  const ignoreTime = useRef(UNREACHABLE_TIME);
  useEffect(
    function handleTimeMarkChange() {
      if (ignoreTime.current === timeSec) {
        return;
      }

      if (playerRef.current && isPlayerReady) {
        if (isTimeFromPause) {
          // if the time change is because a pause, we don't need a seek
          // because we're already where we want in the player.
          //
          // Since the moment we receive a time from pause we won't let our
          // hook to fire a new seek until the timeSec changes, ignoring
          // timeSecs from last pause.
          //
          // This prevents some bad behaviour, e.g.: when user uses the player
          // to seek, twitch would send first a pause and then a seek with the
          // right position seeked. If we pause and seek in this hook before
          // receiving the right seek, the second seek would cancel out.
          ignoreTime.current = timeSec;
          dispatch(setIsTimeFromPause(false));
          return;
        }

        playerRef.current.seek(timeSec);
        dispatch(setIsPlayerLoading(true));
        waitForBuffering(playerRef.current, () => {
          dispatch(setIsPlayerLoading(false));
        });
        ignoreTime.current = UNREACHABLE_TIME;
      }
    },
    [timeSec, dispatch, playerRef, isPlayerReady, isTimeFromPause]
  );

  useEffect(
    function setupKeybindings() {
      if (!isPlayerReady) return;
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
    [dispatch, isPlayerReady]
  );

  return (
    <div
      className={`rcap-player-wrapper${isFg ? " foreground" : ""}`}
      tabIndex={-1}
    >
      <div id={playerElementID}></div>
    </div>
  );
};

export default Player;
