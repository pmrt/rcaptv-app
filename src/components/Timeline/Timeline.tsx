import { clipsByVod, type Clip } from "@/lib/api/clips";
import { type VOD, type VODResponse } from "@/lib/api/vods";
import { ErrPageError } from "@/lib/errors";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VodsDisabled from "./VodsDisabled";
import { vodByVidQuery } from "./loader";

const clipsByVodQuery = (vod: VOD) => ({
  queryKey: ["clips", vod],
  queryFn: () => clipsByVod(vod),
});

type TimelineParams = {
  handle: string;
  vid: string;
};
export default function Timeline() {
  const { vid, handle } = useParams<TimelineParams>();
  const navigate = useNavigate();
  if (!vid) {
    throw new ErrPageError("Missing vid in the URL");
  }
  const { data: vodsData, isSuccess: vodsOk } = useQuery(vodByVidQuery(vid));
  const vod = (vodsData as VODResponse).data.vods[0];
  const clipsResult = useQuery({
    // vodsResults.data is never undefined because of vodsResult.isSuccess. Also
    // when no vods are found, 404 error is returned by server, data.vods[0] is
    // only accessed when 200 is returned and there are vods available
    ...clipsByVodQuery(vod),
    enabled: vodsOk,
  });
  const {
    isSuccess: clipsOk,
    isLoading: isClipsLoading,
    isError: isClipsError,
  } = clipsResult;

  useEffect(() => {
    // This prevents inconsistent behaviour when handle changes
    //
    // Step 1. User is in /@handle-A/vodid-A
    // Step 2. User manually changes @handle-A to @handle-B
    // Step 3. User is now in /@handle-B/vodid-A. VOD/Clips shown are for vodid-A,
    // despite VOD/Clips belonging to handle-A
    //
    // To fix this, if handle changes, we redirect to the new handle
    if (vodsOk && clipsOk) {
      navigate(`/${handle}`, { replace: true });
    }
  }, [handle, vodsData, clipsOk, vodsOk, navigate]);

  if (isClipsError) {
    return <h1>Error clips</h1>;
  }

  let clips: Clip[] = [];
  if (clipsOk) {
    const all = clipsResult.data.data.clips;
    clips = all.filter((c) => c.video_id === vid);
    if (clips.length === 0) {
      return <VodsDisabled />;
    }
  }

  if (isClipsLoading) {
    return <h1>Loading clips...</h1>;
  }

  return (
    <>
      <h1>Timeline</h1>
      {vodsOk ? <h2>{vod.title}</h2> : <h2>Loading...</h2>}
      <ul>
        {clips.map((c) => (
          <li key={c.id}>{c.title}</li>
        ))}
      </ul>
    </>
  );
}
