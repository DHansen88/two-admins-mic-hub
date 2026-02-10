import { Button } from "./ui/button";
import { Play, Clock } from "lucide-react";
import type { Episode } from "@/data/episodeData";

interface FeaturedEpisodeProps {
  episode: Episode;
}

const FeaturedEpisode = ({ episode }: FeaturedEpisodeProps) => {
  return (
    <section className="bg-muted/40 border-b border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <p className="text-sm font-bold uppercase tracking-widest text-accent mb-6">
          Latest Episode
        </p>
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-bold bg-accent text-accent-foreground px-3 py-0.5 rounded-full text-xs">
              Episode {episode.number}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {episode.duration}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
            {episode.title}
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed line-clamp-2">
            {episode.description}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button className="bg-coral-accent hover:bg-coral-accent/90">
              <Play className="h-4 w-4 mr-2" />
              Listen Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEpisode;
