"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

/**
 * lottie-react touches the DOM on mount, so it's loaded client-side only —
 * server-rendering it would crash the initial HTML pass.
 */
const Lottie = dynamic(() => import("lottie-react").then((mod) => mod.Lottie), {
  ssr: false,
});

/** The listening indicator: plays the input-wave animation while the mic is live. */
export function VoiceWave({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-p-line bg-p-soft py-6",
        className,
      )}
    >
      <Lottie
        src="/animations/input-wave.json"
        autoplay
        loop
        className="aspect-[10/3] w-full max-w-[220px]"
      />
    </div>
  );
}
