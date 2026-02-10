import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Play, Clock } from "lucide-react";
import type { Topic } from "@/data/episodeData";

interface EpisodeCardProps {
  number: number;
  title: string;
  description: string;
  duration: string;
  date: string;
  topics?: Topic[];
}

const EpisodeCard = ({
  number,
  title,
  description,
  duration,
  date,
  topics,
}: EpisodeCardProps) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-border hover:border-accent">
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Episode {number}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {duration}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {date}
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
          {topics && topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topics.map((topic) => (
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

        <div className="flex items-center gap-3 pt-2">
          <Button
            size="sm"
            className="bg-coral-accent hover:bg-coral-accent/90 group-hover:scale-105 transition-transform"
          >
            <Play className="h-4 w-4 mr-2" />
            Listen Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            Show Notes
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EpisodeCard;
