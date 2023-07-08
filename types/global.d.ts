import { LoaderFunction } from "react-router-dom";

export type LoaderData<TLoaderFn extends LoaderFunction> = Awaited<
  ReturnType<TLoaderFn>
> extends Response | infer D
  ? D
  : never;

export interface LoaderFunction<T> {
  (args: LoaderFunctionArgs): Promise<Response<T>>;
}

type PlayerOptions = {
  width: number;
  height: number;
  channel?: string;
  video?: string;
  collection?: string;
  parent?: string[];
  muted?: boolean;
  time?: string;
  autoplay?: boolean;
};

declare namespace TwitchPlayer {
  class Player {
    constructor(playerDivID: string, options: PlayerOptions): this;
    setVolume(volume: number): void;
    setVideo(videoID: string, ts: number): void;
    setChannel(channelID: string): void;
    setCollection(collectionID: string, videoID: string): void;
    play(): void;
    pause(): void;
    seek(ts: number): void;
    setQuality(quality: string): void;
    setMuted(muted: boolean): void;

    getQualities(): string[];
    getVideo(): string;
    isPaused(): boolean;
    getEnded(): boolean;
    getDuration(): number;
    getCurrentTime(): number;
    getChannel(): string;
    getMuted(): boolean;
    getVolume(): number;

    addEventListener(eventName: string, cb: (...args: any[]) => void): void;
    removeEventListener(eventName: string, cb: (...args: any[]) => void): void;

    CAPTIONS: string;
    ENDED: string;
    PAUSE: string;
    PLAY: string;
    PLAYBACK_BLOCKED: string;
    PLAYING: string;
    OFFLINE: string;
    ONLINE: string;
    READY: string;
    SEEK: string;
  }

  type Twitch = {
    Player: Player;
  };
}

declare global {
  interface Window {
    Twitch: Twitch | undefined;
  }
}
