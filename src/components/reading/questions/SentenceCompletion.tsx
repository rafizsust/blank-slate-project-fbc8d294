import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  options: string[] | null;
}

interface SentenceCompletionProps {
  question: Question;
  answer: string | undefined;
  onAnswerChange: (answer: string) => void;
  isActive: boolean;
  onSetActive?: () => void;
}

// Helper to render basic formatting
function renderText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// Helper to strip leading question number from text (e.g., "18 Question Text" -> "Question Text")
function stripLeadingQuestionNumber(text: string, questionNumber: number): string {
  if (!text) return '';
  // Match patterns like "18 ", "18. ", or just "18" at the start
  const pattern = new RegExp(`^${questionNumber}\\.?\\s*`);
  return text.replace(pattern, '');
}

export function SentenceCompletion({ question, answer, onAnswerChange, isActive, onSetActive }: SentenceCompletionProps) {
  // Check for inline blanks: _____ or numbered blanks like 34_____ or _____34
  const hasInlineBlank = question.question_text.includes('_____');
  
  // If there's an inline blank, render with input in the text
  if (hasInlineBlank) {
    // Split by the blank pattern and filter out empty/underscore-only parts
    const parts = question.question_text.split('_____');
    
    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onSetActive?.();
        }}
        className="mt-0"
      >
        <span className="leading-relaxed text-foreground">
          {parts.map((part, idx) => {
            // Clean up the part - remove trailing underscores only
            let cleanedPart = part
              .replace(/_+$/, '') // Remove trailing underscores
              .replace(/^_+/, ''); // Remove leading underscores
            
            return (
              <span key={idx}>
                {cleanedPart && (
                  <span dangerouslySetInnerHTML={{ __html: renderText(cleanedPart) }} />
                )}
                {idx < parts.length - 1 && (
                    <span className="relative inline-flex items-center mx-1">
                      <input
                        type="text"
                        value={answer || ''}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        placeholder={String(question.question_number)}
                        className={cn(
                          "h-7 text-sm font-normal px-2 min-w-[174px] max-w-full rounded-[3px] text-center placeholder:font-bold placeholder:text-foreground/70",
                          "bg-[hsl(var(--ielts-input-bg,0_0%_100%))] border border-[hsl(var(--ielts-input-border))] text-foreground",
                          "focus:outline-none focus:border-[hsl(var(--ielts-input-focus))] focus:ring-0",
                          "transition-colors",
                          isActive && "border-[hsl(var(--ielts-input-focus))]"
                        )}
                        style={{ verticalAlign: 'baseline' }}
                      />
                    </span>
                )}
              </span>
            );
          })}
        </span>
      </div>
    );
  }

  // Fallback: No inline blank - show input below (legacy behavior)
  // Strip leading question number from question_text to avoid duplicate display
  const cleanedText = stripLeadingQuestionNumber(question.question_text, question.question_number);
  
  return (
    <div onClick={(e) => {
      e.stopPropagation();
      onSetActive?.();
    }}>
      {cleanedText && (
        <span className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: renderText(cleanedText) }} />
      )}
      <span className="relative inline-flex items-baseline ml-1">
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder={String(question.question_number)}
          className={cn(
            "h-7 text-sm font-normal px-2 min-w-[174px] max-w-full rounded-[3px] text-center placeholder:font-bold placeholder:text-foreground/70",
            "bg-[hsl(var(--ielts-input-bg,0_0%_100%))] border border-[hsl(var(--ielts-input-border))] text-foreground",
            "focus:outline-none focus:border-[hsl(var(--ielts-input-focus))] focus:ring-0",
            "transition-colors",
            isActive && "border-[hsl(var(--ielts-input-focus))]"
          )}
          style={{ verticalAlign: 'baseline' }}
        />
      </span>
    </div>
  );
}