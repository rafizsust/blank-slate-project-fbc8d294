import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Info, ArrowDown, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from './RichTextEditor';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export interface FlowchartStep {
  id: string;
  text: string; // Text with ____N____ placeholders for blanks
  hasBlank: boolean;
  blankNumber?: number;
  alignment?: 'left' | 'center' | 'right'; // Step alignment
}

interface FlowchartCompletionEditorProps {
  title: string;
  steps: FlowchartStep[];
  options: string[];
  correctAnswers: Record<number, string>; // question_number -> correct option text
  startQuestion: number;
  endQuestion: number;
  onTitleChange: (title: string) => void;
  onStepsChange: (steps: FlowchartStep[]) => void;
  onOptionsChange: (options: string[], nextCorrectAnswers?: Record<number, string>) => void;
  onCorrectAnswersChange: (answers: Record<number, string>) => void;
}

export function FlowchartCompletionEditor({
  title,
  steps,
  options,
  correctAnswers,
  startQuestion,
  endQuestion,
  onTitleChange,
  onStepsChange,
  onOptionsChange,
  onCorrectAnswersChange,
}: FlowchartCompletionEditorProps) {
  // Add a new step
  const addStep = () => {
    const newStep: FlowchartStep = {
      id: crypto.randomUUID(),
      text: '',
      hasBlank: false,
      blankNumber: undefined,
      alignment: 'left',
    };
    onStepsChange([...steps, newStep]);
  };

  // Update a step
  const updateStep = (index: number, updates: Partial<FlowchartStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    onStepsChange(newSteps);
  };

  // Remove a step
  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    onStepsChange(newSteps);
  };

  // Check if text contains a blank pattern (2+ consecutive underscores)
  const hasBlankPattern = (text: string): boolean => {
    return /_{2,}/.test(text);
  };

  // Get blank number from pattern like ____1____ or just ____
  const getBlankNumber = (text: string): number | undefined => {
    const match = text.match(/____(\d+)____/);
    return match ? parseInt(match[1]) : undefined;
  };

  // Toggle blank for a step - inserts/removes ____N____ pattern
  const toggleBlank = (index: number) => {
    const step = steps[index];
    const hasPattern = hasBlankPattern(step.text);
    
    if (hasPattern) {
      // Remove blank pattern from text
      const newText = step.text.replace(/____\d*____/g, '').trim();
      updateStep(index, { text: newText, hasBlank: false, blankNumber: undefined });
      // Remove from correct answers
      if (step.blankNumber) {
        const newAnswers = { ...correctAnswers };
        delete newAnswers[step.blankNumber];
        onCorrectAnswersChange(newAnswers);
      }
    } else {
      // Add blank - find next available question number
      const usedNumbers = new Set(steps.filter(s => s.hasBlank && s.blankNumber).map(s => s.blankNumber));
      let nextNumber = startQuestion;
      while (usedNumbers.has(nextNumber) && nextNumber <= endQuestion) {
        nextNumber++;
      }
      if (nextNumber <= endQuestion) {
        // Insert blank pattern at end of text
        const blankPattern = `____${nextNumber}____`;
        const newText = step.text ? `${step.text} ${blankPattern}` : blankPattern;
        updateStep(index, { text: newText, hasBlank: true, blankNumber: nextNumber });
      }
    }
  };

  // Sync hasBlank state when text changes (detect underscores)
  const handleStepTextChange = (index: number, newText: string) => {
    const hasPattern = hasBlankPattern(newText);
    const blankNum = getBlankNumber(newText);
    updateStep(index, { 
      text: newText, 
      hasBlank: hasPattern,
      blankNumber: hasPattern ? (blankNum || steps[index].blankNumber) : undefined
    });
  };

  // Add option
  const addOption = () => {
    onOptionsChange([...options, '']);
  };

  // Update option
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onOptionsChange(newOptions);
  };

  // Remove option
  const removeOption = (index: number) => {
    const removed = options[index];
    const newOptions = options.filter((_, i) => i !== index);

    // Remove from correct answers if used
    const newCorrectAnswers: Record<number, string> = {};
    Object.entries(correctAnswers).forEach(([qNum, answer]) => {
      if (answer !== removed) {
        newCorrectAnswers[parseInt(qNum)] = answer;
      }
    });

    // IMPORTANT: update both in a single state update upstream to avoid overwriting
    onOptionsChange(newOptions, newCorrectAnswers);
  };

  // Count blanks
  const blankCount = steps.filter(s => s.hasBlank).length;

  return (
    <div className="space-y-6">
      {/* Flowchart Title */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Flowchart Title
          <Tooltip>
            <TooltipTrigger>
              <Info size={14} className="text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>A bold title displayed above the flowchart (e.g., "Procedure for detecting life on another planet")</p>
            </TooltipContent>
          </Tooltip>
        </Label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g., Procedure for detecting life on another planet"
        />
      </div>

      {/* Flowchart Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            Flowchart Steps
            <Badge variant="secondary">{steps.length} steps, {blankCount} blanks</Badge>
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <Plus size={14} className="mr-1" />
            Add Step
          </Button>
        </div>

        {steps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No steps yet. Click "Add Step" to create flowchart steps.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.id}>
                <div className="flex items-start gap-2 p-3 border rounded-lg bg-muted/20">
                  <GripVertical size={18} className="text-muted-foreground mt-2 cursor-grab" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Step {index + 1}</span>
                      {step.hasBlank && step.blankNumber && (
                        <Badge variant="default" className="text-xs">
                          Q{step.blankNumber}
                        </Badge>
                      )}
                    </div>
                    <RichTextEditor
                      value={step.text}
                      onChange={(value) => handleStepTextChange(index, value)}
                      placeholder={step.hasBlank 
                        ? "Text with blank, e.g., 'The rover is directed to a ____1____ which has organic material.'"
                        : "Step text, e.g., 'A spacecraft lands on a planet and sends out a rover.' Use ____N____ for blanks."
                      }
                      rows={2}
                    />
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        type="button"
                        variant={step.hasBlank ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleBlank(index)}
                        disabled={!step.hasBlank && blankCount >= (endQuestion - startQuestion + 1)}
                      >
                        {step.hasBlank ? "Remove Blank" : "Add Blank"}
                      </Button>
                      {step.hasBlank && (
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Question #:</Label>
                          <Select
                            value={step.blankNumber?.toString() || ''}
                            onValueChange={(value) => updateStep(index, { blankNumber: parseInt(value) })}
                          >
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: endQuestion - startQuestion + 1 }, (_, i) => startQuestion + i).map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {/* Alignment Toggle */}
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Align:</Label>
                        <ToggleGroup
                          type="single"
                          size="sm"
                          value={step.alignment || 'left'}
                          onValueChange={(value) => {
                            if (value) updateStep(index, { alignment: value as 'left' | 'center' | 'right' });
                          }}
                        >
                          <ToggleGroupItem value="left" aria-label="Align left">
                            <AlignLeft size={14} />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="center" aria-label="Align center">
                            <AlignCenter size={14} />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="right" aria-label="Align right">
                            <AlignRight size={14} />
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="text-muted-foreground" size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Draggable Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            Draggable Options
            <Badge variant="secondary">{options.length} options</Badge>
            <Tooltip>
              <TooltipTrigger>
                <Info size={14} className="text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>These are the options that test takers will drag and drop into the blanks.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Plus size={14} className="mr-1" />
            Add Option
          </Button>
        </div>

        {options.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No options yet. Add draggable options for the blanks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="h-9"
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeOption(index);
                  }} 
                  className="h-9 w-9 flex-shrink-0"
                >
                  <Trash2 size={12} className="text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Correct Answers */}
      {blankCount > 0 && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            Correct Answers
            <Tooltip>
              <TooltipTrigger>
                <Info size={14} className="text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Select the correct option for each blank from the dropdown.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <div className="space-y-2 p-4 bg-muted/20 rounded-lg">
            {steps.filter(s => s.hasBlank && s.blankNumber).sort((a, b) => (a.blankNumber || 0) - (b.blankNumber || 0)).map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <span className="w-8 font-bold text-primary">{step.blankNumber}.</span>
                <Select
                  value={correctAnswers[step.blankNumber!] || 'none'}
                  onValueChange={(value) => {
                    const newAnswers = { ...correctAnswers };
                    if (value === 'none') {
                      delete newAnswers[step.blankNumber!];
                    } else {
                      newAnswers[step.blankNumber!] = value;
                    }
                    onCorrectAnswersChange(newAnswers);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Select --</SelectItem>
                    {options.filter(opt => opt.trim()).map((opt, idx) => (
                      <SelectItem key={idx} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
