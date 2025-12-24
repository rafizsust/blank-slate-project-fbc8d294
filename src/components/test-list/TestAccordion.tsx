import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, Clock, FileText, Play, Trophy } from 'lucide-react';
import { TestPartCard } from './TestPartCard';

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

interface TestAccordionProps {
  test: TestData;
  testType: 'reading' | 'listening';
  previousScores?: Record<number, number>;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function TestAccordion({
  test,
  testType,
  previousScores = {},
  isExpanded = false,
  onToggle,
}: TestAccordionProps) {
  // Group question groups by passage/part
  const getPartsData = () => {
    if (testType === 'reading' && test.passages) {
      return test.passages.map((passage) => {
        const passageGroups = test.question_groups?.filter(
          (g) => g.passage_id === passage.id
        ) || [];
        const totalQuestions = passageGroups.reduce(
          (sum, g) => sum + (g.end_question - g.start_question + 1),
          0
        );
        return {
          partNumber: passage.passage_number,
          passageTitle: passage.title,
          questionGroups: passageGroups,
          totalQuestions,
        };
      });
    } else if (testType === 'listening') {
      // Group by part (1-4 for listening)
      const parts: Record<number, QuestionGroup[]> = { 1: [], 2: [], 3: [], 4: [] };
      test.question_groups?.forEach((group) => {
        const partNum = Math.ceil(group.start_question / 10);
        if (parts[partNum]) {
          parts[partNum].push(group);
        }
      });
      return Object.entries(parts)
        .filter(([, groups]) => groups.length > 0)
        .map(([partNum, groups]) => ({
          partNumber: parseInt(partNum),
          passageTitle: undefined,
          questionGroups: groups,
          totalQuestions: groups.reduce(
            (sum, g) => sum + (g.end_question - g.start_question + 1),
            0
          ),
        }));
    }
    return [];
  };

  const partsData = getPartsData();
  const totalScore = Object.values(previousScores).reduce((sum, s) => sum + s, 0);
  const hasAnyScore = Object.keys(previousScores).length > 0;

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-300",
      isExpanded 
        ? "border-teal/40 shadow-lg shadow-teal/5 bg-card" 
        : "border-border/60 bg-card/50 hover:border-border hover:bg-card"
    )}>
      {/* Test Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-secondary/30"
      >
        <div className="flex items-center gap-4">
          {/* Test Number Badge */}
          <div className={cn(
            "flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-lg",
            "bg-gradient-to-br from-teal/20 to-emerald/20 text-teal border border-teal/20"
          )}>
            T{test.test_number}
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-foreground">{test.title}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {test.time_limit} min
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {test.total_questions} questions
              </span>
              {hasAnyScore && (
                <span className="flex items-center gap-1 text-success">
                  <Trophy className="w-3.5 h-3.5" />
                  {totalScore}/{test.total_questions}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Full Test CTA */}
          <Link
            to={`/${testType}/test/${test.id}`}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
              "bg-gradient-to-r from-teal to-emerald text-white",
              "hover:shadow-lg hover:shadow-teal/25 transition-all hover:scale-[1.02]"
            )}
          >
            <Play className="w-4 h-4" />
            Full Test
          </Link>
          
          {/* Expand/Collapse */}
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            "bg-secondary/50 text-muted-foreground transition-all",
            isExpanded && "bg-teal/10 text-teal rotate-180"
          )}>
            <ChevronDown className="w-5 h-5 transition-transform duration-300" />
          </div>
        </div>
      </button>

      {/* Expanded Content - Parts */}
      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          <div className="p-5 pt-0 space-y-4">
            {/* Mobile Full Test Button */}
            <Link
              to={`/${testType}/test/${test.id}`}
              className={cn(
                "sm:hidden flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium",
                "bg-gradient-to-r from-teal to-emerald text-white",
                "hover:shadow-lg hover:shadow-teal/25 transition-all"
              )}
            >
              <Play className="w-4 h-4" />
              Start Full Test
            </Link>

            {/* Parts Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {partsData.map((part) => (
                <TestPartCard
                  key={part.partNumber}
                  partNumber={part.partNumber}
                  testId={test.id}
                  testType={testType}
                  questionGroups={part.questionGroups}
                  totalQuestions={part.totalQuestions}
                  passageTitle={part.passageTitle}
                  previousScore={previousScores[part.partNumber]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
