import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, Headphones, ChevronRight, Play, Clock, FileText, Trophy, Check, GraduationCap } from 'lucide-react';
import { QuestionTypeBadge } from './QuestionTypeBadge';

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
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Filter tests based on selected question types
  const filteredTests = selectedQuestionTypes.length === 0 
    ? tests 
    : tests.filter((test) => 
        test.question_groups?.some((group) => 
          selectedQuestionTypes.includes(group.question_type)
        )
      );

  if (filteredTests.length === 0) return null;

  const IconComponent = testType === 'reading' ? BookOpen : Headphones;

  // Calculate book-level stats
  const totalAttempted = Object.keys(userScores).filter(id => 
    filteredTests.some(t => t.id === id)
  ).length;

  return (
    <div className="space-y-4">
      {/* Book Header - Clean IELTS style */}
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg",
          "bg-foreground text-background"
        )}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{bookName}</h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{filteredTests.length} tests</span>
            {totalAttempted > 0 && (
              <span className="flex items-center gap-1 text-success">
                <Check className="w-3 h-3" />
                {totalAttempted} completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Test Cards - Clean table-like rows */}
      <div className="space-y-2">
        {filteredTests.map((test) => (
          <TestCardClean
            key={test.id}
            test={test}
            testType={testType}
            isExpanded={expandedTestId === test.id}
            onToggle={() => setExpandedTestId(expandedTestId === test.id ? null : test.id)}
            score={userScores[test.id]}
          />
        ))}
      </div>
    </div>
  );
}

// Clean IELTS-style Test Card
interface TestCardCleanProps {
  test: TestData;
  testType: 'reading' | 'listening';
  isExpanded: boolean;
  onToggle: () => void;
  score?: { overall: TestScore | null; parts: Record<number, { score: number; totalQuestions: number }> };
}

function TestCardClean({ test, testType, isExpanded, onToggle, score }: TestCardCleanProps) {
  const uniqueTypes = [...new Set(test.question_groups?.map(g => g.question_type) || [])];
  const hasScore = score?.overall !== null && score?.overall !== undefined;
  const scorePercent = hasScore ? Math.round((score!.overall!.score / score!.overall!.totalQuestions) * 100) : 0;

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
        };
      });
    } else {
      // Listening: 4 parts based on question ranges
      const parts: { partNumber: number; questionCount: number; types: string[]; title?: string }[] = [];
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

  return (
    <div className={cn(
      "rounded-lg border transition-all duration-200 overflow-hidden",
      "bg-card",
      isExpanded 
        ? "border-foreground/30 shadow-sm" 
        : "border-border hover:border-foreground/20"
    )}>
      {/* Main Row */}
      <div 
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={onToggle}
      >
        {/* Test Number */}
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg shrink-0",
          "bg-foreground text-background"
        )}>
          {test.test_number}
        </div>

        {/* Test Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground text-sm truncate">{test.title}</h3>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {test.time_limit} min
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {test.total_questions} questions
            </span>
          </div>
        </div>

        {/* Question Types - Desktop only */}
        <div className="hidden md:flex flex-wrap gap-1 max-w-[200px]">
          {uniqueTypes.slice(0, 4).map((type) => (
            <QuestionTypeBadge key={type} type={type} className="text-[9px]" />
          ))}
          {uniqueTypes.length > 4 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground">
              +{uniqueTypes.length - 4}
            </span>
          )}
        </div>

        {/* Score */}
        {hasScore && (
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold shrink-0",
            scorePercent >= 70 
              ? "bg-success/10 text-success" 
              : scorePercent >= 50 
                ? "bg-warning/10 text-warning" 
                : "bg-destructive/10 text-destructive"
          )}>
            <Trophy className="w-3 h-3" />
            {score!.overall!.score}/{score!.overall!.totalQuestions}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/${testType}/test/${test.id}`}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium",
              "bg-foreground text-background hover:bg-foreground/90 transition-colors"
            )}
          >
            <Play className="w-3.5 h-3.5" />
            Start
          </Link>
          <button
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
              "text-muted-foreground hover:text-foreground hover:bg-secondary",
              isExpanded && "bg-secondary text-foreground rotate-90"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Parts */}
      {isExpanded && (
        <div className="border-t border-border bg-secondary/20 p-4">
          {/* Mobile Start Button */}
          <Link
            to={`/${testType}/test/${test.id}`}
            className={cn(
              "sm:hidden flex items-center justify-center gap-2 w-full py-2.5 mb-4 rounded-lg text-sm font-medium",
              "bg-foreground text-background"
            )}
          >
            <Play className="w-4 h-4" />
            Start Full Test
          </Link>

          {/* Parts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {partsData.map((part) => {
              const partScore = score?.parts?.[part.partNumber];
              
              return (
                <div
                  key={part.partNumber}
                  className="flex flex-col p-3 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-foreground/10 text-foreground text-xs font-bold">
                        {part.partNumber}
                      </span>
                      <span className="text-sm font-medium text-foreground">Part {part.partNumber}</span>
                    </div>
                    {partScore && (
                      <span className="text-[10px] font-medium text-success">
                        {partScore.score}/{partScore.totalQuestions}
                      </span>
                    )}
                  </div>

                  {part.title && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{part.title}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {part.types.map(type => (
                      <QuestionTypeBadge
                        key={type}
                        type={type}
                        clickable
                        testId={test.id}
                        testType={testType}
                        partNumber={part.partNumber}
                        className="text-[9px]"
                      />
                    ))}
                  </div>

                  <div className="flex gap-2 mt-auto">
                    {testType === 'reading' && (
                      <Link
                        to={`/reading/study/${test.id}?part=${part.partNumber}`}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                      >
                        <GraduationCap className="w-3 h-3" />
                        Study
                      </Link>
                    )}
                    <Link
                      to={`/${testType}/test/${test.id}?part=${part.partNumber}`}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded transition-colors",
                        "bg-foreground/10 hover:bg-foreground/20 text-foreground"
                      )}
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
