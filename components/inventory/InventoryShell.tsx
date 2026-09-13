"use client";

import type { ReactNode } from "react";
import PortalShell from "@/components/portal/PortalShell";
import NoticeBell from "@/components/system/NoticeBell";
import { INVENTORY_NAV } from "@/lib/portal-nav";

/**
 * Shared chrome for the Inventory Manager portal.
 *
 * Its nav is INVENTORY_NAV only — no admin module appears here, and no
 * inventory module appears in the Super Admin nav. That separation lives in
 * the two nav configs rather than a runtime guard, so it cannot drift.
 */
export function InventoryShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PortalShell
      theme="vault"
      nav={INVENTORY_NAV}
      backdrop="soft"
      title={title}
      subtitle={subtitle}
      user={{
        id: "ST-6",
        name: "Divya Kamath",
        initials: "DK",
        role: "Inventory Manager",
        email: "divya.k@nexclinic.health",
      }}
      actions={
        <span className="flex items-center gap-2">
          {actions}
          <NoticeBell audience="inventory" />
        </span>
      }
    >
      {children}
    </PortalShell>
  );
}

export default InventoryShell;
