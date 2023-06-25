interface TimelineProps {
  user: string;
}
export default function Timeline({ user }: TimelineProps) {
  return <h1>Timeline {user}</h1>;
}
