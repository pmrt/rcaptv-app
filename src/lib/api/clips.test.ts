import { getClipsByVod, __test__ as t } from "./clips";

describe("getClips:helpers", () => {
  test("addTime", () => {
    const d = t.addTime(new Date("2023-06-27T16:39:55Z"), 60 * 60);
    expect(d.toISOString()).toBe("2023-06-27T17:39:55.000Z");
  });
});

describe("api", () => {
  test("getClips", async () => {
    const clips = await getClipsByVod({
      id: "1856303227",
      user_id: "152633332",
      stream_id: "46977536044",
      created_at: "2023-06-26T15:07:30Z",
      published_at: "2023-06-26T15:07:30Z",
      language: "es",
      title: "ONLY CUAJADO| Empezamos la semana sin tilteos  | !eneba",
      thumbnail_url:
        "https://static-cdn.jtvnw.net/cf_vods/dgeft87wbj63p/3207b5118aab280a2c7d_knekro_46977536044_1687792045//thumb/thumb0-%{width}x%{height}.jpg",
      view_count: 213601,
      duration_seconds: 34740,
    });
    if (clips.errors.length > 0) {
      throw new Error(clips.errors[0]);
    }

    const clipsJson = await import("@test/fixtures/clips_vod_1856303227.json");
    const wantIds = clipsJson.default.map((c) => c.id);

    // We will match only a give ids from the ss since clips are very unstable
    let matches = 0;
    clips.data.clips.forEach((clip) => {
      if (wantIds.includes(clip.id)) {
        matches++;
      }
    });

    expect(matches).toBeGreaterThanOrEqual(3);
  });
});
