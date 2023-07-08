import { configureStore } from "@reduxjs/toolkit";

import { timelineReducer } from "@/components/Timeline";

export const store = configureStore({
  reducer: {
    timeline: timelineReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
