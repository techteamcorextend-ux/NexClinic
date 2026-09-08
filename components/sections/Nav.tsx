"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

function MenuLines({ className }: { className?: string }) {
  return (
    <span className={cn("flex h-4 w-5 flex-col justify-between", className)} aria-hidden="true">
      <span className="block h-[2px] w-full rounded-full bg-current" />
      <span className="block h-[2px] w-full rounded-full bg-current" />
      <span className="block h-[2px] w-3.5 rounded-full bg-current" />
    </span>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-out-soft",
        scrolled
          ? "border-b border-line/70 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60"
          : "bg-transparent",
      )}
    >
      <nav aria-label="Primary" className="shell flex h-20 items-center gap-4 md:h-24">
        <a
          href="#top"
          className="text-xl font-bold tracking-tight text-ink transition-opacity hover:opacity-70"
        >
          Nexclinic
        </a>

        <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogPrimitive.Trigger asChild>
            <button
              type="button"
              className="ml-3 hidden items-center gap-2.5 rounded-full border border-line bg-white/60 px-4 py-2 text-sm font-medium text-ink transition-colors duration-300 hover:bg-white sm:inline-flex"
            >
              <MenuLines />
              Menu
            </button>
          </DialogPrimitive.Trigger>

          <DialogPrimitive.Portal forceMount>
            <AnimatePresence>
              {menuOpen ? (
                <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
                  <motion.div
                    className="fixed inset-0 z-[80] bg-ink text-white"
                    initial={{ opacity: 0, y: reduced ? 0 : -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduced ? 0 : -16 }}
                    transition={{ duration: reduced ? 0.15 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <DialogPrimitive.Title className="sr-only">
                      Site navigation
                    </DialogPrimitive.Title>

                    <div className="shell flex h-20 items-center justify-between md:h-24">
                      <span className="text-xl font-bold tracking-tight">Nexclinic</span>
                      <DialogPrimitive.Close asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                        >
                          Close
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </DialogPrimitive.Close>
                    </div>

                    <ul className="shell mt-10 flex flex-col gap-2 md:mt-20">
                      {NAV_LINKS.map((link, index) => (
                        <motion.li
                          key={link.href}
                          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: reduced ? 0.15 : 0.5,
                            delay: reduced ? 0 : 0.06 * index,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >
                          <a
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="group flex items-baseline gap-5 border-b border-white/10 py-5 text-4xl font-bold tracking-tight transition-colors hover:text-accent-start md:text-6xl"
                          >
                            <span className="text-xs font-medium tracking-[0.2em] text-white/40">
                              0{index + 1}
                            </span>
                            {link.label}
                          </a>
                        </motion.li>
                      ))}
                    </ul>

                    <div className="shell mt-12 flex flex-wrap items-center gap-4">
                      <Button variant="gradient" asChild>
                        <Link href="/login" onClick={() => setMenuOpen(false)}>
                          Book a Demo
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/login" onClick={() => setMenuOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <p className="text-sm text-white/50">
                        The operating system for modern healthcare facilities.
                      </p>
                    </div>
                  </motion.div>
                </DialogPrimitive.Content>
              ) : null}
            </AnimatePresence>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <button
            type="button"
            aria-label="Search Nexclinic"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/60 text-ink transition-colors duration-300 hover:bg-white"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/60 text-ink transition-colors duration-300 hover:bg-white sm:hidden"
          >
            <MenuLines />
          </button>

          {/* The demo CTA and the login link both open the portal picker. */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex md:px-6 md:py-3 md:text-base"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="solid" size="sm" className="md:px-6 md:py-3 md:text-base" asChild>
            <Link href="/login">Book a Demo</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

export default Nav;
