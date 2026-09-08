import type { Metadata } from "next";
import SmoothScroll from "@/components/motion/SmoothScroll";

export const metadata: Metadata = {
  title: "Nexclinic — The operating system for modern healthcare facilities",
  description:
    "Nexclinic unifies patient records, doctor workflows, front-desk operations, inventory, and AI-powered mental wellness into one secure platform — built for hospitals and multi-clinic networks.",
};

/**
 * Marketing-site chrome: Lenis smooth scrolling and the rounded page frame.
 * The admin panel deliberately sits outside this layout.
 */
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SmoothScroll />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      {/*
        The whole marketing page floats as one rounded card on a light gray
        ground. On mobile the frame is dropped for an edge-to-edge layout.
        `overflow-clip` (with `overflow-hidden` as the fallback) keeps the
        rounded corners clipping full-bleed content without breaking the sticky
        nav, which `overflow:hidden` alone would.
      */}
      <div className="min-h-screen bg-bg-frame p-0 lg:p-6">
        <div className="relative overflow-hidden overflow-clip bg-bg lg:rounded-frame lg:shadow-frame">
          {children}
        </div>
      </div>
    </>
  );
}
