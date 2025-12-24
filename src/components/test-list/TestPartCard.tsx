import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Lock, BookOpen } from 'lucide-react';

interface QuestionGroup {
  id: string;
  question_type: string;
  start_question: number;
  end_question: number;
}

interface TestPartCardProps {
  partNumber: number;
  testId: string;
  testType: 'reading' | 'listening';
  questionGroups: QuestionGroup[];
  totalQuestions: number;
  passageTitle?: string;
  previousScore?: number | null;
  isLocked?: boolean;
}

const questionTypeLabels: Record<string, string> = {
  // Database format (uppercase with underscores)
  'TRUE_FALSE_NOT_GIVEN': 'T/F/NG',
  'YES_NO_NOT_GIVEN': 'Y/N/NG',
  'MULTIPLE_CHOICE': 'MCQ',
  'MULTIPLE_CHOICE_MULTIPLE': 'Multi MCQ',
  'MATCHING_HEADINGS': 'Headings',
  'MATCHING_INFORMATION': 'Match Info',
  'MATCHING_SENTENCE_ENDINGS': 'Sentence Match',
  'SENTENCE_COMPLETION': 'Sentence',
  'SUMMARY_COMPLETION': 'Summary',
  'FILL_IN_BLANK': 'Fill Blank',
  'SHORT_ANSWER': 'Short Answer',
  'TABLE_COMPLETION': 'Table',
  'TABLE_SELECTION': 'Matching Grid',
  // Listening-specific
  'MATCHING_CORRECT_LETTER': 'Match Letter',
  'MAPS': 'Maps',
  'MULTIPLE_CHOICE_SINGLE': 'MCQ',
  'DRAG_AND_DROP_OPTIONS': 'Drag Drop',
  // URL format (lowercase with hyphens)
  'true-false-not-given': 'T/F/NG',
  'yes-no-not-given': 'Y/N/NG',
  'multiple-choice-single': 'MCQ',
  'multiple-choice-multiple': 'Multi MCQ',
  'matching-headings': 'Headings',
  'matching-information': 'Match Info',
  'matching-sentence-endings': 'Sentence Match',
  'sentence-completion': 'Sentence',
  'summary-completion': 'Summary',
  'fill-in-blank': 'Fill Blank',
  'short-answer': 'Short Answer',
  'table-completion': 'Table',
  'table-selection': 'Table Selection',
  'diagram-labelling': 'Diagram',
  'flow-chart': 'Flow Chart',
  'note-completion': 'Notes',
  'map-labelling': 'Map',
  'plan-labelling': 'Plan',
};

// Convert DB format to URL format for links
const toUrlFormat = (type: string): string => {
  return type.toLowerCase().replace(/_/g, '-');
};

export function TestPartCard({
  partNumber,
  testId,
  testType,
  questionGroups,
  totalQuestions,
  passageTitle,
  previousScore,
  isLocked = false,
}: TestPartCardProps) {
  const uniqueTypes = [...new Set(questionGroups.map(g => g.question_type))];
  const hasScore = previousScore !== null && previousScore !== undefined;
  const scorePercent = hasScore ? Math.round((previousScore / totalQuestions) * 100) : 0;

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-gradient-to-br from-card via-card to-secondary/30",
        isLocked 
          ? "opacity-60 cursor-not-allowed border-border" 
          : "hover:shadow-lg hover:shadow-teal/10 hover:border-teal/40 border-border/60"
      )}
    >
      {/* Part Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm",
            "bg-gradient-to-br from-teal to-emerald text-white shadow-md"
          )}>
            {partNumber}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              Part {partNumber}
            </h4>
            {passageTitle && (
              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">
                {passageTitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Score indicator */}
        {hasScore && (
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            scorePercent >= 70 
              ? "bg-success/15 text-success" 
              : scorePercent >= 50 
                ? "bg-gold/15 text-gold" 
                : "bg-destructive/15 text-destructive"
          )}>
            <Check className="w-3 h-3" />
            {previousScore}/{totalQuestions}
          </div>
        )}
      </div>

      {/* Question Types */}
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {uniqueTypes.map((type) => (
            <Link
              key={type}
              to={isLocked ? '#' : `/${testType}/test/${testId}?part=${partNumber}&type=${toUrlFormat(type)}`}
              onClick={(e) => isLocked && e.preventDefault()}
              className={cn(
                "px-2 py-1 rounded-md text-[10px] font-medium border transition-all",
                "bg-primary/10 text-primary border-primary/30",
                !isLocked && "hover:scale-105 hover:shadow-sm hover:bg-primary/20 cursor-pointer"
              )}
            >
              {questionTypeLabels[type] || type.replace(/_/g, ' ')}
            </Link>
          ))}
        </div>

        {/* Questions range */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Q{questionGroups[0]?.start_question || 1} - Q{questionGroups[questionGroups.length - 1]?.end_question || totalQuestions}</span>
          <span>{totalQuestions} questions</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={cn(
        "flex border-t border-border/40",
        testType === 'reading' ? "divide-x divide-border/40" : ""
      )}>
        {/* Study Button - Only for Reading */}
        {testType === 'reading' && !isLocked && (
          <Link
            to={`/reading/study/${testId}`}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3",
              "text-sm font-medium transition-all",
              "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            <BookOpen className="w-4 h-4" />
            Study
          </Link>
        )}
        
        {/* Start Part CTA */}
        <Link
          to={isLocked ? '#' : `/${testType}/test/${testId}?part=${partNumber}`}
          onClick={(e) => isLocked && e.preventDefault()}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3",
            "text-sm font-medium transition-all",
            isLocked 
              ? "text-muted-foreground bg-muted/30" 
              : "text-teal hover:bg-teal/5 group-hover:text-teal-dark"
          )}
        >
          {isLocked ? (
            <>
              <Lock className="w-4 h-4" />
              Locked
            </>
          ) : (
            <>
              Start Part {partNumber}
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
