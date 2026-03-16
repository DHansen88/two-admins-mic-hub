import { Link } from "react-router-dom";
import { getTagByName } from "@/data/tags";

interface TopicTagProps {
  topic: string;
  /** Visual variant: light (for dark backgrounds) or default (for light backgrounds) */
  variant?: "default" | "light";
  className?: string;
}

/**
 * Clickable topic tag chip that links to /topics/:topic filtered view.
 * Uses tag colors from the centralized tag system.
 */
const TopicTag = ({ topic, variant = "default", className = "" }: TopicTagProps) => {
  const tag = getTagByName(topic);
  const color = tag?.color || "199 62% 28%";

  const base =
    "inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full transition-colors";

  return (
    <Link
      to={`/topics/${encodeURIComponent(topic)}`}
      className={`${base} ${className}`}
      style={{
        backgroundColor: `hsl(${color} / 0.15)`,
        color: `hsl(${color})`,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = `hsl(${color} / 0.25)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = `hsl(${color} / 0.15)`;
      }}
    >
      {topic}
    </Link>
  );
};

export default TopicTag;
