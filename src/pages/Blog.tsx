import { useState, useMemo } from "react";
import blogBanner from "@/assets/TAAM_Blog_Transparent.png";
import QuillAnimation from "@/components/QuillAnimation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import BlogFilterBar from "@/components/BlogFilterBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVisibleBlogs } from "@/hooks/useVisibleContent";
import { authorMatchesHost } from "@/lib/author-utils";

const POSTS_PER_PAGE = 9;

const Blog = () => {
  const allBlogs = useVisibleBlogs();
  const [search, setSearch] = useState("");
  const [selectedHost, setSelectedHost] = useState<string>("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const hasActiveFilters = selectedHost !== "all" || selectedTopics.length > 0;

  const clearFilters = () => {
    setSelectedHost("all");
    setSelectedTopics([]);
  };

  const filteredBlogs = useMemo(() => {
    const query = search.toLowerCase().trim();
    let blogs = [...allBlogs];

    if (selectedHost !== "all") {
      blogs = blogs.filter((blog) => {
        const postAuthors = blog.authors?.length ? blog.authors : blog.author ? [blog.author] : [];
        const matchesResolvedAuthor = postAuthors.some((author) => authorMatchesHost(author, selectedHost));
        const matchesAuthorId = blog.authorIds?.some((id) => authorMatchesHost({ id, name: id }, selectedHost));
        return matchesResolvedAuthor || !!matchesAuthorId;
      });
    }

    if (selectedTopics.length > 0) {
      blogs = blogs.filter(b => selectedTopics.some(topic => b.topics.includes(topic)));
    }

    if (query) {
      blogs = blogs.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.excerpt.toLowerCase().includes(query) ||
        b.topics.some(t => t.toLowerCase().includes(query))
      );
    }

    blogs.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return blogs;
  }, [search, selectedHost, selectedTopics, sortOrder, allBlogs]);

  const resetKey = `${search}-${selectedHost}-${selectedTopics.join()}-${sortOrder}`;
  useMemo(() => setCurrentPage(1), [resetKey]);

  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);
  const visibleBlogs = filteredBlogs.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Banner */}
        <section className="relative py-20 min-h-[280px] md:min-h-[320px] bg-gradient-to-br from-slate via-navy to-deep-blue overflow-hidden flex items-center justify-center">
          <QuillAnimation />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center justify-center animate-fade-in">
              <img
                src={blogBanner}
                alt="Two Admins & a Blog"
                className="max-h-[160px] sm:max-h-[190px] md:max-h-[230px] lg:max-h-[260px] w-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Blog Listing */}
        <section className="py-14 md:py-20 bg-background">
          <div className="max-w-[1100px] mx-auto px-5">

            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 border-2 focus:border-accent"
                />
              </div>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
                <SelectTrigger className="h-12 w-full sm:w-[140px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filters */}
            <BlogFilterBar
              selectedHost={selectedHost}
              onHostChange={setSelectedHost}
              selectedTopics={selectedTopics}
              onTopicsChange={setSelectedTopics}
              filteredCount={filteredBlogs.length}
            />

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center flex-wrap gap-2 mb-6 p-3 rounded-lg bg-muted/50 border border-border animate-fade-in">
                <span className="text-sm font-medium text-muted-foreground mr-1">Active:</span>
                {selectedHost !== "all" && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    selectedHost === "diana" ? "bg-[hsl(var(--teal))]" : "bg-[hsl(var(--coral))]"
                  }`}>
                    {selectedHost === "diana" ? "Diana" : "Mel"}
                    <button onClick={() => setSelectedHost("all")} className="ml-1 hover:opacity-70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground"
                  >
                    {topic}
                    <button
                      onClick={() => setSelectedTopics((prev) => prev.filter((t) => t !== topic))}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs font-medium text-destructive hover:underline flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              </div>
            )}

            {/* Blog Grid */}
            {filteredBlogs.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">
                No posts match your filters.
              </p>
            ) : (
              <>
                <div
                  key={resetKey}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
                >
                  {visibleBlogs.map((blog, i) => (
                    <div
                      key={blog.slug}
                      className="animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                    >
                      <BlogCard {...blog} />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-10">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground ml-3">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
