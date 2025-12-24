import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Base Input component with IELTS Official styling option
 * Use ielts-input class for IELTS exam style
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

/**
 * IELTS Official Style Input
 * Clean bordered input matching Inspera exam interface
 */
const IELTSInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { questionNumber?: number }>(
  ({ className, type, questionNumber, ...props }, ref) => {
    return (
      <span className="ielts-input-wrapper inline-flex items-center relative">
        {questionNumber !== undefined && (
          <span className="ielts-input-number absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+6px)] font-bold text-sm text-[hsl(var(--ielts-badge-text,0_0%_20%))] border border-[hsl(var(--ielts-badge-border,0_0%_40%))] min-w-[22px] h-[22px] inline-flex items-center justify-center">
            {questionNumber}
          </span>
        )}
        <input
          type={type}
          className={cn(
            // IELTS Inspera style: clean border, no rounded corners, minimal styling
            "ielts-input h-7 px-2 text-sm border border-[hsl(var(--ielts-input-border))] bg-[hsl(var(--ielts-input-bg,0_0%_100%))]",
            "text-foreground placeholder:text-muted-foreground/60",
            "focus:outline-none focus:border-[hsl(var(--ielts-input-focus))] focus:border-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
      </span>
    );
  },
);
IELTSInput.displayName = "IELTSInput";

export { Input, IELTSInput };
