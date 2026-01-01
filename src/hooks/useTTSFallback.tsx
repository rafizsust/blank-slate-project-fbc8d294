import { useState, useRef, useCallback, useEffect } from "react";

interface UseTTSFallbackOptions {
  accentHint?: string;
  rate?: number;
}

interface UseTTSFallbackReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
}

export function useTTSFallback({
  accentHint,
  rate = 0.9,
}: UseTTSFallbackOptions = {}): UseTTSFallbackReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const getBestVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!isSupported) return null;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

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

    return voices[0];
  }, [accentHint, isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        console.warn("Speech synthesis not supported");
        return;
      }

      // Cancel any existing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Wait for voices to load if needed
      const setVoice = () => {
        const voice = getBestVoice();
        if (voice) {
          utterance.voice = voice;
        }
        utterance.rate = rate;
        utterance.pitch = 1;
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = setVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (e) => {
        console.error("TTS error:", e);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, getBestVoice, rate]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
  };
}

export default useTTSFallback;
