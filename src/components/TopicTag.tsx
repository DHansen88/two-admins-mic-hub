import { Link } from "react-router-dom";
import { getTagByName } from "@/data/tags";

interface TopicTagProps {
  topic: string;
  /** Visual variant: light (for dark backgrounds) or default (for light backgrounds) */
  variant?: "default" | "light";
  className?: string;
  styleOverride?: {
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
  };
}

/**
 * Clickable topic tag chip that links to /topics/:topic filtered view.
 * Uses exact admin-controlled colors — theme-independent.
 */
const TopicTag = ({ topic, variant = "default", className = "", styleOverride }: TopicTagProps) => {
  const tag = getTagByName(topic);
  void variant;
  const bgColor = styleOverride?.bgColor || tag?.bgColor || "#5A7DFF";
  const textColor = styleOverride?.textColor || tag?.textColor || "#ffffff";
  const borderColor = styleOverride?.borderColor || tag?.borderColor;

  return (
    <Link
      to={`/topics/${encodeURIComponent(topic)}`}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-all hover:brightness-110 hover:shadow-md ${className}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: "6px 12px",
        borderRadius: "999px",
        border: borderColor ? `1.5px solid ${borderColor}` : "none",
        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        fontWeight: 600,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{
          backgroundColor: textColor,
          opacity: 0.7,
        }}
      />
      {topic}
    </Link>
  );
};

export default TopicTag;
