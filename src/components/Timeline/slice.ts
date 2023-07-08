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
};

const timelineSlice = createSlice({
  name: "timeline",
  initialState: initialState,
  reducers: {
    setTime(state, action: PayloadAction<number | string>) {
      const s =
        typeof action.payload === "string"
          ? parseInt(action.payload, 10)
          : action.payload;
      state.time.seconds = s;
      state.time.duration = duration(s);
      state.time.prettyDuration = prettyDuration(s);
    },
    showPlayer(state) {
      state.player.isForeground = true;
    },
    hidePlayer(state) {
      state.player.isForeground = false;
    },
    setTimeAndShowPlayer(state, action: PayloadAction<number | string>) {
      timelineSlice.caseReducers.setTime(state, action);
      timelineSlice.caseReducers.showPlayer(state);
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
  showPlayer,
  hidePlayer,
  setThresholdArea,
  setThresholdAreaSeconds,
  setTimeAndShowPlayer,
} = timelineSlice.actions;

export const selectTime = (state: RootState) => state.timeline.time;
export const selectThresholdArea = (state: RootState) =>
  state.timeline.thresholdArea;
export const selectPlayer = (state: RootState) => state.timeline.player;

export default timelineSlice.reducer;
