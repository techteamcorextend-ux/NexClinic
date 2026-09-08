"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { usePrefersReducedMotion } from "./use-media-query";

const STORAGE_KEY = "nexclinic:admin-sidebar-collapsed";

/**
 * Persistent admin chrome. Holds the sidebar's collapsed state (mirrored to
 * localStorage) and the mobile drawer state, and fades each routed page in.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Restore the saved preference after mount, so the server and client agree
  // on the first render.
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      /* storage unavailable (private mode) — fall back to expanded */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed, hydrated]);

  // Close the drawer whenever the route changes, and on Escape.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const toggleCollapsed = useCallback(() => setCollapsed((value) => !value), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="min-h-screen bg-admin-bg text-admin-ink md:flex">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-admin-ink focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        drawerOpen={drawerOpen}
        onCloseDrawer={closeDrawer}
      />

      {/* Mobile backdrop */}
      <AnimatePresence>
        {drawerOpen ? (
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeDrawer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            className="fixed inset-0 z-40 bg-admin-ink/40 backdrop-blur-[2px] md:hidden"
          />
        ) : null}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onOpenDrawer={() => setDrawerOpen(true)} />

        <main
          id="admin-main"
          className="flex-1 px-4 pb-12 pt-1 sm:px-6 lg:px-8"
        >
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
