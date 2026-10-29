import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  PlaySquare,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Film,
} from 'lucide-react';
import { resolveMediaUrl, formatFileSize } from '../../lib/mediaStorage';

interface VideoPlayerProps {
  videoUrl?: string;
  title?: string;
  description?: string;
  fileName?: string;
  fileSize?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  description,
  fileName,
  fileSize,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLegacyIframe, setIsLegacyIframe] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setIsPlaying(false);
    setCurrentTime(0);
    setError(false);

    if (videoUrl) {
      const clean = videoUrl.trim();

      // Check if it's a legacy YouTube or Vimeo embed
      const ytMatch = clean.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
      );
      if (ytMatch && ytMatch[1]) {
        setIsLegacyIframe(true);
        setResolvedSrc(`https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`);
        return;
      }

      const vimeoMatch = clean.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        setIsLegacyIframe(true);
        setResolvedSrc(`https://player.vimeo.com/video/${vimeoMatch[1]}`);
        return;
      }

      setIsLegacyIframe(false);
      // Resolve direct file upload (Supabase Storage URL or IndexedDB local storage)
      resolveMediaUrl(clean).then((src) => {
        if (!isCancelled) {
          setResolvedSrc(src);
        }
      });
    } else {
      setResolvedSrc('');
    }

    return () => {
      isCancelled = true;
    };
  }, [videoUrl]);

  if (!videoUrl || !videoUrl.trim()) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-slate-500">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <PlaySquare className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Video Lesson</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Video lesson coming soon. Instructors can select and upload a video file directly from their device via the Admin Content Manager.
        </p>
      </div>
    );
  }

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setError(true));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col"
    >
      {/* Header bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
              {title || fileName || 'Video Lesson & Visual Walkthrough'}
            </h4>
            {fileName ? (
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                <span className="truncate max-w-[200px]">{fileName}</span>
                {fileSize ? <span>• {formatFileSize(fileSize)}</span> : null}
              </div>
            ) : description ? (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{description}</p>
            ) : null}
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
          Lesson Player
        </span>
      </div>

      {/* Video Viewport Container */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center group overflow-hidden">
        {isLegacyIframe ? (
          <iframe
            src={resolvedSrc}
            title={title || 'Educational Video Lesson'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : error ? (
          <div className="p-6 text-center text-slate-400 space-y-2">
            <Film className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-xs text-slate-300">
              Video could not be played. Please verify or re-upload the video file in the Admin Manager.
            </p>
          </div>
        ) : resolvedSrc ? (
          <>
            <video
              ref={videoRef}
              src={resolvedSrc}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onError={() => setError(true)}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
            />

            {/* Big center play button overlay when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
                aria-label="Play video"
              >
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </button>
            )}

            {/* Custom Bottom Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col gap-2 transition-opacity duration-300">
              {/* Seek track */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 hover:h-1.5 rounded-lg appearance-none cursor-pointer accent-rose-500 transition-all"
                aria-label="Video seek bar"
              />

              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white" />
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleMute}
                      className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-14 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      aria-label="Video volume slider"
                    />
                  </div>

                  <span className="font-mono text-[11px] text-white/80">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Fullscreen"
                  aria-label="Toggle Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs">Loading video stream...</div>
        )}
      </div>
    </div>
  );
};
