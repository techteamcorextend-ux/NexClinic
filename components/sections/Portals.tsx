"use client";

import type { CSSProperties } from "react";
import { FadeInOnScroll } from "@/components/motion/FadeInOnScroll";
import { PORTALS, PORTALS_HEADER } from "@/lib/data";
import { cn } from "@/lib/utils";

/** Fan angles for the stacked desktop deck (degrees, left → right). */
const FAN_ANGLES = [-7, -4.2, -1.4, 1.4, 4.2, 7];
const FAN_LIFT = [18, 8, 0, 0, 8, 18];

function PortalCard({
  name,
  body,
  index,
  className,
}: {
  name: string;
  body: string;
  index: number;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col justify-between rounded-card border border-line bg-white p-6 shadow-soft transition-[transform,box-shadow] duration-500 ease-out-soft",
        className,
      )}
    >
      <div>
        <span className="inline-flex rounded-full bg-surface-tint px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-end">
          Portal
        </span>

        <div
          aria-hidden="true"
          className="placeholder-surface mt-5 h-24 w-full rounded-chip border border-line"
        />

        <h3 className="mt-6 text-lg font-semibold leading-tight tracking-tight text-ink">
          {name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
      </div>

      <span className="mt-8 text-xs font-medium tabular-nums text-ink-muted">
        0{index + 1} / 06
      </span>
    </article>
  );
}

export function Portals() {
  return (
    <section id="portals" className="scroll-mt-28 bg-white py-24 md:py-32">
      <div className="shell">
        <FadeInOnScroll className="max-w-2xl">
          <p className="eyebrow">Role-based workspaces</p>
          <h2 className="section-title mt-5">{PORTALS_HEADER.headline}</h2>
          <p className="body-copy mt-5">{PORTALS_HEADER.subtext}</p>
        </FadeInOnScroll>
      </div>

      {/* Desktop: fanned deck — cards straighten and separate on hover */}
      <FadeInOnScroll delay={0.1}>
        <div className="shell mt-16 hidden md:block">
          {/*
            The fan transform lives in a class (driven by CSS variables) so that
            `group-hover:[transform:none]` can override it — an inline transform
            would always win.
          */}
          <ul className="group flex list-none justify-center pt-6">
            {PORTALS.map((portal, index) => (
              <li
                key={portal.name}
                className={cn(
                  "w-[190px] shrink-0 transition-[transform,margin] duration-500 ease-out-soft lg:w-[210px]",
                  "[transform:rotate(var(--fan-rot))_translateY(var(--fan-y))] group-hover:[transform:none]",
                  index > 0 && "-ml-16 group-hover:-ml-3 lg:-ml-20",
                )}
                style={
                  {
                    "--fan-rot": `${FAN_ANGLES[index]}deg`,
                    "--fan-y": `${FAN_LIFT[index]}px`,
                    zIndex: 10 - Math.abs(index - 2.5),
                  } as CSSProperties
                }
              >
                <PortalCard
                  {...portal}
                  index={index}
                  className="min-h-[22rem] hover:-translate-y-2 hover:shadow-lift"
                />
              </li>
            ))}
          </ul>
        </div>
      </FadeInOnScroll>

      {/* Mobile: swipeable single-column carousel */}
      <div className="mt-12 md:hidden">
        <ul
          className="no-scrollbar flex snap-x snap-mandatory list-none gap-4 overflow-x-auto px-5 pb-4"
          aria-label="Nexclinic portals"
        >
          {PORTALS.map((portal, index) => (
            <li key={portal.name} className="w-[78vw] max-w-xs shrink-0 snap-center">
              <PortalCard {...portal} index={index} className="h-full" />
            </li>
          ))}
        </ul>
        <p className="shell mt-2 text-xs text-ink-muted">Swipe to see all six portals →</p>
      </div>
    </section>
  );
}

export default Portals;
