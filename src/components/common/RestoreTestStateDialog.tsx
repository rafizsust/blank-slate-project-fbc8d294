import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Clock, Send, Play } from 'lucide-react';

interface RestoreTestStateDialogProps {
  open: boolean;
  timeLeft: number;
  answeredCount: number;
  totalQuestions: number;
  onContinue: () => void;
  onSubmit: () => void;
}

export function RestoreTestStateDialog({
  open,
  timeLeft,
  answeredCount,
  totalQuestions,
  onContinue,
  onSubmit,
}: RestoreTestStateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const isTimeUp = timeLeft <= 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit();
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isTimeUp ? (
              <>
                <Clock className="h-5 w-5 text-destructive" />
                Time's Up!
              </>
            ) : (
              <>
                <Play className="h-5 w-5 text-primary" />
                Welcome Back!
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Your previous test session has been restored.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Questions answered:</span>
                <span className="font-medium">{answeredCount} / {totalQuestions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time remaining:</span>
                <span className={`font-mono font-medium ${isTimeUp ? 'text-destructive' : ''}`}>
                  {isTimeUp ? 'No time left' : timeDisplay}
                </span>
              </div>
            </div>

            {isTimeUp ? (
              <p className="text-sm text-muted-foreground">
                Your time has expired. Your answers will be submitted automatically.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Would you like to continue the test or submit your answers now?
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          {isTimeUp ? (
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Answers'}
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={onContinue}
                className="w-full sm:w-auto"
              >
                <Play className="h-4 w-4 mr-2" />
                Continue Test
              </Button>
              <Button 
                onClick={handleSubmit}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Now'}
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
