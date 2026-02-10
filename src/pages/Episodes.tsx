import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EpisodeCard from "@/components/EpisodeCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const allEpisodes = [
  {
    number: 12,
    title: "Leading Through Change: Strategies for Modern Administrators",
    description: "Explore practical approaches to navigating organizational change while maintaining team morale and productivity.",
    duration: "42 min",
    date: "November 28, 2025"
  },
  {
    number: 11,
    title: "The Power of Empowerment: Building Confident Teams",
    description: "Discover how empowering your team members leads to better outcomes and a more engaged workplace culture.",
    duration: "38 min",
    date: "November 21, 2025"
  },
  {
    number: 10,
    title: "Communication Excellence in Leadership",
    description: "Master the art of clear, effective communication that inspires action and builds trust with your team.",
    duration: "45 min",
    date: "November 14, 2025"
  },
  {
    number: 9,
    title: "Time Management for Busy Administrators",
    description: "Learn proven time management techniques that help administrators balance competing priorities effectively.",
    duration: "35 min",
    date: "November 7, 2025"
  },
  {
    number: 8,
    title: "Building Resilience in Leadership Roles",
    description: "Develop the mental and emotional resilience needed to thrive in challenging leadership positions.",
    duration: "40 min",
    date: "October 31, 2025"
  },
  {
    number: 7,
    title: "Data-Driven Decision Making for Administrators",
    description: "Learn how to leverage data and analytics to make informed decisions that drive organizational success.",
    duration: "43 min",
    date: "October 24, 2025"
  },
  {
    number: 6,
    title: "Cultivating Innovation in Your Organization",
    description: "Discover strategies for fostering a culture of innovation and creative problem-solving in your team.",
    duration: "37 min",
    date: "October 17, 2025"
  },
  {
    number: 5,
    title: "Conflict Resolution Strategies for Leaders",
    description: "Master essential techniques for addressing and resolving workplace conflicts constructively.",
    duration: "41 min",
    date: "October 10, 2025"
  }
];

const Episodes = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-slate via-navy to-deep-blue overflow-hidden">
          {/* Sound wave graphic */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.10 }}>
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
                const height = Math.max(8, (1 - dist * dist) * 180 * (0.5 + 0.5 * Math.sin(i * 0.7)));
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

        {/* Search and Episodes */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-12">
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search episodes..."
                    className="pl-12 h-14 text-lg border-2 focus:border-accent"
                  />
                </div>
              </div>

              {/* Episodes Grid */}
              <div className="grid md:grid-cols-2 gap-6 animate-slide-in">
                {allEpisodes.map((episode) => (
                  <EpisodeCard key={episode.number} {...episode} />
                ))}
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
