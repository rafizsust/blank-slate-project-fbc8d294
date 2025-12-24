import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ParagraphDropZone } from './questions/MatchingHeadingsDragDrop';
import { QuestionTextWithTools } from '@/components/common/QuestionTextWithTools';

interface Passage {
  id: string;
  passage_number: number;
  title: string;
  content: string;
}

interface Paragraph {
  id: string;
  label: string;
  content: string;
  is_heading: boolean;
  order_index: number;
}

interface HeadingOption {
  id: string;
  text: string;
}

interface ReadingPassageProps {
  testId: string; // Pass testId to QuestionTextWithTools
  passage: Passage;
  fontSize?: number;
  // Matching headings props
  hasMatchingHeadings?: boolean;
  headingOptions?: HeadingOption[];
  headingAnswers?: Record<string, string>;
  headingQuestionNumbers?: Record<string, number>; // Map paragraph label to question number
  onHeadingDrop?: (paragraphLabel: string, headingId: string) => void;
  onHeadingRemove?: (paragraphLabel: string) => void;
  renderRichText: (text: string) => string; // Pass renderRichText
  // Click-to-select props
  selectedHeading?: string | null;
  onSelectPlace?: (paragraphLabel: string) => void;
  // Label visibility
  showLabels?: boolean;
  // Question focus callback for navigation
  onQuestionFocus?: (questionNumber: number) => void;
}

export function ReadingPassage({ 
  testId,
  passage, 
  fontSize = 14,
  hasMatchingHeadings = false,
  headingOptions = [],
  headingAnswers = {},
  headingQuestionNumbers = {},
  onHeadingDrop,
  onHeadingRemove,
  renderRichText, // Accept renderRichText prop
  selectedHeading,
  onSelectPlace,
  showLabels = true,
  onQuestionFocus
}: ReadingPassageProps) {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch paragraphs from database
  useEffect(() => {
    const fetchParagraphs = async () => {
      try {
        const { data, error } = await supabase
          .from('reading_paragraphs')
          .select('*')
          .eq('passage_id', passage.id)
          .order('order_index');

        if (error) throw error;
        
        if (data && data.length > 0) {
          setParagraphs(data);
        } else {
          // Fallback: parse from content if no paragraphs in DB
          const contentParagraphs = passage.content.split('\n\n');
          const parsed = contentParagraphs.map((p, idx) => {
            const match = p.trim().match(/^([A-Z])\s(.*)$/s);
            return {
              id: `temp-${idx}`,
              label: match ? match[1] : '',
              content: match ? match[2] : p,
              is_heading: false,
              order_index: idx
            };
          }).filter(p => p.label || p.content);
          setParagraphs(parsed);
        }
      } catch (error) {
        console.error('Error fetching paragraphs:', error);
        // Fallback to parsing content
        const contentParagraphs = passage.content.split('\n\n');
        const parsed = contentParagraphs.map((p, idx) => {
          const match = p.trim().match(/^([A-Z])\s(.*)$/s);
          return {
            id: `temp-${idx}`,
            label: match ? match[1] : '',
            content: match ? match[2] : p,
            is_heading: false,
            order_index: idx
          };
        }).filter(p => p.label || p.content);
        setParagraphs(parsed);
      } finally {
        setLoading(false);
      }
    };

    fetchParagraphs();
  }, [passage.id, passage.content]);

  const getAssignedHeading = (label: string) => {
    const headingId = headingAnswers[label];
    if (!headingId) return null;
    return headingOptions.find(h => h.id === headingId) || null;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
      </div>
    );
  }

  return (
    <article 
      className="prose prose-sm max-w-none relative passage-content" 
      style={{ fontSize: `var(--ielts-text-base, ${fontSize}px)` }}
    >
      {/* Title with icon */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 ielts-muted">
          <Clock size={40} className="ielts-muted-text" />
        </div>
        <div className="flex-1">
          <QuestionTextWithTools
            testId={testId}
            contentId={passage.id + '-title'} // Unique ID for title
            text={passage.title}
            fontSize={fontSize}
            renderRichText={renderRichText}
          />
        </div>
      </div>

      {/* Content paragraphs */}
      <div className="space-y-4 leading-relaxed">
        {paragraphs.map((paragraph, index) => {
          const hasLabel = !!paragraph.label && showLabels;
          const assignedHeading = getAssignedHeading(paragraph.label);
          
          // Show drop zone if:
          // 1. This passage has matching headings questions
          // 2. This specific paragraph's label is in the headingQuestionNumbers (admin-selected)
          // 3. We have the necessary handlers
          const showDropZone = hasMatchingHeadings && 
                               headingQuestionNumbers[paragraph.label] !== undefined && 
                               onHeadingDrop && 
                               onHeadingRemove;

          return (
            <div key={paragraph.id || index} className="relative group">
              {/* Drop zone for matching headings - only for paragraphs selected by admin */}
              {showDropZone && (
                <ParagraphDropZone
                  label={paragraph.label}
                  questionNumber={headingQuestionNumbers[paragraph.label]}
                  assignedHeading={assignedHeading}
                  onDrop={(headingId) => onHeadingDrop(paragraph.label, headingId)}
                  onRemove={() => onHeadingRemove(paragraph.label)}
                  selectedHeading={selectedHeading}
                  onSelectPlace={() => onSelectPlace?.(paragraph.label)}
                  onQuestionFocus={onQuestionFocus}
                />
              )}
              
              {/* Paragraph with label */}
              <div className="flex items-start gap-3">
                {hasLabel && (
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {paragraph.label}
                  </span>
                )}
                <div className="flex-1">
                  <QuestionTextWithTools
                    testId={testId}
                    contentId={paragraph.id || `passage-${passage.id}-paragraph-${index}`} // Unique ID for this content
                    text={paragraph.content} // Use raw content, renderRichText will handle formatting
                    fontSize={fontSize}
                    renderRichText={renderRichText} // Use the passed renderRichText
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}