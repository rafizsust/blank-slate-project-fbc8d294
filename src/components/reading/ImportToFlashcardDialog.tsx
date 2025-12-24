import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Layers, 
  FolderPlus,
  Languages,
  Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Deck {
  id: string;
  name: string;
  cardCount: number;
}

interface ImportToFlashcardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  words: string[];
  onSuccess: () => void;
}

export function ImportToFlashcardDialog({ open, onOpenChange, words, onSuccess }: ImportToFlashcardDialogProps) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [createNewDeck, setCreateNewDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [importing, setImporting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loadingDecks, setLoadingDecks] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadDecks();
    }
  }, [open, user]);

  useEffect(() => {
    if (open && words.length > 0) {
      translateWords();
    }
  }, [open, words]);

  const loadDecks = async () => {
    if (!user) return;
    setLoadingDecks(true);
    
    try {
      // Fetch decks from Supabase
      const { data: deckData, error: deckError } = await supabase
        .from('flashcard_decks')
        .select('id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (deckError) throw deckError;

      // Get card counts for each deck
      const decksWithCounts: Deck[] = [];
      for (const deck of deckData || []) {
        const { count } = await supabase
          .from('flashcard_cards')
          .select('*', { count: 'exact', head: true })
          .eq('deck_id', deck.id);
        
        decksWithCounts.push({
          id: deck.id,
          name: deck.name,
          cardCount: count || 0
        });
      }

      setDecks(decksWithCounts);
      if (decksWithCounts.length > 0 && !selectedDeckId) {
        setSelectedDeckId(decksWithCounts[0].id);
      }
    } catch (error) {
      console.error('Error loading decks:', error);
      toast({ title: 'Failed to load decks', variant: 'destructive' });
    } finally {
      setLoadingDecks(false);
    }
  };

  const translateWords = async () => {
    setTranslating(true);
    const newTranslations: Record<string, string> = {};

    for (const word of words) {
      if (!translations[word]) {
        try {
          const response = await supabase.functions.invoke('translate-word', {
            body: { word, targetLanguage: 'bn' }
          });
          if (response.data?.translation) {
            newTranslations[word] = response.data.translation;
          }
        } catch (error) {
          console.error(`Translation error for "${word}":`, error);
        }
      }
    }

    setTranslations(prev => ({ ...prev, ...newTranslations }));
    setTranslating(false);
  };

  const handleImport = async () => {
    if (!user) {
      toast({ title: 'Please login first', variant: 'destructive' });
      return;
    }

    setImporting(true);

    try {
      let targetDeckId = selectedDeckId;

      // Create new deck if needed
      if (createNewDeck && newDeckName.trim()) {
        const { data: newDeck, error: createError } = await supabase
          .from('flashcard_decks')
          .insert({
            user_id: user.id,
            name: newDeckName.trim(),
            description: `Imported from reading test`
          })
          .select()
          .single();

        if (createError) throw createError;
        targetDeckId = newDeck.id;
      }

      if (!targetDeckId) {
        toast({ title: 'Please select or create a deck', variant: 'destructive' });
        setImporting(false);
        return;
      }

      // Create flashcards in Supabase
      const cardsToInsert = words.map(word => ({
        user_id: user.id,
        deck_id: targetDeckId,
        word,
        meaning: translations[word] || 'Translation pending',
        translation: translations[word] || null,
        status: 'learning'
      }));

      const { error: insertError } = await supabase
        .from('flashcard_cards')
        .insert(cardsToInsert);

      if (insertError) throw insertError;

      toast({
        title: 'Import successful!',
        description: `${words.length} words added to flashcards`
      });

      onSuccess();
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: 'Import failed', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="text-primary" />
            Import to Flashcards
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Words Preview */}
          <div>
            <Label className="mb-2 block">Words to import ({words.length})</Label>
            <ScrollArea className="h-32 rounded-lg border p-3">
              <div className="flex flex-wrap gap-2">
                {words.map((word, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {word}
                    {translating ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : translations[word] ? (
                      <Check size={10} className="text-emerald-500" />
                    ) : null}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
            {translating && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Languages size={12} />
                Translating words...
              </p>
            )}
          </div>

          {/* Deck Selection */}
          <div>
            <Label className="mb-3 block">Select Deck</Label>
            
            {loadingDecks ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : decks.length > 0 && !createNewDeck ? (
              <RadioGroup 
                value={selectedDeckId} 
                onValueChange={setSelectedDeckId}
                className="space-y-2"
              >
                {decks.map(deck => (
                  <div 
                    key={deck.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDeckId(deck.id)}
                  >
                    <RadioGroupItem value={deck.id} id={deck.id} />
                    <Label htmlFor={deck.id} className="flex-1 cursor-pointer">
                      <span className="font-medium">{deck.name}</span>
                      <span className="text-muted-foreground text-sm ml-2">
                        ({deck.cardCount} cards)
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : !createNewDeck ? (
              <p className="text-sm text-muted-foreground py-2">No decks found. Create a new one below.</p>
            ) : null}

            {/* Create New Deck Option */}
            <div className="mt-3">
              {!createNewDeck ? (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => setCreateNewDeck(true)}
                >
                  <FolderPlus size={16} />
                  Create New Deck
                </Button>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="New deck name..."
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setCreateNewDeck(false);
                        setNewDeckName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={importing || (createNewDeck ? !newDeckName.trim() : !selectedDeckId)}
            className="gap-2"
          >
            {importing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Check size={16} />
                Import {words.length} Words
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}