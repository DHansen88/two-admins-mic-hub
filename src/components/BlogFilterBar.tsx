import { getTagNames } from "@/data/tags";
import { X } from "lucide-react";
import authorsData from "@/content/authors.json";
import dianaBlogIcon from "@/assets/images/authors/diana-blog.png";

interface BlogFilterBarProps {
  selectedHost: string;
  onHostChange: (host: string) => void;
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
  filteredCount?: number;
}

const hosts = [
  { id: "all", label: "All", letter: "", color: "" },
  { id: "diana", label: "Diana", letter: "D", color: "bg-[hsl(var(--teal))]" },
  { id: "mel", label: "Mel", letter: "M", color: "bg-[hsl(var(--coral))]" },
];

const hostDescriptions: Record<string, string> = {
  diana: "Leadership, career growth, and the human side of admin life.",
  mel: "Practical strategies, tech tips, and workplace culture insights.",
};

const BlogFilterBar = ({
  selectedHost,
  onHostChange,
  selectedTopics,
  onTopicsChange,
  filteredCount,
}: BlogFilterBarProps) => {
  const topics = getTagNames();

  const toggleTopic = (topic: string) => {
    onTopicsChange(
      selectedTopics.includes(topic)
        ? selectedTopics.filter((t) => t !== topic)
        : [...selectedTopics, topic]
    );
  };

  const activeHostData = selectedHost !== "all"
    ? (authorsData as Record<string, { name: string; avatar: string }>)[selectedHost]
    : null;

  return (
    <div className="space-y-4 mb-6">
      {/* Combined Host + Topic pills in a wrapping row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Host pills */}
        {hosts.map((host) => {
          const isActive = selectedHost === host.id;
          return (
            <button
              key={host.id}
              onClick={() => onHostChange(host.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] border whitespace-nowrap ${
                isActive
                  ? host.id === "all"
                    ? "bg-foreground text-background border-foreground shadow-md"
                    : host.id === "diana"
                    ? "bg-[hsl(var(--teal))] text-white border-[hsl(var(--teal))] shadow-md"
                    : "bg-[hsl(var(--coral))] text-white border-[hsl(var(--coral))] shadow-md"
                  : "bg-card text-foreground border-border hover:border-muted-foreground/50 hover:bg-muted/50"
              }`}
            >
              {host.letter && (
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : host.id === "diana"
                      ? "bg-[hsl(var(--teal))]/15 text-[hsl(var(--teal))]"
                      : "bg-[hsl(var(--coral))]/15 text-[hsl(var(--coral))]"
                  }`}
                >
                  {host.letter}
                </span>
              )}
              {host.label}
            </button>
          );
        })}

        {/* Dot separator */}
        <span className="text-muted-foreground/40 text-lg select-none">•</span>

        {/* Topic pills */}
        {topics.map((topic) => {
          const isActive = selectedTopics.includes(topic);
          return (
            <button
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] border whitespace-nowrap ${
                isActive
                  ? "bg-accent text-accent-foreground border-accent shadow-md"
                  : "bg-card text-foreground border-border hover:border-accent/50 hover:bg-muted/50"
              }`}
            >
              {topic}
            </button>
          );
        })}
      </div>

      {/* NOW VIEWING host card */}
      {activeHostData && selectedHost !== "all" && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card animate-fade-in">
          <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
            <img
              src={activeHostData.avatar}
              alt={activeHostData.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Now Viewing
            </p>
            <p className="text-lg font-display font-bold text-foreground">
              {activeHostData.name}'s posts
            </p>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {hostDescriptions[selectedHost] || ""}
            </p>
            {filteredCount !== undefined && (
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  selectedHost === "diana"
                    ? "text-[hsl(var(--teal))] border-[hsl(var(--teal))]/30"
                    : "text-[hsl(var(--coral))] border-[hsl(var(--coral))]/30"
                }`}
              >
                {filteredCount} posts
              </span>
            )}
          </div>
          <button
            onClick={() => onHostChange("all")}
            className="shrink-0 w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Clear host filter"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogFilterBar;
