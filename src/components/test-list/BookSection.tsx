import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, Headphones, ChevronDown, Play, Clock, FileText } from 'lucide-react';
import { TestAccordion } from './TestAccordion';
import { Badge } from '@/components/ui/badge';

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

interface BookSectionProps {
  bookName: string;
  tests: TestData[];
  testType: 'reading' | 'listening';
  selectedQuestionTypes: string[];
  previousScores?: Record<string, Record<number, number>>;
}

export function BookSection({
  bookName,
  tests,
  testType,
  selectedQuestionTypes,
  previousScores = {},
}: BookSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Normalize question types to match admin panel types
  const normalizeQuestionType = (type: string): string => {
    const normalizeMap: Record<string, string> = {
      'NOTE_COMPLETION': 'FILL_IN_BLANK',
      'SENTENCE_COMPLETION': 'FILL_IN_BLANK',
      'SUMMARY_COMPLETION': 'FILL_IN_BLANK',
      'SUMMARY_WORD_BANK': 'FILL_IN_BLANK',
      'SHORT_ANSWER': 'FILL_IN_BLANK',
      'MULTIPLE_CHOICE_SINGLE': 'MULTIPLE_CHOICE',
    };
    return normalizeMap[type] || type;
  };

  // Filter tests based on selected question types
  const filteredTests = selectedQuestionTypes.length === 0 
    ? tests 
    : tests.filter((test) => 
        test.question_groups?.some((group) => 
          selectedQuestionTypes.includes(normalizeQuestionType(group.question_type))
        )
      );

  if (filteredTests.length === 0) return null;

  const IconComponent = testType === 'reading' ? BookOpen : Headphones;

  return (
    <div className="space-y-4">
      {/* Book Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-teal/10 to-emerald/10 hover:from-teal/15 hover:to-emerald/15 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl",
            "bg-gradient-to-br from-teal to-emerald text-white shadow-lg"
          )}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-foreground">{bookName}</h2>
            <p className="text-sm text-muted-foreground">
              {filteredTests.length} {filteredTests.length === 1 ? 'test' : 'tests'} available
            </p>
          </div>
        </div>
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl",
          "bg-background/50 text-muted-foreground transition-all",
          isExpanded && "rotate-180"
        )}>
          <ChevronDown className="w-5 h-5 transition-transform duration-300" />
        </div>
      </button>

      {/* Test Cards Grid - Compact horizontal layout */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              testType={testType}
              isExpanded={expandedTestId === test.id}
              onToggle={() => setExpandedTestId(expandedTestId === test.id ? null : test.id)}
              previousScores={previousScores[test.id]}
            />
          ))}
        </div>
      )}

      {/* Expanded Test Details */}
      {expandedTestId && isExpanded && (
        <div className="pl-0">
          {filteredTests
            .filter(test => test.id === expandedTestId)
            .map(test => (
              <TestAccordion
                key={test.id}
                test={test}
                testType={testType}
                previousScores={previousScores[test.id]}
                isExpanded={true}
                onToggle={() => setExpandedTestId(null)}
              />
            ))
          }
        </div>
      )}
    </div>
  );
}

// Compact Test Card for the grid view
interface TestCardProps {
  test: TestData;
  testType: 'reading' | 'listening';
  isExpanded: boolean;
  onToggle: () => void;
  previousScores?: Record<number, number>;
}

function TestCard({ test, testType, isExpanded, onToggle, previousScores = {} }: TestCardProps) {
  const uniqueTypes = [...new Set(test.question_groups?.map(g => g.question_type) || [])];
  const hasScore = Object.keys(previousScores).length > 0;
  const totalScore = Object.values(previousScores).reduce((sum, s) => sum + s, 0);

  const questionTypeLabels: Record<string, string> = {
    'TRUE_FALSE_NOT_GIVEN': 'T/F/NG',
    'MULTIPLE_CHOICE': 'MCQ',
    'MATCHING_HEADINGS': 'Headings',
    'FILL_IN_BLANK': 'Fill Blank',
    'TABLE_COMPLETION': 'Table',
    'MATCHING_CORRECT_LETTER': 'Match',
    'MAPS': 'Maps',
    'MULTIPLE_CHOICE_SINGLE': 'MCQ',
    'MULTIPLE_CHOICE_MULTIPLE': 'Multi MCQ',
    'DRAG_AND_DROP_OPTIONS': 'Drag Drop',
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer",
        "bg-gradient-to-br from-card via-card to-secondary/20",
        isExpanded 
          ? "border-teal/60 ring-2 ring-teal/20 shadow-lg" 
          : "border-border/60 hover:border-teal/40 hover:shadow-md"
      )}
      onClick={onToggle}
    >
      {/* Test Number Badge */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-xl",
            "bg-gradient-to-br from-teal to-emerald text-white shadow-md"
          )}>
            T{test.test_number}
          </div>
          {hasScore && (
            <Badge variant="secondary" className="bg-success/15 text-success border-success/30">
              {totalScore}/{test.total_questions}
            </Badge>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-foreground line-clamp-1">{test.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {test.time_limit}m
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {test.total_questions}Q
            </span>
          </div>
        </div>

        {/* Question Types - Compact */}
        <div className="flex flex-wrap gap-1">
          {uniqueTypes.slice(0, 3).map((type) => (
            <span
              key={type}
              className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-primary/10 text-primary"
            >
              {questionTypeLabels[type] || type.replace(/_/g, ' ').slice(0, 8)}
            </span>
          ))}
          {uniqueTypes.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground">
              +{uniqueTypes.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex border-t border-border/40 divide-x divide-border/40">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5",
            "text-xs font-medium transition-all",
            isExpanded 
              ? "text-teal bg-teal/5" 
              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
          )}
        >
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")} />
          {isExpanded ? 'Hide Parts' : 'View Parts'}
        </button>
        <Link
          to={`/${testType}/test/${test.id}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5",
            "text-xs font-medium transition-all",
            "text-teal hover:bg-teal/10"
          )}
        >
          <Play className="w-3.5 h-3.5" />
          Full Test
        </Link>
      </div>
    </div>
  );
}
