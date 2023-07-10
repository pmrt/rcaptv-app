import { clipsByVod } from "@/lib/api/clips";
import { type VOD, type VODResponse } from "@/lib/api/vods";
import { ErrPageError } from "@/lib/errors";
import { useAppDispatch } from "@/lib/hooks";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Timeline from "./Timeline";
import VodsDisabled from "./VodsDisabled";
import { extractStreamer } from "./helpers";
import { vodByVidQuery } from "./loader";
import { setClips, setVod } from "./slice";

const clipsByVodQuery = (vod: VOD) => ({
  queryKey: ["clips", vod],
  queryFn: () => clipsByVod(vod),
});

type TimelinePageParams = {
  handle: string;
  vid: string;
};
export default function TimelinePage() {
  const dispatch = useAppDispatch();

  const { vid, handle } = useParams<TimelinePageParams>();
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

  useEffect(
    function updateVodsState() {
      if (vodsOk) {
        dispatch(setVod(vod));
      }
    },
    [dispatch, vod, vodsOk]
  );

  useEffect(
    function updateClipsState() {
      if (clipsOk) {
        const all = clipsResult.data?.data.clips;
        if (all) {
          dispatch(setClips(all));
        }
      }
    },
    [dispatch, clipsOk, clipsResult.data?.data.clips]
  );

  // Prevent inconsistent behaviour when /@handle/vid_id changes. If the user
  // changes only the @handle manually by rewriting the URL and the vid_id is
  // the same, redirect to the new @handle to get the new vid_id instead of using
  // the old vid_id.
  useEffect(() => {
    const lsKey = `timeline_last_search`;
    const laststr = window.localStorage.getItem(lsKey);
    if (laststr) {
      const last = JSON.parse(laststr);
      if (last?.vid === vid && last.handle !== handle) {
        navigate(`/${handle}`, { replace: true });
      }
    }
    window.localStorage.setItem(lsKey, JSON.stringify({ vid, handle }));
  }, [vid, handle, navigate]);
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
    throw clipsResult.error;
  }

  if (clipsOk) {
    const all = clipsResult.data.data.clips;
    if (all.length === 0) {
      return <VodsDisabled />;
    }
  }

  if (isClipsLoading) {
    return <h1>Loading clips...</h1>;
  }

  return (
    <>
      <Timeline user={extractStreamer(handle)} />
    </>
  );
}
