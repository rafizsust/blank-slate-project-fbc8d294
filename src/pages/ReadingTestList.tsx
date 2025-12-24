import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookSection, QuestionTypeFilter } from '@/components/test-list';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Sparkles } from 'lucide-react';

interface Passage {
  id: string;
  passage_number: number;
  title: string;
}

interface QuestionGroup {
  id: string;
  question_type: string;
  start_question: number;
  end_question: number;
  passage_id: string;
}

interface ReadingTest {
  id: string;
  title: string;
  book_name: string;
  test_number: number;
  time_limit: number;
  total_questions: number;
  created_at: string;
  passages?: Passage[];
  question_groups?: QuestionGroup[];
}

export default function ReadingTestList() {
  const [tests, setTests] = useState<ReadingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      // Fetch tests with passages and question groups
      const { data: testsData, error: testsError } = await supabase
        .from('reading_tests')
        .select('*')
        .eq('is_published', true)
        .order('book_name', { ascending: true })
        .order('test_number', { ascending: true });

      if (testsError) throw testsError;

      // Fetch passages
      const testIds = testsData?.map((t) => t.id) || [];
      const { data: passagesData } = await supabase
        .from('reading_passages')
        .select('id, passage_number, title, test_id')
        .in('test_id', testIds);

      // Fetch question groups
      const passageIds = passagesData?.map((p) => p.id) || [];
      const { data: groupsData } = await supabase
        .from('reading_question_groups')
        .select('id, question_type, start_question, end_question, passage_id')
        .in('passage_id', passageIds);

      // Combine data
      const enrichedTests = testsData?.map((test) => {
        const passages = passagesData
          ?.filter((p) => p.test_id === test.id)
          .sort((a, b) => a.passage_number - b.passage_number) || [];
        
        const passageIdsForTest = passages.map((p) => p.id);
        const question_groups = groupsData
          ?.filter((g) => passageIdsForTest.includes(g.passage_id))
          .sort((a, b) => a.start_question - b.start_question) || [];

        return { ...test, passages, question_groups };
      }) || [];

      setTests(enrichedTests);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group tests by book
  const groupedTests = useMemo(() => {
    return tests.reduce((acc, test) => {
      if (!acc[test.book_name]) {
        acc[test.book_name] = [];
      }
      acc[test.book_name].push(test);
      return acc;
    }, {} as Record<string, ReadingTest[]>);
  }, [tests]);

  // Normalize question types to match admin panel types
  const normalizeQuestionType = (type: string): string => {
    const normalizeMap: Record<string, string> = {
      'NOTE_COMPLETION': 'FILL_IN_BLANK',
      'SENTENCE_COMPLETION': 'FILL_IN_BLANK',
      'SUMMARY_COMPLETION': 'FILL_IN_BLANK',
      'SUMMARY_WORD_BANK': 'FILL_IN_BLANK',
      'SHORT_ANSWER': 'FILL_IN_BLANK',
      'MULTIPLE_CHOICE_SINGLE': 'MULTIPLE_CHOICE',
    };
    return normalizeMap[type] || type;
  };

  // Get all unique question types (normalized)
  const availableQuestionTypes = useMemo(() => {
    const types = new Set<string>();
    tests.forEach((test) => {
      test.question_groups?.forEach((group) => {
        types.add(normalizeQuestionType(group.question_type));
      });
    });
    return Array.from(types).sort();
  }, [tests]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal/10 text-teal text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              IELTS Academic Reading
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-teal bg-clip-text text-transparent">
              Reading Practice Tests
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Master every question type with targeted practice. Select individual parts or dive into complete tests.
            </p>
          </div>

          {/* Question Type Filter */}
          {!loading && availableQuestionTypes.length > 0 && (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <QuestionTypeFilter
                  availableTypes={availableQuestionTypes}
                  selectedTypes={selectedTypes}
                  onTypeToggle={handleTypeToggle}
                  onClearAll={() => setSelectedTypes([])}
                />
              </CardContent>
            </Card>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center animate-pulse">
                <BookOpen className="w-6 h-6 text-teal" />
              </div>
              <p className="text-muted-foreground">Loading tests...</p>
            </div>
          ) : tests.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">No Tests Available</h3>
                  <p className="text-muted-foreground">Check back soon for new reading tests.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedTests).map(([bookName, bookTests]) => (
                <BookSection
                  key={bookName}
                  bookName={bookName}
                  tests={bookTests}
                  testType="reading"
                  selectedQuestionTypes={selectedTypes}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
