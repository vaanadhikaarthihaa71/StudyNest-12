import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Headphones, Music2, FileAudio } from 'lucide-react';
import { resolveMediaUrl, formatFileSize } from '../../lib/mediaStorage';

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  description?: string;
  fileName?: string;
  fileSize?: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title,
  description,
  fileName,
  fileSize,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setIsPlaying(false);
    setCurrentTime(0);
    setError(false);

    if (audioUrl) {
      resolveMediaUrl(audioUrl).then((src) => {
        if (!isCancelled) {
          setResolvedSrc(src);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.load();
          }
        }
      });
    } else {
      setResolvedSrc('');
    }

    return () => {
      isCancelled = true;
    };
  }, [audioUrl]);

  if (!audioUrl || !audioUrl.trim()) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-slate-500">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Headphones className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Audio Overview</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Audio overview not available yet. Teachers and administrators can upload an audio file directly using the Admin Content Manager.
        </p>
      </div>
    );
  }

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setError(true));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/40 p-5 shadow-sm">
      {resolvedSrc && (
        <audio
          ref={audioRef}
          src={resolvedSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={() => setError(true)}
        />
      )}

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Music2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
              {title || fileName || 'Audio Overview & Concept Walkthrough'}
            </h4>
            {fileName && (
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                <span className="truncate max-w-[200px]">{fileName}</span>
                {fileSize ? <span>• {formatFileSize(fileSize)}</span> : null}
              </div>
            )}
            {description && !fileName && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{description}</p>
            )}
          </div>
        </div>

        {/* Speed toggle pills */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold shrink-0">
          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => handleSpeedChange(rate)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                playbackRate === rate
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
          Audio file could not be loaded. Please re-upload or check the file in the Admin Content Manager.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 w-9 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              aria-label="Audio progress slider"
            />
            <span className="text-xs font-mono text-slate-400 w-9">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={restartAudio}
                title="Restart audio"
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                aria-label="Restart audio"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1.5 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-slate-600" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                aria-label="Volume slider"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
