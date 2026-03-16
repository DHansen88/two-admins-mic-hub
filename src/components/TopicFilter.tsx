import { useState } from "react";
import { TOPICS, type Topic } from "@/data/episodeData";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TopicFilterProps {
  selected: Topic[];
  onChange: (topics: Topic[]) => void;
}

const TopicFilter = ({ selected, onChange }: TopicFilterProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  const toggle = (topic: Topic) => {
    onChange(
      selected.includes(topic)
        ? selected.filter((t) => t !== topic)
        : [...selected, topic]
    );
  };

  const filterContent = (
    <div className="space-y-1">
      {TOPICS.map((topic) => (
        <label
          key={topic}
          className="flex items-center gap-2.5 cursor-pointer py-2 px-2 rounded-md hover:bg-muted/60 transition-colors text-sm min-h-[40px]"
        >
          <Checkbox
            checked={selected.includes(topic)}
            onCheckedChange={() => toggle(topic)}
            className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent h-5 w-5"
          />
          <span className="text-foreground select-none">{topic}</span>
        </label>
      ))}
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="text-xs text-accent hover:underline mt-2 block px-2"
        >
          Clear all
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <h3 className="font-display font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">
          Topics
        </h3>
        {filterContent}
      </aside>

      {/* Tablet/Mobile: collapsible button + dropdown */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          className="w-full justify-between h-12"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Topics
            {selected.length > 0 && (
              <span className="bg-accent text-accent-foreground text-xs font-bold rounded-full px-2 py-0.5">
                {selected.length}
              </span>
            )}
          </span>
          {mobileOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {mobileOpen && (
          <div className="mt-2 p-3 bg-card border border-border rounded-lg animate-fade-in">
            {filterContent}
          </div>
        )}
      </div>
    </>
  );
};

export default TopicFilter;
