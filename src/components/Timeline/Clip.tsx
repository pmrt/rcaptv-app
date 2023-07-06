import "./Clip.scss";
import { prettyDuration } from "./helpers";

type ClipProps = {
  title: string;
  seconds: number;
  thumbnailUrl: string;
  creator: string;
};
const Clip = ({ title, seconds, thumbnailUrl, creator }: ClipProps) => (
  <article
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
    <small className="clip-duration">
      <span>{prettyDuration(seconds)}</span>
    </small>
  </article>
);

export default Clip;
