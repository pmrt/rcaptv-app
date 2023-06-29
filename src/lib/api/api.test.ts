import { getURL } from "@/lib/api/api";

describe("api:helpers", () => {
  test("getURL", () => {
    const url = import.meta.env.VITE_API_BASE_URL;
    const v = import.meta.env.VITE_API_VERSION;

    const endpoint = "/vods";
    const got = getURL(endpoint, { bid: "12345", first: "3" });
    const want = `${url}/${v}${endpoint}?bid=12345&first=3`;
    expect(got).toBe(want);
  });
});
