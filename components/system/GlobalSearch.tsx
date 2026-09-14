"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  CornerDownLeft,
  FileText,
  LayoutGrid,
  Package,
  Search,
  Truck,
  User,
  Users,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useClinic } from "@/lib/clinic-store";
import { PATIENTS } from "@/lib/portal-data";
import { ADMIN_NAV } from "@/lib/admin-nav";
import {
  INVENTORY_NAV,
  PATIENT_NAV,
  RECEPTION_NAV,
  SURGEON_NAV,
} from "@/lib/portal-nav";
import { useSession } from "@/lib/session";
import type { RoleKey } from "@/lib/roles";
import { cn } from "@/lib/utils";

type Hit = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  href: string;
  icon: typeof Search;
};

const NAV_FOR: Record<RoleKey, { label: string; href: string }[]> = {
  admin: ADMIN_NAV.map((item) => ({ label: item.label, href: item.href })),
  surgeon: SURGEON_NAV.map((item) => ({ label: item.label, href: item.href })),
  reception: RECEPTION_NAV.map((item) => ({ label: item.label, href: item.href })),
  inventory: INVENTORY_NAV.map((item) => ({ label: item.label, href: item.href })),
  patient: PATIENT_NAV.map((item) => ({ label: item.label, href: item.href })),
};

/**
 * One search across everything the signed-in role is allowed to open.
 *
 * The index is built from the same sources the pages render from, and it is
 * scoped by role: a receptionist finds patients and their own screens, an
 * inventory manager finds stock, suppliers and orders. Nothing a role cannot
 * open is ever offered.
 */
export function GlobalSearch({
  tone = "portal",
  variant = "icon",
  className,
}: {
  tone?: "portal" | "admin";
  /** "icon" is the round button in a portal header; "field" the admin bar. */
  variant?: "icon" | "field";
  className?: string;
}) {
  const session = useSession();
  const { state } = useClinic();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const role = session?.role;

  // ⌘K / Ctrl+K from anywhere in the portal.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const index = useMemo<Hit[]>(() => {
    if (!role) return [];
    const hits: Hit[] = [];

    NAV_FOR[role].forEach((item) =>
      hits.push({
        id: `nav-${item.href}`,
        group: "Screens",
        label: item.label,
        href: item.href,
        icon: LayoutGrid,
      }),
    );

    // Patient files — clinicians, the front desk and admin oversight.
    if (role === "admin" || role === "surgeon" || role === "reception") {
      PATIENTS.forEach((patient) =>
        hits.push({
          id: `patient-${patient.id}`,
          group: "Patients",
          label: patient.name,
          hint: `${patient.id} · ${patient.condition}`,
          href: `/patients/${patient.id}`,
          icon: User,
        }),
      );
    }

    if (role === "admin") {
      state.staff.forEach((member) =>
        hits.push({
          id: `staff-${member.id}`,
          group: "Staff",
          label: member.name,
          hint: `${member.role} · ${member.dept}`,
          href: `/admin/staff/${member.id}`,
          icon: Users,
        }),
      );
      state.orders
        .filter((order) => order.status === "Awaiting approval")
        .forEach((order) =>
          hits.push({
            id: `approval-${order.id}`,
            group: "Approvals",
            label: `${order.id} — ${order.supplier}`,
            hint: `₹${order.total.toLocaleString("en-IN")} awaiting your decision`,
            href: "/admin/approvals",
            icon: FileText,
          }),
        );
    }

    if (role === "inventory") {
      state.stock.forEach((item) =>
        hits.push({
          id: `stock-${item.id}`,
          group: "Stock",
          label: item.name,
          hint: `${item.qty} in hand`,
          href: "/inventory/stock",
          icon: Package,
        }),
      );
      state.suppliers.forEach((supplier) =>
        hits.push({
          id: `supplier-${supplier.id}`,
          group: "Suppliers",
          label: supplier.name,
          href: "/inventory/suppliers",
          icon: Truck,
        }),
      );
      state.orders.forEach((order) =>
        hits.push({
          id: `order-${order.id}`,
          group: "Orders",
          label: `${order.id} — ${order.supplier}`,
          hint: order.status,
          href: "/inventory/orders",
          icon: Boxes,
        }),
      );
    }

    return hits;
  }, [role, state.staff, state.stock, state.suppliers, state.orders]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return index.slice(0, 8);
    return index
      .filter((hit) =>
        `${hit.label} ${hit.hint ?? ""} ${hit.group}`.toLowerCase().includes(needle),
      )
      .slice(0, 12);
  }, [index, query]);

  useEffect(() => setActive(0), [query, open]);

  const go = (hit?: Hit) => {
    if (!hit) return;
    setOpen(false);
    setQuery("");
    router.push(hit.href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active]);
    }
  };

  return (
    <>
      {variant === "field" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "flex h-11 w-full items-center gap-3 rounded-full border border-transparent bg-white px-4 text-left text-sm text-admin-muted shadow-admin transition-colors duration-200 hover:text-admin-ink dark:bg-admin-card",
            className,
          )}
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Search patients, staff, invoices…</span>
          <kbd className="ml-auto hidden shrink-0 rounded border border-admin-line px-1.5 py-0.5 text-[10px] font-medium sm:block">
            ⌘K
          </kbd>
        </button>
      ) : (
        <button
          type="button"
          aria-label="Search"
          onClick={() => setOpen(true)}
          className={cn(
            "btn-aurora hidden h-10 w-10 place-items-center rounded-full border border-p-line bg-p-card text-p-muted transition-colors hover:text-p-ink sm:grid",
            className,
          )}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="top-[12vh] max-w-xl translate-y-0 p-0"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription className="sr-only">
            Search everything you have access to.
          </DialogDescription>

          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                role === "inventory"
                  ? "Search stock, suppliers, orders…"
                  : role === "patient"
                    ? "Search your screens…"
                    : "Search patients, staff, screens…"
              }
              aria-label="Search"
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
            />
          </div>

          {results.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">
              Nothing matches “{query}”.
            </p>
          ) : (
            <ul className="max-h-[50vh] list-none overflow-y-auto p-2">
              {results.map((hit, position) => {
                const Icon = hit.icon;
                return (
                  <li key={hit.id}>
                    <button
                      type="button"
                      onClick={() => go(hit)}
                      onPointerEnter={() => setActive(position)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors",
                        position === active ? "bg-surface-tint" : "hover:bg-surface",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {hit.label}
                        </span>
                        {hit.hint ? (
                          <span className="block truncate text-xs text-ink-muted">
                            {hit.hint}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        {hit.group}
                      </span>
                      {position === active ? (
                        <CornerDownLeft
                          className="h-3.5 w-3.5 shrink-0 text-ink-muted"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GlobalSearch;
