import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft, Cloud, CloudOff, Headphones } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ListeningAudioUploader } from '@/components/admin/ListeningAudioUploader';
import { 
  ListeningQuestionGroupEditor,
  TableData, // Imported from ListeningQuestionGroupEditor
  QuestionGroup // Imported from ListeningQuestionGroupEditor
} from '@/components/admin/ListeningQuestionGroupEditor';
import { FullListeningTestPreview } from '@/components/admin/FullListeningTestPreview';
import { Json } from '@/integrations/supabase/types'; // Import Json type

interface PartTimestamp {
  partNumber: number;
  startTime: number;
  endTime: number;
}

interface TestData {
  id?: string;
  title: string;
  book_name: string;
  test_number: number;
  time_limit: number;
  total_questions: number;
  is_published: boolean;
  audio_url: string | null;
  audio_url_part1?: string | null;
  audio_url_part2?: string | null;
  audio_url_part3?: string | null;
  audio_url_part4?: string | null;
  transcript_part1?: string | null;
  transcript_part2?: string | null;
  transcript_part3?: string | null;
  transcript_part4?: string | null;
  part_timestamps?: PartTimestamp[];
  test_type?: string;
}

const TEST_TYPES = [
  { value: 'academic', label: 'Cambridge Academic' },
  { value: 'general', label: 'Cambridge General' },
  { value: 'model', label: 'Model Test' },
  { value: 'other', label: 'Other' },
];

// Removed local definitions for Question, TableRow, TableData, QuestionGroup
// as they are now imported from ListeningQuestionGroupEditor.tsx

const LOCAL_STORAGE_KEY = 'listening_test_draft';

// Define question ranges for each part of the listening test
const LISTENING_PART_RANGES = [
  { label: 'Part 1', start: 1, end: 10 },
  { label: 'Part 2', start: 11, end: 20 },
  { label: 'Part 3', start: 21, end: 30 },
  { label: 'Part 4', start: 31, end: 40 },
];

export default function ListeningTestEditor() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!testId;

  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeTab, setActiveTab] = useState('details');
  const [activePart, setActivePart] = useState(0); // 0 for Part 1, 1 for Part 2, etc.
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const [testData, setTestData] = useState<TestData>({
    title: '',
    book_name: 'Cambridge IELTS',
    test_number: 1,
    time_limit: 30, // Default for listening
    total_questions: 40,
    is_published: false,
    audio_url: null,
    test_type: 'academic',
    part_timestamps: [
      { partNumber: 1, startTime: 0, endTime: 600 },
      { partNumber: 2, startTime: 600, endTime: 1200 },
      { partNumber: 3, startTime: 1200, endTime: 1800 },
      { partNumber: 4, startTime: 1800, endTime: 2400 },
    ],
  });
  
  // Timestamps handling available through testData.part_timestamps

  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]); // This now holds ALL groups

  // Load from localStorage on mount (for draft recovery)
  useEffect(() => {
    if (!isEditing) {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.testData) setTestData(draft.testData);
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
      const draft = { testData, questionGroups, savedAt: Date.now() };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
      setAutoSaveStatus('saved');
    }
  }, [testData, questionGroups, isEditing]);

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
  }, [testData, questionGroups, autoSaveToLocal]);

  useEffect(() => {
    if (isEditing) {
      fetchTestData();
    }
  }, [testId]);

  const fetchTestData = async () => {
    try {
      // Fetch test
      const { data: test, error: testError } = await supabase
        .from('listening_tests')
        .select('*')
        .eq('id', testId!)
        .single();

      if (testError) throw testError;
      setTestData(test);

      // Fetch question groups and questions
      const { data: groupsData, error: groupsError } = await supabase
        .from('listening_question_groups')
        .select('*, listening_questions(*)')
        .eq('test_id', testId!)
        .order('start_question');

      if (groupsError) throw groupsError;

      const formattedGroups = (groupsData || []).map(g => {
        let groupOptions: any = g.options;

        // Ensure options are correctly parsed from JSON
        if (
          g.question_type === 'MATCHING_CORRECT_LETTER' ||
          g.question_type === 'MAPS' ||
          g.question_type === 'MULTIPLE_CHOICE_MULTIPLE' ||
          g.question_type === 'DRAG_AND_DROP_OPTIONS'
        ) {
          // If options is a string array, convert to object for backward compatibility
          if (Array.isArray(groupOptions)) {
            groupOptions = { type: g.question_type, options: groupOptions, option_format: 'A' };
          }
        } else if (g.question_type === 'MAP_LABELING') {
          // MAP_LABELING stores structured options - keep as object
          if (!(groupOptions && typeof groupOptions === 'object' && !Array.isArray(groupOptions))) {
            groupOptions = {
              type: 'map_labeling',
              imageUrl: null,
              dropZones: [],
              options: [],
              correctAnswers: {},
              maxImageWidth: 450,
              maxImageHeight: 400,
            };
          }
        } else if (g.question_type === 'FLOWCHART_COMPLETION') {
          // FLOWCHART_COMPLETION stores structured options - keep as object
          if (!(groupOptions && typeof groupOptions === 'object' && !Array.isArray(groupOptions))) {
            groupOptions = {
              type: 'flowchart_completion',
              title: '',
              steps: [],
              options: [],
              correctAnswers: {},
            };
          }
        } else if (g.question_type === 'FILL_IN_BLANK') {
          // FILL_IN_BLANK may store note-style layout settings as an object in `options`
          // (e.g., { display_mode: 'note_style', noteCategories: [...] }).
          if (groupOptions && typeof groupOptions === 'object' && !Array.isArray(groupOptions)) {
            // keep as-is
          } else if (Array.isArray(groupOptions)) {
            // keep array as-is
          } else {
            groupOptions = [];
          }
        } else if (Array.isArray(groupOptions)) {
          // For other types, if it's an array, keep it as is
        } else {
          // If it's an object but not matching types, or null, default to empty array
          groupOptions = [];
        }

        return {
          ...g,
          questions: (g.listening_questions || []).map(q => ({
            id: q.id,
            question_number: q.question_number,
            question_type: g.question_type, // Get from group
            question_text: q.question_text,
            correct_answer: q.correct_answer,
            instruction: g.instruction, // Get from group
            group_id: q.group_id, // Get from question
            is_given: q.is_given,
            heading: q.heading,
            table_data: q.table_data as unknown as TableData | undefined, // Cast table_data
            options: Array.isArray(q.options) ? (q.options as string[]) : null, // Ensure options is string[]
            option_format: q.option_format || 'A',
          })).sort((a, b) => a.question_number - b.question_number),
          options: groupOptions, // Use the parsed groupOptions
          option_format: (groupOptions as any)?.option_format || 'A', // Extract option_format if present
          num_sub_questions: (groupOptions as any)?.num_sub_questions || 2, // Extract num_sub_questions if present
        };
      });
      setQuestionGroups(formattedGroups as QuestionGroup[]);

    } catch (error) {
      console.error('Error fetching listening test:', error);
      toast.error('Failed to load listening test data');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let savedTestId = testId;

      // Prepare test data for saving - exclude part_timestamps which doesn't exist in DB
      const { part_timestamps, ...testDataToSave } = testData;

      // Save test (audio is optional - can be added later)
      if (isEditing) {
        const { error } = await supabase
          .from('listening_tests')
          .update(testDataToSave)
          .eq('id', testId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('listening_tests')
          .insert(testDataToSave)
          .select()
          .single();
        if (error) throw error;
        savedTestId = data.id;
      }

      // Save question groups and questions
      if (savedTestId) {
        // Delete existing groups and questions for this test
        // First, get all group IDs associated with this test
        const { data: existingGroupIds, error: fetchGroupsError } = await supabase
          .from('listening_question_groups')
          .select('id')
          .eq('test_id', savedTestId);

        if (fetchGroupsError) throw fetchGroupsError;
        const groupIdsToDelete = existingGroupIds.map(g => g.id);

        if (groupIdsToDelete.length > 0) {
          await supabase.from('listening_questions').delete().in('group_id', groupIdsToDelete);
          await supabase.from('listening_question_groups').delete().in('id', groupIdsToDelete);
        }

        for (const group of questionGroups) { // Iterate over ALL groups
          // Prepare group options for saving
          let groupOptionsToSave: Json | null = null;

          if (group.question_type === 'MATCHING_CORRECT_LETTER') {
            groupOptionsToSave = {
              type: 'matching_correct_letter',
              options: group.options?.options || [],
              option_format: group.options?.option_format || 'A',
            };
          } else if (group.question_type === 'MAPS') {
            groupOptionsToSave = {
              type: 'maps',
              imageUrl: group.options?.imageUrl || null,
              option_letters: group.options?.option_letters || [],
              maxImageWidth: group.options?.maxImageWidth || null,
              maxImageHeight: group.options?.maxImageHeight || null,
            };
          } else if (group.question_type === 'MULTIPLE_CHOICE_MULTIPLE') {
            groupOptionsToSave = {
              type: 'multiple_choice_multiple',
              options: group.options?.options || [],
              option_format: group.options?.option_format || 'A',
              num_sub_questions: group.num_sub_questions || 2,
            };
          } else if (group.question_type === 'DRAG_AND_DROP_OPTIONS') {
            groupOptionsToSave = {
              type: 'drag_and_drop_options',
              options: group.options?.options || [],
              option_format: group.options?.option_format || 'A',
            };
          } else if (group.question_type === 'MAP_LABELING') {
            groupOptionsToSave = {
              type: 'map_labeling',
              imageUrl: group.options?.imageUrl || null,
              dropZones: group.options?.dropZones || [],
              options: group.options?.options || [],
              correctAnswers: group.options?.correctAnswers || {},
              maxImageWidth: group.options?.maxImageWidth || null,
              maxImageHeight: group.options?.maxImageHeight || null,
            };
          } else if (group.question_type === 'FLOWCHART_COMPLETION') {
            groupOptionsToSave = {
              type: 'flowchart_completion',
              title: group.options?.title || '',
              steps: group.options?.steps || [],
              options: group.options?.options || [],
              correctAnswers: group.options?.correctAnswers || {},
            };
          } else if (
            group.question_type === 'FILL_IN_BLANK' &&
            group.options &&
            typeof group.options === 'object' &&
            !Array.isArray(group.options)
          ) {
            // Persist note-style layout settings in listening_question_groups.options
            groupOptionsToSave = group.options as Json;
          } else if (Array.isArray(group.options) && group.options.length > 0) {
            groupOptionsToSave = group.options;
          }

          const { data: savedGroup, error: groupError } = await supabase
            .from('listening_question_groups')
            .insert({
              test_id: savedTestId,
              question_type: group.question_type,
              instruction: group.instruction,
              start_question: group.start_question,
              end_question: group.end_question,
              options: groupOptionsToSave,
              start_timestamp_seconds: group.start_timestamp_seconds ?? 0,
              group_heading: group.group_heading || null,
              group_heading_alignment: group.group_heading_alignment || 'center',
            })
            .select()
            .single();

          if (groupError) throw groupError;

          // Save questions
          if (group.questions.length > 0) {
            // Special handling for TABLE_COMPLETION questions
            if (group.question_type === 'TABLE_COMPLETION' && group.questions[0]?.table_data) {
              const tableQuestion = group.questions[0];
              const tableData = tableQuestion.table_data!;
              const allCorrectAnswers: string[] = [];
              
              // Extract correct answers from table_data only for cells that have a question
              // Handle both old array format and new object format
              const rows = Array.isArray(tableData) ? tableData : tableData.rows;
              rows.forEach((row: any[]) => {
                row.forEach((cell: any) => {
                  if (cell.has_question && cell.correct_answer) {
                    allCorrectAnswers.push(cell.correct_answer);
                  }
                });
              });

              const { error: qError } = await supabase
                .from('listening_questions')
                .insert({
                  group_id: savedGroup.id,
                  question_number: tableQuestion.question_number,
                  question_text: tableQuestion.question_text, // General instruction for the table
                  correct_answer: allCorrectAnswers.join(' / '), // Aggregate all gap answers
                  is_given: tableQuestion.is_given,
                  heading: tableQuestion.heading,
                  table_data: tableQuestion.table_data as unknown as Json, // Save the full table data
                  options: null, // Ensure null for non-MCQ questions
                  option_format: null, // Ensure null for non-MCQ questions
                });
              if (qError) throw qError;

            } else if (group.question_type === 'MAP_LABELING') {
              // For MAP_LABELING, get correct_answer from group.options.correctAnswers map
              const correctAnswersMap = group.options?.correctAnswers || {};
              const { error: qError } = await supabase
                .from('listening_questions')
                .insert(
                  group.questions.map(q => ({
                    group_id: savedGroup.id,
                    question_number: q.question_number,
                    question_text: q.question_text || `Label for question ${q.question_number}`,
                    correct_answer: correctAnswersMap[q.question_number] || '',
                    is_given: q.is_given,
                    heading: q.heading,
                    table_data: null,
                    options: null,
                    option_format: null,
                  }))
                );
              if (qError) throw qError;

            } else if (group.question_type === 'FLOWCHART_COMPLETION') {
              // For FLOWCHART_COMPLETION, get correct_answer from group.options.correctAnswers map
              const correctAnswersMap = group.options?.correctAnswers || {};
              const steps = group.options?.steps || [];
              // Build questions from steps with blanks
              const flowchartQuestions = steps
                .filter((s: any) => s.hasBlank && s.blankNumber)
                .map((s: any) => ({
                  group_id: savedGroup.id,
                  question_number: s.blankNumber,
                  question_text: s.text || '',
                  correct_answer: correctAnswersMap[s.blankNumber] || '',
                  is_given: false,
                  heading: null,
                  table_data: null,
                  options: null,
                  option_format: null,
                }));
              
              if (flowchartQuestions.length > 0) {
                const { error: qError } = await supabase
                  .from('listening_questions')
                  .insert(flowchartQuestions);
                if (qError) throw qError;
              }

            } else { // Standard questions (e.g., FILL_IN_BLANK, MATCHING_CORRECT_LETTER, MAPS, MULTIPLE_CHOICE_SINGLE, MULTIPLE_CHOICE_MULTIPLE)
              const { error: qError } = await supabase
                .from('listening_questions')
                .insert(
                  group.questions.map(q => ({
                    group_id: savedGroup.id,
                    question_number: q.question_number,
                    question_text: q.question_text,
                    correct_answer: q.correct_answer,
                    is_given: q.is_given,
                    heading: q.heading,
                    table_data: null, // Ensure table_data is null for non-table questions
                    options: q.options || null, // Save question-level options if any
                    option_format: q.option_format || null, // Save question-level option format if any
                  }))
                );
              if (qError) throw qError;
            }
          }
        }
      }

      // Clear draft after successful save
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      toast.success(isEditing ? 'Listening test updated successfully' : 'Listening test created successfully');
      navigate('/admin/listening');
    } catch (error: any) { // Explicitly type error as any for easier access to message
      console.error('Error saving listening test:', error);
      toast.error(`Failed to save listening test: ${error.message || 'Unknown error'}`); // Add error message
    } finally {
      setSaving(false);
    }
  };

  const handleAudioUploadSuccess = (url: string) => {
    setTestData(prev => ({ ...prev, audio_url: url }));
    toast.success('Audio URL updated in test data.');
  };

  const handleAudioRemoveSuccess = () => {
    setTestData(prev => ({ ...prev, audio_url: null }));
    toast.success('Audio URL removed from test data.');
  };



  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/listening')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading">
              {isEditing ? 'Edit Listening Test' : 'Create Listening Test'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update test details, audio, and questions' : 'Add a new IELTS listening test'}
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
          <FullListeningTestPreview
            testTitle={testData.title}
            timeLimit={testData.time_limit}
            questionGroups={questionGroups}
            audioUrl={testData.audio_url}
            audioUrlPart1={testData.audio_url_part1}
            audioUrlPart2={testData.audio_url_part2}
            audioUrlPart3={testData.audio_url_part3}
            audioUrlPart4={testData.audio_url_part4}
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
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        {/* Test Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Book Name</Label>
                  <Input
                    value={testData.book_name}
                    onChange={(e) => setTestData({ ...testData, book_name: e.target.value })}
                    placeholder="e.g., Cambridge IELTS 18"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Number</Label>
                  <Input
                    type="number"
                    value={testData.test_number}
                    onChange={(e) => setTestData({ ...testData, test_number: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Test Title</Label>
                <Input
                  value={testData.title}
                  onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                  placeholder="e.g., Listening Test 1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={testData.time_limit}
                    onChange={(e) => setTestData({ ...testData, time_limit: parseInt(e.target.value) || 30 })}
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

              <div className="space-y-2">
                <Label>Test Type</Label>
                <Select
                  value={testData.test_type || 'academic'}
                  onValueChange={(value) => setTestData({ ...testData, test_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEST_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        {/* Audio Tab */}
        <TabsContent value="audio">
          <div className="space-y-6">
            {/* Multi-Part Audio Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones size={20} />
                  Multi-Part Audio (Recommended)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Upload separate audio files for each part of the listening test. This allows users to navigate between parts.
                </p>
                
                {/* Part 1 */}
                <div className="space-y-2">
                  <Label className="font-semibold">Part 1 Audio (Questions 1-10)</Label>
                  <ListeningAudioUploader
                    testId={`${testData.id || 'new-test'}-part1`}
                    currentAudioUrl={testData.audio_url_part1 || null}
                    onUploadSuccess={(url) => setTestData(prev => ({ ...prev, audio_url_part1: url }))}
                    onRemoveSuccess={() => setTestData(prev => ({ ...prev, audio_url_part1: null }))}
                  />
                  {testData.audio_url_part1 && (
                    <audio controls src={testData.audio_url_part1} className="w-full mt-2" />
                  )}
                </div>

                {/* Part 2 */}
                <div className="space-y-2">
                  <Label className="font-semibold">Part 2 Audio (Questions 11-20)</Label>
                  <ListeningAudioUploader
                    testId={`${testData.id || 'new-test'}-part2`}
                    currentAudioUrl={testData.audio_url_part2 || null}
                    onUploadSuccess={(url) => setTestData(prev => ({ ...prev, audio_url_part2: url }))}
                    onRemoveSuccess={() => setTestData(prev => ({ ...prev, audio_url_part2: null }))}
                  />
                  {testData.audio_url_part2 && (
                    <audio controls src={testData.audio_url_part2} className="w-full mt-2" />
                  )}
                </div>

                {/* Part 3 */}
                <div className="space-y-2">
                  <Label className="font-semibold">Part 3 Audio (Questions 21-30)</Label>
                  <ListeningAudioUploader
                    testId={`${testData.id || 'new-test'}-part3`}
                    currentAudioUrl={testData.audio_url_part3 || null}
                    onUploadSuccess={(url) => setTestData(prev => ({ ...prev, audio_url_part3: url }))}
                    onRemoveSuccess={() => setTestData(prev => ({ ...prev, audio_url_part3: null }))}
                  />
                  {testData.audio_url_part3 && (
                    <audio controls src={testData.audio_url_part3} className="w-full mt-2" />
                  )}
                </div>

                {/* Part 4 */}
                <div className="space-y-2">
                  <Label className="font-semibold">Part 4 Audio (Questions 31-40)</Label>
                  <ListeningAudioUploader
                    testId={`${testData.id || 'new-test'}-part4`}
                    currentAudioUrl={testData.audio_url_part4 || null}
                    onUploadSuccess={(url) => setTestData(prev => ({ ...prev, audio_url_part4: url }))}
                    onRemoveSuccess={() => setTestData(prev => ({ ...prev, audio_url_part4: null }))}
                  />
                  {testData.audio_url_part4 && (
                    <audio controls src={testData.audio_url_part4} className="w-full mt-2" />
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Legacy: Single Audio File */}
            <Card className="border-dashed opacity-75">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <Headphones size={20} />
                  Single Audio File (Legacy)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Use this if you have a single combined audio file. Multi-part audio above is recommended for better user experience.
                </p>
                <ListeningAudioUploader
                  testId={testData.id || 'new-test'}
                  currentAudioUrl={testData.audio_url}
                  onUploadSuccess={handleAudioUploadSuccess}
                  onRemoveSuccess={handleAudioRemoveSuccess}
                />
                {testData.audio_url && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-md">
                    <audio controls src={testData.audio_url} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transcripts Tab */}
        <TabsContent value="transcripts">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audio Transcripts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Add transcripts for each part of the listening test. These will be shown to test-takers after they complete the test.
                </p>
                
                {/* Part 1 Transcript */}
                <div className="space-y-2">
                  <Label className="font-semibold">Part 1 Transcript</Label>
                  <Textarea
                    value={testData.transcript_part1 || ''}
                    onChange={(e) => setTestData(prev => ({ ...prev, transcript_part1: e.target.value }))}
                    placeholder="Enter the transcript for Part 1..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Part 2 Transcript */}
                <div className="space-y-2">
                  <Label className="font-semibold">Part 2 Transcript</Label>
                  <Textarea
                    value={testData.transcript_part2 || ''}
                    onChange={(e) => setTestData(prev => ({ ...prev, transcript_part2: e.target.value }))}
                    placeholder="Enter the transcript for Part 2..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Part 3 Transcript */}
                <div className="space-y-2">
                  <Label className="font-semibold">Part 3 Transcript</Label>
                  <Textarea
                    value={testData.transcript_part3 || ''}
                    onChange={(e) => setTestData(prev => ({ ...prev, transcript_part3: e.target.value }))}
                    placeholder="Enter the transcript for Part 3..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Part 4 Transcript */}
                <div className="space-y-2">
                  <Label className="font-semibold">Part 4 Transcript</Label>
                  <Textarea
                    value={testData.transcript_part4 || ''}
                    onChange={(e) => setTestData(prev => ({ ...prev, transcript_part4: e.target.value }))}
                    placeholder="Enter the transcript for Part 4..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              {LISTENING_PART_RANGES.map((part, idx) => (
                <Button
                  key={idx}
                  variant={activePart === idx ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePart(idx)}
                >
                  {part.label} ({part.start}-{part.end})
                </Button>
              ))}
            </div>

            <ListeningQuestionGroupEditor
              testId={testData.id || 'new-test'}
              allQuestionGroups={questionGroups} // Pass ALL groups
              onUpdateAllGroups={setQuestionGroups} // Update ALL groups
              activePart={activePart}
              partRanges={LISTENING_PART_RANGES}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}