import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Highlighter, StickyNote, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHighlightNotesOptional, Highlight } from '@/hooks/useHighlightNotes';

interface QuestionTextWithToolsProps {
  contentId: string; // passageId or questionId
  testId: string;
  text: string;
  fontSize: number;
  renderRichText: (text: string) => string;
  isActive?: boolean; // Optional prop for active state styling
  as?: React.ElementType; // New prop: allows specifying the root HTML element
}

export function QuestionTextWithTools({
  contentId,
  testId,
  text,
  fontSize,
  renderRichText,
  as: Component = 'div', // Default to 'div'
}: QuestionTextWithToolsProps) {
  const highlightContext = useHighlightNotesOptional();
  
  const highlights = highlightContext?.highlights ?? [];
  const addHighlight = highlightContext?.addHighlight ?? (() => ({} as Highlight));
  const updateHighlight = highlightContext?.updateHighlight ?? (() => {});
  const removeHighlight = highlightContext?.removeHighlight ?? (() => {});
  const addOrUpdateNote = highlightContext?.addOrUpdateNote ?? (() => {});
  const removeNote = highlightContext?.removeNote ?? (() => {});
  const getNoteForHighlight = highlightContext?.getNoteForHighlight ?? (() => undefined);
  const getHighlightsForContent = highlightContext?.getHighlightsForContent ?? (() => []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTextInfo, setSelectedTextInfo] = useState<{ text: string; startOffset: number; endOffset: number; } | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteInputText, setNoteInputText] = useState('');
  const [activeHighlightForNote, setActiveHighlightForNote] = useState<Highlight | null>(null);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightMenuPosition, setHighlightMenuPosition] = useState({ x: 0, y: 0 });
  const [activeHighlightClicked, setActiveHighlightClicked] = useState<Highlight | null>(null);

  const currentContentHighlights = useMemo(() => getHighlightsForContent(testId, contentId), [highlights, testId, contentId, getHighlightsForContent]);

  // Helper to map a plain text offset to a DOM node and its local offset
  const mapPlainTextOffsetToDOM = useCallback((root: Node, plainTextOffset: number): { node: Node; offset: number } | null => {
    let currentOffset = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent!.length;
      if (plainTextOffset >= currentOffset && plainTextOffset <= currentOffset + nodeLength) {
        return { node, offset: plainTextOffset - currentOffset };
      }
      currentOffset += nodeLength;
    }
    return null;
  }, []);

  // Handle text selection
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      // Ensure selection exists and is within our component's ref
      if (selectedText && containerRef.current && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (containerRef.current.contains(range.commonAncestorContainer)) {
          const containerElement = containerRef.current;

          // Calculate plain text offsets relative to the container's text content
          const preSelectionRange = document.createRange();
          preSelectionRange.setStart(containerElement, 0);
          preSelectionRange.setEnd(range.startContainer, range.startOffset);
          const startOffset = preSelectionRange.toString().length;
          const endOffset = startOffset + selectedText.length;

          setSelectedTextInfo({
            text: selectedText,
            startOffset,
            endOffset,
          });
          
          const rect = range.getBoundingClientRect();
          setToolbarPosition({ x: rect.left + rect.width / 2, y: rect.top }); // Position above
          setShowToolbar(true);
        } else {
          setShowToolbar(false);
          setSelectedTextInfo(null);
        }
      } else {
        setShowToolbar(false);
        setSelectedTextInfo(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Effect to clear selection and hide toolbar if selectedTextInfo becomes null
  useEffect(() => {
    if (!selectedTextInfo) {
      setShowToolbar(false);
      window.getSelection()?.removeAllRanges();
    }
  }, [selectedTextInfo]);

  // Close note input/highlight menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const noteInputElement = document.getElementById('note-input-popup');
      const highlightMenuElement = document.getElementById('highlight-menu');

      const isClickOutsideNoteInput = !noteInputElement || !noteInputElement.contains(event.target as Node);
      const isClickOutsideHighlightMenu = !highlightMenuElement || !highlightMenuElement.contains(event.target as Node);
      
      if (showNoteInput && isClickOutsideNoteInput) {
        setShowNoteInput(false);
        setNoteInputText('');
        setActiveHighlightForNote(null);
      }
      
      if (showHighlightMenu && isClickOutsideHighlightMenu) setShowHighlightMenu(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNoteInput, showHighlightMenu]);

  const handleHighlightClick = useCallback(() => {
    if (!selectedTextInfo) return;

    const existingHighlight = currentContentHighlights.find(
      h => h.text === selectedTextInfo.text && h.startOffset === selectedTextInfo.startOffset && h.endOffset === selectedTextInfo.endOffset
    );

    if (existingHighlight) {
      removeHighlight(existingHighlight.id);
    } else {
      addHighlight({ ...selectedTextInfo, testId, contentId }, 'yellow');
    }
    setSelectedTextInfo(null); // Clear selection info to hide toolbar
  }, [selectedTextInfo, currentContentHighlights, addHighlight, removeHighlight, testId, contentId]);

  const handleNoteClick = useCallback(() => {
    if (!selectedTextInfo) return;

    let highlight = currentContentHighlights.find(
      h => h.text === selectedTextInfo.text && h.startOffset === selectedTextInfo.startOffset && h.endOffset === selectedTextInfo.endOffset
    );

    if (!highlight) {
      highlight = addHighlight({ ...selectedTextInfo, testId, contentId }, 'red');
    } else if (highlight.color === 'yellow') {
      updateHighlight(highlight.id, { color: 'red', isNote: true });
    }

    if (highlight) {
      setActiveHighlightForNote(highlight);
      const existingNote = getNoteForHighlight(highlight.id);
      setNoteInputText(existingNote?.text || '');
      setShowNoteInput(true);
      setSelectedTextInfo(null); // Clear selection info to hide toolbar
      
      // Position note input popup based on selection
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        setToolbarPosition({ x: rect.left + rect.width / 2, y: rect.bottom + 5 });
      }
    }
  }, [selectedTextInfo, currentContentHighlights, addHighlight, updateHighlight, getNoteForHighlight, testId, contentId]);

  const saveNote = useCallback(() => {
    if (noteInputText.trim() && activeHighlightForNote) {
      addOrUpdateNote(activeHighlightForNote.id, noteInputText.trim());
    } else if (!noteInputText.trim() && activeHighlightForNote) {
      removeNote(activeHighlightForNote.id);
    }
    setShowNoteInput(false);
    setNoteInputText('');
    setActiveHighlightForNote(null);
  }, [noteInputText, activeHighlightForNote, addOrUpdateNote, removeNote]);

  const handleExistingHighlightClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const highlightMark = target.closest('mark[data-highlight-id]');
    if (highlightMark instanceof HTMLElement) { // Type guard for HTMLElement
      const highlightId = highlightMark.dataset.highlightId;
      const clickedHighlight = currentContentHighlights.find(h => h.id === highlightId);
      if (clickedHighlight) {
        setActiveHighlightClicked(clickedHighlight);
        setHighlightMenuPosition({ x: e.clientX, y: e.clientY });
        setShowHighlightMenu(true);
      }
    }
  }, [currentContentHighlights]);

  const handleRemoveHighlightOrNote = useCallback(() => {
    if (activeHighlightClicked) {
      removeHighlight(activeHighlightClicked.id);
      setShowHighlightMenu(false);
      setActiveHighlightClicked(null);
    }
  }, [activeHighlightClicked, removeHighlight]);

  const handleEditNote = useCallback(() => {
    if (activeHighlightClicked && activeHighlightClicked.isNote) {
      setActiveHighlightForNote(activeHighlightClicked);
      const existingNote = getNoteForHighlight(activeHighlightClicked.id);
      setNoteInputText(existingNote?.text || '');
      setShowNoteInput(true);
      setShowHighlightMenu(false);
      
      // Position note input popup based on the clicked highlight's position
      const markElement = containerRef.current?.querySelector(`mark[data-highlight-id="${activeHighlightClicked.id}"]`);
      if (markElement) {
        const rect = markElement.getBoundingClientRect();
        setToolbarPosition({ x: rect.left + rect.width / 2, y: rect.bottom + 5 });
      }
    }
  }, [activeHighlightClicked, getNoteForHighlight]);

  // Apply highlights to text by manipulating a temporary DOM
  const applyHighlightsToText = useCallback((richText: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = richText;

    const sortedHighlights = [...currentContentHighlights].sort((a, b) => a.startOffset - b.startOffset);
    const domRanges: { range: Range; highlight: Highlight }[] = [];

    let currentPlainTextOffset = 0;
    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null);
    let node: Node | null;

    while ((node = walker.nextNode())) {
      const nodeText = node.textContent || '';
      const nodeLength = nodeText.length;

      for (const highlight of sortedHighlights) {
        const highlightStart = highlight.startOffset;
        const highlightEnd = highlight.endOffset;

        const overlapStart = Math.max(highlightStart, currentPlainTextOffset);
        const overlapEnd = Math.min(highlightEnd, currentPlainTextOffset + nodeLength);

        if (overlapStart < overlapEnd) {
          const range = document.createRange();
          range.setStart(node, overlapStart - currentPlainTextOffset);
          range.setEnd(node, overlapEnd - currentPlainTextOffset);
          domRanges.push({ range, highlight });
        }
      }
      currentPlainTextOffset += nodeLength;
    }

    // Apply highlights by wrapping the DOM ranges with <mark> elements
    // Iterate in reverse to avoid issues with range invalidation
    for (let i = domRanges.length - 1; i >= 0; i--) {
      const { range, highlight } = domRanges[i];
      try {
        const mark = document.createElement('mark');
        mark.className = highlight.isNote
          ? "ielts-highlight ielts-highlight-note"
          : "ielts-highlight";
        mark.dataset.highlightId = highlight.id;
        range.surroundContents(mark);
      } catch (e) {
        console.warn("Could not surround contents with mark:", e, range);
      }
    }

    return tempDiv.innerHTML;
  }, [currentContentHighlights, mapPlainTextOffsetToDOM]);

  const processedText = useMemo(() => {
    const richText = renderRichText(text);
    return applyHighlightsToText(richText);
  }, [text, renderRichText, applyHighlightsToText]);

  // Use span wrapper when Component is 'span' to preserve inline layout
  const Wrapper = Component === 'span' ? 'span' : 'div';

  return (
    <Wrapper ref={containerRef as any} className={cn("relative", Component === 'span' && "inline")} onClick={handleExistingHighlightClick}>
      <Component
        className={cn(
          "leading-relaxed",
          // Remove prose classes if Component is 'span' to avoid block-level styling conflicts
          Component === 'div' && "prose prose-sm max-w-none [&_*]:text-inherit",
          Component === 'span' && "inline"
        )}
        style={{ fontSize: `var(--ielts-text-base, ${fontSize}px)` }}
        dangerouslySetInnerHTML={{ __html: processedText }}
      />

      {showToolbar && selectedTextInfo && (
        <div 
          id="highlight-toolbar"
          className="fixed z-[9999] bg-card border border-border rounded-lg shadow-lg p-1 flex items-center gap-1"
          style={{ 
            left: `${toolbarPosition.x}px`, 
            top: `${toolbarPosition.y}px`,
            transform: 'translate(-50%, -100%)' // Position above
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm h-8"
            onClick={handleHighlightClick}
          >
            <Highlighter size={16} className="mr-2" />
            Highlight
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm h-8"
            onClick={handleNoteClick}
          >
            <StickyNote size={16} className="mr-2" />
            Note
          </Button>
        </div>
      )}

      {showNoteInput && activeHighlightForNote && (
        <div 
          id="note-input-popup"
          className="note-input-popup fixed z-[9999] p-3 bg-card border-2 border-primary rounded-lg shadow-xl"
          style={{ 
            left: `${toolbarPosition.x}px`, 
            top: `${toolbarPosition.y}px`,
            transform: 'translateX(-50%)',
            minWidth: '220px',
            maxWidth: '320px',
          }}
        >
          <Textarea
            value={noteInputText}
            onChange={(e) => setNoteInputText(e.target.value)}
            onBlur={saveNote}
            placeholder="Add your note..."
            className="min-h-[60px] text-sm bg-background border-border text-foreground"
            autoFocus
          />
          <div className="flex gap-2 mt-2 justify-end">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={saveNote}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => { setShowNoteInput(false); setNoteInputText(''); setActiveHighlightForNote(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      {showHighlightMenu && activeHighlightClicked && (
        <div 
          id="highlight-menu"
          className="fixed z-[9999] bg-card border border-border rounded-lg shadow-lg p-1 flex flex-col min-w-[120px]"
          style={{ 
            left: `${highlightMenuPosition.x}px`, 
            top: `${highlightMenuPosition.y}px`,
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm h-8"
            onClick={handleRemoveHighlightOrNote}
          >
            <X size={16} className="mr-2" />
            Remove
          </Button>
          {activeHighlightClicked.isNote && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-sm h-8"
              onClick={handleEditNote}
            >
              <Pencil size={16} className="mr-2" />
              Edit Note
            </Button>
          )}
        </div>
      )}
    </Wrapper>
  );
}