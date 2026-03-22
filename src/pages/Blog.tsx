import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import BlogFilterBar from "@/components/BlogFilterBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { allBlogs } from "@/data/blogData";
import blogBanner from "@/assets/blog-banner.png";

const POSTS_PER_PAGE = 6;

const Blog = () => {
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

    // Host filter
    if (selectedHost !== "all") {
      blogs = blogs.filter(b => {
        const authorName = b.author?.name?.toLowerCase() || "";
        return authorName === selectedHost.toLowerCase();
      });
    }

    // Topic filter
    if (selectedTopics.length > 0) {
      blogs = blogs.filter(b => selectedTopics.some(topic => b.topics.includes(topic)));
    }

    // Search filter
    if (query) {
      blogs = blogs.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.excerpt.toLowerCase().includes(query) ||
        b.topics.some(t => t.toLowerCase().includes(query))
      );
    }

    // Sort
    blogs.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return blogs;
  }, [search, selectedHost, selectedTopics, sortOrder]);

  // Reset to page 1 when filters change
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
      <main className="pt-20">
        {/* Hero Banner */}
        <section
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(199, 62%, 21%) 0%, hsl(197, 100%, 27%) 100%)',
          }}
        >
          <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-px bg-white/[0.07]"
                style={{
                  top: `${18 + i * 6.5}%`,
                  left: '-10%',
                  width: `${60 + (i % 3) * 20}%`,
                  animation: `manuscriptSlide ${14 + i * 1.5}s linear infinite`,
                  animationDelay: `${i * 0.8}s`,
                }}
              />
            ))}
          </div>
          <div className="flex justify-center pt-10 pb-0 relative z-10">
            <img
              src={blogBanner}
              alt="Two Admins & a Blog"
              className="w-[22rem] md:w-[30rem] lg:w-[600px] h-auto drop-shadow-2xl"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10 pb-16 -mt-4">
            <div className="max-w-4xl mx-auto text-center space-y-4 animate-fade-in" />
          </div>
        </section>

        {/* Blog Library */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Search & Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search posts by title, excerpt, or topic..."
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

              {/* Host & Topic Filter Pills */}
              <BlogFilterBar
                selectedHost={selectedHost}
                onHostChange={setSelectedHost}
                selectedTopics={selectedTopics}
                onTopicsChange={setSelectedTopics}
              />

              {/* Active Filters Bar */}
              {hasActiveFilters && (
                <div className="flex items-center flex-wrap gap-2 mb-6 p-3 rounded-lg bg-muted/50 border border-border animate-fade-in">
                  <span className="text-sm font-medium text-muted-foreground mr-1">Active Filters:</span>
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
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Blog Grid */}
              <div className="transition-opacity duration-300">
                {filteredBlogs.length === 0 ? (
                  <p className="text-center py-16 text-muted-foreground">
                    No posts match your filters. Try adjusting your search or topics.
                  </p>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                      {visibleBlogs.map((blog) => (
                        <BlogCard key={blog.slug} {...blog} />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-8">
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
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
