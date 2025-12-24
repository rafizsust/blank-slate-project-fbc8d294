import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

// Define the type for the new WritingTest table
type WritingTest = Tables<'writing_tests'>;

export default function WritingTestsAdmin() {
  const [tests, setTests] = useState<WritingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('writing_tests') // Fetch from the new writing_tests table
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching writing tests:', error);
      toast.error('Failed to load writing tests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this writing test? This will also delete its associated Task 1 and Task 2, including any images and submissions.')) return;

    try {
      // Deleting the parent writing_test will cascade delete associated writing_tasks and their submissions.
      // Image deletion needs to be handled separately if images are stored per task.
      // For now, we'll assume images are linked to tasks, and tasks are linked to tests.
      // If images are stored in a bucket with a path like `writing-images/:taskId/:filename`,
      // we'd need to fetch tasks first to get image URLs, then delete images, then delete the test.
      // For simplicity, I'll assume the cascade delete handles tasks, and images are cleaned up by admin manually or via a more complex edge function.
      // If images are stored by `writing_test_id`, then we'd fetch tasks by `writing_test_id` to get image URLs.

      // To properly delete images, we need to fetch the associated tasks first
      const { data: tasksToDelete, error: fetchTasksError } = await supabase
        .from('writing_tasks')
        .select('id, image_url')
        .eq('writing_test_id', id);

      if (fetchTasksError) throw fetchTasksError;

      for (const task of tasksToDelete || []) {
        if (task.image_url) {
          const filePath = task.image_url.split('/').pop();
          if (filePath) {
            const { error: storageError } = await supabase.storage
              .from('writing-images')
              .remove([`${task.id}/${filePath}`]); // Assuming image path is taskId/filename
            if (storageError) {
              console.warn(`Error deleting image for task ${task.id}:`, storageError);
            }
          }
        }
      }

      const { error: dbError } = await supabase.from('writing_tests').delete().eq('id', id);
      if (dbError) throw dbError;

      setTests(tests.filter(t => t.id !== id));
      toast.success('Writing test deleted successfully');
    } catch (error) {
      console.error('Error deleting writing test:', error);
      toast.error('Failed to delete writing test');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Writing Tests</h1>
          <p className="text-muted-foreground">Manage IELTS writing tests (Task 1 & Task 2 combined)</p>
        </div>
        <Button onClick={() => navigate('/admin/writing/new')}>
          <Plus size={18} className="mr-2" />
          Add New Test
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : tests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No writing tests found</p>
            <Button onClick={() => navigate('/admin/writing/new')}>
              <Plus size={18} className="mr-2" />
              Create Your First Test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <Card key={test.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{test.title}</h3>
                    <Badge variant={test.is_published ? "default" : "secondary"}>
                      {test.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="outline">
                      Full Test
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Time limit: {test.time_limit} min
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/writing/test/${test.id}`} target="_blank">
                      <Eye size={18} />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/writing/edit/${test.id}`}>
                      <Edit size={18} />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(test.id)}>
                    <Trash2 size={18} className="text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}