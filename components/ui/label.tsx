"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

/** shadcn/ui Label, restyled as a small-caps field label. */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-ink-muted",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
