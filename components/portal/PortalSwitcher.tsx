"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PORTAL_JUMP } from "@/lib/portal-nav";
import { cn } from "@/lib/utils";

/**
 * Test-run portal switcher.
 *
 * This build has no authentication — picking a role at login just opens that
 * portal. This row keeps that true everywhere: you can hop straight between
 * the five role views without going back through the login screen.
 */
export { PORTAL_JUMP as PORTAL_LINKS } from "@/lib/portal-nav";

export function PortalSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Switch portal"
      className={cn("no-scrollbar flex items-center gap-1.5 overflow-x-auto", className)}
    >
      <span className="mr-1 hidden shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-p-muted lg:inline">
        Portal
      </span>
      {PORTAL_JUMP.map((link) => {
        // Segment-aware so /patients/p-1001 never lights up the /patient chip.
        const active =
          pathname === link.match || pathname.startsWith(`${link.match}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ease-out-soft",
              active
                ? "bg-p-grad text-white shadow-lift"
                : "border border-p-line bg-p-card text-p-muted hover:-translate-y-0.5 hover:text-p-ink motion-reduce:hover:translate-y-0",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default PortalSwitcher;
