import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Headphones } from 'lucide-react';
import { toast } from 'sonner';

interface ListeningTest {
  id: string;
  title: string;
  book_name: string;
  test_number: number;
  time_limit: number;
  total_questions: number;
  is_published: boolean;
  audio_url: string | null;
  audio_url_part1: string | null;
  audio_url_part2: string | null;
  audio_url_part3: string | null;
  audio_url_part4: string | null;
}

export default function ListeningTestsAdmin() {
  const [tests, setTests] = useState<ListeningTest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('listening_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching listening tests:', error);
      toast.error('Failed to load listening tests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, audioUrl: string | null) => {
    if (!confirm('Are you sure you want to delete this listening test? This will also delete the associated audio file.')) return;

    try {
      // Delete audio file from storage if it exists
      if (audioUrl) {
        const filePath = audioUrl.split('/').pop(); // Get file name from URL
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('listening-audios')
            .remove([filePath]);
          if (storageError) {
            console.error('Error deleting audio file:', storageError);
            toast.error('Failed to delete audio file from storage.');
            // Continue to delete test data even if audio deletion fails
          }
        }
      }

      // Delete test data from database
      const { error: dbError } = await supabase.from('listening_tests').delete().eq('id', id);
      if (dbError) throw dbError;

      setTests(tests.filter(t => t.id !== id));
      toast.success('Listening test deleted successfully');
    } catch (error) {
      console.error('Error deleting listening test:', error);
      toast.error('Failed to delete listening test');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Listening Tests</h1>
          <p className="text-muted-foreground">Manage IELTS listening tests</p>
        </div>
        <Button onClick={() => navigate('/admin/listening/new')}>
          <Plus size={18} className="mr-2" />
          Add New Test
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : tests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No listening tests found</p>
            <Button onClick={() => navigate('/admin/listening/new')}>
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
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {test.book_name} • Test {test.test_number} • {test.total_questions} questions • {test.time_limit} min
                    {(test.audio_url || test.audio_url_part1 || test.audio_url_part2 || test.audio_url_part3 || test.audio_url_part4) ? (
                      <span className="ml-2 text-xs text-green-600 inline-flex items-center gap-1"><Headphones size={12} /> Audio uploaded</span>
                    ) : (
                      <span className="ml-2 text-xs text-destructive inline-flex items-center gap-1"><Headphones size={12} /> No audio</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/listening/test/${test.id}`} target="_blank">
                      <Eye size={18} />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/listening/edit/${test.id}`}>
                      <Edit size={18} />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(test.id, test.audio_url)}>
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