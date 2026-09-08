"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, X } from "lucide-react";
import { useClinic } from "@/lib/clinic-store";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import type { AppNotice } from "@/lib/clinic-types";

const AUDIENCE_LABEL: Record<string, string> = {
  reception: "Front desk",
  surgeon: "Surgeon on call",
  patient: "Patient",
  inventory: "Inventory manager",
  admin: "Administration",
  staff: "Staff member",
};

/**
 * Device-style push toasts.
 *
 * The spec asks for changes to "trigger a popup notification to the respective
 * phone" — with no backend, this stands in for that: any notice raised with
 * `kind: "phone"` appears as a handset-style push, addressed to the role it
 * was sent to. Notices already in the store at mount are never replayed.
 */
export function PhoneToasts() {
  const { state, dispatch, hydrated } = useClinic();
  const seen = useRef<Set<string> | null>(null);
  const [live, setLive] = useState<AppNotice[]>([]);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    if (!hydrated) return;

    // First pass after hydration: mark everything as already seen.
    if (seen.current === null) {
      seen.current = new Set(state.notices.map((entry) => entry.id));
      return;
    }

    const fresh = state.notices.filter(
      (entry) => entry.kind === "phone" && !seen.current!.has(entry.id),
    );
    if (fresh.length === 0) return;

    fresh.forEach((entry) => seen.current!.add(entry.id));
    setLive((current) => [...fresh, ...current].slice(0, 3));

    const timers = fresh.map((entry) =>
      window.setTimeout(
        () => setLive((current) => current.filter((item) => item.id !== entry.id)),
        6500,
      ),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [state.notices, hydrated]);

  return (
    <div
      aria-live="polite"
      aria-label="Push notifications"
      className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(21rem,calc(100vw-2rem))] flex-col gap-2.5"
    >
      <AnimatePresence initial={false}>
        {live.map((entry) => (
          <motion.div
            key={entry.id}
            layout
            initial={{ opacity: 0, y: reduced ? 0 : -18, scale: reduced ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: reduced ? 0 : 40 }}
            transition={{ duration: reduced ? 0.1 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto overflow-hidden rounded-[22px] border border-white/15 bg-[#15161F]/95 p-3.5 text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-blue-600"
              >
                <BellRing className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                  Nexclinic
                  <span className="text-white/35">·</span>
                  {AUDIENCE_LABEL[entry.to] ?? entry.to}
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug">{entry.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/70">{entry.body}</p>
              </div>

              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => {
                  setLive((current) => current.filter((item) => item.id !== entry.id));
                  dispatch({ type: "notice/read", id: entry.id });
                }}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default PhoneToasts;
