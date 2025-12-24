import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2, XCircle, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MultiPartAudioPlayerProps {
  audioUrls: {
    part1?: string | null;
    part2?: string | null;
    part3?: string | null;
    part4?: string | null;
  };
  isPaused: boolean;
  onTogglePause: () => void;
  onPartChange?: (partNumber: number) => void;
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function MultiPartAudioPlayer({ 
  audioUrls, 
  isPaused, 
  onTogglePause,
  onPartChange 
}: MultiPartAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentPart, setCurrentPart] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get available parts
  const availableParts = [
    audioUrls.part1 ? 1 : null,
    audioUrls.part2 ? 2 : null,
    audioUrls.part3 ? 3 : null,
    audioUrls.part4 ? 4 : null,
  ].filter(Boolean) as number[];

  const getCurrentAudioUrl = useCallback(() => {
    switch (currentPart) {
      case 1: return audioUrls.part1;
      case 2: return audioUrls.part2;
      case 3: return audioUrls.part3;
      case 4: return audioUrls.part4;
      default: return null;
    }
  }, [currentPart, audioUrls]);

  const currentAudioUrl = getCurrentAudioUrl();

  // Only run when audio URL changes - not on volume/rate/mute changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudioUrl) return;

    setIsLoading(true);
    setError(null);

    const handleCanPlay = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.error('Audio error:', audio.error);
      setError(`Failed to load Part ${currentPart} audio`);
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    // Fallback: if audio has duration already (cached), set loading to false
    if (audio.readyState >= 2) {
      setDuration(audio.duration);
      setIsLoading(false);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [currentAudioUrl, currentPart]);

  // Handle auto-advance when audio ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const currentIndex = availableParts.indexOf(currentPart);
      if (currentIndex < availableParts.length - 1) {
        const nextPart = availableParts[currentIndex + 1];
        setCurrentPart(nextPart);
        onPartChange?.(nextPart);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [availableParts, currentPart, onPartChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPaused) {
      audio.pause();
    } else if (isPlaying) {
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
  }, [isPaused, isPlaying]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPaused) {
      onTogglePause();
      return;
    }

    if (audio.paused) {
      audio.play().catch(e => console.error("Error playing audio:", e));
    } else {
      audio.pause();
    }
  }, [isPaused, onTogglePause]);

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(audio.muted);
    }
  };

  const handlePlaybackRateChange = (value: string) => {
    const newRate = parseFloat(value);
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = newRate;
      setPlaybackRate(newRate);
    }
  };

  const goToPart = (partNumber: number) => {
    setCurrentPart(partNumber);
    onPartChange?.(partNumber);
    setCurrentTime(0);
  };

  const goToPreviousPart = () => {
    const currentIndex = availableParts.indexOf(currentPart);
    if (currentIndex > 0) {
      const prevPart = availableParts[currentIndex - 1];
      goToPart(prevPart);
    }
  };

  const goToNextPart = () => {
    const currentIndex = availableParts.indexOf(currentPart);
    if (currentIndex < availableParts.length - 1) {
      const nextPart = availableParts[currentIndex + 1];
      goToPart(nextPart);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const canGoPrevious = availableParts.indexOf(currentPart) > 0;
  const canGoNext = availableParts.indexOf(currentPart) < availableParts.length - 1;

  if (!currentAudioUrl) {
    return (
      <div className="flex items-center justify-center p-2 text-muted-foreground rounded-md">
        <span className="text-sm">No audio available</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-2 bg-destructive/10 text-destructive rounded-md">
        <XCircle size={16} className="mr-1" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <audio ref={audioRef} src={currentAudioUrl} preload="auto" />
      
      {/* Part Selector */}
      {availableParts.length > 1 && (
        <div className="flex items-center justify-center gap-1">
          {availableParts.map(part => (
            <Badge
              key={part}
              variant={currentPart === part ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors text-xs px-2 py-0.5",
                currentPart === part && "bg-primary"
              )}
              onClick={() => goToPart(part)}
            >
              Part {part}
            </Badge>
          ))}
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center gap-2">
        {isLoading ? (
          <div className="flex items-center justify-center w-full min-h-[32px]">
            <Loader2 size={18} className="animate-spin text-primary" />
            <span className="ml-1 text-xs text-muted-foreground">Loading Part {currentPart}...</span>
          </div>
        ) : (
          <>
            {/* Previous Part Button */}
            {availableParts.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousPart}
                disabled={!canGoPrevious || isPaused}
                className="flex-shrink-0 h-7 w-7"
              >
                <SkipBack size={16} />
              </Button>
            )}

            {/* Play/Pause Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              disabled={isLoading || isPaused}
              className="flex-shrink-0 h-8 w-8"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>

            {/* Next Part Button */}
            {availableParts.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextPart}
                disabled={!canGoNext || isPaused}
                className="flex-shrink-0 h-7 w-7"
              >
                <SkipForward size={16} />
              </Button>
            )}

            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-1 min-w-0">
              <span className="text-xs text-muted-foreground w-10 text-right flex-shrink-0">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1 min-w-[60px]"
                disabled={isLoading || isPaused}
              />
              <span className="text-xs text-muted-foreground w-10 text-left flex-shrink-0">
                {formatTime(duration)}
              </span>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="h-7 w-7">
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-14"
                disabled={isLoading || isPaused}
              />
            </div>

            {/* Playback Speed */}
            <Select
              value={playbackRate.toString()}
              onValueChange={handlePlaybackRateChange}
              disabled={isLoading || isPaused}
            >
              <SelectTrigger className="w-[70px] h-7 text-xs">
                <SelectValue placeholder="Speed" />
              </SelectTrigger>
              <SelectContent>
                {playbackSpeeds.map((speed) => (
                  <SelectItem key={speed} value={speed.toString()}>
                    {speed}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
}
