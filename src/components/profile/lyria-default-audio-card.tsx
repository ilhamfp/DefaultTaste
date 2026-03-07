"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LyriaInteractiveProfile } from "@/lib/types";

const BAR_COUNT = 20;
const VISUALIZER_UPDATE_MS = 48;
const IDLE_BARS = Array.from({ length: BAR_COUNT }, (_, index) => {
  const center = (BAR_COUNT - 1) / 2;
  const distance = Math.abs(index - center) / center;
  return Math.round(18 + (1 - distance) * 18);
});

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, value));
}

type LyriaDefaultAudioCardProps = {
  data: LyriaInteractiveProfile;
};

export function LyriaDefaultAudioCard({
  data,
}: LyriaDefaultAudioCardProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastVisualizerPaintRef = useRef(0);
  const [bars, setBars] = useState(IDLE_BARS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    data.representativeRun.audioDurationSeconds,
  );
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const beatDuration = Math.max(0.35, 60 / data.representativeRun.bpm);
  const progress =
    duration > 0 ? clampPercentage((currentTime / duration) * 100) : 0;

  function stopVisualizer() {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    setBars(IDLE_BARS);
  }

  async function ensureAudioGraph() {
    const audio = audioRef.current;

    if (!audio) {
      throw new Error("Audio element is not available.");
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      analyserRef.current.smoothingTimeConstant = 0.82;
      frequencyDataRef.current = new Uint8Array(
        analyserRef.current.frequencyBinCount,
      );
    }

    if (!sourceNodeRef.current) {
      sourceNodeRef.current =
        audioContextRef.current.createMediaElementSource(audio);
      sourceNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
  }

  async function handleTogglePlayback() {
    const audio = audioRef.current;

    if (!audio || playbackError) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      return;
    }

    try {
      setPlaybackError(null);
      await ensureAudioGraph();

      const effectiveDuration =
        duration > 0 ? duration : data.representativeRun.audioDurationSeconds;
      if (effectiveDuration > 0 && audio.currentTime >= effectiveDuration - 0.1) {
        audio.currentTime = 0;
      }

      await audio.play();
    } catch {
      setPlaybackError(
        "Audio unavailable right now. The representative run metadata is still shown.",
      );
      setIsPlaying(false);
      stopVisualizer();
    }
  }

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleLoadedMetadata = () => {
      setDuration(
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : data.representativeRun.audioDurationSeconds,
      );
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
      stopVisualizer();
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration || data.representativeRun.audioDurationSeconds);
      stopVisualizer();
    };
    const handleError = () => {
      setPlaybackError(
        "Audio unavailable right now. The representative run metadata is still shown.",
      );
      setIsPlaying(false);
      stopVisualizer();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [
    data.representativeRun.audioDurationSeconds,
    data.representativeRun.audioUrl,
  ]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const visualizerTick = (timestamp: number) => {
      const analyser = analyserRef.current;
      const frequencyData = frequencyDataRef.current;

      if (!analyser || !frequencyData) {
        return;
      }

      if (timestamp - lastVisualizerPaintRef.current >= VISUALIZER_UPDATE_MS) {
        lastVisualizerPaintRef.current = timestamp;
        analyser.getByteFrequencyData(frequencyData as Uint8Array<ArrayBuffer>);

        const nextBars = Array.from({ length: BAR_COUNT }, (_, index) => {
          const start = Math.floor((index * frequencyData.length) / BAR_COUNT);
          const end = Math.floor(
            ((index + 1) * frequencyData.length) / BAR_COUNT,
          );
          let total = 0;

          for (let cursor = start; cursor < end; cursor += 1) {
            total += frequencyData[cursor] ?? 0;
          }

          const average = total / Math.max(1, end - start);
          const normalized = average / 255;
          const eased = normalized ** 0.82;
          return Math.round(12 + eased * 88);
        });

        setBars(nextBars);
      }

      frameRef.current = window.requestAnimationFrame(visualizerTick);
    };

    lastVisualizerPaintRef.current = 0;
    frameRef.current = window.requestAnimationFrame(visualizerTick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      sourceNodeRef.current?.disconnect();
      analyserRef.current?.disconnect();
      void audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Most typical parsed Lyria run right now, selected from the current
            chain winners by centroid distance across tempo, brightness,
            density, and spectral rolloff.
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {data.parsedRunCount} parsed / {data.rawRunCount} raw runs
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            `Run ${data.representativeRun.fileId}`,
            `${data.representativeRun.bpm.toFixed(1)} BPM`,
            data.representativeRun.key,
            data.representativeRun.genre,
            data.representativeRun.mood,
          ].map((label, index) => (
            <span
              key={label}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                index === 1
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Selection
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {data.representativeRun.selectionReason}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/35 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Run Character
            </p>
            <p className="mt-2 text-sm text-foreground">
              {data.representativeRun.subGenre} · {data.representativeRun.tempoFeel} ·{" "}
              {data.representativeRun.productionStyle}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.representativeRun.culturalOrigin}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="sm"
              onClick={handleTogglePlayback}
              disabled={Boolean(playbackError)}
              aria-pressed={isPlaying}
            >
              {isPlaying ? <Pause /> : <Play />}
              {isPlaying ? "Pause representative run" : "Play representative run"}
            </Button>
            <div className="font-mono text-sm text-muted-foreground">
              {formatTime(currentTime)} /{" "}
              {formatTime(duration || data.representativeRun.audioDurationSeconds)}
            </div>
            {data.representativeRun.liked ? (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-primary">
                Gemini liked this run
              </span>
            ) : null}
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {playbackError ? (
            <p className="mt-3 text-sm text-muted-foreground">{playbackError}</p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Playback uses the actual run audio. The pulse stays lightly in
              time with the detected BPM even when idle, then intensifies once
              the track is playing.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-border bg-[radial-gradient(circle_at_top,_rgba(70,236,213,0.18),_transparent_48%),linear-gradient(180deg,_rgba(244,244,240,0.75),_rgba(255,255,255,0.98))] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              BPM Pulse
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground">
              {data.representativeRun.bpm.toFixed(1)}
            </p>
          </div>
          <div className="rounded-full border border-border/80 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {isPlaying ? "Live" : "Idle"}
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-[1.1rem] border border-border/80 bg-white/75">
            <motion.div
              aria-hidden="true"
              className="absolute inset-auto size-28 rounded-full border border-primary/20 bg-primary/[0.06]"
              animate={
                reducedMotion && !isPlaying
                  ? { scale: 1, opacity: 0.6 }
                  : {
                      scale: isPlaying ? [1, 1.15, 1] : [1, 1.04, 1],
                      opacity: isPlaying ? [0.45, 0.85, 0.45] : [0.35, 0.55, 0.35],
                    }
              }
              transition={{
                duration: beatDuration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute inset-auto size-44 rounded-full border border-primary/15"
              animate={
                reducedMotion && !isPlaying
                  ? { scale: 1, opacity: 0.3 }
                  : {
                      scale: isPlaying ? [0.94, 1.1, 0.94] : [0.98, 1.04, 0.98],
                      opacity: isPlaying ? [0.2, 0.55, 0.2] : [0.12, 0.28, 0.12],
                    }
              }
              transition={{
                duration: beatDuration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: beatDuration / 2,
              }}
            />
            <div className="relative flex size-24 flex-col items-center justify-center rounded-full border border-primary/20 bg-white/90 shadow-[0_16px_38px_rgba(0,120,111,0.08)]">
              <Waves className="size-5 text-primary" aria-hidden="true" />
              <span className="mt-2 font-mono text-lg font-semibold text-foreground">
                {data.representativeRun.bpm.toFixed(0)}
              </span>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-muted-foreground">
              <span>Frequency energy</span>
              <span>{isPlaying ? "Analyser active" : "Waiting for playback"}</span>
            </div>
            <div className="flex h-32 items-end justify-center gap-1.5 overflow-hidden rounded-[1.1rem] border border-border/80 bg-white/75 p-4">
              {bars.map((height, index) => {
                const highlighted =
                  index >= Math.floor(BAR_COUNT * 0.35) &&
                  index <= Math.ceil(BAR_COUNT * 0.65);

                return (
                  <div
                    key={index}
                    className={cn(
                      "max-w-[12px] min-w-[8px] flex-1 rounded-full transition-[height,background-color] duration-150",
                      highlighted ? "bg-chart-3" : "bg-primary/45",
                    )}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={data.representativeRun.audioUrl}
        preload="metadata"
        onError={() => {
          setPlaybackError(
            "Audio unavailable right now. The representative run metadata is still shown.",
          );
          setIsPlaying(false);
          stopVisualizer();
        }}
      />
    </div>
  );
}
