import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MultiSelectAnswerInputProps {
  value: string; // Comma-separated string of correct options (e.g., "A,C")
  onChange: (value: string) => void;
  options: string[]; // Array of available options (e.g., ["Option A text", "Option B text"])
  optionFormat?: string; // Format for displaying option labels (e.g., 'A', '1', 'i')
  maxSelections?: number; // Maximum number of selections allowed
}

// Helper function to get option label (A, B, C or 1, 2, 3 etc.)
const getOptionLabel = (index: number, format: string | null | undefined) => {
  if (format === '1') return String(index + 1);
  if (format === 'i') {
    const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
    return romanNumerals[index] || String(index + 1);
  }
  return String.fromCharCode(65 + index); // Default to 'A' format
};

export function MultiSelectAnswerInput({
  value,
  onChange,
  options,
  optionFormat = 'A',
  maxSelections,
}: MultiSelectAnswerInputProps) {
  const selectedAnswers = value ? value.split(',').filter(Boolean) : [];

  const handleCheckboxChange = (optionText: string, checked: boolean) => {
    const optionValue = getOptionLabel(options.indexOf(optionText), optionFormat);
    let newAnswers: string[];

    if (checked) {
      // If maxSelections is set and we're at the limit, don't add more
      if (maxSelections && selectedAnswers.length >= maxSelections) {
        return;
      }
      newAnswers = [...selectedAnswers, optionValue];
    } else {
      newAnswers = selectedAnswers.filter(a => a !== optionValue);
    }
    onChange(newAnswers.join(','));
  };

  const isAtMaxSelections = maxSelections ? selectedAnswers.length >= maxSelections : false;

  return (
    <div className="space-y-2">
      {maxSelections && (
        <p className={cn(
          "text-sm",
          selectedAnswers.length === maxSelections ? "text-green-600 font-medium" : "text-muted-foreground"
        )}>
          Selected: {selectedAnswers.length}/{maxSelections}
        </p>
      )}
      {options.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No options defined for this question group. Please add options above.
        </p>
      )}
      {options.map((optionText, idx) => {
        const optionValue = getOptionLabel(idx, optionFormat);
        const isChecked = selectedAnswers.includes(optionValue);
        const isDisabled = !isChecked && isAtMaxSelections;

        return (
          <div key={idx} className="flex items-start space-x-3">
            <Checkbox
              id={`multi-select-option-${optionValue}`}
              checked={isChecked}
              disabled={isDisabled}
              onCheckedChange={(checked) => handleCheckboxChange(optionText, checked as boolean)}
              className={cn(
                "mt-0.5",
                "border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            />
            <Label
              htmlFor={`multi-select-option-${optionValue}`}
              className={cn(
                "text-sm cursor-pointer leading-relaxed flex items-start gap-2",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="font-bold text-primary flex-shrink-0">
                {optionValue}.
              </span>
              <span>{optionText}</span>
            </Label>
          </div>
        );
      })}
    </div>
  );
}