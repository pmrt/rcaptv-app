import ErrorPage from "@/components/Error";
import Layout from "@/components/Layout";
import { CatchAllOrTimeline, timelineLoader } from "@/components/Timeline";
import { client } from "@/lib/client";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<ErrorPage />}>
      <Route index element={<h1>Nothing to see here.</h1>} />
      <Route path="/about" element={<h1>About me</h1>} />
      <Route
        path=":handle"
        element={<CatchAllOrTimeline />}
        loader={timelineLoader(client)}
        errorElement={<ErrorPage />}
      />
    </Route>
  )
);

export default router;
