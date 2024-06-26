import { range } from "@/lib/utils";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import { colorize } from "@/lib/colorize";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useDebounce } from "rooks";
import "./TimelineBar.scss";
import {
  selectPlayerIsForeground,
  selectThresholdAreaMin,
  selectThresholdAreaSeconds,
  selectTimeSeconds,
  selectVODClips,
  selectVodsAnchor,
  setThresholdAreaSeconds,
  setTime,
} from "./slice";

const CURSOR_WIDTH = 4;

function updateCursorElements<T extends HTMLElement>(
  els: (T | null)[],
  leftPx: number
) {
  els.forEach((el) => {
    if (el) {
      el.style.left = `${leftPx}px`;
    }
  });
}

function updateCursorRefs<T extends HTMLElement>(
  refs: RefObject<T>[],
  leftPx: number
) {
  updateCursorElements(
    refs.map((ref) => (ref.current ? ref.current : null)),
    leftPx
  );
}

function updateCursorThresholdWidth<T extends HTMLElement>(
  el: T | null,
  newWidth: number
) {
  if (el) {
    el.style.setProperty("--threshold-width", `${newWidth}px`);
  }
}

// TODO - divide this component in bar > cursor + handler could introduce
// performance optimizations (as smaller components would subscribe to
// different parts of state) and would be easier to read.
const TimelineBar = () => {
  const timeSec = useAppSelector(selectTimeSeconds);
  const thresholdAreaSec = useAppSelector(selectThresholdAreaSeconds);
  const thresholdAreaMin = useAppSelector(selectThresholdAreaMin);
  const isPlayerFg = useAppSelector(selectPlayerIsForeground);
  const clips = useAppSelector(selectVODClips);
  const vod = useAppSelector(selectVodsAnchor);

  const dispatch = useAppDispatch();

  const colorInterp = useCallback(
    () =>
      colorize(
        // clips is ordered from high view count to low, so we invert the colors:
        //high
        [255, 96, 141],
        // low
        [255, 208, 96],
        clips.map((c) => c.view_count)
      ),
    [clips]
  )();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const outerRef = useRef<HTMLDivElement>(null);
  const [parentDims, setParentDims] = useState({
    width: 0,
    height: 0,
    left: 0,
  });

  const toWidthPx = useCallback(
    (d: number) =>
      range(
        0,
        vod?.duration_seconds ?? 0,
        0,
        parentDims.width + CURSOR_WIDTH * -1,
        d
      ),
    [vod?.duration_seconds, parentDims.width]
  );
  const toTimeMark = useCallback(
    (px: number) =>
      Math.round(
        range(
          0,
          parentDims.width + CURSOR_WIDTH * -1,
          0,
          vod?.duration_seconds ?? 0,
          px
        )
      ),
    [parentDims.width, vod?.duration_seconds]
  );

  const updateSize = useDebounce(() => {
    if (!outerRef.current) return;
    const { width, height, left } = outerRef.current.getBoundingClientRect();
    setParentDims({ width, height, left });
  }, 1000);
  useEffect(
    function updateDimensionsOnResize() {
      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    },
    [updateSize]
  );

  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorMarkerRef = useRef<HTMLSpanElement>(null);
  const cursorThresholdHandlerRef = useRef<HTMLSpanElement>(null);

  useEffect(
    function updatePositions() {
      // update cursor elements
      updateCursorRefs(
        [cursorRef, cursorMarkerRef, cursorThresholdHandlerRef],
        toWidthPx(timeSec)
      );
    },
    [toWidthPx, timeSec]
  );

  useEffect(
    function updateThresholdWidth() {
      // update current threshold width for styling
      updateCursorThresholdWidth(
        cursorRef.current,
        toWidthPx(thresholdAreaSec)
      );
    },
    [cursorRef, thresholdAreaSec, toWidthPx]
  );

  useEffect(
    function updateTimemarkCanvas() {
      const c = canvasRef.current
      if (!c) return;
      const ctx = c.getContext("2d")
      if (!ctx) return;
      const rect = c.getBoundingClientRect()
      const [w, h] = [rect.width, rect.height]

      const scale = window.devicePixelRatio
      c.width = w * scale
      c.height = h * scale
      const wbar = 2;
      const wQuarterBar = 1;
      const hbar = h - (50 * h / 100)
      const hQuarterBar = hbar / 2
      const min5 = range(0, vod?.duration_seconds ?? 0, 0, w + wbar * -1, 5 * 60)
      const min5q = min5 / 4
      ctx.scale(scale, scale)

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = "#7d7d7d"
      for (let x = min5; x < w; x += min5) {
        ctx.fillRect(x, h - hbar, wbar, hbar)
      }
      for (let x = min5q; x <= w - min5q; x += min5q) {
        ctx.fillRect(x, h - hQuarterBar, wQuarterBar, hQuarterBar)
      }
    },
    [vod?.duration_seconds]
  )

  useEffect(
    function cursorHandlers() {
      const [el, elMarker, elHandler] = [
        cursorRef.current,
        cursorMarkerRef.current,
        cursorThresholdHandlerRef.current,
      ];
      const parent = outerRef.current;
      const width = el?.getBoundingClientRect().width ?? 0;
      let isDragging = false;

      function cursorHandler(e: MouseEvent) {
        const { offsetX, target, type, clientX } = e;
        if (!el || !elMarker || !elHandler) return;

        switch (type) {
          case "mousedown": {
            if (target instanceof HTMLElement) {
              if (target.classList.contains("cursor-threshold-handler")) {
                return;
              }
            }
            isDragging = true;
            el.classList.add("active");
            if (target !== parent) return;
            updateCursorElements(
              [el, elMarker, elHandler],
              Math.round(offsetX - width / 2)
            );
            break;
          }

          case "mousemove": {
            if (!isDragging) return;
            const px = Math.max(
              Math.min(
                Math.round(clientX - parentDims.left),
                parentDims.width - width
              ),
              0
            );
            updateCursorElements([el, elMarker, elHandler], px);
            break;
          }

          case "mouseup": {
            if (!isDragging) return;
            isDragging = false;
            el.classList.remove("active");
            // update pos where we left the cursor
            const t = toTimeMark(parseInt(el.style.left, 10));
            dispatch(setTime(t));
            break;
          }
        }
      }
      parent?.addEventListener("mousedown", cursorHandler);
      window.addEventListener("mousemove", cursorHandler);
      window.addEventListener("mouseup", cursorHandler);
      return function cleanup() {
        parent?.removeEventListener("mousedown", cursorHandler);
        window.removeEventListener("mousemove", cursorHandler);
        window.removeEventListener("mouseup", cursorHandler);
      };
    },
    [dispatch, outerRef, parentDims.left, parentDims.width, toTimeMark]
  );

  useEffect(
    function cursorThresholdHandler() {
      const minPx = toWidthPx(thresholdAreaMin);
      const maxPx = parentDims.width / 2;
      const [cursor, handlerEl] = [
        cursorRef.current,
        cursorThresholdHandlerRef.current,
      ];
      if (!cursor || !handlerEl) return;
      let isDragging = false;
      let offset = 0;
      let lastNewWidth = minPx;

      function cursorThresholdHandler(e: MouseEvent) {
        if (!cursor || !handlerEl) return;
        e.preventDefault();
        const { type, screenX } = e;
        switch (type) {
          case "mousedown": {
            isDragging = true;
            offset = screenX;
            handlerEl.classList.add("active");
            break;
          }

          case "mousemove": {
            if (!isDragging) return;
            const delta = screenX - offset;
            // change threshold area only visually
            const w = parseInt(
              cursor.style.getPropertyValue("--threshold-width"),
              10
            );
            lastNewWidth = Math.min(Math.max(delta + w, minPx), maxPx);
            updateCursorThresholdWidth(cursor, lastNewWidth);
            break;
          }

          case "mouseup": {
            if (!isDragging) return;
            isDragging = false;
            handlerEl.classList.remove("active");
            dispatch(setThresholdAreaSeconds(toTimeMark(lastNewWidth)));
            break;
          }
        }
      }

      handlerEl.addEventListener("mousedown", cursorThresholdHandler);
      window.addEventListener("mousemove", cursorThresholdHandler);
      window.addEventListener("mouseup", cursorThresholdHandler);
      return function cleanup() {
        handlerEl.removeEventListener("mousedown", cursorThresholdHandler);
        window.removeEventListener("mousemove", cursorThresholdHandler);
        window.removeEventListener("mouseup", cursorThresholdHandler);
      };
    },
    [dispatch, parentDims.width, thresholdAreaMin, toTimeMark, toWidthPx]
  );

  return (
    <div
      className={`timeline-wrapper with-background ${isPlayerFg ? "" : "foreground"
        }`}
    >
      <aside className="timeline-bar">
        <div className="timeline-box">
          <span className="cursor-marker" ref={cursorMarkerRef} />
          <span
            className="cursor-threshold-handler"
            ref={cursorThresholdHandlerRef}
          />
          <div className="outer" ref={outerRef}>
            <div className="cursor" ref={cursorRef}>
              <span className="cursor-threshold-area cursor-threshold-area-left" />
              <span className="cursor-threshold-area cursor-threshold-area-right" />
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
          <div className="timeline-marks">
            <canvas ref={canvasRef} width="2000" height="1000"></canvas>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default TimelineBar;
