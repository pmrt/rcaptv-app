import { fetchOrFail, getURL } from "@/lib/api/api";

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
export const lastVodByStreamer = async (
  username: string
): Promise<VODResponse> =>
  await (await fetchOrFail(getURL("/vods", { username }))).json();

export const vodById = async (vid: string): Promise<VODResponse> =>
  await (await fetchOrFail(getURL("/vods", { vid }))).json();

export const prevVod = async (vid: string): Promise<VODResponse> =>
  await (await fetchOrFail(getURL("/vods", { after: vid }))).json();
