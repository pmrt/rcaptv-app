import { ErrResponse } from "@/lib/errors";
import { useQuery } from "@tanstack/react-query";
import { vodsByStreamerQuery } from "./lib";

type TimelineProps = {
  username: string;
};
export default function Timeline({ username }: TimelineProps) {
  const { data, isSuccess, isError } = useQuery(vodsByStreamerQuery(username));
  if (!isSuccess || isError) {
    return <h1>Timeline error:(</h1>;
  }

  if (data.errors.length > 0) {
    // throw with top error
    throw new ErrResponse(data.errors[0]);
  }

  console.log(data);
  return <h1>Timeline</h1>;
}
