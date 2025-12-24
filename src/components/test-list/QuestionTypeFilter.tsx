import { cn } from '@/lib/utils';
import { Filter, X } from 'lucide-react';

interface QuestionTypeFilterProps {
  availableTypes: string[];
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  onClearAll: () => void;
}

const questionTypeLabels: Record<string, string> = {
  // Reading question types (from admin panel)
  'TRUE_FALSE_NOT_GIVEN': 'True/False/Not Given',
  'YES_NO_NOT_GIVEN': 'Yes/No/Not Given',
  'MATCHING_HEADINGS': 'Matching Headings',
  'MATCHING_INFORMATION': 'Matching Information',
  'MATCHING_SENTENCE_ENDINGS': 'Sentence Endings',
  'MATCHING_FEATURES': 'Matching Features',
  'MULTIPLE_CHOICE': 'Multiple Choice',
  'MULTIPLE_CHOICE_MULTIPLE': 'Multi-Select MCQ',
  'MULTIPLE_CHOICE_SINGLE': 'Multiple Choice',
  'FILL_IN_BLANK': 'Fill in Gap',
  'TABLE_COMPLETION': 'Table Completion',
  'TABLE_SELECTION': 'Matching Grid',
  'FLOWCHART_COMPLETION': 'Flowchart Completion',
  'MAP_LABELING': 'Map Labeling',
  // Legacy database types - map to standard labels
  'NOTE_COMPLETION': 'Fill in Gap',
  'SENTENCE_COMPLETION': 'Fill in Gap',
  'SUMMARY_COMPLETION': 'Fill in Gap',
  'SUMMARY_WORD_BANK': 'Fill in Gap',
  'SHORT_ANSWER': 'Fill in Gap',
  // Listening-specific types
  'MATCHING_CORRECT_LETTER': 'Matching Letters',
  'MAPS': 'Maps/Plans',
  'DRAG_AND_DROP_OPTIONS': 'Drag & Drop',
  // URL format (lowercase with hyphens) - keeping for backwards compatibility
  'true-false-not-given': 'True/False/Not Given',
  'yes-no-not-given': 'Yes/No/Not Given',
  'multiple-choice-single': 'Multiple Choice',
  'multiple-choice-multiple': 'Multi-Select MCQ',
  'matching-headings': 'Matching Headings',
  'matching-information': 'Matching Information',
  'matching-sentence-endings': 'Sentence Endings',
  'matching-features': 'Matching Features',
  'sentence-completion': 'Fill in Gap',
  'summary-completion': 'Fill in Gap',
  'fill-in-blank': 'Fill in Gap',
  'short-answer': 'Fill in Gap',
  'note-completion': 'Fill in Gap',
  'table-completion': 'Table Completion',
  'table-selection': 'Matching Grid',
  'diagram-labelling': 'Diagram Labeling',
  'flowchart-completion': 'Flowchart Completion',
  'flow-chart': 'Flowchart Completion',
  'map-labelling': 'Map Labelling',
  'plan-labelling': 'Plan Labelling',
};

// Removed questionTypeColors as we now use semantic tokens

export function QuestionTypeFilter({
  availableTypes,
  selectedTypes,
  onTypeToggle,
  onClearAll,
}: QuestionTypeFilterProps) {
  if (availableTypes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          Filter by Question Type
        </div>
        {selectedTypes.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
            Clear ({selectedTypes.length})
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableTypes.map((type) => {
          const isSelected = selectedTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => onTypeToggle(type)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                "border hover:scale-[1.02]",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted"
              )}
            >
              {isSelected && <span className="mr-1">✓</span>}
              {questionTypeLabels[type] || type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
