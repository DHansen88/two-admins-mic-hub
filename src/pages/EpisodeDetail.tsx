import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedContentCarousel, { buildRelatedItems } from "@/components/RelatedContentCarousel";
import TopicTag from "@/components/TopicTag";
import GuestSection from "@/components/GuestSection";
import EpisodeAudioHero from "@/components/EpisodeAudioHero";
import { Button } from "@/components/ui/button";
import {
  useVisibleEpisodeBySlug,
  useVisibleRelatedEpisodes,
  useVisibleRelatedBlogsForEpisode,
} from "@/hooks/useVisibleContent";
import {
  Play,
  Clock,
  Calendar,
  Link as LinkIcon,
  Linkedin,
  Mail,
  ExternalLink,
  Share2,
  ArrowLeft,
  Lightbulb,
  Headphones,
} from "lucide-react";

const EpisodeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const episode = useVisibleEpisodeBySlug(slug || "");
  const relatedEpisodes = useVisibleRelatedEpisodes(episode);
  const relatedBlogs = useVisibleRelatedBlogsForEpisode(slug || "", 3);
  const [audioActive, setAudioActive] = useState(false);

  if (!episode) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-32 text-center">
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">
              Episode Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The episode you're looking for doesn't exist.
            </p>
            <Link to="/episodes">
              <Button>Back to Episodes</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const copyLink = () => navigator.clipboard.writeText(window.location.href);
  const shareLinkedIn = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  const shareEmail = () =>
    window.open(
      `mailto:?subject=${encodeURIComponent(episode.title)}&body=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );

  const hasVideo = !!episode.riversideEmbedUrl;
  const hasAudio = !!episode.audioUrl;
  const isAudioOnly = !hasVideo && hasAudio;

  // Image fallback: guest → thumbnail → placeholder (audio prefers guest)
  const heroImageCandidates = (
    isAudioOnly
      ? [
          episode.guest?.image,
          episode.thumbnailUrl && episode.thumbnailUrl !== "/placeholder.svg" ? episode.thumbnailUrl : undefined,
          "/placeholder.svg",
        ]
      : [
          episode.thumbnailUrl && episode.thumbnailUrl !== "/placeholder.svg" ? episode.thumbnailUrl : undefined,
          episode.guest?.image,
          "/placeholder.svg",
        ]
  ).filter(Boolean) as string[];
  const [heroImage, setHeroImage] = useState(heroImageCandidates[0] || "/placeholder.svg");

  useEffect(() => {
    setHeroImage(heroImageCandidates[0] || "/placeholder.svg");
  }, [episode.thumbnailUrl, episode.guest?.image, isAudioOnly]);

  const ShareRow = (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-background/60 text-sm flex items-center gap-1.5">
        <Share2 size={14} /> Share
      </span>
      <button
        onClick={copyLink}
        className="p-2.5 rounded-full hover:bg-background/15 transition-colors text-background/70 hover:text-background min-w-[44px] min-h-[44px] flex items-center justify-center"
        title="Copy link"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      <button
        onClick={shareLinkedIn}
        className="p-2.5 rounded-full hover:bg-background/15 transition-colors text-background/70 hover:text-background min-w-[44px] min-h-[44px] flex items-center justify-center"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </button>
      <button
        onClick={shareEmail}
        className="p-2.5 rounded-full hover:bg-background/15 transition-colors text-background/70 hover:text-background min-w-[44px] min-h-[44px] flex items-center justify-center"
        title="Share via email"
      >
        <Mail className="h-4 w-4" />
      </button>
    </div>
  );

  const MetaRow = (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-background/70">
      <span className="font-bold bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs">
        Episode {episode.number}
      </span>
      <span className="flex items-center space-x-2">
        <Calendar size={16} />
        <span>{episode.date}</span>
      </span>
      <span className="flex items-center space-x-2">
        <Clock size={16} />
        <span>{episode.duration}</span>
      </span>
      {isAudioOnly && (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-background/15 text-background px-2.5 py-1 rounded-full">
          <Headphones className="h-3 w-3" /> Audio
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate to-navy">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Back link */}
              <Link
                to="/episodes"
                className="inline-flex items-center space-x-2 text-background/70 hover:text-background transition-colors"
              >
                <ArrowLeft size={18} />
                <span>Back to Episodes</span>
              </Link>

              {hasVideo ? (
                /* ───── Video Hero (unchanged behavior) ───── */
                <>
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-foreground/10">
                    <iframe
                      src={episode.riversideEmbedUrl}
                      title={episode.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <div className="space-y-4 text-background">
                    <div className="flex flex-wrap gap-2">
                      {episode.topics.map((topic) => (
                        <TopicTag key={topic} topic={topic} variant="light" />
                      ))}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                      {episode.title}
                    </h1>
                    <div
                      className="prose prose-invert max-w-3xl text-background/80 leading-relaxed [&_p]:my-2 [&_a]:text-accent [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: episode.description }}
                    />
                    {MetaRow}
                    {ShareRow}
                  </div>
                </>
              ) : isAudioOnly ? (
                /* ───── Audio Hero: image left, meta + player right ───── */
                <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-8 items-center">
                  {/* Image */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-foreground/10 shadow-xl max-w-md w-full mx-auto md:mx-0">
                    <img
                      src={heroImage}
                      alt={episode.title}
                      className="w-full h-full object-cover"
                      onError={() => {
                        const currentIndex = heroImageCandidates.indexOf(heroImage);
                        const nextImage = heroImageCandidates[currentIndex + 1];
                        if (nextImage && nextImage !== heroImage) {
                          setHeroImage(nextImage);
                        }
                      }}
                    />
                    {!audioActive && (
                      <button
                        type="button"
                        onClick={() => setAudioActive(true)}
                        aria-label="Listen to episode"
                        className="absolute inset-0 flex items-center justify-center bg-foreground/10 hover:bg-foreground/25 transition-colors group"
                      >
                        <span className="w-20 h-20 rounded-full bg-background/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Headphones className="h-9 w-9 text-foreground" />
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Meta + Player */}
                  <div className="space-y-5 text-background">
                    <div className="flex flex-wrap gap-2">
                      {episode.topics.map((topic) => (
                        <TopicTag key={topic} topic={topic} variant="light" />
                      ))}
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight">
                      {episode.title}
                    </h1>
                    <div
                      className="prose prose-invert max-w-none text-background/80 leading-relaxed [&_p]:my-2 [&_a]:text-accent [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: episode.description }}
                    />
                    {MetaRow}

                    {/* Audio player — always rendered, autoPlay only when activated */}
                    {audioActive ? (
                      <EpisodeAudioHero
                        audioUrl={episode.audioUrl!}
                        title={episode.title}
                        autoPlay
                      />
                    ) : (
                      <Button
                        size="lg"
                        className="gap-2"
                        onClick={() => setAudioActive(true)}
                      >
                        <Headphones className="h-5 w-5" /> Listen now
                      </Button>
                    )}

                    {ShareRow}
                  </div>
                </div>
              ) : (
                /* ───── No media fallback ───── */
                <>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-foreground/10">
                    <img
                      src={heroImage}
                      alt={episode.title}
                      className="w-full h-full object-cover"
                      onError={() => {
                        const currentIndex = heroImageCandidates.indexOf(heroImage);
                        const nextImage = heroImageCandidates[currentIndex + 1];
                        if (nextImage && nextImage !== heroImage) {
                          setHeroImage(nextImage);
                        }
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                      <div className="w-20 h-20 rounded-full bg-background/80 flex items-center justify-center">
                        <Play className="h-8 w-8 text-foreground ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-background">
                    <div className="flex flex-wrap gap-2">
                      {episode.topics.map((topic) => (
                        <TopicTag key={topic} topic={topic} variant="light" />
                      ))}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                      {episode.title}
                    </h1>
                    <div
                      className="prose prose-invert max-w-3xl text-background/80 leading-relaxed [&_p]:my-2 [&_a]:text-accent [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: episode.description }}
                    />
                    {MetaRow}
                    {ShareRow}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Listen On Platforms */}
        {episode.platformLinks &&
          (episode.platformLinks.apple ||
            episode.platformLinks.spotify ||
            episode.platformLinks.youtube ||
            (episode.platformLinks.other && episode.platformLinks.other.length > 0)) && (
            <section className="border-b border-border bg-muted/40">
              <div className="container mx-auto px-4 py-6">
                <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
                  <span className="text-sm font-semibold text-foreground">
                    Listen on:
                  </span>
                  {episode.platformLinks.apple && (
                    <a
                      href={episode.platformLinks.apple}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors text-sm font-medium text-foreground"
                    >
                      🎧 Apple Podcasts
                    </a>
                  )}
                  {episode.platformLinks.spotify && (
                    <a
                      href={episode.platformLinks.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors text-sm font-medium text-foreground"
                    >
                      🎵 Spotify
                    </a>
                  )}
                  {episode.platformLinks.youtube && (
                    <a
                      href={episode.platformLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors text-sm font-medium text-foreground"
                    >
                      ▶️ YouTube
                    </a>
                  )}
                  {episode.platformLinks.other?.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors text-sm font-medium text-foreground"
                    >
                      {platform.name}
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}

        {/* Meet the Guest */}
        {episode.guest && <GuestSection guest={episode.guest} />}

        {/* Content Body */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Shareable Clips */}
            {episode.clips && episode.clips.length > 0 && (
              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  Shareable Clips
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {episode.clips.map((clip, i) => (
                    <div
                      key={i}
                      className="border border-border rounded-lg overflow-hidden hover:border-accent transition-colors"
                    >
                      {clip.embedUrl ? (
                        <div className="aspect-video">
                          <iframe
                            src={clip.embedUrl}
                            title={clip.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : clip.mp4Url ? (
                        <div className="aspect-video bg-muted">
                          <video
                            src={clip.mp4Url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Play className="h-4 w-4 text-foreground ml-0.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {clip.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {clip.duration}
                            </p>
                          </div>
                        </div>
                        {(clip.embedUrl || clip.mp4Url) && (
                          <a
                            href={clip.embedUrl || clip.mp4Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Open clip"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key Takeaways / Show Notes */}
            {episode.showNotes && episode.showNotes.length > 0 && (
              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-accent" />
                  Key Takeaways
                </h2>
                <ul className="space-y-3">
                  {episode.showNotes.map((note, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-foreground/80"
                    >
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                      <span className="text-sm leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* Topic Tags at bottom */}
        <div className="bg-background py-8 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {episode.topics.map((topic) => (
                  <TopicTag key={topic} topic={topic} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Content Carousel */}
        <RelatedContentCarousel
          items={buildRelatedItems(relatedBlogs, relatedEpisodes)}
        />
      </main>
      <Footer />
    </div>
  );
};

export default EpisodeDetail;
