import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SafeAudioPlayerProps {
  audioUrl?: string | null;
  fallbackText?: string;
  accentHint?: string; // 'US', 'GB', 'AU', etc.
  autoPlay?: boolean;
  onEnded?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showControls?: boolean;
}

type AudioState = "loading" | "ready" | "playing" | "paused" | "fallback" | "error";

export function SafeAudioPlayer({
  audioUrl,
  fallbackText,
  accentHint,
  autoPlay = false,
  onEnded,
  onError,
  className = "",
  showControls = true,
}: SafeAudioPlayerProps) {
  const [state, setState] = useState<AudioState>("loading");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Get the best available voice for fallback TTS
  const getBestVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    // Map accent hint to language codes
    const accentMap: Record<string, string[]> = {
      US: ["en-US", "en_US"],
      GB: ["en-GB", "en_GB", "en-UK"],
      AU: ["en-AU", "en_AU"],
      IN: ["en-IN", "en_IN"],
    };

    const preferredLangs = accentHint ? accentMap[accentHint] || ["en-US"] : ["en-US"];

    // Priority order for voice selection
    const voicePriorities = [
      // 1. Match accent + high-quality voices
      (v: SpeechSynthesisVoice) =>
        preferredLangs.some((l) => v.lang.includes(l.replace("_", "-"))) &&
        (v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Natural")),
      // 2. Match accent
      (v: SpeechSynthesisVoice) =>
        preferredLangs.some((l) => v.lang.includes(l.replace("_", "-"))),
      // 3. Any high-quality English voice
      (v: SpeechSynthesisVoice) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Natural")),
      // 4. Any English voice
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
    ];

    for (const priority of voicePriorities) {
      const match = voices.find(priority);
      if (match) return match;
    }

    // Last resort: first available voice
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
    toast.warning("Audio file missing. Using System Voice.", {
      icon: <AlertTriangle className="h-4 w-4" />,
      duration: 3000,
    });

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(fallbackText);
    utteranceRef.current = utterance;

    // Wait for voices to load
    const setVoice = () => {
      const voice = getBestVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = isMuted ? 0 : volume;
      }
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    utterance.onstart = () => {
      setState("playing");
    };

    utterance.onend = () => {
      setState("paused");
      setProgress(100);
      onEnded?.();
    };

    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      setState("error");
      onError?.("Speech synthesis failed");
    };

    setState("fallback");
    window.speechSynthesis.speak(utterance);
  }, [fallbackText, getBestVoice, isMuted, volume, onEnded, onError]);

  // Load audio
  useEffect(() => {
    if (!audioUrl) {
      // No audio URL - try fallback immediately
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

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      setState("ready");
      if (autoPlay) {
        audio.play().catch((err) => {
          console.error("Autoplay failed:", err);
        });
      }
    };

    audio.onplay = () => setState("playing");
    audio.onpause = () => setState("paused");
    audio.onended = () => {
      setState("paused");
      setProgress(0);
      onEnded?.();
    };

    audio.onerror = (e) => {
      console.error("Audio load error:", e, audio.error);
      // Try fallback
      if (fallbackText) {
        startFallbackTTS();
      } else {
        setState("error");
        onError?.("Audio failed to load");
      }
    };

    // Handle 404 specifically
    audio.src = audioUrl;

    // Also do a fetch check for 404
    fetch(audioUrl, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      })
      .catch(() => {
        // Audio URL is not accessible
        if (fallbackText) {
          audio.src = ""; // Cancel audio load
          startFallbackTTS();
        }
      });

    return () => {
      audio.pause();
      audio.src = "";
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, [audioUrl, fallbackText, autoPlay, startFallbackTTS, onEnded, onError]);

  // Update progress
  useEffect(() => {
    if (state === "playing" && audioRef.current && !usingFallback) {
      progressIntervalRef.current = window.setInterval(() => {
        const audio = audioRef.current;
        if (audio && audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [state, usingFallback]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
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

      if (state === "playing") {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (usingFallback) return; // Can't seek with TTS

    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const newTime = (value[0] / 100) * audio.duration;
    audio.currentTime = newTime;
    setProgress(value[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (state === "error") {
    return (
      <div className={`flex items-center gap-2 text-destructive ${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">Audio unavailable</span>
      </div>
    );
  }

  if (!showControls) {
    return null;
  }

  const currentTime = audioRef.current?.currentTime || 0;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        disabled={state === "loading"}
        className="h-10 w-10 rounded-full"
      >
        {state === "loading" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : state === "playing" ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </Button>

      {/* Progress Bar */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-10 text-right">
          {formatTime(currentTime)}
        </span>
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          disabled={state === "loading" || usingFallback}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-10">
          {formatTime(duration)}
        </span>
      </div>

      {/* Volume Control */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMuted(!isMuted)}
        className="h-8 w-8"
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>

      {/* Fallback Indicator */}
      {usingFallback && (
        <span className="text-xs text-amber-500 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          TTS
        </span>
      )}
    </div>
  );
}

export default SafeAudioPlayer;
