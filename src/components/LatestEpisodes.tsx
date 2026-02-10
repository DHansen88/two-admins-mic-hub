import EpisodeCard from "./EpisodeCard";
import { allEpisodes } from "@/data/episodeData";

const LatestEpisodes = () => {
  const episodes = allEpisodes.slice(0, 4);

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
