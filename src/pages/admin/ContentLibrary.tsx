import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Library, Mic, FileText, Search, ExternalLink } from "lucide-react";
import { allBlogs } from "@/data/blogData";
import { allEpisodes } from "@/data/episodeData";
import { Link } from "react-router-dom";

type ContentTab = "all" | "episodes" | "blogs";

const ContentLibrary = () => {
  const [tab, setTab] = useState<ContentTab>("all");
  const [search, setSearch] = useState("");

  const query = search.toLowerCase().trim();

  const filteredEpisodes =
    tab === "blogs"
      ? []
      : allEpisodes.filter(
          (ep) =>
            !query ||
            ep.title.toLowerCase().includes(query) ||
            ep.description.toLowerCase().includes(query)
        );

  const filteredBlogs =
    tab === "episodes"
      ? []
      : allBlogs.filter(
          (b) =>
            !query ||
            b.title.toLowerCase().includes(query) ||
            b.excerpt.toLowerCase().includes(query)
        );

  const tabs: { key: ContentTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: allEpisodes.length + allBlogs.length },
    { key: "episodes", label: "Episodes", count: allEpisodes.length },
    { key: "blogs", label: "Blog Posts", count: allBlogs.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
          <Library className="h-7 w-7 text-primary" />
          Content Library
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse all published content across episodes and blog posts.
        </p>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {tabs.map((t) => (
            <Button
              key={t.key}
              variant={tab === t.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab(t.key)}
              className="text-xs"
            >
              {t.label} ({t.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Episodes */}
      {filteredEpisodes.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Podcast Episodes ({filteredEpisodes.length})
          </h2>
          <div className="space-y-2">
            {filteredEpisodes.map((ep) => (
              <Card key={ep.number} className="bg-card border-border">
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      Ep. {ep.number}: {ep.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ep.date} • {ep.duration} • {ep.topics.join(", ")}
                    </p>
                  </div>
                  <Link to={`/episodes/${ep.slug}`} target="_blank">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Blogs */}
      {filteredBlogs.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blog Posts ({filteredBlogs.length})
          </h2>
          <div className="space-y-2">
            {filteredBlogs.map((blog) => (
              <Card key={blog.slug} className="bg-card border-border">
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {blog.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {blog.date} • {blog.readTime} • {blog.topics.join(", ")}
                    </p>
                  </div>
                  <Link to={`/blog/${blog.slug}`} target="_blank">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {filteredEpisodes.length === 0 && filteredBlogs.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No content matches your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentLibrary;
