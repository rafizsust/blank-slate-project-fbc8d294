import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft, Cloud, CloudOff, PenTool, Info, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { WritingImageUploader } from '@/components/admin/WritingImageUploader';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Define types for the new structure
type WritingTest = Tables<'writing_tests'>;
type WritingTask = Tables<'writing_tasks'>;


const LOCAL_STORAGE_KEY = 'writing_test_draft';

export default function WritingTestEditor() {
  const { testId } = useParams(); // Now using testId
  const navigate = useNavigate();
  const isEditing = !!testId;

  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeTab, setActiveTab] = useState('details');
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const [writingTest, setWritingTest] = useState<Partial<WritingTest>>({
    title: '',
    description: null,
    time_limit: 60, // Default to 60 minutes for the combined test
    is_published: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [task1, setTask1] = useState<Partial<WritingTask>>({
    writing_test_id: '',
    task_type: 'task1',
    instruction: 'You should spend about 20 minutes on this task.',
    text_content: null,
    image_url: null,
    image_width: null,
    image_height: null,
    word_limit_min: 150,
    word_limit_max: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [task2, setTask2] = useState<Partial<WritingTask>>({
    writing_test_id: '',
    task_type: 'task2',
    instruction: 'You should spend about 40 minutes on this task.',
    text_content: null,
    image_url: null,
    image_width: null,
    image_height: null,
    word_limit_min: 250,
    word_limit_max: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Load from localStorage on mount (for draft recovery)
  useEffect(() => {
    if (!isEditing) {
      const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.writingTest) setWritingTest(draft.writingTest);
          if (draft.task1) setTask1(draft.task1);
          if (draft.task2) setTask2(draft.task2);
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
      const draft = { writingTest, task1, task2, savedAt: Date.now() };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
      setAutoSaveStatus('saved');
    }
  }, [writingTest, task1, task2, isEditing]);

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
  }, [writingTest, task1, task2, autoSaveToLocal]);

  useEffect(() => {
    if (isEditing) {
      fetchTestData();
    }
  }, [testId]);

  const fetchTestData = async () => {
    try {
      // Fetch WritingTest
      const { data: testData, error: testError } = await supabase
        .from('writing_tests')
        .select('*')
        .eq('id', testId!)
        .single();

      if (testError) throw testError;
      setWritingTest(testData);

      // Fetch associated WritingTasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('writing_tasks')
        .select('*')
        .eq('writing_test_id', testId!)
        .order('task_type');

      if (tasksError) throw tasksError;

      if (tasksData && tasksData.length > 0) {
        const fetchedTask1 = tasksData.find(t => t.task_type === 'task1');
        const fetchedTask2 = tasksData.find(t => t.task_type === 'task2');
        if (fetchedTask1) setTask1(fetchedTask1);
        if (fetchedTask2) setTask2(fetchedTask2);
      }
    } catch (error) {
      console.error('Error fetching writing test:', error);
      toast.error('Failed to load writing test data');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let currentWritingTestId = writingTest.id;

      // Basic validation for WritingTest
      if (!writingTest.title?.trim()) {
        toast.error('Test Title is required.');
        setSaving(false);
        return;
      }

      // Basic validation for Task 1
      if (!task1.instruction?.trim()) {
        toast.error('Task 1 Instruction is required.');
        setSaving(false);
        setActiveTab('task1');
        return;
      }
      if (!task1.image_url) {
        toast.error('Task 1 requires an image. Please upload one.');
        setSaving(false);
        setActiveTab('task1'); // Switch to Task 1 tab
        return;
      }

      // Basic validation for Task 2
      if (!task2.instruction?.trim() && !task2.text_content?.trim()) {
        toast.error('Task 2 requires either an Instruction or Main Text Content.');
        setSaving(false);
        setActiveTab('task2');
        return;
      }

      // 1. Save WritingTest
      if (isEditing && currentWritingTestId) {
        const { error } = await supabase
          .from('writing_tests')
          .update(writingTest)
          .eq('id', currentWritingTestId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('writing_tests')
          .insert(writingTest as TablesInsert<'writing_tests'>) // Cast for insert
          .select()
          .single();
        if (error) throw error;
        currentWritingTestId = data.id;
        setWritingTest(data); // Update state with new ID
      }

      if (!currentWritingTestId) {
        throw new Error('Failed to get writing test ID.');
      }

      // 2. Save Task 1
      const task1DataToSave = {
        ...task1,
        instruction: task1.instruction || '',
        writing_test_id: currentWritingTestId,
        task_type: 'task1' as const,
      } as TablesInsert<'writing_tasks'>;
      if (task1.id) {
        const { error } = await supabase
          .from('writing_tasks')
          .update(task1DataToSave)
          .eq('id', task1.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('writing_tasks')
          .insert(task1DataToSave)
          .select()
          .single();
        if (error) throw error;
        setTask1(data); // Update state with new ID
      }

      // 3. Save Task 2
      const task2DataToSave = {
        ...task2,
        instruction: task2.instruction || '',
        writing_test_id: currentWritingTestId,
        task_type: 'task2' as const,
        image_url: null,
        image_width: null,
        image_height: null,
      } as TablesInsert<'writing_tasks'>;
      if (task2.id) {
        const { error } = await supabase
          .from('writing_tasks')
          .update(task2DataToSave)
          .eq('id', task2.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('writing_tasks')
          .insert(task2DataToSave)
          .select()
          .single();
        if (error) throw error;
        setTask2(data); // Update state with new ID
      }

      // Clear draft after successful save
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      toast.success(isEditing ? 'Writing test updated successfully' : 'Writing test created successfully');
      navigate('/admin/writing');
    } catch (error: any) {
      console.error('Error saving writing test:', error);
      toast.error(`Failed to save writing test: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUploadSuccess = (url: string, width: number | null, height: number | null) => {
    setTask1(prev => ({ ...prev, image_url: url, image_width: width, image_height: height }));
    toast.success('Image URL and dimensions updated for Task 1.');
  };

  const handleImageRemoveSuccess = () => {
    setTask1(prev => ({ ...prev, image_url: null, image_width: null, image_height: null }));
    toast.success('Image removed from Task 1 data.');
  };

  const handleImageDimensionChange = (field: 'image_width' | 'image_height', value: string) => {
    const numericValue = value === '' ? null : parseInt(value);
    setTask1(prev => ({ ...prev, [field]: numericValue }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/writing')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading">
              {isEditing ? 'Edit Writing Test' : 'Create Writing Test'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update test details, tasks, and content' : 'Add a new IELTS writing test (Task 1 & Task 2)'}
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
          <TabsTrigger value="task1">Task 1</TabsTrigger>
          <TabsTrigger value="task2">Task 2</TabsTrigger>
        </TabsList>

        {/* Test Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Test Title</Label>
                <Input
                  value={writingTest.title}
                  onChange={(e) => setWritingTest({ ...writingTest, title: e.target.value })}
                  placeholder="e.g., IELTS Writing Test 1"
                />
              </div>

              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <RichTextEditor
                  value={writingTest.description || ''}
                  onChange={(value) => setWritingTest({ ...writingTest, description: value })}
                  placeholder="e.g., This test includes a Task 1 report and a Task 2 essay."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Time Limit (minutes)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={14} className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The total time limit for both tasks combined (e.g., 60 minutes).</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    value={writingTest.time_limit}
                    onChange={(e) => setWritingTest({ ...writingTest, time_limit: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={writingTest.is_published}
                  onCheckedChange={(checked) => setWritingTest({ ...writingTest, is_published: checked })}
                />
                <Label>Published</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task 1 Tab */}
        <TabsContent value="task1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool size={20} />
                Writing Task 1 Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Instruction (e.g., "You should spend about 20 minutes on this task.")</Label>
                <RichTextEditor
                  value={task1.instruction || ''}
                  onChange={(value) => setTask1({ ...task1, instruction: value })}
                  placeholder="Enter the main instruction for Task 1..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Main Text Content (Optional, e.g., a brief description of the chart)</Label>
                <RichTextEditor
                  value={task1.text_content || ''}
                  onChange={(value) => setTask1({ ...task1, text_content: value })}
                  placeholder="Enter any additional text content for Task 1..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Minimum Word Limit
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={14} className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The minimum word count required for Task 1 (e.g., 150 words).</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    value={task1.word_limit_min}
                    onChange={(e) => setTask1({ ...task1, word_limit_min: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Maximum Word Limit (Optional)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={14} className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>An optional maximum word count for Task 1. Leave blank for no upper limit.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    value={task1.word_limit_max || ''}
                    onChange={(e) => setTask1({ ...task1, word_limit_max: parseInt(e.target.value) || null })}
                    min={task1.word_limit_min || 0}
                    placeholder="No max limit"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <ImageIcon size={20} />
                  Task 1 Image
                </Label>
                <WritingImageUploader
                  taskId={task1.id || 'new-task1'}
                  currentImageUrl={task1.image_url ?? null}
                  currentImageWidth={task1.image_width ?? null}
                  currentImageHeight={task1.image_height ?? null}
                  onUploadSuccess={handleImageUploadSuccess}
                  onRemoveSuccess={handleImageRemoveSuccess}
                />
                {task1.image_url && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="image-display-width">Display Width (px)</Label>
                      <Input
                        id="image-display-width"
                        type="number"
                        value={task1.image_width || ''}
                        onChange={(e) => handleImageDimensionChange('image_width', e.target.value)}
                        placeholder="Auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image-display-height">Display Height (px)</Label>
                      <Input
                        id="image-display-height"
                        type="number"
                        value={task1.image_height || ''}
                        onChange={(e) => handleImageDimensionChange('image_height', e.target.value)}
                        placeholder="Auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task 2 Tab */}
        <TabsContent value="task2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool size={20} />
                Writing Task 2 Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Instruction (e.g., "You should spend about 40 minutes on this task.")</Label>
                <RichTextEditor
                  value={task2.instruction || ''}
                  onChange={(value) => setTask2({ ...task2, instruction: value })}
                  placeholder="Enter the main instruction for Task 2..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Main Text Content (e.g., the essay prompt)</Label>
                <RichTextEditor
                  value={task2.text_content || ''}
                  onChange={(value) => setTask2({ ...task2, text_content: value })}
                  placeholder="Enter the main text content for Task 2..."
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Minimum Word Limit
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={14} className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The minimum word count required for Task 2 (e.g., 250 words).</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    value={task2.word_limit_min}
                    onChange={(e) => setTask2({ ...task2, word_limit_min: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Maximum Word Limit (Optional)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={14} className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>An optional maximum word count for Task 2. Leave blank for no upper limit.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    type="number"
                    value={task2.word_limit_max || ''}
                    onChange={(e) => setTask2({ ...task2, word_limit_max: parseInt(e.target.value) || null })}
                    min={task2.word_limit_min || 0}
                    placeholder="No max limit"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}