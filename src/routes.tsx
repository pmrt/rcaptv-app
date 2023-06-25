import ErrorPage from "@/components/Error";
import Layout from "@/components/Layout";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import CatchAll from "./CatchAll";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<ErrorPage />}>
      <Route index element={<h1>Nothing to see here.</h1>} />
      <Route path="/about" element={<h1>About me</h1>} />
      <Route path=":handle" element={<CatchAll />} />
    </Route>
  )
);

export default router;
