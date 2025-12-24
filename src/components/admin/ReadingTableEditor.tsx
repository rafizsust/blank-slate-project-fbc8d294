import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MultipleAnswersInput } from './MultipleAnswersInput';
import { RichTextEditor } from './RichTextEditor';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TableCellData {
  has_question: boolean;
  content: string;
  correct_answer?: string;
  question_number?: number;
  alignment?: 'left' | 'center' | 'right';
}

type TableRowData = TableCellData[];
type TableData = TableRowData[];

export interface ReadingTableEditorData {
  rows: TableData;
  heading?: string;
  headingAlignment?: 'left' | 'center' | 'right';
}

interface ReadingTableEditorProps {
  value: ReadingTableEditorData | TableData;
  onChange: (data: ReadingTableEditorData) => void;
  startQuestionNumber: number;
  endQuestionNumber: number;
}

const DEFAULT_CELL: TableCellData = { has_question: false, content: '', alignment: 'left' };

// Helper to normalize input value to ReadingTableEditorData
function normalizeValue(value: ReadingTableEditorData | TableData): ReadingTableEditorData {
  if (Array.isArray(value)) {
    // Legacy format - convert to new format
    return {
      rows: value.length > 0 ? value : [[{ ...DEFAULT_CELL }, { ...DEFAULT_CELL }]],
      heading: '',
      headingAlignment: 'left',
    };
  }
  // New format
  return {
    rows: value.rows?.length > 0 ? value.rows : [[{ ...DEFAULT_CELL }, { ...DEFAULT_CELL }]],
    heading: value.heading || '',
    headingAlignment: value.headingAlignment || 'left',
  };
}

export function ReadingTableEditor({ value, onChange, startQuestionNumber, endQuestionNumber }: ReadingTableEditorProps) {
  const [editorData, setEditorData] = useState<ReadingTableEditorData>(() => normalizeValue(value));

  // Effect to update parent component when internal editorData changes
  useEffect(() => {
    onChange(editorData);
  }, [editorData, onChange]);

  // Effect to assign question numbers to cells with 'has_question' checked
  useEffect(() => {
    let currentQNum = startQuestionNumber;
    setEditorData(prevData => {
      const newRows = prevData.rows.map(row => row.map(cell => {
        if (cell.has_question) {
          const newCell = { ...cell, question_number: currentQNum };
          currentQNum++;
          return newCell;
        }
        return { ...cell, question_number: undefined, correct_answer: undefined };
      }));
      return { ...prevData, rows: newRows };
    });
  }, [editorData.rows.flat().filter(c => c.has_question).length, startQuestionNumber]);

  const updateCell = useCallback((rowIndex: number, colIndex: number, updates: Partial<TableCellData>) => {
    setEditorData(prevData => {
      const newRows = [...prevData.rows];
      newRows[rowIndex] = [...newRows[rowIndex]];
      newRows[rowIndex][colIndex] = { ...newRows[rowIndex][colIndex], ...updates };
      return { ...prevData, rows: newRows };
    });
  }, []);

  const addRow = useCallback(() => {
    setEditorData(prevData => {
      const numCols = prevData.rows[0]?.length || 2;
      return { ...prevData, rows: [...prevData.rows, Array(numCols).fill(null).map(() => ({ ...DEFAULT_CELL }))] };
    });
  }, []);

  const removeRow = useCallback((rowIndex: number) => {
    if (editorData.rows.length <= 1) return;
    setEditorData(prevData => ({ ...prevData, rows: prevData.rows.filter((_, i) => i !== rowIndex) }));
  }, [editorData.rows]);

  const addColumn = useCallback(() => {
    setEditorData(prevData => ({ ...prevData, rows: prevData.rows.map(row => [...row, { ...DEFAULT_CELL }]) }));
  }, []);

  const removeColumn = useCallback((colIndex: number) => {
    if (editorData.rows[0]?.length <= 1) return;
    setEditorData(prevData => ({ ...prevData, rows: prevData.rows.map(row => row.filter((_, i) => i !== colIndex)) }));
  }, [editorData.rows]);

  const updateHeading = useCallback((heading: string) => {
    setEditorData(prevData => ({ ...prevData, heading }));
  }, []);

  const updateHeadingAlignment = useCallback((headingAlignment: 'left' | 'center' | 'right') => {
    setEditorData(prevData => ({ ...prevData, headingAlignment }));
  }, []);

  const totalQuestions = editorData.rows.flat().filter(c => c.has_question).length;
  const maxAllowedQuestions = endQuestionNumber - startQuestionNumber + 1;
  const isQuestionCountValid = totalQuestions <= maxAllowedQuestions;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Table Heading Section */}
        <div className="p-4 border rounded-md bg-muted/30 space-y-3">
          <Label className="text-sm font-medium">Table Heading (Optional)</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                value={editorData.heading || ''}
                onChange={(e) => updateHeading(e.target.value)}
                placeholder="Enter table heading (e.g., 'Types of Plant Species')"
              />
            </div>
            <div>
              <Select
                value={editorData.headingAlignment || 'left'}
                onValueChange={(value) => updateHeadingAlignment(value as 'left' | 'center' | 'right')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus size={14} className="mr-1" /> Add Row
          </Button>
          <Button variant="outline" size="sm" onClick={addColumn}>
            <Plus size={14} className="mr-1" /> Add Column
          </Button>
        </div>

        {!isQuestionCountValid && (
          <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-md p-3 text-sm">
            ⚠️ Warning: You have {totalQuestions} questions, but the question group range ({startQuestionNumber}-{endQuestionNumber}) only allows {maxAllowedQuestions} questions. Adjust the range or number of questions.
          </div>
        )}

        <div className="overflow-x-auto border rounded-md">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-200 dark:bg-gray-700">
                <TableHead className="w-10 bg-inherit"></TableHead>
                {editorData.rows[0]?.map((_, colIndex) => (
                  <TableHead key={colIndex} className="relative text-center bg-inherit">
                    Column {colIndex + 1}
                    {editorData.rows[0].length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeColumn(colIndex)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {editorData.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="w-10 relative">
                    <span className="text-sm font-medium text-muted-foreground">{rowIndex + 1}</span>
                    {editorData.rows.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRow(rowIndex)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </TableCell>
                  {row.map((cell, colIndex) => (
                    <TableCell key={colIndex} className="p-2 border">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`has-question-${rowIndex}-${colIndex}`} className="text-xs text-muted-foreground flex items-center gap-1">
                            Have Question
                            <Tooltip>
                              <TooltipTrigger>
                                <Info size={12} className="text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Check if this cell contains a question for the test taker.</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Checkbox
                            id={`has-question-${rowIndex}-${colIndex}`}
                            checked={cell.has_question}
                            onCheckedChange={(checked) => updateCell(rowIndex, colIndex, { has_question: checked as boolean })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Text Alignment</Label>
                          <Select
                            value={cell.alignment || 'left'}
                            onValueChange={(value) => updateCell(rowIndex, colIndex, { alignment: value as 'left' | 'center' | 'right' })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {cell.has_question ? (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                              Question {cell.question_number} Text
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info size={12} className="text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>Use `_____` (five underscores) to mark the blank position.</p>
                                  <p className="mt-1">Example: "The answer is _____."</p>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                            <RichTextEditor
                              value={cell.content}
                              onChange={(value) => updateCell(rowIndex, colIndex, { content: value })}
                              placeholder={`Enter question text for Q${cell.question_number} with blanks (e.g., 'The answer is _____.')`}
                              rows={2}
                            />
                            <Label className="text-xs text-muted-foreground">
                              Correct Answer(s)
                            </Label>
                            <MultipleAnswersInput
                              value={cell.correct_answer || ''}
                              onChange={(value) => updateCell(rowIndex, colIndex, { correct_answer: value })}
                              questionType="FILL_IN_BLANK"
                              placeholder={`Answer for Q${cell.question_number}`}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Static Text</Label>
                            <RichTextEditor
                              value={cell.content}
                              onChange={(value) => updateCell(rowIndex, colIndex, { content: value })}
                              placeholder="Enter static text for this cell..."
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
