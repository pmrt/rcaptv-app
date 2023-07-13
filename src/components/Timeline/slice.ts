import { Clip, ClipWithNonNullableVodOffset } from "@/lib/api/clips";
import { VOD } from "@/lib/api/vods";
import { RootState } from "@/store";
import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { duration, prettyDuration } from "./helpers";

interface TimelineState {
  time: {
    seconds: number;
    // last time was set because a pause.
    isTimeFromPause: boolean;
  };
  player: {
    isForeground: boolean;
    isPaused: boolean;
  };
  thresholdArea: {
    seconds: number;
    min: number;
  };
  status: {
    error: {
      message: string;
      type: string;
    };
    isPlayerLoading: boolean;
    isPlayerReady: boolean;
  };
  vods: {
    anchor: VOD | null;
  };
  clips: {
    all: Clip[];
  };
}

const initialState: TimelineState = {
  time: {
    seconds: 0,
    isTimeFromPause: false,
  },
  player: {
    isForeground: false,
    isPaused: true,
  },
  thresholdArea: {
    seconds: 0,
    min: 100,
  },
  status: {
    error: {
      message: "",
      type: "",
    },
    isPlayerLoading: false,
    isPlayerReady: false,
  },
  vods: {
    anchor: null,
  },
  clips: {
    all: [],
  },
};

const VOD_DURATION_CORRECTION = 13;

const timelineSlice = createSlice({
  name: "timeline",
  initialState: initialState,
  reducers: {
    setTime(state, action: PayloadAction<number>) {
      // range: [0, duration_seconds-VOD_DURATION_CORRECTION]
      // Note: see setVod to see why
      const s = Math.min(
        Math.max(0, action.payload),
        state.vods.anchor?.duration_seconds ?? 0
      );
      state.time.seconds = s;
    },
    // setInitialTime is like setTime, but only sets the time if the current
    // time is 0. This prevents overriding time if e.g. user has changed the
    // time before the player has loaded
    setInitialTime(state, action: PayloadAction<number>) {
      if (state.time.seconds === 0) {
        timelineSlice.caseReducers.setTime(state, action);
      }
    },
    setTimeAndShowPlayer(state, action: PayloadAction<number>) {
      timelineSlice.caseReducers.setTime(state, action);
      state.player.isForeground = true;
    },
    setTimeAndHidePlayer(state, action: PayloadAction<number>) {
      timelineSlice.caseReducers.setTime(state, action);
      state.player.isForeground = false;
    },
    setTimeAndLoading(state, action: PayloadAction<number>) {
      timelineSlice.caseReducers.setTime(state, action);
      state.status.isPlayerLoading = true;
    },
    setPause(state, action: PayloadAction<number>) {
      state.player.isPaused = true;
      state.time.isTimeFromPause = true;
      timelineSlice.caseReducers.setTimeAndHidePlayer(state, action);
    },
    setPlaying(state) {
      state.player.isForeground = true;
      state.player.isPaused = false;
      state.status.isPlayerLoading = false;
      timelineSlice.caseReducers.resetError(state);
    },
    setIsTimeFromPause(state, action: PayloadAction<boolean>) {
      state.time.isTimeFromPause = action.payload;
    },
    setVod(state, action: PayloadAction<VOD>) {
      // Note: we substract Xs to the duration to prevent the user from
      // clicking on the actual end of the stream, which would cause a weird
      // state where twitch tries to load the next VOD and this action is
      // uncancellable. Note that this behaviour still occurs if the end is
      // reached in the twitch player, this only prevents it in our timeline
      // bar.
      const clone = Object.assign({}, action.payload);
      clone.duration_seconds -= VOD_DURATION_CORRECTION;
      state.vods.anchor = clone;
    },
    setClips(state, action: PayloadAction<Clip[]>) {
      state.clips.all = action.payload;
    },
    showPlayer(state) {
      state.player.isForeground = true;
    },
    hidePlayer(state) {
      state.player.isForeground = false;
    },
    setError(
      state,
      action: PayloadAction<{
        message: string;
        type: string;
      }>
    ) {
      state.status.error = action.payload;
    },
    resetError(state) {
      state.status.error.message = "";
      state.status.error.type = "";
    },
    setPlayerLoadingAndNotReady(state) {
      state.status.isPlayerLoading = true;
      state.status.isPlayerReady = false;
    },
    setIsPlayerLoading(state, action: PayloadAction<boolean>) {
      state.status.isPlayerLoading = action.payload;
    },
    setPlayerReady(state) {
      state.status.isPlayerReady = true;
      state.status.isPlayerLoading = false;
    },
    setThresholdAreaNearThreshold(state, action: PayloadAction<number>) {
      const threshold = action.payload;
      const min =
        ((state.vods.anchor?.duration_seconds ?? 0) * threshold) / 100;
      state.thresholdArea.seconds = min;
      state.thresholdArea.min = min;
    },
    setThresholdAreaSeconds(state, action: PayloadAction<number>) {
      state.thresholdArea.seconds = action.payload;
    },
  },
});

export const {
  setTime,
  setTimeAndLoading,
  setInitialTime,
  setTimeAndShowPlayer,
  setTimeAndHidePlayer,
  showPlayer,
  hidePlayer,
  setThresholdAreaNearThreshold,
  setThresholdAreaSeconds,
  setError,
  resetError,
  setPlayerLoadingAndNotReady,
  setIsPlayerLoading,
  setPlayerReady,
  setPause,
  setPlaying,
  setVod,
  setClips,
  setIsTimeFromPause,
} = timelineSlice.actions;

export const selectTimeSeconds = (state: RootState) =>
  state.timeline.time.seconds;
export const selectTimeDuration = (state: RootState) =>
  duration(state.timeline.time.seconds);
export const selectTimePrettyDuration = (state: RootState) =>
  prettyDuration(state.timeline.time.seconds);
export const selectThresholdAreaSeconds = (state: RootState) =>
  state.timeline.thresholdArea.seconds;
export const selectThresholdAreaMin = (state: RootState) =>
  state.timeline.thresholdArea.min;
export const selectPlayerIsForeground = (state: RootState) =>
  state.timeline.player.isForeground;
export const selectStatusError = (state: RootState) =>
  state.timeline.status.error;
export const selectStatusIsPlayerLoading = (state: RootState) =>
  state.timeline.status.isPlayerLoading;
export const selectStatusIsPlayerReady = (state: RootState) =>
  state.timeline.status.isPlayerReady;
export const selectIsTimeFromPause = (state: RootState) =>
  state.timeline.time.isTimeFromPause;
export const selectVodsAnchor = (state: RootState) =>
  state.timeline.vods.anchor;
export const selectAllClips = (state: RootState) => state.timeline.clips.all;
export const selectVODClips = createSelector(
  selectAllClips,
  selectVodsAnchor,
  (clips, vod): ClipWithNonNullableVodOffset[] => {
    if (vod === null) {
      return [];
    }
    return clips.filter(
      (c): c is ClipWithNonNullableVodOffset =>
        !!c.vod_offset && c.video_id === vod.id
    );
  }
);
export const selectTopOffset = (state: RootState) =>
  selectVODClips(state)[0]?.vod_offset ?? 0;
export const selectContextualClips = createSelector(
  selectVODClips,
  selectTimeSeconds,
  selectThresholdAreaSeconds,
  (clips, time, thresholdAreaSec) =>
    clips
      .filter(
        (c) =>
          c.vod_offset >= time - thresholdAreaSec &&
          c.vod_offset <= time + thresholdAreaSec
      )
      .sort((a, b) => a.vod_offset - b.vod_offset)
);

export default timelineSlice.reducer;
