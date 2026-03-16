/**
 * TableOfContents
 * Auto-generates a TOC from heading blocks (H2, H3).
 * Desktop: sticky sidebar. Mobile: collapsible dropdown.
 * Includes scroll-spy for active section highlighting.
 */

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, List } from "lucide-react";
import type { ContentBlock } from "@/lib/block-types";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Generate a URL-friendly slug from heading text */
export function headingToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Extract H2/H3 items from content blocks */
export function extractTocItems(blocks: ContentBlock[]): TocItem[] {
  return blocks
    .filter(
      (b): b is ContentBlock & { type: "heading"; level: 2 | 3; text: string } =>
        b.type === "heading" && (b as any).level <= 3
    )
    .map((b) => ({
      id: headingToSlug(b.text),
      text: b.text,
      level: b.level as 2 | 3,
    }));
}

interface TableOfContentsProps {
  items: TocItem[];
}

const TableOfContents = ({ items }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Scroll-spy: track which heading is in view
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const handleClick = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update URL hash without jump
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  const tocList = (
    <nav aria-label="Table of Contents">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleClick(item.id)}
              className={`
                text-left w-full text-sm py-1.5 transition-colors duration-200 border-l-2
                ${item.level === 3 ? "pl-5" : "pl-3"}
                ${
                  activeId === item.id
                    ? "border-accent text-accent font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }
              `}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
            <List className="h-3.5 w-3.5" />
            On This Page
          </h4>
          {tocList}
        </div>
      </div>

      {/* Mobile: collapsible dropdown */}
      <div className="lg:hidden mb-8">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card text-sm font-medium text-foreground"
        >
          <span className="flex items-center gap-2">
            <List className="h-4 w-4 text-muted-foreground" />
            Table of Contents
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isOpen && (
          <div className="mt-2 p-4 rounded-lg border border-border bg-card animate-fade-in">
            {tocList}
          </div>
        )}
      </div>
    </>
  );
};

export default TableOfContents;
