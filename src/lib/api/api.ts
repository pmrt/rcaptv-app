import { ErrFetch } from "@/lib/errors";

const APIBaseURL = import.meta.env.VITE_API_BASE_URL;
const APIVersion = import.meta.env.VITE_API_VERSION;

type URLParams = Record<string, string>;
export const getURL = (endpoint: string, params?: URLParams) => {
  const url = new URL(`/${APIVersion}${endpoint}`, APIBaseURL);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.append(key, value)
    );
  }
  return url.toString();
};

export const fetchOrFail = async (url: string) => {
  let resp;
  try {
    resp = await fetch(url);
  } catch (e) {
    throw new ErrFetch(
      "Error while fetching, network failure or incorrect request"
    );
  }
  if (!resp.ok) {
    throw await new ErrFetch("").asyncResp(resp);
  }
  return resp;
};
