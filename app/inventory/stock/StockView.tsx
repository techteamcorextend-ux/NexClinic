"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, Package, Pin, PinOff, Plus } from "lucide-react";
import InventoryShell from "@/components/inventory/InventoryShell";
import { PCard, PPill, Reveal, SectionTitle } from "@/components/portal/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MorphButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { isLow, type StockCategory } from "@/lib/clinic-types";
import { cn } from "@/lib/utils";

const CATEGORIES: StockCategory[] = ["Medicine", "Equipment", "OT Supply", "Reagent"];

function AddStockDialog() {
  const { dispatch } = useClinic();
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    dispatch({
      type: "stock/add",
      item: {
        name: String(form.get("name") ?? "New item"),
        category: String(form.get("category") ?? "Medicine") as StockCategory,
        qty: Number(form.get("qty") ?? 0),
        unit: String(form.get("unit") ?? "units"),
        reorderLevel: Number(form.get("reorder") ?? 50),
        expiry: String(form.get("expiry") ?? "") || undefined,
        price: Number(form.get("price") ?? 0),
      },
    });
    setSaved(true);
  };

  return (
    <Dialog onOpenChange={(open) => !open && setSaved(false)}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-p-grad px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-transform duration-300 hover:scale-[1.03] motion-reduce:hover:scale-100"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add stock / item
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Add an item</DialogTitle>
        <DialogDescription>
          Quick add — name, category and quantity are all that is required.
        </DialogDescription>

        {saved ? (
          <p role="status" className="mt-6 rounded-chip bg-emerald-50 p-5 text-sm text-emerald-800">
            Item added to the register and written to the stock log.
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="item-name">Item name</Label>
              <Input id="item-name" name="name" placeholder="Azithromycin 500 mg" required />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="item-category">Category</Label>
                <select
                  id="item-category"
                  name="category"
                  className="h-12 w-full rounded-chip border border-line bg-white px-3 text-base text-ink focus:border-blue-500 focus:outline-none"
                >
                  {CATEGORIES.map((entry) => (
                    <option key={entry}>{entry}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="item-qty">Quantity</Label>
                <Input id="item-qty" name="qty" type="number" min={0} defaultValue={100} required />
              </div>
              <div>
                <Label htmlFor="item-unit">Unit</Label>
                <Input id="item-unit" name="unit" defaultValue="tabs" required />
              </div>
              <div>
                <Label htmlFor="item-reorder">Reorder level</Label>
                <Input id="item-reorder" name="reorder" type="number" min={0} defaultValue={50} />
              </div>
              <div>
                <Label htmlFor="item-price">Unit price (₹)</Label>
                <Input id="item-price" name="price" type="number" min={0} defaultValue={10} />
              </div>
              <div>
                <Label htmlFor="item-expiry">Expiry (optional)</Label>
                <Input id="item-expiry" name="expiry" type="date" />
              </div>
            </div>

            <MorphButton type="submit" doneLabel="Item added" className="w-full">
              Quick add item
            </MorphButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function StockView() {
  const { state, dispatch } = useClinic();

  const low = state.stock.filter(isLow);
  const lowMedicines = low.filter((item) => item.category === "Medicine");
  const lowEquipment = low.filter((item) => item.category !== "Medicine");

  return (
    <InventoryShell
      title="Stock management"
      subtitle={`${low.length} items at or below their reorder level`}
      actions={<AddStockDialog />}
    >
      {/* ── Low stock ── */}
      <Reveal>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[
            { title: "Low stock — medicines", rows: lowMedicines },
            { title: "Low stock — equipment & supplies", rows: lowEquipment },
          ].map((group) => (
            <PCard key={group.title}>
              <SectionTitle
                title={group.title}
                action={
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    {group.rows.length}
                  </span>
                }
              />
              <ul className="mt-4 list-none space-y-2.5">
                {group.rows.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-p-ink">
                        {item.name}
                      </span>
                      <span className="block text-xs text-p-muted">
                        {item.qty} {item.unit} left · reorder at {item.reorderLevel}
                      </span>
                    </span>
                    {item.flaggedLow ? <PPill tone="Critical">Pinned</PPill> : null}
                  </li>
                ))}
                {group.rows.length === 0 ? (
                  <li className="rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
                    Nothing low in this group.
                  </li>
                ) : null}
              </ul>
            </PCard>
          ))}
        </div>
      </Reveal>

      {/* ── Mark as low ── */}
      <Reveal delay={0.06}>
        <PCard className="mt-5">
          <SectionTitle title="Pin an item as low stock" />
          <p className="mt-2 text-sm text-p-muted">
            Pinning forces an item into the low-stock list even when it is above its
            reorder level — useful when a batch is unusable or reserved.
          </p>

          <ul className="mt-4 grid list-none grid-cols-1 gap-2.5 md:grid-cols-2">
            {state.stock.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3",
                  item.flaggedLow ? "border-rose-200 bg-rose-50/50" : "border-p-line",
                )}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-p-soft text-p-accent">
                  <Package className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-p-ink">
                    {item.name}
                  </span>
                  <span className="block text-xs text-p-muted">
                    {item.category} · {item.qty} {item.unit}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "stock/flagLow", id: item.id, flagged: !item.flaggedLow })
                  }
                  aria-pressed={item.flaggedLow}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors duration-200",
                    item.flaggedLow
                      ? "bg-rose-600 text-white"
                      : "border border-p-line text-p-muted hover:text-p-ink",
                  )}
                >
                  {item.flaggedLow ? (
                    <>
                      <PinOff className="h-3.5 w-3.5" aria-hidden="true" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-3.5 w-3.5" aria-hidden="true" />
                      Mark low
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </PCard>
      </Reveal>
    </InventoryShell>
  );
}
