import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import BlogTopicFilter from "@/components/BlogTopicFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown } from "lucide-react";
import { allBlogs, type BlogTopic } from "@/data/blogData";

const POSTS_PER_PAGE = 9;

const Blog = () => {
  const [search, setSearch] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<BlogTopic[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const filteredBlogs = useMemo(() => {
    const query = search.toLowerCase().trim();
    let blogs = [...allBlogs];

    if (selectedTopics.length > 0) {
      blogs = blogs.filter((b) =>
        selectedTopics.some((topic) => b.topics.includes(topic))
      );
    }

    if (query) {
      blogs = blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.excerpt.toLowerCase().includes(query) ||
          b.topics.some((t) => t.toLowerCase().includes(query))
      );
    }

    blogs.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return blogs;
  }, [search, selectedTopics, sortOrder]);

  // Reset pagination when filters change
  const resetKey = `${search}-${selectedTopics.join()}-${sortOrder}`;
  useMemo(() => setVisibleCount(POSTS_PER_PAGE), [resetKey]);

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBlogs.length;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Banner */}
        <section className="py-20 bg-gradient-to-b from-slate to-navy relative overflow-hidden">
          {/* Oversized caret / text-cursor animation */}
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
            <div
              className="absolute w-[3px] md:w-[4px] rounded-full bg-background/[0.13]"
              style={{
                height: '45%',
                top: '20%',
                left: '8%',
                animation: 'caretBlink 3.2s ease-in-out infinite',
              }}
            />
            <div
              className="absolute w-[2px] md:w-[3px] rounded-full bg-background/[0.09]"
              style={{
                height: '30%',
                top: '45%',
                right: '12%',
                animation: 'caretBlink 4s ease-in-out infinite',
                animationDelay: '1.6s',
              }}
            />
            <div
              className="absolute w-[2px] rounded-full bg-background/[0.06] hidden md:block"
              style={{
                height: '20%',
                top: '15%',
                right: '30%',
                animation: 'caretBlink 5s ease-in-out infinite',
                animationDelay: '2.8s',
              }}
            />
          </div>

          <style>{`
            @keyframes caretBlink {
              0%, 100% { opacity: 0; }
              30%, 70% { opacity: 1; }
            }
          `}</style>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-background">
                Blog
              </h1>
              <p className="text-xl text-background/80">
                Insights, stories, and practical advice for administrators and leaders
              </p>
            </div>
          </div>
        </section>

        {/* Blog Library */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Search & Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 px-4 shrink-0"
                  onClick={() =>
                    setSortOrder((s) => (s === "newest" ? "oldest" : "newest"))
                  }
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortOrder === "newest" ? "Newest" : "Oldest"}
                </Button>
              </div>

              {/* Mobile topic filter */}
              <div className="lg:hidden mb-6">
                <BlogTopicFilter
                  selected={selectedTopics}
                  onChange={setSelectedTopics}
                />
              </div>

              {/* Sidebar + Blog List */}
              <div className="flex gap-10">
                {/* Desktop sidebar */}
                <BlogTopicFilter
                  selected={selectedTopics}
                  onChange={setSelectedTopics}
                />

                {/* Blog grid */}
                <div className="flex-1">
                  {filteredBlogs.length === 0 ? (
                    <p className="text-center py-16 text-muted-foreground">
                      No posts match your filters. Try adjusting your search or topics.
                    </p>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 animate-fade-in">
                        {visibleBlogs.map((blog) => (
                          <BlogCard key={blog.slug} {...blog} />
                        ))}
                      </div>
                      {hasMore && (
                        <div className="text-center pt-8">
                          <Button
                            variant="outline"
                            className="px-8"
                            onClick={() =>
                              setVisibleCount((c) => c + POSTS_PER_PAGE)
                            }
                          >
                            Load More Posts
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Showing {visibleBlogs.length} of {filteredBlogs.length} posts
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
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
