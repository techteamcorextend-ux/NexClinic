import {
  Building2,
  HeartPulse,
  Package,
  ShieldCheck,
  Stethoscope,
  User,
  type LucideIcon,
} from "lucide-react";

/**
 * The login types shown as horizontal, scrollable tabs.
 * One per Nexclinic portal — the tab only changes how the account is
 * identified and what the person is signing in to, not the auth methods.
 */
export type LoginRole = {
  id: string;
  label: string;
  short: string;
  tagline: string;
  icon: LucideIcon;
  /** Label + placeholder for the first field, which differs per role. */
  identifierLabel: string;
  identifierPlaceholder: string;
  identifierType: "text" | "email" | "tel";
  identifierAutoComplete: string;
  /** Where a successful sign-in would land this role. */
  destination: string;
};

export const LOGIN_ROLES: LoginRole[] = [
  {
    id: "patient",
    label: "Patient",
    short: "Patient",
    tagline: "Health vault, mood tracker and AI wellness chat.",
    icon: User,
    identifierLabel: "Mobile number or email",
    identifierPlaceholder: "you@example.com",
    identifierType: "text",
    identifierAutoComplete: "username",
    destination: "/patient/dashboard",
  },
  {
    id: "doctor",
    label: "Doctor",
    short: "Doctor",
    tagline: "Live queue, EHR, AI scribe and discharge approval.",
    icon: Stethoscope,
    identifierLabel: "Medical council ID or email",
    identifierPlaceholder: "KMC-104928",
    identifierType: "text",
    identifierAutoComplete: "username",
    destination: "/surgeon/dashboard",
  },
  {
    id: "receptionist",
    label: "Receptionist & Clinic",
    short: "Reception",
    tagline: "Triage board, walk-in QR onboarding and billing.",
    icon: Building2,
    identifierLabel: "Staff ID or work email",
    identifierPlaceholder: "front-desk@clinic.health",
    identifierType: "text",
    identifierAutoComplete: "username",
    destination: "/reception/dashboard",
  },
  {
    id: "admin",
    label: "Super Admin",
    short: "Admin",
    tagline: "Multi-clinic oversight, payroll and audit logs.",
    icon: ShieldCheck,
    identifierLabel: "Work email",
    identifierPlaceholder: "admin@nexclinic.health",
    identifierType: "email",
    identifierAutoComplete: "email",
    destination: "/admin/dashboard",
  },
  {
    id: "inventory",
    label: "Inventory",
    short: "Inventory",
    tagline: "Medicines, equipment and OT supplies with alerts.",
    icon: Package,
    identifierLabel: "Store ID or work email",
    identifierPlaceholder: "store-02@nexclinic.health",
    identifierType: "text",
    identifierAutoComplete: "username",
    destination: "/inventory/dashboard",
  },
  {
    id: "wellness",
    label: "Corporate Wellness",
    short: "Wellness",
    tagline: "Workforce stress analytics and SOS response.",
    icon: HeartPulse,
    identifierLabel: "Corporate email",
    identifierPlaceholder: "hr@yourcompany.com",
    identifierType: "email",
    identifierAutoComplete: "email",
    destination: "/patient/health",
  },
];

export const DEFAULT_ROLE_ID = "patient";
