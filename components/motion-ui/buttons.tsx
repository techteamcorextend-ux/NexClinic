"use client";

import { useCallback, useRef, useState, type ReactNode, type Ref } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  Facebook,
  Linkedin,
  Send,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

/**
 * ─────────────────────────────────────────────────────────────────────
 *  Motion button set.
 *
 *  Seven buttons, each with its own signature interaction, so an action's
 *  motion tells you what kind of action it is before you read the label:
 *
 *   1 ConicButton     rotating spectrum ring   — primary navigation
 *   2 FlyButton       icon flies off and back  — send / submit to someone
 *   3 MorphButton     morphs into a confirmed  — save / commit
 *   4 StretchButton   arrow travels a rail     — enter / continue
 *   5 ExpandButton    opens into icon actions  — share / export
 *   6 ChevronButton   chevron hands off        — next / paginate
 *   7 DownloadButton  ring fills, then a tick  — download a file
 *
 *  Every one degrades to a plain colour change under prefers-reduced-motion.
 * ─────────────────────────────────────────────────────────────────────
 */

type BaseProps = {
  children?: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
};

/** Renders a <Link> when `href` is set, a <button> otherwise. */
function Shell({
  href,
  onClick,
  disabled,
  type = "button",
  className,
  ariaLabel,
  children,
  innerRef,
}: BaseProps & { innerRef?: Ref<HTMLButtonElement> }) {
  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button
      ref={innerRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </button>
  );
}

/* ── 1 · Conic ring ────────────────────────────────────────────────── */

export function ConicButton({ children, className, ...rest }: BaseProps) {
  return (
    <Shell
      {...rest}
      className={cn(
        "btn-conic relative inline-flex items-center justify-center gap-2 rounded-full bg-p-ink px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-p-ink/90",
        className,
      )}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Shell>
  );
}

/* ── 2 · Icon flies off and comes back ─────────────────────────────── */

export function FlyButton({
  children,
  className,
  icon,
  ...rest
}: BaseProps & { icon?: ReactNode }) {
  return (
    <Shell
      {...rest}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-p-ink px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-p-ink/90",
        className,
      )}
    >
      <span className="grid place-items-center group-hover:animate-btn-fly motion-reduce:animate-none">
        {icon ?? <Send className="h-4 w-4" aria-hidden="true" />}
      </span>
      {children}
    </Shell>
  );
}

/* ── 3 · Morphs into its confirmed state ───────────────────────────── */

export function MorphButton({
  children,
  className,
  doneLabel = "Thanks!",
  onClick,
  type = "button",
  disabled,
}: BaseProps & { doneLabel?: string }) {
  const [done, setDone] = useState(false);
  const reduced = useReducedMotionSafe();

  return (
    <motion.button
      type={type}
      disabled={disabled}
      layout
      transition={{ duration: reduced ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => {
        onClick?.();
        setDone(true);
        window.setTimeout(() => setDone(false), 2200);
      }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3 text-sm font-semibold transition-colors duration-400 disabled:pointer-events-none disabled:opacity-60",
        done
          ? "bg-p-grad text-white shadow-lift"
          : "border border-p-line bg-white dark:bg-surface text-p-ink hover:border-p-ink/25",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={done ? "done" : "idle"}
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -8 }}
          transition={{ duration: reduced ? 0 : 0.22 }}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          {done ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              {doneLabel}
            </>
          ) : (
            children
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/* ── 4 · Arrow travels a widening rail ─────────────────────────────── */

export function StretchButton({ children, className, ...rest }: BaseProps) {
  return (
    <Shell
      {...rest}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-p-grad px-7 py-3.5 text-sm font-semibold text-white shadow-lift transition-[padding,transform] duration-400 ease-out-soft hover:pr-12 active:scale-[0.99] motion-reduce:hover:pr-7",
        className,
      )}
    >
      {/* Sheen that sweeps across on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out-soft group-hover:translate-x-full motion-reduce:hidden"
      />
      <span className="relative z-10 whitespace-nowrap">{children}</span>
      <ArrowRight
        aria-hidden="true"
        className="relative z-10 h-4 w-4 transition-transform duration-400 ease-out-soft group-hover:translate-x-3 motion-reduce:transform-none"
      />
    </Shell>
  );
}

/* ── 5 · Opens into a row of icon actions ──────────────────────────── */

export function ExpandButton({
  children,
  className,
  actions,
  ...rest
}: BaseProps & { actions?: { label: string; icon: ReactNode }[] }) {
  const items =
    actions ?? [
      { label: "Share on X", icon: <Twitter className="h-4 w-4" /> },
      { label: "Share on Facebook", icon: <Facebook className="h-4 w-4" /> },
      { label: "Share on LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
    ];

  return (
    <Shell
      {...rest}
      className={cn(
        "group relative inline-flex h-11 w-[8.5rem] items-center justify-center overflow-hidden rounded-full bg-p-grad text-sm font-semibold text-white shadow-lift transition-[width] duration-400 ease-out-soft hover:w-[12.5rem] motion-reduce:hover:w-[8.5rem]",
        className,
      )}
    >
      <span className="absolute inset-0 flex items-center justify-center gap-2 opacity-100 transition-opacity duration-200 group-hover:opacity-0 motion-reduce:group-hover:opacity-100">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center gap-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
      >
        {items.map((item) => (
          <span key={item.label} title={item.label} className="grid place-items-center">
            {item.icon}
          </span>
        ))}
      </span>
    </Shell>
  );
}

/* ── 6 · Chevron hands off to the next one ─────────────────────────── */

export function ChevronButton({ children, className, ...rest }: BaseProps) {
  return (
    <Shell
      {...rest}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-full border border-p-line bg-p-card px-5 py-2.5 text-sm font-semibold text-p-ink transition-colors duration-300 hover:border-p-ink/25",
        className,
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className="relative grid h-4 w-4 place-items-center overflow-hidden"
      >
        <ChevronRight className="absolute h-4 w-4 transition-transform duration-400 ease-out-soft group-hover:translate-x-5 motion-reduce:transform-none" />
        <ChevronRight className="absolute h-4 w-4 -translate-x-5 transition-transform duration-400 ease-out-soft group-hover:translate-x-0 motion-reduce:translate-x-0" />
      </span>
    </Shell>
  );
}

/* ── 7 · Download: ring fills, then a tick ─────────────────────────── */

export function DownloadButton({
  children = "Download",
  className,
  onDownload,
  fileLabel,
}: {
  children?: ReactNode;
  className?: string;
  /** Do the real work — build the blob and trigger the browser download. */
  onDownload: () => void;
  /** Announced to screen readers when the file is ready. */
  fileLabel?: string;
}) {
  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const timers = useRef<number[]>([]);
  const reduced = useReducedMotionSafe();

  const run = useCallback(() => {
    if (state !== "idle") return;
    setState("working");
    onDownload();
    timers.current.forEach(window.clearTimeout);
    timers.current = [
      window.setTimeout(() => setState("done"), reduced ? 120 : 1100),
      window.setTimeout(() => setState("idle"), reduced ? 900 : 2900),
    ];
  }, [state, onDownload, reduced]);

  return (
    <button
      type="button"
      onClick={run}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-p-ink px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-p-ink/90",
        className,
      )}
    >
      <span className="relative grid h-5 w-5 place-items-center">
        {/* Progress ring */}
        <svg
          className="absolute inset-0 h-5 w-5 -rotate-90"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <circle
            cx="10"
            cy="10"
            r="8.5"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="1.6"
          />
          <motion.circle
            cx="10"
            cy="10"
            r="8.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: state === "idle" ? 0 : 1 }}
            transition={{ duration: reduced ? 0 : 1, ease: "easeInOut" }}
          />
        </svg>

        <AnimatePresence mode="wait" initial={false}>
          {state === "done" ? (
            <motion.span
              key="tick"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
            >
              <Check className="h-3 w-3" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="arrow"
              initial={{ y: -6, opacity: 0 }}
              animate={{
                y: state === "working" && !reduced ? [0, 3, 0] : 0,
                opacity: 1,
              }}
              exit={{ y: 6, opacity: 0 }}
              transition={
                state === "working" && !reduced
                  ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
                  : { duration: reduced ? 0 : 0.2 }
              }
            >
              <Download className="h-3 w-3" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span className="whitespace-nowrap">
        {state === "working" ? "Preparing…" : state === "done" ? "Saved" : children}
      </span>

      <span role="status" className="sr-only">
        {state === "done" ? `${fileLabel ?? "File"} downloaded` : ""}
      </span>
    </button>
  );
}
