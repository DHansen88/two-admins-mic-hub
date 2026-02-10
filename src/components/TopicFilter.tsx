import { useState } from "react";
import { TOPICS, type Topic } from "@/data/episodeData";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TopicFilterProps {
  selected: Topic[];
  onChange: (topics: Topic[]) => void;
}

const TopicFilter = ({ selected, onChange }: TopicFilterProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (topic: Topic) => {
    onChange(
      selected.includes(topic)
        ? selected.filter((t) => t !== topic)
        : [...selected, topic]
    );
  };

  const filterContent = (
    <div className="space-y-2">
      {TOPICS.map((topic) => (
        <label
          key={topic}
          className="flex items-center gap-2.5 cursor-pointer py-1.5 px-1 rounded-md hover:bg-muted/60 transition-colors text-sm"
        >
          <Checkbox
            checked={selected.includes(topic)}
            onCheckedChange={() => toggle(topic)}
            className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
          />
          <span className="text-foreground select-none">{topic}</span>
        </label>
      ))}
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="text-xs text-accent hover:underline mt-2 block"
        >
          Clear all
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <h3 className="font-display font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">
          Topics
        </h3>
        {filterContent}
      </aside>

      {/* Mobile collapsible */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full justify-between"
        >
          <span>Filter by Topic</span>
          {mobileOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {mobileOpen && (
          <div className="mt-3 p-4 border border-border rounded-lg bg-card">
            {filterContent}
          </div>
        )}
      </div>
    </>
  );
};

export default TopicFilter;
