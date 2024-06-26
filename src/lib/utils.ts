import { type VOD, type VODResponse } from "@/lib/api/vods";

export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;
export const invlerp = (x: number, y: number, a: number) =>
  clamp((a - x) / (y - x));
export const clamp = (a: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, a));
export const range = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  a: number
) => lerp(x2, y2, invlerp(x1, y1, a));

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};

export const wrapVodWithVODResponse = (vod: VOD): VODResponse => ({
  data: {
    vods: [vod],
  },
  errors: [],
});

export function isRecentSearches(obj: unknown): obj is string[] {
  return Array.isArray(obj);
}
