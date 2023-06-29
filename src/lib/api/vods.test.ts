import { ErrFetch } from "@/lib/errors";
import { getVodsByStreamer } from "./vods";

describe("api:vods", () => {
  test("getVods", async () => {
    const vods = await getVodsByStreamer("knekro");
    expect(vods.data.vods).toMatchSnapshot();
  });

  test("getVods:emptyBid", async () => {
    try {
      const vods = await getVodsByStreamer("");
      console.log(vods);
    } catch (e) {
      expect(e).toBeInstanceOf(ErrFetch);
      expect((e as ErrFetch).errors).toHaveLength(1);
      expect((e as ErrFetch).errors[0]).toBe("Missing username or vid");
    }
  });
});
