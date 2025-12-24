import { cn } from '@/lib/utils';

interface QuestionNumberBadgeProps {
  number: number;
  isActive?: boolean;
  isAnswered?: boolean;
  variant?: 'outline' | 'filled' | 'boxed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * IELTS Official Style Question Number Badge
 * - boxed: Always shows bordered box like [1] - Inspera style
 * - outline: Border only when active
 * - filled: Background color when active/answered
 */
export function QuestionNumberBadge({
  number,
  isActive = false,
  isAnswered = false,
  variant = 'boxed',
  size = 'md',
  className,
}: QuestionNumberBadgeProps) {
  const sizeClasses = {
    sm: 'min-w-[18px] h-[18px] text-xs px-0.5',
    md: 'min-w-[22px] h-[22px] text-sm px-0.5',
    lg: 'min-w-[26px] h-[26px] text-base px-1',
  };

  // Boxed variant (IELTS Inspera official style) - always shows border like [1]
  if (variant === 'boxed') {
    return (
      <span
        className={cn(
          "ielts-question-badge inline-flex items-center justify-center font-bold leading-none tabular-nums text-center border",
          sizeClasses[size],
          "bg-[hsl(var(--ielts-badge-bg,0_0%_100%))] border-[hsl(var(--ielts-badge-border,0_0%_40%))] text-[hsl(var(--ielts-badge-text,0_0%_20%))]",
          isActive && "border-[hsl(var(--ielts-input-focus))] border-2",
          isAnswered && !isActive && "bg-[hsl(160_60%_45%)] text-white border-[hsl(160_60%_45%)]",
          className
        )}
      >
        {number}
      </span>
    );
  }

  // Filled variant - background color when active or answered
  if (variant === 'filled') {
    return (
      <span
        className={cn(
          "flex-shrink-0 rounded grid place-items-center font-bold leading-none tabular-nums text-center border",
          sizeClasses[size],
          isActive
            ? "bg-primary text-primary-foreground border-primary"
            : isAnswered
              ? "bg-[hsl(160_60%_45%)] text-white border-[hsl(160_60%_45%)]"
              : "bg-background text-foreground border-border",
          className
        )}
      >
        {number}
      </span>
    );
  }

  // Outline variant - border only when active
  return (
    <span
      className={cn(
        "flex-shrink-0 inline-flex items-center justify-center font-bold leading-none tabular-nums text-center",
        sizeClasses[size],
        "text-[hsl(var(--ielts-badge-text,0_0%_20%))]",
        isActive && "border border-[hsl(var(--ielts-input-focus))]",
        className
      )}
    >
      {number}
    </span>
  );
}
