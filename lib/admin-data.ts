/**
 * ─────────────────────────────────────────────────────────────────────
 *  SAMPLE DATA for the Nexclinic Super Admin panel.
 *
 *  Every array in this file is MOCK DATA used to demonstrate the UI.
 *  None of it is fetched, persisted or real. Replace each export with a
 *  server query (or an API route) before this panel goes anywhere near a
 *  production facility. Names, phone numbers and amounts are invented.
 * ─────────────────────────────────────────────────────────────────────
 */

/* ══════════════════ Signed-in administrator (sample) ══════════════════ */

export const ADMIN_PROFILE = {
  name: "Ananya Desai",
  firstName: "Ananya",
  role: "Super Admin",
  email: "ananya.desai@nexclinic.health",
  phone: "+91 98450 22187",
  initials: "AD",
  defaultClinic: "Sunrise Multi-Specialty — Koramangala",
};

/* ══════════════════════ Deterministic series helper ═══════════════════ */

/**
 * A tiny seeded LCG. Series generated with it are identical on the server
 * and in the browser, so charts never cause a hydration mismatch.
 */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function buildDailySeries(
  seed: number,
  days: number,
  base: number,
  spread: number,
  drift = 0,
) {
  const rand = seeded(seed);
  return Array.from({ length: days }, (_, index) => {
    const value = Math.round(
      base + drift * index + (rand() - 0.45) * spread,
    );
    return { day: `Day ${index + 1}`, value: Math.max(0, value) };
  });
}

/* ═══════════════════════════ DASHBOARD ════════════════════════════════ */

/** SAMPLE — 30-day revenue trend (₹ thousands) for the facility overview. */
export const REVENUE_30_DAYS = buildDailySeries(20260904, 30, 268, 96, 2.4).map(
  (point, index) => ({
    day: `${index + 1}`,
    revenue: point.value,
  }),
);

export const FACILITY_OVERVIEW = {
  label: "Total revenue this month",
  value: "₹92,48,500",
  change: 12.4,
  changeDirection: "up" as const,
  comparison: "vs. ₹82,29,000 last month",
};

/** SAMPLE — where this month's patients came from. */
export const PATIENT_SOURCE = [
  { name: "Online Booking", value: 52, color: "#F857A6" },
  { name: "Walk-in", value: 31, color: "#8B5CF6" },
  { name: "Referral", value: 17, color: "#3B82F6" },
];

export type StatCardDatum = {
  id: string;
  label: string;
  value: string;
  helper: string;
  gradient: "pink" | "purple" | "blue" | "orange";
  chart: "area" | "bar";
  series: { x: string; y: number }[];
};

/** SAMPLE — the four gradient KPI cards on the dashboard. */
export const DASHBOARD_STATS: StatCardDatum[] = [
  {
    id: "revenue",
    label: "Total Revenue",
    value: "₹92.5L",
    helper: "+12.4% vs last month",
    gradient: "pink",
    chart: "area",
    series: [38, 44, 41, 52, 49, 61, 58, 67].map((y, i) => ({
      x: `W${i + 1}`,
      y,
    })),
  },
  {
    id: "staff",
    label: "Active Staff",
    value: "248",
    helper: "12 joined this month",
    gradient: "purple",
    chart: "bar",
    series: [212, 218, 224, 229, 236, 240, 244, 248].map((y, i) => ({
      x: `W${i + 1}`,
      y,
    })),
  },
  {
    id: "wait",
    label: "Avg. Wait Time",
    value: "11 min",
    helper: "−3 min vs last month",
    gradient: "blue",
    chart: "area",
    series: [19, 18, 17, 16, 15, 14, 12, 11].map((y, i) => ({
      x: `W${i + 1}`,
      y,
    })),
  },
  {
    id: "stock",
    label: "Low-Stock Alerts",
    value: "17",
    helper: "6 need reorder today",
    gradient: "orange",
    chart: "bar",
    series: [8, 11, 9, 14, 12, 15, 16, 17].map((y, i) => ({
      x: `W${i + 1}`,
      y,
    })),
  },
];

export type ActivityKind =
  | "staff"
  | "purchase"
  | "payroll"
  | "emergency"
  | "audit";

/** SAMPLE — recent activity feed (audit-log style). */
export const RECENT_ACTIVITY: {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  time: string;
}[] = [
  {
    id: "act-1",
    kind: "staff",
    title: "New Doctor Added",
    detail: "Dr. Priya Nair · Cardiology · Koramangala",
    time: "40 min ago",
  },
  {
    id: "act-2",
    kind: "purchase",
    title: "Purchase Order Approved",
    detail: "PO-2043 · MedSupply India · ₹1,84,200",
    time: "5 hours ago",
  },
  {
    id: "act-3",
    kind: "audit",
    title: "Role Permissions Updated",
    detail: "Receptionist role · billing scope widened",
    time: "9 hours ago",
  },
  {
    id: "act-4",
    kind: "purchase",
    title: "Stock Received",
    detail: "PO-2039 · 14 line items · Whitefield store",
    time: "1 day ago",
  },
  {
    id: "act-5",
    kind: "payroll",
    title: "Payslips Generated",
    detail: "March cycle · 248 staff",
    time: "2 days ago",
  },
  {
    id: "act-6",
    kind: "emergency",
    title: "SOS Alert Resolved",
    detail: "Ward 3 · response time 3 min 12 s",
    time: "3 days ago",
  },
];

/* ═══════════════════════════ USERS & STAFF ════════════════════════════ */

export type UserStatus = "Active" | "Inactive";
export type UserTab = "patients" | "doctors" | "staff" | "admins";

export type AdminUser = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  clinic: string;
  status: UserStatus;
  joined: string;
  tab: UserTab;
};

/** SAMPLE — directory of people across the network. */
export const USERS: AdminUser[] = [
  { id: "u-101", name: "Rohit Malhotra", initials: "RM", email: "rohit.m@example.com", role: "Patient", clinic: "Koramangala", status: "Active", joined: "12 Jan 2026", tab: "patients" },
  { id: "u-102", name: "Sneha Iyer", initials: "SI", email: "sneha.iyer@example.com", role: "Patient", clinic: "Whitefield", status: "Active", joined: "03 Feb 2026", tab: "patients" },
  { id: "u-103", name: "Imran Qureshi", initials: "IQ", email: "imran.q@example.com", role: "Patient", clinic: "Indiranagar", status: "Inactive", joined: "28 Nov 2025", tab: "patients" },
  { id: "u-104", name: "Lakshmi Menon", initials: "LM", email: "lakshmi.menon@example.com", role: "Patient", clinic: "Koramangala", status: "Active", joined: "19 Mar 2026", tab: "patients" },
  { id: "u-105", name: "Aditya Rao", initials: "AR", email: "aditya.rao@example.com", role: "Patient", clinic: "HSR Layout", status: "Active", joined: "07 Apr 2026", tab: "patients" },

  { id: "u-201", name: "Dr. Priya Nair", initials: "PN", email: "priya.nair@nexclinic.health", role: "Cardiologist", clinic: "Koramangala", status: "Active", joined: "02 Sep 2026", tab: "doctors" },
  { id: "u-202", name: "Dr. Sameer Kulkarni", initials: "SK", email: "sameer.k@nexclinic.health", role: "Orthopaedics", clinic: "Whitefield", status: "Active", joined: "14 Jun 2024", tab: "doctors" },
  { id: "u-203", name: "Dr. Fatima Sheikh", initials: "FS", email: "fatima.s@nexclinic.health", role: "Psychiatry", clinic: "Indiranagar", status: "Active", joined: "21 Feb 2025", tab: "doctors" },
  { id: "u-204", name: "Dr. Vivek Bhatt", initials: "VB", email: "vivek.bhatt@nexclinic.health", role: "General Medicine", clinic: "HSR Layout", status: "Inactive", joined: "09 Oct 2023", tab: "doctors" },
  { id: "u-205", name: "Dr. Neha Saxena", initials: "NS", email: "neha.saxena@nexclinic.health", role: "Paediatrics", clinic: "Koramangala", status: "Active", joined: "30 Jul 2025", tab: "doctors" },

  { id: "u-301", name: "Kavya Reddy", initials: "KR", email: "kavya.reddy@nexclinic.health", role: "Receptionist", clinic: "Koramangala", status: "Active", joined: "11 May 2025", tab: "staff" },
  { id: "u-302", name: "Joseph Thomas", initials: "JT", email: "joseph.t@nexclinic.health", role: "Pharmacist", clinic: "Whitefield", status: "Active", joined: "26 Aug 2024", tab: "staff" },
  { id: "u-303", name: "Meera Pillai", initials: "MP", email: "meera.pillai@nexclinic.health", role: "Head Nurse", clinic: "Indiranagar", status: "Active", joined: "17 Jan 2023", tab: "staff" },
  { id: "u-304", name: "Arjun Sethi", initials: "AS", email: "arjun.sethi@nexclinic.health", role: "Lab Technician", clinic: "HSR Layout", status: "Active", joined: "05 Dec 2025", tab: "staff" },
  { id: "u-305", name: "Divya Kamath", initials: "DK", email: "divya.kamath@nexclinic.health", role: "Inventory Clerk", clinic: "Whitefield", status: "Inactive", joined: "22 Mar 2024", tab: "staff" },

  { id: "u-401", name: "Ananya Desai", initials: "AD", email: "ananya.desai@nexclinic.health", role: "Super Admin", clinic: "All clinics", status: "Active", joined: "01 Mar 2023", tab: "admins" },
  { id: "u-402", name: "Rahul Verma", initials: "RV", email: "rahul.verma@nexclinic.health", role: "Finance Admin", clinic: "All clinics", status: "Active", joined: "18 Sep 2023", tab: "admins" },
  { id: "u-403", name: "Tanvi Shah", initials: "TS", email: "tanvi.shah@nexclinic.health", role: "Compliance Admin", clinic: "All clinics", status: "Active", joined: "04 Apr 2025", tab: "admins" },
];

export const USER_TABS: { id: UserTab; label: string }[] = [
  { id: "patients", label: "Patients" },
  { id: "doctors", label: "Doctors" },
  { id: "staff", label: "Staff" },
  { id: "admins", label: "Super Admins" },
];

export const ROLE_OPTIONS = [
  "Patient",
  "Doctor",
  "Receptionist",
  "Pharmacist",
  "Nurse",
  "Lab Technician",
  "Inventory Clerk",
  "Finance Admin",
  "Super Admin",
];

/* ═══════════════════════════════ CLINICS ══════════════════════════════ */

export type Clinic = {
  id: string;
  name: string;
  /** Short label used in user/payroll records for this facility. */
  shortName: string;
  address: string;
  staffCount: number;
  activePatients: number;
  status: "Active" | "Under Maintenance";
  beds: number;
  opdPerDay: number;
  monthlyRevenue: string;
  lead: string;
};

/** SAMPLE — the clinic network. */
export const CLINICS: Clinic[] = [
  {
    id: "koramangala",
    name: "Sunrise Multi-Specialty",
    shortName: "Koramangala",
    address: "80 Feet Road, Koramangala 4th Block, Bengaluru 560034",
    staffCount: 86,
    activePatients: 4120,
    status: "Active",
    beds: 140,
    opdPerDay: 310,
    monthlyRevenue: "₹38.2L",
    lead: "Dr. Priya Nair",
  },
  {
    id: "whitefield",
    name: "Sunrise Whitefield",
    shortName: "Whitefield",
    address: "ITPL Main Road, Whitefield, Bengaluru 560066",
    staffCount: 64,
    activePatients: 2980,
    status: "Active",
    beds: 95,
    opdPerDay: 240,
    monthlyRevenue: "₹24.7L",
    lead: "Dr. Sameer Kulkarni",
  },
  {
    id: "indiranagar",
    name: "Sunrise Mind & Wellness",
    shortName: "Indiranagar",
    address: "100 Feet Road, Indiranagar, Bengaluru 560038",
    staffCount: 51,
    activePatients: 2265,
    status: "Active",
    beds: 60,
    opdPerDay: 185,
    monthlyRevenue: "₹18.4L",
    lead: "Dr. Fatima Sheikh",
  },
  {
    id: "hsr",
    name: "Sunrise HSR Day-Care",
    shortName: "HSR Layout",
    address: "27th Main, HSR Layout Sector 2, Bengaluru 560102",
    staffCount: 47,
    activePatients: 1704,
    status: "Under Maintenance",
    beds: 40,
    opdPerDay: 120,
    monthlyRevenue: "₹11.2L",
    lead: "Dr. Vivek Bhatt",
  },
];

/** Full facility names — used in create/assign forms. */
export const CLINIC_OPTIONS = [
  "All clinics",
  ...CLINICS.map((clinic) => clinic.name),
];

/** Short facility labels — these are what user, payroll and equipment records
 *  store, so table filters must compare against these. */
export const CLINIC_FILTER_OPTIONS = [
  "All clinics",
  ...CLINICS.map((clinic) => clinic.shortName),
];

/* ══════════════════════════════ ANALYTICS ═════════════════════════════ */

/** SAMPLE — revenue trend by month (₹ lakh). */
export const REVENUE_TREND = [
  { month: "Apr", revenue: 64, target: 60 },
  { month: "May", revenue: 68, target: 63 },
  { month: "Jun", revenue: 61, target: 66 },
  { month: "Jul", revenue: 74, target: 69 },
  { month: "Aug", revenue: 79, target: 72 },
  { month: "Sep", revenue: 76, target: 75 },
  { month: "Oct", revenue: 84, target: 78 },
  { month: "Nov", revenue: 88, target: 81 },
  { month: "Dec", revenue: 81, target: 84 },
  { month: "Jan", revenue: 90, target: 86 },
  { month: "Feb", revenue: 87, target: 88 },
  { month: "Mar", revenue: 92, target: 90 },
];

/** SAMPLE — patient footfall per weekday, split by visit type. */
export const FOOTFALL = [
  { day: "Mon", opd: 318, walkIn: 96 },
  { day: "Tue", opd: 342, walkIn: 104 },
  { day: "Wed", opd: 301, walkIn: 88 },
  { day: "Thu", opd: 365, walkIn: 121 },
  { day: "Fri", opd: 388, walkIn: 133 },
  { day: "Sat", opd: 412, walkIn: 158 },
  { day: "Sun", opd: 196, walkIn: 62 },
];

/** SAMPLE — expense split for the selected range. */
export const EXPENSE_BREAKDOWN = [
  { name: "Staff", value: 46, color: "#F857A6" },
  { name: "Inventory", value: 24, color: "#8B5CF6" },
  { name: "Equipment", value: 18, color: "#3B82F6" },
  { name: "Utilities", value: 12, color: "#FFA45C" },
];

export const DATE_RANGES = [
  "Last 7 days",
  "Last 30 days",
  "This quarter",
  "Last 12 months",
  "Year to date",
];

/* ═══════════════════════════════ PAYROLL ══════════════════════════════ */

export type PayrollRow = {
  id: string;
  name: string;
  initials: string;
  role: string;
  clinic: string;
  basePay: number;
  deductions: number;
  status: "Paid" | "Pending";
};

/** SAMPLE — current payroll cycle (amounts in ₹). */
export const PAYROLL_ROWS: PayrollRow[] = [
  { id: "p-1", name: "Dr. Priya Nair", initials: "PN", role: "Cardiologist", clinic: "Koramangala", basePay: 285000, deductions: 42750, status: "Paid" },
  { id: "p-2", name: "Dr. Sameer Kulkarni", initials: "SK", role: "Orthopaedics", clinic: "Whitefield", basePay: 262000, deductions: 39300, status: "Paid" },
  { id: "p-3", name: "Dr. Fatima Sheikh", initials: "FS", role: "Psychiatry", clinic: "Indiranagar", basePay: 248000, deductions: 37200, status: "Pending" },
  { id: "p-4", name: "Dr. Neha Saxena", initials: "NS", role: "Paediatrics", clinic: "Koramangala", basePay: 231000, deductions: 34650, status: "Paid" },
  { id: "p-5", name: "Meera Pillai", initials: "MP", role: "Head Nurse", clinic: "Indiranagar", basePay: 78000, deductions: 9360, status: "Paid" },
  { id: "p-6", name: "Joseph Thomas", initials: "JT", role: "Pharmacist", clinic: "Whitefield", basePay: 64000, deductions: 7680, status: "Pending" },
  { id: "p-7", name: "Kavya Reddy", initials: "KR", role: "Receptionist", clinic: "Koramangala", basePay: 42000, deductions: 4620, status: "Paid" },
  { id: "p-8", name: "Arjun Sethi", initials: "AS", role: "Lab Technician", clinic: "HSR Layout", basePay: 51000, deductions: 6120, status: "Pending" },
];

export const PAYROLL_SUMMARY = {
  cycle: "March 2026",
  totalPayroll: "₹1.42 Cr",
  staffCount: 248,
  pendingApprovals: 3,
};

/** SAMPLE — closed payroll cycles. */
export const PAYROLL_HISTORY = [
  { cycle: "February 2026", processed: "28 Feb 2026", staff: 244, total: "₹1.38 Cr", status: "Closed" },
  { cycle: "January 2026", processed: "31 Jan 2026", staff: 241, total: "₹1.36 Cr", status: "Closed" },
  { cycle: "December 2025", processed: "31 Dec 2025", staff: 238, total: "₹1.41 Cr", status: "Closed" },
  { cycle: "November 2025", processed: "30 Nov 2025", staff: 236, total: "₹1.33 Cr", status: "Closed" },
];

/* ═════════════════════════════ AUDIT LOGS ═════════════════════════════ */

export type AuditAction = "create" | "update" | "delete" | "login";

export type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  initials: string;
  action: string;
  actionType: AuditAction;
  module: string;
  device: string;
  ip: string;
};

/** SAMPLE — immutable action trail. */
export const AUDIT_LOGS: AuditLog[] = [
  { id: "a-1", timestamp: "04 Sep 2026, 09:41", user: "Ananya Desai", initials: "AD", action: "Created staff record", actionType: "create", module: "Users & Staff", device: "Chrome · macOS", ip: "10.24.6.18" },
  { id: "a-2", timestamp: "04 Sep 2026, 09:12", user: "Rahul Verma", initials: "RV", action: "Approved purchase order PO-2043", actionType: "update", module: "Inventory", device: "Chrome · Windows", ip: "10.24.6.44" },
  { id: "a-3", timestamp: "04 Sep 2026, 08:55", user: "Kavya Reddy", initials: "KR", action: "Signed in", actionType: "login", module: "Authentication", device: "Edge · Windows", ip: "10.24.7.02" },
  { id: "a-4", timestamp: "03 Sep 2026, 19:34", user: "Tanvi Shah", initials: "TS", action: "Deleted duplicate patient record", actionType: "delete", module: "Users & Staff", device: "Safari · iPadOS", ip: "10.24.6.91" },
  { id: "a-5", timestamp: "03 Sep 2026, 18:02", user: "Joseph Thomas", initials: "JT", action: "Updated pharmacy stock levels", actionType: "update", module: "Inventory", device: "Chrome · Android", ip: "10.24.8.13" },
  { id: "a-6", timestamp: "03 Sep 2026, 16:47", user: "Ananya Desai", initials: "AD", action: "Changed receptionist role permissions", actionType: "update", module: "Settings", device: "Chrome · macOS", ip: "10.24.6.18" },
  { id: "a-7", timestamp: "03 Sep 2026, 14:20", user: "Meera Pillai", initials: "MP", action: "Created incident report INC-118", actionType: "create", module: "Emergency", device: "Chrome · Windows", ip: "10.24.9.05" },
  { id: "a-8", timestamp: "03 Sep 2026, 11:08", user: "Rahul Verma", initials: "RV", action: "Signed in", actionType: "login", module: "Authentication", device: "Chrome · Windows", ip: "10.24.6.44" },
  { id: "a-9", timestamp: "02 Sep 2026, 20:15", user: "Arjun Sethi", initials: "AS", action: "Deleted expired reagent batch", actionType: "delete", module: "Inventory", device: "Firefox · Linux", ip: "10.24.8.77" },
  { id: "a-10", timestamp: "02 Sep 2026, 17:39", user: "Ananya Desai", initials: "AD", action: "Generated March payslips", actionType: "create", module: "Payroll", device: "Chrome · macOS", ip: "10.24.6.18" },
];

export const AUDIT_MODULES = [
  "All modules",
  "Users & Staff",
  "Inventory",
  "Payroll",
  "Settings",
  "Emergency",
  "Authentication",
];

/* ═════════════════════════════ EQUIPMENT ══════════════════════════════ */

export type EquipmentStatus = "Operational" | "Due Soon" | "Overdue";

export type EquipmentRow = {
  id: string;
  name: string;
  clinic: string;
  purchased: string;
  lastMaintenance: string;
  nextDue: string;
  status: EquipmentStatus;
};

/** SAMPLE — capital equipment register. */
export const EQUIPMENT: EquipmentRow[] = [
  { id: "e-1", name: "Siemens MRI 1.5T", clinic: "Koramangala", purchased: "14 Mar 2022", lastMaintenance: "02 Aug 2026", nextDue: "02 Feb 2027", status: "Operational" },
  { id: "e-2", name: "GE CT Scanner 64-slice", clinic: "Koramangala", purchased: "22 Jul 2021", lastMaintenance: "18 Mar 2026", nextDue: "18 Sep 2026", status: "Due Soon" },
  { id: "e-3", name: "OT Anaesthesia Workstation", clinic: "Whitefield", purchased: "09 Jan 2023", lastMaintenance: "11 Feb 2026", nextDue: "11 Aug 2026", status: "Overdue" },
  { id: "e-4", name: "Philips Ultrasound EPIQ", clinic: "Indiranagar", purchased: "30 Nov 2023", lastMaintenance: "25 Jul 2026", nextDue: "25 Jan 2027", status: "Operational" },
  { id: "e-5", name: "Dialysis Unit — Bay 2", clinic: "Whitefield", purchased: "06 Jun 2024", lastMaintenance: "14 Jun 2026", nextDue: "14 Sep 2026", status: "Due Soon" },
  { id: "e-6", name: "Autoclave Steriliser 120L", clinic: "HSR Layout", purchased: "17 Feb 2022", lastMaintenance: "03 Jan 2026", nextDue: "03 Jul 2026", status: "Overdue" },
  { id: "e-7", name: "Ventilator — ICU Bed 4", clinic: "Koramangala", purchased: "28 Sep 2024", lastMaintenance: "20 Aug 2026", nextDue: "20 Feb 2027", status: "Operational" },
  { id: "e-8", name: "Digital X-Ray DR-500", clinic: "HSR Layout", purchased: "12 Apr 2023", lastMaintenance: "29 Apr 2026", nextDue: "29 Oct 2026", status: "Operational" },
];

/* ═════════════════════════════ INVENTORY ══════════════════════════════ */

export type StockStatus = "In Stock" | "Low Stock" | "Expiring Soon";
export type InventoryTab = "medicines" | "equipment" | "ot";

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  expiry?: string;
  status: StockStatus;
  tab: InventoryTab;
};

/** SAMPLE — stock across medicines, equipment consumables and OT supplies. */
export const INVENTORY: InventoryItem[] = [
  { id: "i-1", name: "Amoxicillin 500 mg", category: "Antibiotic", quantity: 1840, unit: "caps", reorderLevel: 600, expiry: "18 Jun 2027", status: "In Stock", tab: "medicines" },
  { id: "i-2", name: "Metformin 850 mg", category: "Antidiabetic", quantity: 420, unit: "tabs", reorderLevel: 500, expiry: "02 Mar 2027", status: "Low Stock", tab: "medicines" },
  { id: "i-3", name: "Salbutamol Inhaler", category: "Respiratory", quantity: 96, unit: "units", reorderLevel: 80, expiry: "27 Oct 2026", status: "Expiring Soon", tab: "medicines" },
  { id: "i-4", name: "Paracetamol 650 mg", category: "Analgesic", quantity: 3260, unit: "tabs", reorderLevel: 1000, expiry: "09 Dec 2027", status: "In Stock", tab: "medicines" },
  { id: "i-5", name: "Insulin Glargine", category: "Antidiabetic", quantity: 58, unit: "pens", reorderLevel: 90, expiry: "15 Nov 2026", status: "Low Stock", tab: "medicines" },
  { id: "i-6", name: "Ondansetron 4 mg", category: "Antiemetic", quantity: 740, unit: "amps", reorderLevel: 300, expiry: "21 Sep 2026", status: "Expiring Soon", tab: "medicines" },

  { id: "i-11", name: "ECG Electrodes", category: "Diagnostics", quantity: 2400, unit: "pcs", reorderLevel: 800, status: "In Stock", tab: "equipment" },
  { id: "i-12", name: "Pulse Oximeter Probes", category: "Monitoring", quantity: 62, unit: "pcs", reorderLevel: 100, status: "Low Stock", tab: "equipment" },
  { id: "i-13", name: "Ventilator Circuits", category: "Critical Care", quantity: 310, unit: "sets", reorderLevel: 120, status: "In Stock", tab: "equipment" },
  { id: "i-14", name: "Infusion Pump Tubing", category: "Critical Care", quantity: 88, unit: "sets", reorderLevel: 150, status: "Low Stock", tab: "equipment" },

  { id: "i-21", name: "Sterile Surgical Gloves 7.5", category: "OT Consumable", quantity: 1960, unit: "pairs", reorderLevel: 700, status: "In Stock", tab: "ot" },
  { id: "i-22", name: "Absorbable Sutures 3-0", category: "OT Consumable", quantity: 240, unit: "packs", reorderLevel: 300, status: "Low Stock", tab: "ot" },
  { id: "i-23", name: "Disposable OT Drapes", category: "OT Consumable", quantity: 1120, unit: "pcs", reorderLevel: 400, status: "In Stock", tab: "ot" },
  { id: "i-24", name: "Povidone-Iodine 500 ml", category: "Antiseptic", quantity: 176, unit: "bottles", reorderLevel: 120, expiry: "30 Oct 2026", status: "Expiring Soon", tab: "ot" },
];

export const INVENTORY_TABS: { id: InventoryTab; label: string }[] = [
  { id: "medicines", label: "Medicines" },
  { id: "equipment", label: "Equipment" },
  { id: "ot", label: "OT Supplies" },
];

export type POStatus = "Pending" | "Approved" | "Received";

export type PurchaseOrder = {
  id: string;
  vendor: string;
  items: number;
  amount: string;
  raised: string;
  status: POStatus;
};

/** SAMPLE — purchase orders awaiting or past admin approval. */
export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: "PO-2048", vendor: "MedSupply India", items: 12, amount: "₹2,14,600", raised: "04 Sep 2026", status: "Pending" },
  { id: "PO-2047", vendor: "Kritika Surgicals", items: 6, amount: "₹86,400", raised: "03 Sep 2026", status: "Pending" },
  { id: "PO-2045", vendor: "Nova Diagnostics", items: 9, amount: "₹1,32,900", raised: "01 Sep 2026", status: "Approved" },
  { id: "PO-2043", vendor: "MedSupply India", items: 14, amount: "₹1,84,200", raised: "28 Aug 2026", status: "Approved" },
  { id: "PO-2041", vendor: "Aster Pharma Distributors", items: 21, amount: "₹3,07,750", raised: "24 Aug 2026", status: "Received" },
  { id: "PO-2039", vendor: "Kritika Surgicals", items: 14, amount: "₹97,300", raised: "19 Aug 2026", status: "Received" },
  { id: "PO-2036", vendor: "BioLab Reagents", items: 8, amount: "₹64,850", raised: "12 Aug 2026", status: "Received" },
];

export const VENDORS = [
  "MedSupply India",
  "Kritika Surgicals",
  "Nova Diagnostics",
  "Aster Pharma Distributors",
  "BioLab Reagents",
];

/* ════════════════════════ CORPORATE WELLNESS ══════════════════════════ */

export type WellnessProgram = {
  id: string;
  name: string;
  client: string;
  enrolled: number;
  duration: string;
  status: "Running" | "Enrolling" | "Completed";
  accent: "pink" | "purple" | "blue" | "orange";
};

/** SAMPLE — corporate wellness engagements. */
export const WELLNESS_PROGRAMS: WellnessProgram[] = [
  { id: "w-1", name: "Mind at Work", client: "Corextend Technologies", enrolled: 412, duration: "12 weeks · ends 28 Nov 2026", status: "Running", accent: "pink" },
  { id: "w-2", name: "Desk Ergonomics & Movement", client: "Meridian Financial", enrolled: 268, duration: "8 weeks · ends 17 Oct 2026", status: "Running", accent: "purple" },
  { id: "w-3", name: "Sleep Reset Cohort", client: "Northwind Logistics", enrolled: 96, duration: "6 weeks · starts 21 Sep 2026", status: "Enrolling", accent: "blue" },
  { id: "w-4", name: "Burnout Early-Warning Pilot", client: "Corextend Technologies", enrolled: 150, duration: "10 weeks · closed 08 Aug 2026", status: "Completed", accent: "orange" },
];

/** SAMPLE — average self-reported workforce stress score (1 = calm, 10 = severe). */
export const STRESS_TREND = [
  { month: "Mar", score: 6.8, participation: 62 },
  { month: "Apr", score: 6.6, participation: 68 },
  { month: "May", score: 6.9, participation: 71 },
  { month: "Jun", score: 6.2, participation: 74 },
  { month: "Jul", score: 5.8, participation: 79 },
  { month: "Aug", score: 5.4, participation: 83 },
  { month: "Sep", score: 5.1, participation: 86 },
];

/* ═══════════════════════ EMERGENCY & INCIDENTS ════════════════════════ */

export type SosAlert = {
  id: string;
  location: string;
  triggeredBy: string;
  time: string;
  severity: "Critical" | "High";
  note: string;
};

/** SAMPLE — live SOS alerts. Set to [] to preview the empty state. */
export const ACTIVE_ALERTS: SosAlert[] = [
  {
    id: "sos-441",
    location: "Ward 3, Bed 12 · Koramangala",
    triggeredBy: "Meera Pillai (Head Nurse)",
    time: "2 minutes ago",
    severity: "Critical",
    note: "Patient unresponsive — crash cart requested.",
  },
  {
    id: "sos-440",
    location: "Reception, Ground Floor · Whitefield",
    triggeredBy: "Kavya Reddy (Receptionist)",
    time: "11 minutes ago",
    severity: "High",
    note: "Walk-in collapse near the triage desk.",
  },
];

/** SAMPLE — emergency contact directory. */
export const HOTLINES = [
  { id: "h-1", name: "Ambulance Dispatch", number: "+91 80 4718 2100", detail: "24×7 · network-wide" },
  { id: "h-2", name: "Code Blue Team", number: "Ext. 3001", detail: "Koramangala ICU" },
  { id: "h-3", name: "Fire & Evacuation", number: "+91 80 4718 2104", detail: "All facilities" },
  { id: "h-4", name: "Blood Bank", number: "+91 80 4718 2119", detail: "Koramangala · Whitefield" },
  { id: "h-5", name: "Facility Security", number: "Ext. 3040", detail: "24×7 control room" },
  { id: "h-6", name: "Poison Control", number: "1800 425 1213", detail: "National helpline" },
];

export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";
export type IncidentStatus = "Open" | "Investigating" | "Resolved";

export type Incident = {
  id: string;
  title: string;
  location: string;
  reportedBy: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  raised: string;
};

/** SAMPLE — incident register. */
export const INCIDENTS: Incident[] = [
  { id: "INC-118", title: "Oxygen line pressure drop", location: "ICU · Koramangala", reportedBy: "Meera Pillai", severity: "Critical", status: "Investigating", raised: "03 Sep 2026" },
  { id: "INC-117", title: "Slip on wet corridor floor", location: "Level 2 · Whitefield", reportedBy: "Joseph Thomas", severity: "Medium", status: "Open", raised: "02 Sep 2026" },
  { id: "INC-115", title: "Sharps bin overflow", location: "OT 1 · Indiranagar", reportedBy: "Arjun Sethi", severity: "Low", status: "Resolved", raised: "29 Aug 2026" },
  { id: "INC-113", title: "Fire alarm false trigger", location: "Pharmacy · HSR Layout", reportedBy: "Divya Kamath", severity: "Low", status: "Resolved", raised: "26 Aug 2026" },
  { id: "INC-112", title: "Unauthorised ward access attempt", location: "Ward 5 · Koramangala", reportedBy: "Security Control", severity: "High", status: "Investigating", raised: "24 Aug 2026" },
];

/* ══════════════════════════════ SETTINGS ══════════════════════════════ */

/** SAMPLE — notification preference toggles. */
export const NOTIFICATION_PREFS = [
  { id: "sos", label: "SOS and emergency alerts", detail: "Always delivered by push and SMS.", defaultOn: true, locked: true },
  { id: "po", label: "Purchase orders awaiting approval", detail: "Daily digest at 09:00.", defaultOn: true, locked: false },
  { id: "stock", label: "Low-stock and expiry warnings", detail: "Triggered as thresholds are crossed.", defaultOn: true, locked: false },
  { id: "payroll", label: "Payroll cycle reminders", detail: "Three days before each cycle closes.", defaultOn: false, locked: false },
  { id: "audit", label: "Weekly audit-log summary", detail: "Every Monday, covering all clinics.", defaultOn: false, locked: false },
];
