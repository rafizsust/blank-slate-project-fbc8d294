import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Info } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface SpeakingQuestion {
  id?: string;
  question_number: number;
  question_text: string;
  time_limit_seconds: number; // Individual time limit for this question
  is_required: boolean; // For Part 3
  order_index: number;
}

interface SpeakingPart3EditorProps {
  questions: SpeakingQuestion[];
  onUpdateQuestions: (questions: SpeakingQuestion[]) => void;
  groupTimeLimitSeconds: number; // Default time limit for new questions in this group
  onUpdateGroupTimeLimit: (time: number) => void;
  totalPartTimeLimitSeconds: number; // Overall time limit for Part 3
  onUpdateTotalPartTimeLimit: (time: number) => void;
  minRequiredQuestions: number; // Minimum required questions for Part 3
  onUpdateMinRequiredQuestions: (count: number) => void;
}

export function SpeakingPart3Editor({
  questions,
  onUpdateQuestions,
  groupTimeLimitSeconds,
  onUpdateGroupTimeLimit,
  totalPartTimeLimitSeconds,
  onUpdateTotalPartTimeLimit,
  minRequiredQuestions,
  onUpdateMinRequiredQuestions,
}: SpeakingPart3EditorProps) {
  const addQuestion = useCallback((isRequired: boolean) => {
    const newOrderIndex = questions.length;
    const newQuestion: SpeakingQuestion = {
      id: crypto.randomUUID(),
      question_number: newOrderIndex + 1,
      question_text: '',
      time_limit_seconds: groupTimeLimitSeconds, // Use group default
      is_required: isRequired,
      order_index: newOrderIndex,
    };
    onUpdateQuestions([...questions, newQuestion]);
  }, [questions, onUpdateQuestions, groupTimeLimitSeconds]);

  const updateQuestion = useCallback((index: number, updates: Partial<SpeakingQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    onUpdateQuestions(newQuestions);
  }, [questions, onUpdateQuestions]);

  const removeQuestion = useCallback((index: number) => {
    const newQuestions = questions
      .filter((_, i) => i !== index)
      .map((q, i) => ({
        ...q,
        question_number: i + 1, // Re-number questions
        order_index: i,
      }));
    onUpdateQuestions(newQuestions);
  }, [questions, onUpdateQuestions]);

  const moveQuestion = useCallback((fromIndex: number, toIndex: number) => {
    const newQuestions = [...questions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);
    onUpdateQuestions(newQuestions.map((q, i) => ({ ...q, order_index: i, question_number: i + 1 })));
  }, [questions, onUpdateQuestions]);

  const requiredQuestionsCount = questions.filter(q => q.is_required).length;
  const optionalQuestionsCount = questions.filter(q => !q.is_required).length;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Part 3 Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Default Question Time Limit (seconds)
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={14} className="text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>This is the default time limit for new questions added to Part 3. Individual questions can override this.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  type="number"
                  value={groupTimeLimitSeconds}
                  onChange={(e) => onUpdateGroupTimeLimit(parseInt(e.target.value) || 0)}
                  min={30}
                  max={90}
                  className="w-32"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Total Part 3 Time Limit (seconds)
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={14} className="text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The overall time limit for the entire Part 3 section. The test will end when this time runs out, regardless of remaining questions.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  type="number"
                  value={totalPartTimeLimitSeconds}
                  onChange={(e) => onUpdateTotalPartTimeLimit(parseInt(e.target.value) || 0)}
                  min={180}
                  max={420} // 7 minutes
                  className="w-32"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Minimum Required Questions
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={14} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The minimum number of 'Required' questions the student must attempt before 'Optional' questions are considered.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                type="number"
                value={minRequiredQuestions}
                onChange={(e) => onUpdateMinRequiredQuestions(parseInt(e.target.value) || 0)}
                min={0}
                max={questions.length}
                className="w-32"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Questions ({questions.length})</h3>
          <div className="flex gap-2">
            <Button onClick={() => addQuestion(true)} variant="outline" size="sm">
              <Plus size={16} className="mr-1" />
              Add Required
            </Button>
            <Button onClick={() => addQuestion(false)} variant="outline" size="sm">
              <Plus size={16} className="mr-1" />
              Add Optional
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Summary: {requiredQuestionsCount} Required + {optionalQuestionsCount} Optional questions
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No questions yet for Part 3. Click "Add Required" or "Add Optional" to start.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id || index}
                className={cn(
                  "border rounded-lg p-4 bg-muted/20 flex items-start gap-4",
                  question.is_required ? "border-blue-500/50" : "border-gray-500/50"
                )}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('questionIndex', String(index));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const draggedIndex = parseInt(e.dataTransfer.getData('questionIndex'));
                  if (draggedIndex !== index) {
                    moveQuestion(draggedIndex, index);
                  }
                }}
              >
                <div className="mt-2 cursor-grab text-muted-foreground">
                  <GripVertical size={20} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Question {question.question_number}</Label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={String(question.is_required)}
                        onValueChange={(value) => updateQuestion(index, { is_required: value === 'true' })}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Required</SelectItem>
                          <SelectItem value="false">Optional</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Question Text</Label>
                    <RichTextEditor
                      value={question.question_text}
                      onChange={(value) => updateQuestion(index, { question_text: value })}
                      placeholder="Enter the question text..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Time Limit (seconds)</Label>
                    <Input
                      type="number"
                      value={question.time_limit_seconds}
                      onChange={(e) => updateQuestion(index, { time_limit_seconds: parseInt(e.target.value) || 0 })}
                      min={30}
                      max={90}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}