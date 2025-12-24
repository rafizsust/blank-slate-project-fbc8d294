import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  BookOpen, 
  Clock, 
  ChevronRight, 
  Headphones, 
  BookText, 
  PenLine, 
  Mic,
  Play,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CambridgeBook {
  name: string;
  tests: {
    reading: any[];
    listening: any[];
    writing: any[];
    speaking: any[];
  };
}

export default function FullMockTest() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Record<string, CambridgeBook>>({});
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllTests();
  }, []);

  const fetchAllTests = async () => {
    try {
      // Fetch all test types
      const [readingRes, listeningRes, writingRes, speakingRes] = await Promise.all([
        supabase.from('reading_tests').select('*').eq('is_published', true).order('test_number'),
        supabase.from('listening_tests').select('*').eq('is_published', true).order('test_number'),
        supabase.from('writing_tests').select('*').eq('is_published', true),
        supabase.from('speaking_tests').select('*').eq('is_published', true),
      ]);

      const booksMap: Record<string, CambridgeBook> = {};

      // Process reading tests
      readingRes.data?.forEach(test => {
        if (!booksMap[test.book_name]) {
          booksMap[test.book_name] = { name: test.book_name, tests: { reading: [], listening: [], writing: [], speaking: [] } };
        }
        booksMap[test.book_name].tests.reading.push(test);
      });

      // Process listening tests
      listeningRes.data?.forEach(test => {
        if (!booksMap[test.book_name]) {
          booksMap[test.book_name] = { name: test.book_name, tests: { reading: [], listening: [], writing: [], speaking: [] } };
        }
        booksMap[test.book_name].tests.listening.push(test);
      });

      // Process writing tests (group by title patterns)
      writingRes.data?.forEach(test => {
        const bookMatch = test.title.match(/Cambridge (\d+)/i);
        const bookName = bookMatch ? `Cambridge IELTS ${bookMatch[1]}` : test.title;
        if (!booksMap[bookName]) {
          booksMap[bookName] = { name: bookName, tests: { reading: [], listening: [], writing: [], speaking: [] } };
        }
        booksMap[bookName].tests.writing.push(test);
      });

      // Process speaking tests (group by name patterns)
      speakingRes.data?.forEach(test => {
        const bookMatch = test.name.match(/Cambridge (\d+)/i);
        const bookName = bookMatch ? `Cambridge IELTS ${bookMatch[1]}` : test.name;
        if (!booksMap[bookName]) {
          booksMap[bookName] = { name: bookName, tests: { reading: [], listening: [], writing: [], speaking: [] } };
        }
        booksMap[bookName].tests.speaking.push(test);
      });

      setBooks(booksMap);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'reading': return <BookText className="w-5 h-5" />;
      case 'listening': return <Headphones className="w-5 h-5" />;
      case 'writing': return <PenLine className="w-5 h-5" />;
      case 'speaking': return <Mic className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'reading': return 'text-blue-500 bg-blue-500/10';
      case 'listening': return 'text-amber-500 bg-amber-500/10';
      case 'writing': return 'text-emerald-500 bg-emerald-500/10';
      case 'speaking': return 'text-purple-500 bg-purple-500/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  const navigateToTest = (module: string, testId: string) => {
    switch (module) {
      case 'reading':
        navigate(`/reading/test/${testId}`);
        break;
      case 'listening':
        navigate(`/listening/test/${testId}`);
        break;
      case 'writing':
        navigate(`/writing/test/${testId}`);
        break;
      case 'speaking':
        navigate(`/speaking/test/${testId}`);
        break;
    }
  };

  // Sort books by Cambridge number
  const sortedBookNames = Object.keys(books).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
    return numB - numA; // Descending order (newest first)
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading tests...</div>
      </div>
    );
  }

  const selectedBookData = selectedBook ? books[selectedBook] : null;

  // Get unique test numbers from the selected book
  const getTestNumbers = () => {
    if (!selectedBookData) return [];
    const testNumbers = new Set<number>();
    selectedBookData.tests.reading.forEach(t => testNumbers.add(t.test_number));
    selectedBookData.tests.listening.forEach(t => testNumbers.add(t.test_number));
    return Array.from(testNumbers).sort((a, b) => a - b);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            Full Mock Test Experience
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">IELTS Full Mock Test</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Practice complete IELTS tests under exam conditions. Select a Cambridge book and test to begin your full mock test experience.
          </p>
        </div>

        {!selectedBook ? (
          /* Book Selection Grid */
          <>
            <h2 className="text-2xl font-bold mb-6">Select a Cambridge Book</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedBookNames.map((bookName) => {
                const book = books[bookName];
                const totalTests = Math.max(
                  book.tests.reading.length,
                  book.tests.listening.length
                );
                const hasReading = book.tests.reading.length > 0;
                const hasListening = book.tests.listening.length > 0;
                const hasWriting = book.tests.writing.length > 0;
                const hasSpeaking = book.tests.speaking.length > 0;

                return (
                  <Card 
                    key={bookName}
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                      "bg-card border border-border/50 hover:border-primary/50"
                    )}
                    onClick={() => setSelectedBook(bookName)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{bookName}</CardTitle>
                          <p className="text-sm text-muted-foreground">{totalTests} Tests</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {hasReading && (
                          <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10">
                            <BookText className="w-3 h-3 mr-1" />
                            Reading
                          </Badge>
                        )}
                        {hasListening && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
                            <Headphones className="w-3 h-3 mr-1" />
                            Listening
                          </Badge>
                        )}
                        {hasWriting && (
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                            <PenLine className="w-3 h-3 mr-1" />
                            Writing
                          </Badge>
                        )}
                        {hasSpeaking && (
                          <Badge variant="outline" className="text-purple-500 border-purple-500/30 bg-purple-500/10">
                            <Mic className="w-3 h-3 mr-1" />
                            Speaking
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-end text-primary text-sm font-medium">
                        Select <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {sortedBookNames.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Tests Available</h3>
                <p className="text-muted-foreground">
                  No published tests found. Please check back later.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Test Selection for Selected Book */
          <>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedBook(null)} 
              className="mb-6 gap-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Books
            </Button>

            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">{selectedBook}</h2>
              <p className="text-muted-foreground">
                Select a test to start your full mock test experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getTestNumbers().map((testNumber) => {
                const readingTest = selectedBookData?.tests.reading.find(t => t.test_number === testNumber);
                const listeningTest = selectedBookData?.tests.listening.find(t => t.test_number === testNumber);
                const writingTest = selectedBookData?.tests.writing[0]; // Use first writing test
                const speakingTest = selectedBookData?.tests.speaking[0]; // Use first speaking test

                return (
                  <Card key={testNumber} className="overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center font-bold text-primary">
                          {testNumber}
                        </div>
                        Test {testNumber}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {/* Reading */}
                        {readingTest && (
                          <div 
                            className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-muted/50 cursor-pointer transition-colors border border-border/50"
                            onClick={() => navigateToTest('reading', readingTest.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg", getModuleColor('reading'))}>
                                {getModuleIcon('reading')}
                              </div>
                              <div>
                                <p className="font-medium">Reading</p>
                                <p className="text-sm text-muted-foreground">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {readingTest.time_limit} mins • {readingTest.total_questions} questions
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Play className="w-4 h-4" />
                              Start
                            </Button>
                          </div>
                        )}

                        {/* Listening */}
                        {listeningTest && (
                          <div 
                            className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-muted/50 cursor-pointer transition-colors border border-border/50"
                            onClick={() => navigateToTest('listening', listeningTest.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg", getModuleColor('listening'))}>
                                {getModuleIcon('listening')}
                              </div>
                              <div>
                                <p className="font-medium">Listening</p>
                                <p className="text-sm text-muted-foreground">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {listeningTest.time_limit} mins • {listeningTest.total_questions} questions
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Play className="w-4 h-4" />
                              Start
                            </Button>
                          </div>
                        )}

                        {/* Writing */}
                        {writingTest && (
                          <div 
                            className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-muted/50 cursor-pointer transition-colors border border-border/50"
                            onClick={() => navigateToTest('writing', writingTest.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg", getModuleColor('writing'))}>
                                {getModuleIcon('writing')}
                              </div>
                              <div>
                                <p className="font-medium">Writing</p>
                                <p className="text-sm text-muted-foreground">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {writingTest.time_limit} mins • 2 tasks
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Play className="w-4 h-4" />
                              Start
                            </Button>
                          </div>
                        )}

                        {/* Speaking */}
                        {speakingTest && (
                          <div 
                            className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-muted/50 cursor-pointer transition-colors border border-border/50"
                            onClick={() => navigateToTest('speaking', speakingTest.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg", getModuleColor('speaking'))}>
                                {getModuleIcon('speaking')}
                              </div>
                              <div>
                                <p className="font-medium">Speaking</p>
                                <p className="text-sm text-muted-foreground">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  11-14 mins • 3 parts
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Play className="w-4 h-4" />
                              Start
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {getTestNumbers().length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Tests Found</h3>
                <p className="text-muted-foreground">
                  No tests available for this book yet.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
