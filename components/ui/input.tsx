"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** shadcn/ui Input, restyled: white field, hairline border, 16px radius. */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-12 w-full rounded-chip border border-line bg-white px-4 text-base text-ink placeholder:text-ink-muted/70 transition-colors duration-300 hover:border-ink/20 focus:border-accent-end focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full resize-y rounded-chip border border-line bg-white px-4 py-3 text-base leading-relaxed text-ink placeholder:text-ink-muted/70 transition-colors duration-300 hover:border-ink/20 focus:border-accent-end focus:outline-none",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Input, Textarea };
