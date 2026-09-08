"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

export type BodyPoint = {
  id: string;
  label: string;
  reading: string;
  /** Percentage coordinates within the figure box. */
  x: number;
  y: number;
};

/**
 * Stylised body map with live sensor points.
 *
 * The figure is drawn as inline SVG (no external asset), and each point is a
 * real button: hovering or focusing one surfaces its reading, so the readings
 * are reachable by keyboard rather than hover-only.
 */
export function BodyMap({
  points,
  className,
}: {
  points: BodyPoint[];
  className?: string;
}) {
  const [activeId, setActiveId] = useState(points[0]?.id ?? "");
  const reduced = useReducedMotionSafe();
  const active = points.find((point) => point.id === activeId) ?? points[0];

  return (
    <div className={cn("relative mx-auto w-full max-w-[300px]", className)}>
      <div className="relative aspect-[3/5] w-full">
        <svg
          viewBox="0 0 300 500"
          className="h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--p-card))" />
              <stop offset="100%" stopColor="rgb(var(--p-soft))" />
            </linearGradient>
            <radialGradient id="bodyGlow" cx="50%" cy="42%" r="55%">
              <stop offset="0%" stopColor="rgb(var(--p-accent))" stopOpacity="0.18" />
              <stop offset="100%" stopColor="rgb(var(--p-accent))" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="150" cy="240" rx="130" ry="196" fill="url(#bodyGlow)" />

          {/* Head and neck */}
          <ellipse cx="150" cy="46" rx="27" ry="32" fill="url(#bodyFill)" stroke="rgb(var(--p-line))" strokeWidth="2" />
          <path d="M139 74 h22 v22 h-22 z" fill="url(#bodyFill)" stroke="rgb(var(--p-line))" strokeWidth="2" />

          {/* Torso — shoulders, waist taper, hips */}
          <path
            d="M150 92 C176 92 200 98 204 112 L208 156 C208 176 196 190 192 206 L200 250 C201 262 199 268 196 272 H104 C101 268 99 262 100 250 L108 206 C104 190 92 176 92 156 L96 112 C100 98 124 92 150 92 Z"
            fill="url(#bodyFill)"
            stroke="rgb(var(--p-line))"
            strokeWidth="2"
          />

          {/* Arms */}
          <path d="M94 116 C80 122 74 136 72 152 L62 240 C60 256 62 272 66 284 L78 282 C75 270 74 256 76 242 L88 160 Z" fill="url(#bodyFill)" stroke="rgb(var(--p-line))" strokeWidth="2" />
          <path d="M206 116 C220 122 226 136 228 152 L238 240 C240 256 238 272 234 284 L222 282 C225 270 226 256 224 242 L212 160 Z" fill="url(#bodyFill)" stroke="rgb(var(--p-line))" strokeWidth="2" />

          {/* Legs */}
          <path d="M104 272 L100 360 C99 396 102 432 106 458 L124 458 C126 432 128 398 130 364 L142 276 Z" fill="url(#bodyFill)" stroke="rgb(var(--p-line))" strokeWidth="2" />
          <path d="M196 272 L200 360 C201 396 198 432 194 458 L176 458 C174 432 172 398 170 364 L158 276 Z" fill="url(#bodyFill)" stroke="rgb(var(--p-line))" strokeWidth="2" />

          {/* Abdominal scan ring */}
          <ellipse
            cx="150"
            cy="212"
            rx="62"
            ry="14"
            fill="none"
            stroke="rgb(var(--p-accent))"
            strokeWidth="2"
            strokeDasharray="5 7"
            opacity="0.75"
          />
        </svg>

        {/* Sensor points */}
        {points.map((point) => {
          const isActive = point.id === active?.id;
          return (
            <button
              key={point.id}
              type="button"
              onMouseEnter={() => setActiveId(point.id)}
              onFocus={() => setActiveId(point.id)}
              onClick={() => setActiveId(point.id)}
              aria-pressed={isActive}
              className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <span className="sr-only">
                {point.label}: {point.reading}
              </span>
              <motion.span
                aria-hidden="true"
                className={cn(
                  "block h-3 w-3 rounded-full bg-p-accent ring-4",
                  isActive ? "ring-p-accent/25" : "ring-p-accent/10",
                )}
                animate={
                  reduced ? undefined : { scale: isActive ? [1, 1.35, 1] : 1 }
                }
                transition={{ duration: 1.6, repeat: isActive ? Infinity : 0 }}
              />
            </button>
          );
        })}
      </div>

      {/* Reading for the active point */}
      {active ? (
        <div className="mt-2 rounded-[18px] border border-p-line bg-p-card p-4 text-center shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
          <p className="text-xs font-medium text-p-muted">{active.label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-p-ink">
            {active.reading}
          </p>
          <p className="mt-1 text-[11px] text-p-muted">
            Hover or tab through the points to read each sensor
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default BodyMap;
