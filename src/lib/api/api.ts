import { ErrFetch } from "@/lib/errors";

const APIBaseURL = import.meta.env.VITE_API_BASE_URL;
const APIEndpoint = import.meta.env.VITE_API_ENDPOINT;

type URLParams = Record<string, string>;
export const getURL = (endpoint: string, params?: URLParams) => {
  const url = new URL(`${APIEndpoint}${endpoint}`, APIBaseURL);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.append(key, value)
    );
  }
  return url.toString();
};

type FetchOrFailParams = {
  signal?: AbortSignal;
  url: string;
};

export const fetchOrFail = async (params: FetchOrFailParams) => {
  let resp;
  try {
    resp = await fetch(params.url, {
      signal: params.signal,
      credentials: 'include',
    });
  } catch (e) {
    console.error(e)
    throw new ErrFetch(
      "Error while fetching, network failure or incorrect request"
    );
  }
  if (!resp.ok) {
    throw await new ErrFetch("").asyncResp(resp);
  }
  return resp;
};
