"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { buildRegionVitals } from "@/components/body/config/vitals";
import { useScrollRegion } from "@/components/body/hooks/useScrollRegion";
import { useRegionFocus } from "@/components/body/hooks/useRegionFocus";
import { useClinic } from "@/lib/clinic-store";

/**
 * App-side adapter for the 3D body viewer.
 *
 * `components/body/` is deliberately framework-agnostic, so everything that
 * knows about Next.js or the clinic store lives here: the ssr:false boundary,
 * and the translation from a stored `PatientChart` into the viewer's
 * region↔vitals map. Edit a vital in the consultation screen and the
 * highlight colour on the model follows it.
 */
const BodyViewer = dynamic(() => import("@/components/body/BodyViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50 to-white">
      <div className="text-center">
        <div
          aria-hidden="true"
          className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-600 motion-reduce:animate-none"
        />
        <p className="mt-3 text-xs text-slate-400">Loading body model…</p>
      </div>
    </div>
  ),
});

type BodyVitalsPanelProps = {
  patientId: string;
  /**
   * Container holding the `[data-region]` sections that drive the camera.
   * Omit it and the viewer responds to hover, click and the legend only.
   */
  scrollRootRef?: React.RefObject<HTMLElement>;
  className?: string;
  caption?: string;
};

export default function BodyVitalsPanel({
  patientId,
  scrollRootRef,
  className,
  caption,
}: BodyVitalsPanelProps) {
  const { state } = useClinic();
  const chart = state.charts[patientId];

  const locked = useRegionFocus((focus) => focus.locked);

  // A locked region wins over scroll — see the precedence rules in
  // useRegionFocus. Detaching the observer is cheaper than filtering its
  // callbacks, and stops a stray scroll from fighting a pinned view.
  const fallbackRef = useRef<HTMLElement>(null);
  useScrollRegion(scrollRootRef ?? fallbackRef, !locked);

  const vitals = buildRegionVitals(chart?.vitals ?? [], {
    diet: chart?.diet,
    mobility: chart?.notes ? undefined : undefined,
  });

  return <BodyViewer vitals={vitals} className={className} caption={caption} />;
}
