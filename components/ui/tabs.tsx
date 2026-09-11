"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** shadcn/ui Tabs, restyled: pill track on the page background. */
const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-admin-bg p-1",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-admin-muted transition-all duration-300 ease-out-soft hover:-translate-y-px hover:text-admin-ink active:translate-y-0 active:scale-[0.97] data-[state=active]:text-admin-ink motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
      // The active pill itself: no shared layoutId here (each trigger mounts
      // independently), so it fades/scales in on its own, but the colour and
      // shadow transitions above still carry the hand-off between triggers.
      "data-[state=active]:shadow-admin data-[state=active]:before:absolute data-[state=active]:before:inset-0 data-[state=active]:before:-z-10 data-[state=active]:before:rounded-full data-[state=active]:before:bg-white dark:data-[state=active]:before:bg-admin-card data-[state=active]:before:content-['']",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-5 focus-visible:outline-none", className)}
    {...props}
    asChild
  >
    {/* Radix unmounts inactive panels by default, so this replays on every
        switch rather than only once on first mount. */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  </TabsPrimitive.Content>
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
