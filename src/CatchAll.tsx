import { useParams } from "react-router-dom";
import Timeline from "./components/Timeline";
import { ErrPageNotFound } from "./lib/errors";

type CatchAllParams = {
  handle: string;
};
export default function CatchAll() {
  const params = useParams<CatchAllParams>();
  const user = params.handle || "";
  if (user[0] !== "@") {
    throw new ErrPageNotFound("404 Page Not Found");
  }
  return <Timeline user={user.slice(1, user.length)} />;
}
