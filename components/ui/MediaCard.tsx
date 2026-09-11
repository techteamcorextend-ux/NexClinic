"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/components/admin/use-media-query";

const MotionLink = motion.create(Link);

const REST_SHADOW = "var(--mc-shadow-rest)";
const HOVER_SHADOW = "var(--mc-shadow-hover)";

/**
 * Four ramps, one picked per card from its seed. The values live in
 * globals.css as --mc-N-a/b/c so the whole card can flip with the theme:
 * airy tints from the page's own blue family in light mode, deep ones in
 * dark. Hard-coding them here is what made the cards read as dark slabs
 * projected onto a light page instead of part of it.
 */
const MESH_COUNT = 4;

const NOISE_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>" +
  "<filter id='grain'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter>" +
  "<rect width='100%' height='100%' filter='url(#grain)'/></svg>";
const NOISE_URL = `data:image/svg+xml;utf8,${encodeURIComponent(NOISE_SVG)}`;

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Same seed always resolves to the same ramp, in either theme. */
function meshGradient(seed: string) {
  const hash = hashSeed(seed);
  const ramp = (hash % MESH_COUNT) + 1;
  const angle = 120 + (hash % 5) * 15;
  const posX = 22 + (hash % 7) * 8;
  const posY = 18 + ((hash >> 3) % 7) * 8;
  return {
    background:
      `radial-gradient(135% 135% at ${posX}% ${posY}%, var(--mc-${ramp}-b) 0%, transparent 62%), ` +
      `linear-gradient(${angle}deg, var(--mc-${ramp}-a), var(--mc-${ramp}-c))`,
    tint: `var(--mc-${ramp}-tint)`,
  };
}

export interface MediaCardProps {
  /** Stable seed (a staff id, a metric key…) the gradient/avatar tint is derived from. */
  seed: string;
  badgeLabel: string;
  /** Small leading icon in the badge — used when there's no status dot. */
  badgeIcon?: ReactNode;
  /** Renders a status dot in the badge instead of `badgeIcon`. */
  badgeStatus?: "active" | "inactive";
  /** Small label above the title (dashboard's metric name). Omit for staff names. */
  eyebrow?: string;
  /** The big centered title: a person's name, or a KPI's value. */
  title: string;
  avatarInitials?: string;
  /** Rendered in the avatar slot when there are no initials to show. */
  avatarIcon?: ReactNode;
  line1: string;
  line2?: string;
  actionLabel: string;
  /** Whole card becomes a Link to this href. */
  href?: string;
  /** Whole card becomes a button that fires this. */
  onAction?: () => void;
  className?: string;
}

/**
 * A portrait "media card": full-bleed deterministic gradient fill, scrims for
 * legible text, a status/metric badge, a centered title and a bottom bar with
 * an avatar and an action pill. Used for both staff profiles and dashboard
 * KPI tiles — see `CascadeGrid` for the entrance/hover choreography around it.
 */
export function MediaCard({
  seed,
  badgeLabel,
  badgeIcon,
  badgeStatus,
  eyebrow,
  title,
  avatarInitials,
  avatarIcon,
  line1,
  line2,
  actionLabel,
  href,
  onAction,
  className,
}: MediaCardProps) {
  const reduced = usePrefersReducedMotion();
  const { background, tint } = meshGradient(seed);

  const hoverAnimation = reduced
    ? { boxShadow: HOVER_SHADOW }
    : { scale: 1.06, y: -8, boxShadow: HOVER_SHADOW, zIndex: 30 };

  // A focus ring drawn with `outline` rather than `ring` (box-shadow): the
  // card's own animated boxShadow is set inline by Framer, which as an inline
  // style would silently win over — and hide — a box-shadow-based ring. Inset
  // (negative offset) so the ring sits on the dark fill, not the light page
  // behind it, where a white ring would have no contrast to read against.
  const rootClassName = cn(
    "group/card relative mx-auto flex aspect-[5/7] w-full overflow-hidden rounded-3xl text-left outline-none",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[color:var(--mc-ink)]",
    className,
  );

  const body = (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: "var(--mc-wash)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: `url("${NOISE_URL}")`, opacity: "var(--mc-noise-opacity)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "linear-gradient(to bottom, var(--mc-scrim-top), transparent 38%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "linear-gradient(to top, var(--mc-scrim-bottom), transparent 45%)" }}
      />

      <div className="relative flex h-full w-full flex-col p-3">
        <div className="flex justify-center">
          <span
            className="inline-flex h-5 items-center gap-1.5 rounded-full border px-2.5 backdrop-blur-md"
            style={{
              borderColor: "var(--mc-chip-border)",
              backgroundColor: "var(--mc-chip-bg)",
            }}
          >
            {badgeStatus ? (
              <span
                aria-hidden="true"
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  badgeStatus === "active" ? "bg-emerald-400" : "bg-white/50",
                )}
              />
            ) : badgeIcon ? (
              <span
                className="grid h-3 w-3 shrink-0 place-items-center [&_svg]:h-3 [&_svg]:w-3"
                style={{ color: "var(--mc-ink)" }}
              >
                {badgeIcon}
              </span>
            ) : null}
            <span
              className="whitespace-nowrap text-[10px] font-semibold"
              style={{ color: "var(--mc-ink)" }}
            >
              {badgeLabel}
            </span>
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
          {eyebrow ? (
            <p className="mb-1 text-xs font-medium" style={{ color: "var(--mc-ink-soft)" }}>
              {eyebrow}
            </p>
          ) : null}
          <motion.p
            className={cn(
              "font-bold tracking-tight",
              eyebrow ? "text-[28px] leading-[1.1]" : "text-lg leading-tight",
            )}
            style={{ color: "var(--mc-ink)" }}
            initial={reduced ? undefined : { clipPath: "inset(0 100% 0 0)" }}
            whileInView={reduced ? undefined : { clipPath: "inset(0 0% 0 0)" }}
            viewport={{ once: false, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {title}
          </motion.p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-semibold [&_svg]:h-3 [&_svg]:w-3"
              style={{
                backgroundColor: tint,
                color: "var(--mc-ink)",
                // Tailwind's ring-* can't take a CSS-variable colour here.
                boxShadow: "0 0 0 1.5px var(--mc-avatar-ring)",
              }}
            >
              {avatarInitials ?? avatarIcon}
            </span>
            <div className="min-w-0">
              <p
                title={line1}
                className="truncate text-[10px] font-semibold"
                style={{ color: "var(--mc-ink)" }}
              >
                {line1}
              </p>
              {line2 ? (
                <p
                  title={line2}
                  className="truncate text-[9px]"
                  style={{ color: "var(--mc-ink-soft)" }}
                >
                  {line2}
                </p>
              ) : null}
            </div>
          </div>

          <span
            className={cn(
              "flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3",
              "text-[10px] font-semibold shadow-[0_6px_16px_-6px_rgba(15,23,42,0.28)]",
              "transition-transform duration-150 ease-out hover:scale-[1.04] motion-reduce:hover:scale-100",
            )}
            style={{
              backgroundColor: "var(--mc-action-bg)",
              color: "var(--mc-action-ink)",
            }}
          >
            {actionLabel}
          </span>
        </div>
      </div>
    </>
  );

  const motionProps = {
    initial: { boxShadow: REST_SHADOW },
    animate: { boxShadow: REST_SHADOW },
    whileHover: hoverAnimation,
    whileFocus: hoverAnimation,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
    style: { backgroundImage: background },
    className: rootClassName,
  };

  if (href) {
    return (
      <MotionLink href={href} {...motionProps}>
        {body}
      </MotionLink>
    );
  }

  return (
    <motion.button type="button" onClick={onAction} {...motionProps}>
      {body}
    </motion.button>
  );
}

export default MediaCard;
