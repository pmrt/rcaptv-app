import { clipsByVodQuery } from "@/lib/api/clips";
import { vodByVidQuery } from "@/lib/api/vods";
import { ErrPageError } from "@/lib/errors";
import { useAppDispatch } from "@/lib/hooks";
import { isRecentSearches } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Timeline from "./Timeline";
import VodsDisabled from "./VodsDisabled";
import {
  LSKEY_RECENT_SEARCHES,
  LSKEY_TIMELINE_LAST_SEARCH,
  MAX_RECENT_SEARCHES,
} from "./constants";
import { extractStreamer } from "./helpers";
import { setClips, setVod } from "./slice";

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

  const { data: vod, isSuccess: vodsOk } = useQuery(vodByVidQuery(vid));

  const {
    data: clipsResult,
    isSuccess: clipsOk,
    isLoading: isClipsLoading,
    isError: isClipsError,
    error: clipError,
  } = useQuery(clipsByVodQuery(vod));

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
        const all = clipsResult.data.clips;
        if (all.length > 0) {
          dispatch(setClips(all));
        }
      }
    },
    [dispatch, clipsOk, clipsResult?.data.clips]
  );

  useEffect(
    function addRecentSearches() {
      // only store search if we found clips
      if (!clipsOk) {
        return;
      }

      const val = localStorage.getItem(LSKEY_RECENT_SEARCHES);
      let recent: string[] = [];
      if (val) {
        const parsed = JSON.parse(val);
        if (!isRecentSearches(parsed)) {
          return;
        }
        recent = parsed;
      }
      const user = extractStreamer(handle);
      if (user) {
        if (recent.length >= MAX_RECENT_SEARCHES) {
          recent.shift();
        }
        // illojuan elbokeron null
        if (recent.includes(user)) {
          recent.splice(recent.indexOf(user), 1);
        }
        recent.push(user);
        localStorage.setItem(LSKEY_RECENT_SEARCHES, JSON.stringify(recent));
      }
    },
    [handle, clipsOk]
  );

  // Prevent inconsistent behaviour when /@handle/vid_id changes. If the user
  // changes only the @handle manually by rewriting the URL and the vid_id is
  // the same, redirect to the new @handle to get the new vid_id instead of using
  // the old vid_id.
  useEffect(() => {
    const laststr = window.localStorage.getItem(LSKEY_TIMELINE_LAST_SEARCH);
    if (laststr) {
      const last = JSON.parse(laststr);
      if (last?.vid === vid && last.handle !== handle) {
        navigate(`/${handle}`, { replace: true });
      }
    }
    window.localStorage.setItem(
      LSKEY_TIMELINE_LAST_SEARCH,
      JSON.stringify({ vid, handle })
    );
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
  }, [handle, clipsOk, vodsOk, navigate]);

  if (isClipsError) {
    throw clipError;
  }

  if (clipsOk) {
    const all = clipsResult.data.clips;
    if (all.length === 0) {
      return <VodsDisabled />;
    }
  }

  if (isClipsLoading) {
    return null;
    // return <h1>Loading clips...</h1>;
  }

  return (
    <>
      <Timeline user={extractStreamer(handle)} />
    </>
  );
}
