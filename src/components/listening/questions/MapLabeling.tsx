import { useState, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

const TRANSPARENT_DRAG_IMAGE = typeof Image !== 'undefined'
  ? (() => {
      const img = new Image();
      img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
      return img;
    })()
  : null;

function hideDragGhost(e: React.DragEvent) {
  if (TRANSPARENT_DRAG_IMAGE && e.dataTransfer?.setDragImage) {
    e.dataTransfer.setDragImage(TRANSPARENT_DRAG_IMAGE, 0, 0);
  }
}

interface DropZone {
  questionNumber: number;
  xPercent: number;
  yPercent: number;
}

interface MapLabelingProps {
  imageUrl: string;
  dropZones: DropZone[];
  options: string[];
  answers: Record<number, string>;
  onAnswerChange: (questionNumber: number, answer: string) => void;
  onQuestionFocus?: (questionNumber: number) => void;
  maxImageWidth?: number | null;
  maxImageHeight?: number | null;
  fontSize?: number;
}

export function MapLabeling({
  imageUrl,
  dropZones,
  options,
  answers,
  onAnswerChange,
  onQuestionFocus,
  maxImageWidth,
  maxImageHeight,
  fontSize = 14,
}: MapLabelingProps) {
  const [pressedOption, setPressedOption] = useState<string | null>(null);
  const [isDraggingBack, setIsDraggingBack] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Filter out empty/blank options
  const validOptions = options.filter(opt => opt && opt.trim());

  // Get question numbers in THIS group only (from dropZones)
  const groupQuestionNumbers = useMemo(
    () => new Set(dropZones.map((z) => z.questionNumber)),
    [dropZones]
  );
  // Track which options are already used (only for questions in THIS group)
  const usedOptions = new Set(
    Object.entries(answers)
      .filter(([qNum]) => groupQuestionNumbers.has(parseInt(qNum)))
      .map(([_, opt]) => opt)
      .filter(Boolean)
  );

  // Check if any question IN THIS GROUP has been answered (scoped to avoid cross-group interference)
  const hasAnyAnswer = Object.entries(answers).some(
    ([qNum, a]) => groupQuestionNumbers.has(parseInt(qNum)) && a && a !== ''
  );

  // Get the first question number for initial highlight
  const firstQuestionNumber = dropZones.length > 0
    ? Math.min(...dropZones.map(z => z.questionNumber))
    : 0;

  const handleDragStart = (e: React.DragEvent, option: string, source: 'options' | 'dropzone') => {
    setPressedOption(null);
    hideDragGhost(e);
    e.dataTransfer.setData('option', option);
    e.dataTransfer.setData('source', source);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setPressedOption(null);
    setIsDraggingBack(false);
  };

  const handleDrop = useCallback((e: React.DragEvent, questionNumber: number) => {
    e.preventDefault();
    const option = e.dataTransfer.getData('option');
    const source = e.dataTransfer.getData('source');

    if (option) {
      // If dragging from another dropzone, clear that one first (ONLY within this group)
      if (source === 'dropzone') {
        const sourceQuestion = Object.entries(answers).find(
          ([qNum, opt]) => groupQuestionNumbers.has(parseInt(qNum)) && opt === option
        );
        if (sourceQuestion) {
          onAnswerChange(parseInt(sourceQuestion[0]), '');
        }
      }
      onAnswerChange(questionNumber, option);
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
    const option = e.dataTransfer.getData('option');
    const source = e.dataTransfer.getData('source');

    if (option && source === 'dropzone') {
      const sourceQuestion = Object.entries(answers).find(
        ([qNum, opt]) => groupQuestionNumbers.has(parseInt(qNum)) && opt === option
      );
      if (sourceQuestion) {
        onAnswerChange(parseInt(sourceQuestion[0]), '');
      }
    }
  };

  // Sort drop zones by question number
  const sortedDropZones = [...dropZones].sort((a, b) => a.questionNumber - b.questionNumber);

  return (
    <div className="flex flex-col lg:flex-row lg:flex-wrap gap-6 lg:gap-8 items-start w-full min-w-0">
      {/* Left: Map with drop zones */}
      <div className="flex-shrink-0">
        <div
          className="relative border rounded-lg overflow-hidden bg-card"
          style={{
            maxWidth: maxImageWidth || 450,
            maxHeight: maxImageHeight || 500,
          }}
        >
          <img
            src={imageUrl}
            alt="Map diagram for labeling"
            className="w-full h-auto"
            draggable={false}
          />

          {/* Drop zones on the map */}
          {sortedDropZones.map((zone) => {
            const currentAnswer = answers[zone.questionNumber];
            const showBlueBorder = !hasAnyAnswer && zone.questionNumber === firstQuestionNumber;

            return (
              <MapDropZone
                key={zone.questionNumber}
                zone={zone}
                assignedOption={currentAnswer || null}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                fontSize={fontSize}
                showBlueBorder={showBlueBorder}
              />
            );
          })}
        </div>
      </div>

      {/* Right Column: Draggable Options */}
      <div className="relative w-full max-w-full min-w-0 lg:w-auto lg:min-w-[180px] lg:max-w-[280px]">
        {/* Visible options container - only highlights when dragging back over the drop area */}
        <div
          ref={listContainerRef}
          className={cn(
            "relative z-10 flex flex-wrap lg:flex-col gap-2 transition-all duration-200 p-3 lg:p-4 max-w-full overflow-x-auto bg-transparent",
            isDraggingBack && "bg-muted/30 rounded-lg border border-border/50"
          )}
          onDragOver={handleListDragOver}
          onDragLeave={handleListDragLeave}
          onDrop={handleListDrop}
        >
          {validOptions.map((option, index) => {
            const isUsed = usedOptions.has(option);
            const isPressed = pressedOption === option;

            return (
              <div
                key={`${option}-${index}`}
                className="min-h-[32px] flex-shrink-0"
              >
                {!isUsed ? (
                  <div
                    draggable
                    onMouseDown={() => setPressedOption(option)}
                    onMouseUp={() => setPressedOption(null)}
                    onMouseLeave={() => setPressedOption(null)}
                    onDragStart={(e) => handleDragStart(e, option, 'options')}
                    onDragEnd={handleDragEnd}
                    className="cursor-move"
                  >
                    <span
                      className={cn(
                        "ielts-drag-option inline-block text-sm text-foreground border border-[hsl(var(--ielts-drag-border))] px-2 py-1 transition-colors hover:border-[hsl(var(--ielts-drag-hover))] hover:border-2",
                        "max-w-full break-words whitespace-normal",
                        isPressed && "opacity-60"
                      )}
                      style={{ fontSize: `${fontSize}px`, fontFamily: 'var(--font-ielts)' }}
                    >
                      {option}
                    </span>
                  </div>
                ) : (
                  // Show placeholder only during drag-back, otherwise empty
                  isDraggingBack ? (
                    <span
                      className="inline-block text-sm text-[hsl(var(--ielts-ghost))] border border-dashed border-[hsl(var(--ielts-ghost))] px-2 py-1 max-w-full break-words whitespace-normal"
                      style={{ fontSize: `${fontSize}px`, fontFamily: 'var(--font-ielts)' }}
                    >
                      {option}
                    </span>
                  ) : null
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface MapDropZoneProps {
  zone: DropZone;
  assignedOption: string | null;
  onDrop: (e: React.DragEvent, questionNumber: number) => void;
  onDragStart: (e: React.DragEvent, option: string, source: 'options' | 'dropzone') => void;
  onDragEnd: () => void;
  fontSize: number;
  showBlueBorder: boolean;
}

function MapDropZone({ 
  zone, 
  assignedOption, 
  onDrop, 
  onDragStart,
  onDragEnd,
  fontSize,
  showBlueBorder,
}: MapDropZoneProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Use DOM manipulation for drag-over visual feedback
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
    onDrop(e, zone.questionNumber);
    if (spanRef.current) {
      spanRef.current.classList.remove('border-sky-400', 'border-2');
      spanRef.current.classList.add('border-foreground/40');
    }
  };

  const handleFilledDragStart = (e: React.DragEvent) => {
    if (!assignedOption) return;
    setIsPressed(false);
    onDragStart(e, assignedOption, 'dropzone');
  };

  const handleFilledDragEnd = () => {
    setIsPressed(false);
    onDragEnd();
  };

  const basePositionStyle = {
    left: `${zone.xPercent}%`,
    top: `${zone.yPercent}%`,
    transform: 'translate(-50%, -50%)',
  };

  // Filled state: draggable option - allow dragging back to options list
  if (assignedOption) {
    return (
      <span
        ref={spanRef}
        draggable={true}
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsPressed(true);
        }}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onDragStart={(e) => {
          e.stopPropagation();
          handleFilledDragStart(e);
        }}
        onDragEnd={handleFilledDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropLocal}
        className={cn(
          "ielts-drop-zone--filled absolute inline-block text-sm text-foreground border border-[hsl(var(--ielts-drag-border))] px-2 py-1 transition-colors cursor-move hover:border-[hsl(var(--ielts-drag-hover))] hover:border-2",
          isPressed && "opacity-60"
        )}
        style={{ ...basePositionStyle, fontSize: `${fontSize}px`, fontFamily: 'var(--font-ielts)', userSelect: 'none' }}
      >
        {assignedOption}
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
        "ielts-drop-zone absolute inline-flex items-center justify-center text-sm px-3 py-1 transition-colors min-w-[120px] text-center border",
        showBlueBorder
          ? "border-dashed border-[hsl(var(--ielts-drag-hover))]"
          : "border-dashed border-[hsl(var(--ielts-drag-border))]"
      )}
      style={{ ...basePositionStyle, fontSize: `${fontSize}px`, fontFamily: 'var(--font-ielts)' }}
    >
      <span className={cn(
        "select-none",
        showBlueBorder ? "text-foreground font-bold" : "text-muted-foreground/60"
      )}>{zone.questionNumber}</span>
    </span>
  );
}