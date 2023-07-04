import { type VOD } from "@/lib/api/vods";

import { noop, range } from "@/lib/utils";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import { ClipWithNonNullableVodOffset } from "@/lib/api/clips";
import { colorize } from "@/lib/colorize";
import { useDebounce } from "rooks";
import "./TimelineBar.scss";

type TimelineBarProps = {
  clips: ClipWithNonNullableVodOffset[];
  vod: VOD;
  nearThreshold: number;
  onTimeMarkChange?: (seconds: number, duration: string) => void;
};

const TimelineBar = ({
  clips,
  vod,
  onTimeMarkChange = noop,
  nearThreshold,
}: TimelineBarProps) => {
  const colorInterp = colorize(
    // clips is ordered from high view count to low, so we invert the colors:
    //high
    [255, 96, 141],
    // low
    [255, 208, 96],
    clips.map((c) => c.view_count)
  );

  // TODO - usePxInterpolation and useVODCursor should be in the same hook
  const pxInterpObj = usePxInterpolation<HTMLDivElement>(
    vod.duration_seconds,
    0,
    -4
  );
  const { ref: outerRef, toWidthPx } = pxInterpObj;
  const {
    ref: cursorRef,
    refMarker: cursorMarkerRef,
    timeMark,
  } = useVODCursor(pxInterpObj);

  useEffect(() => {
    if (cursorRef.current) {
      const thresholdArea = (vod.duration_seconds * nearThreshold) / 100;
      cursorRef.current.style.setProperty(
        "--threshold-width",
        `${toWidthPx(thresholdArea)}px`
      );
    }
  }, [cursorRef, nearThreshold, toWidthPx, vod.duration_seconds]);

  useEffect(() => {
    onTimeMarkChange(timeMark.seconds, timeMark.duration);
  }, [timeMark.duration, timeMark.seconds, onTimeMarkChange]);
  return (
    <aside className="timeline-bar">
      <div className="timeline-box">
        <span className="cursor-marker" ref={cursorMarkerRef} />
        <div className="outer" ref={outerRef}>
          <div className="cursor" ref={cursorRef}>
            <span className="cursor-threshold-area-left" />
            <span className="cursor-threshold-area-right" />
          </div>
          {clips.map((clip, i) => (
            <article
              key={clip.id}
              className="clip-bar"
              style={{
                left: toWidthPx(clip.vod_offset),
                width: toWidthPx(clip.duration),
                backgroundColor: `rgb(${colorInterp(i)})`,
              }}
            ></article>
          ))}
        </div>
      </div>
    </aside>
  );
};

export type TimeMark = {
  seconds: number;
  duration: string;
};

type VODCursorObj<T extends HTMLElement> = {
  ref: RefObject<T>;
  refMarker: RefObject<T>;
  timeMark: TimeMark;
};
// VOD Cursor, requires usePxInterpolation hook.
function useVODCursor<T extends HTMLElement>(
  pxInterpObj: PxInterpObj<T>
): VODCursorObj<T> {
  const {
    ref: outerRef,
    toTimeMark,
    toWidthPx,
    dimensions: parentDims,
  } = pxInterpObj;
  const cursorRef = useRef<T>(null);
  const cursorMarkerRef = useRef<T>(null);
  const [timeMark, setTimeMark] = useState(0);

  // update offset when hook is re-run
  if (cursorRef.current) {
    cursorRef.current.style.left = `${toWidthPx(timeMark)}px`;
  }
  if (cursorMarkerRef.current) {
    cursorMarkerRef.current.style.left = `${toWidthPx(timeMark)}px`;
  }

  useEffect(() => {
    const el = cursorRef.current;
    const elMarker = cursorMarkerRef.current;
    const parent = outerRef.current;
    const width = el?.getBoundingClientRect().width ?? 0;
    let isDragging = false;

    const cursorUpdate = (evt: MouseEvent) => {
      const { offsetX, target, type, clientX } = evt;
      if (!el || !elMarker) return;

      switch (type) {
        case "mousedown":
          isDragging = true;
          // el.style.transform = `scale(1.2)`;
          if (target !== parent) return;
          el.style.left = `${Math.round(offsetX - width / 2)}px`;
          elMarker.style.left = `${Math.round(offsetX - width / 2)}px`;
          break;
        case "mousemove":
          if (isDragging) {
            const px = Math.max(
              Math.min(
                Math.round(clientX - parentDims.left),
                parentDims.width - width
              ),
              0
            );
            el.style.left = `${px}px`;
            elMarker.style.left = `${px}px`;
          }
          break;
        case "mouseup":
          isDragging = false;
          // el.style.transform = `scale(1)`;
          setTimeMark(toTimeMark(parseInt(el.style.left, 10)));
          break;
      }
    };
    if (parent) {
      parent.addEventListener("mousedown", cursorUpdate);
      window.addEventListener("mousemove", cursorUpdate);
      window.addEventListener("mouseup", cursorUpdate);
    }
    return () => {
      if (parent) {
        parent.removeEventListener("mousedown", cursorUpdate);
        window.removeEventListener("mousemove", cursorUpdate);
        window.removeEventListener("mouseup", cursorUpdate);
      }
    };
  }, [toWidthPx, toTimeMark, parentDims.left, parentDims.width, outerRef]);

  return {
    ref: cursorRef,
    refMarker: cursorMarkerRef,
    timeMark: {
      seconds: timeMark,
      duration: prettyDuration(timeMark),
    },
  };
}

type PxInterpObj<T extends HTMLElement> = {
  ref: React.RefObject<T>;
  toWidthPx: (d: number) => number;
  toHeightPx: (d: number) => number;
  toTimeMark: (px: number) => number;
  dimensions: {
    width: number;
    height: number;
    left: number;
  };
};
// usePxInterpolation takes a given max duration and a max view count and
// returns a react reference and two toPx functions: toWidthPx and toHeightPx.
// When an element is set to the given react reference, the hook will use the
// actual size in both dimensions: width and height of the element for the
// interpolation with the duration in the width dimension and the view count in
// the height dimension.

// In other words, both toWidthPx(d) and toHeightPx(v) will take a given
// duration or a view count, let's say a total duration of 100s with a
// WidthxHeight = 1000x1000px, and each function will return the value in
// pixels in the range of their dimension [0,width] or [0,height] (depending on
// the function used), that corresponds to the range of the value in the
// duration range [0, total_duration]. For example, for the values above, if we
// pass a d=50s, toWidthPx(d), it would return 500 (pixels) because 50s in the
// range of [0,100s] corresponds to 500px in the range of [0,1000px]
//
// The hook will cause a re-render with the corrected values if the window is
// resized, using the new values of height and width
function usePxInterpolation<T extends HTMLElement>(
  maxDuration: number,
  maxViewCount: number,
  widthCorrection: number
): PxInterpObj<T> {
  const ref = useRef<T>(null);
  const [dim, setDim] = useState({ width: 0, height: 0, left: 0 });

  const toWidthPx = useCallback(
    (d: number) => range(0, maxDuration, 0, dim.width + widthCorrection, d),
    [maxDuration, dim.width]
  );
  const toHeightPx = useCallback(
    (d: number) => range(0, maxViewCount, 0, dim.height, d),
    [maxViewCount, dim.height]
  );
  const toTimeMark = useCallback(
    (px: number) =>
      Math.round(range(0, dim.width + widthCorrection, 0, maxDuration, px)),
    [dim.width, maxDuration]
  );
  const updateSize = useDebounce(() => {
    if (ref.current) {
      const { width, height, left } = ref.current.getBoundingClientRect();
      setDim({
        width,
        height,
        left,
      });
    }
  }, 1000);
  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  return {
    ref,
    toWidthPx,
    toHeightPx,
    toTimeMark,
    dimensions: dim,
  };
}

const prettyDuration = (seconds: number) => {
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

export default TimelineBar;
