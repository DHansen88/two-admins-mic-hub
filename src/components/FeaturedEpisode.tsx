import { Clock, Play, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Episode } from "@/data/episodeData";
import { stripHtml } from "@/lib/html-utils";
import EpisodeAudioHero from "./EpisodeAudioHero";

interface FeaturedEpisodeProps {
  episode: Episode;
}

const FeaturedEpisode = ({ episode }: FeaturedEpisodeProps) => {
  const navigate = useNavigate();
  const [audioActive, setAudioActive] = useState(false);

  const hasVideo = !!episode.riversideEmbedUrl;
  const hasAudio = !!episode.audioUrl;
  const isAudioOnly = !hasVideo && hasAudio;

  const imageCandidates = [
    episode.guest?.image,
    episode.thumbnailUrl && episode.thumbnailUrl !== "/placeholder.svg" ? episode.thumbnailUrl : undefined,
    "/placeholder.svg",
  ].filter(Boolean) as string[];
  const [heroImage, setHeroImage] = useState(imageCandidates[0] || "/placeholder.svg");

  useEffect(() => {
    setHeroImage(imageCandidates[0] || "/placeholder.svg");
  }, [episode.guest?.image, episode.thumbnailUrl]);

  const plainDescription = stripHtml(episode.description);

  const goToDetail = () => navigate(`/episodes/${episode.slug}`);

  return (
    <section className="bg-muted/40 border-b border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <p className="text-sm font-bold uppercase tracking-widest text-accent mb-6">
          Latest Episode
        </p>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Image / Player visual */}
          <div className="w-full md:w-[320px] lg:w-[440px] xl:w-[520px] shrink-0">
            <button
              type="button"
              onClick={() => {
                if (isAudioOnly) {
                  setAudioActive(true);
                } else {
                  goToDetail();
                }
              }}
              aria-label={isAudioOnly ? "Play audio episode" : "Open episode"}
              className="group relative w-full aspect-video rounded-lg overflow-hidden bg-muted block"
            >
              <img
                src={heroImage}
                alt={episode.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => {
                  const currentIndex = imageCandidates.indexOf(heroImage);
                  const nextImage = imageCandidates[currentIndex + 1];
                  if (nextImage && nextImage !== heroImage) {
                    setHeroImage(nextImage);
                  }
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center bg-foreground/10 group-hover:bg-foreground/20 transition-colors">
                <span className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isAudioOnly ? (
                    <Headphones className="h-7 w-7 text-foreground" />
                  ) : (
                    <Play className="h-7 w-7 text-foreground ml-1" />
                  )}
                </span>
              </span>
              {isAudioOnly && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-background/90 text-foreground px-2.5 py-1 rounded-full">
                  <Headphones className="h-3 w-3" /> Audio
                </span>
              )}
            </button>

            {/* Inline audio player appears below image when activated */}
            {isAudioOnly && audioActive && episode.audioUrl && (
              <div className="mt-3">
                <EpisodeAudioHero
                  audioUrl={episode.audioUrl}
                  title={episode.title}
                  autoPlay
                />
              </div>
            )}
          </div>

          {/* Info — clicking title still navigates to detail page */}
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

            <h2
              className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight hover:text-accent transition-colors cursor-pointer"
              onClick={goToDetail}
            >
              {episode.title}
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed line-clamp-2">
              {plainDescription}
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
