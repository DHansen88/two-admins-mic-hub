import { Card } from "./ui/card";
import { Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Episode } from "@/data/episodeData";

interface EpisodeCardProps extends Episode {}

const EpisodeCard = (episode: EpisodeCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-border hover:border-accent cursor-pointer"
      onClick={() => navigate(`/episodes/${episode.slug}`)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail / Video Preview */}
        <div className="relative w-full md:w-64 lg:w-72 shrink-0 aspect-video md:aspect-auto bg-muted overflow-hidden">
          {episode.videoUrl ? (
            <video
              src={episode.videoUrl}
              poster={episode.thumbnailUrl}
              muted
              playsInline
              className="w-full h-full object-cover"
              onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
          ) : (
            <img
              src={episode.thumbnailUrl || "/placeholder.svg"}
              alt={episode.title}
              className="w-full h-full object-cover"
            />
          )}
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/10 group-hover:bg-foreground/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="h-5 w-5 text-foreground ml-0.5" />
            </div>
          </div>
        </div>

        {/* Episode Info */}
        <div className="p-5 md:p-6 space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Episode {episode.number}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {episode.duration}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {episode.date}
            </span>
          </div>

          <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
            {episode.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {episode.description}
          </p>

          {episode.topics && episode.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {episode.topics.map((topic) => (
                <span
                  key={topic}
                  className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EpisodeCard;
