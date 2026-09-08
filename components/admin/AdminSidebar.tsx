"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut, Stethoscope } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { ADMIN_PROFILE } from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import { useMediaQuery, usePrefersReducedMotion } from "./use-media-query";

const EXPANDED_WIDTH = 272;
const COLLAPSED_WIDTH = 88;
/** Width of the fixed icon column. Keeping it constant is what makes the icons
 *  stay put while the labels retract, rather than the whole row resizing. */
const ICON_COL = COLLAPSED_WIDTH;

type AdminSidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  drawerOpen: boolean;
  onCloseDrawer: () => void;
};

export function AdminSidebar({
  collapsed,
  onToggleCollapsed,
  drawerOpen,
  onCloseDrawer,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reduced = usePrefersReducedMotion();

  // The collapse only applies from the `md` breakpoint up; the mobile drawer is
  // always full width. Before mount `isDesktop` is false, which matches the
  // server-rendered 272px — so there is no hydration jump.
  const showLabels = !collapsed || !isDesktop;
  const width = collapsed && isDesktop ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const labelTransition = {
    duration: reduced ? 0 : 0.2,
    ease: [0.4, 0, 0.2, 1] as const,
  };

  return (
    <TooltipProvider delayDuration={120}>
      <motion.aside
        id="admin-sidebar"
        initial={false}
        animate={{ width }}
        transition={{ duration: reduced ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
        aria-label="Admin sections"
        className={cn(
          // The literal width class is the server-rendered value; Framer's
          // inline width takes over on the client and animates the collapse.
          "fixed inset-y-0 left-0 z-50 flex w-[272px] shrink-0 flex-col bg-admin-sidebar",
          "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "md:sticky md:bottom-auto md:top-0 md:z-auto md:h-screen md:translate-x-0",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo block */}
        <div className={cn("shrink-0 pt-6", showLabels ? "px-4" : "px-4")}>
          <Link
            href="/admin/dashboard"
            onClick={onCloseDrawer}
            className={cn(
              "flex items-center gap-3 rounded-admin bg-admin-grad-pink text-white shadow-admin",
              showLabels ? "px-4 py-3.5" : "justify-center p-3.5",
            )}
          >
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20"
            >
              <Stethoscope className="h-5 w-5" />
            </span>
            <AnimatePresence initial={false}>
              {showLabels ? (
                <motion.span
                  key="wordmark"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={labelTransition}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <span className="block text-base font-bold leading-tight">
                    Nexclinic
                  </span>
                  <span className="block text-[11px] font-medium leading-tight text-white/80">
                    Super Admin
                  </span>
                </motion.span>
              ) : null}
            </AnimatePresence>
            <span className="sr-only">Nexclinic Super Admin — go to dashboard</span>
          </Link>
        </div>

        {/* Nav list */}
        {/* `py-5` leaves room for the active item's notches, which reach 20px
            above and below the pill and would otherwise be clipped by the
            scroll container on the first and last items. */}
        <nav className="mt-4 min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <ul className="flex list-none flex-col gap-1.5 py-5">
            {ADMIN_NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              const link = (
                <Link
                  href={item.href}
                  onClick={onCloseDrawer}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    // The pill is flush to the sidebar's right inner edge and
                    // rounded on the left only, so it reads as the page
                    // background reaching into the sidebar.
                    "group/nav relative flex h-12 w-full items-center rounded-l-full text-sm font-medium transition-colors duration-200",
                    showLabels ? "pr-4" : "pr-0",
                    active
                      ? "admin-nav-active text-admin-ink"
                      : "text-admin-muted hover:bg-admin-bg/45 hover:text-admin-ink",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="grid shrink-0 place-items-center"
                    style={{ width: ICON_COL }}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] transition-colors duration-200",
                        active ? "text-admin-pink" : "text-current",
                      )}
                    />
                  </span>

                  <AnimatePresence initial={false}>
                    {showLabels ? (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={labelTransition}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>

                  {!showLabels ? <span className="sr-only">{item.label}</span> : null}
                </Link>
              );

              return (
                <li key={item.href} className="relative">
                  {showLabels ? (
                    link
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Account + logout */}
        <div className="shrink-0 border-t border-admin-line px-4 py-4">
          <div
            className={cn(
              "flex items-center gap-3",
              showLabels ? "" : "justify-center",
            )}
          >
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-admin-grad-purple text-sm font-semibold text-white"
            >
              {ADMIN_PROFILE.initials}
            </span>
            <AnimatePresence initial={false}>
              {showLabels ? (
                <motion.span
                  key="account"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={labelTransition}
                  className="min-w-0 overflow-hidden whitespace-nowrap"
                >
                  <span className="block truncate text-sm font-semibold text-admin-ink">
                    {ADMIN_PROFILE.name}
                  </span>
                  <span className="block truncate text-xs text-admin-muted">
                    {ADMIN_PROFILE.role}
                  </span>
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="mt-3 border-t border-admin-line pt-3">
            {showLabels ? (
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-admin-muted transition-colors duration-200 hover:bg-admin-bg hover:text-rose-600"
              >
                <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
                Log out
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Log out"
                    className="grid h-10 w-full place-items-center rounded-xl text-admin-muted transition-colors duration-200 hover:bg-admin-bg hover:text-rose-600"
                  >
                    <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Log out</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Collapse toggle, pinned to the sidebar's right edge */}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls="admin-sidebar"
          className="absolute right-0 top-1/2 z-20 hidden h-7 w-7 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border border-admin-line bg-white text-admin-muted shadow-admin transition-colors duration-200 hover:text-admin-ink md:grid"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </motion.aside>
    </TooltipProvider>
  );
}

export default AdminSidebar;
