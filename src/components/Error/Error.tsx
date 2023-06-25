import { isError } from "@/lib/errors";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  if (!isError(error)) {
    throw new Error("unexpected error type");
  }
  return <div>Error: {error.message} </div>;
}
