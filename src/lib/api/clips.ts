import { VOD } from "@/lib/api/vods";
import { fetchOrFail, getURL } from "./api";

export type Clip = {
  broadcaster_id: string;
  created_at: string;
  creator_name: string;
  duration: number;
  game_id: string;
  id: string;
  language: string;
  thumbnail_url: string;
  title: string;
  video_id: string;
  view_count: number;
  vod_offset: number | null;
};

export type ClipWithNonNullableVodOffset = Omit<Clip, "vod_offset"> & {
  vod_offset: number;
};

type ClipResponse = {
  data: {
    clips: Clip[];
  };
  errors: string[];
};
export const clipsByVod = async (vod: VOD): Promise<ClipResponse> =>
  await (
    await fetchOrFail(
      getURL("/clips", {
        bid: vod.user_id,
        started_at: vod.created_at,
        ended_at: addTime(
          new Date(vod.created_at),
          vod.duration_seconds
        ).toISOString(),
      })
    )
  ).json();

const addTime = (t: Date, sec: number) => new Date(t.getTime() + sec * 1000);

export const __test__ = {
  addTime,
};
