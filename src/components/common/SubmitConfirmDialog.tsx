import { useState, useEffect } from 'react';
import { AlertTriangle, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ContrastMode = 'black-on-white' | 'white-on-black' | 'yellow-on-black';

interface SubmitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  timeRemaining?: number;
  answeredCount: number;
  totalCount: number;
  contrastMode?: ContrastMode;
}

export function SubmitConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  timeRemaining = 0,
  answeredCount,
  totalCount,
  contrastMode = 'black-on-white',
}: SubmitConfirmDialogProps) {
  const [countdown, setCountdown] = useState(5);
  const isAutoSubmit = timeRemaining <= 0;
  const unansweredCount = totalCount - answeredCount;
  
  const isDarkTheme = contrastMode === 'white-on-black' || contrastMode === 'yellow-on-black';
  const isYellow = contrastMode === 'yellow-on-black';

  useEffect(() => {
    if (open && isAutoSubmit) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onConfirm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [open, isAutoSubmit, onConfirm]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get theme-aware colors
  const getAccentColor = () => {
    if (isYellow) return 'text-yellow-400';
    if (isDarkTheme) return 'text-white';
    return 'text-primary';
  };

  const getSubmitButtonStyles = () => {
    if (isYellow) return 'bg-yellow-400 text-black hover:bg-yellow-300 border-yellow-400';
    if (isDarkTheme) return 'bg-white text-black hover:bg-gray-200 border-white';
    return 'bg-primary hover:bg-primary/90';
  };

  return (
    <Dialog open={open} onOpenChange={isAutoSubmit ? undefined : onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-md",
        isAutoSubmit && "border-destructive/50",
        isDarkTheme && "bg-black border-gray-700",
        isYellow && "text-yellow-400"
      )}>
        <DialogHeader>
          <DialogTitle className={cn(
            "flex items-center gap-2",
            isAutoSubmit ? "text-destructive" : isDarkTheme ? (isYellow ? "text-yellow-400" : "text-white") : "text-foreground"
          )}>
            {isAutoSubmit ? (
              <>
                <Clock size={24} className="animate-pulse" />
                Time's Up!
              </>
            ) : (
              <>
                <AlertTriangle size={24} className={isDarkTheme ? (isYellow ? "text-yellow-400" : "text-amber-400") : "text-amber-500"} />
                Submit Your Test?
              </>
            )}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-4">
              {isAutoSubmit ? (
                <>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                      <span className="text-3xl font-bold text-destructive animate-pulse">
                        {countdown}
                      </span>
                    </div>
                    <p className={cn("text-lg font-medium", isDarkTheme ? (isYellow ? "text-yellow-400" : "text-white") : "text-foreground")}>
                      Your test will be submitted automatically
                    </p>
                  </div>
                  <div className={cn("rounded-lg p-4 text-center", isDarkTheme ? "bg-gray-900" : "bg-muted")}>
                    <p className={cn("text-sm mb-1", isDarkTheme ? "text-gray-400" : "text-muted-foreground")}>Summary</p>
                    <div className="flex justify-center gap-6">
                      <div>
                        <span className={cn("text-2xl font-bold", getAccentColor())}>{answeredCount}</span>
                        <p className={cn("text-xs", isDarkTheme ? "text-gray-400" : "text-muted-foreground")}>Answered</p>
                      </div>
                      <div>
                        <span className="text-2xl font-bold text-destructive">{unansweredCount}</span>
                        <p className={cn("text-xs", isDarkTheme ? "text-gray-400" : "text-muted-foreground")}>Unanswered</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className={isDarkTheme ? (isYellow ? "text-yellow-400" : "text-white") : undefined}>
                    You still have <strong className={getAccentColor()}>{formatTime(timeRemaining)}</strong> remaining.
                  </p>
                  <div className={cn("rounded-lg p-4", isDarkTheme ? "bg-gray-900" : "bg-muted")}>
                    <div className="flex justify-between items-center">
                      <span className={cn("text-sm", isDarkTheme ? (isYellow ? "text-yellow-400" : "text-white") : undefined)}>Questions answered:</span>
                      <span className={cn("font-bold", getAccentColor())}>{answeredCount}/{totalCount}</span>
                    </div>
                    {unansweredCount > 0 && (
                      <div className="flex justify-between items-center mt-2">
                        <span className={cn("text-sm", isDarkTheme ? (isYellow ? "text-yellow-400" : "text-white") : undefined)}>Unanswered:</span>
                        <span className="font-bold text-destructive">{unansweredCount}</span>
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "border rounded-lg p-3",
                    isDarkTheme 
                      ? "bg-amber-950/50 border-amber-800" 
                      : "bg-amber-50 border-amber-200"
                  )}>
                    <p className={cn("text-sm", isDarkTheme ? "text-amber-300" : "text-amber-800")}>
                      Once submitted, you cannot change your answers. Are you sure you want to submit?
                    </p>
                  </div>
                </>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        {!isAutoSubmit && (
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className={isDarkTheme ? "border-gray-600 text-white hover:bg-gray-800" : undefined}
            >
              Continue Test
            </Button>
            <Button 
              onClick={onConfirm} 
              className={getSubmitButtonStyles()}
            >
              <Send size={16} className="mr-2" />
              Submit Now
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
