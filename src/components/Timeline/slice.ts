import { RootState } from "@/store";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CLIP_NEAR_THRESHOLD } from "./constants";
import { duration, prettyDuration } from "./helpers";

interface TimelineState {
  time: {
    seconds: number;
    duration: string;
    prettyDuration: string;
  };
  player: {
    isForeground: boolean;
  };
  thresholdArea: {
    seconds: number;
    min: number;
  };
  status: {
    error: string;
    isPlayerLoading: boolean;
    isPlayerReady: boolean;
  };
}

const initialState: TimelineState = {
  time: {
    seconds: 0,
    duration: "0h:0m:0s",
    prettyDuration: "0s",
  },
  player: {
    isForeground: false,
  },
  thresholdArea: {
    seconds: 0,
    min: 100,
  },
  status: {
    error: "",
    isPlayerLoading: false,
    isPlayerReady: false,
  },
};

const timelineSlice = createSlice({
  name: "timeline",
  initialState: initialState,
  reducers: {
    setTime(state, action: PayloadAction<number>) {
      state.time.seconds = action.payload;
      state.time.duration = duration(action.payload);
      state.time.prettyDuration = prettyDuration(action.payload);
    },
    setTimeAndShowPlayer(state, action: PayloadAction<number>) {
      state.time.seconds = action.payload;
      state.time.duration = duration(action.payload);
      state.time.prettyDuration = prettyDuration(action.payload);
      state.player.isForeground = true;
    },
    setTimeAndLoading(state, action: PayloadAction<number>) {
      state.time.seconds = action.payload;
      state.time.duration = duration(action.payload);
      state.time.prettyDuration = prettyDuration(action.payload);
      state.status.isPlayerLoading = true;
    },
    showPlayer(state) {
      state.player.isForeground = true;
    },
    hidePlayer(state) {
      state.player.isForeground = false;
    },
    setError(state, action: PayloadAction<string>) {
      state.status.error = action.payload;
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
    setPlaying(state) {
      state.player.isForeground = true;
      state.status.error = "";
      state.status.isPlayerLoading = false;
    },
    setThresholdArea(
      state,
      action: PayloadAction<{
        areaSeconds: number;
        vodDurationSeconds: number;
      }>
    ) {
      state.thresholdArea.seconds = action.payload.areaSeconds;
      state.thresholdArea.min =
        (action.payload.vodDurationSeconds * CLIP_NEAR_THRESHOLD) / 100;
    },
    setThresholdAreaSeconds(state, action: PayloadAction<number>) {
      state.thresholdArea.seconds = action.payload;
    },
  },
});

export const {
  setTime,
  setTimeAndLoading,
  showPlayer,
  hidePlayer,
  setThresholdArea,
  setThresholdAreaSeconds,
  setTimeAndShowPlayer,
  setError,
  setPlayerLoadingAndNotReady,
  setIsPlayerLoading,
  setPlayerReady,
  setPlaying,
} = timelineSlice.actions;

export const selectTime = (state: RootState) => state.timeline.time;
export const selectThresholdArea = (state: RootState) =>
  state.timeline.thresholdArea;
export const selectPlayer = (state: RootState) => state.timeline.player;
export const selectStatus = (state: RootState) => state.timeline.status;

export default timelineSlice.reducer;
