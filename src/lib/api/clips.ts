import { VOD } from "@/lib/api/vods";
import { QueryFunction } from "@tanstack/react-query";
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
export const clipsByVod: QueryFunction<ClipResponse, [string, VOD]> = async ({
  queryKey,
  signal,
}) => {
  const vod = queryKey[1];
  return await (
    await fetchOrFail({
      url: getURL("/hx/clips", {
        bid: vod.user_id,
        started_at: vod.created_at,
        ended_at: addTime(
          new Date(vod.created_at),
          vod.duration_seconds
        ).toISOString(),
      }),
      signal,
    })
  ).json();
};

export const clipsByVodQuery = (vod: VOD | undefined) => ({
  queryKey: ["clips", vod] as [string, VOD],
  queryFn: clipsByVod,
  // run query only when we have a valid vod
  enabled: !!vod,
});

const addTime = (t: Date, sec: number) => new Date(t.getTime() + sec * 1000);

export const __test__ = {
  addTime,
};
