import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenTool, Clock, ArrowRight, FileText, RotateCcw } from 'lucide-react'; // Added RotateCcw icon
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

// Define the type for the new WritingTest table
type WritingTest = Tables<'writing_tests'>;
type WritingSubmission = Tables<'writing_submissions'>;

export default function WritingTestList() {
  const [tests, setTests] = useState<WritingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSubmissions, setUserSubmissions] = useState<Record<string, WritingSubmission[]>>({}); // Store submissions per test
  const { user } = useAuth();

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (user && tests.length > 0) {
      fetchUserSubmissions();
    }
  }, [user, tests]);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('writing_tests')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching writing tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async () => {
    if (!user) return;

    const testIds = tests.map(test => test.id);
    if (testIds.length === 0) return;

    try {
      // Fetch all tasks for these tests
      const { data: tasks, error: tasksError } = await supabase
        .from('writing_tasks')
        .select('id, writing_test_id')
        .in('writing_test_id', testIds);

      if (tasksError) throw tasksError;
      const taskIdToTestIdMap = new Map(tasks.map(task => [task.id, task.writing_test_id]));
      const taskIds = tasks.map(task => task.id);

      if (taskIds.length === 0) return;

      // Fetch submissions for these tasks by the current user
      const { data: submissions, error: submissionsError } = await supabase
        .from('writing_submissions')
        .select('*')
        .eq('user_id', user.id)
        .in('task_id', taskIds)
        .order('submitted_at', { ascending: false }); // Get latest submission first

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
      } else if (submissions) {
        const newSubmissionsMap: Record<string, WritingSubmission[]> = {};
        for (const sub of submissions || []) {
          const parentTestId = taskIdToTestIdMap.get(sub.task_id);
          if (parentTestId) {
            if (!newSubmissionsMap[parentTestId]) {
              newSubmissionsMap[parentTestId] = [];
            }
            newSubmissionsMap[parentTestId].push(sub);
          }
        }
        setUserSubmissions(newSubmissionsMap);
      }

    } catch (error) {
      console.error('Error fetching user submissions:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">IELTS Writing Practice</Badge>
            <h1 className="text-4xl font-bold mb-4">Writing Practice Tests</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Practice with various IELTS Writing Task 1 and Task 2 prompts. Improve your essay writing and report skills.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading tests...</div>
            </div>
          ) : tests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <PenTool className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No writing tests available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PenTool className="text-primary" size={24} />
                Available Writing Tests
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {tests.map((test) => {
                  const hasSubmitted = userSubmissions[test.id] && userSubmissions[test.id].length > 0;
                  const latestSubmission = hasSubmitted ? userSubmissions[test.id][0] : null;
                  const hasEvaluation = latestSubmission?.overall_band !== null || latestSubmission?.evaluation_report !== null;

                  return (
                    <Card key={test.id} className="card-hover group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Full Test</Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock size={14} />
                            {test.time_limit} min
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-2">{test.title}</CardTitle>
                        <CardDescription>
                          Includes Task 1 & Task 2
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {hasSubmitted && hasEvaluation ? (
                          <div className="flex flex-col gap-2">
                            <Link to={`/writing/evaluation/${test.id}`}>
                              <Button className="w-full bg-success hover:bg-success/90 text-success-foreground">
                                View Latest Evaluation
                                <FileText size={16} className="ml-2" />
                              </Button>
                            </Link>
                            <Link to={`/writing/test/${test.id}/new-submission`} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" className="w-full">
                                Retake Test
                                <RotateCcw size={16} className="ml-2" />
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <Link to={`/writing/test/${test.id}`} target="_blank" rel="noopener noreferrer">
                            <Button className="w-full group-hover:bg-primary/90">
                              {hasSubmitted ? 'Continue Test' : 'Start Test'}
                              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}