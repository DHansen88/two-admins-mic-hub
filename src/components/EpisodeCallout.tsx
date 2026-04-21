/**
 * EpisodeCallout
 * "Listen to the Episode" callout block for blog articles linked to podcast episodes.
 * Desktop: horizontal card. Mobile: stacked vertical.
 */

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Mic, Play, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Episode } from "@/lib/content-loader";
import EpisodePlatformLinks from "@/components/EpisodePlatformLinks";

interface EpisodeCalloutProps {
  episode: Episode;
}

const EpisodeCallout = ({ episode }: EpisodeCalloutProps) => {
  const hasRiverside = !!episode.riversideEmbedUrl;
  const imageCandidates = [
    episode.guest?.image,
    episode.thumbnailUrl && episode.thumbnailUrl !== "/placeholder.svg" ? episode.thumbnailUrl : undefined,
    "/placeholder.svg",
  ].filter(Boolean) as string[];
  const [calloutImage, setCalloutImage] = useState(imageCandidates[0] || "/placeholder.svg");

  useEffect(() => {
    setCalloutImage(imageCandidates[0] || "/placeholder.svg");
  }, [episode.guest?.image, episode.thumbnailUrl]);

  return (
    <div className="mb-10 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 border-b border-primary/10">
        <Mic className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Listen to the Episode
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-5 p-5 md:p-6">
        {/* Thumbnail / Embed */}
        <div className="md:w-72 shrink-0">
          {hasRiverside ? (
            <div className="rounded-lg overflow-hidden aspect-video bg-muted">
              <iframe
                src={episode.riversideEmbedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={`Watch: ${episode.title}`}
                loading="lazy"
              />
            </div>
          ) : (
            <Link
              to={`/episodes/${episode.slug}`}
              className="block rounded-lg overflow-hidden aspect-video bg-muted relative group"
            >
              <img
                src={calloutImage}
                alt={episode.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => {
                  const currentIndex = imageCandidates.indexOf(calloutImage);
                  const nextImage = imageCandidates[currentIndex + 1];
                  if (nextImage && nextImage !== calloutImage) {
                    setCalloutImage(nextImage);
                  }
                }}
              />
              <div className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-10 w-10 text-primary-foreground" fill="currentColor" />
              </div>
            </Link>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Episode {episode.number} · {episode.duration}
            </p>
            <Link
              to={`/episodes/${episode.slug}`}
              className="font-display font-bold text-foreground text-lg leading-snug hover:text-primary transition-colors line-clamp-2"
            >
              {episode.title}
            </Link>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {episode.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button asChild size="sm" className="gap-1.5">
              <Link to={`/episodes/${episode.slug}`}>
                <Headphones className="h-3.5 w-3.5" />
                Full Episode
              </Link>
            </Button>

            <EpisodePlatformLinks
              links={episode.platformLinks}
              theme="light"
              compact
              showLabel={false}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeCallout;
