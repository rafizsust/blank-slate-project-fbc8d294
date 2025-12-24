import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, ArrowLeft, Cloud, CloudOff } from 'lucide-react';
import { FullTestPreview } from '@/components/admin/FullTestPreview';
import { toast } from 'sonner';
import { PassageEditor } from '@/components/admin/PassageEditor';
import { QuestionGroupEditor } from '@/components/admin/QuestionGroupEditor';
import type { ReadingTableEditorData } from '@/components/admin/ReadingTableEditor';

interface TestData {
  id?: string;
  title: string;
  book_name: string;
  test_number: number;
  test_type: string;
  time_limit: number;
  total_questions: number;
  is_published: boolean;
}

interface Passage {
  id?: string;
  passage_number: number;
  title: string;
  paragraphs: Paragraph[];
  show_labels?: boolean;
}

interface Paragraph {
  id?: string;
  label: string;
  content: string;
  is_heading: boolean;
  order_index: number;
}

interface QuestionGroup {
  id?: string;
  passage_id?: string;
  question_type: string;
  instruction: string;
  start_question: number;
  end_question: number;
  options: string[];
  questions: Question[];
  max_answers?: number; // For MCQ Multiple
  option_format?: string; // For MCQ Multiple (A, 1, i)
  display_as_paragraph?: boolean;
  show_bullets?: boolean;
  show_headings?: boolean;
  use_dropdown?: boolean;
  // Title options for fill-in-gap
  group_title?: string;
  title_centered?: boolean;
  title_colored?: boolean;
  // Note-style layout
  note_style_enabled?: boolean;
  note_categories?: any[];
  // Table completion data
  table_data?: ReadingTableEditorData;
  // Matching Grid options
  use_letter_headings?: boolean;
  options_title?: string;
  // Map Labeling options
  map_labeling_options?: {
    imageUrl: string | null;
    dropZones: { questionNumber: number; xPercent: number; yPercent: number; }[];
    options: string[];
    correctAnswers: Record<number, string>;
    maxImageWidth: number | null;
    maxImageHeight: number | null;
  };
}

interface Question {
  id?: string;
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  option_format: string;
  heading?: string;
  // For MCQ Multiple sub-groups
  sub_group_start?: number;
  sub_group_end?: number;
}

const QUESTION_TYPES = [
  { value: 'TRUE_FALSE_NOT_GIVEN', label: 'True / False / Not Given' },
  { value: 'YES_NO_NOT_GIVEN', label: 'Yes / No / Not Given' },
  { value: 'MATCHING_HEADINGS', label: 'Matching Headings' },
  { value: 'MATCHING_INFORMATION', label: 'Matching Information' },
  { value: 'MATCHING_SENTENCE_ENDINGS', label: 'Matching Sentence Endings' },
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice (Single)' },
  { value: 'MULTIPLE_CHOICE_MULTIPLE', label: 'Multiple Choice (Multi-Select)' },
  { value: 'FILL_IN_BLANK', label: 'Fill in Gap / Sentence Completion' },
  { value: 'TABLE_COMPLETION', label: 'Table Completion' },
  { value: 'TABLE_SELECTION', label: 'Matching Grid' },
  { value: 'FLOWCHART_COMPLETION', label: 'Flowchart Completion' },
  { value: 'MAP_LABELING', label: 'Map Labeling (Drag & Drop)' },
];

const LOCAL_STORAGE_KEY = 'reading_test_draft';

export default function ReadingTestEditor() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!testId;

  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeTab, setActiveTab] = useState('details');
  const [activePassage, setActivePassage] = useState(0);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const [testData, setTestData] = useState<TestData>({
    title: '',
    book_name: 'Cambridge IELTS',
    test_number: 1,
    test_type: 'academic',
    time_limit: 60,
    total_questions: 40,
    is_published: false,
  });

  const [passages, setPassages] = useState<Passage[]>([
    { passage_number: 1, title: '', paragraphs: [] }
  ]);

  const [questionGroups, setQuestionGroups] = useState<Record<number, QuestionGroup[]>>({
    0: []
  });

  // Load from localStorage on mount (for draft recovery)
  useEffect(() => {
    if (!isEditing) {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.testData) setTestData(draft.testData);
          if (draft.passages) setPassages(draft.passages);
          if (draft.questionGroups) setQuestionGroups(draft.questionGroups);
          toast.info('Draft restored from previous session');
        } catch (e) {
          console.error('Failed to restore draft:', e);
        }
      }
    }
  }, [isEditing]);

  // Auto-save to localStorage
  const autoSaveToLocal = useCallback(() => {
    if (!isEditing) {
      const draft = { testData, passages, questionGroups, savedAt: Date.now() };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
      setAutoSaveStatus('saved');
    }
  }, [testData, passages, questionGroups, isEditing]);

  // Debounced auto-save
  useEffect(() => {
    setAutoSaveStatus('unsaved');
    
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    autoSaveTimer.current = setTimeout(() => {
      setAutoSaveStatus('saving');
      autoSaveToLocal();
    }, 2000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [testData, passages, questionGroups, autoSaveToLocal]);

  useEffect(() => {
    if (isEditing) {
      fetchTestData();
    }
  }, [testId]);

  const fetchTestData = async () => {
    try {
      // Fetch test
      const { data: test, error: testError } = await supabase
        .from('reading_tests')
        .select('*')
        .eq('id', testId!)
        .single();

      if (testError) throw testError;
      setTestData(test);

      // Fetch passages
      const { data: passagesData, error: passagesError } = await supabase
        .from('reading_passages')
        .select('*')
        .eq('test_id', testId!)
        .order('passage_number');

      if (passagesError) throw passagesError;

      if (passagesData && passagesData.length > 0) {
        const passageIds = passagesData.map(p => p.id);
        
        // Fetch all paragraphs in a single query (fixes N+1 problem)
        const { data: allParagraphs } = await supabase
          .from('reading_paragraphs')
          .select('*')
          .in('passage_id', passageIds)
          .order('order_index');
        
        // Fetch all question groups in a single query
        const { data: allGroups } = await supabase
          .from('reading_question_groups')
          .select('*')
          .in('passage_id', passageIds)
          .order('start_question');
        
        // Fetch all questions in a single query
        const { data: allQuestions } = await supabase
          .from('reading_questions')
          .select('*')
          .in('passage_id', passageIds)
          .order('question_number');
        
        // Group paragraphs by passage_id
        const paragraphsByPassage: Record<string, any[]> = {};
        for (const p of (allParagraphs || [])) {
          if (!paragraphsByPassage[p.passage_id]) {
            paragraphsByPassage[p.passage_id] = [];
          }
          paragraphsByPassage[p.passage_id].push(p);
        }
        
        // Build passages with paragraphs
        const passagesWithParagraphs = passagesData.map(passage => ({
          ...passage,
          paragraphs: paragraphsByPassage[passage.id] || []
        }));
        setPassages(passagesWithParagraphs);
        
        // Group questions by passage_id
        const questionsByPassage: Record<string, any[]> = {};
        for (const q of (allQuestions || [])) {
          if (!questionsByPassage[q.passage_id]) {
            questionsByPassage[q.passage_id] = [];
          }
          questionsByPassage[q.passage_id].push(q);
        }
        
        // Group groups by passage_id
        const groupsByPassage: Record<string, any[]> = {};
        for (const g of (allGroups || [])) {
          if (!groupsByPassage[g.passage_id]) {
            groupsByPassage[g.passage_id] = [];
          }
          groupsByPassage[g.passage_id].push(g);
        }
        
        // Build question groups for each passage
        const newQuestionGroups: Record<number, QuestionGroup[]> = {};
        passagesData.forEach((passage, idx) => {
          const groups = groupsByPassage[passage.id] || [];
          const questions = questionsByPassage[passage.id] || [];
          
          newQuestionGroups[idx] = groups.map(g => {
            const groupOptions = g.options as any;
            
            // For TABLE_COMPLETION, get table_data from the first question in this group
            let tableData: ReadingTableEditorData | undefined = undefined;
            if (g.question_type === 'TABLE_COMPLETION') {
              const tableQuestion = questions.find(
                q => q.question_number >= g.start_question && q.question_number <= g.end_question
              ) as any;
              if (tableQuestion?.table_data) {
                const rawTableData = tableQuestion.table_data;
                // Handle both legacy array format and new object format
                if (Array.isArray(rawTableData)) {
                  tableData = {
                    rows: rawTableData,
                    heading: '',
                    headingAlignment: 'left',
                  };
                } else {
                  tableData = {
                    rows: rawTableData.rows || [],
                    heading: rawTableData.heading || '',
                    headingAlignment: rawTableData.headingAlignment || 'left',
                  };
                }
              }
            }
            
            return {
              ...g,
              instruction: g.instruction ?? '',
              options: Array.isArray(groupOptions) ? groupOptions : 
                (groupOptions?.headings || groupOptions?.options || []),
              max_answers: groupOptions?.max_answers || 2,
              option_format: groupOptions?.option_format || 'A',
              display_as_paragraph: g.display_as_paragraph || false,
              show_bullets: g.show_bullets || false,
              show_headings: g.show_headings || false,
              use_dropdown: g.use_dropdown || false,
              group_title: groupOptions?.group_title || '',
              title_centered: groupOptions?.title_centered || false,
              title_colored: groupOptions?.title_colored || false,
              note_style_enabled: groupOptions?.note_style_enabled || false,
              note_categories: groupOptions?.note_categories || [],
              use_letter_headings: groupOptions?.use_letter_headings || false,
              options_title: groupOptions?.options_title || '',
              table_data: tableData,
              // Populate map_labeling_options from saved options for MAP_LABELING type
              map_labeling_options: g.question_type === 'MAP_LABELING' && groupOptions ? {
                imageUrl: groupOptions.imageUrl || null,
                dropZones: groupOptions.dropZones || [],
                options: groupOptions.options || [],
                correctAnswers: groupOptions.correctAnswers || {},
                maxImageWidth: groupOptions.maxImageWidth || null,
                maxImageHeight: groupOptions.maxImageHeight || null,
              } : undefined,
              questions: questions
                .filter(q => q.question_number >= g.start_question && q.question_number <= g.end_question)
                .map(q => {
                  const qOptions = q.options as any;
                  return {
                    ...q,
                    options: Array.isArray(qOptions) ? qOptions : 
                      (qOptions?.options || []),
                    heading: (q as any).heading || '',
                    sub_group_start: qOptions?.sub_group_start,
                    sub_group_end: qOptions?.sub_group_end,
                  };
                })
            };
          }) as QuestionGroup[];
        });

        setQuestionGroups(newQuestionGroups as unknown as Record<number, QuestionGroup[]>);
      }
    } catch (error) {
      console.error('Error fetching test:', error);
      toast.error('Failed to load test data');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let savedTestId = testId;

      // Save test
      if (isEditing) {
        const { error } = await supabase
          .from('reading_tests')
          .update(testData)
          .eq('id', testId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('reading_tests')
          .insert(testData)
          .select()
          .single();
        if (error) throw error;
        savedTestId = data.id;
      }

      // Save passages and paragraphs
      for (const passage of passages) {
        let passageId = passage.id;

        // Build content from paragraphs
        const content = passage.paragraphs
          .map(p => `${p.label} ${p.content}`)
          .join('\n\n');

        const passageData = {
          test_id: savedTestId,
          passage_number: passage.passage_number,
          title: passage.title,
          content: content || 'No content',
          show_labels: passage.show_labels !== false
        };

        if (passage.id) {
          const { error } = await supabase
            .from('reading_passages')
            .update(passageData)
            .eq('id', passage.id);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from('reading_passages')
            .insert([passageData as any])
            .select()
            .single();
          if (error) throw error;
          passageId = data.id;
        }

        // Save paragraphs
        if (passageId) {
          // Delete existing paragraphs
          await supabase
            .from('reading_paragraphs')
            .delete()
            .eq('passage_id', passageId);

          // Insert new paragraphs
          if (passage.paragraphs.length > 0) {
            const { error } = await supabase
              .from('reading_paragraphs')
              .insert(
                passage.paragraphs.map(p => ({
                  passage_id: passageId,
                  label: p.label,
                  content: p.content,
                  is_heading: p.is_heading,
                  order_index: p.order_index
                }))
              );
            if (error) throw error;
          }

          // Save question groups and questions
          const passageIdx = passages.indexOf(passage);
          const groups = questionGroups[passageIdx] || [];

          // Delete existing groups and questions
          await supabase
            .from('reading_question_groups')
            .delete()
            .eq('passage_id', passageId);
          await supabase
            .from('reading_questions')
            .delete()
            .eq('passage_id', passageId);

          for (const group of groups) {
            // Build options object based on question type
            let optionsToSave: any = group.options;
            if (group.question_type === 'MATCHING_HEADINGS') {
              optionsToSave = {
                headings: group.options,
                paragraph_answers: group.questions.reduce((acc, q) => {
                  acc[q.question_text] = q.correct_answer;
                  return acc;
                }, {} as Record<string, string>)
              };
            } else if (group.question_type === 'MULTIPLE_CHOICE_MULTIPLE') {
              // For MCQ Multiple, max_answers equals the question range
              const calculatedMaxAnswers = group.end_question - group.start_question + 1;
              optionsToSave = {
                options: group.options,
                max_answers: calculatedMaxAnswers,
                option_format: group.option_format || 'A'
              };
            } else if (group.question_type === 'FILL_IN_BLANK') {
              // Include title options and note-style settings for fill-in-blank
              optionsToSave = {
                options: group.options || [],
                group_title: group.group_title || '',
                title_centered: group.title_centered || false,
                title_colored: group.title_colored || false,
                note_style_enabled: group.note_style_enabled || false,
                note_categories: group.note_categories || []
              };
            } else if (group.question_type === 'MATCHING_INFORMATION' || group.question_type === 'TABLE_SELECTION') {

              // Include letter headings options for matching grid
              optionsToSave = {
                options: group.options || [],
                use_letter_headings: group.use_letter_headings || false,
                options_title: group.options_title || ''
              };
            } else if (group.question_type === 'MATCHING_FEATURES') {
              // Include options_title for matching features
              optionsToSave = {
                options: group.options || [],
                options_title: group.options_title || ''
              };
            } else if (group.question_type === 'MAP_LABELING' && group.map_labeling_options) {
              // Store all map labeling data in options
              optionsToSave = {
                imageUrl: group.map_labeling_options.imageUrl,
                dropZones: group.map_labeling_options.dropZones || [],
                options: group.map_labeling_options.options || [],
                correctAnswers: group.map_labeling_options.correctAnswers || {},
                maxImageWidth: group.map_labeling_options.maxImageWidth,
                maxImageHeight: group.map_labeling_options.maxImageHeight
              };
            }

            const { data: savedGroup, error: groupError } = await supabase
              .from('reading_question_groups')
              .insert({
                passage_id: passageId,
                question_type: group.question_type,
                instruction: group.instruction,
                start_question: group.start_question,
                end_question: group.end_question,
                options: optionsToSave,
                display_as_paragraph: group.display_as_paragraph || false,
                show_bullets: group.show_bullets || false,
                show_headings: group.show_headings || false,
                use_dropdown: group.use_dropdown || false
              })
              .select()
              .single();

            if (groupError) throw groupError;

            // Special handling for TABLE_COMPLETION questions
            if (group.question_type === 'TABLE_COMPLETION' && group.table_data) {
              const tableData = group.table_data;
              const allCorrectAnswers: string[] = [];
              
              // Extract correct answers from table_data only for cells that have a question
              const rows = Array.isArray(tableData) ? tableData : tableData.rows;
              rows.forEach((row: any[]) => {
                row.forEach((cell: any) => {
                  if (cell.has_question && cell.correct_answer) {
                    allCorrectAnswers.push(cell.correct_answer);
                  }
                });
              });

              const { error: qError } = await supabase
                .from('reading_questions')
                .insert({
                  passage_id: passageId,
                  question_group_id: savedGroup.id,
                  question_number: group.start_question,
                  question_type: group.question_type,
                  question_text: group.instruction || 'Complete the table below.',
                  correct_answer: allCorrectAnswers.join(' / '), // Aggregate all gap answers
                  instruction: group.instruction,
                  option_format: null,
                  heading: null,
                  table_data: tableData as unknown as Json, // Save the full table data
                  options: null,
                });
              if (qError) throw qError;
            } 
            // Save regular questions
            else if (group.questions.length > 0) {
              const { error: qError } = await supabase
                .from('reading_questions')
                .insert(
                  group.questions.map(q => ({
                    passage_id: passageId,
                    question_group_id: savedGroup.id,
                    question_number: q.question_number,
                    question_type: group.question_type,
                    question_text: q.question_text,
                    // Store sub-group range in options for MCQ Multiple
                    options: group.question_type === 'MULTIPLE_CHOICE_MULTIPLE' && (q.sub_group_start || q.sub_group_end)
                      ? {
                          options: q.options || [],
                          sub_group_start: q.sub_group_start,
                          sub_group_end: q.sub_group_end
                        }
                      : q.options,
                    correct_answer: q.correct_answer,
                    instruction: group.instruction,
                    option_format: q.option_format || 'A',
                    heading: q.heading || null
                  }))
                );
              if (qError) throw qError;
            }
          }
        }
      }

      // Clear draft after successful save
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      toast.success(isEditing ? 'Test updated successfully' : 'Test created successfully');
      navigate('/admin/reading');
    } catch (error) {
      console.error('Error saving test:', error);
      toast.error('Failed to save test');
    } finally {
      setSaving(false);
    }
  };

  const addPassage = () => {
    const newPassageNumber = passages.length + 1;
    setPassages([...passages, { 
      passage_number: newPassageNumber, 
      title: '', 
      paragraphs: [] 
    }]);
    setQuestionGroups({
      ...questionGroups,
      [passages.length]: []
    });
  };

  const updatePassage = (index: number, updates: Partial<Passage>) => {
    const newPassages = [...passages];
    newPassages[index] = { ...newPassages[index], ...updates };
    setPassages(newPassages);
  };

  const removePassage = (index: number) => {
    if (passages.length <= 1) return;
    const newPassages = passages.filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, passage_number: i + 1 }));
    setPassages(newPassages);
    
    const newGroups = { ...questionGroups };
    delete newGroups[index];
    // Reindex groups
    const reindexedGroups: Record<number, QuestionGroup[]> = {};
    Object.keys(newGroups).forEach((key, i) => {
      reindexedGroups[i] = newGroups[parseInt(key)];
    });
    setQuestionGroups(reindexedGroups);
  };

  const updateQuestionGroups = (passageIndex: number, groups: QuestionGroup[]) => {
    setQuestionGroups({
      ...questionGroups,
      [passageIndex]: groups
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/reading')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading">
              {isEditing ? 'Edit Reading Test' : 'Create Reading Test'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update test details and questions' : 'Add a new IELTS reading test'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {autoSaveStatus === 'saved' && (
              <>
                <Cloud size={16} className="text-green-500" />
                <span>Draft saved</span>
              </>
            )}
            {autoSaveStatus === 'saving' && (
              <>
                <Cloud size={16} className="text-yellow-500 animate-pulse" />
                <span>Saving...</span>
              </>
            )}
            {autoSaveStatus === 'unsaved' && (
              <>
                <CloudOff size={16} className="text-orange-500" />
                <span>Unsaved changes</span>
              </>
            )}
          </div>
          <FullTestPreview
            testTitle={testData.title}
            timeLimit={testData.time_limit}
            passages={passages}
            questionGroups={questionGroups}
          />
          <Button onClick={handleSave} disabled={saving}>
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Test'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Test Details</TabsTrigger>
          <TabsTrigger value="passages">Passages</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        {/* Test Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <Select
                    value={testData.test_type}
                    onValueChange={(value) => setTestData({ ...testData, test_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="general">General Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Book Name</Label>
                  <Input
                    value={testData.book_name}
                    onChange={(e) => setTestData({ ...testData, book_name: e.target.value })}
                    placeholder="e.g., Cambridge IELTS 18"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Number</Label>
                  <Input
                    type="number"
                    value={testData.test_number}
                    onChange={(e) => setTestData({ ...testData, test_number: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Title</Label>
                  <Input
                    value={testData.title}
                    onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                    placeholder="e.g., Reading Test 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={testData.time_limit}
                    onChange={(e) => setTestData({ ...testData, time_limit: parseInt(e.target.value) || 60 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Questions</Label>
                  <Input
                    type="number"
                    value={testData.total_questions}
                    onChange={(e) => setTestData({ ...testData, total_questions: parseInt(e.target.value) || 40 })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={testData.is_published}
                  onCheckedChange={(checked) => setTestData({ ...testData, is_published: checked })}
                />
                <Label>Published</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Passages Tab */}
        <TabsContent value="passages">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Passages ({passages.length})</h3>
              <Button onClick={addPassage} variant="outline" size="sm">
                <Plus size={16} className="mr-1" />
                Add Passage
              </Button>
            </div>

            <div className="flex gap-2 mb-4">
              {passages.map((_, idx) => (
                <Button
                  key={idx}
                  variant={activePassage === idx ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePassage(idx)}
                >
                  Passage {idx + 1}
                </Button>
              ))}
            </div>

            {passages[activePassage] && (
              <PassageEditor
                passage={passages[activePassage]}
                onUpdate={(updates) => updatePassage(activePassage, updates)}
                onRemove={() => removePassage(activePassage)}
                canRemove={passages.length > 1}
              />
            )}
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              {passages.map((_, idx) => (
                <Button
                  key={idx}
                  variant={activePassage === idx ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePassage(idx)}
                >
                  Passage {idx + 1}
                </Button>
              ))}
            </div>

            <QuestionGroupEditor
              testId={testId || ''}
              passageIndex={activePassage}
              paragraphLabels={passages[activePassage]?.paragraphs?.filter(p => p.is_heading).map(p => p.label) || []}
              allParagraphLabels={passages[activePassage]?.paragraphs?.map(p => p.label) || []}
              questionGroups={questionGroups[activePassage] || []}
              onUpdate={(groups) => updateQuestionGroups(activePassage, groups)}
              questionTypes={QUESTION_TYPES}
              globalQuestionOffset={
                // Calculate total questions from all previous passages
                Object.entries(questionGroups)
                  .filter(([idx]) => Number(idx) < activePassage)
                  .reduce((total, [, groups]) => {
                    const maxQ = groups.reduce((max, g) => Math.max(max, g.end_question), 0);
                    return Math.max(total, maxQ);
                  }, 0)
              }
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
