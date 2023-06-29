import { LoaderFunction } from "react-router-dom";

export type LoaderData<TLoaderFn extends LoaderFunction> = Awaited<
  ReturnType<TLoaderFn>
> extends Response | infer D
  ? D
  : never;

export interface LoaderFunction<T> {
  (args: LoaderFunctionArgs): Promise<Response<T>>;
}
