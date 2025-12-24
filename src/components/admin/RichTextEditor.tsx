import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  rows = 3,
  className = ''
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ... keep existing code (removed unused helper)


  const wrapSelection = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    // Check if already wrapped
    const beforeSelection = value.substring(Math.max(0, start - prefix.length), start);
    const afterSelection = value.substring(end, end + suffix.length);
    
    let newText: string;
    if (beforeSelection === prefix && afterSelection === suffix) {
      // Remove wrapping
      newText = value.substring(0, start - prefix.length) + selectedText + value.substring(end + suffix.length);
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start - prefix.length, end - prefix.length);
      }, 0);
    } else {
      // Add wrapping
      newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, label: 'Bold', action: () => wrapSelection('**'), shortcut: 'Ctrl+B' },
    { icon: Italic, label: 'Italic', action: () => wrapSelection('*'), shortcut: 'Ctrl+I' },
    { icon: Underline, label: 'Underline', action: () => wrapSelection('<u>', '</u>'), shortcut: 'Ctrl+U' },
    { icon: Heading1, label: 'Heading 1', action: () => insertAtCursor('\n## '), shortcut: '' },
    { icon: Heading2, label: 'Heading 2', action: () => insertAtCursor('\n### '), shortcut: '' },
    { icon: List, label: 'Bullet List', action: () => insertAtCursor('\n• '), shortcut: '' },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertAtCursor('\n1. '), shortcut: '' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        wrapSelection('**');
      } else if (e.key === 'i') {
        e.preventDefault();
        wrapSelection('*');
      } else if (e.key === 'u') {
        e.preventDefault();
        wrapSelection('<u>', '</u>');
      }
    }
  };

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      <div className="flex items-center gap-1 p-1 bg-muted/50 border-b">
        {formatButtons.map((btn, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={btn.action}
              >
                <btn.icon size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{btn.label} {btn.shortcut && `(${btn.shortcut})`}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground pr-2">
          Use **bold**, *italic*, ## heading
        </span>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="border-0 rounded-none focus-visible:ring-0 resize-none"
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

// Auto-style common IELTS instruction keywords
function autoStyleIELTSKeywords(text: string): string {
  if (!text) return '';
  
  // Keywords to auto-bold (case-insensitive matching, preserve original case in output)
  const keywordPatterns = [
    // True/False/Yes/No/Not Given options
    /\b(TRUE|FALSE|NOT GIVEN|YES|NO)\b/gi,
    // Word count instructions
    /\b(ONE WORD ONLY|TWO WORDS|THREE WORDS|NO MORE THAN ONE WORD|NO MORE THAN TWO WORDS|NO MORE THAN THREE WORDS|ONE WORD AND\/OR A NUMBER|TWO WORDS AND\/OR A NUMBER|NO MORE THAN ONE WORD AND\/OR A NUMBER|NO MORE THAN TWO WORDS AND\/OR A NUMBER|NO MORE THAN THREE WORDS AND\/OR A NUMBER)\b/gi,
    // Number instructions
    /\b(ONE|TWO|THREE|FOUR|FIVE)\s+(correct\s+answer|correct\s+answers|letters?)\b/gi,
    // Common instruction keywords
    /\b(ONLY)\b/g,
  ];
  
  let result = text;
  
  keywordPatterns.forEach(pattern => {
    result = result.replace(pattern, (match) => {
      // Check if already wrapped in ** or <strong>
      return `**${match}**`;
    });
  });
  
  // Clean up double-bold (in case admin already bolded some keywords)
  result = result.replace(/\*\*\*\*(.+?)\*\*\*\*/g, '**$1**');
  result = result.replace(/\*\*<strong>(.+?)<\/strong>\*\*/g, '<strong>$1</strong>');
  
  return result;
}

// Helper to render rich text in display mode
export function renderRichText(text: string): string {
  if (!text) return '';
  
  // First, auto-style IELTS keywords
  let processedText = autoStyleIELTSKeywords(text);
  
  let html = processedText
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-2 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic (single asterisk, but not if it's part of double asterisk)
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Underline (already HTML)
    // Highlight
    .replace(/==(.+?)==/g, '<mark class="ielts-highlight">$1</mark>')
    // Bullet points
    .replace(/^• (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br/>');
  
  return html;
}