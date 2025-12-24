import { Brain, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AILoadingScreenProps {
  title: string;
  description: string;
  progressSteps: string[];
  currentStepIndex: number;
  estimatedTime?: string;
}

export function AILoadingScreen({
  title,
  description,
  progressSteps,
  currentStepIndex,
  estimatedTime = '15-30 seconds',
}: AILoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in">
      <div className="text-center max-w-lg p-8 space-y-8">
        {/* AI Brain Logo with Animation */}
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse-ring" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring animation-delay-200" />
          <Brain size={64} className="text-primary relative z-10 animate-float" />
        </div>

        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground text-lg">
          {description.replace(/Our AI is/g, 'AI is').replace(/our AI is/g, 'AI is')} This usually takes {estimatedTime}.
        </p>

        {/* Progress Steps */}
        <div className="space-y-4 pt-6">
          {progressSteps.map((step, index) => (
            <div key={index} className="flex items-center justify-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300",
                index < currentStepIndex
                  ? "bg-success text-success-foreground" // Completed
                  : index === currentStepIndex
                  ? "bg-primary text-primary-foreground" // Active
                  : "bg-muted text-muted-foreground" // Pending
              )}>
                {index < currentStepIndex ? (
                  <CheckCircle2 size={16} />
                ) : index === currentStepIndex ? (
                  <Loader2 size={16} className="animate-spin-slow" />
                ) : (
                  <Circle size={12} />
                )}
              </div>
              <span className={cn(
                "text-lg font-medium transition-colors duration-300",
                index < currentStepIndex
                  ? "text-success"
                  : index === currentStepIndex
                  ? "text-primary"
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