import { getTagNames } from "@/data/tags";

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

  const toggleTopic = (topic: string) => {
    onTopicsChange(
      selectedTopics.includes(topic)
        ? selectedTopics.filter((t) => t !== topic)
        : [...selectedTopics, topic]
    );
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Host Filter Pills */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Host
        </p>
        <div className="flex flex-wrap gap-2">
          {hosts.map((host) => {
            const isActive = selectedHost === host.id;
            return (
              <button
                key={host.id}
                onClick={() => onHostChange(host.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] border ${
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

      {/* Topic Filter Pills */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Topics
        </p>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => {
            const isActive = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] border ${
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
      </div>
    </div>
  );
};

export default BlogFilterBar;
