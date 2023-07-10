import { useAppDispatch } from "@/lib/hooks";
import { useCallback, useEffect, useRef, type MouseEventHandler } from "react";
import "./Clip.scss";
import { prettyDuration } from "./helpers";
import { setTimeAndShowPlayer } from "./slice";

type ClipProps = {
  title: string;
  seconds: number;
  vod_offset: number;
  thumbnailUrl: string;
  creator: string;
};
const Clip = ({
  title,
  seconds,
  thumbnailUrl,
  creator,
  vod_offset,
}: ClipProps) => {
  const dispatch = useAppDispatch();
  const jumpToOffset = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (evt) => {
      const el = evt.target as HTMLButtonElement;
      const offset = el.dataset.offset;
      if (!offset) return;
      dispatch(setTimeAndShowPlayer(parseInt(offset, 10)));
    },
    [dispatch]
  );

  const jumpBtn = useRef<HTMLButtonElement>(null);
  const openBtn = useRef<HTMLButtonElement>(null);
  useEffect(function jumpColorCancel() {
    const jumpEl = jumpBtn.current;
    const openEl = openBtn.current;
    const onOpenMouseOver = () => {
      jumpEl?.classList.add("default");
    };
    const onOpenMouseOut = () => {
      jumpEl?.classList.remove("default");
    };

    openEl?.addEventListener("mouseover", onOpenMouseOver);
    openEl?.addEventListener("mouseout", onOpenMouseOut);
    return () => {
      openEl?.removeEventListener("mouseover", onOpenMouseOver);
      openEl?.removeEventListener("mouseout", onOpenMouseOut);
    };
  });
  return (
    <article
      data-offset={vod_offset}
      onClick={jumpToOffset}
      className="clip-card"
      style={{
        backgroundImage: `
        linear-gradient(rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 0) 100%),
        linear-gradient(rgba(var(--rgb-dark-rubber), 0.5) 0%, rgba(var(--rgb-dark-rubber), 0.5) 100%),
        url(${thumbnailUrl})
    `,
      }}
    >
      <h3 title={title}>{title}</h3>
      <small className="clip-creator">by {creator}</small>

      <div className="clip-action-bar">
        <small className="clip-duration">
          <span>{prettyDuration(seconds)}</span>
        </small>
        <div className="buttons">
          <button
            type="button"
            className="open-btn"
            data-offset={vod_offset}
            onClick={jumpToOffset}
            ref={openBtn}
          >
            Open in Clip Tool
          </button>
          <button
            type="button"
            className="jump-btn"
            data-offset={vod_offset}
            onClick={jumpToOffset}
            ref={jumpBtn}
          >
            Jump
          </button>
        </div>
      </div>
    </article>
  );
};

export default Clip;
