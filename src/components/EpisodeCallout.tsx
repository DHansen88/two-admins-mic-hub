/**
 * EpisodeCallout
 * "Listen to the Episode" callout block for blog articles linked to podcast episodes.
 * Desktop: horizontal card. Mobile: stacked vertical.
 */

import { Link } from "react-router-dom";
import { Mic, Play, Headphones, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Episode } from "@/lib/content-loader";

interface EpisodeCalloutProps {
  episode: Episode;
}

const EpisodeCallout = ({ episode }: EpisodeCalloutProps) => {
  const hasRiverside = !!episode.riversideEmbedUrl;
  const platformLinks = episode.platformLinks || {};

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
                src={episode.thumbnailUrl || "/placeholder.svg"}
                alt={episode.title}
                className="w-full h-full object-cover"
                loading="lazy"
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

            {platformLinks.spotify && platformLinks.spotify !== "#" && (
              <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
                <a href={platformLinks.spotify} target="_blank" rel="noopener noreferrer">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  Spotify
                </a>
              </Button>
            )}

            {platformLinks.apple && platformLinks.apple !== "#" && (
              <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
                <a href={platformLinks.apple} target="_blank" rel="noopener noreferrer">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Apple
                </a>
              </Button>
            )}

            {platformLinks.youtube && platformLinks.youtube !== "#" && (
              <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
                <a href={platformLinks.youtube} target="_blank" rel="noopener noreferrer">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  YouTube
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeCallout;
