import { useRef, useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface EpisodeAudioPlayerProps {
  audioUrl: string;
  title: string;
  thumbnailUrl?: string;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const EpisodeAudioPlayer = ({ audioUrl, title, thumbnailUrl, onClose }: EpisodeAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    // Auto-play on mount
    audio.play().then(() => setPlaying(true)).catch(() => {});

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const seek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/60 border border-border rounded-lg animate-fade-in">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Thumbnail */}
      <img
        src={thumbnailUrl || "/placeholder.svg"}
        alt={title}
        className="w-14 h-14 rounded-lg object-cover shrink-0"
      />

      {/* Info + Controls */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>
          <span className="text-xs text-muted-foreground tabular-nums w-10 shrink-0">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={seek}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground tabular-nums w-10 shrink-0 text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none px-1"
        title="Close player"
      >
        ×
      </button>
    </div>
  );
};

export default EpisodeAudioPlayer;
