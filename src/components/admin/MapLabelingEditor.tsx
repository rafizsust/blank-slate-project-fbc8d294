import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, MousePointer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ListeningImageUploader } from './ListeningImageUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface DropZone {
  questionNumber: number;
  xPercent: number;
  yPercent: number;
}

interface MapLabelingEditorProps {
  testId: string;
  imageUrl: string | null;
  dropZones: DropZone[];
  options: string[];
  correctAnswers: Record<number, string>;
  maxImageWidth: number | null;
  maxImageHeight: number | null;
  startQuestion: number;
  endQuestion: number;
  onImageChange: (url: string | null) => void;
  onDropZonesChange: (zones: DropZone[]) => void;
  onOptionsChange: (options: string[]) => void;
  onCorrectAnswersChange: (answers: Record<number, string>) => void;
  onMaxImageWidthChange: (width: number | null) => void;
  onMaxImageHeightChange: (height: number | null) => void;
}

export function MapLabelingEditor({
  testId,
  imageUrl,
  dropZones,
  options,
  correctAnswers,
  maxImageWidth,
  maxImageHeight,
  startQuestion,
  endQuestion,
  onImageChange,
  onDropZonesChange,
  onOptionsChange,
  onCorrectAnswersChange,
  onMaxImageWidthChange,
  onMaxImageHeightChange,
}: MapLabelingEditorProps) {
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [nextQuestionToPlace, setNextQuestionToPlace] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const questionCount = endQuestion - startQuestion + 1;

  // Filter valid options (non-empty) for use in correct answers dropdown
  const validOptions = options.filter(o => o && o.trim());

  // Determine which question numbers still need drop zones
  const placedQuestionNumbers = dropZones.map(z => z.questionNumber);
  const unplacedQuestions: number[] = [];
  for (let i = startQuestion; i <= endQuestion; i++) {
    if (!placedQuestionNumbers.includes(i)) {
      unplacedQuestions.push(i);
    }
  }

  useEffect(() => {
    if (isPlacementMode && unplacedQuestions.length > 0) {
      setNextQuestionToPlace(unplacedQuestions[0]);
    } else if (unplacedQuestions.length === 0) {
      setIsPlacementMode(false);
      setNextQuestionToPlace(null);
    }
  }, [isPlacementMode, unplacedQuestions]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacementMode || nextQuestionToPlace === null || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const newZone: DropZone = {
      questionNumber: nextQuestionToPlace,
      xPercent: Math.max(0, Math.min(100, xPercent)),
      yPercent: Math.max(0, Math.min(100, yPercent)),
    };

    onDropZonesChange([...dropZones, newZone]);
    toast.success(`Drop zone for Question ${nextQuestionToPlace} placed!`);

    // Move to next unplaced question
    const remainingUnplaced = unplacedQuestions.filter(q => q !== nextQuestionToPlace);
    if (remainingUnplaced.length > 0) {
      setNextQuestionToPlace(remainingUnplaced[0]);
    } else {
      setIsPlacementMode(false);
      setNextQuestionToPlace(null);
    }
  };

  const handleDragStart = (questionNumber: number) => {
    setIsDragging(questionNumber);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging === null || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const updatedZones = dropZones.map(z => 
      z.questionNumber === isDragging 
        ? { ...z, xPercent: Math.max(0, Math.min(100, xPercent)), yPercent: Math.max(0, Math.min(100, yPercent)) }
        : z
    );
    onDropZonesChange(updatedZones);
  };

  const handleDragEnd = () => {
    setIsDragging(null);
  };

  const removeDropZone = (questionNumber: number) => {
    onDropZonesChange(dropZones.filter(z => z.questionNumber !== questionNumber));
  };

  const addOption = () => {
    onOptionsChange([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onOptionsChange(newOptions);
  };

  const removeOption = (index: number) => {
    onOptionsChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
      {/* Image Upload Section */}
      <div>
        <Label className="text-base font-semibold">Map/Diagram Image</Label>
        <ListeningImageUploader
          testId={testId}
          currentImageUrl={imageUrl}
          onUploadSuccess={(url) => onImageChange(url)}
          onRemoveSuccess={() => onImageChange(null)}
        />
      </div>

      {/* Image Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Max Image Width (px)</Label>
          <Input
            type="number"
            value={maxImageWidth || ''}
            onChange={(e) => onMaxImageWidthChange(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="e.g., 450"
          />
        </div>
        <div className="space-y-2">
          <Label>Max Image Height (px)</Label>
          <Input
            type="number"
            value={maxImageHeight || ''}
            onChange={(e) => onMaxImageHeightChange(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="e.g., 400"
          />
        </div>
      </div>

      {/* Visual Drop Zone Placement */}
      {imageUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              Drop Zone Placement
              <Badge variant="secondary">{dropZones.length}/{questionCount} placed</Badge>
            </Label>
            <Button 
              variant={isPlacementMode ? "default" : "outline"} 
              size="sm"
              onClick={() => setIsPlacementMode(!isPlacementMode)}
              disabled={unplacedQuestions.length === 0}
            >
              <MousePointer size={14} className="mr-1" />
              {isPlacementMode ? 'Exit Placement Mode' : 'Place Drop Zones'}
            </Button>
          </div>

          {isPlacementMode && nextQuestionToPlace !== null && (
            <p className="text-sm text-primary font-medium">
              Click on the image to place drop zone for Question {nextQuestionToPlace}
            </p>
          )}

          <div 
            ref={imageContainerRef}
            className={`relative border-2 rounded-lg overflow-hidden ${isPlacementMode ? 'border-primary cursor-crosshair' : 'border-border'}`}
            style={{
              maxWidth: maxImageWidth || 600,
              maxHeight: maxImageHeight || 500,
            }}
            onClick={handleImageClick}
            onMouseMove={isDragging !== null ? handleDragMove : undefined}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <img
              src={imageUrl}
              alt="Map for labeling"
              className="w-full h-auto"
              draggable={false}
            />
            
            {/* Render placed drop zones */}
            {dropZones.map((zone) => (
              <div
                key={zone.questionNumber}
                className={`absolute flex items-center justify-center bg-primary text-primary-foreground rounded border-2 border-primary-foreground shadow-lg cursor-move ${isDragging === zone.questionNumber ? 'opacity-75' : ''}`}
                style={{
                  left: `${zone.xPercent}%`,
                  top: `${zone.yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '48px',
                  height: '32px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleDragStart(zone.questionNumber);
                }}
                title={`Question ${zone.questionNumber} - Drag to reposition`}
              >
                {zone.questionNumber}
              </div>
            ))}
          </div>

          {/* Drop Zone List */}
          {dropZones.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Placed Drop Zones:</Label>
              <div className="flex flex-wrap gap-2">
                {dropZones.sort((a, b) => a.questionNumber - b.questionNumber).map((zone) => (
                  <div key={zone.questionNumber} className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded text-sm">
                    <span className="font-medium">Q{zone.questionNumber}</span>
                    <span className="text-muted-foreground text-xs">({zone.xPercent.toFixed(1)}%, {zone.yPercent.toFixed(1)}%)</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => removeDropZone(zone.questionNumber)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Draggable Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold flex items-center gap-2">
            Answer Options
            <Badge variant="secondary">{options.length} options</Badge>
          </Label>
          <Button variant="outline" size="sm" onClick={addOption}>
            Add Option
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          These are the draggable options that test-takers will drag onto the map. Include more options than questions (distractors).
        </p>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption(index)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Correct Answers for Each Question */}
      {validOptions.length > 0 && (
        <div className="space-y-4">
          <Label className="text-base font-semibold">Correct Answers</Label>
          <p className="text-sm text-muted-foreground">
            Select the correct option for each question. {dropZones.length === 0 && "(Place drop zones on the image to visualize positions)"}
          </p>
          <p className="text-xs text-muted-foreground">
            Available options ({validOptions.length}): {validOptions.join(', ')}
          </p>
          <div className="space-y-3">
            {Array.from({ length: questionCount }, (_, i) => startQuestion + i).map((qNum) => {
              const hasDropZone = dropZones.some(z => z.questionNumber === qNum);
              return (
                <div key={`${qNum}-${validOptions.length}`} className="flex items-center gap-3">
                  <span className={`w-20 font-medium text-sm ${!hasDropZone ? 'text-muted-foreground' : ''}`}>
                    Q{qNum}{!hasDropZone ? '*' : ''}:
                  </span>
                  <Select
                    key={`select-${qNum}-${validOptions.join(',')}`}
                    value={correctAnswers[qNum] || ''}
                    onValueChange={(value) => {
                      onCorrectAnswersChange({
                        ...correctAnswers,
                        [qNum]: value,
                      });
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {validOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
          {dropZones.length < questionCount && (
            <p className="text-xs text-muted-foreground">* Drop zone not yet placed on image</p>
          )}
        </div>
      )}
    </div>
  );
}
