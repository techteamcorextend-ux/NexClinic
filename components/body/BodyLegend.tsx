"use client";

import { REGION_LABEL, REGION_ORDER, SEVERITY_COLOR } from "./config/regions";
import { regionSeverity } from "./config/vitals";
import type { BodySide, RegionId, RegionVitalsMap } from "./types";

type BodyLegendProps = {
  vitals: RegionVitalsMap;
  activeRegion: RegionId | null;
  onFocus: (region: RegionId, side: BodySide) => void;
  onBlur: () => void;
  onSelect: (region: RegionId, side: BodySide) => void;
  /** Renders the fuller standalone version used when there's no canvas. */
  standalone?: boolean;
};

/**
 * The keyboard-navigable list of all 13 regions.
 *
 * This is the viewer's accessibility surface and its no-WebGL fallback in
 * one: focusing an item drives exactly the same state machine as hovering
 * the mesh, and every clinical value it shows is real DOM text. The canvas
 * itself is `aria-hidden`, so this list is what a screen reader reads.
 */
export default function BodyLegend({
  vitals,
  activeRegion,
  onFocus,
  onBlur,
  onSelect,
  standalone = false,
}: BodyLegendProps) {
  return (
    <div className={standalone ? "" : "border-t border-slate-200/70 pt-3"}>
      <h3 className="px-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-400">
        Body regions
      </h3>

      <ul className={`mt-2 grid gap-1 ${standalone ? "sm:grid-cols-2" : "grid-cols-2"}`}>
        {REGION_ORDER.map((id) => {
          const entry = vitals[id];
          const has = Boolean(entry?.vitals.length);
          const severity = regionSeverity(entry);
          const isActive = activeRegion === id;

          return (
            <li key={id}>
              <button
                type="button"
                onMouseEnter={() => onFocus(id, 0 as BodySide)}
                onMouseLeave={onBlur}
                onFocus={() => onFocus(id, 0 as BodySide)}
                onBlur={onBlur}
                onClick={() => onSelect(id, 0 as BodySide)}
                aria-pressed={isActive}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-600 ${
                  isActive ? "bg-teal-50 text-teal-900" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: has ? SEVERITY_COLOR[severity] : "#cbd5e1" }}
                />
                <span className="min-w-0 flex-1 truncate font-medium">{REGION_LABEL[id]}</span>
                {has ? (
                  <span className="shrink-0 tabular-nums text-[10px] text-slate-400 dark:text-slate-400">
                    {entry?.vitals.length}
                  </span>
                ) : null}
              </button>

              {/* In the no-canvas fallback the numbers themselves must be on
                  the page, not hidden behind a hover the user can't perform. */}
              {standalone && has ? (
                <dl className="mb-1 ml-6 space-y-0.5">
                  {entry?.vitals.map((vital) => (
                    <div key={vital.id} className="flex items-baseline justify-between gap-2">
                      <dt className="truncate text-[11px] text-slate-500 dark:text-slate-400">{vital.name}</dt>
                      <dd className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-800">
                        {vital.value}
                        {vital.unit ? <span className="ml-0.5 font-normal text-slate-400 dark:text-slate-400">{vital.unit}</span> : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
