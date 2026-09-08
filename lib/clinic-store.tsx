"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { CLINIC_SEED } from "./clinic-seed";
import {
  PRIORITY_RANK,
  isLow,
  type Appointment,
  type AppNotice,
  type Bill,
  type ClinicState,
  type EquipmentItem,
  type NoticeAudience,
  type Priority,
  type PurchaseOrder,
  type QueueState,
  type Salary,
  type StaffMember,
  type StockItem,
  type StockLog,
  type PatientChart,
} from "./clinic-types";

const STORAGE_KEY = "nexclinic:state:v1";

/* ═════════════════════════════ Actions ═════════════════════════════ */

export type ClinicAction =
  | { type: "hydrate"; state: ClinicState }
  | { type: "appointment/request"; appointment: Omit<Appointment, "id" | "status" | "createdAt"> }
  | { type: "appointment/approve"; id: string }
  | { type: "appointment/decline"; id: string }
  | { type: "appointment/reschedule"; id: string; date: string; time: string }
  | { type: "queue/priority"; id: string; priority: Priority }
  | { type: "queue/state"; id: string; state: QueueState }
  | { type: "queue/add"; name: string; reason: string; priority: Priority }
  | { type: "stock/add"; item: Omit<StockItem, "id" | "flaggedLow"> }
  | { type: "stock/delete"; id: string }
  | { type: "stock/flagLow"; id: string; flagged: boolean }
  | { type: "stock/consume"; lines: { stockId: string; qty: number }[]; ref: string }
  | { type: "order/place"; supplierId: string; items: { name: string; qty: number; price: number }[] }
  | { type: "order/receive"; id: string }
  | { type: "equipment/log"; id: string; note: string; nextService?: string }
  | { type: "equipment/add"; item: Omit<EquipmentItem, "id" | "logs"> }
  | { type: "staff/add"; member: Omit<StaffMember, "id" | "initials"> }
  | { type: "staff/shift"; id: string; shiftStart: string; shiftEnd: string }
  | { type: "staff/salary"; id: string; salary: Salary }
  | { type: "staff/access"; id: string; active: boolean }
  | { type: "bill/create"; bill: Omit<Bill, "id" | "at"> }
  | { type: "chart/vitals"; patientId: string; vitals: PatientChart["vitals"] }
  | { type: "chart/diet"; patientId: string; diet: string[] }
  | { type: "chart/notes"; patientId: string; notes: string }
  | { type: "surgery/schedule"; patient: string; procedure: string; date: string; time: string; theatre: string; notes: string }
  | { type: "emergency/broadcast"; location: string; detail: string }
  | { type: "notice/push"; notice: Omit<AppNotice, "id" | "at" | "read"> }
  | { type: "notice/read"; id: string }
  | { type: "notice/readAll"; audience?: NoticeAudience }
  | { type: "notice/dismiss"; id: string }
  | { type: "reset" };

/* ═════════════════════════════ Helpers ═════════════════════════════ */

let counter = 0;
/** Ids are only generated in event handlers, never during render, so this
 *  monotonic counter can't desync between the server and client markup. */
function uid(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now().toString(36).slice(-5)}${counter}`;
}

function stamp() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function notice(
  state: ClinicState,
  entry: Omit<AppNotice, "id" | "at" | "read">,
): AppNotice[] {
  return [
    { ...entry, id: uid("N"), at: Date.now(), read: false },
    ...state.notices,
  ].slice(0, 40);
}

function log(state: ClinicState, entry: Omit<StockLog, "id" | "at">): StockLog[] {
  return [{ ...entry, id: uid("L"), at: stamp() }, ...state.stockLogs].slice(0, 60);
}

/** Queue order is derived, never stored: priority first, then arrival. */
export function sortQueue(queue: ClinicState["queue"]) {
  return [...queue].sort((a, b) => {
    if (a.state === "in-consult" && b.state !== "in-consult") return -1;
    if (b.state === "in-consult" && a.state !== "in-consult") return 1;
    const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (rank !== 0) return rank;
    return a.arrivedAt.localeCompare(b.arrivedAt);
  });
}

/* ═════════════════════════════ Reducer ═════════════════════════════ */

export function clinicReducer(state: ClinicState, action: ClinicAction): ClinicState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "reset":
      return CLINIC_SEED;

    /* ── Appointments ── */
    case "appointment/request": {
      const appointment: Appointment = {
        ...action.appointment,
        id: uid("APT"),
        status: "pending",
        createdAt: Date.now(),
      };
      return {
        ...state,
        appointments: [appointment, ...state.appointments],
        notices: notice(state, {
          to: "reception",
          kind: "phone",
          title: "New appointment request",
          body: `${appointment.patientName} · ${appointment.date} at ${appointment.time} · ${appointment.doctor}`,
        }),
      };
    }

    case "appointment/approve": {
      const appointment = state.appointments.find((entry) => entry.id === action.id);
      if (!appointment) return state;
      return {
        ...state,
        appointments: state.appointments.map((entry) =>
          entry.id === action.id ? { ...entry, status: "approved" } : entry,
        ),
        notices: notice(state, {
          to: "patient",
          kind: "phone",
          title: "Appointment confirmed",
          body: `${appointment.date} at ${appointment.time} with ${appointment.doctor}`,
        }),
      };
    }

    case "appointment/decline": {
      const appointment = state.appointments.find((entry) => entry.id === action.id);
      if (!appointment) return state;
      return {
        ...state,
        appointments: state.appointments.map((entry) =>
          entry.id === action.id ? { ...entry, status: "declined" } : entry,
        ),
        notices: notice(state, {
          to: "patient",
          kind: "phone",
          title: "Appointment declined",
          body: `${appointment.patientName}: the requested slot is unavailable. Please pick another.`,
        }),
      };
    }

    case "appointment/reschedule": {
      const appointment = state.appointments.find((entry) => entry.id === action.id);
      if (!appointment) return state;
      return {
        ...state,
        appointments: state.appointments.map((entry) =>
          entry.id === action.id
            ? { ...entry, date: action.date, time: action.time, status: "approved" }
            : entry,
        ),
        notices: notice(state, {
          to: "patient",
          kind: "phone",
          title: "Appointment rescheduled",
          body: `Moved to ${action.date} at ${action.time} with ${appointment.doctor}`,
        }),
      };
    }

    /* ── Queue ── */
    case "queue/priority":
      return {
        ...state,
        queue: state.queue.map((entry) =>
          entry.id === action.id ? { ...entry, priority: action.priority } : entry,
        ),
      };

    case "queue/state":
      return {
        ...state,
        queue: state.queue.map((entry) =>
          entry.id === action.id ? { ...entry, state: action.state } : entry,
        ),
      };

    case "queue/add": {
      const initials = action.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      return {
        ...state,
        queue: [
          ...state.queue,
          {
            id: uid("Q"),
            name: action.name,
            initials,
            reason: action.reason,
            token: `A-${18 + state.queue.length}`,
            priority: action.priority,
            arrivedAt: new Date().toTimeString().slice(0, 5),
            waitMinutes: 0,
            state: "waiting",
          },
        ],
        notices: notice(state, {
          to: "surgeon",
          kind: "system",
          title: "Walk-in added to queue",
          body: `${action.name} · ${action.reason} · ${action.priority} priority`,
        }),
      };
    }

    /* ── Stock ── */
    case "stock/add": {
      const item: StockItem = { ...action.item, id: uid("S"), flaggedLow: false };
      return {
        ...state,
        stock: [item, ...state.stock],
        stockLogs: log(state, {
          kind: "add",
          detail: `${item.name} added — ${item.qty} ${item.unit}`,
          by: "Inventory manager",
        }),
      };
    }

    case "stock/delete": {
      const item = state.stock.find((entry) => entry.id === action.id);
      if (!item) return state;
      return {
        ...state,
        stock: state.stock.filter((entry) => entry.id !== action.id),
        stockLogs: log(state, {
          kind: "delete",
          detail: `${item.name} removed from the register`,
          by: "Inventory manager",
        }),
      };
    }

    case "stock/flagLow": {
      const item = state.stock.find((entry) => entry.id === action.id);
      if (!item) return state;
      return {
        ...state,
        stock: state.stock.map((entry) =>
          entry.id === action.id ? { ...entry, flaggedLow: action.flagged } : entry,
        ),
        stockLogs: log(state, {
          kind: "flag",
          detail: `${item.name} ${action.flagged ? "pinned as low stock" : "cleared from low stock"}`,
          by: "Inventory manager",
        }),
      };
    }

    case "stock/consume": {
      const consumed: string[] = [];
      const nextStock = state.stock.map((item) => {
        const line = action.lines.find((entry) => entry.stockId === item.id);
        if (!line) return item;
        consumed.push(`${item.name} ×${line.qty}`);
        return { ...item, qty: Math.max(0, item.qty - line.qty) };
      });

      // Anything that crossed its reorder level because of this bill.
      const newlyLow = nextStock.filter(
        (item) =>
          isLow(item) && !isLow(state.stock.find((entry) => entry.id === item.id) ?? item),
      );

      let notices = state.notices;
      if (newlyLow.length > 0) {
        notices = [
          {
            id: uid("N"),
            at: Date.now(),
            read: false,
            to: "inventory" as NoticeAudience,
            kind: "phone" as const,
            title: "Stock dropped below reorder level",
            body: newlyLow.map((item) => `${item.name} · ${item.qty} left`).join(", "),
          },
          ...notices,
        ].slice(0, 40);
      }

      return {
        ...state,
        stock: nextStock,
        notices,
        stockLogs: log(state, {
          kind: "issue",
          detail: `${consumed.join(", ")} issued against ${action.ref}`,
          by: "Front desk",
        }),
      };
    }

    /* ── Orders ── */
    case "order/place": {
      const supplier = state.suppliers.find((entry) => entry.id === action.supplierId);
      const total = action.items.reduce((sum, item) => sum + item.qty * item.price, 0);
      const order: PurchaseOrder = {
        id: uid("PO"),
        supplierId: action.supplierId,
        supplier: supplier?.name ?? "Unknown supplier",
        items: action.items,
        total,
        placedAt: stamp().split(",")[0],
        status: "Placed",
      };
      return {
        ...state,
        orders: [order, ...state.orders],
        stockLogs: log(state, {
          kind: "order",
          detail: `${order.id} placed with ${order.supplier} — ${action.items.length} line items`,
          by: "Inventory manager",
        }),
        notices: notice(state, {
          to: "admin",
          kind: "system",
          title: "Purchase order raised",
          body: `${order.id} · ${order.supplier} · ₹${total.toLocaleString("en-IN")}`,
        }),
      };
    }

    case "order/receive": {
      const order = state.orders.find((entry) => entry.id === action.id);
      if (!order) return state;
      const nextStock = state.stock.map((item) => {
        const line = order.items.find((entry) => entry.name === item.name);
        return line ? { ...item, qty: item.qty + line.qty } : item;
      });
      return {
        ...state,
        orders: state.orders.map((entry) =>
          entry.id === action.id ? { ...entry, status: "Received" } : entry,
        ),
        stock: nextStock,
        stockLogs: log(state, {
          kind: "receive",
          detail: `${order.id} received from ${order.supplier}`,
          by: "Inventory manager",
        }),
      };
    }

    /* ── Equipment ── */
    case "equipment/log":
      return {
        ...state,
        equipment: state.equipment.map((item) =>
          item.id === action.id
            ? {
                ...item,
                nextService: action.nextService ?? item.nextService,
                lastService: stamp().split(",")[0],
                logs: [
                  { id: uid("EL"), at: stamp(), note: action.note, by: "Biomed team" },
                  ...item.logs,
                ],
              }
            : item,
        ),
      };

    case "equipment/add":
      return {
        ...state,
        equipment: [{ ...action.item, id: uid("EQ"), logs: [] }, ...state.equipment],
      };

    /* ── Staff ── */
    case "staff/add": {
      const initials = action.member.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      return {
        ...state,
        staff: [{ ...action.member, id: uid("ST"), initials }, ...state.staff],
        notices: notice(state, {
          to: "staff",
          kind: "phone",
          title: "Welcome to Nexclinic",
          body: `${action.member.name}: your ${action.member.accessRole} account is ready. Username ${action.member.username}.`,
        }),
      };
    }

    case "staff/shift": {
      const member = state.staff.find((entry) => entry.id === action.id);
      if (!member) return state;
      return {
        ...state,
        staff: state.staff.map((entry) =>
          entry.id === action.id
            ? { ...entry, shiftStart: action.shiftStart, shiftEnd: action.shiftEnd }
            : entry,
        ),
        notices: notice(state, {
          to: "staff",
          kind: "phone",
          title: `Shift updated · ${member.name}`,
          body: `New shift ${action.shiftStart}–${action.shiftEnd}. Sent to ${member.phone}.`,
        }),
      };
    }

    case "staff/salary":
      return {
        ...state,
        staff: state.staff.map((entry) =>
          entry.id === action.id ? { ...entry, salary: action.salary } : entry,
        ),
      };

    case "staff/access": {
      const member = state.staff.find((entry) => entry.id === action.id);
      if (!member) return state;
      return {
        ...state,
        staff: state.staff.map((entry) =>
          entry.id === action.id ? { ...entry, active: action.active } : entry,
        ),
        notices: notice(state, {
          to: "staff",
          kind: "phone",
          title: action.active ? "Access restored" : "Access suspended",
          body: `${member.name}'s ${member.accessRole} login was ${action.active ? "re-enabled" : "disabled"}.`,
        }),
      };
    }

    /* ── Billing ── */
    case "bill/create": {
      const bill: Bill = { ...action.bill, id: uid("BILL"), at: stamp().split(",")[0] };
      return { ...state, bills: [bill, ...state.bills] };
    }

    /* ── Clinical chart ── */
    case "chart/vitals":
      return {
        ...state,
        charts: {
          ...state.charts,
          [action.patientId]: {
            ...(state.charts[action.patientId] ?? { vitals: [], diet: [], notes: "" }),
            vitals: action.vitals,
          },
        },
      };

    case "chart/diet":
      return {
        ...state,
        charts: {
          ...state.charts,
          [action.patientId]: {
            ...(state.charts[action.patientId] ?? { vitals: [], diet: [], notes: "" }),
            diet: action.diet,
          },
        },
      };

    case "chart/notes":
      return {
        ...state,
        charts: {
          ...state.charts,
          [action.patientId]: {
            ...(state.charts[action.patientId] ?? { vitals: [], diet: [], notes: "" }),
            notes: action.notes,
          },
        },
      };

    /* ── Theatre and emergency ── */
    case "surgery/schedule":
      return {
        ...state,
        notices: notice(state, {
          to: "reception",
          kind: "phone",
          title: "OR prep required",
          body: `${action.procedure} for ${action.patient} · ${action.date} ${action.time} · ${action.theatre}${action.notes ? ` · ${action.notes}` : ""}`,
        }),
      };

    case "emergency/broadcast": {
      const at = Date.now();
      return {
        ...state,
        notices: [
          {
            id: uid("N"),
            at,
            read: false,
            to: "surgeon" as NoticeAudience,
            kind: "phone" as const,
            title: "EMERGENCY — respond now",
            body: `${action.location} · ${action.detail}`,
          },
          {
            id: uid("N"),
            at: at + 1,
            read: false,
            to: "admin" as NoticeAudience,
            kind: "system" as const,
            title: "Emergency raised at the front desk",
            body: `${action.location} · ${action.detail}`,
          },
          ...state.notices,
        ].slice(0, 40),
      };
    }

    /* ── Notices ── */
    case "notice/push":
      return { ...state, notices: notice(state, action.notice) };

    case "notice/read":
      return {
        ...state,
        notices: state.notices.map((entry) =>
          entry.id === action.id ? { ...entry, read: true } : entry,
        ),
      };

    case "notice/readAll":
      return {
        ...state,
        notices: state.notices.map((entry) =>
          !action.audience || entry.to === action.audience
            ? { ...entry, read: true }
            : entry,
        ),
      };

    case "notice/dismiss":
      return {
        ...state,
        notices: state.notices.filter((entry) => entry.id !== action.id),
      };

    default:
      return state;
  }
}

/* ═════════════════════════════ Provider ════════════════════════════ */

type ClinicContextValue = {
  state: ClinicState;
  dispatch: Dispatch<ClinicAction>;
  /** False until the saved state has been read, so nothing renders stale. */
  hydrated: boolean;
};

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(clinicReducer, CLINIC_SEED);
  const [hydrated, setHydrated] = useState(false);

  // Restore after mount so the server and first client render agree.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ClinicState;
        // Only accept a shape we recognise; anything older is discarded.
        if (parsed && Array.isArray(parsed.stock) && Array.isArray(parsed.staff)) {
          dispatch({ type: "hydrate", state: { ...CLINIC_SEED, ...parsed } });
        }
      }
    } catch {
      /* storage unavailable or corrupt — carry on with the seed */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota or private mode — the app still works, it just won't persist */
    }
  }, [state, hydrated]);

  const value = useMemo(() => ({ state, dispatch, hydrated }), [state, hydrated]);

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error("useClinic must be used inside <ClinicProvider>");
  }
  return context;
}

/** Notices addressed to one portal, newest first. */
export function useNotices(audience: NoticeAudience) {
  const { state, dispatch } = useClinic();
  const list = useMemo(
    () => state.notices.filter((entry) => entry.to === audience),
    [state.notices, audience],
  );
  const unread = list.filter((entry) => !entry.read).length;
  const markAllRead = useCallback(
    () => dispatch({ type: "notice/readAll", audience }),
    [dispatch, audience],
  );
  return { list, unread, markAllRead };
}
