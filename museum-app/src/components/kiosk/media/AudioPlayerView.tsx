"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaRef } from "@/lib/media";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface AudioPlayerViewProps {
  media: MediaRef;
  title?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayerView({ media, title }: AudioPlayerViewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      setCurrent(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onMeta = () => setDuration(audio.duration);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  return (
    <div className="media-preview__audio">
      <div className="audio-player">
        <div className="audio-player__cover">
          <MaterialIcon name="music_note" size={72} />
        </div>
        <p className="audio-player__title">{title || media.title || "Аудио"}</p>

        <button type="button" className="audio-player__play" onClick={toggle} aria-label={playing ? "Пауза" : "Воспроизвести"}>
          <MaterialIcon name={playing ? "pause_circle" : "play_circle"} size={72} />
        </button>

        <div className="audio-player__progress" onClick={seek} role="slider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="audio-player__progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="audio-player__time">
          <span>{formatTime(current)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio ref={audioRef} src={media.url} preload="metadata" playsInline />
    </div>
  );
}
