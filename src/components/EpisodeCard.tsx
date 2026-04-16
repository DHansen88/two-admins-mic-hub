import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Clock, Play, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Episode } from "@/data/episodeData";
import { stripHtml } from "@/lib/html-utils";

interface EpisodeCardProps extends Episode {
  onPlay?: (episode: Episode) => void;
}

const EpisodeCard = (episode: EpisodeCardProps) => {
  const navigate = useNavigate();
  const hostKey = episode.host || "";

  const isAudioOnly = !episode.riversideEmbedUrl && !!episode.audioUrl;

  const imageCandidates = [
    episode.guest?.image,
    episode.thumbnailUrl && episode.thumbnailUrl !== "/placeholder.svg" ? episode.thumbnailUrl : undefined,
    "/placeholder.svg",
  ].filter(Boolean) as string[];
  const [tileImage, setTileImage] = useState(imageCandidates[0] || "/placeholder.svg");

  useEffect(() => {
    setTileImage(imageCandidates[0] || "/placeholder.svg");
  }, [episode.guest?.image, episode.thumbnailUrl]);

  const plainDescription = stripHtml(episode.description);

  const goToDetail = () => {
    navigate(`/episodes/${episode.slug}`);
    window.scrollTo(0, 0);
  };

  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-border hover:border-accent cursor-pointer"
      onClick={goToDetail}
      data-host={hostKey}
      data-topic={episode.topics.map((t) => t.toLowerCase().replace(/\s+/g, "-")).join(" ")}
    >
      <div className="flex flex-col sm:flex-row sm:items-center h-full">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video sm:w-40 sm:h-28 sm:aspect-auto md:w-48 md:h-32 lg:w-56 lg:h-36 shrink-0 overflow-hidden sm:rounded-lg sm:m-4 sm:order-2">
          <img
            src={tileImage}
            alt={episode.title}
            className="w-full h-full object-cover block sm:rounded-lg"
            loading="lazy"
            onError={() => {
              const currentIndex = imageCandidates.indexOf(tileImage);
              const nextImage = imageCandidates[currentIndex + 1];
              if (nextImage && nextImage !== tileImage) {
                setTileImage(nextImage);
              }
            }}
          />
          {/* Play overlay — clicking it triggers onPlay (inline expand) without navigating */}
          <button
            type="button"
            aria-label={isAudioOnly ? "Play audio" : "Play episode"}
            className="absolute inset-0 flex items-center justify-center bg-foreground/10 group-hover:bg-foreground/20 transition-colors sm:rounded-lg"
            onClick={(e) => {
              if (episode.onPlay) {
                e.stopPropagation();
                episode.onPlay(episode);
              }
            }}
          >
            <span className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isAudioOnly ? (
                <Headphones className="h-4 w-4 text-foreground" />
              ) : (
                <Play className="h-4 w-4 text-foreground ml-0.5" />
              )}
            </span>
          </button>

          {/* Audio badge */}
          {isAudioOnly && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-background/90 text-foreground px-2 py-0.5 rounded-full">
              <Headphones className="h-3 w-3" /> Audio
            </span>
          )}
        </div>

        {/* Episode Info */}
        <div className="p-4 sm:p-5 md:p-6 space-y-2 sm:space-y-3 min-w-0 flex-1 sm:order-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Episode {episode.number}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {episode.duration}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
            {episode.title}
          </h3>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{episode.date}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {plainDescription}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default EpisodeCard;
