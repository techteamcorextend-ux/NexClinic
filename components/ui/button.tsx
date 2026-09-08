"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** shadcn/ui Button, restyled to the Nexclinic design system (pill shapes only). */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[transform,background-color,color,box-shadow] duration-300 ease-out-soft disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.03] active:scale-[0.99] motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        solid: "bg-ink text-white shadow-soft hover:bg-[#1b1b22]",
        gradient: "bg-accent-gradient-strong text-white shadow-lift",
        outline:
          "border border-line bg-white text-ink hover:border-ink/25 hover:bg-surface",
        ghost: "text-ink hover:bg-surface",
        glass: "glass text-ink shadow-soft",
      },
      size: {
        md: "px-6 py-3 text-sm md:text-base",
        sm: "px-4 py-2 text-sm",
        lg: "px-8 py-4 text-base md:text-lg",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
