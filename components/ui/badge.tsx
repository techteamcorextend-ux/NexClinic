import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Status badge. Colour is never the only signal — every badge renders its
 * label as text, and status badges also carry a small shape marker.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-admin-bg text-admin-ink",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-rose-50 text-rose-700",
        info: "bg-sky-50 text-sky-700",
        purple: "bg-violet-50 text-violet-700",
        pink: "bg-pink-50 text-pink-700",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

const DOT_TONE: Record<string, string> = {
  neutral: "bg-admin-muted",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  purple: "bg-violet-500",
  pink: "bg-pink-500",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean;
}

export function Badge({
  className,
  tone,
  withDot = true,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {withDot ? (
        <span
          aria-hidden="true"
          className={cn("h-1.5 w-1.5 rounded-full", DOT_TONE[tone ?? "neutral"])}
        />
      ) : null}
      {children}
    </span>
  );
}

export { badgeVariants };
