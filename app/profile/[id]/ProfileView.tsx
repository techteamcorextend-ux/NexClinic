"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Building2,
  ExternalLink,
  IdCard,
  Mail,
  MonitorSmartphone,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Backdrop from "@/components/portal/Backdrop";
import { PCard, PPill, Reveal, SectionTitle } from "@/components/portal/ui";
import { Switch } from "@/components/ui/switch";
import TextReveal from "@/components/motion/TextReveal";
import ThemeToggle from "@/components/system/ThemeToggle";
import type { Person } from "@/lib/people";
import { ROLE_HOME, useSession } from "@/lib/session";

/** Each kind of person gets the palette of the portal they belong to. */
function themeFor(person: Person) {
  if (person.kind === "patient") return "theme-care";
  if (person.role.toLowerCase().includes("admin")) return "theme-violet";
  if (person.role.toLowerCase().includes("inventory")) return "theme-vault";
  return "theme-clinic";
}

const CONTACT_ICONS = { email: Mail, phone: Phone, clinic: Building2 } as const;

export default function ProfileView({ person }: { person: Person }) {
  const session = useSession();
  /**
   * You only get a door into a portal when it is YOUR portal. An admin
   * reading a surgeon's profile sees the record and nothing else — no step
   * from here into the surgeon's dashboard.
   */
  const isSelf = Boolean(session && session.personId === person.id);
  const ownPortal = session ? ROLE_HOME[session.role] : "/login";

  /** Staff records are admin-only; patient files are for clinicians and the desk. */
  const canSeeRecord = session
    ? person.kind === "patient"
      ? ["admin", "surgeon", "reception"].includes(session.role)
      : session.role === "admin"
    : false;

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);
  const [twoFactor, setTwoFactor] = useState(person.kind !== "patient");

  const contacts = [
    person.email ? { key: "email" as const, label: "Email", value: person.email } : null,
    person.phone ? { key: "phone" as const, label: "Phone", value: person.phone } : null,
    person.clinic ? { key: "clinic" as const, label: "Clinic", value: person.clinic } : null,
  ].filter(Boolean) as { key: keyof typeof CONTACT_ICONS; label: string; value: string }[];

  return (
    <div className={`${themeFor(person)} relative min-h-screen bg-p-bg text-p-ink`}>
      <Backdrop variant="soft" />

      <div className="relative mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={ownPortal}
            className="inline-flex items-center gap-2 rounded-full border border-p-line bg-p-card px-4 py-2 text-sm font-medium text-p-ink transition-colors hover:text-p-accent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <ThemeToggle />
        </div>

        {/* ── Identity ──────────────────────────────────────────────── */}
        <Reveal>
          <PCard className="mt-5 overflow-hidden">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span
                aria-hidden="true"
                className="grid h-20 w-20 shrink-0 place-items-center rounded-[26px] bg-gradient-to-br from-p-accent to-p-accent-2 text-xl font-bold text-white shadow-lift"
              >
                {person.initials}
              </span>

              <div className="min-w-0 flex-1">
                <TextReveal as="h1" className="truncate text-2xl font-bold tracking-tight text-p-ink">
                  {person.name}
                </TextReveal>
                <p className="mt-1 text-sm text-p-muted">{person.role}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <PPill tone={person.status ?? (person.active ? "Active" : "Inactive")}>
                    <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                    {person.status ?? (person.active ? "Active" : "Inactive")}
                  </PPill>
                  <PPill>
                    <IdCard className="h-3 w-3" aria-hidden="true" />
                    {person.id}
                  </PPill>
                  {person.dept ? <PPill>{person.dept}</PPill> : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                {person.recordHref ? (
                  <Link
                    href={person.recordHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-p-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
                  >
                    {person.recordLabel ?? "Open record"}
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : null}
                {isSelf && person.portalHref ? (
                  <Link
                    href={person.portalHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-p-line bg-p-card px-5 py-2.5 text-sm font-medium text-p-ink transition-colors hover:text-p-accent"
                  >
                    <MonitorSmartphone className="h-4 w-4" aria-hidden="true" />
                    Go to my portal
                  </Link>
                ) : null}
              </div>
            </div>
          </PCard>
        </Reveal>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]">
          {/* ── Details ─────────────────────────────────────────────── */}
          <div className="min-w-0 space-y-5">
            <Reveal>
              <PCard>
                <SectionTitle title="Details" />
                <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  {person.facts.map((fact) => (
                    <div key={fact.label} className="min-w-0">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-p-muted">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 truncate text-sm font-medium text-p-ink">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </PCard>
            </Reveal>

            <Reveal>
              <PCard>
                <SectionTitle title="Contact" />
                <ul className="mt-4 flex list-none flex-col gap-2.5">
                  {contacts.length ? (
                    contacts.map((contact) => {
                      const Icon = CONTACT_ICONS[contact.key];
                      return (
                        <li
                          key={contact.label}
                          className="flex items-center gap-3 rounded-[16px] border border-p-line bg-p-bg px-4 py-3"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-p-accent" aria-hidden="true" />
                          <span className="min-w-0">
                            <span className="block text-[11px] text-p-muted">{contact.label}</span>
                            <span className="block truncate text-sm font-medium text-p-ink">
                              {contact.value}
                            </span>
                          </span>
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-sm text-p-muted">No contact details on file.</li>
                  )}
                </ul>
              </PCard>
            </Reveal>
          </div>

          {/* ── Preferences ─────────────────────────────────────────── */}
          <div className="min-w-0 space-y-5">
            <Reveal>
              <PCard as="section" className="scroll-mt-24" >
                <span id="preferences" className="sr-only">
                  Preferences
                </span>
                <SectionTitle title="Preferences" />
                <ul className="mt-4 flex list-none flex-col gap-3">
                  <li className="flex items-start justify-between gap-4">
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-medium text-p-ink">
                        <Mail className="h-4 w-4 text-p-muted" aria-hidden="true" />
                        Email updates
                      </span>
                      <span className="mt-0.5 block text-xs text-p-muted">
                        Appointment changes and reports
                      </span>
                    </span>
                    <Switch
                      checked={notifyEmail}
                      onCheckedChange={setNotifyEmail}
                      aria-label="Email updates"
                    />
                  </li>
                  <li className="flex items-start justify-between gap-4">
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-medium text-p-ink">
                        <Bell className="h-4 w-4 text-p-muted" aria-hidden="true" />
                        Push notifications
                      </span>
                      <span className="mt-0.5 block text-xs text-p-muted">
                        Alerts on this device
                      </span>
                    </span>
                    <Switch
                      checked={notifyPush}
                      onCheckedChange={setNotifyPush}
                      aria-label="Push notifications"
                    />
                  </li>
                  <li className="flex items-start justify-between gap-4">
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-medium text-p-ink">
                        <ShieldCheck className="h-4 w-4 text-p-muted" aria-hidden="true" />
                        Two-step sign in
                      </span>
                      <span className="mt-0.5 block text-xs text-p-muted">
                        One-time code at every login
                      </span>
                    </span>
                    <Switch
                      checked={twoFactor}
                      onCheckedChange={setTwoFactor}
                      aria-label="Two-step sign in"
                    />
                  </li>
                </ul>
                <p className="mt-4 rounded-[14px] border border-dashed border-p-line px-3 py-2 text-[11px] text-p-muted">
                  Sample account — these switches are local to this browser and are
                  not saved anywhere.
                </p>
              </PCard>
            </Reveal>

            <Reveal>
              <PCard>
                <SectionTitle title="Shortcuts" />
                <ul className="mt-4 flex list-none flex-col gap-2">
                  {/* Each shortcut is filtered by what the reader may open. */}
                  {[
                    person.recordHref && canSeeRecord
                      ? { label: person.recordLabel ?? "Open record", href: person.recordHref }
                      : null,
                    person.kind === "staff" && session?.role === "admin"
                      ? { label: "Staff directory", href: "/admin/staff" }
                      : null,
                    person.kind === "patient" && isSelf
                      ? { label: "Medical timeline", href: "/patient/records" }
                      : null,
                    isSelf ? { label: "Change password", href: "/account/password" } : null,
                  ]
                    .filter(Boolean)
                    .map((link) => {
                      const item = link as { label: string; href: string };
                      return (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className="flex items-center justify-between gap-3 rounded-[16px] border border-p-line bg-p-bg px-4 py-3 text-sm font-medium text-p-ink transition-colors hover:border-p-accent hover:text-p-accent"
                          >
                            {item.label}
                            <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </PCard>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
