import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ArrowDown, ArrowRight } from 'lucide-react';

interface FlowchartStep {
  id: string;
  label: string;
  questionNumber?: number;
  isBlank?: boolean;
}

interface FlowchartCompletionProps {
  title?: string;
  instruction?: string;
  steps: FlowchartStep[];
  direction?: 'vertical' | 'horizontal';
  answers: Record<number, string>;
  onAnswerChange: (questionNumber: number, answer: string) => void;
  currentQuestion: number;
  fontSize?: number;
}

export function FlowchartCompletion({
  title,
  instruction,
  steps,
  direction = 'vertical',
  answers,
  onAnswerChange,
  currentQuestion,
  fontSize = 14,
}: FlowchartCompletionProps) {
  const isVertical = direction === 'vertical';
  const ArrowIcon = isVertical ? ArrowDown : ArrowRight;

  // Strip blank markers from label text (they'll be replaced with input)
  const stripBlankMarker = (label: string, questionNumber?: number) => {
    if (!questionNumber) return label;
    // Remove patterns like (3), [3], __, ___, ..., ______
    return label
      .replace(new RegExp(`\\(${questionNumber}\\)`, 'g'), '')
      .replace(new RegExp(`\\[${questionNumber}\\]`, 'g'), '')
      .replace(/_{2,}/g, '')
      .replace(/\.{3,}/g, '')
      .replace(/______/g, '')
      .trim();
  };

  return (
    <div className="space-y-3" style={{ fontSize: `${fontSize}px` }}>
      {/* Header Section */}
      <div className="mb-4">
        {title && (
          <h4 className="font-semibold text-base text-foreground mb-2">{title}</h4>
        )}
        {instruction && (
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-foreground italic">
              {instruction}
            </p>
          </div>
        )}
      </div>
      
      <div className={cn(
        "flex items-center justify-center gap-2",
        isVertical ? "flex-col" : "flex-row flex-wrap"
      )}>
        {steps.map((step, index) => {
          const isActive = step.questionNumber === currentQuestion;
          const showInput = !!step.questionNumber;
          const qNum = step.questionNumber;
          const val = qNum ? answers[qNum] || '' : '';
          const cleanLabel = stripBlankMarker(step.label, qNum);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className={cn(
              "flex items-center",
              isVertical ? "flex-col" : "flex-row"
            )}>
              {/* Step Box */}
              <div
                className={cn(
                  "relative border-2 rounded-lg p-4 min-w-[180px] max-w-[280px] text-center transition-all",
                  isActive
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-muted-foreground/50"
                )}
              >
                <div className="inline items-baseline flex-wrap">
                  {/* Label Text + Inline Input */}
                  {showInput ? (
                    <span className="text-muted-foreground text-sm">
                      {cleanLabel}{' '}
                      <span className="inline-flex items-baseline">
                        <Input
                          type="text"
                          value={val}
                          onChange={(e) => onAnswerChange(qNum!, e.target.value)}
                          className="h-7 min-w-[120px] max-w-[180px] border-b-2 border-t-0 border-x-0 border-muted-foreground/40 rounded-none px-1 py-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-center font-semibold text-primary align-middle"
                          placeholder={`(${qNum})`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      {step.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow Connector */}
              {!isLast && (
                <div className={cn(
                  "flex items-center justify-center text-muted-foreground",
                  isVertical ? "py-2" : "px-2"
                )}>
                  <ArrowIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
