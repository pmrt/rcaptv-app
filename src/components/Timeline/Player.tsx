import { useAppDispatch, useAppSelector, useExternalScript } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { TwitchPlayer } from "types/global";

const playerElementID = "rcap-player";

import "./Player.scss";
import { TWITCH_PLAYER_SCRIPT } from "./constants";
import { duration } from "./helpers";
import { hidePlayer, selectPlayer, setTime, showPlayer } from "./slice";

type PlayerProps = {
  vid: string;
  playerRef: React.MutableRefObject<TwitchPlayer.Player | null>;
  startAt: number;
};
const Player = ({ vid, playerRef, startAt }: PlayerProps) => {
  const { isForeground } = useAppSelector(selectPlayer);
  const isReady = useExternalScript(TWITCH_PLAYER_SCRIPT);
  const dispatch = useAppDispatch();

  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!window.Twitch) {
      throw new Error("Error while loading twitch player script");
    }
    // Max one instance at a time
    if (playerRef.current) return;
    playerRef.current = new window.Twitch.Player(playerElementID, {
      width: "100%",
      height: "100%",
      video: vid,
      muted: false,
      time: duration(startAt),
      autoplay: false,
    });
    const p = playerRef.current as unknown as TwitchPlayer.Player;

    const onSeekHandler = (params: { position: number }) => {
      dispatch(setTime(params.position));
    };
    const onReady = () => {
      setIsPlayerReady(true);
    };
    const onPause = () => {
      dispatch(hidePlayer());
    };
    const onPlay = () => {
      dispatch(showPlayer());
    };
    p.addEventListener(window.Twitch.Player.SEEK, onSeekHandler);
    p.addEventListener(window.Twitch.Player.READY, onReady);
    p.addEventListener(window.Twitch.Player.PAUSE, onPause);
    p.addEventListener(window.Twitch.Player.PLAY, onPlay);
    return () => {
      if (!playerRef.current) return;
      const p = playerRef.current as TwitchPlayer.Player;
      p.removeEventListener(window.Twitch.Player.SEEK, onSeekHandler);
      p.removeEventListener(window.Twitch.Player.READY, onReady);
      p.removeEventListener(window.Twitch.Player.PAUSE, onPause);
      p.removeEventListener(window.Twitch.Player.PLAY, onPlay);
    };
  }, [isReady, playerRef, vid, startAt, dispatch]);

  useEffect(
    function handleEnteringAndLeaving() {
      if (isForeground) {
        playerRef.current?.play();
      } else {
        playerRef.current?.pause();
      }
    },
    [isForeground, playerRef]
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
