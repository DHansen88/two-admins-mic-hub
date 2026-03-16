import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EpisodeCard from "@/components/EpisodeCard";
import FeaturedEpisode from "@/components/FeaturedEpisode";
import TopicFilter from "@/components/TopicFilter";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { allEpisodes, type Topic } from "@/data/episodeData";
import { Button } from "@/components/ui/button";

const EPISODES_PER_PAGE = 5;

const Episodes = () => {
  const [search, setSearch] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const latestEpisode = allEpisodes[0];

  const filteredEpisodes = useMemo(() => {
    const query = search.toLowerCase().trim();
    let episodes = [...allEpisodes];

    // Filter by topics
    if (selectedTopics.length > 0) {
      episodes = episodes.filter((ep) =>
        selectedTopics.some((topic) => ep.topics.includes(topic))
      );
    }

    // Filter by search
    if (query) {
      episodes = episodes.filter(
        (ep) =>
          ep.title.toLowerCase().includes(query) ||
          ep.description.toLowerCase().includes(query) ||
          ep.topics.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Sort
    episodes.sort((a, b) =>
      sortOrder === "newest" ? b.number - a.number : a.number - b.number
    );

    return episodes;
  }, [search, selectedTopics, sortOrder]);

  // Reset to page 1 when filters change
  const resetKey = `${search}-${selectedTopics.join()}-${sortOrder}`;
  useMemo(() => setCurrentPage(1), [resetKey]);

  const totalPages = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);
  const visibleEpisodes = filteredEpisodes.slice((currentPage - 1) * EPISODES_PER_PAGE, currentPage * EPISODES_PER_PAGE);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-slate via-navy to-deep-blue overflow-hidden">
          {/* Sound wave graphic */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0.13 }}
          >
            <svg
              viewBox="0 0 1200 200"
              className="w-full max-w-[1400px] h-auto"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <style>{`
                @keyframes eq-pulse-ep {
                  0%, 100% { transform: scaleY(1); }
                  50% { transform: scaleY(0.6); }
                }
              `}</style>
              {Array.from({ length: 80 }).map((_, i) => {
                const center = 40;
                const dist = Math.abs(i - center) / center;
                const height = Math.max(
                  8,
                  (1 - dist * dist) * 180 * (0.5 + 0.5 * Math.sin(i * 0.7))
                );
                const x = (i / 80) * 1200 + 7.5;
                const delay = (Math.sin(i * 0.5) * 1.5 + 1.5).toFixed(2);
                const duration = (2 + Math.sin(i * 0.3) * 1).toFixed(2);
                return (
                  <rect
                    key={i}
                    x={x}
                    y={100 - height / 2}
                    width={6}
                    height={height}
                    rx={3}
                    fill="hsl(var(--slate))"
                    style={{
                      transformOrigin: `${x + 3}px 100px`,
                      animation: `eq-pulse-ep ${duration}s ease-in-out ${delay}s infinite`,
                    }}
                  />
                );
              })}
            </svg>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-background">
                All Episodes
              </h1>
              <p className="text-xl md:text-2xl text-background/80">
                Explore our complete collection of leadership conversations
              </p>
            </div>
          </div>
        </section>

        {/* Featured Latest Episode */}
        <FeaturedEpisode episode={latestEpisode} />

        {/* Browse Episodes */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Search & Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search episodes by title, description, or topic..."
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
                    setSortOrder((s) =>
                      s === "newest" ? "oldest" : "newest"
                    )
                  }
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortOrder === "newest" ? "Newest" : "Oldest"}
                </Button>
              </div>

              {/* Sidebar + Episode List — wraps on mobile, flex row on desktop */}
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                <TopicFilter
                  selected={selectedTopics}
                  onChange={setSelectedTopics}
                />
                {/* Episode list */}
                <div className="flex-1 space-y-5">
                  {filteredEpisodes.length === 0 ? (
                    <p className="text-center py-16 text-muted-foreground">
                      No episodes match your filters. Try adjusting your search
                      or topics.
                    </p>
                  ) : (
                    <>
                      {visibleEpisodes.map((episode) => (
                        <EpisodeCard key={episode.number} {...episode} />
                      ))}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-8">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
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
                            onClick={() => setCurrentPage(p => p + 1)}
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Episodes;
