/**
 * ─────────────────────────────────────────────────────────────────────
 *  Shared domain types for the Nexclinic front end.
 *
 *  These describe the single client-side store that every portal reads
 *  and writes, which is what makes the flows join up: an appointment
 *  requested on the homepage lands in the receptionist's queue, a bill
 *  raised at the front desk draws down inventory stock, and a shift
 *  change in admin fires a phone notification at the staff member.
 * ─────────────────────────────────────────────────────────────────────
 */

export type Priority = "low" | "medium" | "high";

export const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export type AppointmentStatus =
  | "pending"
  | "approved"
  | "declined"
  | "completed";

export type Appointment = {
  id: string;
  patientName: string;
  phone: string;
  email?: string;
  reason: string;
  date: string;
  time: string;
  doctor: string;
  status: AppointmentStatus;
  source: "web" | "walk-in" | "phone" | "telehealth";
  note?: string;
  createdAt: number;
};

export type QueueState = "waiting" | "in-consult" | "done";

export type QueueItem = {
  id: string;
  patientId?: string;
  name: string;
  initials: string;
  reason: string;
  token: string;
  priority: Priority;
  arrivedAt: string;
  waitMinutes: number;
  state: QueueState;
};

export type StockCategory = "Medicine" | "Equipment" | "OT Supply" | "Reagent";

export type StockItem = {
  id: string;
  name: string;
  category: StockCategory;
  qty: number;
  unit: string;
  reorderLevel: number;
  expiry?: string;
  price: number;
  /** Manually pinned as low, independent of the reorder threshold. */
  flaggedLow: boolean;
};

export type StockLogKind =
  | "issue"
  | "receive"
  | "add"
  | "delete"
  | "order"
  | "flag";

export type StockLog = {
  id: string;
  at: string;
  kind: StockLogKind;
  detail: string;
  by: string;
};

export type Supplier = {
  id: string;
  name: string;
  category: string;
  address: string;
  contact: string;
  distanceKm: number;
  rating: number;
};

/**
 * A purchase order is RAISED by the inventory manager and only becomes a real
 * order once an administrator approves it. Nothing reaches a supplier while
 * the status is "Awaiting approval".
 */
export type PurchaseOrderStatus =
  | "Awaiting approval"
  | "Rejected"
  | "Placed"
  | "In transit"
  | "Received";

export type PurchaseOrder = {
  id: string;
  supplierId: string;
  supplier: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  /** Date the order went to the supplier — set on approval, "—" before that. */
  placedAt: string;
  status: PurchaseOrderStatus;
  /** When the inventory manager raised it. */
  raisedAt?: string;
  raisedBy?: string;
  /** Who approved or rejected it, and when. */
  decidedAt?: string;
  decidedBy?: string;
  /** Why it was turned down — shown back to the inventory manager. */
  rejectionReason?: string;
};

export type EquipmentStatus = "Operational" | "Under maintenance" | "Service due";

export type EquipmentItem = {
  id: string;
  name: string;
  location: string;
  status: EquipmentStatus;
  lastService: string;
  nextService: string;
  logs: { id: string; at: string; note: string; by: string }[];
};

export type Salary = {
  base: number;
  hra: number;
  allowance: number;
  bonus: number;
  taxPercent: number;
};

export type StaffMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
  dept: string;
  phone: string;
  email: string;
  shiftStart: string;
  shiftEnd: string;
  days: string[];
  salary: Salary;
  username: string;
  accessRole: "Super Admin" | "Surgeon" | "Receptionist" | "Inventory" | "Nurse";
  active: boolean;
};

export type BillLine = { name: string; qty: number; price: number; stockId?: string };

export type Bill = {
  id: string;
  patientName: string;
  doctor: string;
  lines: BillLine[];
  consultFee: number;
  total: number;
  at: string;
};

export type NoticeAudience =
  | "reception"
  | "surgeon"
  | "patient"
  | "inventory"
  | "admin"
  | "staff";

export type AppNotice = {
  id: string;
  to: NoticeAudience;
  title: string;
  body: string;
  at: number;
  /** `phone` renders as a device-style push toast; `system` is in-app only. */
  kind: "phone" | "system";
  read: boolean;
};

/** Per-patient clinical chart edited during a consultation. */
export type PatientChart = {
  vitals: { id: string; label: string; value: string; unit: string }[];
  diet: string[];
  notes: string;
};

export type ClinicState = {
  /** Keyed by patient id. Edits made in the consultation view persist here. */
  charts: Record<string, PatientChart>;
  appointments: Appointment[];
  queue: QueueItem[];
  stock: StockItem[];
  stockLogs: StockLog[];
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  equipment: EquipmentItem[];
  staff: StaffMember[];
  bills: Bill[];
  notices: AppNotice[];
};

/** Net pay after allowances and tax, used by payroll and the salary slip. */
export function netPay(salary: Salary) {
  const gross = salary.base + salary.hra + salary.allowance + salary.bonus;
  const tax = Math.round((gross * salary.taxPercent) / 100);
  return { gross, tax, net: gross - tax };
}

/** An item counts as low when it is under its reorder level or pinned low. */
export function isLow(item: StockItem) {
  return item.flaggedLow || item.qty <= item.reorderLevel;
}
