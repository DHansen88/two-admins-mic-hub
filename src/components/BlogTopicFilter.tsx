import { BLOG_TOPICS, type BlogTopic } from "@/data/blogData";
import { Checkbox } from "./ui/checkbox";

interface BlogTopicFilterProps {
  selected: BlogTopic[];
  onChange: (topics: BlogTopic[]) => void;
}

const BlogTopicFilter = ({ selected, onChange }: BlogTopicFilterProps) => {
  const toggle = (topic: BlogTopic) => {
    onChange(
      selected.includes(topic)
        ? selected.filter((t) => t !== topic)
        : [...selected, topic]
    );
  };

  const isAllSelected = selected.length === 0;

  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <h3 className="font-display font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">
          Topics
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onChange([])}
            className={`flex items-center gap-2.5 w-full cursor-pointer py-2 px-2 rounded-md transition-colors text-sm min-h-[44px] font-medium ${
              isAllSelected
                ? "bg-accent/15 text-accent border border-accent/30"
                : "hover:bg-muted/60 text-foreground"
            }`}
          >
            All Topics
          </button>
          {BLOG_TOPICS.map((topic) => {
            const isActive = selected.includes(topic);
            return (
              <label
                key={topic}
                className={`flex items-center gap-2.5 cursor-pointer py-2 px-2 rounded-md transition-colors text-sm min-h-[44px] ${
                  isActive
                    ? "bg-accent/15 text-accent font-medium border border-accent/30"
                    : "hover:bg-muted/60 text-foreground"
                }`}
              >
                <Checkbox
                  checked={isActive}
                  onCheckedChange={() => toggle(topic)}
                  className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent h-5 w-5"
                />
                <span className="select-none">{topic}</span>
              </label>
            );
          })}
        </div>
      </aside>

      {/* Mobile/Tablet: horizontal scrollable pills */}
      <div className="lg:hidden w-full mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          <button
            onClick={() => onChange([])}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[40px] border ${
              isAllSelected
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-card text-foreground border-border hover:border-accent/50"
            }`}
          >
            All
          </button>
          {BLOG_TOPICS.map((topic) => {
            const isActive = selected.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggle(topic)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[40px] border whitespace-nowrap ${
                  isActive
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card text-foreground border-border hover:border-accent/50"
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BlogTopicFilter;
