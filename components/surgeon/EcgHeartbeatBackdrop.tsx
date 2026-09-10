"use client";

import dynamic from "next/dynamic";

/**
 * lottie-react touches the DOM on mount, so it's loaded client-side only —
 * server-rendering it would crash the initial HTML pass.
 */
const Lottie = dynamic(() => import("lottie-react").then((mod) => mod.Lottie), {
  ssr: false,
});

// Enough copies to span the dashboard's content column at any breakpoint —
// each tile plays the studio animation's own left-to-right draw-in and loop,
// so no extra scroll/marquee motion is needed on top of it.
const TILE_COUNT = 5;

/**
 * Decorative ECG trace behind the surgeon dashboard. Uses the studio-made
 * heartbeat Lottie as-is — native red, native draw-in sweep — rather than a
 * recolored/hand-built version, dimmed and softly blurred so it reads as
 * background rather than UI.
 */
export function EcgHeartbeatBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-40 blur-[1px]"
    >
      <div className="absolute left-0 top-1/2 flex w-max -translate-y-1/2">
        {Array.from({ length: TILE_COUNT }, (_, index) => (
          <Lottie
            key={index}
            src="/animations/ecg-heartbeat.json"
            autoplay
            loop
            className="h-40 w-auto shrink-0 md:h-56"
          />
        ))}
      </div>
    </div>
  );
}

export default EcgHeartbeatBackdrop;
