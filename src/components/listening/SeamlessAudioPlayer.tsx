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
import { cn } from '@/lib/utils';

interface SeamlessAudioPlayerProps {
  audioUrls: {
    part1?: string | null;
    part2?: string | null;
    part3?: string | null;
    part4?: string | null;
  };
  onPartChange?: (partNumber: number) => void;
  onTestComplete?: () => void;
  onReviewStart?: () => void;
}

// Official IELTS timing (in seconds)
const PAUSE_BETWEEN_PARTS = 30; // 30 seconds between parts 1-3
const PAUSE_AFTER_PART_4 = 30; // 30 seconds after part 4
const FINAL_REVIEW_TIME = 120; // 2 minutes final review

type PlayerPhase = 
  | 'playing' // Playing audio
  | 'part_pause' // 30 second pause between parts
  | 'part4_pause' // 30 second pause after part 4
  | 'final_review' // 2 minute final review
  | 'completed'; // Test completed

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function SeamlessAudioPlayer({ 
  audioUrls, 
  onPartChange,
  onTestComplete,
  onReviewStart
}: SeamlessAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  // Refs for preloaded audio elements
  const preloadedAudiosRef = useRef<Map<number, HTMLAudioElement>>(new Map());
  const autoPlayOnReadyRef = useRef(false);
  const hasPlayedOnceRef = useRef(false);
  const phaseRef = useRef<PlayerPhase>('playing');
  
  const [currentPart, setCurrentPart] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Phase management
  const [phase, setPhase] = useState<PlayerPhase>('playing');
  const [pauseCountdown, setPauseCountdown] = useState(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track total progress across all parts
  const [, setPartDurations] = useState<Record<number, number>>({});
  const [completedParts, setCompletedParts] = useState<Set<number>>(new Set());

  // Get available parts
  const availableParts = [
    audioUrls.part1 ? 1 : null,
    audioUrls.part2 ? 2 : null,
    audioUrls.part3 ? 3 : null,
    audioUrls.part4 ? 4 : null,
  ].filter(Boolean) as number[];

  const getAudioUrlForPart = useCallback((part: number) => {
    switch (part) {
      case 1: return audioUrls.part1;
      case 2: return audioUrls.part2;
      case 3: return audioUrls.part3;
      case 4: return audioUrls.part4;
      default: return null;
    }
  }, [audioUrls]);

  const currentAudioUrl = getAudioUrlForPart(currentPart);

  // Preload all audio files on mount for seamless transitions
  useEffect(() => {
    const preloadAudio = (part: number, url: string) => {
      if (preloadedAudiosRef.current.has(part)) return;
      
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      
      // Start loading
      audio.load();
      
      preloadedAudiosRef.current.set(part, audio);
    };

    // Preload all available parts
    if (audioUrls.part1) preloadAudio(1, audioUrls.part1);
    if (audioUrls.part2) preloadAudio(2, audioUrls.part2);
    if (audioUrls.part3) preloadAudio(3, audioUrls.part3);
    if (audioUrls.part4) preloadAudio(4, audioUrls.part4);

    return () => {
      // Cleanup preloaded audios
      preloadedAudiosRef.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      preloadedAudiosRef.current.clear();
    };
  }, [audioUrls.part1, audioUrls.part2, audioUrls.part3, audioUrls.part4]);

  // Keep a ref in sync to avoid re-binding listeners on phase changes
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Try to start playing immediately when the test page loads.
  // Note: browsers may block this without a user gesture.
  useEffect(() => {
    autoPlayOnReadyRef.current = true;
  }, []);

  // Load audio and setup event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudioUrl) return;

    setIsLoading(true);
    setError(null);

    const handleCanPlay = () => {
      setDuration(audio.duration);
      setPartDurations(prev => ({ ...prev, [currentPart]: audio.duration }));
      setIsLoading(false);

      if (autoPlayOnReadyRef.current && phaseRef.current === 'playing') {
        autoPlayOnReadyRef.current = false;
        audio.play().catch((err) => {
          // Browser may block autoplay; user can press Play.
          console.log('Auto-play blocked:', err);
        });
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setPartDurations(prev => ({ ...prev, [currentPart]: audio.duration }));
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => {
      hasPlayedOnceRef.current = true;
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.error('Audio error:', audio.error);
      setError(`Failed to load audio`);
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    // Load the audio
    audio.load();

    // Fallback: if audio has duration already (cached), set loading to false
    if (audio.readyState >= 2) {
      setDuration(audio.duration);
      setPartDurations(prev => ({ ...prev, [currentPart]: audio.duration }));
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

  // Handle audio end - transition to pause phase or next part
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const currentIndex = availableParts.indexOf(currentPart);
      setCompletedParts(prev => new Set([...prev, currentPart]));
      
      if (currentIndex < availableParts.length - 1) {
        // Not the last part - start 30 second pause
        setPhase('part_pause');
        setPauseCountdown(PAUSE_BETWEEN_PARTS);
      } else {
        // Last part (Part 4) ended - start 30 second pause before final review
        setPhase('part4_pause');
        setPauseCountdown(PAUSE_AFTER_PART_4);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [availableParts, currentPart]);

  // Countdown timer for pause phases (real-time, resilient to tab throttling)
  useEffect(() => {
    const isCountdownPhase =
      phase === 'part_pause' || phase === 'part4_pause' || phase === 'final_review';

    if (!isCountdownPhase) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    // Reset countdown for the phase and base it on an absolute end timestamp.
    const secondsForPhase =
      phase === 'final_review'
        ? FINAL_REVIEW_TIME
        : phase === 'part4_pause'
          ? PAUSE_AFTER_PART_4
          : PAUSE_BETWEEN_PARTS;

    setPauseCountdown(secondsForPhase);
    const endsAt = Date.now() + secondsForPhase * 1000;

    const advancePhase = () => {
      if (phase === 'part_pause') {
        const currentIndex = availableParts.indexOf(currentPart);
        const nextPart = availableParts[currentIndex + 1];

        if (typeof nextPart !== 'number') {
          // Safety fallback (shouldn't happen)
          setPhase('part4_pause');
          return;
        }

        // Set flag to auto-play when next part loads
        autoPlayOnReadyRef.current = true;

        setCurrentPart(nextPart);
        onPartChange?.(nextPart);
        setPhase('playing');
        setCurrentTime(0);

        // Also try to play immediately if audio is already loaded
        setTimeout(() => {
          const audio = audioRef.current;
          if (audio && audio.readyState >= 2) {
            audio.play().catch((err) => console.log('Auto-play after pause:', err));
          }
        }, 100);
      } else if (phase === 'part4_pause') {
        setPhase('final_review');
        onReviewStart?.();
      } else if (phase === 'final_review') {
        setPhase('completed');
        onTestComplete?.();
      }
    };

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setPauseCountdown(remaining);

      if (remaining === 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        advancePhase();
      }
    };

    // Run immediately so UI updates without waiting 1 second.
    tick();

    // Keep updates frequent; end timestamp ensures correctness even when throttled.
    countdownIntervalRef.current = setInterval(tick, 250);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [phase, currentPart, availableParts, onPartChange, onReviewStart, onTestComplete]);

  // Apply volume and playback rate
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.playbackRate = playbackRate;
      audio.muted = isMuted;
    }
  }, [volume, playbackRate, isMuted]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || phase !== 'playing') return;

    if (audio.paused) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [phase]);

  const handleSeek = (value: number[]) => {
    // Seeking not allowed in real IELTS test, but keep for practice
    const audio = audioRef.current;
    if (audio && phase === 'playing') {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handlePlaybackRateChange = (value: string) => {
    setPlaybackRate(parseFloat(value));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get phase display text
  const getPhaseDisplay = () => {
    switch (phase) {
      case 'part_pause':
        return `Check answers for Part ${currentPart}`;
      case 'part4_pause':
        return 'Check answers for Part 4';
      case 'final_review':
        return 'Final review - Check all answers';
      case 'completed':
        return 'Test completed';
      default:
        return `Part ${currentPart}`;
    }
  };

  if (!currentAudioUrl && availableParts.length === 0) {
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

  const isPausePhase = phase === 'part_pause' || phase === 'part4_pause' || phase === 'final_review';
  const isCompleted = phase === 'completed';

  return (
    <div className="flex flex-col gap-2">
      <audio ref={audioRef} src={currentAudioUrl || undefined} preload="auto" />
      
      {/* Phase indicator */}
      <div className="flex items-center justify-center gap-2">
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          isPausePhase && "bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse",
          phase === 'playing' && "bg-primary/20 text-primary",
          isCompleted && "bg-green-500/20 text-green-600 dark:text-green-400"
        )}>
          {getPhaseDisplay()}
        </span>
        
        {/* Part progress dots */}
        <div className="flex items-center gap-1">
          {availableParts.map(part => (
            <div
              key={part}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                completedParts.has(part) && "bg-green-500",
                part === currentPart && !completedParts.has(part) && "bg-primary",
                part > currentPart && !completedParts.has(part) && "bg-muted-foreground/30"
              )}
              title={`Part ${part}`}
            />
          ))}
        </div>
      </div>

      {/* Countdown during pause phases */}
      {isPausePhase && (
        <div className="flex items-center justify-center py-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatTime(pauseCountdown)}
            </div>
            <div className="text-xs text-muted-foreground">
              {phase === 'final_review' ? 'Time remaining to check all answers' : 'Time to check your answers'}
            </div>
          </div>
        </div>
      )}

      {/* Completed state */}
      {isCompleted && (
        <div className="flex items-center justify-center py-2">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              Listening test completed
            </div>
            <div className="text-xs text-muted-foreground">
              Please submit your answers
            </div>
          </div>
        </div>
      )}

      {/* Main Controls - shown during playing phase */}
      {phase === 'playing' && (
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center justify-center w-full min-h-[32px]">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span className="ml-1 text-xs text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <>
              {/* Play/Pause Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                disabled={isLoading}
                className="flex-shrink-0 h-8 w-8"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>

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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              {/* Playback Speed */}
              <Select
                value={playbackRate.toString()}
                onValueChange={handlePlaybackRateChange}
                disabled={isLoading}
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
      )}

      {/* Minimal controls during pause/review phases */}
      {isPausePhase && (
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={toggleMute} className="h-7 w-7">
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
