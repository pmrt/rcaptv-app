import {
  lastVodByStreamerQuery,
  vodByVidQuery,
  type VODResponse,
} from "@/lib/api/vods";
import { ErrPageNotFound, ErrResponse } from "@/lib/errors";
import { wrapVodWithVODResponse } from "@/lib/utils";
import { QueryClient } from "@tanstack/react-query";
import { LoaderFunctionArgs, redirect } from "react-router-dom";
import { extractStreamer } from "./helpers";

// timelineByUserLoader is used when accessed by /@streamer. It fetches the VOD
// data, cache it for both: /@streamer and /@streamer/<vid> and redirects to
// /@streamer/<vid>
export const timelineByUserLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const streamer = extractStreamer(params.handle);
    if (!streamer) {
      // no @ at the start of the route
      throw new ErrPageNotFound("404 Page Not Found");
    }

    const query = lastVodByStreamerQuery(streamer);
    const cachedData: VODResponse | undefined = queryClient.getQueryData(
      query.queryKey
    );
    if (!cachedData) {
      const data = await queryClient.fetchQuery(query);
      const vod = query.select(data);
      if (!vod) {
        throw new ErrResponse(`Username '${streamer}' not found`);
      }
      // cache also the vod for when it is obtained directly by id
      queryClient.setQueryData(
        vodByVidQuery(vod.id).queryKey,
        wrapVodWithVODResponse(vod)
      );
      return redirect(`/@${streamer}/${vod.id}`);
    }
    const vod = query.select(cachedData);
    if (!vod) {
      throw new ErrResponse(`Cached data for ${streamer} is corrupted`);
    }
    return redirect(`/@${streamer}/${cachedData.data.vods[0].id}`);
  };

// timelineLoader is used when accessed directly by /@streamer/<vid>
export const timelineLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { vid } = params;
    if (!vid) {
      throw new TypeError("Missing vid");
    }
    return (
      queryClient.getQueryData(vodByVidQuery(vid).queryKey) ??
      (await queryClient.fetchQuery(vodByVidQuery(vid)))
    );
  };
