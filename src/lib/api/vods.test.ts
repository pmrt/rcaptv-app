import { ErrFetch } from "@/lib/errors";
import { lastVodByStreamer, prevVod, vodById } from "./vods";

describe("api:vods", () => {
  test("lastVodByStreamer", async () => {
    const vods = await lastVodByStreamer("knekro");
    expect(vods.data.vods).toMatchSnapshot();
  });

  test("lastVodByStreamer:emptyBid", async () => {
    try {
      const vods = await lastVodByStreamer("");
      console.log(vods);
    } catch (e) {
      expect(e).toBeInstanceOf(ErrFetch);
      expect((e as ErrFetch).errors).toHaveLength(1);
      expect((e as ErrFetch).errors[0]).toBe("Missing username, after or vid");
    }
  });

  test("vodById", async () => {
    const vod = await vodById("1857217060");
    expect(vod.data.vods).toMatchSnapshot();
  });

  test("prevVod", async () => {
    const vod = await prevVod("1857217060");
    expect(vod.data.vods).toMatchSnapshot();
  });
});
