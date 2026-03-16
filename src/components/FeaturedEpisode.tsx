import { Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Episode } from "@/data/episodeData";

interface FeaturedEpisodeProps {
  episode: Episode;
}

const FeaturedEpisode = ({ episode }: FeaturedEpisodeProps) => {
  const navigate = useNavigate();

  return (
    <section className="bg-muted/40 border-b border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <p className="text-sm font-bold uppercase tracking-widest text-accent mb-6">
          Latest Episode
        </p>

        <div
          className="group flex flex-col md:flex-row gap-8 cursor-pointer"
          onClick={() => navigate(`/episodes/${episode.slug}`)}
        >
          {/* Thumbnail */}
          <div className="relative w-full md:w-[380px] lg:w-[520px] shrink-0 aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={episode.thumbnailUrl || "/placeholder.svg"}
              alt={episode.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/10 group-hover:bg-foreground/20 transition-colors">
              <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-7 w-7 text-foreground ml-1" />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-bold bg-accent text-accent-foreground px-3 py-0.5 rounded-full text-xs">
                Episode {episode.number}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {episode.duration}
              </span>
              <span>{episode.date}</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight group-hover:text-accent transition-colors">
              {episode.title}
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed line-clamp-2">
              {episode.description}
            </p>

            {episode.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {episode.topics.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEpisode;
