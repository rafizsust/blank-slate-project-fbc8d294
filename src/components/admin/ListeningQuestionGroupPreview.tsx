import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Play, Pause, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { HighlightNoteProvider } from '@/hooks/useHighlightNotes';

// Import listening question components
import {
  FillInBlank,
  ListeningTableCompletion,
  MatchingCorrectLetter,
  Maps,
  MapLabeling,
  MultipleChoiceMultiple,
  DragAndDropOptions,
  NoteStyleFillInBlank,
  FlowchartCompletion,
} from '@/components/listening/questions';


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
  group_heading?: string | null;
  group_heading_alignment?: 'left' | 'center' | 'right';
}

interface ListeningQuestionGroupPreviewProps {
  group: QuestionGroup;
  audioUrl?: string | null;
}

function renderRichText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2">$1</h2>');
}

function getQuestionTypeLabel(type: string): string {
  switch (type) {
    case 'FILL_IN_BLANK': return 'Fill in the Blank';
    case 'TABLE_COMPLETION': return 'Table Completion';
    case 'MATCHING_CORRECT_LETTER': return 'Matching Correct Letter';
    case 'MAPS': return 'Maps';
    case 'MAP_LABELING': return 'Map Labeling';
    case 'MULTIPLE_CHOICE_SINGLE': return 'Multiple Choice (Single)';
    case 'MULTIPLE_CHOICE_MULTIPLE': return 'Multiple Choice (Multiple)';
    case 'DRAG_AND_DROP_OPTIONS': return 'Drag and Drop Options';
    default: return type.replace(/_/g, ' ');
  }
}

const getOptionLabel = (index: number, format: string | null | undefined) => {
  if (format === '1') return String(index + 1);
  if (format === 'i') {
    const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
    return romanNumerals[index] || String(index + 1);
  }
  return String.fromCharCode(65 + index);
};

const stripLeadingQuestionNumber = (text: string) => {
  return text.replace(/^\d+[\.\)]\s*/, '').trim();
};

export function ListeningQuestionGroupPreview({ group, audioUrl }: ListeningQuestionGroupPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleAnswerChange = (questionNumber: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionNumber]: answer }));
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const type = group.question_type;
  const groupQuestions = group.questions || [];

  // Calculate question range
  let questionRange: string;
  if (type === 'MULTIPLE_CHOICE_MULTIPLE') {
    const numSubQuestions = group.num_sub_questions || 2;
    const startQ = group.start_question;
    const endQ = startQ + numSubQuestions - 1;
    questionRange = numSubQuestions > 1 ? `${startQ}-${endQ}` : `${startQ}`;
  } else {
    questionRange = group.start_question === group.end_question 
      ? `${group.start_question}` 
      : `${group.start_question} to ${group.end_question}`;
  }

  const renderPreviewContent = () => {
    // Fill in the Blank
    if (type === 'FILL_IN_BLANK') {
      // Note-style layout (official IELTS)
      if (group.options?.display_mode === 'note_style') {
        return (
          <NoteStyleFillInBlank
            questions={groupQuestions.map((q) => ({
              id: q.id || `preview-${q.question_number}`,
              question_number: q.question_number,
              question_text: q.question_text,
              correct_answer: q.correct_answer,
              is_given: q.is_given,
              heading: q.heading,
              instruction: group.instruction,
            }))}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            noteCategories={group.options?.noteCategories}
          />
        );
      }

      // Default layout
      return (
        <div className="space-y-3">
          {groupQuestions.map(q => (
            <FillInBlank
              key={q.question_number}
              testId="preview"
              question={{
                id: q.id || `preview-${q.question_number}`,
                question_number: q.question_number,
                question_text: q.question_text,
                correct_answer: q.correct_answer,
                is_given: q.is_given,
                heading: q.heading,
                instruction: group.instruction
              }}
              answer={answers[q.question_number]}
              onAnswerChange={(value) => handleAnswerChange(q.question_number, value)}
              renderRichText={renderRichText}
              stripLeadingQuestionNumber={stripLeadingQuestionNumber}
            />
          ))}
        </div>
      );
    }

    // Table Completion
    if (type === 'TABLE_COMPLETION' && groupQuestions.length > 0 && groupQuestions[0].table_data) {
      const rawTableData = groupQuestions[0].table_data;
      const tableRows = Array.isArray(rawTableData) ? rawTableData : rawTableData.rows;
      const tableHeading = !Array.isArray(rawTableData) ? rawTableData.heading : undefined;
      const tableHeadingAlignment = !Array.isArray(rawTableData) ? rawTableData.headingAlignment : undefined;

      return (
        <ListeningTableCompletion
          testId="preview"
          questionId={groupQuestions[0].id || 'preview-table'}
          tableData={tableRows}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          fontSize={14}
          renderRichText={renderRichText}
          tableHeading={tableHeading}
          tableHeadingAlignment={tableHeadingAlignment}
        />
      );
    }

    // Matching Correct Letter
    if (type === 'MATCHING_CORRECT_LETTER') {
      return (
        <>
          {group.options?.options && group.options.options.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 text-foreground">Choose the correct letter:</h4>
              <div className="flex flex-col gap-y-1">
                {group.options.options.map((optionText: string, idx: number) => {
                  const cleanedText = optionText.replace(/^[A-Za-z]\.|^[A-Za-z]\.\s*/, '').trim();
                  return (
                    <span key={idx} className="text-sm text-foreground flex items-start">
                      <span className="font-bold text-primary mr-1">
                        {getOptionLabel(idx, group.options.option_format || 'A')}.
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: renderRichText(cleanedText) }} />
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          <div className="space-y-3">
            {groupQuestions.map(q => (
              <MatchingCorrectLetter
                key={q.question_number}
                testId="preview"
                question={{
                  id: q.id || `preview-${q.question_number}`,
                  question_number: q.question_number,
                  question_text: q.question_text,
                  correct_answer: q.correct_answer,
                  is_given: q.is_given,
                  instruction: group.instruction
                }}
                answer={answers[q.question_number]}
                onAnswerChange={(value) => handleAnswerChange(q.question_number, value)}
                groupOptions={group.options?.options || []}
                groupOptionFormat={group.options?.option_format || 'A'}
                fontSize={14}
                renderRichText={renderRichText}
                isActive={false}
              />
            ))}
          </div>
        </>
      );
    }

    // Maps
    if (type === 'MAPS') {
      const imageStyle = {
        maxWidth: group.options?.maxImageWidth ? `${group.options.maxImageWidth}px` : '100%',
        maxHeight: group.options?.maxImageHeight ? `${group.options.maxImageHeight}px` : '60vh',
      };

      return (
        <>
          {group.options?.imageUrl && (
            <div className="mb-4 flex justify-center">
              <img
                src={group.options.imageUrl}
                alt="IELTS Listening map diagram"
                className="h-auto object-contain rounded-md"
                style={imageStyle}
                loading="lazy"
              />
            </div>
          )}
          <div className="space-y-3">
            {groupQuestions.map(q => (
              <Maps
                key={q.question_number}
                testId="preview"
                question={{
                  id: q.id || `preview-${q.question_number}`,
                  question_number: q.question_number,
                  question_text: q.question_text,
                  correct_answer: q.correct_answer,
                  is_given: q.is_given,
                  instruction: group.instruction
                }}
                answer={answers[q.question_number]}
                onAnswerChange={(value) => handleAnswerChange(q.question_number, value)}
                groupOptionLetters={group.options?.option_letters || []}
                fontSize={14}
                renderRichText={renderRichText}
                isActive={false}
              />
            ))}
          </div>
        </>
      );
    }

    // Map Labeling
    if (type === 'MAP_LABELING' && group.options?.imageUrl) {
      return (
        <MapLabeling
          imageUrl={group.options.imageUrl}
          dropZones={group.options.dropZones || []}
          options={group.options.options || []}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          maxImageWidth={group.options.maxImageWidth}
          maxImageHeight={group.options.maxImageHeight}
          fontSize={14}
        />
      );
    }

    // Multiple Choice Single
    if (type === 'MULTIPLE_CHOICE_SINGLE') {
      return (
        <div className="space-y-4">
          {groupQuestions.map(q => (
            <div key={q.question_number} className="p-3 border rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <span className="font-bold text-primary">{q.question_number}.</span>
                <span dangerouslySetInnerHTML={{ __html: renderRichText(q.question_text) }} />
              </div>
              {q.options && q.options.length > 0 && (
                <div className="ml-6 space-y-1">
                  {q.options.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${q.question_number}`}
                        value={getOptionLabel(idx, q.option_format || 'A')}
                        checked={answers[q.question_number] === getOptionLabel(idx, q.option_format || 'A')}
                        onChange={(e) => handleAnswerChange(q.question_number, e.target.value)}
                        className="text-primary"
                      />
                      <span className="text-sm">
                        <strong>{getOptionLabel(idx, q.option_format || 'A')}.</strong> {opt}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Multiple Choice Multiple
    if (type === 'MULTIPLE_CHOICE_MULTIPLE' && groupQuestions.length > 0) {
      return (
        <div className="p-4">
          <MultipleChoiceMultiple
            testId="preview"
            renderRichText={renderRichText}
            question={{
              id: groupQuestions[0].id || `preview-${groupQuestions[0].question_number}`,
              question_number: groupQuestions[0].question_number,
              question_text: groupQuestions[0].question_text,
              options: group.options?.options || [],
              option_format: group.option_format || 'A'
            }}
            answer={answers[groupQuestions[0].question_number]}
            onAnswerChange={(value) => handleAnswerChange(groupQuestions[0].question_number, value)}
            isActive={true}
            maxAnswers={group.num_sub_questions || 2}
          />
        </div>
      );
    }

    // Drag and Drop Options
    if (type === 'DRAG_AND_DROP_OPTIONS') {
      return (
        <DragAndDropOptions
          testId="preview"
          questions={groupQuestions.map(q => ({
            id: q.id || `preview-${q.question_number}`,
            question_number: q.question_number,
            question_text: q.question_text,
            correct_answer: q.correct_answer,
            is_given: q.is_given,
            instruction: group.instruction
          }))}
          groupOptions={group.options?.options || []}
          groupOptionFormat={group.options?.option_format || 'A'}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          fontSize={14}
          renderRichText={renderRichText}
        />
      );
    }

    // Flowchart Completion
    if (type === 'FLOWCHART_COMPLETION' && group.options?.steps) {
      return (
        <FlowchartCompletion
          testId="preview"
          groupId={group.id || 'preview-group'}
          instruction={group.instruction || 'Complete the flowchart. Choose the correct answer and move it into the gap.'}
          title={group.options?.title}
          flowchartSteps={(group.options?.steps || []).map((step: any, idx: number) => ({
            id: `preview-step-${idx}`,
            text: step.text || '',
            hasBlank: step.hasBlank || false,
            blankNumber: step.blankNumber,
            alignment: step.alignment,
          }))}
          groupOptions={group.options?.options || []}
          groupOptionFormat="text"
          answers={answers}
          onAnswerChange={handleAnswerChange}
          fontSize={14}
          renderRichText={renderRichText}
          questionRange={`${group.start_question}-${group.end_question}`}
        />
      );
    }

    // Default fallback - show helpful info about what's missing
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="font-medium mb-2">Preview not available</p>
        <p className="text-sm">Type: {type}</p>
        <p className="text-sm">Questions: {groupQuestions.length}</p>
        {groupQuestions.length === 0 && (
          <p className="text-sm text-amber-600 mt-2">No questions added to this group yet.</p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye size={14} />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye size={18} />
            Test-Taker Preview
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Audio Player Controls */}
          {audioUrl && (
            <div className="bg-muted/30 rounded-lg p-4 border">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayPause}
                  className="h-10 w-10"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </Button>
                <Volume2 size={18} className="text-muted-foreground" />
                <div className="flex-1">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="w-full"
                  />
                </div>
                <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          )}

          {/* Question Group Header */}
          <div className="question-group-header">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                {getQuestionTypeLabel(type)}
              </span>
            </div>
            <h3 className="font-semibold text-sm mb-2">
              Questions {questionRange}
            </h3>
            {group.instruction && (
              <p 
                className="text-sm text-foreground" 
                dangerouslySetInnerHTML={{ __html: renderRichText(group.instruction) }}
              />
            )}
            {group.group_heading && (
              <div className={cn(
                "font-bold text-foreground mt-3",
                group.group_heading_alignment === 'left' && 'text-left',
                group.group_heading_alignment === 'right' && 'text-right',
                (!group.group_heading_alignment || group.group_heading_alignment === 'center') && 'text-center'
              )}>
                {group.group_heading}
              </div>
            )}
          </div>

          {/* Preview Content */}
          <HighlightNoteProvider testId="admin-preview">
            <div className="border rounded-lg p-4 bg-muted/20">
              {renderPreviewContent()}
            </div>
          </HighlightNoteProvider>

          {/* Preview Answers Summary */}
          {Object.keys(answers).length > 0 && (
            <div className="text-xs text-muted-foreground border-t pt-4">
              <p className="font-medium mb-2">Your preview answers:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(answers).map(([qNum, answer]) => (
                  <span key={qNum} className="px-2 py-1 bg-muted rounded text-foreground">
                    Q{qNum}: {answer || '(empty)'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
