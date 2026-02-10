import { Link } from "react-router-dom";
import type { SharedTopic } from "@/data/topics";

interface TopicTagProps {
  topic: SharedTopic;
  /** Visual variant: light (for dark backgrounds) or default (for light backgrounds) */
  variant?: "default" | "light";
  className?: string;
}

/**
 * Clickable topic tag chip that links to /topics/:topic filtered view.
 * Used consistently across blog posts and podcast episodes.
 */
const TopicTag = ({ topic, variant = "default", className = "" }: TopicTagProps) => {
  const base =
    "inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full transition-colors";

  const variants = {
    default:
      "text-teal bg-teal/10 hover:bg-teal/20",
    light:
      "text-teal bg-teal/10 hover:bg-teal/20",
  };

  return (
    <Link
      to={`/topics/${encodeURIComponent(topic)}`}
      className={`${base} ${variants[variant]} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {topic}
    </Link>
  );
};

export default TopicTag;
