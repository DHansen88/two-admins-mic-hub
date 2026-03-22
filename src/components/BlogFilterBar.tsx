import { useRef } from "react";
import { getTagNames } from "@/data/tags";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import authorsData from "@/content/authors.json";
import dianaBlogIcon from "@/assets/images/authors/diana-blog.png";
import melBlogIcon from "@/assets/images/authors/mel-blog.png";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleTopic = (topic: string) => {
    onTopicsChange(
      selectedTopics.includes(topic)
        ? selectedTopics.filter((t) => t !== topic)
        : [...selectedTopics, topic]
    );
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  const activeHostData = selectedHost !== "all"
    ? (authorsData as Record<string, { name: string; avatar: string }>)[selectedHost]
    : null;

  return (
    <div className="space-y-3 mb-6">
      {/* Host pills row */}
      <div className="flex items-center gap-2">
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
      </div>

      {/* Topic pills carousel */}
      <div className="relative group/carousel">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity -translate-x-1/2 hover:bg-muted hidden md:flex"
          aria-label="Scroll topics left"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
        >
          {topics.map((topic) => {
            const isActive = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] border whitespace-nowrap ${
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

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity translate-x-1/2 hover:bg-muted hidden md:flex"
          aria-label="Scroll topics right"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>

        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-1 w-8 pointer-events-none bg-gradient-to-l from-background to-transparent" />
      </div>

      {/* NOW VIEWING host card */}
      {activeHostData && selectedHost !== "all" ? (
        <div className="flex items-center gap-5 p-4 rounded-xl border border-border bg-card animate-fade-in">
          <div className="shrink-0 w-[8.75rem] sm:w-[10.5rem] md:w-[12.25rem]">
            <img
              src={selectedHost === "diana" ? dianaBlogIcon : selectedHost === "mel" ? melBlogIcon : activeHostData.avatar}
              alt={activeHostData.name}
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
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
      ) : null}
    </div>
  );
};

export default BlogFilterBar;
