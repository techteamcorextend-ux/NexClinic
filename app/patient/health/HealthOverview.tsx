"use client";

import Image from "next/image";
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  Settings,
  Stethoscope,
  User,
  Video,
} from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import { PAvatar, PCard, Reveal, SectionTitle } from "@/components/portal/ui";
import {
  ConicButton,
  DownloadButton,
  ExpandButton,
  StretchButton,
} from "@/components/motion-ui/buttons";
import { SIGNED_IN_PATIENT } from "@/lib/portal-data";
import { downloadPdf } from "@/lib/downloads";

import TextReveal from "@/components/motion/TextReveal";
const NAV = [
  { label: "Dashboard", href: "/patient", icon: LayoutGrid },
  { label: "Health overview", href: "/patient/health", icon: HeartPulse },
  { label: "My records", href: "/patients/p-1001", icon: User },
  { label: "Statistics", href: "/patient", icon: BarChart3 },
  { label: "Notifications", href: "/patient", icon: Bell },
  { label: "Settings", href: "/patient", icon: Settings },
];

/* A fixed month keeps the server and client markup identical. */
const MONTH_LABEL = "April 2026";
const LEADING_BLANKS = 3; // 1 April 2026 falls on a Wednesday
const DAYS_IN_MONTH = 30;
const HIGHLIGHT_DAY = 24;

const VISIT_ICONS = [FlaskConical, Stethoscope, Video];
const VISIT_TONES = [
  "from-emerald-400/30 to-emerald-500/10 text-emerald-300",
  "from-fuchsia-400/30 to-fuchsia-500/10 text-fuchsia-300",
  "from-sky-400/30 to-sky-500/10 text-sky-300",
];

export default function HealthOverview() {
  const patient = SIGNED_IN_PATIENT;

  const downloadCardiacReport = () =>
    downloadPdf(`nexclinic-cardiac-overview-${patient.id}`, {
      title: "Nexclinic — Cardiac Overview",
      subtitle: `${patient.name} · ${patient.doctor}`,
      lines: [
        "Imaging: contrast-enhanced cardiac study",
        "Reported finding: no acute abnormality (sample text)",
        "",
        "Vitals at the time of study",
        ...patient.vitals.map((vital) => `  ${vital.label}: ${vital.value} ${vital.unit}`),
        "",
        "This week's visits",
        ...patient.visits.map((visit) => `  ${visit.date} — ${visit.title}`),
        "",
        "Sample output generated in the browser. Not a diagnostic report.",
      ],
    });

  return (
    <PortalShell
      theme="night"
      nav={NAV}
      backdrop="aurora"
      title="Overview"
      subtitle="Patient health · cardiac study and this week's care"
      user={{ name: patient.name, initials: patient.initials, role: "Patient" }}
      actions={
        <DownloadButton
          onDownload={downloadCardiacReport}
          fileLabel="Cardiac overview"
          className="bg-white dark:bg-p-card text-[#101820] hover:bg-white/90"
        >
          Report
        </DownloadButton>
      }
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
        {/* ── Cardiac study ── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[26px] p-glass">
            <div className="flex flex-wrap items-start justify-between gap-4 p-6">
              <div>
                <TextReveal as="h2" className="text-3xl font-bold leading-tight tracking-tight text-p-ink">
                  Overview
                  <span className="block text-p-grad">Patient Health</span>
                </TextReveal>
                <p className="mt-2 max-w-sm text-sm text-p-muted">
                  Contrast-enhanced cardiac study, reviewed by {patient.doctor}.
                </p>
              </div>

              {/* Recovery ring */}
              <div className="relative grid h-20 w-20 shrink-0 place-items-center">
                <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="22" cy="22" r="19" fill="none" stroke="rgb(var(--p-line))" strokeWidth="4" />
                  <circle
                    cx="22"
                    cy="22"
                    r="19"
                    fill="none"
                    stroke="rgb(var(--p-accent))"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="119.4"
                    strokeDashoffset="107"
                  />
                </svg>
                <span className="text-sm font-bold text-p-ink">5%</span>
                <span className="sr-only">Recovery programme 5 percent complete</span>
              </div>
            </div>

            <div className="relative mx-6 mb-6 overflow-hidden rounded-[20px]">
              <Image
                src="/images/heart.jpg"
                alt="Contrast rendering of the heart and surrounding vessels from the patient's cardiac study."
                width={720}
                height={1280}
                sizes="(min-width: 1280px) 45vw, 100vw"
                className="h-[320px] w-full object-cover object-[50%_38%] md:h-[420px]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0E1016]/85 via-[#0E1016]/10 to-transparent"
              />

              {/* Floating readings over the study */}
              <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                Heart ring · {patient.vitals[0].value} {patient.vitals[0].unit}
              </span>

              <span className="absolute bottom-4 left-4 rounded-2xl bg-black/45 px-4 py-3 text-white backdrop-blur-md">
                <span className="block text-[11px] font-medium text-white/70">SpO₂</span>
                <span className="block text-xl font-bold">98.5 %</span>
              </span>

              <span className="absolute bottom-4 right-4 hidden rounded-2xl bg-black/45 px-4 py-3 text-white backdrop-blur-md sm:block">
                <span className="block text-[11px] font-medium text-white/70">
                  Monday 10:00 – 11:30
                </span>
                <span className="block text-sm font-semibold">Pulmonary Doctor</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 px-6 pb-6">
              <ConicButton href="/patients/p-1001">Open full record</ConicButton>
              <ExpandButton className="text-white">Share</ExpandButton>
            </div>
          </div>
        </Reveal>

        {/* ── Right rail ── */}
        <div className="min-w-0 space-y-5">
          <Reveal delay={0.05}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <PCard variant="glass">
                <p className="text-xs font-medium text-p-muted">Next reading due</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-p-ink">6:41 PM</p>
                <p className="mt-1 text-xs text-p-muted">Evening blood-pressure check</p>
              </PCard>

              {/* Calendar */}
              <PCard variant="glass">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-p-ink">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {MONTH_LABEL}
                  </span>
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Previous month"
                      className="grid h-7 w-7 place-items-center rounded-full text-p-muted transition-colors hover:bg-white/10 hover:text-p-ink"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next month"
                      className="grid h-7 w-7 place-items-center rounded-full text-p-muted transition-colors hover:bg-white/10 hover:text-p-ink"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <span
                      key={`${day}-${index}`}
                      aria-hidden="true"
                      className="py-1 text-[10px] font-semibold uppercase tracking-wider text-p-muted"
                    >
                      {day}
                    </span>
                  ))}
                  {Array.from({ length: LEADING_BLANKS }).map((_, index) => (
                    <span key={`blank-${index}`} aria-hidden="true" />
                  ))}
                  {Array.from({ length: DAYS_IN_MONTH }).map((_, index) => {
                    const day = index + 1;
                    const highlighted = day === HIGHLIGHT_DAY;
                    return (
                      <button
                        key={day}
                        type="button"
                        aria-label={`${day} ${MONTH_LABEL}${highlighted ? " — appointment booked" : ""}`}
                        aria-pressed={highlighted}
                        className={
                          highlighted
                            ? "grid h-8 place-items-center rounded-full bg-p-grad text-xs font-bold text-white"
                            : "grid h-8 place-items-center rounded-full text-xs text-p-muted transition-colors hover:bg-white/10 hover:text-p-ink"
                        }
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </PCard>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <PCard variant="glass">
              <div className="flex items-center gap-3">
                <PAvatar initials="PN" name={patient.doctor} size="md" index={2} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-p-ink">
                    {patient.doctor}
                  </p>
                  <p className="truncate text-xs text-p-muted">Cardiologist</p>
                </div>
              </div>
              <StretchButton className="mt-4 w-full">
                <span className="flex items-center gap-2">
                  <Video className="h-4 w-4" aria-hidden="true" />
                  Video call
                </span>
              </StretchButton>
            </PCard>
          </Reveal>
        </div>
      </div>

      {/* ── In-week visits ── */}
      <Reveal delay={0.14}>
        <section className="mt-5">
          <SectionTitle title="In-Week Visits" />
          <ul className="mt-4 grid list-none grid-cols-1 gap-4 md:grid-cols-3">
            {patient.visits.map((visit, index) => {
              const Icon = VISIT_ICONS[index % VISIT_ICONS.length];
              return (
                <li key={visit.id}>
                  <PCard variant="glass" className="h-full transition-transform duration-300 ease-out-soft hover:-translate-y-1 motion-reduce:hover:translate-y-0">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${VISIT_TONES[index % VISIT_TONES.length]}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-medium text-p-muted">{visit.date}</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold leading-snug text-p-ink">
                      {visit.title}
                    </p>
                    <p className="mt-2 text-xs text-p-muted">{visit.doctor}</p>
                  </PCard>
                </li>
              );
            })}
          </ul>
        </section>
      </Reveal>
    </PortalShell>
  );
}
