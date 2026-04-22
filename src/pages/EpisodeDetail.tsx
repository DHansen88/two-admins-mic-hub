import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedContentCarousel, { buildRelatedItems } from "@/components/RelatedContentCarousel";
import TopicTag from "@/components/TopicTag";
import GuestSection from "@/components/GuestSection";
import EpisodeAudioHero from "@/components/EpisodeAudioHero";
import EpisodePlatformLinks from "@/components/EpisodePlatformLinks";
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
  const { episode, isLoading } = useVisibleEpisodeBySlug(slug || "");
  const relatedEpisodes = useVisibleRelatedEpisodes(episode);
  const relatedBlogs = useVisibleRelatedBlogsForEpisode(slug || "", 3);
  const hasVideo = !!episode?.riversideEmbedUrl;
  const hasAudio = !!episode?.audioUrl;
  const isAudioOnly = !hasVideo && hasAudio;
  const heroImageCandidates = (
    isAudioOnly
      ? [
          episode?.guest?.image,
          episode?.thumbnailUrl && episode.thumbnailUrl !== "/placeholder.svg" ? episode.thumbnailUrl : undefined,
          "/placeholder.svg",
        ]
      : [
          episode?.thumbnailUrl && episode.thumbnailUrl !== "/placeholder.svg" ? episode.thumbnailUrl : undefined,
          episode?.guest?.image,
          "/placeholder.svg",
        ]
  ).filter(Boolean) as string[];
  const [heroImage, setHeroImage] = useState(heroImageCandidates[0] || "/placeholder.svg");

  useEffect(() => {
    setHeroImage(heroImageCandidates[0] || "/placeholder.svg");
  }, [episode?.thumbnailUrl, episode?.guest?.image, isAudioOnly]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16 sm:py-20">
            <div className="max-w-6xl mx-auto animate-pulse space-y-8">
              <div className="h-5 w-32 rounded bg-muted/70" />
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)] gap-5 sm:gap-6 lg:gap-10 xl:gap-12 items-start">
                <div className="aspect-square rounded-2xl bg-muted/70 max-w-[260px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-none w-full mx-auto lg:mx-0" />
                <div className="space-y-4 sm:space-y-5">
                  <div className="h-16 sm:h-24 w-full rounded bg-muted/70" />
                  <div className="space-y-3">
                    <div className="h-4 w-full rounded bg-muted/60" />
                    <div className="h-4 w-[92%] rounded bg-muted/60" />
                    <div className="h-4 w-[85%] rounded bg-muted/60" />
                  </div>
                  <div className="h-8 w-72 rounded bg-muted/60" />
                  <div className="h-28 rounded-2xl bg-background/80" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

  const ShareRow = (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
      <span className="text-background/60 text-xs sm:text-sm flex items-center gap-1.5">
        <Share2 size={14} /> Share
      </span>
      <button
        onClick={copyLink}
        className="p-2 rounded-full hover:bg-background/15 transition-colors text-background/70 hover:text-background min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
        title="Copy link"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      <button
        onClick={shareLinkedIn}
        className="p-2 rounded-full hover:bg-background/15 transition-colors text-background/70 hover:text-background min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </button>
      <button
        onClick={shareEmail}
        className="p-2 rounded-full hover:bg-background/15 transition-colors text-background/70 hover:text-background min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
        title="Share via email"
      >
        <Mail className="h-4 w-4" />
      </button>
    </div>
  );

  const MetaRow = (
    <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-sm text-background/70">
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

  const TopicsSection = (
    <div className="bg-muted/20 border-y border-border overflow-x-hidden">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-sm font-display font-bold uppercase tracking-widest text-foreground/80 mb-3">
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
  );
  const hasSupplementalContent =
    Boolean(episode.clips && episode.clips.length > 0)
    || Boolean(episode.showNotes && episode.showNotes.length > 0);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background">
      <Header />
      <main className="w-full max-w-full overflow-x-hidden">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate to-navy overflow-x-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
              {/* Back link */}
              <Link
                to="/episodes"
                className="inline-flex items-center space-x-2 text-xs sm:text-sm text-background/70 hover:text-background transition-colors"
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

                  <div className="space-y-4 text-background min-w-0 overflow-hidden">
                    <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-5xl font-display font-bold leading-[0.95] tracking-tight text-balance [overflow-wrap:anywhere]">
                      {episode.title}
                    </h1>
                    <div
                      className="prose prose-invert prose-sm sm:prose-base max-w-3xl text-background/80 leading-relaxed [&_p]:my-2 [&_a]:text-accent [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: episode.description }}
                    />
                    {MetaRow}
                    <EpisodePlatformLinks links={episode.platformLinks} theme="dark" />
                    {ShareRow}
                  </div>
                </>
              ) : isAudioOnly ? (
                /* ───── Audio Hero: image left, meta + player right ───── */
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)] gap-5 sm:gap-6 lg:gap-10 xl:gap-12 items-start">
                  {/* Image */}
                  <div className="space-y-4 sm:space-y-5">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-foreground/10 shadow-xl max-w-[260px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-none w-full mx-auto lg:mx-0">
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
                    </div>
                    <EpisodePlatformLinks links={episode.platformLinks} theme="dark" />
                  </div>

                  {/* Meta + Player */}
                  <div className="space-y-4 sm:space-y-5 text-background min-w-0 overflow-hidden">
                    <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.8rem] xl:text-6xl font-display font-bold leading-[0.95] tracking-tight text-balance [overflow-wrap:anywhere]">
                      {episode.title}
                    </h1>
                    <div
                      className="prose prose-invert prose-sm sm:prose-base max-w-none text-background/80 leading-relaxed [&_p]:my-2 [&_a]:text-accent [&_a]:underline [&_strong]:text-background [&_strong]:font-semibold"
                      dangerouslySetInnerHTML={{ __html: episode.description }}
                    />
                    {MetaRow}
                    <EpisodeAudioHero
                      audioUrl={episode.audioUrl!}
                      title={episode.title}
                    />
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

                  <div className="space-y-4 text-background min-w-0 overflow-hidden">
                    <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-5xl font-display font-bold leading-[0.95] tracking-tight text-balance [overflow-wrap:anywhere]">
                      {episode.title}
                    </h1>
                    <div
                      className="prose prose-invert prose-sm sm:prose-base max-w-3xl text-background/80 leading-relaxed [&_p]:my-2 [&_a]:text-accent [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: episode.description }}
                    />
                    {MetaRow}
                    <EpisodePlatformLinks links={episode.platformLinks} theme="dark" />
                    {ShareRow}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Meet the Guest */}
        {episode.guest && <GuestSection guest={episode.guest} topics={episode.topics} />}
        {!episode.guest && episode.topics.length > 0 && TopicsSection}

        {/* Content Body */}
        {hasSupplementalContent && (
          <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
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
        )}

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
