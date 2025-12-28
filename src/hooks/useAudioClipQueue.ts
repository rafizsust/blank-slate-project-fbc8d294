import { useCallback, useRef, useState } from 'react';
import { pcm16Base64ToWavUrl } from '@/lib/audio/pcmToWav';

export type PcmClip = {
  key: string;
  text?: string;
  audioBase64: string;
  sampleRate?: number;
};

export function useAudioClipQueue({ muted }: { muted: boolean }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const playSessionRef = useRef(0);

  const stop = useCallback(() => {
    playSessionRef.current += 1;
    setIsSpeaking(false);
  }, []);

  const playClips = useCallback(
    async (clips: PcmClip[]) => {
      if (!clips.length) return;

      const sessionId = ++playSessionRef.current;
      setIsSpeaking(true);

      for (const clip of clips) {
        if (playSessionRef.current !== sessionId) break;

        const url = pcm16Base64ToWavUrl(clip.audioBase64, clip.sampleRate ?? 24000);

        try {
          await new Promise<void>((resolve, reject) => {
            const audio = new Audio(url);
            audio.volume = muted ? 0 : 1;
            audio.onended = () => resolve();
            audio.onerror = () => reject(new Error('Audio playback failed'));
            audio.play().catch(reject);
          });
        } finally {
          URL.revokeObjectURL(url);
        }
      }

      if (playSessionRef.current === sessionId) {
        setIsSpeaking(false);
      }
    },
    [muted]
  );

  return { isSpeaking, playClips, stop };
}
