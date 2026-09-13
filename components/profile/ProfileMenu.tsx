"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Settings, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

export type ProfileMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "danger";
};

type ProfileMenuProps = {
  /** Directory id — the profile page this menu opens. */
  id: string;
  name: string;
  initials: string;
  role: string;
  email?: string;
  /** Which palette family the surrounding chrome uses. */
  tone?: "admin" | "portal";
  /** Extra rows inserted between "Profile" and "Log out". */
  items?: ProfileMenuItem[];
  /** Overrides the default /admin/settings destination. */
  settingsHref?: string;
  className?: string;
};

/** How long the panel waits after the pointer leaves before closing. */
const LEAVE_GRACE_MS = 240;

/**
 * The account chip shared by every screen.
 *
 * Hovering previews the panel; clicking pins it open so the rows inside stay
 * clickable while the pointer travels. Escape, an outside click or following
 * a link closes it again.
 */
export function ProfileMenu({
  id,
  name,
  initials,
  role,
  email,
  tone = "portal",
  items,
  settingsHref,
  className,
}: ProfileMenuProps) {
  const pathname = usePathname();
  const reduced = useReducedMotionSafe();
  const panelId = useId();

  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const admin = tone === "admin";
  const firstName = name.replace(/^Dr\.\s*/i, "").split(" ")[0];

  const close = useCallback(() => {
    setOpen(false);
    setPinned(false);
    setHovered(null);
  }, []);

  const cancelLeave = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const scheduleLeave = useCallback(() => {
    cancelLeave();
    leaveTimer.current = setTimeout(() => {
      // A pinned panel stays put — that is the whole point of the click.
      setPinned((isPinned) => {
        if (!isPinned) {
          setOpen(false);
          setHovered(null);
        }
        return isPinned;
      });
    }, LEAVE_GRACE_MS);
  }, [cancelLeave]);

  useEffect(() => cancelLeave, [cancelLeave]);

  // Close when the route changes — the panel would otherwise survive a link.
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Outside click and Escape.
  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const rows: ProfileMenuItem[] = [
    { label: "Profile", href: `/profile/${id}`, icon: User, hint: "View and edit your details" },
    ...(items ?? []),
    { label: "Settings", href: settingsHref ?? "/admin/settings", icon: Settings, hint: "Preferences and access" },
    { label: "Log out", href: "/login", icon: LogOut, tone: "danger" },
  ];

  const spring = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.7 };

  return (
    <div
      ref={rootRef}
      className={cn("relative shrink-0", className)}
      onPointerEnter={() => {
        cancelLeave();
        setOpen(true);
      }}
      // A pointer already resting on the chip when the page loads never fires
      // an enter — the first move over it opens the preview just the same.
      onPointerMove={() => {
        if (!open) {
          cancelLeave();
          setOpen(true);
        }
      }}
      onPointerLeave={scheduleLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          if (pinned) {
            close();
            return;
          }
          setOpen(true);
          setPinned(true);
        }}
        onFocus={(event) => {
          // Keyboard focus opens and holds — there is no pointer to hover with.
          if (event.currentTarget.matches(":focus-visible")) {
            setOpen(true);
            setPinned(true);
          }
        }}
        className={cn(
          "relative flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 text-left transition-all duration-300 ease-out-soft",
          admin
            ? "bg-white dark:bg-admin-card shadow-admin"
            : "border border-p-line bg-p-card",
          open && "-translate-y-0.5 motion-reduce:translate-y-0",
          open && (admin ? "shadow-admin-lg" : "shadow-lift"),
        )}
      >
        <motion.span
          aria-hidden="true"
          animate={reduced ? undefined : { scale: open ? 1.06 : 1 }}
          transition={spring}
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white",
            admin ? "bg-admin-grad-pink" : "bg-gradient-to-br from-p-accent to-p-accent-2",
          )}
        >
          {initials}
        </motion.span>

        <span className="hidden leading-tight sm:block">
          <span className={cn("block text-xs font-semibold", admin ? "text-admin-ink" : "text-p-ink")}>
            {admin ? firstName : name}
          </span>
          <span className={cn("block text-[11px]", admin ? "text-admin-muted" : "text-p-muted")}>
            {role}
          </span>
        </span>

        <motion.span
          aria-hidden="true"
          animate={reduced ? undefined : { rotate: open ? 180 : 0 }}
          transition={spring}
          className={cn("hidden sm:block", admin ? "text-admin-muted" : "text-p-muted")}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>

        <span className="sr-only">
          {open ? "Close account menu" : "Open account menu"}
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            role="menu"
            aria-label={`${name} account menu`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -10 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -6 }}
            transition={spring}
            style={{ transformOrigin: "top right" }}
            onPointerEnter={cancelLeave}
            onPointerLeave={scheduleLeave}
            className={cn(
              "absolute right-0 top-[calc(100%+10px)] z-[70] w-[264px] origin-top-right overflow-hidden rounded-[22px] border p-2 backdrop-blur-xl",
              admin
                ? "border-admin-line bg-white/95 dark:bg-admin-card/95 shadow-admin-lg"
                : "border-p-line bg-p-card/95 shadow-lift",
            )}
          >
            {/* Identity header */}
            <motion.div
              initial={reduced ? undefined : { opacity: 0, y: -6 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.04, duration: 0.22 }}
              className={cn(
                "flex items-center gap-3 rounded-[16px] px-3 py-3",
                admin ? "bg-admin-bg dark:bg-white/5" : "bg-p-bg dark:bg-white/5",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold text-white",
                  admin ? "bg-admin-grad-pink" : "bg-gradient-to-br from-p-accent to-p-accent-2",
                )}
              >
                {initials}
              </span>
              <span className="min-w-0 leading-tight">
                <span className={cn("block truncate text-sm font-semibold", admin ? "text-admin-ink" : "text-p-ink")}>
                  {name}
                </span>
                <span className={cn("block truncate text-[11px]", admin ? "text-admin-muted" : "text-p-muted")}>
                  {email ?? role}
                </span>
              </span>
            </motion.div>

            {/* Rows */}
            <ul className="mt-1.5 flex list-none flex-col">
              {rows.map((row, index) => {
                const Icon = row.icon;
                const danger = row.tone === "danger";
                const active = hovered === row.label;
                return (
                  <motion.li
                    key={row.label}
                    initial={reduced ? undefined : { opacity: 0, x: -8 }}
                    animate={reduced ? undefined : { opacity: 1, x: 0 }}
                    transition={{ delay: reduced ? 0 : 0.06 + index * 0.035, duration: 0.24 }}
                  >
                    <Link
                      href={row.href}
                      role="menuitem"
                      onClick={close}
                      onPointerEnter={() => setHovered(row.label)}
                      onFocus={() => setHovered(row.label)}
                      className={cn(
                        "relative flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium outline-none transition-colors",
                        danger
                          ? "text-rose-600 dark:text-rose-400"
                          : admin
                            ? "text-admin-ink"
                            : "text-p-ink",
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId={`profile-row-${panelId}`}
                          aria-hidden="true"
                          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }}
                          className={cn(
                            "absolute inset-0 rounded-[14px]",
                            danger
                              ? "bg-rose-500/10"
                              : admin
                                ? "bg-admin-bg dark:bg-white/10"
                                : "bg-p-bg dark:bg-white/10",
                          )}
                        />
                      ) : null}
                      <Icon className="relative h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="relative min-w-0">
                        <span className="block truncate">{row.label}</span>
                        {row.hint ? (
                          <span
                            className={cn(
                              "block truncate text-[11px] font-normal",
                              admin ? "text-admin-muted" : "text-p-muted",
                            )}
                          >
                            {row.hint}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>

            {/* Preview hint — only while the panel is merely being previewed. */}
            <AnimatePresence>
              {!pinned ? (
                <motion.p
                  initial={reduced ? undefined : { opacity: 0 }}
                  animate={reduced ? undefined : { opacity: 1 }}
                  exit={reduced ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "mt-1 px-3 pb-1 pt-1.5 text-center text-[10px] uppercase tracking-[0.12em]",
                    admin ? "text-admin-muted" : "text-p-muted",
                  )}
                >
                  Click to keep open
                </motion.p>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default ProfileMenu;
