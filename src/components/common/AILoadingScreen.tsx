import { Brain, Loader2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface AILoadingScreenProps {
  title: string;
  description: string;
  progressSteps: string[];
  currentStepIndex: number;
  estimatedTime?: string;
  estimatedSeconds?: number; // For progress calculation
}

export function AILoadingScreen({
  title,
  description: _description,
  progressSteps,
  currentStepIndex,
  estimatedTime = '15-30 seconds',
  estimatedSeconds,
}: AILoadingScreenProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer to track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage (cap at 95% until complete)
  const progressPercent = estimatedSeconds 
    ? Math.min(95, (elapsedSeconds / estimatedSeconds) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
      <div className="text-center max-w-sm w-full space-y-4">
        {/* AI Brain Logo with Animation - smaller */}
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse-ring" />
          <Brain size={32} className="text-primary relative z-10 animate-float" />
        </div>

        <h1 className="text-xl font-bold text-foreground">{title}</h1>

        {/* Compact Time Display */}
        <div className="flex items-center justify-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono font-bold text-primary">{formatTime(elapsedSeconds)}</span>
          </div>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-xs text-muted-foreground">~{estimatedTime}</span>
        </div>

        {/* Progress Bar */}
        {progressPercent !== null && (
          <div className="w-full max-w-[200px] mx-auto">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Compact Progress Steps */}
        <div className="space-y-1.5 pt-1">
          {progressSteps.map((step, index) => (
            <div key={index} className="flex items-center justify-center gap-2">
              <div className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-300",
                index < currentStepIndex
                  ? "bg-success text-success-foreground"
                  : index === currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {index < currentStepIndex ? (
                  <CheckCircle2 size={10} />
                ) : index === currentStepIndex ? (
                  <Loader2 size={10} className="animate-spin-slow" />
                ) : (
                  <Circle size={8} />
                )}
              </div>
              <span className={cn(
                "text-sm transition-colors duration-300",
                index < currentStepIndex
                  ? "text-success"
                  : index === currentStepIndex
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
