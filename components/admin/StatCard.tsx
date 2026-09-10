"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MiniChart } from "./charts";
import type { StatCardDatum } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

import TextReveal from "@/components/motion/TextReveal";
const GRADIENTS: Record<StatCardDatum["gradient"], string> = {
  pink: "bg-admin-grad-pink",
  purple: "bg-admin-grad-purple",
  blue: "bg-admin-grad-blue",
  orange: "bg-admin-grad-orange",
};

const RANGES = ["This Month", "Last Month", "This Quarter", "This Year"];

export function StatCard({ stat }: { stat: StatCardDatum }) {
  const [range, setRange] = useState(RANGES[0]);

  return (
    <article
      className={cn(
        "flex flex-col justify-between rounded-admin p-5 text-white shadow-admin",
        GRADIENTS[stat.gradient],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <TextReveal as="h3" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
          {stat.label}
        </TextReveal>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-medium text-white transition-colors duration-200 hover:bg-white/30"
            >
              {range}
              <ChevronDown className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Change range for {stat.label}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {RANGES.map((option) => (
              <DropdownMenuItem key={option} onSelect={() => setRange(option)}>
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
        {stat.value}
      </p>
      <p className="mt-1 text-xs font-medium text-white">{stat.helper}</p>

      <div className="mt-3">
        <MiniChart data={stat.series} variant={stat.chart} />
      </div>
    </article>
  );
}

export default StatCard;
