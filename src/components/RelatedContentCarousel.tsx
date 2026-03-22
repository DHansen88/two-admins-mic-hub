import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTagByName } from "@/data/tags";
import type { BlogPost } from "@/lib/content-loader";
import type { Episode } from "@/data/episodeData";
import useEmblaCarousel from "embla-carousel-react";

export interface RelatedItem {
  type: "podcast" | "article";
  title: string;
  slug: string;
  host: string; // "diana" | "mel" | ""
  duration: string; // e.g. "42 min" or "2 min read"
  topics: string[];
}

/** Convert blog posts and episodes into a unified RelatedItem list (max 6) */
export function buildRelatedItems(
  blogs: BlogPost[],
  episodes: Episode[]
): RelatedItem[] {
  const blogItems: RelatedItem[] = blogs.map((b) => ({
    type: "article",
    title: b.title,
    slug: `/blog/${b.slug}`,
    host: b.author?.name?.toLowerCase() || "",
    duration: b.readTime,
    topics: b.topics.slice(0, 2),
  }));

  const episodeItems: RelatedItem[] = episodes.map((e) => ({
    type: "podcast",
    title: e.title,
    slug: `/episodes/${e.slug}`,
    host: e.host?.toLowerCase() || "",
    duration: e.duration,
    topics: e.topics.slice(0, 2),
  }));

  // Interleave for variety, cap at 6
  const merged: RelatedItem[] = [];
  const maxLen = Math.max(blogItems.length, episodeItems.length);
  for (let i = 0; i < maxLen && merged.length < 6; i++) {
    if (i < episodeItems.length && merged.length < 6) merged.push(episodeItems[i]);
    if (i < blogItems.length && merged.length < 6) merged.push(blogItems[i]);
  }
  return merged;
}

interface Props {
  items: RelatedItem[];
}

const RelatedContentCarousel = ({ items }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    dragFree: false,
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (items.length === 0) return null;

  return (
    <section className="py-14 bg-muted/40 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with arrows */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">
              Related Content
            </h2>
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {items.map((item, idx) => (
                <div
                  key={`${item.type}-${item.slug}-${idx}`}
                  className="flex-[0_0_85%] min-w-0 sm:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(33.333%-11px)]"
                >
                  <RelatedCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function RelatedCard({ item }: { item: RelatedItem }) {
  const isPodcast = item.type === "podcast";
  const isD = item.host === "diana";
  const isM = item.host === "mel";

  return (
    <Link to={item.slug} onClick={() => window.scrollTo(0, 0)}>
      <Card className="h-full p-4 bg-card border-border hover:border-teal transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col gap-2">
        {/* Type badge + duration */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              isPodcast
                ? "bg-accent/15 text-accent"
                : "bg-primary/15 text-primary"
            }`}
          >
            {isPodcast ? (
              <Mic className="h-3 w-3" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            {isPodcast ? "Podcast" : "Article"}
          </span>
          <span className="text-xs text-muted-foreground">{item.duration}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-display font-bold text-foreground leading-snug line-clamp-2 flex-1">
          {item.title}
        </h3>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-auto overflow-hidden">
          {item.topics.map((topic) => {
            const tag = getTagByName(topic);
            const bg = tag?.bgColor || "#5A7DFF";
            const text = tag?.textColor || "#ffffff";
            return (
              <span
                key={topic}
                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis shrink min-w-0 max-w-[50%]"
                style={{
                  backgroundColor: bg,
                  color: text,
                  padding: "3px 8px",
                  borderRadius: "999px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                  fontWeight: 600,
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: text, opacity: 0.6 }}
                />
                <span className="overflow-hidden text-ellipsis">{topic}</span>
              </span>
            );
          })}
        </div>
      </Card>
    </Link>
  );
}

export default RelatedContentCarousel;
