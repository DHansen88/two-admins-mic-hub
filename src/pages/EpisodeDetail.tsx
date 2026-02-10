import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EpisodeCard from "@/components/EpisodeCard";
import { Button } from "@/components/ui/button";
import {
  getEpisodeBySlug,
  getRelatedEpisodes,
} from "@/data/episodeData";
import {
  Play,
  Clock,
  Link as LinkIcon,
  Linkedin,
  Mail,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
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
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, '<mark class="bg-accent/30 rounded px-0.5">$1</mark>');
  };

  const displayedTranscript = transcriptExpanded
    ? transcriptText
    : transcriptText.slice(0, transcriptPreviewLength) +
      (hasLongTranscript ? "..." : "");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate via-navy to-deep-blue">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
              {/* Video / Audio Player */}
              <div className="w-full lg:w-[560px] shrink-0">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-foreground/10">
                  {episode.videoUrl ? (
                    <video
                      src={episode.videoUrl}
                      poster={episode.thumbnailUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : episode.audioUrl ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                      <img
                        src={episode.thumbnailUrl || "/placeholder.svg"}
                        alt={episode.title}
                        className="w-full h-full object-cover absolute inset-0"
                      />
                      <div className="relative z-10 w-full mt-auto p-4">
                        <audio src={episode.audioUrl} controls className="w-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <img
                        src={episode.thumbnailUrl || "/placeholder.svg"}
                        alt={episode.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                        <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center">
                          <Play className="h-7 w-7 text-foreground ml-1" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Episode Info */}
              <div className="flex-1 space-y-4 text-background">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs">
                    Episode {episode.number}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-background/70">
                    <Clock className="h-3.5 w-3.5" />
                    {episode.duration}
                  </span>
                  <span className="text-sm text-background/70">{episode.date}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight">
                  {episode.title}
                </h1>

                <p className="text-lg text-background/80 leading-relaxed">
                  {episode.description}
                </p>

                {episode.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {episode.topics.map((topic) => (
                      <span
                        key={topic}
                        className="text-xs bg-background/15 text-background px-3 py-1 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Share Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm text-background/60 mr-1">Share:</span>
                  <button
                    onClick={copyLink}
                    className="p-2 rounded-full hover:bg-background/15 transition-colors text-background/70 hover:text-background"
                    title="Copy link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={shareLinkedIn}
                    className="p-2 rounded-full hover:bg-background/15 transition-colors text-background/70 hover:text-background"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </button>
                  <button
                    onClick={shareEmail}
                    className="p-2 rounded-full hover:bg-background/15 transition-colors text-background/70 hover:text-background"
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
                <span className="text-sm font-semibold text-foreground">Listen on:</span>
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

        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Shareable Clips */}
            {episode.clips && episode.clips.length > 0 && (
              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  Shareable Clips
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {episode.clips.map((clip, i) => (
                    <div
                      key={i}
                      className="border border-border rounded-lg p-4 flex items-center justify-between gap-4 hover:border-accent transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Play className="h-4 w-4 text-foreground ml-0.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {clip.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{clip.duration}</p>
                        </div>
                      </div>
                      <a
                        href={clip.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Download clip"
                      >
                        <Download className="h-4 w-4" />
                      </a>
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
                    onClick={() => navigator.clipboard.writeText(transcriptText)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Copy transcript
                  </button>
                </div>

                {/* Search in transcript */}
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
                      __html: highlightSearch(displayedTranscript, transcriptSearch),
                    }}
                  />
                  {hasLongTranscript && (
                    <button
                      onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                      className="mt-4 flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                    >
                      {transcriptExpanded ? (
                        <>
                          Show less <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Read full transcript <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Show Notes */}
            {episode.showNotes && episode.showNotes.length > 0 && (
              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
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

        {/* Related Episodes */}
        {relatedEpisodes.length > 0 && (
          <section className="bg-muted/40 border-t border-border py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-display font-bold text-foreground mb-8">
                  You May Also Like
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {relatedEpisodes.map((ep) => (
                    <EpisodeCard key={ep.number} {...ep} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EpisodeDetail;
