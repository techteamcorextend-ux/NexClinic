import RequireRole from "@/components/system/RequireRole";

/** Inventory — only the roles listed here get past the guard. */
export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole allow={["inventory"]}>{children}</RequireRole>;
}
