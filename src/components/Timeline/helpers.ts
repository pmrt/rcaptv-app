export const extractStreamer = (handle: string | undefined) =>
  handle?.[0] === "@" ? handle.slice(1, handle.length) : null;

export const prettyDuration = (seconds: number) => {
  const t = new Date(0);
  t.setHours(0);
  t.setMinutes(0);
  t.setSeconds(seconds);
  let str = "";
  const [h, m, s] = [t.getHours(), t.getMinutes(), t.getSeconds()];

  if (h != 0) {
    str += `${h}h`;
  }
  if (m != 0) {
    str += `${m}m`;
  }
  if (s != 0) {
    str += `${s}s`;
  }

  return str;
};
