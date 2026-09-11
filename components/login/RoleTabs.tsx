"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LOGIN_ROLES } from "@/lib/login-data";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

type RoleTabsProps = {
  value: string;
  onChange: (id: string) => void;
  /** id of the element these tabs control (the form panel). */
  panelId: string;
};

/**
 * Horizontal, scrollable login-type switcher.
 *
 * Built as a real ARIA tablist rather than a row of buttons: arrow keys move
 * between tabs, Home/End jump to the ends, and only the active tab is in the
 * page tab order (roving tabindex). The active pill is a shared-layout element,
 * so it slides between tabs instead of popping.
 */
export function RoleTabs({ value, onChange, panelId }: RoleTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const reduced = useReducedMotionSafe();
  const [overflow, setOverflow] = useState({ left: false, right: false });

  const syncOverflow = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const maxScroll = list.scrollWidth - list.clientWidth;
    setOverflow({
      left: list.scrollLeft > 4,
      right: list.scrollLeft < maxScroll - 4,
    });
  }, []);

  useEffect(() => {
    syncOverflow();
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(syncOverflow);
    observer.observe(list);
    return () => observer.disconnect();
  }, [syncOverflow]);

  // Keep the selected tab in view when it changes (including via keyboard).
  useEffect(() => {
    const tab = tabRefs.current[value];
    tab?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [value, reduced]);

  const scrollBy = (direction: -1 | 1) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({
      left: direction * list.clientWidth * 0.7,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const index = LOGIN_ROLES.findIndex((role) => role.id === value);
    let next = index;

    if (event.key === "ArrowRight") next = (index + 1) % LOGIN_ROLES.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + LOGIN_ROLES.length) % LOGIN_ROLES.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = LOGIN_ROLES.length - 1;
    else return;

    event.preventDefault();
    const id = LOGIN_ROLES[next].id;
    onChange(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <div className="relative">
      {/* Edge arrows — shown only when there is more to scroll to */}
      <button
        type="button"
        aria-label="Scroll login types left"
        onClick={() => scrollBy(-1)}
        className={cn(
          "absolute left-0 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-line bg-white dark:bg-p-card text-ink shadow-soft transition-opacity duration-200",
          overflow.left ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Scroll login types right"
        onClick={() => scrollBy(1)}
        className={cn(
          "absolute right-0 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-line bg-white dark:bg-p-card text-ink shadow-soft transition-opacity duration-200",
          overflow.right ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Fade masks at both ends so the row reads as scrollable */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent transition-opacity duration-200",
          overflow.left ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent transition-opacity duration-200",
          overflow.right ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={listRef}
        role="tablist"
        aria-label="Choose a login type"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        onScroll={syncOverflow}
        className="no-scrollbar flex snap-x gap-2 overflow-x-auto scroll-smooth py-1"
      >
        {LOGIN_ROLES.map((role) => {
          const selected = role.id === value;
          const Icon = role.icon;

          return (
            <button
              key={role.id}
              ref={(node) => {
                tabRefs.current[role.id] = node;
              }}
              type="button"
              role="tab"
              id={`login-tab-${role.id}`}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(role.id)}
              className={cn(
                "relative shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-200",
                selected ? "text-white" : "text-ink-muted hover:text-ink",
              )}
            >
              {selected ? (
                <motion.span
                  layoutId="login-tab-pill"
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-rose-500 to-blue-600 shadow-lift"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full border border-line bg-white dark:bg-p-card"
                />
              )}

              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">{role.short}</span>
                <span className="hidden sm:inline">{role.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RoleTabs;
