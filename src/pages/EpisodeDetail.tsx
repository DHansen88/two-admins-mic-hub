import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedContentCarousel, { buildRelatedItems } from "@/components/RelatedContentCarousel";
import TopicTag from "@/components/TopicTag";
import { Button } from "@/components/ui/button";
import {
  getEpisodeBySlug,
  getRelatedEpisodes,
} from "@/data/episodeData";
import { getRelatedBlogsForEpisode } from "@/data/crossLinks";
import {
  Play,
  Clock,
  Calendar,
  Link as LinkIcon,
  Linkedin,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  Share2,
  ArrowLeft,
  Lightbulb,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const EpisodeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const episode = getEpisodeBySlug(slug || "");
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState("");

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

  const relatedEpisodes = getRelatedEpisodes(episode);
  const relatedBlogs = getRelatedBlogsForEpisode(slug || "", 3);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  };

  const shareEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(episode.title)}&body=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  };

  const transcriptText = episode.transcript || "";
  const transcriptPreviewLength = 600;
  const hasLongTranscript = transcriptText.length > transcriptPreviewLength;

  const highlightSearch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.replace(
      regex,
      '<mark class="bg-accent/30 rounded px-0.5">$1</mark>'
    );
  };

  const displayedTranscript = transcriptExpanded
    ? transcriptText
    : transcriptText.slice(0, transcriptPreviewLength) +
      (hasLongTranscript ? "..." : "");

  const hasVideo = !!episode.riversideEmbedUrl;
  const hasAudio = !!episode.audioUrl;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section — aligned structure with BlogPost */}
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

              {/* Riverside Video Embed — primary hero element */}
              {hasVideo ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-foreground/10">
                  <iframe
                    src={episode.riversideEmbedUrl}
                    title={episode.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : hasAudio ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-foreground/10">
                  <img
                    src={episode.thumbnailUrl || "/placeholder.svg"}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent">
                    <audio
                      src={episode.audioUrl}
                      controls
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-foreground/10">
                  <img
                    src={episode.thumbnailUrl || "/placeholder.svg"}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                    <div className="w-20 h-20 rounded-full bg-background/80 flex items-center justify-center">
                      <Play className="h-8 w-8 text-foreground ml-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Episode Info — aligned with BlogPost header structure */}
              <div className="space-y-4 text-background">
                {/* Topic Tags (clickable) */}
                <div className="flex flex-wrap gap-2">
                  {episode.topics.map((topic) => (
                    <TopicTag key={topic} topic={topic} variant="light" />
                  ))}
                </div>

                {/* Title (H1) */}
                <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                  {episode.title}
                </h1>

                {/* Description / intro */}
                <p className="text-lg text-background/70 leading-relaxed max-w-3xl">
                  {episode.description}
                </p>

                {/* Meta info — matching blog layout */}
                <div className="flex flex-wrap items-center gap-6 text-background/70">
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
                </div>

                {/* Share Actions — matching blog layout */}
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
              </div>
            </div>
          </div>
        </section>

        {/* Listen On Platforms */}
        {episode.platformLinks && (
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

        {/* Content Body — consistent spacing with blog */}
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

            {/* Transcript */}
            {transcriptText && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    Transcript
                  </h2>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(transcriptText)
                    }
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Copy transcript
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search in transcript..."
                    value={transcriptSearch}
                    onChange={(e) => {
                      setTranscriptSearch(e.target.value);
                      if (e.target.value) setTranscriptExpanded(true);
                    }}
                    className="pl-10 h-10"
                  />
                </div>

                <div className="bg-muted/40 rounded-lg p-6 border border-border">
                  <div
                    className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: highlightSearch(
                        displayedTranscript,
                        transcriptSearch
                      ),
                    }}
                  />
                  {hasLongTranscript && (
                    <button
                      onClick={() =>
                        setTranscriptExpanded(!transcriptExpanded)
                      }
                      className="mt-4 flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                    >
                      {transcriptExpanded ? (
                        <>
                          Show less <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Read full transcript{" "}
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Key Takeaways / Show Notes — styled same as blog key takeaways */}
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

        {/* Topic Tags at bottom — matching blog */}
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
