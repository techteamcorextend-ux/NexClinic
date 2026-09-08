"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Boxes, CalendarX, Search, Trash2, Wrench } from "lucide-react";
import InventoryShell from "@/components/inventory/InventoryShell";
import {
  PCard,
  PLinkCard,
  PPill,
  Reveal,
  SectionTitle,
} from "@/components/portal/ui";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@/components/ui/table";
import { DownloadButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { isLow, type StockCategory } from "@/lib/clinic-types";
import { downloadCsv } from "@/lib/downloads";
import { cn } from "@/lib/utils";

const CATEGORIES: (StockCategory | "All")[] = [
  "All",
  "Medicine",
  "Equipment",
  "OT Supply",
  "Reagent",
];

/** Anything expiring within 60 days is called out. */
function expiringSoon(expiry?: string) {
  if (!expiry) return false;
  const days = (new Date(expiry).getTime() - new Date("2026-09-08").getTime()) / 86400000;
  return days >= 0 && days <= 60;
}

export default function InventoryOverview() {
  const { state, dispatch } = useClinic();
  const [category, setCategory] = useState<StockCategory | "All">("All");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.stock.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (!needle) return true;
      return item.name.toLowerCase().includes(needle);
    });
  }, [state.stock, category, query]);

  const lowCount = state.stock.filter(isLow).length;
  const expiringCount = state.stock.filter((item) => expiringSoon(item.expiry)).length;
  const stockValue = state.stock.reduce((sum, item) => sum + item.qty * item.price, 0);
  const maintenance = state.equipment.filter(
    (item) => item.status !== "Operational",
  ).length;

  const tiles = [
    { label: "Items tracked", value: String(state.stock.length), href: "/inventory/stock", icon: Boxes },
    { label: "Low stock", value: String(lowCount), href: "/inventory/stock", icon: AlertTriangle },
    { label: "Expiring in 60 days", value: String(expiringCount), href: "/inventory/stock", icon: CalendarX },
    { label: "Equipment needing work", value: String(maintenance), href: "/inventory/equipment", icon: Wrench },
  ];

  return (
    <InventoryShell
      title="Inventory overview"
      subtitle={`₹${stockValue.toLocaleString("en-IN")} of stock on hand · ${lowCount} items low`}
      actions={
        <DownloadButton
          fileLabel="Stock register CSV"
          className="bg-p-card px-4 py-2.5 text-p-ink hover:bg-p-soft"
          onDownload={() =>
            downloadCsv(
              "stock-register",
              ["Item", "Category", "Quantity", "Unit", "Reorder level", "Expiry", "Unit price", "Status"],
              state.stock.map((item) => [
                item.name,
                item.category,
                item.qty,
                item.unit,
                item.reorderLevel,
                item.expiry ?? "—",
                item.price,
                isLow(item) ? "Low" : "In stock",
              ]),
            )
          }
        >
          Export
        </DownloadButton>
      }
    >
      {/* ── Overview tiles ── */}
      <Reveal>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <PLinkCard key={tile.label} href={tile.href} label={`${tile.label}: ${tile.value}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-p-muted">{tile.label}</p>
                  <Icon className="h-4 w-4 shrink-0 text-p-accent" aria-hidden="true" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-p-ink">
                  {tile.value}
                </p>
              </PLinkCard>
            );
          })}
        </div>
      </Reveal>

      {/* ── Register ── */}
      <Reveal delay={0.05}>
        <PCard className="mt-5">
          <SectionTitle
            title="All items"
            action={
              <Link
                href="/inventory/stock"
                className="text-sm font-semibold text-p-accent hover:underline"
              >
                Add or adjust stock →
              </Link>
            }
          />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
            <div className="relative">
              <label htmlFor="stock-search" className="sr-only">
                Search stock
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-p-muted"
                aria-hidden="true"
              />
              <input
                id="stock-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search items"
                className="h-11 w-full rounded-full border border-p-line bg-p-card pl-11 pr-4 text-sm text-p-ink placeholder:text-p-muted focus:border-p-accent focus:outline-none"
              />
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {CATEGORIES.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setCategory(entry)}
                  aria-pressed={category === entry}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-colors duration-200",
                    category === entry
                      ? "bg-p-grad text-white"
                      : "border border-p-line bg-p-card text-p-muted hover:text-p-ink",
                  )}
                >
                  {entry}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <TableScroll label="Stock register">
              <Table className="min-w-[880px]">
                <TableCaption>
                  Every tracked item, its category, quantity and expiry.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Reorder level</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold">{item.name}</TableCell>
                      <TableCell className="text-p-muted">{item.category}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.qty.toLocaleString("en-IN")}{" "}
                        <span className="text-p-muted">{item.unit}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-p-muted">
                        {item.reorderLevel.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "whitespace-nowrap",
                          expiringSoon(item.expiry) ? "font-semibold text-rose-600" : "text-p-muted",
                        )}
                      >
                        {item.expiry ?? "—"}
                      </TableCell>
                      <TableCell>
                        <PPill tone={isLow(item) ? "Critical" : "Stable"}>
                          {isLow(item) ? "Low" : "In stock"}
                        </PPill>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          aria-label={`Delete ${item.name} from the register`}
                          onClick={() => dispatch({ type: "stock/delete", id: item.id })}
                          className="grid h-9 w-9 place-items-center rounded-full text-p-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScroll>
          </div>

          {rows.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
              Nothing matches these filters.
            </p>
          ) : null}
        </PCard>
      </Reveal>
    </InventoryShell>
  );
}
