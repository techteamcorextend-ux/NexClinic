"use client";

import Link from "next/link";
import { MapPin, Navigation, Phone, Star } from "lucide-react";
import InventoryShell from "@/components/inventory/InventoryShell";
import { PCard, PPill, Reveal } from "@/components/portal/ui";
import { ChevronButton, DownloadButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { downloadCsv } from "@/lib/downloads";

import TextReveal from "@/components/motion/TextReveal";
function Rating({ value }: { value: number }) {
  const full = Math.floor(value);
  return (
    <span className="flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={
            index < full
              ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
              : "h-3.5 w-3.5 text-p-line"
          }
        />
      ))}
      <span className="ml-1 text-xs font-semibold tabular-nums text-p-ink">{value}</span>
    </span>
  );
}

export default function SuppliersView() {
  const { state } = useClinic();

  return (
    <InventoryShell
      title="Suppliers"
      subtitle={`${state.suppliers.length} approved vendors`}
      actions={
        <DownloadButton
          fileLabel="Supplier list CSV"
          className="bg-p-card px-4 py-2.5 text-p-ink hover:bg-p-soft"
          onDownload={() =>
            downloadCsv(
              "suppliers",
              ["Supplier", "Category", "Address", "Contact", "Distance (km)", "Rating"],
              state.suppliers.map((supplier) => [
                supplier.name,
                supplier.category,
                supplier.address,
                supplier.contact,
                supplier.distanceKm,
                supplier.rating,
              ]),
            )
          }
        >
          Export
        </DownloadButton>
      }
    >
      <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.suppliers.map((supplier, index) => (
          <li key={supplier.id}>
            <Reveal delay={index * 0.04} className="h-full">
              <PCard className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <TextReveal as="h2" className="truncate text-base font-bold tracking-tight text-p-ink">
                      {supplier.name}
                    </TextReveal>
                    <p className="mt-0.5 text-xs text-p-muted">{supplier.id}</p>
                  </div>
                  <PPill>{supplier.category}</PPill>
                </div>

                <ul className="mt-4 list-none space-y-2.5 text-sm">
                  <li className="flex items-start gap-2 text-p-muted">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {supplier.address}
                  </li>
                  <li className="flex items-center gap-2 text-p-muted">
                    <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {supplier.contact}
                  </li>
                  <li className="flex items-center gap-2 text-p-muted">
                    <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {supplier.distanceKm} km from the clinic
                  </li>
                </ul>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-p-line pt-4">
                  <Rating value={supplier.rating} />
                  <ChevronButton href="/inventory/orders" className="px-3.5 py-2 text-xs">
                    Order
                  </ChevronButton>
                </div>
              </PCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </InventoryShell>
  );
}
