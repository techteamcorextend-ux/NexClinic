import {
  Activity,
  BarChart3,
  Boxes,
  CalendarCheck,
  ClipboardList,
  FileText,
  HeartPulse,
  History,
  LayoutGrid,
  Mic,
  Package,
  QrCode,
  Receipt,
  Stethoscope,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };

/** Surgeon portal — the five-option sidebar from the spec. */
export const SURGEON_NAV: NavItem[] = [
  { label: "Dashboard", href: "/surgeon/dashboard", icon: LayoutGrid },
  { label: "Patients", href: "/surgeon/patients", icon: Users },
  { label: "Consultation", href: "/surgeon/consultation/p-1001", icon: Stethoscope },
  { label: "AI Scribe", href: "/surgeon/scribe", icon: Mic },
  { label: "Reports", href: "/surgeon/reports", icon: FileText },
];

export const RECEPTION_NAV: NavItem[] = [
  { label: "Dashboard", href: "/reception/dashboard", icon: LayoutGrid },
  { label: "Requests", href: "/reception/requests", icon: CalendarCheck },
  { label: "Billing", href: "/reception/billing", icon: Receipt },
  { label: "Onboarding", href: "/reception/onboarding", icon: QrCode },
];

export const PATIENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/patient/dashboard", icon: LayoutGrid },
  { label: "Medical timeline", href: "/patient/records", icon: History },
  { label: "Health overview", href: "/patient/health", icon: HeartPulse },
];

/**
 * Inventory manager — a portal of its own. Nothing here appears in the Super
 * Admin nav, and nothing from admin appears here: that is the boundary the
 * spec asks for.
 */
export const INVENTORY_NAV: NavItem[] = [
  { label: "Overview", href: "/inventory/dashboard", icon: LayoutGrid },
  { label: "Stock", href: "/inventory/stock", icon: Package },
  { label: "Suppliers", href: "/inventory/suppliers", icon: Truck },
  { label: "Orders", href: "/inventory/orders", icon: Boxes },
  { label: "Equipment", href: "/inventory/equipment", icon: Wrench },
  { label: "Logs", href: "/inventory/logs", icon: History },
];

/** Cross-portal switcher used in every portal header (test build only). */
export const PORTAL_JUMP = [
  { label: "Admin", href: "/admin/dashboard", match: "/admin" },
  { label: "Surgeon", href: "/surgeon/dashboard", match: "/surgeon" },
  { label: "Reception", href: "/reception/dashboard", match: "/reception" },
  { label: "Patient", href: "/patient/dashboard", match: "/patient" },
  { label: "Inventory", href: "/inventory/dashboard", match: "/inventory" },
];

export const SURGEON_EXTRA = { Activity, BarChart3, ClipboardList };
