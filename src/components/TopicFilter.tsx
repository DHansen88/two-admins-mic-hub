import { useState } from "react";
import { TOPICS, type Topic } from "@/data/episodeData";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";

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

  const isAllSelected = selected.length === 0;

  const filterItems = (
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
      {TOPICS.map((topic) => {
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
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <h3 className="font-display font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">
          Topics
        </h3>
        {filterItems}
      </aside>

      {/* Mobile/Tablet: collapsible dropdown — rendered ONLY below lg */}
      <div className="lg:hidden w-full mb-6">
        <Button
          variant="outline"
          className="w-full justify-between h-12 text-sm"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Topics
            {selected.length > 0 && (
              <span className="bg-accent text-accent-foreground text-xs font-bold rounded-full px-2 py-0.5 leading-none">
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
            {filterItems}
          </div>
        )}
      </div>
    </>
  );
};

export default TopicFilter;
