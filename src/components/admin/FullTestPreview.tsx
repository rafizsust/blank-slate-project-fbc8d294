import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Clock, FileText } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

import { HighlightNoteProvider } from '@/hooks/useHighlightNotes';
import { ReadingQuestions } from '@/components/reading/ReadingQuestions';

interface Paragraph {
  id?: string;
  label: string;
  content: string;
  is_heading: boolean;
  order_index: number;
}

interface Passage {
  id?: string;
  passage_number: number;
  title: string;
  paragraphs: Paragraph[];
  show_labels?: boolean;
}

interface Question {
  id?: string;
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  option_format: string;
  heading?: string;
  sub_group_start?: number;
  sub_group_end?: number;
}

interface QuestionGroup {
  id?: string;
  passage_id?: string;
  question_type: string;
  instruction: string;
  start_question: number;
  end_question: number;
  options: any;
  questions: Question[];
  max_answers?: number;
  option_format?: string;
  display_as_paragraph?: boolean;
  show_bullets?: boolean;
  show_headings?: boolean;
  use_dropdown?: boolean;
  group_title?: string;
  title_centered?: boolean;
  title_colored?: boolean;
  table_data?: any;
  use_letter_headings?: boolean;
  options_title?: string;
}

interface FullTestPreviewProps {
  testTitle: string;
  timeLimit: number;
  passages: Passage[];
  questionGroups: Record<number, QuestionGroup[]>;
}

function renderRichText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-2 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^• (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\n/g, '<br/>');
}

export function FullTestPreview({ testTitle, timeLimit, passages, questionGroups }: FullTestPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePassage, setActivePassage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [headingAnswers, setHeadingAnswers] = useState<Record<string, string>>({});
  const [selectedHeading, setSelectedHeading] = useState<string | null>(null);

  const handleAnswerChange = (questionNumber: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionNumber]: answer }));
  };

  const handleHeadingAnswerChange = (paragraphLabel: string, headingId: string | null) => {
    setHeadingAnswers(prev => {
      const newAnswers = { ...prev };
      if (headingId === null) {
        delete newAnswers[paragraphLabel];
      } else {
        newAnswers[paragraphLabel] = headingId;
      }
      return newAnswers;
    });
  };

  const currentPassage = passages[activePassage];
  const currentGroups = questionGroups[activePassage] || [];

  // Get paragraph labels for matching
  const paragraphLabels = currentPassage?.paragraphs
    .filter(p => p.is_heading)
    .map(p => p.label) || [];

  // Get heading options for matching headings
  const headingOptions = useMemo(() => {
    const matchingGroup = currentGroups.find(g => g.question_type === 'MATCHING_HEADINGS');
    if (!matchingGroup) return [];
    
    const opts = matchingGroup.options || [];
    if (Array.isArray(opts)) {
      return opts.map((text, idx) => ({
        id: `heading-${idx}`,
        text: String(text)
      }));
    }
    
    const headingsList = opts.headings || [];
    return headingsList.map((opt: any, idx: number) => ({
      id: typeof opt?.id === 'string' ? opt.id : `heading-${idx}`,
      text: typeof opt === 'string' ? opt : (opt?.text || opt?.label || String(opt))
    }));
  }, [currentGroups]);

  // Transform question groups into the format expected by ReadingQuestions
  const { transformedQuestions, groupOptionsLookup } = useMemo(() => {
    const questions: any[] = [];
    const optionsLookup: Record<string, any> = {};

    currentGroups.forEach((group, groupIdx) => {
      const groupId = group.id || `preview-group-${groupIdx}`;
      
      // Store group metadata for lookup
      optionsLookup[groupId] = {
        options: group.options,
        display_as_paragraph: group.display_as_paragraph,
        show_bullets: group.show_bullets,
        show_headings: group.show_headings,
        use_dropdown: group.use_dropdown,
        use_letter_headings: group.use_letter_headings,
        options_title: group.options_title,
      };

      group.questions.forEach((q) => {
        questions.push({
          id: q.id || `preview-q-${q.question_number}`,
          question_number: q.question_number,
          question_type: group.question_type,
          question_text: q.question_text,
          options: q.options || [],
          correct_answer: q.correct_answer,
          instruction: group.instruction || null,
          passage_id: currentPassage?.id || `preview-passage-${activePassage}`,
          question_group_id: groupId,
          heading: q.heading,
          sub_group_start: q.sub_group_start,
          sub_group_end: q.sub_group_end,
        });
      });
    });

    return { transformedQuestions: questions, groupOptionsLookup: optionsLookup };
  }, [currentGroups, currentPassage, activePassage]);

  // Create callbacks for ReadingQuestions
  const getMaxAnswers = (questionGroupId: string | null): number => {
    if (!questionGroupId) return 2;
    const group = currentGroups.find(g => (g.id || '') === questionGroupId);
    return group?.max_answers || 2;
  };

  const getMatchingSentenceEndingsGroupOptions = (questionGroupId: string | null): string[] => {
    if (!questionGroupId) return [];
    const group = currentGroups.find(g => (g.id || '') === questionGroupId);
    if (!group) return [];
    const opts = group.options;
    if (Array.isArray(opts)) return opts;
    return opts?.options || [];
  };

  const getTableSelectionOptions = (questionGroupId: string | null): string[] => {
    if (!questionGroupId) return ['A', 'B', 'C', 'D', 'E'];
    const group = currentGroups.find(g => (g.id || '') === questionGroupId);
    if (!group?.options?.length) return ['A', 'B', 'C', 'D', 'E'];
    return Array.isArray(group.options) ? group.options : group.options?.options || ['A', 'B', 'C', 'D', 'E'];
  };

  const getQuestionGroupOptions = (questionGroupId: string | null): any => {
    if (!questionGroupId) return null;
    return groupOptionsLookup[questionGroupId] || null;
  };

  const renderPassageContent = () => {
    if (!currentPassage) return null;

    return (
      <div className="prose prose-sm max-w-none">
        <h2 className="text-xl font-bold mb-4">{currentPassage.title}</h2>
        {currentPassage.paragraphs.map((para, idx) => (
          <div key={para.id || idx} className="mb-4">
            {currentPassage.show_labels !== false && (
              <span className="font-bold text-primary mr-2">{para.label}</span>
            )}
            <span dangerouslySetInnerHTML={{ __html: renderRichText(para.content) }} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Eye size={16} />
          Preview All
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-[1400px] max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye size={20} />
              <span>Test-Taker Preview: {testTitle || 'Untitled Test'}</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-normal text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {timeLimit} minutes
              </span>
              <span className="flex items-center gap-1">
                <FileText size={14} />
                {passages.length} passage{passages.length !== 1 ? 's' : ''}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-2">
          {/* Passage Tabs */}
          <Tabs value={String(activePassage)} onValueChange={(v) => setActivePassage(parseInt(v))}>
            <TabsList className="mb-4">
              {passages.map((p, idx) => (
                <TabsTrigger key={idx} value={String(idx)}>
                  Passage {p.passage_number}: {p.title || `Untitled`}
                </TabsTrigger>
              ))}
            </TabsList>

            {passages.map((_, idx) => (
              <TabsContent key={idx} value={String(idx)} className="mt-0">
                <ResizablePanelGroup direction="horizontal" className="min-h-[60vh] rounded-lg border">
                  {/* Passage Panel */}
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <ScrollArea className="h-[60vh] p-4">
                      {renderPassageContent()}
                    </ScrollArea>
                  </ResizablePanel>

                  {/* Resizable Handle - Official IELTS style: square box + bidirectional arrow */}
                  <ResizableHandle
                    className="relative w-px bg-border cursor-col-resize select-none before:content-[''] before:absolute before:inset-y-0 before:left-1/2 before:w-6 before:-translate-x-1/2"
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center border-2 border-border bg-background">
                      <svg
                        viewBox="0 0 24 12"
                        aria-hidden="true"
                        className="h-4 w-6 text-foreground/80"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 2 L2 6 L6 10"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 6 H22"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18 2 L22 6 L18 10"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </ResizableHandle>

                  {/* Questions Panel - using the real ReadingQuestions component */}
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <ScrollArea className="h-[60vh] p-4">
                      <HighlightNoteProvider testId="preview">
                        {transformedQuestions.length > 0 ? (
                          <ReadingQuestions
                            testId="preview"
                            questions={transformedQuestions}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            currentQuestion={currentQuestion}
                            setCurrentQuestion={setCurrentQuestion}
                            fontSize={14}
                            headingOptions={headingOptions}
                            headingAnswers={headingAnswers}
                            paragraphLabels={paragraphLabels}
                            onHeadingAnswerChange={handleHeadingAnswerChange}
                            getMaxAnswers={getMaxAnswers}
                            getMatchingSentenceEndingsGroupOptions={getMatchingSentenceEndingsGroupOptions}
                            getTableSelectionOptions={getTableSelectionOptions}
                            getQuestionGroupOptions={getQuestionGroupOptions}
                            renderRichText={renderRichText}
                            selectedHeading={selectedHeading}
                            onSelectedHeadingChange={setSelectedHeading}
                          />
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No question groups added yet.
                          </p>
                        )}
                      </HighlightNoteProvider>
                    </ScrollArea>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>
            ))}
          </Tabs>

          {/* Answers Summary */}
          {Object.keys(answers).length > 0 && (
            <div className="mt-4 text-xs text-muted-foreground border-t pt-4">
              <p className="font-medium mb-2">Preview answers ({Object.keys(answers).length} answered):</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(answers).slice(0, 20).map(([qNum, answer]) => (
                  <span key={qNum} className="px-2 py-1 bg-muted rounded">
                    Q{qNum}: {answer || '(empty)'}
                  </span>
                ))}
                {Object.keys(answers).length > 20 && (
                  <span className="px-2 py-1 text-muted-foreground">
                    +{Object.keys(answers).length - 20} more...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
