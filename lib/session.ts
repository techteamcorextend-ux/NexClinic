"use client";

/**
 * ─────────────────────────────────────────────────────────────────────
 *  SESSION — who is signed in, and what they may open.
 *
 *  Kept in localStorage and read through `useSyncExternalStore`, so every
 *  header, guard and menu in the app sees the same value without a
 *  provider. When the backend lands this becomes a cookie/JWT read on the
 *  server; the shape below is what it must return.
 *
 *  ⚠️ A client-side check is a UX boundary, not a security one. The
 *  server has to enforce the same rules — see docs/AUTH-CONTRACT.md.
 * ─────────────────────────────────────────────────────────────────────
 */

import { useSyncExternalStore } from "react";
import type { RoleKey } from "./roles";

export type Session = {
  role: RoleKey;
  personId: string;
  username: string;
  name: string;
  /** Set on admin-issued accounts until the holder picks their own password. */
  mustChangePassword: boolean;
  signedInAt: number;
};

const KEY = "nexclinic.session.v1";

/* ═══════════════════ Which routes each role may open ═════════════════ */

/** The dashboard a role lands on, and the only portal it may enter. */
export const ROLE_HOME: Record<RoleKey, string> = {
  admin: "/admin/dashboard",
  surgeon: "/surgeon/dashboard",
  reception: "/reception/dashboard",
  patient: "/patient/dashboard",
  inventory: "/inventory/dashboard",
};

/**
 * Shared areas, and who may look at them. Nobody reaches another role's
 * DASHBOARD — an admin reviewing a surgeon's profile stays on the profile
 * page and cannot step into the surgeon portal from there.
 */
export const SHARED_AREAS: { prefix: string; roles: RoleKey[] }[] = [
  // Any signed-in person may read a profile page.
  { prefix: "/profile", roles: ["admin", "surgeon", "reception", "patient", "inventory"] },
  // Patient files: clinicians and the front desk, plus admin oversight.
  { prefix: "/patients", roles: ["admin", "surgeon", "reception"] },
  // Everyone manages their own password.
  { prefix: "/account", roles: ["admin", "surgeon", "reception", "patient", "inventory"] },
];

/** True when `role` is allowed to open `path`. */
export function canOpen(role: RoleKey, path: string) {
  const shared = SHARED_AREAS.find(
    (area) => path === area.prefix || path.startsWith(`${area.prefix}/`),
  );
  if (shared) return shared.roles.includes(role);

  const home = ROLE_HOME[role];
  const portal = `/${home.split("/")[1]}`;
  return path === portal || path.startsWith(`${portal}/`);
}

/* ═════════════════════════════ The store ═════════════════════════════ */

let cached: Session | null = null;
let cachedRaw: string | null = null;
const listeners = new Set<() => void>();

function read(): Session | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
  // Parse once per distinct value — getSnapshot must be referentially stable
  // or React re-renders forever.
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    cached = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    cached = null;
  }
  return cached;
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function signIn(session: Omit<Session, "signedInAt">) {
  const full: Session = { ...session, signedInAt: Date.now() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(full));
  } catch {
    /* storage blocked — the session lasts until the next navigation */
  }
  cachedRaw = null;
  emit();
  return full;
}

export function signOut() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
  cachedRaw = null;
  emit();
}

export function patchSession(patch: Partial<Session>) {
  const current = read();
  if (!current) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    /* storage blocked */
  }
  cachedRaw = null;
  emit();
}

export function getSession() {
  return read();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab signing out should sign this one out too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) {
      cachedRaw = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** `undefined` while the first client render is still catching up. */
export function useSession(): Session | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => read(),
    () => undefined,
  );
}
