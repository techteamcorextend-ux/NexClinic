"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, Menu, Search, X, type LucideIcon } from "lucide-react";
import Backdrop from "./Backdrop";
import PortalSwitcher from "./PortalSwitcher";
import { PAvatar } from "./ui";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

export type PortalNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type PortalShellProps = {
  theme: "care" | "clinic" | "violet" | "vault" | "night";
  nav: PortalNavItem[];
  title: string;
  subtitle?: string;
  user: { name: string; initials: string; role: string };
  actions?: ReactNode;
  backdrop?: "soft" | "leaf" | "grid" | "aurora";
  children: ReactNode;
};

/**
 * Chrome shared by the patient, doctor, reception and inventory portals.
 * The visual identity comes entirely from the `theme` class — the markup is
 * identical across all four.
 */
export function PortalShell({
  theme,
  nav,
  title,
  subtitle,
  user,
  actions,
  backdrop = "soft",
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const reduced = useReducedMotionSafe();
  const [menuOpen, setMenuOpen] = useState(false);

  const railItem = (item: PortalNavItem, index: number) => {
    const active = pathname === item.href;
    const Icon = item.icon;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-label={item.label}
          aria-current={active ? "page" : undefined}
          title={item.label}
          className={cn(
            "group grid h-12 w-12 place-items-center rounded-2xl transition-all duration-300 ease-out-soft",
            active
              ? "bg-white text-p-accent shadow-lift"
              : "text-white/70 hover:-translate-y-0.5 hover:bg-white/15 hover:text-white motion-reduce:hover:translate-y-0",
          )}
          style={{ transitionDelay: reduced ? undefined : `${index * 15}ms` }}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </Link>
      </li>
    );
  };

  return (
    <div className={cn(`theme-${theme}`, "relative min-h-screen bg-p-bg text-p-ink")}>
      <Backdrop variant={backdrop} />

      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-p-ink focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      <div className="relative mx-auto flex w-full max-w-[1480px] gap-5 p-3 sm:p-4 lg:p-6">
        {/* Icon rail */}
        <aside
          aria-label={`${title} sections`}
          className="sticky top-6 hidden h-[calc(100vh-3rem)] w-[76px] shrink-0 flex-col items-center rounded-[26px] bg-p-grad py-6 shadow-lift md:flex"
        >
          <Link
            href="/login"
            aria-label="Nexclinic — back to portal picker"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 text-sm font-bold text-white transition-transform duration-300 hover:scale-105 motion-reduce:hover:scale-100"
          >
            M
          </Link>

          <ul className="mt-8 flex list-none flex-col items-center gap-3">
            {nav.map(railItem)}
          </ul>

          <Link
            href="/login"
            aria-label="Leave this portal"
            title="Leave this portal"
            className="mt-auto grid h-12 w-12 place-items-center rounded-2xl text-white/70 transition-colors duration-300 hover:bg-white/15 hover:text-white"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </Link>
        </aside>

        {/* Content column */}
        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center gap-3 pb-4">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open portal menu"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-p-line bg-p-card text-p-ink md:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold tracking-tight text-p-ink">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-0.5 truncate text-sm text-p-muted">{subtitle}</p>
              ) : null}
            </div>

            <PortalSwitcher className="order-last w-full sm:order-none sm:w-auto" />

            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}

            <button
              type="button"
              aria-label="Search"
              className="hidden h-10 w-10 place-items-center rounded-full border border-p-line bg-p-card text-p-muted transition-colors hover:text-p-ink sm:grid"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label="Notifications, 2 unread"
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-p-line bg-p-card text-p-muted transition-colors hover:text-p-ink"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-p-card"
              />
            </button>

            <span className="flex shrink-0 items-center gap-2.5 rounded-full border border-p-line bg-p-card py-1.5 pl-1.5 pr-3">
              <PAvatar initials={user.initials} name={user.name} size="sm" />
              <span className="hidden leading-tight sm:block">
                <span className="block text-xs font-semibold text-p-ink">{user.name}</span>
                <span className="block text-[11px] text-p-muted">{user.role}</span>
              </span>
            </span>
          </header>

          <main id="portal-main" className="pb-10">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile nav sheet */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <button
              type="button"
              aria-label="Close portal menu"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.nav
              aria-label={`${title} sections`}
              initial={{ x: reduced ? 0 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: reduced ? 0 : -280 }}
              transition={{ duration: reduced ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-y-0 left-0 w-[264px] bg-p-grad p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">Nexclinic</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close portal menu"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <ul className="mt-8 flex list-none flex-col gap-1.5">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                          active ? "bg-white text-p-accent" : "text-white/80 hover:bg-white/15",
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-8 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/15"
              >
                <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
                Leave this portal
              </Link>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default PortalShell;
