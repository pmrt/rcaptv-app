import { ErrPageNotFound } from "@/lib/errors";
import { useParams } from "react-router-dom";
import Timeline from "./Timeline";
import { extractStreamer } from "./lib";

type CatchAllParams = {
  handle: string;
};
export default function CatchAllOrTimeline() {
  const { handle } = useParams<CatchAllParams>();
  if (!handle) {
    throw new TypeError("Missing handle");
  }
  const user = extractStreamer(handle);
  if (!user) {
    throw new ErrPageNotFound("404 Page Not Found");
  }
  return <Timeline username={user} />;
}
