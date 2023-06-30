export const extractStreamer = (handle: string | undefined) =>
  handle?.[0] === "@" ? handle.slice(1, handle.length) : null;
