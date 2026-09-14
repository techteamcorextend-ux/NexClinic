"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Award,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  Smartphone,
  Sparkles,
  Stethoscope,
  User,
  Video,
} from "lucide-react";
import Backdrop from "@/components/portal/Backdrop";
import { ROLE_HOME, useSession } from "@/lib/session";
import { PPill, Reveal } from "@/components/portal/ui";
import {
  ChevronButton,
  DownloadButton,
  ExpandButton,
  MorphButton,
  StretchButton,
} from "@/components/motion-ui/buttons";
import type { Patient } from "@/lib/portal-data";
import { downloadCsv, downloadPdf } from "@/lib/downloads";

import TextReveal from "@/components/motion/TextReveal";
/**
 * Every entry scrolls to a section that exists on this page. The old list
 * carried six more that were inert buttons with nowhere to go — a record
 * with no Calendar or Messages section shouldn't advertise one.
 */
const SIDE_NAV = [
  { id: "record-profile", label: "Profile", icon: User },
  { id: "record-care", label: "Care pathway", icon: ClipboardList },
  { id: "record-billing", label: "Billing", icon: FolderOpen },
  { id: "record-activity", label: "Recent activity", icon: Activity },
];

const PROGRAMME_ICONS = [Stethoscope, Smartphone, Activity];

const ACTIVITY_ICONS: Record<string, typeof Video> = {
  visit: Video,
  report: FileText,
  badge: Award,
};

const CARE_PLAN = [
  "Unlimited consultations",
  "Priority triage and booking",
  "All lab reports included",
  "24×7 nurse helpline",
  "Annual full-body screening",
];

/** Payment methods are named in text, not reproduced as brand logos. */
const PAYMENT_METHODS = ["Mastercard", "Visa", "Amex", "UPI"];

export default function PatientProfile({ patient }: { patient: Patient }) {
  const session = useSession();
  const [section, setSection] = useState(SIDE_NAV[0].id);

  /** Back goes to the dashboard of whoever is looking, not a fixed portal. */
  const backHref = session ? ROLE_HOME[session.role] : "/login";

  const goToSection = (id: string) => {
    setSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Keep the rail in step with whatever the reader has scrolled to.
  useEffect(() => {
    const targets = SIDE_NAV.map((item) => document.getElementById(item.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    if (!targets.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setSection(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );

    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const details = [
    { icon: CalendarDays, label: "Registered", value: patient.registered },
    { icon: MapPin, label: "Location", value: patient.city },
    { icon: Activity, label: "Date of birth", value: patient.dob },
    { icon: Mail, label: "E-mail", value: patient.email },
    { icon: Phone, label: "Phone", value: patient.phone },
  ];

  const downloadRecord = () =>
    downloadPdf(`patient-record-${patient.id}`, {
      title: "Nexclinic — Patient Record",
      subtitle: `${patient.name} · ${patient.clinic}`,
      lines: [
        `Patient ID: ${patient.id}`,
        `Date of birth: ${patient.dob}    Sex: ${patient.sex}`,
        `Blood type: ${patient.bloodType}    Height: ${patient.heightCm} cm    Weight: ${patient.weightKg} kg`,
        `Location: ${patient.city}`,
        `E-mail: ${patient.email}    Phone: ${patient.phone}`,
        `Treating clinician: ${patient.doctor}`,
        `Status: ${patient.status} — ${patient.condition}`,
        "",
        "Latest vitals",
        ...patient.vitals.map((v) => `  ${v.label}: ${v.value} ${v.unit} (${v.delta})`),
        "",
        "Visits",
        ...patient.visits.map((v) => `  ${v.date} — ${v.title} (${v.doctor})`),
        "",
        "Care programmes",
        ...patient.courses.map((c) => `  ${c.title} — ${c.status}, ${c.modules} modules`),
        "",
        "Sample output generated in the browser. Not a medical record.",
      ],
    });

  const exportVisits = () =>
    downloadCsv(
      `visits-${patient.id}`,
      ["Date", "Visit", "Type", "Clinician"],
      patient.visits.map((visit) => [visit.date, visit.title, visit.kind, visit.doctor]),
    );

  return (
    <div className="theme-violet min-h-screen bg-p-bg text-p-ink">
      <a
        href="#profile-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-p-ink focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex w-full max-w-[1400px]">
        {/* ── Purple sidebar ── */}
        <aside
          aria-label="Patient record sections"
          className="relative hidden w-[250px] shrink-0 overflow-hidden bg-p-grad lg:block"
        >
          <div className="relative z-10 px-6 pt-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">
              Dashboard
            </p>
            <p className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white">
              Patient
              <br />
              record
            </p>

            <ul className="mt-9 flex list-none flex-col gap-1">
              {SIDE_NAV.map((item) => {
                const Icon = item.icon;
                const active = item.id === section;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => goToSection(item.id)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-out-soft ${
                        active
                          ? "bg-white/25 text-white shadow-lift"
                          : "text-white/75 hover:translate-x-1 hover:bg-white/12 hover:text-white motion-reduce:hover:translate-x-0"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      <span className="flex-1 truncate text-left">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <Backdrop variant="leaf" />
        </aside>

        {/* ── Content ── */}
        <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          {/* Header bar */}
          <Reveal>
            <header className="flex flex-wrap items-center gap-3 rounded-[22px] border border-p-line bg-p-card px-5 py-3.5 shadow-[0_4px_24px_rgba(16,24,40,0.05)]">
              <Link
                href={backHref}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-p-muted transition-colors hover:text-p-ink"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Back</span>
              </Link>

              <TextReveal as="h1" className="min-w-0 flex-1 truncate text-xl font-bold tracking-tight text-p-ink">
                Patient profile
              </TextReveal>

              <div className="relative order-last w-full sm:order-none sm:w-56">
                <label htmlFor="profile-search" className="sr-only">
                  Search this record
                </label>
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-p-muted"
                  aria-hidden="true"
                />
                <input
                  id="profile-search"
                  type="search"
                  placeholder="Search…"
                  className="h-10 w-full rounded-full border border-p-line bg-p-bg pl-11 pr-4 text-sm text-p-ink placeholder:text-p-muted focus:border-p-accent focus:outline-none"
                />
              </div>

              <button
                type="button"
                aria-label="Notifications, 1 unread"
                className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-p-line text-p-muted transition-colors hover:text-p-ink"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                <span
                  aria-hidden="true"
                  className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-p-card"
                />
              </button>
            </header>
          </Reveal>

          <main id="profile-main" className="mt-4 space-y-5 pb-10">
            {/* Identity card */}
            <Reveal delay={0.05}>
              <section
                id="record-profile"
                className="scroll-mt-6 rounded-[22px] border border-p-line bg-p-card p-6 shadow-[0_4px_24px_rgba(16,24,40,0.05)] md:p-8"
              >
                <div className="flex flex-col gap-7 md:flex-row md:items-start">
                  {/* Illustrated avatar */}
                  <div className="relative mx-auto h-40 w-40 shrink-0 md:mx-0">
                    <div className="absolute inset-0 overflow-hidden rounded-full bg-p-soft">
                      <svg viewBox="0 0 160 160" className="h-full w-full" aria-hidden="true">
                        <defs>
                          <linearGradient id="avaBg" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#EDE4FF" />
                            <stop offset="100%" stopColor="#D8C9FA" />
                          </linearGradient>
                          <linearGradient id="avaBody" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A78BFA" />
                            <stop offset="100%" stopColor="#7C5CE0" />
                          </linearGradient>
                        </defs>
                        <rect width="160" height="160" fill="url(#avaBg)" />
                        <ellipse cx="34" cy="120" rx="15" ry="42" fill="#C4B5FD" opacity="0.65" transform="rotate(-18 34 120)" />
                        <ellipse cx="128" cy="112" rx="13" ry="36" fill="#C4B5FD" opacity="0.5" transform="rotate(22 128 112)" />
                        <path d="M80 148 c-30 0 -48 -14 -48 -30 c0 -14 16 -24 48 -24 s48 10 48 24 c0 16 -18 30 -48 30 z" fill="url(#avaBody)" />
                        <circle cx="80" cy="72" r="27" fill="#F6E7DC" />
                        <path d="M80 40 c19 0 30 12 30 29 c0 6 -1 11 -3 15 l-6 -18 c-12 4 -30 4 -42 -2 l-6 20 c-2 -4 -3 -9 -3 -15 c0 -17 11 -29 30 -29 z" fill="#3B2E4F" />
                      </svg>
                    </div>
                    <span className="absolute -bottom-1 -right-1">
                      <PPill tone={patient.status}>{patient.status}</PPill>
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <TextReveal as="h2" className="text-3xl font-bold tracking-tight text-p-ink">
                          {patient.name}
                        </TextReveal>
                        <p className="mt-1 text-sm text-p-muted">
                          {patient.condition} · {patient.doctor}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Edit patient details"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-p-line text-p-muted transition-all duration-300 hover:-translate-y-0.5 hover:text-p-accent motion-reduce:hover:translate-y-0"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                      {details.map((detail) => {
                        const Icon = detail.icon;
                        return (
                          <div key={detail.label} className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-p-soft text-p-accent"
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-p-muted">
                                {detail.label}
                              </dt>
                              <dd className="truncate text-sm font-medium text-p-ink">
                                {detail.value}
                              </dd>
                            </div>
                          </div>
                        );
                      })}
                    </dl>

                    <div className="mt-7 flex flex-wrap items-center gap-2.5">
                      <DownloadButton onDownload={downloadRecord} fileLabel="Patient record">
                        Full record
                      </DownloadButton>
                      <ExpandButton className="text-white">Share</ExpandButton>
                      <MorphButton doneLabel="Message sent">Message patient</MorphButton>
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>

            {/* Care pathway + billing */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
              <Reveal delay={0.1}>
                <section
                  id="record-care"
                  className="h-full scroll-mt-6 rounded-[22px] border border-p-line bg-p-card p-6 shadow-[0_4px_24px_rgba(16,24,40,0.05)]">
                  <TextReveal as="h3" className="text-lg font-bold tracking-tight text-p-ink">
                    Care pathway
                  </TextReveal>

                  {patient.courses.length === 0 ? (
                    <p className="mt-6 rounded-2xl bg-p-soft p-5 text-sm text-p-muted">
                      No care programme is enrolled for this patient yet.
                    </p>
                  ) : (
                    <ol className="relative mt-6 list-none space-y-4 pl-9">
                      <span
                        aria-hidden="true"
                        className="absolute bottom-6 left-[7px] top-6 w-px bg-p-accent/30"
                      />
                      {patient.courses.map((course, index) => {
                        const Icon = PROGRAMME_ICONS[index % PROGRAMME_ICONS.length];
                        return (
                          <li key={course.id} className="relative">
                            <span
                              aria-hidden="true"
                              className="absolute -left-9 top-6 grid h-4 w-4 place-items-center rounded-full border-[3px] border-p-card bg-p-accent"
                            />
                            <div className="group flex items-center gap-4 rounded-2xl bg-p-soft/70 p-4 transition-all duration-300 ease-out-soft hover:-translate-y-0.5 hover:bg-p-soft motion-reduce:hover:translate-y-0">
                              <span
                                aria-hidden="true"
                                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-p-card text-p-accent shadow-sm"
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="truncate text-sm font-bold text-p-ink">
                                    {course.title}
                                  </span>
                                  <PPill tone={course.status}>{course.status}</PPill>
                                </span>
                                <span className="mt-1 block truncate text-xs text-p-muted">
                                  {course.detail}
                                </span>
                                <span className="mt-0.5 block text-xs text-p-muted">
                                  {course.modules} modules
                                </span>
                              </span>
                              <span
                                aria-hidden="true"
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-p-card text-p-accent transition-transform duration-300 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                              >
                                →
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                    <ChevronButton href={`/profile/${patient.id}`}>Open profile</ChevronButton>
                    <DownloadButton
                      onDownload={exportVisits}
                      fileLabel="Visit history"
                      className="bg-p-soft px-4 py-2.5 text-p-ink hover:bg-p-soft/70"
                    >
                      Visit history
                    </DownloadButton>
                  </div>
                </section>
              </Reveal>

              <div className="space-y-5">
                <Reveal delay={0.14}>
                  <section
                    id="record-billing"
                    className="scroll-mt-6 rounded-[22px] border border-p-line bg-p-card p-6 shadow-[0_4px_24px_rgba(16,24,40,0.05)]">
                    <TextReveal as="h3" className="text-base font-bold tracking-tight text-p-ink">
                      Billing information
                    </TextReveal>
                    <p className="mt-4 text-xs font-medium text-p-muted">Card on file</p>
                    <p className="mt-2 rounded-xl border border-p-line bg-p-bg px-4 py-3 font-mono text-sm tracking-widest text-p-ink">
                      **** **** **** 4242
                    </p>
                    <ul className="mt-4 grid list-none grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map((method) => (
                        <li
                          key={method}
                          className="rounded-xl border border-p-line bg-p-bg px-3 py-2.5 text-center text-xs font-semibold text-p-ink"
                        >
                          {method}
                        </li>
                      ))}
                    </ul>
                  </section>
                </Reveal>

                <Reveal delay={0.18}>
                  <section className="rounded-[22px] bg-[#2A2340] p-6 text-white shadow-lift">
                    <TextReveal as="h3" className="flex items-center gap-2 text-lg font-bold tracking-tight">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      Care Plan Premium
                    </TextReveal>
                    <ul className="mt-5 list-none space-y-2.5">
                      {CARE_PLAN.map((line) => (
                        <li key={line} className="flex items-start gap-2.5 text-sm text-white/85">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-p-accent2"
                            aria-hidden="true"
                          />
                          {line}
                        </li>
                      ))}
                    </ul>
                    <StretchButton className="mt-6 w-full">Upgrade plan</StretchButton>
                  </section>
                </Reveal>
              </div>
            </div>

            {/* Recent activity */}
            <Reveal delay={0.22}>
              <section
                id="record-activity"
                className="relative scroll-mt-6 overflow-hidden rounded-[22px] border border-p-line bg-p-card p-6 shadow-[0_4px_24px_rgba(16,24,40,0.05)]">
                <TextReveal as="h3" className="text-lg font-bold tracking-tight text-p-ink">
                  Recent activity
                </TextReveal>

                <ul className="mt-5 list-none space-y-2 lg:max-w-[62%]">
                  {patient.activity.map((entry) => {
                    const Icon = ACTIVITY_ICONS[entry.kind] ?? FileText;
                    return (
                      <li key={entry.id}>
                        <div className="group flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors duration-300 hover:bg-p-soft/70">
                          <span
                            aria-hidden="true"
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-p-soft text-p-accent"
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-p-ink">
                              {entry.title}
                            </span>
                            <span className="block truncate text-xs text-p-muted">
                              {entry.detail}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs text-p-muted">{entry.when}</span>
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-p-muted transition-transform duration-300 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                          >
                            →
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Desk illustration */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 260 180"
                  className="pointer-events-none absolute bottom-4 right-4 hidden h-[150px] w-[220px] lg:block"
                >
                  <defs>
                    <linearGradient id="lampG" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#C4B5FD" />
                      <stop offset="100%" stopColor="#8B6FF0" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="130" cy="164" rx="106" ry="12" fill="#EDE7FB" />
                  <rect x="30" y="140" width="96" height="10" rx="5" fill="#D8C9FA" />
                  <rect x="38" y="130" width="80" height="10" rx="5" fill="#F0BBD9" />
                  <path d="M150 148 v-52 l30 -34" stroke="url(#lampG)" strokeWidth="7" fill="none" strokeLinecap="round" />
                  <path d="M168 66 l34 -14 l14 30 l-34 14 z" fill="url(#lampG)" />
                  <rect x="132" y="146" width="40" height="8" rx="4" fill="#8B6FF0" />
                  <path d="M84 128 c-13 -6 -19 -21 -14 -34 c12 5 19 20 16 34 z" fill="#A78BFA" />
                  <path d="M88 128 c11 -8 14 -24 7 -35 c-10 8 -13 23 -9 35 z" fill="#8B6FF0" />
                  <path d="M74 128 h26 l-4 18 h-18 z" fill="#EDE7FB" stroke="#D8C9FA" strokeWidth="1.5" />
                </svg>
              </section>
            </Reveal>
          </main>
        </div>
      </div>
    </div>
  );
}
