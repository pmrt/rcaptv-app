import { fetchOrFail, getURL } from "@/lib/api/api";
import { QueryFunction, QueryFunctionContext } from "@tanstack/react-query";

export type VOD = {
  id: string;
  user_id: string;
  stream_id: string;
  created_at: string;
  published_at: string;
  language: string;
  title: string;
  thumbnail_url: string;
  view_count: number;
  duration_seconds: number;
};
export type VODResponse = {
  data: {
    vods: VOD[];
  };
  errors: string[];
};

export const lastVodByStreamer: QueryFunction<
  VODResponse,
  [string, string]
> = async ({ queryKey, signal }): Promise<VODResponse> =>
  await (
    await fetchOrFail({
      url: getURL("/vods", { username: queryKey[1] }),
      signal,
    })
  ).json();

export const lastVodByStreamerQuery = (username: string) => ({
  queryKey: ["vod", username] as [string, string],
  queryFn: lastVodByStreamer,
  select: (data: VODResponse) => data.data.vods?.[0],
});

export const vodById: QueryFunction<VODResponse, [string, string]> = async ({
  queryKey,
  signal,
}) =>
  await (
    await fetchOrFail({
      url: getURL("/vods", { vid: queryKey[1] }),
      signal,
    })
  ).json();

export const vodByVidQuery = (vid: string) => ({
  queryKey: ["vod", vid] as [string, string],
  queryFn: vodById,
  select: (data: VODResponse) => data.data.vods?.[0],
});

export const prevVod: QueryFunction<VODResponse, [string, string]> = async ({
  queryKey,
  signal,
}) =>
  await (
    await fetchOrFail({
      url: getURL("/vods", { after: queryKey[1] }),
      signal: signal,
    })
  ).json();

export const prevVodQuery = (after: string) => ({
  queryKey: ["vod", after] as [string, string],
  queryFn: (ctx: QueryFunctionContext<[string, string]>) => prevVod(ctx),
});
