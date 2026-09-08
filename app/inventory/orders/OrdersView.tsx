"use client";

import { useMemo, useState } from "react";
import { Minus, PackageCheck, Plus, Printer, Search, ShoppingCart, Trash2 } from "lucide-react";
import InventoryShell from "@/components/inventory/InventoryShell";
import { PCard, PPill, Reveal, SectionTitle } from "@/components/portal/ui";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DownloadButton, MorphButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { downloadPdf } from "@/lib/downloads";

type CartLine = { name: string; qty: number; price: number };

export default function OrdersView() {
  const { state, dispatch } = useClinic();

  const [supplierId, setSupplierId] = useState(state.suppliers[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);

  const supplier = state.suppliers.find((entry) => entry.id === supplierId);

  const matches = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return state.stock
      .filter((item) => (needle ? item.name.toLowerCase().includes(needle) : true))
      .slice(0, 6);
  }, [state.stock, search]);

  const addLine = (name: string, price: number) =>
    setCart((current) => {
      const existing = current.find((line) => line.name === name);
      if (existing) {
        return current.map((line) =>
          line.name === name ? { ...line, qty: line.qty + 10 } : line,
        );
      }
      return [...current, { name, qty: 10, price }];
    });

  const cartTotal = cart.reduce((sum, line) => sum + line.qty * line.price, 0);

  const confirmOrder = () => {
    if (!supplierId || cart.length === 0) return;
    dispatch({ type: "order/place", supplierId, items: cart });
    setCart([]);
  };

  const printOrder = (id: string) => {
    const order = state.orders.find((entry) => entry.id === id);
    if (!order) return;
    downloadPdf(`purchase-order-${order.id}`, {
      title: `Nexclinic — Purchase Order ${order.id}`,
      subtitle: `${order.supplier} · placed ${order.placedAt}`,
      lines: [
        `Status: ${order.status}`,
        "",
        "Line items",
        ...order.items.map(
          (item) => `  ${item.name} x${item.qty} @ Rs. ${item.price} = Rs. ${item.qty * item.price}`,
        ),
        "",
        `Order total: Rs. ${order.total.toLocaleString("en-IN")}`,
        "",
        "Sample output generated in the browser.",
      ],
    });
  };

  return (
    <InventoryShell
      title="Orders"
      subtitle={`${state.orders.length} purchase orders on file`}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* ── Order history ── */}
        <Reveal>
          <PCard>
            <SectionTitle title="Order history" />
            <div className="mt-4">
              <TableScroll label="Purchase order history">
                <Table className="min-w-[760px]">
                  <TableCaption>Every purchase order raised, newest first.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Placed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-semibold">{order.id}</TableCell>
                        <TableCell className="text-p-muted">{order.supplier}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {order.items.length}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          ₹{order.total.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-p-muted">
                          {order.placedAt}
                        </TableCell>
                        <TableCell>
                          <PPill
                            tone={
                              order.status === "Received"
                                ? "Resolved"
                                : order.status === "In transit"
                                  ? "In consult"
                                  : "Waiting"
                            }
                          >
                            {order.status}
                          </PPill>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-2">
                            <DownloadButton
                              fileLabel={`Order ${order.id}`}
                              className="bg-p-soft px-3 py-1.5 text-xs text-p-ink hover:bg-p-soft/70"
                              onDownload={() => printOrder(order.id)}
                            >
                              <Printer className="hidden" aria-hidden="true" />
                              Print
                            </DownloadButton>
                            {order.status !== "Received" ? (
                              <button
                                type="button"
                                onClick={() => dispatch({ type: "order/receive", id: order.id })}
                                className="inline-flex items-center gap-1.5 rounded-full border border-p-line px-3 py-1.5 text-xs font-semibold text-p-ink transition-colors hover:border-p-accent/50"
                              >
                                <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                Receive
                              </button>
                            ) : null}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableScroll>
            </div>
            <p className="mt-3 text-xs text-p-muted">
              Marking an order received adds its quantities back into the stock
              register.
            </p>
          </PCard>
        </Reveal>

        {/* ── Place order ── */}
        <Reveal delay={0.06}>
          <PCard className="h-fit">
            <SectionTitle title="Place an order" />

            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="order-vendor">Vendor</Label>
                <select
                  id="order-vendor"
                  value={supplierId}
                  onChange={(event) => setSupplierId(event.target.value)}
                  className="h-12 w-full rounded-chip border border-p-line bg-p-card px-3 text-base text-p-ink focus:border-p-accent focus:outline-none"
                >
                  {state.suppliers.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name} — {entry.category}
                    </option>
                  ))}
                </select>
                {supplier ? (
                  <p className="mt-1.5 text-xs text-p-muted">
                    {supplier.distanceKm} km · rated {supplier.rating} · {supplier.contact}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="order-search">Search medicines and supplies</Label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-p-muted"
                    aria-hidden="true"
                  />
                  <Input
                    id="order-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Amoxicillin, sutures…"
                    className="pl-11"
                  />
                </div>
              </div>

              <ul className="list-none space-y-2">
                {matches.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl border border-p-line px-4 py-2.5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-p-ink">
                        {item.name}
                      </span>
                      <span className="block text-xs text-p-muted">
                        ₹{item.price} per {item.unit.replace(/s$/, "")}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => addLine(item.name, item.price)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-p-grad px-3.5 py-2 text-xs font-semibold text-white transition-transform duration-300 hover:scale-105 motion-reduce:hover:scale-100"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cart preview */}
            <div className="mt-5 rounded-2xl bg-p-soft p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-p-ink">
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Cart preview
              </p>

              <ul className="mt-3 list-none space-y-2">
                {cart.map((line) => (
                  <li key={line.name} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-p-ink">
                      {line.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Decrease ${line.name}`}
                        onClick={() =>
                          setCart((current) =>
                            current.map((entry) =>
                              entry.name === line.name
                                ? { ...entry, qty: Math.max(1, entry.qty - 10) }
                                : entry,
                            ),
                          )
                        }
                        className="grid h-7 w-7 place-items-center rounded-lg bg-p-card text-p-muted hover:text-p-ink"
                      >
                        <Minus className="h-3 w-3" aria-hidden="true" />
                      </button>
                      <span className="w-12 text-center text-sm font-semibold tabular-nums text-p-ink">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${line.name}`}
                        onClick={() =>
                          setCart((current) =>
                            current.map((entry) =>
                              entry.name === line.name
                                ? { ...entry, qty: entry.qty + 10 }
                                : entry,
                            ),
                          )
                        }
                        className="grid h-7 w-7 place-items-center rounded-lg bg-p-card text-p-muted hover:text-p-ink"
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${line.name}`}
                        onClick={() =>
                          setCart((current) =>
                            current.filter((entry) => entry.name !== line.name),
                          )
                        }
                        className="grid h-7 w-7 place-items-center rounded-lg text-p-muted hover:text-rose-600"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </span>
                  </li>
                ))}
                {cart.length === 0 ? (
                  <li className="text-sm text-p-muted">Nothing added yet.</li>
                ) : null}
              </ul>

              <p className="mt-3 flex items-center justify-between border-t border-p-line pt-3 text-sm">
                <span className="font-semibold text-p-ink">Order total</span>
                <span className="text-lg font-bold tabular-nums text-p-ink">
                  ₹{cartTotal.toLocaleString("en-IN")}
                </span>
              </p>
            </div>

            <MorphButton
              doneLabel="Order placed"
              disabled={cart.length === 0}
              onClick={confirmOrder}
              className="mt-4 w-full bg-p-grad text-white"
            >
              Confirm order
            </MorphButton>
          </PCard>
        </Reveal>
      </div>
    </InventoryShell>
  );
}
