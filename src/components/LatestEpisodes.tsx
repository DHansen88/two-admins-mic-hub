import EpisodeCard from "./EpisodeCard";

const episodes = [
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
  }
];

const LatestEpisodes = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Latest Episodes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Catch up on our most recent conversations about leadership, administration, and professional growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 animate-slide-in">
            {episodes.map((episode) => (
              <EpisodeCard key={episode.number} {...episode} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestEpisodes;
