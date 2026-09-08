/**
 * SAMPLE METRICS for the Super Admin portal. All figures are invented for a
 * front-end test build — replace with warehouse queries before launch.
 */

/** Monthly revenue, ₹ lakh. */
export const MONTHLY_REVENUE = [
  { month: "Apr", revenue: 64, lastYear: 52 },
  { month: "May", revenue: 68, lastYear: 57 },
  { month: "Jun", revenue: 61, lastYear: 55 },
  { month: "Jul", revenue: 74, lastYear: 60 },
  { month: "Aug", revenue: 79, lastYear: 66 },
  { month: "Sep", revenue: 76, lastYear: 68 },
  { month: "Oct", revenue: 84, lastYear: 71 },
  { month: "Nov", revenue: 88, lastYear: 74 },
  { month: "Dec", revenue: 81, lastYear: 76 },
  { month: "Jan", revenue: 90, lastYear: 78 },
  { month: "Feb", revenue: 87, lastYear: 80 },
  { month: "Mar", revenue: 92, lastYear: 83 },
];

/** Patient visits / footfall per month. */
export const PATIENT_VISITS = [
  { month: "Apr", visits: 2180, newPatients: 410 },
  { month: "May", visits: 2340, newPatients: 452 },
  { month: "Jun", visits: 2115, newPatients: 388 },
  { month: "Jul", visits: 2560, newPatients: 501 },
  { month: "Aug", visits: 2710, newPatients: 534 },
  { month: "Sep", visits: 2648, newPatients: 512 },
  { month: "Oct", visits: 2890, newPatients: 570 },
  { month: "Nov", visits: 3020, newPatients: 604 },
  { month: "Dec", visits: 2840, newPatients: 549 },
  { month: "Jan", visits: 3110, newPatients: 622 },
  { month: "Feb", visits: 3005, newPatients: 596 },
  { month: "Mar", visits: 3240, newPatients: 651 },
];

export type RangeKey = "daily" | "monthly" | "yearly";

export const RANGE_LABEL: Record<RangeKey, string> = {
  daily: "Daily",
  monthly: "Monthly",
  yearly: "Yearly",
};

/** Revenue by source, per range. */
export const REVENUE_BY_SOURCE: Record<
  RangeKey,
  { name: string; value: number; color: string }[]
> = {
  daily: [
    { name: "Consultations", value: 38, color: "#2563EB" },
    { name: "Pharmacy", value: 27, color: "#5B6EF5" },
    { name: "Diagnostics", value: 21, color: "#0EA5E9" },
    { name: "Procedures", value: 14, color: "#FFA45C" },
  ],
  monthly: [
    { name: "Consultations", value: 34, color: "#2563EB" },
    { name: "Pharmacy", value: 25, color: "#5B6EF5" },
    { name: "Diagnostics", value: 24, color: "#0EA5E9" },
    { name: "Procedures", value: 17, color: "#FFA45C" },
  ],
  yearly: [
    { name: "Consultations", value: 31, color: "#2563EB" },
    { name: "Pharmacy", value: 23, color: "#5B6EF5" },
    { name: "Diagnostics", value: 26, color: "#0EA5E9" },
    { name: "Procedures", value: 20, color: "#FFA45C" },
  ],
};

export const REVENUE_SERIES: Record<
  RangeKey,
  { label: string; value: number }[]
> = {
  daily: [
    { label: "Mon", value: 2.8 },
    { label: "Tue", value: 3.1 },
    { label: "Wed", value: 2.6 },
    { label: "Thu", value: 3.4 },
    { label: "Fri", value: 3.8 },
    { label: "Sat", value: 4.2 },
    { label: "Sun", value: 1.9 },
  ],
  monthly: MONTHLY_REVENUE.map((row) => ({ label: row.month, value: row.revenue })),
  yearly: [
    { label: "2022", value: 512 },
    { label: "2023", value: 604 },
    { label: "2024", value: 728 },
    { label: "2025", value: 845 },
    { label: "2026", value: 944 },
  ],
};

/** Revenue history log. */
export const REVENUE_HISTORY = [
  { id: "RV-9012", at: "08 Sep 2026, 18:40", source: "Pharmacy", detail: "Day-close pharmacy takings", amount: 184250, mode: "Mixed" },
  { id: "RV-9011", at: "08 Sep 2026, 18:35", source: "Consultations", detail: "62 OPD consultations", amount: 496000, mode: "Mixed" },
  { id: "RV-9010", at: "07 Sep 2026, 18:42", source: "Diagnostics", detail: "Lab and imaging settlements", amount: 271400, mode: "Card / UPI" },
  { id: "RV-9009", at: "07 Sep 2026, 18:38", source: "Procedures", detail: "3 day-care procedures", amount: 348000, mode: "Insurance" },
  { id: "RV-9008", at: "06 Sep 2026, 18:44", source: "Pharmacy", detail: "Day-close pharmacy takings", amount: 162900, mode: "Mixed" },
  { id: "RV-9007", at: "06 Sep 2026, 18:30", source: "Consultations", detail: "54 OPD consultations", amount: 432000, mode: "Mixed" },
];

/** Patient payment history log. */
export const PAYMENT_HISTORY = [
  { id: "PAY-7781", at: "08 Sep 2026, 11:24", patient: "Clara Martin", against: "BILL-4402", amount: 840, mode: "UPI", status: "Settled" },
  { id: "PAY-7780", at: "08 Sep 2026, 10:52", patient: "Arya Wijaya Kusuma", against: "BILL-4401", amount: 1280, mode: "Card", status: "Settled" },
  { id: "PAY-7779", at: "07 Sep 2026, 16:10", patient: "Sherly Indriani", against: "BILL-4398", amount: 2100, mode: "Cash", status: "Settled" },
  { id: "PAY-7778", at: "07 Sep 2026, 14:02", patient: "Nafiu Efandyar Maulidy", against: "BILL-4396", amount: 18400, mode: "Insurance", status: "Pending" },
  { id: "PAY-7777", at: "06 Sep 2026, 12:35", patient: "Rohit Malhotra", against: "BILL-4392", amount: 640, mode: "UPI", status: "Settled" },
  { id: "PAY-7776", at: "06 Sep 2026, 09:48", patient: "Sneha Iyer", against: "BILL-4390", amount: 3250, mode: "Card", status: "Refunded" },
];

/** Expense ledger for the selected month. */
export const EXPENSES = [
  { id: "EX-01", head: "Payroll", detail: "248 staff · September cycle", amount: 1420000, category: "Payroll" },
  { id: "EX-02", head: "Pharmacy purchases", detail: "4 purchase orders", amount: 318400, category: "Inventory" },
  { id: "EX-03", head: "Electricity", detail: "BESCOM · 42,180 units", amount: 386000, category: "Utilities" },
  { id: "EX-04", head: "Water and sanitation", detail: "Municipal + tanker top-up", amount: 74500, category: "Utilities" },
  { id: "EX-05", head: "Biomedical waste", detail: "Licensed disposal contract", amount: 96000, category: "Utilities" },
  { id: "EX-06", head: "Equipment AMC", detail: "MRI, CT, autoclave", amount: 240000, category: "Equipment" },
  { id: "EX-07", head: "Housekeeping", detail: "Outsourced, 24 staff", amount: 186000, category: "Operations" },
  { id: "EX-08", head: "Software licences", detail: "Nexclinic, PACS, accounting", amount: 132000, category: "Operations" },
];

export const EXPENSE_MONTHS = [
  "September 2026",
  "August 2026",
  "July 2026",
  "June 2026",
];

/** Closed payroll cycles for the admin payroll screen. */
export const PAYROLL_CYCLES = [
  { cycle: "August 2026", processed: "31 Aug 2026", staff: 246, total: "₹1.41 Cr", status: "Closed" },
  { cycle: "July 2026", processed: "31 Jul 2026", staff: 244, total: "₹1.39 Cr", status: "Closed" },
  { cycle: "June 2026", processed: "30 Jun 2026", staff: 241, total: "₹1.36 Cr", status: "Closed" },
  { cycle: "May 2026", processed: "31 May 2026", staff: 238, total: "₹1.34 Cr", status: "Closed" },
];

export const DASHBOARD_TABS = [
  { id: "revenue", label: "Revenue Analytics", href: "/admin/analytics" },
  { id: "staff", label: "Staff", href: "/admin/staff" },
  { id: "payroll", label: "Payroll", href: "/admin/payroll" },
  { id: "expenses", label: "Expenses", href: "/admin/expenses" },
  { id: "logs", label: "History Logs", href: "/admin/logs" },
];
