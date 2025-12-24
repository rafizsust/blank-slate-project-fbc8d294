import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Clock, CheckCircle2, Circle, Play, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getQuestionTypeInfo } from './QuestionTypeBadge';

interface QuestionGroup {
  id: string;
  question_type: string;
  start_question: number;
  end_question: number;
  passage_id?: string;
}

interface Passage {
  id: string;
  passage_number: number;
  title: string;
}

interface TestData {
  id: string;
  title: string;
  test_number: number;
  time_limit: number;
  total_questions: number;
  passages?: Passage[];
  question_groups?: QuestionGroup[];
}

interface TestScore {
  score: number;
  totalQuestions: number;
  bandScore: number | null;
}

interface BookSectionNewProps {
  bookName: string;
  tests: TestData[];
  testType: 'reading' | 'listening';
  selectedQuestionTypes: string[];
  userScores?: Record<string, { overall: TestScore | null; parts: Record<number, { score: number; totalQuestions: number }> }>;
}

export function BookSectionNew({
  bookName,
  tests,
  testType,
  selectedQuestionTypes,
  userScores = {},
}: BookSectionNewProps) {
  // Filter tests based on selected question types
  const filteredTests = selectedQuestionTypes.length === 0 
    ? tests 
    : tests.filter((test) => 
        test.question_groups?.some((group) => 
          selectedQuestionTypes.includes(group.question_type)
        )
      );

  if (filteredTests.length === 0) return null;

  const sortedTests = [...filteredTests].sort((a, b) => a.test_number - b.test_number);
  const completedCount = sortedTests.filter(t => userScores[t.id]?.overall).length;

  return (
    <div className="mb-6">
      {/* Book Header - IELTS beige style */}
      <div 
        className="flex items-center justify-between px-4 py-3 rounded-t-lg border border-b-0 border-border"
        style={{ 
          backgroundColor: 'hsl(var(--ielts-section-bg))',
          fontFamily: 'var(--font-ielts)'
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-bold" style={{ color: 'hsl(var(--ielts-section-text))' }}>
            {bookName}
          </span>
          <span className="text-sm text-muted-foreground">
            {sortedTests.length} test{sortedTests.length !== 1 ? 's' : ''}
          </span>
        </div>
        {completedCount > 0 && (
          <span className="text-xs font-medium text-muted-foreground">
            {completedCount}/{sortedTests.length} completed
          </span>
        )}
      </div>

      {/* Tests Table */}
      <div className="border border-border rounded-b-lg bg-card overflow-hidden">
        {sortedTests.map((test) => (
          <TestRow
            key={test.id}
            test={test}
            testType={testType}
            score={userScores[test.id]}
          />
        ))}
      </div>
    </div>
  );
}

// Test Row Component
interface TestRowProps {
  test: TestData;
  testType: 'reading' | 'listening';
  score?: { overall: TestScore | null; parts: Record<number, { score: number; totalQuestions: number }> };
}

function TestRow({ test, testType, score }: TestRowProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasScore = score?.overall !== null && score?.overall !== undefined;

  // Get parts data
  const partsData = useMemo(() => {
    if (testType === 'reading' && test.passages) {
      return test.passages.map((passage) => {
        const passageGroups = test.question_groups?.filter(g => g.passage_id === passage.id) || [];
        const questionCount = passageGroups.reduce((sum, g) => sum + (g.end_question - g.start_question + 1), 0);
        const types = [...new Set(passageGroups.map(g => g.question_type))];
        return {
          partNumber: passage.passage_number,
          title: passage.title,
          questionCount,
          types,
          passageId: passage.id,
        };
      });
    } else {
      // Listening: 4 parts based on question ranges
      const parts: { partNumber: number; questionCount: number; types: string[]; title?: string; passageId?: string }[] = [];
      for (let i = 1; i <= 4; i++) {
        const partGroups = test.question_groups?.filter(g => {
          const midQ = (g.start_question + g.end_question) / 2;
          return Math.ceil(midQ / 10) === i;
        }) || [];
        if (partGroups.length > 0) {
          const questionCount = partGroups.reduce((sum, g) => sum + (g.end_question - g.start_question + 1), 0);
          const types = [...new Set(partGroups.map(g => g.question_type))];
          parts.push({ partNumber: i, questionCount, types });
        }
      }
      return parts;
    }
  }, [test, testType]);

  const allTypes = partsData.flatMap(p => p.types);
  const uniqueTypes = [...new Set(allTypes)];

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/${testType}/test/${test.id}`);
  };

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Main Row */}
      <div 
        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ fontFamily: 'var(--font-ielts)' }}
      >
        {/* Expand Icon */}
        <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Test Number Badge */}
        <div 
          className="w-8 h-8 rounded border flex items-center justify-center font-bold text-sm shrink-0"
          style={{ 
            borderColor: 'hsl(var(--ielts-badge-border))',
            backgroundColor: 'hsl(var(--ielts-badge-bg))',
            color: 'hsl(var(--ielts-badge-text))'
          }}
        >
          {test.test_number}
        </div>

        {/* Title & Meta */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate text-foreground">
            {test.title}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {test.time_limit} min
            </span>
            <span>{test.total_questions} Qs</span>
            <span>{partsData.length} parts</span>
          </div>
        </div>

        {/* Question Types (desktop only) */}
        <div className="hidden lg:flex items-center gap-1 flex-wrap max-w-[200px] shrink-0">
          {uniqueTypes.slice(0, 4).map((type, idx) => {
            const info = getQuestionTypeInfo(type);
            return (
              <span 
                key={idx}
                className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground"
                title={info.full}
              >
                {info.short}
              </span>
            );
          })}
          {uniqueTypes.length > 4 && (
            <span className="text-[10px] text-muted-foreground">+{uniqueTypes.length - 4}</span>
          )}
        </div>

        {/* Score/Status */}
        <div className="flex items-center gap-2 shrink-0">
          {hasScore && score?.overall && (
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-semibold",
                score.overall.bandScore && score.overall.bandScore >= 7 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : score.overall.bandScore && score.overall.bandScore >= 5.5
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-muted text-muted-foreground"
              )}>
                {score.overall.score}/{score.overall.totalQuestions}
              </span>
              {score.overall.bandScore && (
                <span className="text-xs font-semibold text-primary hidden sm:inline">
                  Band {score.overall.bandScore}
                </span>
              )}
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            </div>
          )}
          {!hasScore && (
            <Circle className="w-4 h-4 text-muted-foreground/50 shrink-0" />
          )}
        </div>

        {/* Start Button */}
        <Button 
          size="sm" 
          onClick={handleStart}
          className="h-8 px-4 text-xs font-semibold shrink-0"
          style={{ fontFamily: 'var(--font-ielts)' }}
        >
          <Play className="w-3 h-3 mr-1" />
          {hasScore ? 'Retry' : 'Start'}
        </Button>
      </div>

      {/* Expanded Parts */}
      {isExpanded && (
        <div className="bg-muted/20 border-t border-border">
          {partsData.map((part) => {
            const partScore = score?.parts?.[part.partNumber];
            const partFinished = partScore && partScore.score === partScore.totalQuestions;
            const typeAbbrs = part.types
              .map(t => getQuestionTypeInfo(t).short)
              .filter((v, i, a) => a.indexOf(v) === i);

            return (
              <div 
                key={part.partNumber}
                className="flex items-center gap-3 px-4 py-2.5 pl-14 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors"
                style={{ fontFamily: 'var(--font-ielts)' }}
              >
                {/* Part Label */}
                <div className="w-14 text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
                  Part {part.partNumber}
                </div>

                {/* Part Info */}
                <div className="flex-1 min-w-0">
                  {part.title && (
                    <div className="text-sm text-foreground/80 truncate">
                      {part.title}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{part.questionCount} Qs</span>
                    {partScore && (
                      <span className={cn(
                        "font-medium",
                        partFinished ? "text-green-600" : "text-primary"
                      )}>
                        • {partScore.score}/{partScore.totalQuestions}
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Types */}
                <div className="hidden sm:flex items-center gap-1 flex-wrap shrink-0">
                  {typeAbbrs.map((abbr, idx) => (
                    <span 
                      key={idx}
                      className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground"
                    >
                      {abbr}
                    </span>
                  ))}
                </div>

                {/* Part Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {testType === 'reading' && part.passageId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs hidden sm:flex"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/passage-study/${part.passageId}`);
                      }}
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Study
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs"
                    style={{ fontFamily: 'var(--font-ielts)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/${testType}/test/${test.id}?part=${part.partNumber}`);
                    }}
                  >
                    Start
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
