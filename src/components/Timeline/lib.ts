import { getVodsByStreamer } from "@/lib/api/vods";
import { QueryClient } from "@tanstack/react-query";
import { LoaderFunctionArgs, json } from "react-router-dom";

export const vodsByStreamerQuery = (username: string) => ({
  queryKey: ["vods", username],
  queryFn: () => getVodsByStreamer(username),
});

export const timelineLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { handle } = params;
    if (!handle) {
      throw new TypeError("Missing handle");
    }
    const streamer = extractStreamer(handle);
    if (!streamer) {
      return json({ vods: [], errors: ["Handle is not a username"] });
    }

    const query = vodsByStreamerQuery(streamer);
    return (
      queryClient.getQueryData(query.queryKey) ??
      (await queryClient.fetchQuery(query))
    );
  };

export const extractStreamer = (handle: string) =>
  handle[0] === "@" ? handle.slice(1, handle.length) : null;
