import { useEffect, useRef } from 'react';
import { Clock, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeakingTimerProps {
  timeLeft: number;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  isPaused?: boolean;
  onTimeEnd: () => void;
  isDone?: boolean; // New prop
}

export function SpeakingTimer({ timeLeft, setTimeLeft, isPaused = false, onTimeEnd, isDone = false }: SpeakingTimerProps) {
  const prevTimeLeftRef = useRef(timeLeft); // Keep track of previous timeLeft

  useEffect(() => {
    if (isPaused || isDone) return; // Don't run timer if paused or done
    
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          // Only call onTimeEnd if it actually counted down to 0 from a positive value
          if (prev > 0) { // This is the key change
            onTimeEnd();
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setTimeLeft, isPaused, onTimeEnd, isDone]); // Add isDone to dependencies

  // Update ref when timeLeft changes
  useEffect(() => {
    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const displayTime = isDone ? '00:00' : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isLowTime = timeLeft < 300; // Less than 5 minutes

  return (
    <div className={cn(
      "flex items-center gap-2",
      isPaused || isDone ? "text-amber-500" : isLowTime ? "text-destructive" : "text-foreground"
    )}>
      {isPaused || isDone ? <Pause size={20} /> : <Clock size={20} />}
      <span className="font-mono font-bold text-lg">
        {displayTime}
      </span>
      <span className="text-sm text-muted-foreground">
        {isPaused ? '(paused)' : isDone ? '(completed)' : 'seconds left'}
      </span>
    </div>
  );
}