import { useEffect } from 'react';
import { Clock, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WritingTimerProps {
  timeLeft: number;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  isPaused?: boolean;
  onTimeEnd: () => void;
}

export function WritingTimer({ timeLeft, setTimeLeft, isPaused = false, onTimeEnd }: WritingTimerProps) {
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 0) {
          clearInterval(timer);
          onTimeEnd(); // Call onTimeEnd when timer reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setTimeLeft, isPaused, onTimeEnd]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isLowTime = timeLeft < 300; // Less than 5 minutes

  return (
    <div className={cn(
      "flex items-center gap-2",
      isPaused ? "text-amber-500" : isLowTime ? "text-destructive" : "text-foreground"
    )}>
      {isPaused ? <Pause size={20} /> : <Clock size={20} />}
      <span className="font-mono font-bold text-lg">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
      <span className="text-sm text-muted-foreground">
        {isPaused ? '(paused)' : 'minutes left'}
      </span>
    </div>
  );
}