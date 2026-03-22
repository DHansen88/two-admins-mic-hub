import { useRef } from "react";
import { getTagNames } from "@/data/tags";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogFilterBarProps {
  selectedHost: string;
  onHostChange: (host: string) => void;
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
}

const hosts = [
  { id: "all", label: "All", letter: "", color: "" },
  { id: "diana", label: "Diana", letter: "D", color: "bg-[hsl(var(--teal))]" },
  { id: "mel", label: "Mel", letter: "M", color: "bg-[hsl(var(--coral))]" },
];

const BlogFilterBar = ({
  selectedHost,
  onHostChange,
  selectedTopics,
  onTopicsChange,
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
    const amount = 200;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Host Filter Pills */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Host
        </p>
        <div className="flex gap-2">
          {hosts.map((host) => {
            const isActive = selectedHost === host.id;
            return (
              <button
                key={host.id}
                onClick={() => onHostChange(host.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] border whitespace-nowrap ${
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
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
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
      </div>

      {/* Topic Filter Pills — Horizontal carousel */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Topics
        </p>
        <div className="relative group/carousel">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity -translate-x-1/2 hover:bg-muted hidden md:flex"
            aria-label="Scroll topics left"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>

          {/* Scrollable track */}
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

          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-1 w-8 pointer-events-none bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default BlogFilterBar;
