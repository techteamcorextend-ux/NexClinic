"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/components/admin/use-media-query";

const MotionLink = motion.create(Link);

const REST_SHADOW = "0 12px 28px -14px rgba(15,23,42,0.45)";
const HOVER_SHADOW = "0 26px 50px -16px rgba(15,23,42,0.55)";

/** Deep, muted 3-stop palettes a card's mesh gradient is picked from. */
const MESH_PALETTES: [string, string, string][] = [
  ["#2b2a4a", "#4c3f74", "#1c1b33"], // indigo → violet
  ["#12211f", "#2e5850", "#16302c"], // teal → slate
  ["#3a1a12", "#7a3a48", "#341612"], // amber → rose
  ["#16240f", "#455423", "#152510"], // forest → moss
];

/** Uniform dark wash blended over every gradient so the mesh reads muted and premium, not neon. */
const VIBRANCE_WASH = "rgba(10, 12, 20, 0.28)";

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

/** Same seed always resolves to the same mesh gradient and avatar tint. */
function meshGradient(seed: string) {
  const hash = hashSeed(seed);
  const [start, mid, end] = MESH_PALETTES[hash % MESH_PALETTES.length];
  const angle = 120 + (hash % 5) * 15;
  const posX = 22 + (hash % 7) * 8;
  const posY = 18 + ((hash >> 3) % 7) * 8;
  return {
    background: `radial-gradient(135% 135% at ${posX}% ${posY}%, ${mid} 0%, transparent 62%), linear-gradient(${angle}deg, ${start}, ${end})`,
    tint: mid,
  };
}

function tintToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white",
    className,
  );

  const body = (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: VIBRANCE_WASH }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-4"
        style={{ backgroundImage: `url("${NOISE_URL}")` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,.55), transparent 38%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "linear-gradient(to top, rgba(0,0,0,.6), transparent 45%)" }}
      />

      <div className="relative flex h-full w-full flex-col p-3">
        <div className="flex justify-center">
          <span className="inline-flex h-5 items-center gap-1.5 rounded-full border border-white/22 bg-white/16 px-2.5 backdrop-blur-md">
            {badgeStatus ? (
              <span
                aria-hidden="true"
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  badgeStatus === "active" ? "bg-emerald-400" : "bg-white/50",
                )}
              />
            ) : badgeIcon ? (
              <span className="grid h-3 w-3 shrink-0 place-items-center text-white [&_svg]:h-3 [&_svg]:w-3">
                {badgeIcon}
              </span>
            ) : null}
            <span className="whitespace-nowrap text-[10px] font-semibold text-white">
              {badgeLabel}
            </span>
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
          {eyebrow ? <p className="mb-1 text-xs font-medium text-white/70">{eyebrow}</p> : null}
          <motion.p
            className={cn(
              "font-bold tracking-tight text-white",
              eyebrow ? "text-[28px] leading-[1.1]" : "text-lg leading-tight",
            )}
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
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-semibold text-white ring-[1.5px] ring-white/60 [&_svg]:h-3 [&_svg]:w-3"
              style={{ backgroundColor: tintToRgba(tint, 0.55) }}
            >
              {avatarInitials ?? avatarIcon}
            </span>
            <div className="min-w-0">
              <p title={line1} className="truncate text-[10px] font-semibold text-white">
                {line1}
              </p>
              {line2 ? (
                <p title={line2} className="truncate text-[9px] text-white/65">
                  {line2}
                </p>
              ) : null}
            </div>
          </div>

          <span
            className={cn(
              "flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-3",
              "text-[10px] font-semibold text-slate-900 shadow-[0_6px_16px_-6px_rgba(15,23,42,0.35)]",
              "transition-transform duration-150 ease-out hover:scale-[1.04] motion-reduce:hover:scale-100",
            )}
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
