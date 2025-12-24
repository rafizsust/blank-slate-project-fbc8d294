import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// cn removed - not used

interface ListeningAudioPlayerProps {
  audioUrl: string;
  isPaused: boolean;
  onTogglePause: () => void;
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function ListeningAudioPlayer({ audioUrl, isPaused, onTogglePause }: ListeningAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
      setIsLoading(false);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const setAudioVolume = () => setVolume(audio.volume);
    const setAudioMute = () => setIsMuted(audio.muted);
    const setAudioRate = () => setPlaybackRate(audio.playbackRate);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.error('Audio error:', audio.error);
      setError(`Failed to load audio: ${audio.error?.message || 'Unknown error'}`);
      setIsLoading(false);
    };
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('volumechange', setAudioVolume);
    audio.addEventListener('mute', setAudioMute);
    audio.addEventListener('ratechange', setAudioRate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    // Initial setup
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.muted = isMuted;

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('volumechange', setAudioVolume);
      audio.removeEventListener('mute', setAudioMute);
      audio.removeEventListener('ratechange', setAudioRate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [audioUrl, volume, playbackRate, isMuted]);

  // Sync with external pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPaused) { // If externally paused, just toggle the external state
      audio.pause();
    } else {
      // Only play if it was already playing before the external pause
      if (isPlaying) {
        audio.play().catch(e => console.error("Error playing audio:", e));
      }
    }
  }, [isPaused, isPlaying]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPaused) { // If externally paused, just toggle the external state
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-2 bg-destructive/10 text-destructive rounded-md">
        <XCircle size={16} className="mr-1" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-2">
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {isLoading ? (
        <div className="flex items-center justify-center w-full md:w-auto min-h-[32px]">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="ml-1 text-xs text-muted-foreground">Loading audio...</span>
        </div>
      ) : (
        <>
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

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-1 w-full md:w-auto">
            <span className="text-xs text-muted-foreground w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
              disabled={isLoading || isPaused}
            />
            <span className="text-xs text-muted-foreground w-8 text-left">
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
              className="w-16"
              disabled={isLoading || isPaused}
            />
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Select
              value={playbackRate.toString()}
              onValueChange={handlePlaybackRateChange}
              disabled={isLoading || isPaused}
            >
              <SelectTrigger className="w-[80px] h-8 text-xs">
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
          </div>
        </>
      )}
    </div>
  );
}