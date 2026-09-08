"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { SCHEDULE, WEEK_DAYS } from "@/lib/portal-data";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  indigo: "bg-indigo-500 text-white",
  teal: "bg-teal-500 text-white",
  rose: "bg-rose-500 text-white",
  amber: "bg-amber-500 text-white",
};

/**
 * The week schedule strip. Each block is a link into the day's roster, placed
 * on an explicit grid row so overlapping sessions never collide.
 */
export function WeekStrip({ month = "January 2026" }: { month?: string }) {
  const dates = [25, 26, 27, 28, 29, 30, 31];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Previous week"
          className="grid h-8 w-8 place-items-center rounded-full border border-p-line bg-p-card text-p-muted transition-colors hover:text-p-ink"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="text-sm font-semibold text-p-ink">{month}</p>
        <button
          type="button"
          aria-label="Next week"
          className="grid h-8 w-8 place-items-center rounded-full border border-p-line bg-p-card text-p-muted transition-colors hover:text-p-ink"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="no-scrollbar mt-4 overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-7 gap-2 border-b border-p-line pb-2">
            {WEEK_DAYS.map((day, index) => (
              <div key={day} className="text-center">
                <p className="text-[11px] font-medium uppercase tracking-wider text-p-muted">
                  {day}
                </p>
                <p
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    index === 3 ? "text-p-accent" : "text-p-ink",
                  )}
                >
                  {dates[index]}
                </p>
              </div>
            ))}
          </div>

          <div className="relative mt-3 grid grid-cols-7 gap-2" style={{ gridAutoRows: "56px" }}>
            {/* Today marker */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-px bg-p-accent/40"
              style={{ left: "calc((100% / 7) * 3.5)" }}
            />

            {SCHEDULE.map((block) => (
              <Link
                key={block.id}
                href="/reception"
                style={{
                  gridColumn: `${block.day + 1} / span ${block.span}`,
                  gridRow: block.row,
                }}
                className={cn(
                  "group relative flex flex-col justify-center gap-0.5 overflow-hidden rounded-xl px-3 py-2 transition-transform duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift motion-reduce:hover:translate-y-0",
                  TONES[block.tone],
                )}
              >
                <span className="truncate text-xs font-semibold">{block.title}</span>
                <span className="flex items-center gap-1.5 truncate text-[10px] text-white/85">
                  <Users className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {block.detail} · {block.people} patients
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeekStrip;
