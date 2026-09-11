"use client";

import { X } from "lucide-react";
import { REGION_LABEL, SEVERITY_COLOR } from "./config/regions";
import { regionSeverity } from "./config/vitals";
import type { RegionId, RegionVitals, Severity } from "./types";

const SEVERITY_STYLE: Record<Severity, { chip: string; text: string; label: string }> = {
  normal: { chip: "bg-teal-50 text-teal-700 ring-teal-600/20", text: "text-slate-900 dark:text-slate-100", label: "Normal" },
  watch: { chip: "bg-amber-50 text-amber-700 ring-amber-600/20", text: "text-amber-700", label: "Watch" },
  alert: { chip: "bg-rose-50 text-rose-700 ring-rose-600/20", text: "text-rose-700", label: "Alert" },
};

type VitalCalloutProps = {
  region: RegionId | null;
  entry: RegionVitals | undefined;
  locked: boolean;
  onClose: () => void;
};

/**
 * The floating panel for the focused region.
 *
 * Deliberately plain DOM rather than a drei `<Html>` inside the canvas: a
 * clinical number must never live only in a WebGL context, and this way it
 * stays selectable, screen-reader visible and present when the canvas is
 * absent entirely.
 */
export default function VitalCallout({ region, entry, locked, onClose }: VitalCalloutProps) {
  if (!region) return null;

  const severity = regionSeverity(entry);
  const style = SEVERITY_STYLE[severity];

  return (
    <div
      className="pointer-events-auto absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)] backdrop-blur-md sm:right-auto sm:w-72"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {entry?.system ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-400">
              {entry.system}
            </p>
          ) : null}
          <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{REGION_LABEL[region]}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${style.chip}`}
          >
            {style.label}
          </span>
          {locked ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Unpin region"
              className="grid h-6 w-6 place-items-center rounded-full text-slate-400 dark:text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {entry?.vitals.length ? (
        <dl className="mt-3 space-y-2">
          {entry.vitals.map((vital) => {
            const vitalStyle = SEVERITY_STYLE[vital.severity];
            return (
              <div key={vital.id} className="flex items-baseline justify-between gap-3">
                <dt className="truncate text-xs text-slate-500 dark:text-slate-400">{vital.name}</dt>
                <dd className={`shrink-0 text-sm font-semibold tabular-nums ${vitalStyle.text}`}>
                  {vital.value}
                  {vital.unit ? (
                    <span className="ml-1 text-[11px] font-medium text-slate-400 dark:text-slate-400">{vital.unit}</span>
                  ) : null}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">No readings recorded for this region.</p>
      )}

      {entry?.notes?.length ? (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
          {entry.notes.map((note) => (
            <li key={note} className="flex gap-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-500" />
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      {locked ? (
        <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-400">Pinned · press Esc to release</p>
      ) : null}
    </div>
  );
}

export { SEVERITY_COLOR };
