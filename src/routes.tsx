import ErrorPage from "@/components/Error";
import Layout from "@/components/Layout";
import { Timeline, preTimelineLoader } from "@/components/Timeline";
import { client } from "@/lib/client";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  redirect,
} from "react-router-dom";
import PreTimeline from "./components/Timeline/PreTimeline";
import { timelineLoader } from "./components/Timeline/loader";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<ErrorPage />}>
      <Route index element={<h1>Nothing to see here.</h1>} />
      <Route path="/about" element={<h1>About me</h1>} />
      <Route
        path="/:handle"
        element={<PreTimeline />}
        loader={preTimelineLoader(client)}
        errorElement={<ErrorPage />}
      />
      <Route
        path="/:handle/:vid"
        element={<Timeline />}
        loader={timelineLoader(client)}
      />
      <Route path="*" loader={() => redirect("/")} />
    </Route>
  )
);

export default router;
