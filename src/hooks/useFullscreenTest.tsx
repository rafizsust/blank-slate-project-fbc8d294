import { useState, useEffect, useCallback } from 'react';

export function useFullscreenTest() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  const requestFullscreen = useCallback(async () => {
    if (!document.documentElement.requestFullscreen) return;
    await document.documentElement.requestFullscreen();
  }, []);

  // Enter fullscreen (best-effort; many browsers require a user gesture)
  const enterFullscreen = useCallback(async () => {
    try {
      setNeedsUserGesture(false);
      await requestFullscreen();
    } catch (error) {
      // Most common cause: browser blocked due to missing user gesture
      setNeedsUserGesture(true);
      console.warn('Failed to enter fullscreen (likely requires user gesture):', error);
    }
  }, [requestFullscreen]);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (fs) setNeedsUserGesture(false);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // If auto-fullscreen failed, retry once on the next user gesture (click/tap)
  useEffect(() => {
    if (!needsUserGesture || isFullscreen) return;

    const onFirstGesture = async () => {
      try {
        await requestFullscreen();
      } catch {
        // still blocked; keep needsUserGesture true
        return;
      }
    };

    window.addEventListener('pointerdown', onFirstGesture, { once: true });
    return () => window.removeEventListener('pointerdown', onFirstGesture);
  }, [needsUserGesture, isFullscreen, requestFullscreen]);

  // Handle F11 key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleFullscreen]);

  return {
    isFullscreen,
    needsUserGesture,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}

