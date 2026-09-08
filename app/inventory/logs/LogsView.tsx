"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Pin,
  PlusCircle,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import InventoryShell from "@/components/inventory/InventoryShell";
import { PCard, Reveal, SectionTitle } from "@/components/portal/ui";
import { DownloadButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import type { StockLogKind } from "@/lib/clinic-types";
import { downloadCsv } from "@/lib/downloads";
import { cn } from "@/lib/utils";

const KIND_META: Record<
  StockLogKind,
  { label: string; icon: typeof PlusCircle; tone: string }
> = {
  issue: { label: "Issued", icon: ArrowUpFromLine, tone: "bg-rose-50 text-rose-700" },
  receive: { label: "Received", icon: ArrowDownToLine, tone: "bg-emerald-50 text-emerald-700" },
  add: { label: "Added", icon: PlusCircle, tone: "bg-sky-50 text-sky-700" },
  delete: { label: "Removed", icon: Trash2, tone: "bg-rose-50 text-rose-700" },
  order: { label: "Ordered", icon: ShoppingCart, tone: "bg-violet-50 text-violet-700" },
  flag: { label: "Flagged", icon: Pin, tone: "bg-amber-50 text-amber-700" },
};

const FILTERS: ("all" | StockLogKind)[] = [
  "all",
  "order",
  "receive",
  "issue",
  "add",
  "delete",
  "flag",
];

export default function LogsView() {
  const { state } = useClinic();
  const [filter, setFilter] = useState<"all" | StockLogKind>("all");

  const rows =
    filter === "all"
      ? state.stockLogs
      : state.stockLogs.filter((entry) => entry.kind === filter);

  return (
    <InventoryShell
      title="History logs"
      subtitle={`${state.stockLogs.length} recorded stock movements`}
      actions={
        <DownloadButton
          fileLabel="Stock log CSV"
          className="bg-p-card px-4 py-2.5 text-p-ink hover:bg-p-soft"
          onDownload={() =>
            downloadCsv(
              "stock-history",
              ["When", "Type", "Detail", "By"],
              state.stockLogs.map((entry) => [
                entry.at,
                KIND_META[entry.kind].label,
                entry.detail,
                entry.by,
              ]),
            )
          }
        >
          Export
        </DownloadButton>
      }
    >
      <Reveal>
        <PCard>
          <SectionTitle title="Everything that touched stock" />
          <p className="mt-2 text-sm text-p-muted">
            Orders, receipts, issues against bills, manual adds and low-stock pins —
            all in one trail.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setFilter(entry)}
                aria-pressed={filter === entry}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200",
                  filter === entry
                    ? "bg-p-grad text-white"
                    : "border border-p-line bg-p-card text-p-muted hover:text-p-ink",
                )}
              >
                {entry === "all" ? "Everything" : KIND_META[entry].label}
              </button>
            ))}
          </div>

          <ul className="mt-5 list-none space-y-2.5">
            {rows.map((entry) => {
              const meta = KIND_META[entry.kind];
              const Icon = meta.icon;
              return (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-p-line px-4 py-3"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                      meta.tone,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-p-ink">
                      {entry.detail}
                    </span>
                    <span className="block text-xs text-p-muted">
                      {entry.at} · {entry.by}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      meta.tone,
                    )}
                  >
                    {meta.label}
                  </span>
                </li>
              );
            })}

            {rows.length === 0 ? (
              <li className="rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
                No entries of this type yet.
              </li>
            ) : null}
          </ul>
        </PCard>
      </Reveal>
    </InventoryShell>
  );
}
