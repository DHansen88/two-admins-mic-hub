import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface EpisodeAudioHeroProps {
  audioUrl: string;
  title: string;
  /** Whether the player should auto-play on mount (e.g. user clicked Listen) */
  autoPlay?: boolean;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Premium podcast-style audio player card. Used as the hero player on audio
 * episode detail pages and inside the Featured/Latest audio block.
 *
 * Visual: large round play button on the left, scrubber + times in the middle,
 * volume control on the right. Stacks gracefully on mobile.
 */
const EpisodeAudioHero = ({ audioUrl, title, autoPlay = false }: EpisodeAudioHeroProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    audio.volume = volume;

    if (autoPlay) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const seek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  return (
    <div className="w-full max-w-full overflow-hidden bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-5">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0 self-start sm:self-auto hover:scale-105 active:scale-95 transition-transform shadow-md"
        >
          {playing ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" />
          )}
        </button>

        {/* Scrubber + meta */}
        <div className="w-full flex-1 min-w-0 space-y-1.5">
          <p className="text-[11px] sm:text-sm text-muted-foreground truncate">
            {playing ? "Now playing" : "Audio episode"} · {title}
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] sm:text-xs text-muted-foreground tabular-nums w-9 sm:w-10 shrink-0">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={seek}
              className="flex-1"
              aria-label="Seek"
            />
            <span className="text-[11px] sm:text-xs text-muted-foreground tabular-nums w-9 sm:w-10 shrink-0 text-right">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume — hidden on small screens to save space */}
        <div className="hidden lg:flex items-center gap-2 w-32 shrink-0">
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <Slider
            value={[muted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={(v) => {
              setMuted(false);
              setVolume(v[0] / 100);
            }}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
};

export default EpisodeAudioHero;
