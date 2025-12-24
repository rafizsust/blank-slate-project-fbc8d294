import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Clock, ArrowRight, RotateCcw, AlertCircle, Trash2 } from 'lucide-react'; // Added RotateCcw, AlertCircle, Trash2 icons
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type SpeakingTest = Tables<'speaking_tests'>;
type SpeakingSubmission = Tables<'speaking_submissions'>;

// Local storage key for failed AI submissions (logged-in users)
const SPEAKING_TEST_FAILED_SUBMISSION_KEY = 'speaking_test_failed_submission';

// Helper function for Base64 to Blob conversion available if needed

interface FailedSubmissionDraft {
  testId: string;
  userId: string;
  submissionData: TablesInsert<'speaking_submissions'>;
  audioBlobsBase64: Record<string, string>;
  // Removed transcripts: Record<string, string>;
  failedAt: string;
}

export default function SpeakingTestList() {
  const [tests, setTests] = useState<SpeakingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSubmissions, setUserSubmissions] = useState<Record<string, SpeakingSubmission[]>>({});
  const [failedSubmissions, setFailedSubmissions] = useState<FailedSubmissionDraft[]>([]); // New state for failed drafts
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (user && tests.length > 0) {
      fetchUserSubmissions();
      loadFailedSubmissions(); // Load failed submissions when user is logged in
    } else {
      setFailedSubmissions([]); // Clear failed submissions if user logs out
    }
  }, [user, tests]);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('speaking_tests')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching speaking tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async () => {
    if (!user) return;

    const testIds = tests.map(test => test.id);
    if (testIds.length === 0) return;

    try {
      const { data: submissions, error: submissionsError } = await supabase
        .from('speaking_submissions')
        .select('*')
        .eq('user_id', user.id)
        .in('test_id', testIds)
        .order('submitted_at', { ascending: false });

      if (submissionsError) {
        console.error('Error fetching speaking submissions:', submissionsError);
      } else if (submissions) {
        const newSubmissionsMap: Record<string, SpeakingSubmission[]> = {};
        for (const sub of submissions || []) {
          if (!newSubmissionsMap[sub.test_id]) {
            newSubmissionsMap[sub.test_id] = [];
          }
          newSubmissionsMap[sub.test_id].push(sub);
        }
        setUserSubmissions(newSubmissionsMap);
      }
    } catch (error) {
      console.error('Error fetching user speaking submissions:', error);
    }
  };

  const loadFailedSubmissions = () => {
    if (!user) return;
    try {
      const storedFailed = JSON.parse(localStorage.getItem(SPEAKING_TEST_FAILED_SUBMISSION_KEY) || '[]') as FailedSubmissionDraft[];
      // Filter for current user and available tests
      const relevantFailed = storedFailed.filter(draft => 
        draft.userId === user.id && tests.some(test => test.id === draft.testId)
      );
      setFailedSubmissions(relevantFailed);
    } catch (e) {
      console.error('Failed to load failed submissions from local storage:', e);
      localStorage.removeItem(SPEAKING_TEST_FAILED_SUBMISSION_KEY); // Clear corrupted data
    }
  };

  const handleResubmitFailed = async (draft: FailedSubmissionDraft) => {
    if (!user) {
      toast.error('You must be logged in to resubmit.');
      return;
    }

    if (!confirm('Are you sure you want to resubmit this attempt for AI evaluation?')) {
      return;
    }

    const loadingToastId = toast.loading('Resubmitting your speaking test for evaluation...');

    try {
      // Re-insert the submission data (without audio URLs, as per new logic)
      const submissionData: TablesInsert<'speaking_submissions'> = {
        user_id: user.id,
        test_id: draft.testId,
        submitted_at: new Date().toISOString(), // Use current timestamp for resubmission
        audio_url_part1: null,
        audio_url_part2: null,
        audio_url_part3: null,
        transcript_part1: null, // Transcripts are no longer stored in DB directly
        transcript_part2: null,
        transcript_part3: null,
      };

      const { data: newSubmission, error: insertError } = await supabase
        .from('speaking_submissions')
        .insert(submissionData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Trigger AI evaluation, sending audio data directly from the draft
      const { error: evaluationError } = await supabase.functions.invoke('evaluate-speaking-submission', {
        body: { submissionId: newSubmission.id, audioData: draft.audioBlobsBase64 },
      });

      if (evaluationError) {
        toast.error('AI evaluation failed again. Your submission is still saved locally.', { id: loadingToastId, duration: 8000 });
        return; // Don't remove from local storage if it failed again
      }

      // Remove from local storage after successful resubmission and evaluation
      removeFailedSubmission(draft.failedAt);
      toast.success('Speaking test resubmitted! Evaluation will be available shortly.', { id: loadingToastId });
      navigate(`/speaking/evaluation/${draft.testId}/${newSubmission.id}`);

    } catch (error: any) {
      console.error('Error resubmitting speaking test:', error);
      toast.error(`Failed to resubmit test: ${error.message}`, { id: loadingToastId });
    }
  };

  const removeFailedSubmission = (failedAtTimestamp: string) => {
    const updatedFailed = failedSubmissions.filter(draft => draft.failedAt !== failedAtTimestamp);
    localStorage.setItem(SPEAKING_TEST_FAILED_SUBMISSION_KEY, JSON.stringify(updatedFailed));
    setFailedSubmissions(updatedFailed);
    toast.info('Failed submission draft removed.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">IELTS Speaking Practice</Badge>
            <h1 className="text-4xl font-bold mb-4">Speaking Practice Tests</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Practice with full IELTS Speaking mock tests and get AI-powered feedback.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading tests...</div>
            </div>
          ) : tests.length === 0 && failedSubmissions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Mic className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No speaking tests available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {failedSubmissions.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-destructive">
                    <AlertCircle className="text-destructive" size={24} />
                    Failed Submissions (Local Drafts)
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    These submissions failed AI evaluation previously. You can resubmit them for another attempt.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {failedSubmissions.map((draft) => {
                      const test = tests.find(t => t.id === draft.testId);
                      if (!test) return null; // Should not happen if filtered correctly

                      return (
                        <Card key={draft.failedAt} className="border-destructive/50 bg-destructive/5">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="destructive">AI Failed</Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock size={14} />
                                {new Date(draft.failedAt).toLocaleString()}
                              </div>
                            </div>
                            <CardTitle className="text-lg mt-2 text-destructive">{test.name}</CardTitle>
                            <CardDescription className="text-destructive/80">
                              Attempted on {new Date(draft.submissionData.submitted_at!).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-2">
                            <Button onClick={() => handleResubmitFailed(draft)} className="w-full bg-destructive hover:bg-destructive/90">
                              <RotateCcw size={16} className="mr-2" />
                              Resubmit for Evaluation
                            </Button>
                            <Button variant="outline" onClick={() => removeFailedSubmission(draft.failedAt)} className="w-full">
                              <Trash2 size={16} className="mr-2" />
                              Remove Draft
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mic className="text-primary" size={24} />
                Available Speaking Tests
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
                          <Badge variant="outline">{test.test_type === 'academic' ? 'Academic' : 'General'}</Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock size={14} />
                            ~15 min
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-2">{test.name}</CardTitle>
                        <CardDescription>
                          {test.description || 'Full IELTS Speaking Test'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {hasSubmitted && hasEvaluation ? (
                          <div className="flex flex-col gap-2">
                            <Link to={`/speaking/evaluation/${test.id}/${latestSubmission?.id}`}>
                              <Button className="w-full bg-success hover:bg-success/90 text-success-foreground">
                                View Latest Evaluation
                                <ArrowRight size={16} className="ml-2" />
                              </Button>
                            </Link>
                            <Link to={`/speaking/test/${test.id}/new-submission`} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" className="w-full">
                                Retake Test
                                <RotateCcw size={16} className="ml-2" />
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <Link to={`/speaking/test/${test.id}`} target="_blank" rel="noopener noreferrer">
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