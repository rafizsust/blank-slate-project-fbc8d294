import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ReadingTest {
  id: string;
  title: string;
  book_name: string;
  test_number: number;
  test_type: string;
  time_limit: number;
  total_questions: number;
  is_published: boolean;
}

export default function ReadingTestsAdmin() {
  const [tests, setTests] = useState<ReadingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('reading_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      const { error } = await supabase.from('reading_tests').delete().eq('id', id);
      if (error) throw error;
      setTests(tests.filter(t => t.id !== id));
      toast.success('Test deleted successfully');
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error('Failed to delete test');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Reading Tests</h1>
          <p className="text-muted-foreground">Manage IELTS reading tests</p>
        </div>
        <Button onClick={() => navigate('/admin/reading/new')}>
          <Plus size={18} className="mr-2" />
          Add New Test
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : tests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No reading tests found</p>
            <Button onClick={() => navigate('/admin/reading/new')}>
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
                      {test.test_type === 'academic' ? 'Academic' : 'General'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {test.book_name} • Test {test.test_number} • {test.total_questions} questions • {test.time_limit} min
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/reading/test/${test.id}`} target="_blank">
                      <Eye size={18} />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/reading/edit/${test.id}`}>
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
