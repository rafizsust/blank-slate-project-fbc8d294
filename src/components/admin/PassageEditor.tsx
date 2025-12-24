import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface Paragraph {
  id?: string;
  label: string;
  content: string;
  is_heading: boolean;
  order_index: number;
}

interface Passage {
  id?: string;
  passage_number: number;
  title: string;
  subtitle?: string;
  paragraphs: Paragraph[];
  show_labels?: boolean;
}

interface PassageEditorProps {
  passage: Passage;
  onUpdate: (updates: Partial<Passage>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const generateLabel = (index: number): string => {
  return String.fromCharCode(65 + index); // A, B, C, D...
};

export function PassageEditor({ passage, onUpdate, onRemove, canRemove }: PassageEditorProps) {
  const addParagraph = () => {
    const newIndex = passage.paragraphs.length;
    const newParagraph: Paragraph = {
      label: generateLabel(newIndex),
      content: '',
      is_heading: false,
      order_index: newIndex
    };
    onUpdate({ paragraphs: [...passage.paragraphs, newParagraph] });
  };

  const updateParagraph = (index: number, updates: Partial<Paragraph>) => {
    const newParagraphs = [...passage.paragraphs];
    newParagraphs[index] = { ...newParagraphs[index], ...updates };
    onUpdate({ paragraphs: newParagraphs });
  };

  const removeParagraph = (index: number) => {
    const newParagraphs = passage.paragraphs
      .filter((_, i) => i !== index)
      .map((p, i) => ({
        ...p,
        label: generateLabel(i),
        order_index: i
      }));
    onUpdate({ paragraphs: newParagraphs });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Passage {passage.passage_number}</CardTitle>
        {canRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 size={18} className="text-destructive" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Passage Title */}
        <div className="space-y-2">
          <Label>Passage Title</Label>
          <Input
            value={passage.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter the title of the reading passage"
          />
        </div>

        {/* Passage Subtitle (optional) */}
        <div className="space-y-2">
          <Label>Subtitle (optional)</Label>
          <Input
            value={passage.subtitle || ''}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            placeholder="Enter an optional subtitle or sub-heading"
          />
        </div>

        {/* Show Labels Toggle */}
        <div className="flex items-center gap-3">
          <Switch
            checked={passage.show_labels !== false}
            onCheckedChange={(checked) => onUpdate({ show_labels: checked })}
          />
          <Label>Show paragraph labels (A, B, C...)</Label>
        </div>

        {/* Paragraphs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Paragraphs</Label>
            <Button variant="outline" size="sm" onClick={addParagraph}>
              <Plus size={16} className="mr-1" />
              Add Paragraph
            </Button>
          </div>

          {passage.paragraphs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>No paragraphs yet. Click "Add Paragraph" to start.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {passage.paragraphs.map((paragraph, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 bg-muted/30"
                >
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="mt-2 cursor-move text-muted-foreground">
                      <GripVertical size={20} />
                    </div>

                    {/* Label */}
                    <div className="w-20 space-y-2">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={paragraph.label}
                        onChange={(e) => updateParagraph(index, { label: e.target.value })}
                        className="text-center font-bold"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Content (supports **bold**, *italic*)</Label>
                      <RichTextEditor
                        value={paragraph.content}
                        onChange={(value) => updateParagraph(index, { content: value })}
                        placeholder="Enter paragraph text..."
                        rows={4}
                      />
                    </div>

                    {/* Delete Button */}
                    <div className="space-y-4">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeParagraph(index)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
