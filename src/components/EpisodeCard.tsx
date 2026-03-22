import { Card } from "./ui/card";
import { getTagByName } from "@/data/tags";
import { Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Episode } from "@/data/episodeData";

interface EpisodeCardProps extends Episode {}

const hostNames: Record<string, string> = {
  diana: "Diana",
  mel: "Mel",
};

const EpisodeCard = (episode: EpisodeCardProps) => {
  const navigate = useNavigate();
  const hostKey = episode.host || "";
  const hostName = hostNames[hostKey] || "";
  const isDiana = hostKey === "diana";
  const isMel = hostKey === "mel";

  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-border hover:border-accent cursor-pointer"
      onClick={() => {
        navigate(`/episodes/${episode.slug}`);
        window.scrollTo(0, 0);
      }}
      data-host={hostKey}
      data-topic={episode.topics.map((t) => t.toLowerCase().replace(/\s+/g, "-")).join(" ")}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[40%_60%] items-stretch h-full">
        {/* Thumbnail */}
        <div className="relative w-full h-full overflow-hidden bg-muted aspect-video sm:aspect-auto">
          <img
            src={episode.thumbnailUrl || "/placeholder.svg"}
            alt={episode.title}
            className="w-full h-full object-cover block"
            loading="lazy"
          />
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
          </div>

          <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
            {episode.title}
          </h3>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {hostName && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white ${
                    isDiana
                      ? "bg-[hsl(var(--teal))]"
                      : isMel
                      ? "bg-[hsl(var(--coral))]"
                      : "bg-muted-foreground"
                  }`}
                >
                  {hostName.charAt(0)}
                </span>
                <span className="font-medium">{hostName}</span>
              </span>
            )}
            {hostName && <span>•</span>}
            <span>{episode.date}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {episode.description}
          </p>

          {episode.topics && episode.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {episode.topics.slice(0, 2).map((topic) => {
                const tag = getTagByName(topic);
                const bg = tag?.bgColor || "#5A7DFF";
                const text = tag?.textColor || "#ffffff";
                return (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-full"
                    style={{
                      backgroundColor: bg,
                      color: text,
                      padding: "4px 10px",
                      borderRadius: "999px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                      fontWeight: 600,
                    }}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: text, opacity: 0.7 }} />
                    {topic}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EpisodeCard;
