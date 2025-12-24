import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RichTextEditor } from './RichTextEditor';
import { MultipleAnswersInput } from './MultipleAnswersInput';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ListeningTableEditor } from './ListeningTableEditor';
import { ListeningImageUploader } from './ListeningImageUploader';
import { MultiSelectAnswerInput } from './MultiSelectAnswerInput';
import { MapLabelingEditor } from './MapLabelingEditor';
import { ListeningQuestionGroupPreview } from './ListeningQuestionGroupPreview';
import { NoteStyleCategoryEditor, NoteCategory } from './NoteStyleCategoryEditor';
import { FlowchartCompletionEditor, FlowchartStep } from './FlowchartCompletionEditor';

export interface TableCell { // Define TableCell here for local use
  has_question: boolean; // Replaced 'type' with 'has_question'
  content: string;
  correct_answer?: string;
  question_number?: number;
  alignment?: 'left' | 'center' | 'right'; // New: Text alignment for the cell
}
export type TableRow = TableCell[];
export type TableData = TableRow[];

// New table editor data format with heading support
export interface TableEditorData {
  rows: TableData;
  heading?: string;
  headingAlignment?: 'left' | 'center' | 'right';
}

export interface Question {
  id?: string;
  question_number: number;
  question_text: string;
  correct_answer: string;
  is_given: boolean;
  heading?: string | null;
  table_data?: TableEditorData | TableData; // Support both old array format and new object format
  options?: string[]; // For MCQ-like options within a question
  option_format?: string; // For MCQ-like options within a question
}

export interface QuestionGroup {
  id?: string;
  test_id?: string;
  question_type: string;
  instruction: string;
  start_question: number;
  end_question: number;
  options: any; // Changed to 'any' to accommodate structured JSON for options
  questions: Question[];
  option_format?: string; // For group-level options like Matching Correct Letter
  num_sub_questions?: number; // Added num_sub_questions for multiple choice multiple
  start_timestamp_seconds?: number | null; // Timestamp when this question group starts in the audio
  group_heading?: string | null; // Heading for the entire question group
  group_heading_alignment?: 'left' | 'center' | 'right'; // Alignment for the group heading
}

interface ListeningQuestionGroupEditorProps {
  testId: string;
  allQuestionGroups: QuestionGroup[]; // Now represents ALL groups for the test
  onUpdateAllGroups: (groups: QuestionGroup[]) => void; // This will update the full list of groups
  activePart: number; // New prop
  partRanges: { label: string; start: number; end: number }[]; // New prop
}

const LISTENING_QUESTION_TYPES = [
  { value: 'FILL_IN_BLANK', label: 'Fill in the Blank' },
  { value: 'TABLE_COMPLETION', label: 'Table Completion' },
  { value: 'MATCHING_CORRECT_LETTER', label: 'Matching Correct Letter' },
  { value: 'MAPS', label: 'Maps' },
  { value: 'MAP_LABELING', label: 'Map Labeling (Drag & Drop)' },
  { value: 'FLOWCHART_COMPLETION', label: 'Flowchart Completion (Drag & Drop)' },
  { value: 'MULTIPLE_CHOICE_SINGLE', label: 'Multiple Choice (Single)' },
  { value: 'MULTIPLE_CHOICE_MULTIPLE', label: 'Multiple Choice (Multiple Questions)' },
  { value: 'DRAG_AND_DROP_OPTIONS', label: 'Drag and Drop Options' },
];

const OPTION_FORMATS = [
  { value: 'A', label: 'A, B, C, D...' },
  { value: '1', label: '1, 2, 3, 4...' },
  { value: 'i', label: 'i, ii, iii, iv...' },
];

export function ListeningQuestionGroupEditor({
  testId,
  allQuestionGroups, // Use this as the source of truth
  onUpdateAllGroups, // Use this to update the source of truth
  activePart,
  partRanges,
}: ListeningQuestionGroupEditorProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({}); // Use group ID for expansion

  // Filter groups for display based on the active part
  const displayedGroups = useMemo(() => {
    const currentPartRange = partRanges[activePart];
    return allQuestionGroups.filter(group =>
      group.start_question >= currentPartRange.start && group.end_question <= currentPartRange.end
    ).sort((a, b) => a.start_question - b.start_question);
  }, [allQuestionGroups, activePart, partRanges]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const addGroup = () => {
    const currentPartRange = partRanges[activePart];
    // Find the highest question number within the current part among ALL groups
    const lastQuestionInPart = allQuestionGroups.reduce((max, g) => {
      if (g.start_question >= currentPartRange.start && g.end_question <= currentPartRange.end) {
        return Math.max(max, g.end_question);
      }
      return max;
    }, currentPartRange.start - 1); // Default to one before part start if no groups exist

    const newStartQuestion = Math.min(lastQuestionInPart + 1, currentPartRange.end);
    let newEndQuestion = Math.min(newStartQuestion + 4, currentPartRange.end); // Default range
    let newNumSubQuestions = 2; // Default for MCQ Multiple

    const newGroup: QuestionGroup = {
      id: crypto.randomUUID(), // Assign a temporary ID for new groups
      question_type: 'FILL_IN_BLANK', // Default to Fill in the Blank
      instruction: '',
      start_question: newStartQuestion,
      end_question: newEndQuestion,
      options: [], // Default to empty array
      questions: [],
      option_format: 'A', // Default option format
      num_sub_questions: newNumSubQuestions,
    };
    
    // Auto-generate questions based on type
    if (newGroup.question_type === 'TABLE_COMPLETION') {
      newGroup.questions = [{
        question_number: newStartQuestion,
        question_text: 'Complete the table below.',
        correct_answer: '', // Will be aggregated from table_data
        is_given: false,
        heading: null,
        table_data: [[{ has_question: false, content: 'Header 1', alignment: 'left' }, { has_question: false, content: 'Header 2', alignment: 'left' }], [{ has_question: true, content: '', correct_answer: '', question_number: newStartQuestion, alignment: 'left' }, { has_question: false, content: 'Data', alignment: 'left' }]]
      }];
    } else if (newGroup.question_type === 'MULTIPLE_CHOICE_MULTIPLE') {
      newEndQuestion = newStartQuestion + newNumSubQuestions - 1;
      newGroup.end_question = newEndQuestion;
      newGroup.questions = [{
        question_number: newStartQuestion,
        question_text: 'Choose the correct options.', // Default text for the overall MCQ
        correct_answer: '', // Admin will fill this with comma-separated options
        is_given: false,
        heading: null,
        options: [], // Options are group-level
        option_format: 'A',
      }];
      newGroup.options = { type: 'multiple_choice_multiple', options: ['Option A', 'Option B', 'Option C'], option_format: 'A', num_sub_questions: newNumSubQuestions };
    } else if (newGroup.question_type === 'DRAG_AND_DROP_OPTIONS') { // New type initialization
      newGroup.options = { type: 'drag_and_drop_options', options: ['Option 1', 'Option 2', 'Option 3'], option_format: 'A' };
      for (let i = 0; i < (newGroup.end_question - newGroup.start_question + 1); i++) {
        newGroup.questions.push({
          question_number: newStartQuestion + i,
          question_text: 'Drop answer ______ here.', // Default text with drop zone
          correct_answer: '',
          is_given: false,
          heading: null,
          options: [],
          option_format: 'A',
        });
      }
    } else if (newGroup.question_type === 'MULTIPLE_CHOICE_SINGLE') {
      for (let i = 0; i < (newGroup.end_question - newGroup.start_question + 1); i++) {
        newGroup.questions.push({
          question_number: newStartQuestion + i,
          question_text: '',
          correct_answer: '',
          is_given: false,
          heading: null,
          options: [], // Default options for MCQ should be empty
          option_format: 'A',
        });
      }
    } else {
      for (let i = 0; i < (newGroup.end_question - newGroup.start_question + 1); i++) {
        newGroup.questions.push({
          question_number: newStartQuestion + i,
          question_text: '',
          correct_answer: '',
          is_given: false,
          heading: null,
          options: [], // Ensure options array is initialized
          option_format: 'A',
        });
      }
    }
    
    // Add the new group to the full list and update the parent state
    const updatedAllGroups = [...allQuestionGroups, newGroup];
    onUpdateAllGroups(updatedAllGroups);
    // Expand the newly added group
    setExpandedGroups(prev => ({ ...prev, [newGroup.id!]: true }));
  };

  const updateGroup = (groupToUpdateId: string, updates: Partial<QuestionGroup>) => {
    const newAllGroups = allQuestionGroups.map(group => {
      if (group.id === groupToUpdateId) {
        const updatedGroup = { ...group, ...updates };

        // If question type changes, re-initialize questions array structure and options
        if (updates.question_type !== undefined && updates.question_type !== group.question_type) {
          updatedGroup.questions = []; // Clear questions
          updatedGroup.options = []; // Clear group options by default
          updatedGroup.num_sub_questions = 2; // Reset num_sub_questions

          if (updates.question_type === 'TABLE_COMPLETION') {
            updatedGroup.questions = [{
              question_number: updatedGroup.start_question,
              question_text: 'Complete the table below.',
              correct_answer: '', // Will be aggregated from table_data
              is_given: false,
              heading: null,
              table_data: [[{ has_question: false, content: 'Header 1', alignment: 'left' }, { has_question: false, content: 'Header 2', alignment: 'left' }], [{ has_question: true, content: '', correct_answer: '', question_number: updatedGroup.start_question, alignment: 'left' }, { has_question: false, content: 'Data', alignment: 'left' }]]
            }];
          } else if (updates.question_type === 'MATCHING_CORRECT_LETTER') {
            // Initialize with default options for Matching Correct Letter
            updatedGroup.options = { type: 'matching_correct_letter', options: ['Option A', 'Option B', 'Option C'], option_format: 'A' };
            for (let i = updatedGroup.start_question; i <= updatedGroup.end_question; i++) {
              updatedGroup.questions.push({
                question_number: i,
                question_text: '',
                correct_answer: '',
                is_given: false,
                heading: null,
                options: [],
                option_format: 'A',
              });
            }
          } else if (updates.question_type === 'MAPS') {
            // Initialize with default options for Maps
            updatedGroup.options = { type: 'maps', imageUrl: null, option_letters: ['A', 'B', 'C'], maxImageWidth: null, maxImageHeight: null, imageAlignment: 'center' };
            for (let i = updatedGroup.start_question; i <= updatedGroup.end_question; i++) {
              updatedGroup.questions.push({
                question_number: i,
                question_text: '',
                correct_answer: '',
                is_given: false,
                heading: null,
                options: [],
                option_format: 'A',
              });
            }
          } else if (updates.question_type === 'MAP_LABELING') {
            // Initialize with default options for Map Labeling (drag & drop on image)
            updatedGroup.options = { 
              type: 'map_labeling', 
              imageUrl: null, 
              dropZones: [], 
              options: ['Option 1', 'Option 2', 'Option 3'],
              correctAnswers: {}, // Store correct answer for each question number
              maxImageWidth: 450, 
              maxImageHeight: 400 
            };
            for (let i = updatedGroup.start_question; i <= updatedGroup.end_question; i++) {
              updatedGroup.questions.push({
                question_number: i,
                question_text: '',
                correct_answer: '',
                is_given: false,
                heading: null,
                options: [],
                option_format: 'A',
              });
            }
          } else if (updates.question_type === 'FLOWCHART_COMPLETION') {
            // Initialize with default options for Flowchart Completion (drag & drop)
            updatedGroup.options = { 
              type: 'flowchart_completion', 
              title: '', 
              steps: [], 
              // Start with 6 empty option slots (you can add more as needed)
              options: Array.from({ length: 6 }, () => ''),
              correctAnswers: {},
            };
            // Questions will be managed based on steps with blanks
          } else if (updates.question_type === 'MULTIPLE_CHOICE_SINGLE') { // New type handling
            for (let i = updatedGroup.start_question; i <= updatedGroup.end_question; i++) {
              updatedGroup.questions.push({
                question_number: i,
                question_text: '',
                correct_answer: '',
                is_given: false,
                heading: null,
                options: [], // Default options for MCQ should be empty
                option_format: 'A',
              });
            }
          } else if (updates.question_type === 'MULTIPLE_CHOICE_MULTIPLE') {
            const numSubQuestions = updatedGroup.num_sub_questions || 2;
            updatedGroup.end_question = updatedGroup.start_question + numSubQuestions - 1;
            updatedGroup.questions = [{
              question_number: updatedGroup.start_question,
              question_text: 'Choose the correct options.',
              correct_answer: '',
              is_given: false,
              heading: null,
              options: [],
              option_format: 'A',
            }];
            updatedGroup.options = { type: 'multiple_choice_multiple', options: ['Option A', 'Option B', 'Option C'], option_format: 'A', num_sub_questions: numSubQuestions };
          } else if (updates.question_type === 'DRAG_AND_DROP_OPTIONS') { // New type handling
            updatedGroup.options = { type: 'drag_and_drop_options', options: ['Option 1', 'Option 2', 'Option 3'], option_format: 'A' };
            for (let i = updatedGroup.start_question; i <= updatedGroup.end_question; i++) {
              updatedGroup.questions.push({
                question_number: i,
                question_text: 'Drop answer ______ here.',
                correct_answer: '',
                is_given: false,
                heading: null,
                options: [],
                option_format: 'A',
              });
            }
          } else { // Default for FILL_IN_BLANK and other simple types
            for (let i = updatedGroup.start_question; i <= updatedGroup.end_question; i++) {
              updatedGroup.questions.push({
                question_number: i,
                question_text: '',
                correct_answer: '',
                is_given: false,
                heading: null,
                options: [],
                option_format: 'A',
              });
            }
          }
        }
        
        // If question range or num_sub_questions changed, regenerate questions (only for non-table types)
        if ((updates.start_question !== undefined || updates.end_question !== undefined || updates.num_sub_questions !== undefined) && updatedGroup.question_type !== 'TABLE_COMPLETION') {
          const start = updates.start_question ?? updatedGroup.start_question;
          let end = updates.end_question ?? updatedGroup.end_question;
          const numSubQuestions = updates.num_sub_questions ?? updatedGroup.num_sub_questions;

          if (updatedGroup.question_type === 'MULTIPLE_CHOICE_MULTIPLE') {
            end = start + (numSubQuestions ?? 1) - 1;
            updatedGroup.end_question = end;
            if (updatedGroup.options && typeof updatedGroup.options === 'object') {
              updatedGroup.options = { ...updatedGroup.options, num_sub_questions: numSubQuestions };
            }
            // For MCQ Multiple, only one logical question exists, update its number if start changes
            if (updatedGroup.questions.length > 0) {
              updatedGroup.questions[0].question_number = start;
            }
          } else { // For other types, regenerate individual questions
            const existingQuestions = updatedGroup.questions || [];
            
            const questions: Question[] = [];
            for (let i = start; i <= end; i++) {
              const existing = existingQuestions.find(q => q.question_number === i);
              if (existing) {
                questions.push(existing);
              } else {
                // Preserve options and format for MCQ if it's a new question in the range
                const defaultOptions = (updatedGroup.question_type === 'MULTIPLE_CHOICE_SINGLE' || updatedGroup.question_type === 'MULTIPLE_CHOICE_MULTIPLE') ? [] : []; // Ensure empty
                const defaultOptionFormat = (updatedGroup.question_type === 'MULTIPLE_CHOICE_SINGLE' || updatedGroup.question_type === 'MULTIPLE_CHOICE_MULTIPLE') ? 'A' : 'A';

                questions.push({
                  question_number: i,
                  question_text: '',
                  correct_answer: '',
                  is_given: false,
                  heading: null,
                  options: defaultOptions,
                  option_format: defaultOptionFormat,
                });
              }
            }
            updatedGroup.questions = questions;
          }
        }
        return updatedGroup;
      }
      return group;
    });
    onUpdateAllGroups(newAllGroups);
  };

  const removeGroup = (groupToRemoveId: string) => {
    const newAllGroups = allQuestionGroups.filter(group => group.id !== groupToRemoveId);
    onUpdateAllGroups(newAllGroups);
  };

  const updateQuestion = (groupToUpdateId: string, questionIndex: number, updates: Partial<Question>) => {
    const newAllGroups = allQuestionGroups.map(group => {
      if (group.id === groupToUpdateId) {
        const newQuestions = [...(group.questions || [])];
        newQuestions[questionIndex] = {
          ...newQuestions[questionIndex],
          ...updates
        };
        return { ...group, questions: newQuestions };
      }
      return group;
    });
    onUpdateAllGroups(newAllGroups);
  };

  // Handlers for group-level options (Matching Correct Letter, Maps, Multiple Choice Multiple Questions, Drag and Drop Options)
  const getGroupOptionsArray = (group: QuestionGroup): string[] => {
    if (group.question_type === 'MATCHING_CORRECT_LETTER' && group.options?.options) {
      return group.options.options;
    }
    if (group.question_type === 'MAPS' && group.options?.option_letters) { // Updated to MAPS
      return group.options.option_letters;
    }
    if (group.question_type === 'MULTIPLE_CHOICE_MULTIPLE' && group.options?.options) {
      return group.options.options;
    }
    if (group.question_type === 'DRAG_AND_DROP_OPTIONS' && group.options?.options) { // New: Drag and Drop Options
      return group.options.options;
    }
    return [];
  };

  const getGroupOptionFormat = (group: QuestionGroup): string => {
    if (group.question_type === 'MATCHING_CORRECT_LETTER' && group.options?.option_format) {
      return group.options.option_format;
    }
    if (group.question_type === 'MAPS' && group.options?.option_letters) { // Updated to MAPS
      return 'A'; // Fixed to A for Maps
    }
    if (group.question_type === 'MULTIPLE_CHOICE_MULTIPLE' && group.options?.option_format) {
      return group.options.option_format;
    }
    if (group.question_type === 'DRAG_AND_DROP_OPTIONS' && group.options?.option_format) { // New: Drag and Drop Options
      return group.options.option_format;
    }
    return 'A';
  };

  const updateGroupOptions = (groupToUpdateId: string, newOptionsArray: string[], newOptionFormat?: string) => {
    const newAllGroups = allQuestionGroups.map(group => {
      if (group.id === groupToUpdateId) {
        let updatedOptions: any;
        if (group.question_type === 'MATCHING_CORRECT_LETTER') {
          updatedOptions = { ...group.options, options: newOptionsArray, option_format: newOptionFormat || group.options?.option_format || 'A' };
        } else if (group.question_type === 'MAPS') { // Updated to MAPS
          updatedOptions = { ...group.options, option_letters: newOptionsArray }; // option_format is fixed to 'A'
        } else if (group.question_type === 'MULTIPLE_CHOICE_MULTIPLE') {
          updatedOptions = { ...group.options, options: newOptionsArray, option_format: newOptionFormat || group.options?.option_format || 'A' };
        } else if (group.question_type === 'DRAG_AND_DROP_OPTIONS') { // New: Drag and Drop Options
          updatedOptions = { ...group.options, options: newOptionsArray, option_format: newOptionFormat || group.options?.option_format || 'A' };
        } else {
          updatedOptions = newOptionsArray; // Fallback for simple array options
        }
        return { ...group, options: updatedOptions };
      }
      return group;
    });
    onUpdateAllGroups(newAllGroups);
  };

  const addGroupOption = (groupToUpdateId: string) => {
    const currentGroup = allQuestionGroups.find(g => g.id === groupToUpdateId);
    if (!currentGroup) return;

    const currentOptions = getGroupOptionsArray(currentGroup);
    updateGroupOptions(groupToUpdateId, [...currentOptions, '']);
  };

  const updateSingleGroupOption = (groupToUpdateId: string, optionIndex: number, value: string) => {
    const currentGroup = allQuestionGroups.find(g => g.id === groupToUpdateId);
    if (!currentGroup) return;

    const currentOptions = getGroupOptionsArray(currentGroup);
    const newOptions = [...currentOptions];
    newOptions[optionIndex] = value;
    updateGroupOptions(groupToUpdateId, newOptions);
  };

  const removeGroupOption = (groupToUpdateId: string, optionIndex: number) => {
    const currentGroup = allQuestionGroups.find(g => g.id === groupToUpdateId);
    if (!currentGroup) return;

    const currentOptions = getGroupOptionsArray(currentGroup);
    const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
    updateGroupOptions(groupToUpdateId, newOptions);
  };

  // Handlers for question-level options (MCQ Single)
  const addQuestionOption = (groupToUpdateId: string, questionIndex: number) => {
    const newAllGroups = allQuestionGroups.map(group => {
      if (group.id === groupToUpdateId) {
        const newQuestions = [...(group.questions || [])];
        if (!newQuestions[questionIndex].options) {
          newQuestions[questionIndex].options = [];
        }
        newQuestions[questionIndex].options!.push('');
        return { ...group, questions: newQuestions };
      }
      return group;
    });
    onUpdateAllGroups(newAllGroups);
  };

  const updateQuestionOption = (groupToUpdateId: string, questionIndex: number, optionIndex: number, value: string) => {
    const newAllGroups = allQuestionGroups.map(group => {
      if (group.id === groupToUpdateId) {
        const newQuestions = [...(group.questions || [])];
        newQuestions[questionIndex].options![optionIndex] = value;
        return { ...group, questions: newQuestions };
      }
      return group;
    });
    onUpdateAllGroups(newAllGroups);
  };

  const removeQuestionOption = (groupToUpdateId: string, questionIndex: number, optionIndex: number) => {
    const newAllGroups = allQuestionGroups.map(group => {
      if (group.id === groupToUpdateId) {
        const newQuestions = [...(group.questions || [])];
        newQuestions[questionIndex].options = newQuestions[questionIndex].options!.filter((_, i) => i !== optionIndex);
        return { ...group, questions: newQuestions };
      }
      return group;
    });
    onUpdateAllGroups(newAllGroups);
  };

  const handleImageUploadSuccess = (groupToUpdateId: string, url: string) => {
    const newAllGroups = allQuestionGroups.map(group => {
      if (group.id === groupToUpdateId && group.question_type === 'MAPS') { // Updated to MAPS
        return { ...group, options: { ...group.options, imageUrl: url } };
      }
      return group;
    });
    onUpdateAllGroups(newAllGroups);
  };

  const handleImageRemoveSuccess = (groupToUpdateId: string) => {
    const newAllGroups = allQuestionGroups.map(group => {
      if (group.id === groupToUpdateId && group.question_type === 'MAPS') { // Updated to MAPS
        return { ...group, options: { ...group.options, imageUrl: null } };
      }
      return group;
    });
    onUpdateAllGroups(newAllGroups);
  };

  const handleImageDimensionChange = (groupToUpdateId: string, field: 'maxImageWidth' | 'maxImageHeight', value: string) => {
    const newAllGroups = allQuestionGroups.map(group => {
      if (group.id === groupToUpdateId && group.question_type === 'MAPS') {
        const numericValue = value === '' ? null : parseInt(value);
        return { ...group, options: { ...group.options, [field]: numericValue } };
      }
      return group;
    });
    onUpdateAllGroups(newAllGroups);
  };

  const getOptionLabel = (index: number, format: string) => {
    if (format === '1') return String(index + 1);
    if (format === 'i') {
      const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
      return romanNumerals[index] || String(index + 1);
    }
    return String.fromCharCode(65 + index);
  };

  const isFillInBlank = (type: string) => type === 'FILL_IN_BLANK';
  const isTableCompletion = (type: string) => type === 'TABLE_COMPLETION';
  const isMatchingCorrectLetter = (type: string) => type === 'MATCHING_CORRECT_LETTER';
  const isMaps = (type: string) => type === 'MAPS';
  const isMultipleChoiceSingle = (type: string) => type === 'MULTIPLE_CHOICE_SINGLE';
  const isMultipleChoiceMultiple = (type: string) => type === 'MULTIPLE_CHOICE_MULTIPLE'; // New helper
  const isDragAndDropOptions = (type: string) => type === 'DRAG_AND_DROP_OPTIONS'; // New helper

  // Helper function to render question-specific inputs
  const renderQuestionSpecificInputs = (question: Question, group: QuestionGroup, qIndex: number) => {
    if (isFillInBlank(group.question_type)) {
      return (
        <>
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-2">
              Question Text
              <Tooltip>
                <TooltipTrigger>
                  <Info size={14} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Use five underscores `_____` to mark blank positions. Each blank will be replaced with an input field.</p>
                  <p className="mt-1">Example: "The meeting is at _____ in room _____."</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <RichTextEditor
              value={question.question_text || ''}
              onChange={(value) => updateQuestion(group.id!, qIndex, { question_text: value })}
              placeholder="Enter text with _____ for blanks (e.g., 'The answer is _____.') "
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Correct Answer(s)</Label>
            <MultipleAnswersInput
              value={question.correct_answer || ''}
              onChange={(value) => updateQuestion(group.id!, qIndex, { correct_answer: value })}
              questionType={group.question_type}
              placeholder="Enter correct answer(s) separated by /"
            />
          </div>
        </>
      );
    } else if (isMultipleChoiceSingle(group.question_type)) {
      return (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Question Text</Label>
            <RichTextEditor
              value={question.question_text || ''}
              onChange={(value) => updateQuestion(group.id!, qIndex, { question_text: value })}
              placeholder="Enter the question text..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Options</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={question.option_format || 'A'}
                  onValueChange={(value) => updateQuestion(group.id!, qIndex, { option_format: value })}
                >
                  <SelectTrigger className="w-24 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPTION_FORMATS.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => addQuestionOption(group.id!, qIndex)}
                >
                  <Plus size={12} className="mr-1" />
                  Add
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {(question.options || []).map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-medium text-muted-foreground">
                    {getOptionLabel(optIdx, question.option_format || 'A')}
                  </span>
                  <Input
                    className="h-8 text-sm"
                    value={opt}
                    onChange={(e) => updateQuestionOption(group.id!, qIndex, optIdx, e.target.value)}
                    placeholder={`Option ${getOptionLabel(optIdx, question.option_format || 'A')}`}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeQuestionOption(group.id!, qIndex, optIdx)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Correct Answer</Label>
            <Select
              value={question.correct_answer || 'none'}
              onValueChange={(value) => updateQuestion(group.id!, qIndex, { correct_answer: value === 'none' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {(question.options || []).map((opt, idx) => (
                  <SelectItem key={idx} value={getOptionLabel(idx, question.option_format || 'A')}>
                    {getOptionLabel(idx, question.option_format || 'A')} - {opt.substring(0, 50)}{opt.length > 50 ? '...' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      );
    } else if (isMatchingCorrectLetter(group.question_type)) {
      return (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Question Text (after dropdown)</Label>
            <RichTextEditor
              value={question.question_text || ''}
              onChange={(value) => updateQuestion(group.id!, qIndex, { question_text: value })}
              placeholder="Enter the text that follows the dropdown (e.g., 'is the main topic of the lecture.')"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Correct Answer</Label>
            <Select
              value={question.correct_answer || 'none'}
              onValueChange={(value) => updateQuestion(group.id!, qIndex, { correct_answer: value === 'none' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {(getGroupOptionsArray(group) || []).map((opt, idx) => (
                  <SelectItem key={idx} value={getOptionLabel(idx, getGroupOptionFormat(group))}>
                    {getOptionLabel(idx, getGroupOptionFormat(group))} - {opt.substring(0, 50)}{opt.length > 50 ? '...' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      );
    } else if (isMaps(group.question_type)) {
      return (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Option Text (e.g., "A. The first image shows...")</Label>
            <RichTextEditor
              value={question.question_text || ''}
              onChange={(value) => updateQuestion(group.id!, qIndex, { question_text: value })}
              placeholder={`Enter text for option ${getOptionLabel(qIndex, 'A')}`}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Correct Answer</Label>
            <Select
              value={question.correct_answer || 'none'}
              onValueChange={(value) => updateQuestion(group.id!, qIndex, { correct_answer: value === 'none' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct letter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {(getGroupOptionsArray(group) || []).map((opt, idx) => (
                  <SelectItem key={idx} value={getOptionLabel(idx, 'A')}>
                    {getOptionLabel(idx, 'A')} - {opt.substring(0, 50)}{opt.length > 50 ? '...' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      );
    } else if (isDragAndDropOptions(group.question_type)) { // New: Drag and Drop Options
      return (
        <>
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-2">
              Question Text with Drop Zone
              <Tooltip>
                <TooltipTrigger>
                  <Info size={14} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Use `______` (six underscores) to mark the position of the drop zone.</p>
                  <p className="mt-1">Example: "The main challenge was ______ to the new system."</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <RichTextEditor
              value={question.question_text || ''}
              onChange={(value) => updateQuestion(group.id!, qIndex, { question_text: value })}
              placeholder="Enter question text with ______ for the drop zone."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Correct Answer</Label>
            <Select
              value={question.correct_answer || 'none'}
              onValueChange={(value) => updateQuestion(group.id!, qIndex, { correct_answer: value === 'none' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {(getGroupOptionsArray(group) || []).map((opt, idx) => (
                  <SelectItem key={idx} value={getOptionLabel(idx, getGroupOptionFormat(group))}>
                    {getOptionLabel(idx, getGroupOptionFormat(group))} - {opt.substring(0, 50)}{opt.length > 50 ? '...' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      );
    }
    return null; // Default case if no specific input type matches
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Question Groups for {partRanges[activePart].label}</h3>
          <Button onClick={addGroup} variant="outline" size="sm">
            <Plus size={16} className="mr-1" />
            Add Question Group
          </Button>
        </div>

        {displayedGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No question groups yet for {partRanges[activePart].label}. Click "Add Question Group" to start.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedGroups.map((group) => (
              <Collapsible 
                key={group.id}
                open={expandedGroups[group.id!] ?? false}
                onOpenChange={() => toggleGroup(group.id!)}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-3 flex-1 text-left">
                        {expandedGroups[group.id!] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        <CardTitle className="text-base">
                          Questions {group.start_question}-{group.end_question}: {
                            LISTENING_QUESTION_TYPES.find(t => t.value === group.question_type)?.label || group.question_type
                          }
                        </CardTitle>
                    </button>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                      <ListeningQuestionGroupPreview group={group} />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGroup(group.id!);
                        }}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                      {/* Group Settings */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Question Type</Label>
                          <Select
                            value={group.question_type}
                            onValueChange={(value) => updateGroup(group.id!, { question_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LISTENING_QUESTION_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Start Question</Label>
                          <Input
                            type="number"
                            value={group.start_question}
                            onChange={(e) => updateGroup(group.id!, { start_question: parseInt(e.target.value) || 1 })}
                            min={partRanges[activePart].start}
                            max={partRanges[activePart].end}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Question</Label>
                          <Input
                            type="number"
                            value={group.end_question}
                            onChange={(e) => updateGroup(group.id!, { end_question: parseInt(e.target.value) || 1 })}
                            disabled={isMultipleChoiceMultiple(group.question_type)} // Only disable if MCQ Multiple
                            min={partRanges[activePart].start}
                            max={partRanges[activePart].end}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            Audio Start (sec)
                            <Tooltip>
                              <TooltipTrigger>
                                <Info size={12} className="text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>The timestamp (in seconds) when this question group starts in the part audio. Used for question-group filtered tests.</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            type="number"
                            value={group.start_timestamp_seconds ?? ''}
                            onChange={(e) => updateGroup(group.id!, { start_timestamp_seconds: e.target.value ? parseFloat(e.target.value) : null })}
                            placeholder="0"
                            min={0}
                          />
                        </div>
                      </div>

                      {/* Number of Answers to Select for MCQ Multiple Questions */}
                      {isMultipleChoiceMultiple(group.question_type) && (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Number of Answers to Select
                            <Tooltip>
                              <TooltipTrigger>
                                <Info size={14} className="text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>This defines how many options the test taker can select for this question. The 'End Question' will automatically adjust based on this value.</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={getGroupOptionsArray(group).length || 10} // Max allowed based on current options or a default
                            value={group.num_sub_questions || 1}
                            onChange={(e) => updateGroup(group.id!, { num_sub_questions: parseInt(e.target.value) || 1 })}
                            className="w-24"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Instruction/Description (supports formatting: **bold**, *italic*, ## heading)</Label>
                        <RichTextEditor
                          value={group.instruction || ''}
                          onChange={(value) => updateGroup(group.id!, { instruction: value })}
                          placeholder="e.g., Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer."
                          rows={3}
                        />
                      </div>

                      {/* Group Heading - appears below instruction */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 space-y-2">
                          <Label className="flex items-center gap-2">
                            Group Heading (Optional)
                            <Tooltip>
                              <TooltipTrigger>
                                <Info size={12} className="text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>A bold heading that appears below the instruction for the entire question group. Useful for section titles like "Transport Options" or "Schedule Details".</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            value={group.group_heading || ''}
                            onChange={(e) => updateGroup(group.id!, { group_heading: e.target.value || null })}
                            placeholder="e.g., Transport Options, Schedule Details..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Heading Alignment</Label>
                          <Select
                            value={group.group_heading_alignment || 'center'}
                            onValueChange={(value: 'left' | 'center' | 'right') => updateGroup(group.id!, { group_heading_alignment: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Fill in Blank Display Mode Toggle */}
                      {group.question_type === 'FILL_IN_BLANK' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={group.options?.display_mode === 'note_style'}
                                onCheckedChange={(checked) => {
                                  const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                                    ? group.options
                                    : {};
                                  const newOptions = { 
                                    ...baseOptions, 
                                    display_mode: checked ? 'note_style' : 'default',
                                    // Initialize empty categories when enabling note-style
                                    ...(checked && !baseOptions.noteCategories ? { noteCategories: [] } : {})
                                  };
                                  updateGroup(group.id!, { options: newOptions });
                                }}
                              />
                              <Label className="flex items-center gap-2">
                                Note-Style Layout (Official IELTS Format)
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info size={14} className="text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>Displays questions in a two-column format with category labels on the left (e.g., "Dining table:") and items with blanks on the right.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </Label>
                            </div>
                          </div>

                          {/* Note-Style Category Editor - shown when note_style is enabled */}
                          {group.options?.display_mode === 'note_style' && (
                            <div className="p-4 bg-muted/20 rounded-lg border">
                              <NoteStyleCategoryEditor
                                categories={group.options?.noteCategories || []}
                                onChange={(newCategories: NoteCategory[]) => {
                                  const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                                    ? group.options
                                    : { display_mode: 'note_style' };
                                  
                                  // Count total questions from categories
                                  const totalQuestions = newCategories.reduce((sum, cat) => 
                                    sum + cat.items.filter(item => item.hasBlank).length, 0
                                  );
                                  
                                  // Update end_question based on total questions
                                  const newEndQuestion = group.start_question + Math.max(totalQuestions - 1, 0);
                                  
                                  // Build questions array from categories for database compatibility
                                  const newQuestions: Question[] = [];
                                  let questionNum = group.start_question;
                                  newCategories.forEach((cat) => {
                                    cat.items.forEach((item) => {
                                      if (item.hasBlank) {
                                        newQuestions.push({
                                          question_number: questionNum,
                                          question_text: `${item.text || ''}___${item.suffixText || ''}`,
                                          correct_answer: '',
                                          is_given: false,
                                          heading: cat.label || null,
                                        });
                                        questionNum++;
                                      }
                                    });
                                  });

                                  updateGroup(group.id!, { 
                                    options: { ...baseOptions, noteCategories: newCategories },
                                    end_question: newEndQuestion,
                                    questions: newQuestions.length > 0 ? newQuestions : group.questions
                                  });
                                }}
                                startQuestionNumber={group.start_question}
                              />

                              {/* Correct Answers Section for Note-Style */}
                              {(group.options?.noteCategories || []).length > 0 && (
                                <div className="mt-4 p-4 bg-background rounded-lg border">
                                  <Label className="text-sm font-medium mb-3 block">Correct Answers</Label>
                                  <div className="space-y-2">
                                    {(() => {
                                      let questionNum = group.start_question;
                                      const answerFields: React.ReactNode[] = [];
                                      
                                      (group.options?.noteCategories || []).forEach((cat: NoteCategory, catIdx: number) => {
                                        cat.items.forEach((item, itemIdx: number) => {
                                          if (item.hasBlank) {
                                            const currentQNum = questionNum;
                                            const existingQuestion = group.questions?.find(q => q.question_number === currentQNum);
                                            
                                            answerFields.push(
                                              <div key={`${catIdx}-${itemIdx}`} className="flex items-center gap-3">
                                                <span className="w-8 text-sm font-bold text-primary">{currentQNum}.</span>
                                                <span className="text-sm text-muted-foreground flex-shrink-0 w-32 truncate" title={`${item.text || ''}_____${item.suffixText || ''}`}>
                                                  {item.text || ''}__{item.suffixText || ''}
                                                </span>
                                                <MultipleAnswersInput
                                                  value={existingQuestion?.correct_answer || ''}
                                                  onChange={(value) => {
                                                    const qIdx = group.questions?.findIndex(q => q.question_number === currentQNum);
                                                    if (qIdx !== undefined && qIdx >= 0) {
                                                      updateQuestion(group.id!, qIdx, { correct_answer: value });
                                                    }
                                                  }}
                                                  questionType="FILL_IN_BLANK"
                                                  placeholder="Enter correct answer(s) separated by /"
                                                />
                                              </div>
                                            );
                                            questionNum++;
                                          }
                                        });
                                      });
                                      
                                      return answerFields;
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}


                      {/* Group-level Options (for Matching Correct Letter, Multiple Choice Multiple Questions, Drag and Drop Options) */}
                      {(isMatchingCorrectLetter(group.question_type) || isMultipleChoiceMultiple(group.question_type) || isDragAndDropOptions(group.question_type)) && (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold flex items-center gap-2">
                              {isDragAndDropOptions(group.question_type) ? 'Draggable Options' : 'Options for Questions'}
                              <Badge variant="secondary">{(getGroupOptionsArray(group) || []).length} options</Badge>
                            </Label>
                            <div className="flex items-center gap-2">
                              <Select
                                value={getGroupOptionFormat(group)}
                                onValueChange={(value) => updateGroupOptions(group.id!, getGroupOptionsArray(group), value)}
                              >
                                <SelectTrigger className="w-24 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {OPTION_FORMATS.map(f => (
                                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="sm" onClick={() => addGroupOption(group.id!)}>
                                <Plus size={14} className="mr-1" />
                                Add Option
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {isDragAndDropOptions(group.question_type)
                              ? 'These options will be draggable by the test taker to fill the blanks.'
                              : 'These options will appear in a box above the questions, and in the dropdown for each question.'}
                          </p>
                          <div className="space-y-2">
                            {(getGroupOptionsArray(group) || []).map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <span className="w-8 text-sm font-bold text-primary">
                                  {getOptionLabel(optIndex, getGroupOptionFormat(group))}
                                </span>
                                <Input
                                  value={option}
                                  onChange={(e) => updateSingleGroupOption(group.id!, optIndex, e.target.value)}
                                  placeholder={`Option ${getOptionLabel(optIndex, getGroupOptionFormat(group))}`}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeGroupOption(group.id!, optIndex)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Maps - Image Uploader and Options */}
                      {isMaps(group.question_type) && (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                          <Label className="text-base font-semibold">Image for Questions</Label>
                          <ListeningImageUploader
                            testId={testId}
                            currentImageUrl={group.options?.imageUrl || null}
                            onUploadSuccess={(url) => handleImageUploadSuccess(group.id!, url)}
                            onRemoveSuccess={() => handleImageRemoveSuccess(group.id!)}
                          />
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor={`max-width-${group.id}`}>Max Image Width (px)</Label>
                              <Input
                                id={`max-width-${group.id}`}
                                type="number"
                                value={group.options?.maxImageWidth || ''}
                                onChange={(e) => handleImageDimensionChange(group.id!, 'maxImageWidth', e.target.value)}
                                placeholder="e.g., 600"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`max-height-${group.id}`}>Max Image Height (px)</Label>
                              <Input
                                id={`max-height-${group.id}`}
                                type="number"
                                value={group.options?.maxImageHeight || ''}
                                onChange={(e) => handleImageDimensionChange(group.id!, 'maxImageHeight', e.target.value)}
                                placeholder="e.g., 400"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`image-alignment-${group.id}`}>Image Alignment</Label>
                              <Select
                                value={group.options?.imageAlignment || 'center'}
                                onValueChange={(value) => {
                                  const newAllGroups = allQuestionGroups.map(g => {
                                    if (g.id === group.id) {
                                      return { ...g, options: { ...g.options, imageAlignment: value } };
                                    }
                                    return g;
                                  });
                                  onUpdateAllGroups(newAllGroups);
                                }}
                              >
                                <SelectTrigger id={`image-alignment-${group.id}`}>
                                  <SelectValue placeholder="Select alignment" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Left</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <Label className="text-base font-semibold flex items-center gap-2">
                              Letter Options (A, B, C...)
                              <Badge variant="secondary">{(getGroupOptionsArray(group) || []).length} options</Badge>
                            </Label>
                            <Button variant="outline" size="sm" onClick={() => addGroupOption(group.id!)}>
                              <Plus size={14} className="mr-1" />
                              Add Letter Option
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            These letters will appear in the dropdown for each question. The text for each option will be defined in the individual questions below.
                          </p>
                          <div className="space-y-2">
                            {(getGroupOptionsArray(group) || []).map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <span className="w-8 text-sm font-bold text-primary">
                                  {getOptionLabel(optIndex, 'A')}
                                </span>
                                <Input
                                  value={option} // This input will store the actual text for option A, B, C
                                  onChange={(e) => updateSingleGroupOption(group.id!, optIndex, e.target.value)}
                                  placeholder={`Text for Option ${getOptionLabel(optIndex, 'A')}`}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeGroupOption(group.id!, optIndex)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Map Labeling Editor */}
                      {group.question_type === 'MAP_LABELING' && (
                        <MapLabelingEditor
                          testId={testId}
                          imageUrl={group.options?.imageUrl || null}
                          dropZones={group.options?.dropZones || []}
                          options={group.options?.options || []}
                          correctAnswers={group.options?.correctAnswers || {}}
                          maxImageWidth={group.options?.maxImageWidth || null}
                          maxImageHeight={group.options?.maxImageHeight || null}
                          startQuestion={group.start_question}
                          endQuestion={group.end_question}
                          onImageChange={(url) => {
                            const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                              ? group.options
                              : { type: 'map_labeling', dropZones: [], options: [], correctAnswers: {}, maxImageWidth: 450, maxImageHeight: 400 };
                            const newOptions = { ...baseOptions, imageUrl: url };
                            updateGroup(group.id!, { options: newOptions });
                          }}
                          onDropZonesChange={(zones) => {
                            const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                              ? group.options
                              : { type: 'map_labeling', imageUrl: null, options: [], correctAnswers: {}, maxImageWidth: 450, maxImageHeight: 400 };
                            const newOptions = { ...baseOptions, dropZones: zones };
                            updateGroup(group.id!, { options: newOptions });
                          }}
                          onOptionsChange={(opts) => {
                            const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                              ? group.options
                              : { type: 'map_labeling', imageUrl: null, dropZones: [], correctAnswers: {}, maxImageWidth: 450, maxImageHeight: 400 };
                            const newOptions = { ...baseOptions, options: opts };
                            updateGroup(group.id!, { options: newOptions });
                          }}
                          onCorrectAnswersChange={(answers) => {
                            const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                              ? group.options
                              : { type: 'map_labeling', imageUrl: null, dropZones: [], options: [], maxImageWidth: 450, maxImageHeight: 400 };
                            const newOptions = { ...baseOptions, correctAnswers: answers };
                            updateGroup(group.id!, { options: newOptions });
                          }}
                          onMaxImageWidthChange={(width) => {
                            const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                              ? group.options
                              : { type: 'map_labeling', imageUrl: null, dropZones: [], options: [], correctAnswers: {}, maxImageHeight: 400 };
                            const newOptions = { ...baseOptions, maxImageWidth: width };
                            updateGroup(group.id!, { options: newOptions });
                          }}
                          onMaxImageHeightChange={(height) => {
                            const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                              ? group.options
                              : { type: 'map_labeling', imageUrl: null, dropZones: [], options: [], correctAnswers: {}, maxImageWidth: 450 };
                            const newOptions = { ...baseOptions, maxImageHeight: height };
                            updateGroup(group.id!, { options: newOptions });
                          }}
                        />
                      )}

                      {/* Flowchart Completion Editor */}
                      {group.question_type === 'FLOWCHART_COMPLETION' && (
                        <FlowchartCompletionEditor
                          title={group.options?.title || ''}
                          steps={group.options?.steps || []}
                          options={group.options?.options || []}
                          correctAnswers={group.options?.correctAnswers || {}}
                          startQuestion={group.start_question}
                          endQuestion={group.end_question}
                          onTitleChange={(title) => {
                            const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                              ? group.options
                              : { type: 'flowchart_completion', steps: [], options: [], correctAnswers: {} };
                            updateGroup(group.id!, { options: { ...baseOptions, title } });
                          }}
                          onStepsChange={(steps: FlowchartStep[]) => {
                            const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                              ? group.options
                              : { type: 'flowchart_completion', title: '', options: [], correctAnswers: {} };
                            // Update end_question based on blanks count
                            const blankCount = steps.filter((s: FlowchartStep) => s.hasBlank).length;
                            const newEndQuestion = group.start_question + Math.max(blankCount - 1, 0);
                            // Build questions array from steps with blanks for database compatibility
                            const newQuestions: Question[] = steps
                              .filter((s: FlowchartStep) => s.hasBlank && s.blankNumber)
                              .sort((a: FlowchartStep, b: FlowchartStep) => (a.blankNumber || 0) - (b.blankNumber || 0))
                              .map((s: FlowchartStep) => ({
                                question_number: s.blankNumber!,
                                question_text: s.text,
                                correct_answer: baseOptions.correctAnswers?.[s.blankNumber!] || '',
                                is_given: false,
                                heading: null,
                              }));
                            updateGroup(group.id!, { 
                              options: { ...baseOptions, steps },
                              end_question: blankCount > 0 ? newEndQuestion : group.end_question,
                              questions: newQuestions.length > 0 ? newQuestions : group.questions
                            });
                          }}
                          onOptionsChange={(opts, nextCorrectAnswers) => {
                            const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                              ? group.options
                              : { type: 'flowchart_completion', title: '', steps: [], correctAnswers: {} };

                            // If options removal also changed correctAnswers, persist both in ONE update
                            if (nextCorrectAnswers) {
                              const newQuestions = (group.questions || []).map(q => ({
                                ...q,
                                correct_answer: nextCorrectAnswers[q.question_number] || '',
                              }));

                              updateGroup(group.id!, {
                                options: { ...baseOptions, options: opts, correctAnswers: nextCorrectAnswers },
                                questions: newQuestions,
                              });
                              return;
                            }

                            updateGroup(group.id!, { options: { ...baseOptions, options: opts } });
                          }}
                          onCorrectAnswersChange={(answers) => {
                            const baseOptions = group.options && typeof group.options === 'object' && !Array.isArray(group.options)
                              ? group.options
                              : { type: 'flowchart_completion', title: '', steps: [], options: [] };
                            // Also update correct_answer in questions array
                            const newQuestions = (group.questions || []).map(q => ({
                              ...q,
                              correct_answer: answers[q.question_number] || q.correct_answer
                            }));
                            updateGroup(group.id!, { 
                              options: { ...baseOptions, correctAnswers: answers },
                              questions: newQuestions
                            });
                          }}
                        />
                      )}

                      {/* Conditional rendering for Table Completion Editor */}
                      {isTableCompletion(group.question_type) && group.questions[0] && (
                        <div className="space-y-4 mt-4">
                          <Label className="text-base font-semibold">Table Structure</Label>
                          <ListeningTableEditor
                            value={group.questions[0].table_data || []}
                            onChange={(data) => updateQuestion(group.id!, 0, { table_data: data })}
                            startQuestionNumber={group.start_question}
                            endQuestionNumber={group.end_question}
                          />
                        </div>
                      )}

                      {/* Individual Questions (for non-table types) */}
                      {!isTableCompletion(group.question_type) && isMultipleChoiceMultiple(group.question_type) && group.questions[0] ? (
                        // Simplified MCQ Multiple admin panel - per reference screenshot
                        <div className="space-y-3 mt-4">
                          <Label className="text-base font-semibold">Question {group.start_question}-{group.end_question}</Label>
                          <div className="border rounded-lg p-4 bg-muted/20">
                            <div className="space-y-3">
                              {/* Question Text */}
                              <div className="space-y-2">
                                <Label className="text-xs">Question Text</Label>
                                <RichTextEditor
                                  value={group.questions[0].question_text || ''}
                                  onChange={(value) => updateQuestion(group.id!, 0, { question_text: value })}
                                  placeholder="e.g., 'Which TWO of the following are mentioned as features of the new design?'"
                                  rows={2}
                                />
                              </div>
                              {/* Correct Answer(s) */}
                              <div className="space-y-2">
                                <Label className="text-xs flex items-center gap-2">
                                  Correct Answer(s)
                                  <Badge variant="secondary" className="text-xs">
                                    Select {group.num_sub_questions || 2}
                                  </Badge>
                                </Label>
                                <MultiSelectAnswerInput
                                  value={group.questions[0].correct_answer || ''}
                                  onChange={(value) => updateQuestion(group.id!, 0, { correct_answer: value })}
                                  options={group.options?.options || []}
                                  optionFormat={group.options?.option_format || 'A'}
                                  maxSelections={group.num_sub_questions || 2}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : isFillInBlank(group.question_type) && group.options?.display_mode === 'note_style' ? null : (
                        <div className="space-y-3 mt-4">
                          <Label className="text-base font-semibold">Questions</Label>
                          {(group.questions || []).map((question, qIndex) => {
                            // Skip individual question blocks for certain types that have their own editors
                            // MAP_LABELING uses MapLabelingEditor which handles questions visually
                            // TABLE_COMPLETION uses ListeningTableEditor
                            if (isTableCompletion(group.question_type) || group.question_type === 'MAP_LABELING' || (question.is_given && isFillInBlank(group.question_type) && !question.question_text.includes('_____'))) {
                              return null;
                            }
                            return (
                              <div key={qIndex} className="border rounded-lg p-4 bg-muted/20">
                                <div className="flex items-start gap-3">
                                  <span className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                    {question.question_number}
                                  </span>
                                  <div className="flex-1 space-y-3">
                                    {/* Question Heading (Optional) for all non-table types */}
                                    <div className="space-y-2">
                                      <Label className="text-xs flex items-center gap-2">
                                        Question Heading (Optional)
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Info size={14} className="text-muted-foreground" />
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs">
                                            <p>An optional heading that appears before the question text.</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </Label>
                                      <RichTextEditor
                                        value={question.heading || ''}
                                        onChange={(value) => updateQuestion(group.id!, qIndex, { heading: value })}
                                        placeholder="e.g., Section 1.1"
                                        rows={1}
                                      />
                                    </div>

                                    {renderQuestionSpecificInputs(question, group, qIndex)}

                                    <div className="flex items-center gap-3">
                                      <Switch
                                        checked={question.is_given}
                                        onCheckedChange={(checked) => updateQuestion(group.id!, qIndex, { is_given: checked })}
                                      />
                                      <Label className="text-xs">Is Given Answer (Test taker cannot edit)</Label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}