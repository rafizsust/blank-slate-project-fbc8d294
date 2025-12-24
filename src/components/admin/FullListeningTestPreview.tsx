import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Clock, Headphones, Volume2 } from 'lucide-react';

import { HighlightNoteProvider } from '@/hooks/useHighlightNotes';
import { ListeningQuestions } from '@/components/listening/ListeningQuestions';

interface Question {
  id?: string;
  question_number: number;
  question_text: string;
  correct_answer: string;
  is_given: boolean;
  heading?: string | null;
  table_data?: any;
  options?: string[];
  option_format?: string;
}

interface QuestionGroup {
  id?: string;
  question_type: string;
  instruction: string;
  start_question: number;
  end_question: number;
  options: any;
  questions: Question[];
  option_format?: string;
  num_sub_questions?: number;
  start_timestamp_seconds?: number | null;
  group_heading?: string | null;
  group_heading_alignment?: 'left' | 'center' | 'right';
}

interface FullListeningTestPreviewProps {
  testTitle: string;
  timeLimit: number;
  questionGroups: QuestionGroup[];
  audioUrl?: string | null;
  audioUrlPart1?: string | null;
  audioUrlPart2?: string | null;
  audioUrlPart3?: string | null;
  audioUrlPart4?: string | null;
}

const PART_RANGES = [
  { label: 'Part 1', start: 1, end: 10 },
  { label: 'Part 2', start: 11, end: 20 },
  { label: 'Part 3', start: 21, end: 30 },
  { label: 'Part 4', start: 31, end: 40 },
];

// Helper to render rich text (markdown-like formatting)
const renderRichText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-2 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^• (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\n/g, '<br/>');
};

export function FullListeningTestPreview({ 
  testTitle, 
  timeLimit, 
  questionGroups,
  audioUrl,
  audioUrlPart1,
  audioUrlPart2,
  audioUrlPart3,
  audioUrlPart4
}: FullListeningTestPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePart, setActivePart] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const handleAnswerChange = (questionNumber: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionNumber]: answer }));
  };

  // Get audio URL for a given part index
  const getPartAudioUrl = (partIndex: number) => {
    switch (partIndex) {
      case 0:
        return audioUrlPart1 || audioUrl;
      case 1:
        return audioUrlPart2 || audioUrl;
      case 2:
        return audioUrlPart3 || audioUrl;
      case 3:
        return audioUrlPart4 || audioUrl;
      default:
        return audioUrl;
    }
  };

  // Transform question groups into the format expected by ListeningQuestions
  const { transformedGroups, allQuestions } = useMemo(() => {
    const normalizeType = (rawType: string): string => {
      const t = (rawType || '').trim();
      if (!t) return t;
      const upper = t.toUpperCase();
      if (upper === 'MULTIPLE_CHOICE') return 'MULTIPLE_CHOICE_SINGLE';
      if (upper === 'DRAG_AND_DROP') return 'DRAG_AND_DROP_OPTIONS';
      if (upper === 'MAP_LABELLING') return 'MAP_LABELING';
      return upper;
    };

    const groups = questionGroups.map((group, idx) => {
      const groupId = group.id || `preview-group-${idx}`;
      const normalizedType = normalizeType(group.question_type);

      return {
        id: groupId,
        question_type: normalizedType,
        instruction: group.instruction || null,
        start_question: group.start_question,
        end_question: group.end_question,
        options: group.options,
        option_format: group.options?.option_format || group.option_format || 'A',
        num_sub_questions: group.options?.num_sub_questions || group.num_sub_questions || 2,
        start_timestamp_seconds: group.start_timestamp_seconds,
        group_heading: group.group_heading,
        group_heading_alignment: group.group_heading_alignment,
        questions: (group.questions || []).map(q => ({
          id: q.id || `preview-q-${q.question_number}`,
          question_number: q.question_number,
          question_type: normalizedType,
          question_text: q.question_text,
          correct_answer: q.correct_answer,
          instruction: group.instruction || null,
          group_id: groupId,
          is_given: q.is_given,
          heading: q.heading || null,
          table_data: q.table_data,
          options: q.options || null,
          option_format: q.option_format || null,
        })),
      };
    });

    const questions = groups.flatMap(g => g.questions);
    return { transformedGroups: groups, allQuestions: questions };
  }, [questionGroups]);

  // Filter groups and questions by active part
  const getPartGroups = (partIndex: number) => {
    const range = PART_RANGES[partIndex];
    if (!range) return { groups: [], questions: [] };

    const filteredGroups = transformedGroups.filter(
      g => g.start_question >= range.start && g.start_question <= range.end
    );
    const filteredQuestions = allQuestions.filter(
      q => q.question_number >= range.start && q.question_number <= range.end
    );

    return { groups: filteredGroups, questions: filteredQuestions };
  };

  const { questions: currentPartQuestions } = getPartGroups(activePart);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Eye size={16} />
          Preview All
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-[1200px] max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye size={20} />
              <span>Test-Taker Preview: {testTitle || 'Untitled Test'}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{timeLimit} mins</span>
              </div>
              <div className="flex items-center gap-1">
                <Headphones size={14} />
                <span>40 Questions</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs 
          value={String(activePart)} 
          onValueChange={(v) => {
            const newPart = parseInt(v);
            setActivePart(newPart);
            setCurrentQuestion(PART_RANGES[newPart].start);
          }}
          className="flex flex-col h-[80vh]"
        >
          {/* Part tabs */}
          <div className="px-4 pt-2">
            <TabsList className="grid grid-cols-4 w-full">
              {PART_RANGES.map((part, idx) => (
                <TabsTrigger key={idx} value={String(idx)} className="gap-2">
                  {part.label}
                  <span className="text-xs text-muted-foreground">
                    (Q{part.start}-{part.end})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content for each part */}
          {PART_RANGES.map((_, idx) => {
            const { groups, questions } = getPartGroups(idx);
            const partAudioUrl = getPartAudioUrl(idx);

            return (
              <TabsContent 
                key={idx} 
                value={String(idx)} 
                className="flex-1 mt-0 overflow-hidden"
              >
                <div className="flex h-full">
                  {/* Audio indicator */}
                  <div className="w-72 border-r p-4 bg-muted/20">
                    <div className="flex items-center gap-2 text-sm font-medium mb-4">
                      <Volume2 size={16} />
                      Audio Player
                    </div>
                    {partAudioUrl ? (
                      <audio
                        controls
                        src={partAudioUrl}
                        className="w-full"
                        preload="metadata"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No audio uploaded for this part
                      </div>
                    )}
                    <div className="mt-4 text-xs text-muted-foreground">
                      <p>In the actual test, audio plays automatically and cannot be paused.</p>
                    </div>
                  </div>

                  {/* Questions - using the real ListeningQuestions component */}
                  <ScrollArea className="flex-1 h-full">
                    <div className="p-6">
                      <HighlightNoteProvider testId="preview">
                        {groups.length > 0 ? (
                          <ListeningQuestions
                            testId="preview"
                            questions={questions}
                            questionGroups={groups}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            currentQuestion={currentQuestion}
                            setCurrentQuestion={setCurrentQuestion}
                            fontSize={14}
                            renderRichText={renderRichText}
                          />
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            No questions added for this part yet.
                          </div>
                        )}
                      </HighlightNoteProvider>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Footer with question navigation */}
        <div className="border-t p-4 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Questions:</span>
            <div className="flex gap-1 flex-wrap max-w-[600px]">
              {currentPartQuestions.map(q => (
                <button
                  key={q.question_number}
                  onClick={() => {
                    setCurrentQuestion(q.question_number);
                    document.getElementById(`question-${q.question_number}`)?.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center' 
                    });
                  }}
                  className={`w-7 h-7 text-xs rounded border transition-colors ${
                    answers[q.question_number]
                      ? 'bg-primary text-primary-foreground border-primary'
                      : currentQuestion === q.question_number
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                  }`}
                >
                  {q.question_number}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {Object.keys(answers).length} / 40 answered
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
