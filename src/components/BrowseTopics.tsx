import { useState } from "react";
import { Link } from "react-router-dom";
import { getAllTags } from "@/data/tags";
import { useVisibleEpisodes, useVisibleBlogs } from "@/hooks/useVisibleContent";
import { Badge } from "./ui/badge";
import { ArrowRight } from "lucide-react";

const BrowseTopics = () => {
  const allEpisodes = useVisibleEpisodes();
  const allBlogs = useVisibleBlogs();
  const tags = getAllTags();
  const [selected, setSelected] = useState<string | null>(null);

  const filteredEpisodes = selected
    ? allEpisodes.filter((ep) => ep.topics.includes(selected)).slice(0, 3)
    : [];
  const filteredBlogs = selected
    ? allBlogs.filter((b) => b.topics.includes(selected)).slice(0, 3)
    : [];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Browse Topics
            </h2>
            <p className="text-muted-foreground">Find content that matters to you</p>
          </div>

          {/* Topic pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <button
                key={tag.slug}
                onClick={() => setSelected(selected === tag.name ? null : tag.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selected === tag.name
                    ? "text-white border-transparent"
                    : "bg-card text-foreground border-border hover:border-foreground/30"
                }`}
                style={
                  selected === tag.name
                    ? { backgroundColor: tag.bgColor, color: tag.textColor }
                    : undefined
                }
              >
                {tag.name}
              </button>
            ))}
          </div>

          {/* Filtered results */}
          {selected && (
            <div className="space-y-4 animate-fade-in">
              {filteredEpisodes.length === 0 && filteredBlogs.length === 0 && (
                <p className="text-center text-muted-foreground text-sm">No content found for this topic.</p>
              )}

              {filteredEpisodes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Episodes</h3>
                  {filteredEpisodes.map((ep) => (
                    <Link
                      key={ep.number}
                      to={`/episodes/${ep.slug}`}
                      onClick={() => window.scrollTo(0, 0)}
                      className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{ep.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              {filteredBlogs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Blog Posts</h3>
                  {filteredBlogs.map((blog) => (
                    <Link
                      key={blog.slug}
                      to={`/blog/${blog.slug}`}
                      onClick={() => window.scrollTo(0, 0)}
                      className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{blog.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="text-center pt-2">
                <Link
                  to={`/topics/${selected.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => window.scrollTo(0, 0)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-deep-blue hover:underline"
                >
                  View all {selected} content <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BrowseTopics;
