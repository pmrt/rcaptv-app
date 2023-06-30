import { ErrFetch, RcapError } from "@/lib/errors";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as RcapError;
  if (error instanceof ErrFetch && error.errors.length > 0) {
    return (
      <div className="fetch-error-list">
        <ul>
          {error.errors.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    );
  }
  return <div>{error.message}</div>;
}
