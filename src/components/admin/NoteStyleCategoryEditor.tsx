import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { RichTextEditor, renderRichText } from './RichTextEditor';

export interface NoteItem {
  text: string;
  hasBlank: boolean;
  suffixText?: string;
  questionNumber?: number;
}

export interface NoteCategory {
  label: string;
  items: NoteItem[];
}

interface NoteStyleCategoryEditorProps {
  categories: NoteCategory[];
  onChange: (categories: NoteCategory[]) => void;
  startQuestionNumber: number;
}

export function NoteStyleCategoryEditor({
  categories,
  onChange,
  startQuestionNumber,
}: NoteStyleCategoryEditorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>(() => {
    // Expand all categories by default
    const expanded: Record<number, boolean> = {};
    categories.forEach((_, idx) => {
      expanded[idx] = true;
    });
    return expanded;
  });

  // Calculate question numbers based on items with blanks
  const getQuestionNumber = (categoryIndex: number, itemIndex: number): number | undefined => {
    let questionNum = startQuestionNumber;
    
    for (let cIdx = 0; cIdx < categories.length; cIdx++) {
      for (let iIdx = 0; iIdx < categories[cIdx].items.length; iIdx++) {
        if (categories[cIdx].items[iIdx].hasBlank) {
          if (cIdx === categoryIndex && iIdx === itemIndex) {
            return questionNum;
          }
          questionNum++;
        }
      }
    }
    return undefined;
  };

  const addCategory = () => {
    const newCategories = [...categories, { label: '', items: [{ text: '', hasBlank: true, suffixText: '' }] }];
    onChange(newCategories);
    setExpandedCategories(prev => ({ ...prev, [newCategories.length - 1]: true }));
  };

  const updateCategoryLabel = (categoryIndex: number, label: string) => {
    const newCategories = [...categories];
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], label };
    onChange(newCategories);
  };

  const removeCategory = (categoryIndex: number) => {
    const newCategories = categories.filter((_, idx) => idx !== categoryIndex);
    onChange(newCategories);
  };

  const addItem = (categoryIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      items: [...newCategories[categoryIndex].items, { text: '', hasBlank: true, suffixText: '' }]
    };
    onChange(newCategories);
  };

  const updateItem = (categoryIndex: number, itemIndex: number, updates: Partial<NoteItem>) => {
    const newCategories = [...categories];
    const items = [...newCategories[categoryIndex].items];
    items[itemIndex] = { ...items[itemIndex], ...updates };
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], items };
    onChange(newCategories);
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      items: newCategories[categoryIndex].items.filter((_, idx) => idx !== itemIndex)
    };
    onChange(newCategories);
  };

  const toggleCategory = (categoryIndex: number) => {
    setExpandedCategories(prev => ({ ...prev, [categoryIndex]: !prev[categoryIndex] }));
  };

  // Count total questions (items with blanks)
  const totalQuestions = categories.reduce((sum, cat) => 
    sum + cat.items.filter(item => item.hasBlank).length, 0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Note-Style Categories</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Define categories (left column) and their items (right column). Items with blanks become questions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{totalQuestions} questions</span>
          <Button onClick={addCategory} variant="outline" size="sm">
            <Plus size={14} className="mr-1" />
            Add Category
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground">
          <p>No categories yet. Click "Add Category" to start building the note structure.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category, catIdx) => {
            const questionCount = category.items.filter(item => item.hasBlank).length;
            
            return (
              <Collapsible 
                key={catIdx}
                open={expandedCategories[catIdx] ?? true}
                onOpenChange={() => toggleCategory(catIdx)}
              >
                <Card className="border">
                  <div className="flex items-center gap-2 p-3 bg-muted/30">
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-2 flex-1 text-left">
                        {expandedCategories[catIdx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        <span className="font-medium text-sm">
                          {category.label || `Category ${catIdx + 1}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({questionCount} question{questionCount !== 1 ? 's' : ''})
                        </span>
                      </button>
                    </CollapsibleTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeCategory(catIdx)}
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>

                  <CollapsibleContent>
                    <CardContent className="pt-3 space-y-4">
                      {/* Category Label (appears on left column) */}
                      <div className="space-y-2">
                        <Label className="text-xs">Category Label (Left Column) - supports **bold**, *italic*</Label>
                        <RichTextEditor
                          value={category.label}
                          onChange={(value) => updateCategoryLabel(catIdx, value)}
                          placeholder="e.g., Dining table:, Colours:, Location:"
                          rows={1}
                        />
                      </div>

                      {/* Items (appear on right column) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Items (Right Column)</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => addItem(catIdx)}
                          >
                            <Plus size={12} className="mr-1" />
                            Add Item
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {category.items.map((item, itemIdx) => {
                            const questionNum = getQuestionNumber(catIdx, itemIdx);
                            
                            return (
                              <div 
                                key={itemIdx} 
                                className={cn(
                                  "p-3 rounded-lg border",
                                  item.hasBlank ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 space-y-2">
                                    {/* Has Blank Toggle */}
                                    <div className="flex items-center gap-3">
                                      <Switch
                                        checked={item.hasBlank}
                                        onCheckedChange={(checked) => updateItem(catIdx, itemIdx, { hasBlank: checked })}
                                      />
                                      <span className="text-xs text-muted-foreground">
                                        {item.hasBlank ? (
                                          <span className="text-primary font-medium">
                                            Question #{questionNum} (has blank)
                                          </span>
                                        ) : (
                                          'Static text (no blank)'
                                        )}
                                      </span>
                                    </div>

                                    {item.hasBlank ? (
                                      /* Item with blank - show prefix and suffix fields */
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-muted-foreground">Text before blank (**bold**, *italic*)</Label>
                                          <RichTextEditor
                                            value={item.text}
                                            onChange={(value) => updateItem(catIdx, itemIdx, { text: value })}
                                            placeholder="e.g., medium, red"
                                            rows={1}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs text-muted-foreground">Text after blank (**bold**, *italic*)</Label>
                                          <RichTextEditor
                                            value={item.suffixText || ''}
                                            onChange={(value) => updateItem(catIdx, itemIdx, { suffixText: value })}
                                            placeholder="e.g., shape, colour, old"
                                            rows={1}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      /* Static item - just text with rich formatting */
                                      <RichTextEditor
                                        value={item.text}
                                        onChange={(value) => updateItem(catIdx, itemIdx, { text: value })}
                                        placeholder="e.g., medium size"
                                        rows={1}
                                      />
                                    )}

                                    {/* Preview */}
                                    <div className="text-xs text-muted-foreground bg-background p-2 rounded border">
                                      Preview: <span className="font-mono">
                                        - <span dangerouslySetInnerHTML={{ __html: renderRichText(item.text) }} />
                                        {item.hasBlank && <span className="mx-1 px-2 py-0.5 bg-primary/10 rounded text-primary">_{questionNum}_</span>}
                                        <span dangerouslySetInnerHTML={{ __html: renderRichText(item.suffixText || '') }} />
                                      </span>
                                    </div>
                                  </div>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 flex-shrink-0"
                                    onClick={() => removeItem(catIdx, itemIdx)}
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Live Preview */}
      {categories.length > 0 && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm font-medium mb-3 block">Live Preview</Label>
          <div className="bg-background p-4 rounded border space-y-3">
            {categories.map((category, catIdx) => (
              <div key={catIdx} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                {/* Category Label (left column) */}
                <div className="font-semibold text-foreground whitespace-nowrap pt-0.5">
                  {category.label || '(no label)'}
                </div>
                
                {/* Items (right column) */}
                <div className="space-y-0.5">
                  {category.items.map((item, itemIdx) => {
                    const questionNum = getQuestionNumber(catIdx, itemIdx);
                    
                    return (
                      <div key={itemIdx} className="flex items-center gap-1 flex-wrap leading-relaxed">
                        <span>-</span>
                        {item.text && <span>{item.text}</span>}
                        {item.hasBlank && (
                          <span className="inline-flex items-center justify-center w-16 h-6 border border-primary/50 rounded text-xs text-primary font-medium bg-primary/5">
                            {questionNum}
                          </span>
                        )}
                        {item.suffixText && <span>{item.suffixText}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
