"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

/* ── Card ──────────────────────────────────────────────────────────── */

export function PCard({
  className,
  children,
  as: Tag = "div",
  variant = "solid",
}: {
  className?: string;
  children: ReactNode;
  as?: "div" | "section" | "article" | "li";
  /** `glass` swaps the surface classes rather than layering over them, so the
   *  translucent background and border can't be fought by `bg-p-card`. */
  variant?: "solid" | "glass";
}) {
  return (
    <Tag
      className={cn(
        "rounded-[22px] p-5 shadow-[0_4px_24px_rgba(16,24,40,0.05)] md:p-6",
        variant === "glass" ? "p-glass" : "border border-p-line bg-p-card",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * A card that is entirely a link. Used for every clickable tile on the
 * dashboards — the whole surface is the hit target, and it lifts on hover so
 * it is obvious it goes somewhere.
 */
export function PLinkCard({
  href,
  className,
  children,
  label,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  /** Announced destination, when the visible content isn't self-describing. */
  label?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "group block rounded-[22px] border border-p-line bg-p-card p-5 shadow-[0_4px_24px_rgba(16,24,40,0.05)] transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:border-p-accent/40 hover:shadow-[0_18px_40px_rgba(16,24,40,0.12)] motion-reduce:hover:translate-y-0 md:p-6",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ── Headings ──────────────────────────────────────────────────────── */

export function SectionTitle({
  title,
  action,
  as: Tag = "h2",
  className,
}: {
  title: string;
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <Tag className="text-base font-semibold tracking-tight text-p-ink">{title}</Tag>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ── Reveal ────────────────────────────────────────────────────────
   Triggers off the scroll viewport rather than mount, so content further
   down a page animates into place as it's scrolled to. `once: false` makes
   the reveal replay every time an element re-enters the viewport, and
   reverts it to hidden when scrolled back out — so scrolling up undoes the
   reveal, and scrolling down plays it again.
*/

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotionSafe();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "0px 0px -60px 0px" }}
      transition={{
        duration: reduced ? 0.15 : 0.5,
        delay: reduced ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Avatar ────────────────────────────────────────────────────────── */

const TONES = [
  "from-[#60A5FA] to-[#6366F1]",
  "from-[#34D399] to-[#0D9488]",
  "from-[#F472B6] to-[#A855F7]",
  "from-[#FBBF24] to-[#F97316]",
];

export function PAvatar({
  initials,
  name,
  index = 0,
  size = "md",
  className,
}: {
  initials: string;
  name: string;
  index?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      title={name}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-white",
        TONES[index % TONES.length],
        size === "sm" && "h-8 w-8 text-[11px]",
        size === "md" && "h-10 w-10 text-xs",
        size === "lg" && "h-14 w-14 text-sm",
        className,
      )}
    >
      {initials}
    </span>
  );
}

/* ── Status pill ───────────────────────────────────────────────────── */

const PILL_TONES: Record<string, string> = {
  Stable: "bg-emerald-50 text-emerald-700",
  "Follow-up": "bg-amber-50 text-amber-700",
  Critical: "bg-rose-50 text-rose-700",
  "In consult": "bg-indigo-50 text-indigo-700",
  Ready: "bg-emerald-50 text-emerald-700",
  Waiting: "bg-amber-50 text-amber-700",
  "Checked in": "bg-emerald-50 text-emerald-700",
  Expected: "bg-sky-50 text-sky-700",
  "No show": "bg-rose-50 text-rose-700",
  Unsent: "bg-rose-500/15 text-rose-300",
  Viewed: "bg-white/10 text-white/70",
  Approved: "bg-emerald-500/15 text-emerald-300",
  Completed: "bg-emerald-50 text-emerald-700",
  "In progress": "bg-indigo-50 text-indigo-700",
};

export function PPill({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold",
        PILL_TONES[tone ?? ""] ?? "bg-p-soft text-p-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Stat tile ─────────────────────────────────────────────────────── */

export function PStat({
  label,
  value,
  unit,
  delta,
  icon,
  tone = "plain",
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  icon?: ReactNode;
  tone?: "plain" | "accent" | "warm" | "cool";
  className?: string;
}) {
  const filled = tone === "accent";
  return (
    <div
      className={cn(
        "rounded-[20px] border p-4",
        filled
          ? "border-transparent bg-p-grad text-white shadow-lift"
          : "border-p-line bg-p-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-xs font-medium",
            filled ? "text-white/90" : "text-p-muted",
          )}
        >
          {label}
        </p>
        {icon ? (
          <span className={cn("shrink-0", filled ? "text-white/85" : "text-p-accent")}>
            {icon}
          </span>
        ) : null}
      </div>

      <p
        className={cn(
          "mt-3 text-2xl font-bold tracking-tight md:text-3xl",
          filled ? "text-white" : "text-p-ink",
        )}
      >
        {value}
        {unit ? (
          <span
            className={cn(
              "ml-1 text-sm font-medium",
              filled ? "text-white/80" : "text-p-muted",
            )}
          >
            {unit}
          </span>
        ) : null}
      </p>

      {delta ? (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            filled ? "text-white/85" : "text-p-muted",
          )}
        >
          {delta}
        </p>
      ) : null}
    </div>
  );
}
