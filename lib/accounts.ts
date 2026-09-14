/**
 * ─────────────────────────────────────────────────────────────────────
 *  ACCOUNTS — the stand-in for the auth backend.
 *
 *  ⚠️ THIS IS NOT SECURITY. Passwords are kept in the browser in plain
 *  text and every check runs client-side, because this build has no
 *  server. It exists so the screens around authentication — signing in,
 *  a forced first-login reset, an admin issuing staff credentials, a
 *  patient registering — are real and can be swapped onto an API without
 *  redesigning anything. `docs/AUTH-CONTRACT.md` names the endpoints
 *  each function below becomes.
 * ─────────────────────────────────────────────────────────────────────
 */

import type { RoleKey } from "./roles";

export type Account = {
  /** Directory id — resolves through `findPerson` to a profile page. */
  personId: string;
  username: string;
  /** Plain text ON PURPOSE: see the warning above. The server hashes. */
  password: string;
  role: RoleKey;
  name: string;
  email?: string;
  /** Admin-issued and self-registered accounts start life needing a reset. */
  mustChangePassword: boolean;
  createdAt: string;
};

export type SignInResult =
  | { ok: true; account: Account }
  | { ok: false; reason: "unknown-user" | "wrong-password" | "wrong-role" };

const STORE_KEY = "nexclinic.accounts.v1";

/* ════════════════════ Seed accounts (sample data) ════════════════════ */

const SEED: Account[] = [
  {
    personId: "ST-7",
    username: "ananya.d",
    password: "Admin@2026",
    role: "admin",
    name: "Ananya Desai",
    email: "ananya.desai@nexclinic.health",
    mustChangePassword: false,
    createdAt: "2026-03-01",
  },
  {
    personId: "DR-SP",
    username: "shabrina.p",
    password: "Surgeon@2026",
    role: "surgeon",
    name: "Dr. Shabrina Putri",
    email: "shabrina.putri@nexclinic.health",
    mustChangePassword: false,
    createdAt: "2026-02-14",
  },
  {
    personId: "ST-4",
    username: "kavya.r",
    password: "Front@2026",
    role: "reception",
    name: "Kavya Reddy",
    email: "kavya.r@nexclinic.health",
    mustChangePassword: false,
    createdAt: "2025-05-11",
  },
  {
    personId: "p-1001",
    username: "clara.martin",
    password: "Patient@2026",
    role: "patient",
    name: "Clara Martin",
    email: "clara.martin@mail.fr",
    mustChangePassword: false,
    createdAt: "2023-02-03",
  },
  {
    personId: "ST-6",
    username: "divya.k",
    password: "Stock@2026",
    role: "inventory",
    name: "Divya Kamath",
    email: "divya.k@nexclinic.health",
    mustChangePassword: false,
    createdAt: "2024-03-22",
  },
];

/* ═════════════════════════ Storage plumbing ══════════════════════════ */

function canStore() {
  return typeof window !== "undefined";
}

/** Everything known right now — seeds plus anything registered since. */
export function allAccounts(): Account[] {
  if (!canStore()) return SEED;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Account[];
    // Seeds always win on username collision, so a broken store can't lock
    // the sample logins out.
    const extra = parsed.filter(
      (entry) => !SEED.some((seed) => seed.username === entry.username),
    );
    const updated = SEED.map(
      (seed) => parsed.find((entry) => entry.username === seed.username) ?? seed,
    );
    return [...updated, ...extra];
  } catch {
    return SEED;
  }
}

function write(accounts: Account[]) {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(accounts));
  } catch {
    /* private window, quota, blocked storage — sign-in still works in memory */
  }
}

function upsert(account: Account) {
  const next = allAccounts().filter((entry) => entry.username !== account.username);
  write([...next, account]);
}

export function findAccount(username: string) {
  const needle = username.trim().toLowerCase();
  return allAccounts().find((entry) => entry.username.toLowerCase() === needle);
}

/* ══════════════════════════ Auth operations ══════════════════════════ */

/** Becomes POST /api/auth/login. */
export function verifyCredentials(
  username: string,
  password: string,
  expectedRole?: RoleKey,
): SignInResult {
  const account = findAccount(username);
  if (!account) return { ok: false, reason: "unknown-user" };
  if (account.password !== password) return { ok: false, reason: "wrong-password" };
  if (expectedRole && account.role !== expectedRole) {
    return { ok: false, reason: "wrong-role" };
  }
  return { ok: true, account };
}

/** Becomes POST /api/auth/change-password. */
export function changePassword(
  username: string,
  currentPassword: string,
  nextPassword: string,
): { ok: true } | { ok: false; reason: "unknown-user" | "wrong-password" | "too-weak" } {
  const account = findAccount(username);
  if (!account) return { ok: false, reason: "unknown-user" };
  if (account.password !== currentPassword) return { ok: false, reason: "wrong-password" };
  if (!passwordProblem(nextPassword)) {
    upsert({ ...account, password: nextPassword, mustChangePassword: false });
    return { ok: true };
  }
  return { ok: false, reason: "too-weak" };
}

/** The one place the password rule lives. Returns null when it passes. */
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(password)) return "Include at least one letter.";
  if (!/[0-9]/.test(password)) return "Include at least one number.";
  return null;
}

/** Becomes POST /api/staff (admin only) — returns the credentials once. */
export function issueStaffCredentials(input: {
  personId: string;
  name: string;
  email?: string;
  role: RoleKey;
}): { username: string; tempPassword: string } {
  const base = input.name
    .replace(/^Dr\.\s*/i, "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const stem = base.length > 1 ? `${base[0]}.${base[1][0]}` : base[0] ?? "staff";

  let username = stem;
  let suffix = 1;
  while (findAccount(username)) {
    suffix += 1;
    username = `${stem}${suffix}`;
  }

  const tempPassword = temporaryPassword();
  upsert({
    personId: input.personId,
    username,
    password: tempPassword,
    role: input.role,
    name: input.name,
    email: input.email,
    mustChangePassword: true,
    createdAt: new Date().toISOString().slice(0, 10),
  });

  return { username, tempPassword };
}

/** Becomes POST /api/auth/register (patients only — staff are issued). */
export function registerPatient(input: {
  personId: string;
  name: string;
  email: string;
  username: string;
  password: string;
}): { ok: true; account: Account } | { ok: false; reason: "taken" | "too-weak" } {
  if (findAccount(input.username)) return { ok: false, reason: "taken" };
  if (passwordProblem(input.password)) return { ok: false, reason: "too-weak" };

  const account: Account = {
    personId: input.personId,
    username: input.username,
    password: input.password,
    role: "patient",
    name: input.name,
    email: input.email,
    mustChangePassword: false,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  upsert(account);
  return { ok: true, account };
}

/** A readable one-time password — the admin reads it out or copies it. */
function temporaryPassword() {
  const words = ["Clinic", "Sunrise", "Ward", "Pulse", "Vital", "Ember", "Harbor"];
  const word = words[Math.floor(Math.random() * words.length)];
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${word}@${digits}`;
}
