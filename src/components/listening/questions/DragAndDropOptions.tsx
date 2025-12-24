import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { QuestionTextWithTools } from '@/components/common/QuestionTextWithTools';

interface Question {
  id: string;
  question_number: number;
  question_text: string; // Contains '______' for drop zone
  instruction?: string | null;
  is_given: boolean;
  heading?: string | null;
  correct_answer: string; // The ID of the correct option
}

interface DragAndDropOptionsProps {
  testId: string;
  questions: Question[]; // All questions in this group
  groupOptions: string[]; // The shared draggable options (e.g., ['apple', 'banana', 'orange'])
  groupOptionFormat: string; // e.g., 'A'
  answers: Record<number, string>; // Answers for individual questions (question_number -> assigned_option_label)
  onAnswerChange: (questionNumber: number, answer: string) => void;
  onQuestionFocus?: (questionNumber: number) => void;
  fontSize: number;
  renderRichText: (text: string) => string;
}

// Helper function to get option label (A, B, C or 1, 2, 3 etc.)
const getOptionLabel = (index: number, format: string | null | undefined) => {
  if (format === '1') return String(index + 1);
  if (format === 'i') {
    const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
    return romanNumerals[index] || String(index + 1);
  }
  return String.fromCharCode(65 + index); // Default to 'A' format
};

export function DragAndDropOptions({
  testId,
  questions,
  groupOptions,
  groupOptionFormat,
  answers,
  onAnswerChange,
  onQuestionFocus,
  fontSize,
  renderRichText,
}: DragAndDropOptionsProps) {
  const [pressedOptionLabel, setPressedOptionLabel] = useState<string | null>(null);
  const [isDraggingBack, setIsDraggingBack] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Map groupOptions to an array of { label: 'A', text: 'Option A text' }
  const formattedGroupOptions = groupOptions.map((text, idx) => ({
    label: getOptionLabel(idx, groupOptionFormat),
    text: text,
  }));

  // Get question numbers in THIS group only (memoized)
  const groupQuestionNumbers = useMemo(
    () => new Set(questions.map(q => q.question_number)),
    [questions]
  );
  
  // Get used options (already assigned to questions in THIS group only)
  const usedOptionLabels = Object.entries(answers)
    .filter(([qNum]) => groupQuestionNumbers.has(parseInt(qNum)))
    .map(([_, label]) => label);

  // Check if any question in this group has been answered
  const hasAnyAnswer = questions.some(q => answers[q.question_number] && answers[q.question_number] !== '');
  
  // Get the first question number in this group
  const firstQuestionNumber = questions.length > 0 ? Math.min(...questions.map(q => q.question_number)) : 0;

  const handleDragStart = (e: React.DragEvent, optionLabel: string, source: 'options' | 'dropzone') => {
    setPressedOptionLabel(null);
    e.dataTransfer.setData('optionLabel', optionLabel);
    e.dataTransfer.setData('source', source);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setPressedOptionLabel(null);
    setIsDraggingBack(false);
  };

  const handleDrop = useCallback((e: React.DragEvent, questionNumber: number) => {
    e.preventDefault();
    const optionLabel = e.dataTransfer.getData('optionLabel');
    const source = e.dataTransfer.getData('source');
    
    if (optionLabel) {
      // If dragging from another dropzone, clear that one first (ONLY within this group)
      if (source === 'dropzone') {
        const sourceQuestion = Object.entries(answers).find(
          ([qNum, label]) => groupQuestionNumbers.has(parseInt(qNum)) && label === optionLabel
        );
        if (sourceQuestion) {
          onAnswerChange(parseInt(sourceQuestion[0]), '');
        }
      }
      onAnswerChange(questionNumber, optionLabel);
      // Focus the question in navigation after drop
      onQuestionFocus?.(questionNumber);
    }
  }, [answers, groupQuestionNumbers, onAnswerChange, onQuestionFocus]);

  // Handle dropping option back to the list
  const handleListDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingBack(true);
  };

  const handleListDragLeave = (e: React.DragEvent) => {
    // Check if leaving the list container
    const listRect = listContainerRef.current?.getBoundingClientRect();
    if (listRect) {
      const { clientX, clientY } = e;
      const isOutside = 
        clientX < listRect.left || 
        clientX > listRect.right || 
        clientY < listRect.top || 
        clientY > listRect.bottom;
      if (isOutside) {
        setIsDraggingBack(false);
      }
    }
  };

  const handleListDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingBack(false);
    const optionLabel = e.dataTransfer.getData('optionLabel');
    const source = e.dataTransfer.getData('source');
    
    if (optionLabel && source === 'dropzone') {
      // Find the question that has this option and clear it (ONLY within this group)
      const sourceQuestion = Object.entries(answers).find(
        ([qNum, label]) => groupQuestionNumbers.has(parseInt(qNum)) && label === optionLabel
      );
      if (sourceQuestion) {
        onAnswerChange(parseInt(sourceQuestion[0]), '');
      }
    }
  };

  // Split question text by 2+ consecutive underscores to find drop zones
  const splitByUnderscores = (text: string): string[] => {
    // Match 2 or more consecutive underscores
    return text.split(/_{2,}/);
  };

  return (
    <div className="mt-4">
      {/* Two-column layout: Questions on left, Options on right */}
      <div className="flex gap-8">
        {/* Left Column: Questions with Drop Zones */}
        <div className="space-y-3 flex-shrink-0">
          {questions.map((question) => {
            const assignedOptionLabel = answers[question.question_number];
            const assignedOptionText = formattedGroupOptions.find(opt => opt.label === assignedOptionLabel)?.text;
            const parts = splitByUnderscores(question.question_text);

            // Show blue border only on first question when no answers exist
            const showBlueBorder = !hasAnyAnswer && question.question_number === firstQuestionNumber;

            return (
              <div
                key={question.id}
                id={`question-${question.question_number}`}
                className="py-1"
              >
                <div className="flex items-center gap-2">
                  {question.heading && (
                    <div className="mr-2 font-medium text-foreground">
                      <QuestionTextWithTools
                        testId={testId}
                        contentId={`${question.id}-heading`}
                        text={question.heading}
                        fontSize={fontSize}
                        renderRichText={renderRichText}
                        isActive={false}
                      />
                    </div>
                  )}
                  {parts.map((part, idx) => (
                    <span key={idx} className="inline-flex items-center">
                      <QuestionTextWithTools
                        testId={testId}
                        contentId={`${question.id}-part-${idx}`}
                        text={part}
                        fontSize={fontSize}
                        renderRichText={renderRichText}
                        isActive={false}
                        as="span"
                      />
                      {idx < parts.length - 1 && (
                        <DropZone
                          questionNumber={question.question_number}
                          assignedOption={assignedOptionLabel ? { label: assignedOptionLabel, text: assignedOptionText || '' } : null}
                          onDrop={handleDrop}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          fontSize={fontSize}
                          showBlueBorder={showBlueBorder}
                          pressedOptionLabel={pressedOptionLabel}
                          setPressedOptionLabel={setPressedOptionLabel}
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

          {/* Visible options container */}
          <div
            ref={listContainerRef}
            className={cn(
              "relative z-10 flex flex-col gap-2 transition-all duration-200 rounded-lg p-4",
              isDraggingBack ? "bg-[hsl(var(--ielts-ghost))]" : "bg-transparent"
            )}
            onDragOver={handleListDragOver}
            onDragLeave={handleListDragLeave}
            onDrop={handleListDrop}
          >
            {/* Render ALL options with fixed slots - invisible placeholder when used */}
            {formattedGroupOptions.map((option) => {
              const isUsed = usedOptionLabels.includes(option.label);
              const isPressed = pressedOptionLabel === option.label;

              return (
                <div
                  key={option.label}
                  className="min-h-[32px]"
                >
                  {!isUsed ? (
                    <div
                      draggable
                      onMouseDown={() => setPressedOptionLabel(option.label)}
                      onMouseUp={() => setPressedOptionLabel(null)}
                      onMouseLeave={() => setPressedOptionLabel(null)}
                      onDragStart={(e) => handleDragStart(e, option.label, 'options')}
                      onDragEnd={handleDragEnd}
                      className="cursor-move"
                    >
                      <span
                        className={cn(
                          "ielts-drag-option inline-block text-sm text-foreground border border-[hsl(var(--ielts-drag-border))] px-2 py-1 transition-colors hover:border-[hsl(var(--ielts-drag-hover))] hover:border-2",
                          isPressed && "opacity-60"
                        )}
                        style={{ fontFamily: 'var(--font-ielts)' }}
                      >
                        {option.text}
                      </span>
                    </div>
                  ) : (
                    // Invisible placeholder to maintain slot position (same size as option)
                    <div className="invisible pointer-events-none">
                      <span
                        className="inline-block text-sm border px-2 py-1"
                        style={{ fontFamily: 'var(--font-ielts)' }}
                      >
                        {option.text}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
}

interface DropZoneProps {
  questionNumber: number;
  assignedOption: { label: string; text: string } | null;
  onDrop: (e: React.DragEvent, questionNumber: number) => void;
  onDragStart: (e: React.DragEvent, optionLabel: string, source: 'options' | 'dropzone') => void;
  onDragEnd: () => void;
  fontSize: number;
  showBlueBorder: boolean;
  pressedOptionLabel: string | null;
  setPressedOptionLabel: (label: string | null) => void;
}

function DropZone({ 
  questionNumber, 
  assignedOption, 
  onDrop, 
  onDragStart,
  onDragEnd,
  fontSize,
  showBlueBorder,
  pressedOptionLabel: _pressedOptionLabel,
  setPressedOptionLabel: _setPressedOptionLabel
}: DropZoneProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Reset pressed state when assignedOption changes
  useEffect(() => {
    setIsPressed(false);
  }, [assignedOption?.label]);

  // Use DOM manipulation for drag-over visual feedback to avoid re-renders
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (spanRef.current) {
      spanRef.current.classList.add('border-sky-400', 'border-2');
      spanRef.current.classList.remove('border-dashed', 'border-foreground/40', 'border-muted-foreground/40');
    }
  };

  const handleDragLeave = () => {
    if (spanRef.current) {
      spanRef.current.classList.remove('border-sky-400', 'border-2');
      if (!assignedOption) {
        spanRef.current.classList.add('border-dashed', showBlueBorder ? 'border-sky-400' : 'border-muted-foreground/40');
      } else {
        spanRef.current.classList.add('border-foreground/40');
      }
    }
  };

  const handleDropLocal = (e: React.DragEvent) => {
    onDrop(e, questionNumber);
    if (spanRef.current) {
      spanRef.current.classList.remove('border-sky-400', 'border-2');
      spanRef.current.classList.add('border-foreground/40');
    }
  };

  const handleFilledDragStart = (e: React.DragEvent) => {
    if (!assignedOption) return;
    setIsPressed(false);
    onDragStart(e, assignedOption.label, 'dropzone');
  };

  const handleFilledDragEnd = () => {
    setIsPressed(false);
    onDragEnd();
  };

  // Filled state: draggable option
  if (assignedOption) {
    return (
      <span
        ref={spanRef}
        draggable
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onDragStart={handleFilledDragStart}
        onDragEnd={handleFilledDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropLocal}
        className={cn(
          "ielts-drop-zone--filled inline-block text-sm text-foreground border border-[hsl(var(--ielts-drag-border))] px-2 py-1 transition-colors cursor-move hover:border-[hsl(var(--ielts-drag-hover))] hover:border-2 mx-1",
          isPressed && "opacity-60"
        )}
        style={{ fontSize: `${fontSize}px`, fontFamily: 'var(--font-ielts)' }}
      >
        {assignedOption.text}
      </span>
    );
  }

  // Empty state - drop zone
  return (
    <span
      ref={spanRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropLocal}
      className={cn(
        "ielts-drop-zone inline-flex items-center justify-center text-sm px-3 py-1 transition-colors min-w-[120px] text-center border mx-1",
        showBlueBorder
          ? "border-dashed border-[hsl(var(--ielts-drag-hover))]"
          : "border-dashed border-[hsl(var(--ielts-drag-border))]"
      )}
      style={{ fontSize: `${fontSize}px`, fontFamily: 'var(--font-ielts)' }}
    >
      <span className={cn(
        "select-none",
        showBlueBorder ? "text-foreground font-bold" : "text-muted-foreground/60"
      )}>{questionNumber}</span>
    </span>
  );
}