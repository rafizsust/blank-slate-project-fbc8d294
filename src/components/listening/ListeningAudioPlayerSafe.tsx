import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ListeningAudioPlayerSafeProps {
  audioUrl?: string | null;
  fallbackText?: string;
  accentHint?: string;
  isPaused: boolean;
  onTogglePause: () => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
}

type AudioState = "loading" | "ready" | "playing" | "paused" | "fallback" | "error";

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function ListeningAudioPlayerSafe({
  audioUrl,
  fallbackText,
  accentHint,
  isPaused,
  onTogglePause,
  onEnded,
  onError,
}: ListeningAudioPlayerSafeProps) {
  const [state, setState] = useState<AudioState>("loading");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [usingFallback, setUsingFallback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Get the best available voice for fallback TTS
  const getBestVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const accentMap: Record<string, string[]> = {
      US: ["en-US", "en_US"],
      GB: ["en-GB", "en_GB", "en-UK"],
      AU: ["en-AU", "en_AU"],
      IN: ["en-IN", "en_IN"],
    };

    const preferredLangs = accentHint ? accentMap[accentHint] || ["en-US"] : ["en-US"];

    const voicePriorities = [
      (v: SpeechSynthesisVoice) =>
        preferredLangs.some((l) => v.lang.includes(l.replace("_", "-"))) &&
        (v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Natural")),
      (v: SpeechSynthesisVoice) =>
        preferredLangs.some((l) => v.lang.includes(l.replace("_", "-"))),
      (v: SpeechSynthesisVoice) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Natural")),
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
    ];

    for (const priority of voicePriorities) {
      const match = voices.find(priority);
      if (match) return match;
    }

    return voices[0];
  }, [accentHint]);

  // Start fallback TTS
  const startFallbackTTS = useCallback(() => {
    if (!fallbackText) {
      setState("error");
      onError?.("No audio or text available");
      return;
    }

    setUsingFallback(true);
    toast.warning("Audio file unavailable. Using System Voice.", {
      icon: <AlertTriangle className="h-4 w-4" />,
      duration: 3000,
    });

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(fallbackText);
    utteranceRef.current = utterance;

    const setVoice = () => {
      const voice = getBestVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.rate = 0.9 * playbackRate;
        utterance.pitch = 1;
        utterance.volume = isMuted ? 0 : volume;
      }
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    utterance.onstart = () => setState("playing");
    utterance.onend = () => {
      setState("paused");
      onEnded?.();
    };
    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      setState("error");
      onError?.("Speech synthesis failed");
    };

    setState("fallback");
    window.speechSynthesis.speak(utterance);
  }, [fallbackText, getBestVoice, isMuted, volume, playbackRate, onEnded, onError]);

  // Load audio
  useEffect(() => {
    if (!audioUrl) {
      if (fallbackText) {
        startFallbackTTS();
      } else {
        setState("error");
      }
      return;
    }

    setState("loading");
    const audio = new Audio();
    audioRef.current = audio;

    audio.preload = "auto";
    audio.volume = isMuted ? 0 : volume;
    audio.playbackRate = playbackRate;

    const handleLoadedData = () => {
      setDuration(audio.duration);
      setState("ready");
    };

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setState("playing");
    const handlePause = () => setState("paused");
    const handleEnded = () => {
      setState("paused");
      setCurrentTime(0);
      onEnded?.();
    };

    const handleError = () => {
      console.error("Audio load error:", audio.error);
      if (fallbackText) {
        startFallbackTTS();
      } else {
        setState("error");
        onError?.("Audio failed to load");
      }
    };

    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    audio.src = audioUrl;

    // Also check for 404
    fetch(audioUrl, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      })
      .catch(() => {
        if (fallbackText) {
          audio.src = "";
          startFallbackTTS();
        }
      });

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      window.speechSynthesis.cancel();
    };
  }, [audioUrl]);

  // Sync with external pause state
  useEffect(() => {
    if (usingFallback) {
      if (isPaused) {
        window.speechSynthesis.pause();
      } else {
        window.speechSynthesis.resume();
      }
    } else {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPaused) {
        audio.pause();
      } else if (state === "playing") {
        audio.play().catch(console.error);
      }
    }
  }, [isPaused, usingFallback, state]);

  // Update volume/rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
    }
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 0 : volume;
      utteranceRef.current.rate = 0.9 * playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  const togglePlayPause = () => {
    if (isPaused) {
      onTogglePause();
      return;
    }

    if (usingFallback) {
      if (state === "playing") {
        window.speechSynthesis.pause();
        setState("paused");
      } else {
        window.speechSynthesis.resume();
        setState("playing");
      }
    } else {
      const audio = audioRef.current;
      if (!audio) return;

      if (audio.paused) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (usingFallback) return;

    const audio = audioRef.current;
    if (audio) {
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

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (state === "error") {
    return (
      <div className="flex items-center justify-center p-2 bg-destructive/10 text-destructive rounded-md">
        <AlertTriangle size={16} className="mr-1" />
        <span className="text-sm">Audio unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-2">
      {state === "loading" ? (
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
            disabled={isPaused}
            className="flex-shrink-0 h-8 w-8"
          >
            {state === "playing" ? <Pause size={20} /> : <Play size={20} />}
          </Button>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-1 w-full md:w-auto">
            <span className="text-xs text-muted-foreground w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
              disabled={isPaused || usingFallback}
            />
            <span className="text-xs text-muted-foreground w-8 text-left">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="h-7 w-7"
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-16"
              disabled={isPaused}
            />
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Select
              value={playbackRate.toString()}
              onValueChange={(v) => setPlaybackRate(parseFloat(v))}
              disabled={isPaused}
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

          {/* Fallback Indicator */}
          {usingFallback && (
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              TTS
            </span>
          )}
        </>
      )}
    </div>
  );
}

export default ListeningAudioPlayerSafe;
