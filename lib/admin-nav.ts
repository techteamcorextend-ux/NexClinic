import {
  BarChart3,
  History,
  KeyRound,
  LayoutDashboard,
  Receipt,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  title: string;
  crumb: string;
};

/**
 * Super Admin modules.
 *
 * Deliberately excludes inventory, stock and equipment — those belong to the
 * Inventory Manager portal, and keeping them out of this list is what enforces
 * the boundary in the navigation.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, title: "Dashboard", crumb: "Oversight" },
  { label: "Staff", href: "/admin/staff", icon: Users, title: "Staff", crumb: "People" },
  { label: "Payroll", href: "/admin/payroll", icon: Wallet, title: "Payroll", crumb: "Finance" },
  { label: "Access Control", href: "/admin/access", icon: KeyRound, title: "Access Control", crumb: "Security" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, title: "Analytics", crumb: "Reporting" },
  { label: "History Logs", href: "/admin/logs", icon: History, title: "History Logs", crumb: "Records" },
  { label: "Expenses", href: "/admin/expenses", icon: Receipt, title: "Expenses", crumb: "Finance" },
  { label: "Settings", href: "/admin/settings", icon: Settings, title: "Settings", crumb: "Preferences" },
];

export function findNavItem(pathname: string): AdminNavItem | undefined {
  return (
    ADMIN_NAV.find((item) => item.href === pathname) ??
    ADMIN_NAV.find((item) => pathname.startsWith(`${item.href}/`))
  );
}
