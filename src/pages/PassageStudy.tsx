import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  BookOpen, 
  Loader2,
  Layers,
  X,
  Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WordSelectionToolbar } from '@/components/reading/WordSelectionToolbar';
import { ImportToFlashcardDialog } from '@/components/reading/ImportToFlashcardDialog';

interface Passage {
  id: string;
  passage_number: number;
  title: string;
  content: string;
}

interface Paragraph {
  id: string;
  label: string;
  content: string;
  is_heading: boolean;
  order_index: number;
}

interface Test {
  id: string;
  title: string;
  book_name: string;
  test_number: number;
}

interface SelectedWord {
  text: string;
  context?: string;
}

export default function PassageStudy() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { } = useAuth();
  
  const [test, setTest] = useState<Test | null>(null);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [paragraphs, setParagraphs] = useState<Record<string, Paragraph[]>>({});
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  
  // Word selection state
  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<string>('');

  useEffect(() => {
    if (testId) {
      fetchTestData(testId);
    }
  }, [testId]);

  // Handle text selection
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const text = selection.toString().trim();
        if (text.length > 0 && text.length < 100) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setCurrentSelection(text);
          setSelectionPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          });
        }
      } else {
        // Delay clearing to allow button clicks
        setTimeout(() => {
          if (!document.querySelector('.word-selection-toolbar:hover')) {
            setCurrentSelection('');
            setSelectionPosition(null);
          }
        }, 200);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const fetchTestData = async (id: string) => {
    try {
      const { data: testData, error: testError } = await supabase
        .from('reading_tests')
        .select('*')
        .eq('id', id)
        .single();

      if (testError) throw testError;
      setTest(testData);

      const { data: passageData, error: passageError } = await supabase
        .from('reading_passages')
        .select('*')
        .eq('test_id', id)
        .order('passage_number');

      if (passageError) throw passageError;
      setPassages(passageData || []);

      // Fetch paragraphs for each passage
      const paragraphsMap: Record<string, Paragraph[]> = {};
      for (const passage of passageData || []) {
        const { data: paragraphData } = await supabase
          .from('reading_paragraphs')
          .select('*')
          .eq('passage_id', passage.id)
          .order('order_index');
        
        if (paragraphData && paragraphData.length > 0) {
          paragraphsMap[passage.id] = paragraphData;
        } else {
          // Fallback: parse from content
          const contentParagraphs = passage.content.split('\n\n');
          paragraphsMap[passage.id] = contentParagraphs.map((p: string, idx: number) => {
            const match = p.trim().match(/^([A-Z])\s(.*)$/s);
            return {
              id: `temp-${idx}`,
              label: match ? match[1] : '',
              content: match ? match[2] : p,
              is_heading: false,
              order_index: idx
            };
          }).filter((p: Paragraph) => p.label || p.content);
        }
      }
      setParagraphs(paragraphsMap);
    } catch (error) {
      console.error('Error fetching test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToSelection = () => {
    if (currentSelection && !selectedWords.find(w => w.text === currentSelection)) {
      setSelectedWords([...selectedWords, { text: currentSelection }]);
      toast({ title: 'Word added', description: `"${currentSelection}" added to selection` });
    }
    setCurrentSelection('');
    setSelectionPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  const removeFromSelection = (text: string) => {
    setSelectedWords(selectedWords.filter(w => w.text !== text));
  };

  const clearSelection = () => {
    setSelectedWords([]);
  };

  const currentPassage = passages[currentPassageIndex];
  const currentParagraphs = currentPassage ? paragraphs[currentPassage.id] || [] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Test not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft size={18} />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">{test.title}</h1>
            <p className="text-sm text-muted-foreground">Study Mode - Select words to import</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            >
              A-
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFontSize(Math.min(24, fontSize + 2))}
            >
              A+
            </Button>
          </div>
        </div>
      </header>

      {/* Passage Navigation */}
      <div className="border-b border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 py-2 flex items-center gap-2">
          {passages.map((p, idx) => (
            <Button
              key={p.id}
              variant={idx === currentPassageIndex ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentPassageIndex(idx)}
            >
              Passage {p.passage_number}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Passage Content */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-primary" />
                {currentPassage?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div 
                  className="prose prose-sm max-w-none space-y-4"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {currentParagraphs.map((paragraph, index) => (
                    <div key={paragraph.id || index} className="flex items-start gap-3">
                      {paragraph.label && (
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {paragraph.label}
                        </span>
                      )}
                      <p className="flex-1 leading-relaxed text-foreground/90 select-text">
                        {paragraph.content}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Selected Words Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Layers size={18} className="text-primary" />
                    Selected Words
                  </span>
                  {selectedWords.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearSelection}>
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedWords.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Select words from the passage to add them here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Highlight text and click the + button
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedWords.map((word, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 group"
                      >
                        <span className="font-medium">{word.text}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFromSelection(word.text)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedWords.length > 0 && (
                  <Button 
                    className="w-full mt-4 gap-2"
                    onClick={() => setShowImportDialog(true)}
                  >
                    <Layers size={16} />
                    Import to Flashcards ({selectedWords.length})
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Check size={16} className="text-primary" />
                  How to use
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Highlight any word or phrase in the passage</li>
                  <li>Click the + button that appears</li>
                  <li>Review your selected words</li>
                  <li>Click "Import to Flashcards" to save</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Selection Toolbar */}
      {selectionPosition && currentSelection && (
        <WordSelectionToolbar
          position={selectionPosition}
          word={currentSelection}
          onAdd={addToSelection}
          onClose={() => {
            setCurrentSelection('');
            setSelectionPosition(null);
          }}
        />
      )}

      {/* Import Dialog */}
      <ImportToFlashcardDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        words={selectedWords.map(w => w.text)}
        onSuccess={() => {
          setSelectedWords([]);
          setShowImportDialog(false);
        }}
      />
    </div>
  );
}
