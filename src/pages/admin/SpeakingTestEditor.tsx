import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft, Cloud, CloudOff } from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Tables, TablesInsert } from '@/integrations/supabase/types';


import { SpeakingPart1Editor, SpeakingQuestion as Part1Question } from '@/components/admin/SpeakingPart1Editor';
import { SpeakingPart2Editor, SpeakingPart2Data } from '@/components/admin/SpeakingPart2Editor';
import { SpeakingPart3Editor, SpeakingQuestion as Part3Question } from '@/components/admin/SpeakingPart3Editor';

type SpeakingTestRecord = Tables<'speaking_tests'>;

const LOCAL_STORAGE_KEY = 'speaking_test_draft';

export default function SpeakingTestEditor() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!testId;

  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeTab, setActiveTab] = useState('details');
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const [testData, setTestData] = useState<Partial<SpeakingTestRecord>>({
    name: '',
    test_type: 'academic',
    description: null,
    is_published: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // State for Part 1
  const [part1Questions, setPart1Questions] = useState<Part1Question[]>([]);
  const [part1GroupTimeLimit, setPart1GroupTimeLimit] = useState(30); // Default 30s per question

  // State for Part 2
  const [part2Data, setPart2Data] = useState<SpeakingPart2Data>({
    cue_card_topic: '',
    cue_card_content: '',
    preparation_time_seconds: 60,
    speaking_time_seconds: 120,
  });

  // State for Part 3
  const [part3Questions, setPart3Questions] = useState<Part3Question[]>([]);
  const [part3GroupTimeLimit, setPart3GroupTimeLimit] = useState(60); // Default 60s per question
  const [part3TotalTimeLimit, setPart3TotalTimeLimit] = useState(300); // Default 5 minutes (300s)
  const [part3MinRequiredQuestions, setPart3MinRequiredQuestions] = useState(4); // Default 4 required

  // Load from localStorage on mount (for draft recovery)
  useEffect(() => {
    if (!isEditing) {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.testData) setTestData(draft.testData);
          if (draft.part1Questions) setPart1Questions(draft.part1Questions);
          if (draft.part1GroupTimeLimit) setPart1GroupTimeLimit(draft.part1GroupTimeLimit);
          if (draft.part2Data) setPart2Data(draft.part2Data);
          if (draft.part3Questions) setPart3Questions(draft.part3Questions);
          if (draft.part3GroupTimeLimit) setPart3GroupTimeLimit(draft.part3GroupTimeLimit);
          if (draft.part3TotalTimeLimit) setPart3TotalTimeLimit(draft.part3TotalTimeLimit);
          if (draft.part3MinRequiredQuestions) setPart3MinRequiredQuestions(draft.part3MinRequiredQuestions);
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
      const draft = {
        testData,
        part1Questions,
        part1GroupTimeLimit,
        part2Data,
        part3Questions,
        part3GroupTimeLimit,
        part3TotalTimeLimit,
        part3MinRequiredQuestions,
        savedAt: Date.now()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
      setAutoSaveStatus('saved');
    }
  }, [testData, part1Questions, part1GroupTimeLimit, part2Data, part3Questions, part3GroupTimeLimit, part3TotalTimeLimit, part3MinRequiredQuestions, isEditing]);

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
  }, [testData, part1Questions, part1GroupTimeLimit, part2Data, part3Questions, part3GroupTimeLimit, part3TotalTimeLimit, part3MinRequiredQuestions, autoSaveToLocal]);

  useEffect(() => {
    if (isEditing) {
      fetchTestData();
    }
  }, [testId]);

  const fetchTestData = async () => {
    try {
      // Fetch SpeakingTest
      const { data: test, error: testError } = await supabase
        .from('speaking_tests')
        .select('*')
        .eq('id', testId!)
        .single();

      if (testError) throw testError;
      setTestData(test);

      // Fetch question groups and questions
      const { data: groupsData, error: groupsError } = await supabase
        .from('speaking_question_groups')
        .select('*, speaking_questions(*)')
        .eq('test_id', testId!)
        .order('part_number')
        .order('order_index', { foreignTable: 'speaking_questions' });

      if (groupsError) throw groupsError;

      groupsData.forEach(group => {
        const questions = (group.speaking_questions || []).map(q => ({
          id: q.id,
          question_number: q.question_number,
          question_text: q.question_text,
          time_limit_seconds: group.time_limit_seconds || 0, // Use group's default if individual not stored
          is_required: q.is_required,
          order_index: q.order_index,
        })).sort((a, b) => a.order_index - b.order_index);

        if (group.part_number === 1) {
          setPart1Questions(questions);
          setPart1GroupTimeLimit(group.time_limit_seconds || 30);
        } else if (group.part_number === 2) {
          setPart2Data({
            cue_card_topic: group.cue_card_topic || '',
            cue_card_content: group.cue_card_content || '',
            preparation_time_seconds: group.preparation_time_seconds || 60,
            speaking_time_seconds: group.speaking_time_seconds || 120,
          });
        } else if (group.part_number === 3) {
          setPart3Questions(questions);
          setPart3GroupTimeLimit(group.time_limit_seconds || 60);
          setPart3TotalTimeLimit(group.total_part_time_limit_seconds || 300);
          setPart3MinRequiredQuestions(group.min_required_questions || 4);
        }
      });

    } catch (error) {
      console.error('Error fetching speaking test:', error);
      toast.error('Failed to load speaking test data');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let currentTestId = testData.id;

      // Basic validation
      if (!testData.name?.trim()) {
        toast.error('Test Name is required.');
        setSaving(false);
        setActiveTab('details');
        return;
      }
      if (part1Questions.length === 0) {
        toast.error('Part 1 must have at least one question.');
        setSaving(false);
        setActiveTab('part1');
        return;
      }
      if (!part2Data.cue_card_topic.trim() || !part2Data.cue_card_content.trim()) {
        toast.error('Part 2 requires a cue card topic and content.');
        setSaving(false);
        setActiveTab('part2');
        return;
      }
      if (part3Questions.length === 0) {
        toast.error('Part 3 must have at least one question.');
        setSaving(false);
        setActiveTab('part3');
        return;
      }
      if (part3MinRequiredQuestions > part3Questions.filter(q => q.is_required).length) {
        toast.error('Minimum required questions cannot exceed the number of actual required questions.');
        setSaving(false);
        setActiveTab('part3');
        return;
      }

      // 1. Save SpeakingTest
      if (isEditing && currentTestId) {
        const { error } = await supabase
          .from('speaking_tests')
          .update(testData)
          .eq('id', currentTestId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('speaking_tests')
          .insert(testData as TablesInsert<'speaking_tests'>)
          .select()
          .single();
        if (error) throw error;
        currentTestId = data.id;
        setTestData(data);
      }

      if (!currentTestId) {
        throw new Error('Failed to get speaking test ID.');
      }

      // 2. Delete existing groups and questions for this test
      const { data: existingGroupIds, error: fetchGroupsError } = await supabase
        .from('speaking_question_groups')
        .select('id')
        .eq('test_id', currentTestId);

      if (fetchGroupsError) throw fetchGroupsError;
      const groupIdsToDelete = existingGroupIds.map(g => g.id);

      if (groupIdsToDelete.length > 0) {
        await supabase.from('speaking_questions').delete().in('group_id', groupIdsToDelete);
        await supabase.from('speaking_question_groups').delete().in('id', groupIdsToDelete);
      }

      // 3. Save Part 1 Group and Questions
      const { data: savedPart1Group, error: part1GroupError } = await supabase
        .from('speaking_question_groups')
        .insert({
          test_id: currentTestId,
          part_number: 1,
          instruction: 'Answer the following questions.',
          time_limit_seconds: part1GroupTimeLimit,
        })
        .select()
        .single();
      if (part1GroupError) throw part1GroupError;

      if (part1Questions.length > 0) {
        const { error: part1QError } = await supabase
          .from('speaking_questions')
          .insert(part1Questions.map(q => ({
            group_id: savedPart1Group.id,
            question_number: q.question_number,
            question_text: q.question_text,
            is_required: true, // All Part 1 questions are required
            order_index: q.order_index,
          })));
        if (part1QError) throw part1QError;
      }

      // 4. Save Part 2 Group and Questions
      const { data: savedPart2Group, error: part2GroupError } = await supabase
        .from('speaking_question_groups')
        .insert({
          test_id: currentTestId,
          part_number: 2,
          instruction: 'You will have one minute to prepare, then speak for one to two minutes.',
          cue_card_topic: part2Data.cue_card_topic,
          cue_card_content: part2Data.cue_card_content,
          preparation_time_seconds: part2Data.preparation_time_seconds,
          speaking_time_seconds: part2Data.speaking_time_seconds,
        })
        .select()
        .single();
      if (part2GroupError) throw part2GroupError;

      // Part 2 typically has one "question" which is the cue card itself
      const { error: part2QError } = await supabase
        .from('speaking_questions')
        .insert({
          group_id: savedPart2Group.id,
          question_number: 1,
          question_text: part2Data.cue_card_topic, // Use topic as question text
          is_required: true,
          order_index: 0,
        });
      if (part2QError) throw part2QError;

      // 5. Save Part 3 Group and Questions
      const { data: savedPart3Group, error: part3GroupError } = await supabase
        .from('speaking_question_groups')
        .insert({
          test_id: currentTestId,
          part_number: 3,
          instruction: 'Answer the following questions.',
          time_limit_seconds: part3GroupTimeLimit,
          total_part_time_limit_seconds: part3TotalTimeLimit,
          min_required_questions: part3MinRequiredQuestions,
        })
        .select()
        .single();
      if (part3GroupError) throw part3GroupError;

      if (part3Questions.length > 0) {
        const { error: part3QError } = await supabase
          .from('speaking_questions')
          .insert(part3Questions.map(q => ({
            group_id: savedPart3Group.id,
            question_number: q.question_number,
            question_text: q.question_text,
            is_required: q.is_required,
            order_index: q.order_index,
          })));
        if (part3QError) throw part3QError;
      }

      // Clear draft after successful save
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      toast.success(isEditing ? 'Speaking test updated successfully' : 'Speaking test created successfully');
      navigate('/admin/speaking');
    } catch (error: any) {
      console.error('Error saving speaking test:', error);
      toast.error(`Failed to save speaking test: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/speaking')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading">
              {isEditing ? 'Edit Speaking Test' : 'Create Speaking Test'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update test details and questions for each part' : 'Add a new IELTS speaking test template'}
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
          <Button onClick={handleSave} disabled={saving}>
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Test'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Test Details</TabsTrigger>
          <TabsTrigger value="part1">Part 1</TabsTrigger>
          <TabsTrigger value="part2">Part 2</TabsTrigger>
          <TabsTrigger value="part3">Part 3</TabsTrigger>
        </TabsList>

        {/* Test Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Test Name</Label>
                <Input
                  value={testData.name}
                  onChange={(e) => setTestData({ ...testData, name: e.target.value })}
                  placeholder="e.g., Academic Test Set 1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <Select
                    value={testData.test_type}
                    onValueChange={(value) => setTestData({ ...testData, test_type: value as 'academic' | 'general' })}
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
                  <Label>Description (Optional)</Label>
                  <RichTextEditor
                    value={testData.description || ''}
                    onChange={(value) => setTestData({ ...testData, description: value })}
                    placeholder="e.g., A standard IELTS Academic speaking test."
                    rows={3}
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

        {/* Part 1 Tab */}
        <TabsContent value="part1">
          <SpeakingPart1Editor
            questions={part1Questions}
            onUpdateQuestions={setPart1Questions}
            groupTimeLimitSeconds={part1GroupTimeLimit}
            onUpdateGroupTimeLimit={setPart1GroupTimeLimit}
          />
        </TabsContent>

        {/* Part 2 Tab */}
        <TabsContent value="part2">
          <SpeakingPart2Editor
            data={part2Data}
            onUpdate={(updates) => setPart2Data(prev => ({ ...prev, ...updates }))}
          />
        </TabsContent>

        {/* Part 3 Tab */}
        <TabsContent value="part3">
          <SpeakingPart3Editor
            questions={part3Questions}
            onUpdateQuestions={setPart3Questions}
            groupTimeLimitSeconds={part3GroupTimeLimit}
            onUpdateGroupTimeLimit={setPart3GroupTimeLimit}
            totalPartTimeLimitSeconds={part3TotalTimeLimit}
            onUpdateTotalPartTimeLimit={setPart3TotalTimeLimit}
            minRequiredQuestions={part3MinRequiredQuestions}
            onUpdateMinRequiredQuestions={setPart3MinRequiredQuestions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}