import {
  Boxes,
  ClipboardList,
  Stethoscope,
  User,
  UserCog,
  type LucideIcon,
} from "lucide-react";

/**
 * The five portals, and the demo credentials each sign-in screen is
 * pre-filled with. There is no authentication in this build — submitting the
 * form simply routes to the portal.
 */
export type RoleKey = "admin" | "surgeon" | "reception" | "patient" | "inventory";

export type RoleConfig = {
  key: RoleKey;
  label: string;
  blurb: string;
  icon: LucideIcon;
  home: string;
  demoUser: string;
  demoPass: string;
  /** Tailwind gradient for the role card and sign-in accent. */
  gradient: string;
  /** Shown on the sign-in page's left grid. */
  highlights: string[];
};

export const ROLES: RoleConfig[] = [
  {
    key: "admin",
    label: "Super Admin",
    blurb: "Revenue, staff, payroll, access control and clinic settings.",
    icon: UserCog,
    home: "/admin/dashboard",
    demoUser: "ananya.d",
    demoPass: "admin@2026",
    gradient: "from-violet-500 to-indigo-600",
    highlights: [
      "Revenue and footfall analytics",
      "Staff shifts, payroll and credentials",
      "Expenses, GST and backups",
    ],
  },
  {
    key: "surgeon",
    label: "Surgeon",
    blurb: "Queue, consultations, AI scribe and patient reports.",
    icon: Stethoscope,
    home: "/surgeon/dashboard",
    demoUser: "priya.nair",
    demoPass: "surgeon@2026",
    gradient: "from-sky-500 to-indigo-600",
    highlights: [
      "Today's list and the next patient up",
      "Live consultation with vitals and diet plans",
      "AI scribe that drafts your clinical notes",
    ],
  },
  {
    key: "reception",
    label: "Receptionist",
    blurb: "Patient queue, appointment requests, billing and onboarding.",
    icon: ClipboardList,
    home: "/reception/dashboard",
    demoUser: "kavya.r",
    demoPass: "front@2026",
    gradient: "from-emerald-500 to-teal-600",
    highlights: [
      "Priority queue and emergency broadcast",
      "Approve, decline or reschedule requests",
      "Billing that draws down pharmacy stock",
    ],
  },
  {
    key: "patient",
    label: "Patient",
    blurb: "Appointments, records, refills and telehealth.",
    icon: User,
    home: "/patient/dashboard",
    demoUser: "clara.martin",
    demoPass: "patient@2026",
    gradient: "from-rose-500 to-pink-600",
    highlights: [
      "Book, refill and join a video visit",
      "Your complete medical timeline",
      "Refer a friend with an onboarding QR",
    ],
  },
  {
    key: "inventory",
    label: "Inventory Manager",
    blurb: "Stock, suppliers, purchase orders and equipment.",
    icon: Boxes,
    home: "/inventory/dashboard",
    demoUser: "divya.k",
    demoPass: "stock@2026",
    gradient: "from-amber-500 to-orange-600",
    highlights: [
      "Low-stock register and quick add",
      "Supplier directory and order cart",
      "Equipment maintenance logs",
    ],
  },
];

export function findRole(key: string) {
  return ROLES.find((role) => role.key === key);
}

/** Front-desk facing clinic details, shown on the sign-in left grid. */
export const CLINIC_INFO = {
  name: "Nexclinic — Koramangala",
  address: "80 Feet Road, Koramangala 4th Block, Bengaluru 560034",
  phone: "+91 80 4718 2200",
  email: "hello@nexclinic.health",
  hours: "OPD 08:00 – 20:00 · Emergency 24×7",
  departments: [
    "Cardiology",
    "Orthopaedics",
    "General Medicine",
    "Mind & Wellness",
    "Diagnostics",
    "Pharmacy",
  ],
};

export const DOCTOR_OPTIONS = [
  "Dr. Priya Nair — Cardiology",
  "Dr. Sameer Kulkarni — Orthopaedics",
  "Dr. Fatima Sheikh — Mind & Wellness",
  "Dr. Vivek Bhatt — General Medicine",
];
