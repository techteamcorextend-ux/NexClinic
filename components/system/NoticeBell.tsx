"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Inbox } from "lucide-react";
import { useNotices } from "@/lib/clinic-store";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import type { NoticeAudience } from "@/lib/clinic-types";
import { cn } from "@/lib/utils";

/** Notification centre for one portal. Reads only that audience's notices. */
export function NoticeBell({
  audience,
  className,
}: {
  audience: NoticeAudience;
  className?: string;
}) {
  const { list, unread, markAllRead } = useNotices(audience);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotionSafe();

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label={`Notifications, ${unread} unread`}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          if (!open) markAllRead();
        }}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-p-line bg-p-card text-p-muted transition-colors hover:text-p-ink"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-p-card">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <button
              type="button"
              aria-label="Close notifications"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <motion.div
              initial={{ opacity: 0, y: reduced ? 0 : -8, scale: reduced ? 1 : 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduced ? 0 : -8, scale: reduced ? 1 : 0.98 }}
              transition={{ duration: reduced ? 0.1 : 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[20px] border border-p-line bg-p-card shadow-[0_24px_60px_-24px_rgba(16,24,40,0.35)]"
            >
              <p className="border-b border-p-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-p-muted">
                Notifications
              </p>

              {list.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                  <Inbox className="h-5 w-5 text-p-muted" aria-hidden="true" />
                  <p className="text-sm text-p-muted">Nothing here yet.</p>
                </div>
              ) : (
                <ul className="max-h-80 list-none overflow-y-auto">
                  {list.map((entry) => (
                    <li
                      key={entry.id}
                      className="border-b border-p-line/70 px-4 py-3 last:border-0"
                    >
                      <p className="text-sm font-semibold text-p-ink">{entry.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-p-muted">
                        {entry.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default NoticeBell;
