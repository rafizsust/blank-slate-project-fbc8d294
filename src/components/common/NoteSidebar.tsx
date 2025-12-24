import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { X, Pencil, Trash2, StickyNote } from 'lucide-react';
import { useHighlightNotes, Highlight, Note } from '@/hooks/useHighlightNotes';
import { cn } from '@/lib/utils';

interface NoteSidebarProps {
  testId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  renderRichText: (text: string) => string; // Function to render rich text
}

export function NoteSidebar({ testId, isOpen, onOpenChange, renderRichText }: NoteSidebarProps) {
  const { getAllNotesForTest, addOrUpdateNote, removeHighlight } = useHighlightNotes();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  const notesForTest = getAllNotesForTest(testId);

  const handleEditClick = useCallback((highlight: Highlight, note: Note) => {
    setEditingNoteId(highlight.id);
    setEditingNoteText(note.text);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingNoteId && editingNoteText.trim()) {
      addOrUpdateNote(editingNoteId, editingNoteText.trim());
    } else if (editingNoteId && !editingNoteText.trim()) {
      // If note is empty, remove the highlight entirely
      removeHighlight(editingNoteId);
    }
    setEditingNoteId(null);
    setEditingNoteText('');
  }, [editingNoteId, editingNoteText, addOrUpdateNote, removeHighlight]);

  const handleCancelEdit = useCallback(() => {
    setEditingNoteId(null);
    setEditingNoteText('');
  }, []);

  const handleDeleteNote = useCallback((highlightId: string) => {
    if (confirm('Are you sure you want to delete this note and its highlight?')) {
      removeHighlight(highlightId);
    }
  }, [removeHighlight]);

  // Sort notes by their startOffset to maintain original sequence
  const sortedNotes = [...notesForTest].sort((a, b) => a.highlight.startOffset - b.highlight.startOffset);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <StickyNote size={20} />
            Your Notes ({sortedNotes.length})
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {sortedNotes.length === 0 ? (
            <p className="text-muted-foreground text-center italic mt-8">
              No notes added yet. Select text and click 'Note' to add one.
            </p>
          ) : (
            sortedNotes.map(({ highlight, note }) => (
              <div key={highlight.id} className="border rounded-lg p-4 bg-card shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Question/Passage ID: {highlight.contentId.substring(0, 8)}...
                  </span>
                  <div className="flex gap-2">
                    {editingNoteId === highlight.id ? (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveEdit}>
                          <Pencil size={14} className="text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
                          <X size={14} className="text-muted-foreground" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClick(highlight, note)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteNote(highlight.id)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-foreground">Highlighted Text:</p>
                  <p 
                    className={cn(
                      "text-sm leading-relaxed px-1 rounded inline-block",
                      "bg-orange-400 text-black underline decoration-orange-600 decoration-2"
                    )}
                    dangerouslySetInnerHTML={{ __html: renderRichText(highlight.text) }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Your Note:</p>
                  {editingNoteId === highlight.id ? (
                    <Textarea
                      value={editingNoteText}
                      onChange={(e) => setEditingNoteText(e.target.value)}
                      onBlur={handleSaveEdit}
                      className="min-h-[80px] text-sm"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-foreground/90 leading-relaxed bg-muted/50 p-2 rounded">{note.text}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  Last updated: {new Date(note.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}