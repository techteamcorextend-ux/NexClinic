/**
 * ─────────────────────────────────────────────────────────────────────
 *  PEOPLE DIRECTORY
 *
 *  One lookup that resolves ANY id used anywhere in the app — staff
 *  (ST-*), patients (p-*), directory users (u-*) and the signed-in
 *  portal personas — into a single shape the profile page can render.
 *
 *  All of it is SAMPLE DATA. Swap the three sources below for server
 *  queries and `findPerson` keeps working unchanged.
 * ─────────────────────────────────────────────────────────────────────
 */

import { CLINIC_SEED } from "./clinic-seed";
import { USERS } from "./admin-data";
import { PATIENTS } from "./portal-data";

export type PersonKind = "staff" | "patient" | "user";

export type PersonFact = { label: string; value: string };

export type Person = {
  id: string;
  kind: PersonKind;
  name: string;
  initials: string;
  role: string;
  email?: string;
  phone?: string;
  clinic?: string;
  dept?: string;
  active: boolean;
  status?: string;
  /** Rows rendered in the "Details" card. */
  facts: PersonFact[];
  /** Where this person's richer, role-specific record lives, if any. */
  recordHref?: string;
  recordLabel?: string;
  /** Which portal this person signs in to, when they have one. */
  portalHref?: string;
};

/* ══════════ Personas that only exist as a signed-in profile ══════════ */

const STANDALONE: Person[] = [
  {
    id: "DR-SP",
    kind: "staff",
    name: "Dr. Shabrina Putri",
    initials: "SP",
    role: "General Medicine",
    email: "shabrina.putri@nexclinic.health",
    phone: "+91 98450 22110",
    clinic: "Sunrise Multi-Specialty — Koramangala",
    dept: "General Medicine",
    active: true,
    status: "Active",
    facts: [
      { label: "Department", value: "General Medicine" },
      { label: "Consulting hours", value: "09:00 – 17:00" },
      { label: "Consulting days", value: "Mon, Tue, Wed, Thu, Fri" },
      { label: "Access role", value: "Surgeon" },
    ],
    portalHref: "/surgeon/dashboard",
  },
];

/* ═════════════════════════════ Resolvers ═════════════════════════════ */

function fromStaff(id: string): Person | undefined {
  const member = CLINIC_SEED.staff.find((entry) => entry.id === id);
  if (!member) return undefined;

  const portal =
    member.accessRole === "Super Admin"
      ? "/admin/dashboard"
      : member.accessRole === "Surgeon"
        ? "/surgeon/dashboard"
        : member.accessRole === "Receptionist"
          ? "/reception/dashboard"
          : member.accessRole === "Inventory"
            ? "/inventory/dashboard"
            : undefined;

  return {
    id: member.id,
    kind: "staff",
    name: member.name,
    initials: member.initials,
    role: member.role,
    email: member.email,
    phone: member.phone,
    dept: member.dept,
    active: member.active,
    status: member.active ? "Active" : "Inactive",
    facts: [
      { label: "Department", value: member.dept },
      { label: "Shift", value: `${member.shiftStart} – ${member.shiftEnd}` },
      { label: "Working days", value: member.days.join(", ") },
      { label: "Access role", value: member.accessRole },
      { label: "Username", value: member.username },
    ],
    recordHref: `/admin/staff/${member.id}`,
    recordLabel: "Open staff record",
    portalHref: portal,
  };
}

function fromPatient(id: string): Person | undefined {
  const patient = PATIENTS.find((entry) => entry.id === id);
  if (!patient) return undefined;

  return {
    id: patient.id,
    kind: "patient",
    name: patient.name,
    initials: patient.initials,
    role: "Patient",
    email: patient.email,
    phone: patient.phone,
    clinic: patient.clinic,
    active: true,
    status: patient.status,
    facts: [
      { label: "Condition", value: patient.condition },
      { label: "Attending", value: patient.doctor },
      { label: "Age / sex", value: `${patient.age} · ${patient.sex}` },
      { label: "Blood type", value: patient.bloodType },
      { label: "Height / weight", value: `${patient.heightCm} cm · ${patient.weightKg} kg` },
      { label: "City", value: patient.city },
      { label: "Registered", value: patient.registered },
    ],
    recordHref: `/patients/${patient.id}`,
    recordLabel: "Open medical record",
    portalHref: "/patient/dashboard",
  };
}

function fromUser(id: string): Person | undefined {
  const user = USERS.find((entry) => entry.id === id);
  if (!user) return undefined;

  return {
    id: user.id,
    kind: "user",
    name: user.name,
    initials: user.initials,
    role: user.role,
    email: user.email,
    clinic: user.clinic,
    active: user.status === "Active",
    status: user.status,
    facts: [
      { label: "Clinic", value: user.clinic },
      { label: "Joined", value: user.joined },
      { label: "Directory group", value: user.tab },
    ],
  };
}

/* ═══════════════════════════ Public lookup ═══════════════════════════ */

/** Resolve any id in the app to a person, whichever list it lives in. */
export function findPerson(id: string): Person | undefined {
  return (
    STANDALONE.find((entry) => entry.id === id) ??
    fromStaff(id) ??
    fromPatient(id) ??
    fromUser(id)
  );
}

/** Every id the profile route can render — used for static params. */
export function allPeopleIds(): string[] {
  return [
    ...STANDALONE.map((entry) => entry.id),
    ...CLINIC_SEED.staff.map((entry) => entry.id),
    ...PATIENTS.map((entry) => entry.id),
    ...USERS.map((entry) => entry.id),
  ];
}
