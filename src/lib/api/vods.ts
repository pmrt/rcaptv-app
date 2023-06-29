import { fetchOrFail, getURL } from "@/lib/api/api";
import { ErrFetch } from "@/lib/errors";

type VOD = {
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
type VODResponse = {
  data: {
    vods: VOD[];
  };
  errors: string[];
};
export const getVodsByStreamer = async (
  username: string
): Promise<VODResponse> => {
  const resp = await fetchOrFail(getURL("/vods", { username }));
  if (!resp.ok) {
    throw await new ErrFetch("").asyncResp(resp);
  }
  return resp.json();
};
