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
        <section className="py-20 bg-gradient-to-br from-slate via-navy to-deep-blue">
          <div className="container mx-auto px-4">
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
