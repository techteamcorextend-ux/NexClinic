"use client";

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./use-media-query";

/* ───────────────────────────── Card ───────────────────────────── */

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-admin bg-admin-card p-5 shadow-admin md:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeading({
  title,
  description,
  action,
  as: Tag = "h2",
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <Tag className="text-sm font-medium text-admin-muted">{title}</Tag>
        {description ? (
          <p className="mt-1 text-lg font-semibold tracking-tight text-admin-ink">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ─────────────────────── Section entrance fade ───────────────────
   Triggers off the scroll viewport (not just on mount), so slabs further
   down the page animate into place as they're scrolled to rather than
   sitting fixed. `once: true` keeps it a one-way reveal per element instead
   of replaying on every scroll direction change; the small negative bottom
   margin starts the animation a little before the card is fully on screen.
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
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
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

/* ─────────────────────────── Avatar ───────────────────────────── */

const AVATAR_TONES = [
  "bg-admin-grad-pink",
  "bg-admin-grad-purple",
  "bg-admin-grad-blue",
  "bg-admin-grad-orange",
];

export function Avatar({
  initials,
  name,
  size = "md",
  index = 0,
}: {
  initials: string;
  name: string;
  size?: "sm" | "md";
  index?: number;
}) {
  return (
    <span
      aria-hidden="true"
      title={name}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold text-white",
        AVATAR_TONES[index % AVATAR_TONES.length],
        size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-xs",
      )}
    >
      {initials}
    </span>
  );
}

/* ───────────────────────── Buttons / pills ────────────────────── */

export function GradientButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-admin-grad-pink px-5 py-2.5 text-sm font-semibold text-white shadow-admin transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] motion-reduce:hover:scale-100 disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-admin-line bg-white px-4 py-2.5 text-sm font-medium text-admin-ink transition-colors duration-200 hover:bg-admin-bg disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ───────────────────── Native select (filters) ─────────────────── */

export function FilterSelect({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-11 w-full rounded-full border border-admin-line bg-white px-4 pr-9 text-sm text-admin-ink transition-colors duration-200 hover:border-admin-muted/40 focus:border-admin-pink focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ─────────────────────────── Empty state ──────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-admin border border-dashed border-admin-line bg-white/60 px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="grid h-12 w-12 place-items-center rounded-full bg-admin-bg text-admin-muted"
      >
        {icon}
      </span>
      <p className="mt-4 text-base font-semibold text-admin-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-admin-muted">{description}</p>
    </div>
  );
}

/* ──────────────────── Section shell for each page ─────────────── */

export function PageSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("mt-6", className)}>{children}</section>;
}
