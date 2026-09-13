"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Activity,
  CalendarClock,
  Clock,
  FileText,
  Mic,
  Play,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import {
  PAvatar,
  PCard,
  PLinkCard,
  PPill,
  Reveal,
  SectionTitle,
} from "@/components/portal/ui";
import NoticeBell from "@/components/system/NoticeBell";
import { EcgHeartbeatBackdrop } from "@/components/surgeon/EcgHeartbeatBackdrop";
import {
  ChevronButton,
  ConicButton,
  DownloadButton,
  StretchButton,
} from "@/components/motion-ui/buttons";
import { useClinic, sortQueue } from "@/lib/clinic-store";
import { SURGEON_NAV } from "@/lib/portal-nav";
import { DOCTOR_PROFILE, PATIENTS } from "@/lib/portal-data";
import { downloadCsv } from "@/lib/downloads";
import { cn } from "@/lib/utils";


// 3.2 MB of model and a WebGL context — kept out of the server bundle and
// off the critical path.
const HeartBeat = dynamic(() => import("@/components/three/HeartBeat"), {
  ssr: false,
  loading: () => null,
});
const QUICK_ACTIONS = [
  {
    label: "AI Scribe",
    detail: "Draft clinical notes from the consultation",
    href: "/surgeon/scribe",
    icon: Mic,
  },
  {
    label: "Today's appointments",
    detail: "The full approved list for today",
    href: "/surgeon/patients",
    icon: CalendarClock,
  },
  {
    label: "Report history",
    detail: "Everything issued per patient",
    href: "/surgeon/reports",
    icon: FileText,
  },
];

export default function SurgeonDashboard() {
  const { state } = useClinic();
  const [query, setQuery] = useState("");

  const queue = sortQueue(state.queue);
  const nextUp = queue.find((entry) => entry.state !== "done") ?? queue[0];

  const todaysAppointments = state.appointments.filter(
    (entry) => entry.status === "approved",
  );
  const activePatients = queue.filter((entry) => entry.state !== "done").length;
  const avgWait = queue.length
    ? Math.round(
        queue.reduce((sum, entry) => sum + entry.waitMinutes, 0) / queue.length,
      )
    : 0;

  // Search runs over the whole patient database, not just today's list.
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return PATIENTS.filter(
      (patient) =>
        patient.name.toLowerCase().includes(needle) ||
        patient.condition.toLowerCase().includes(needle) ||
        patient.id.toLowerCase().includes(needle),
    );
  }, [query]);

  const stats = [
    {
      label: "Today's appointments",
      value: String(todaysAppointments.length),
      icon: CalendarClock,
      href: "/surgeon/patients",
    },
    {
      label: "Active patients",
      value: String(activePatients),
      icon: Users,
      href: "/surgeon/patients",
    },
    {
      label: "Average wait time",
      value: `${avgWait} min`,
      icon: Clock,
      href: "/reception/dashboard",
    },
  ];

  const exportList = () =>
    downloadCsv(
      "todays-list",
      ["Token", "Patient", "Reason", "Priority", "State"],
      queue.map((entry) => [
        entry.token,
        entry.name,
        entry.reason,
        entry.priority,
        entry.state,
      ]),
    );

  return (
    <PortalShell
      theme="clinic"
      nav={SURGEON_NAV}
      backdrop="grid"
      title={`Welcome, ${DOCTOR_PROFILE.name}`}
      subtitle={`${DOCTOR_PROFILE.speciality} · ${activePatients} waiting`}
      user={{
        id: DOCTOR_PROFILE.id,
        name: DOCTOR_PROFILE.name,
        initials: DOCTOR_PROFILE.initials,
        role: DOCTOR_PROFILE.speciality,
        email: DOCTOR_PROFILE.email,
      }}
      actions={<NoticeBell audience="surgeon" />}
    >
      <div className="relative isolate">
        <EcgHeartbeatBackdrop />

        {/* ── Patient database search ── */}
        <Reveal>
        <PCard>
          <label htmlFor="patient-search" className="sr-only">
            Search the patient database
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-p-muted"
              aria-hidden="true"
            />
            <input
              id="patient-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the patient database by name, ID or condition"
              className="h-12 w-full rounded-full border border-p-line bg-p-card pl-11 pr-4 text-sm text-p-ink placeholder:text-p-muted focus:border-p-accent focus:outline-none"
            />
          </div>

          {query.trim() ? (
            <ul className="mt-4 list-none space-y-2" aria-live="polite">
              {results.length === 0 ? (
                <li className="rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
                  No patient matches “{query}”.
                </li>
              ) : (
                results.map((patient, index) => (
                  <li key={patient.id}>
                    <Link
                      href={`/patients/${patient.id}`}
                      className="group flex items-center gap-3 rounded-2xl border border-p-line px-4 py-3 transition-all duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-p-accent/40 motion-reduce:hover:translate-y-0"
                    >
                      <PAvatar
                        initials={patient.initials}
                        name={patient.name}
                        index={index}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-p-ink">
                          {patient.name}
                        </span>
                        <span className="block truncate text-xs text-p-muted">
                          {patient.id} · {patient.condition}
                        </span>
                      </span>
                      <PPill tone={patient.status}>{patient.status}</PPill>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </PCard>
      </Reveal>

      {/* ── Stat tabs ── */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Reveal key={stat.label} delay={index * 0.07}>
              <PLinkCard href={stat.href} label={`${stat.label}: ${stat.value}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-p-muted">{stat.label}</p>
                  <Icon className="h-4 w-4 shrink-0 text-p-accent" aria-hidden="true" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-p-ink">
                  {stat.value}
                </p>
              </PLinkCard>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-5">
          {/* ── Next up ── */}
          {nextUp ? (
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden rounded-[24px] bg-p-grad p-6 text-white shadow-lift md:p-8 md:pr-[210px] lg:pr-[230px]">
                <div
                  aria-hidden="true"
                  className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
                />

                <HeartBeat className="absolute right-3 top-1/2 hidden h-[170px] w-[170px] -translate-y-1/2 cursor-grab active:cursor-grabbing md:block lg:right-6" />

                <div className="relative flex flex-wrap items-center justify-between gap-5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                      Next up · first patient
                    </p>
                    <p className="mt-2 truncate text-2xl font-bold tracking-tight md:text-3xl">
                      {nextUp.name}
                    </p>
                    <p className="mt-1 text-sm text-white/85">
                      {nextUp.reason} · token {nextUp.token} · {nextUp.priority} priority
                    </p>
                  </div>

                  <StretchButton
                    href={`/surgeon/consultation/${nextUp.patientId ?? "p-1001"}`}
                    className="bg-white dark:bg-p-card !text-[#1B1C46]"
                  >
                    <span className="flex items-center gap-2">
                      <Play className="h-4 w-4" aria-hidden="true" />
                      Start consultation
                    </span>
                  </StretchButton>

                </div>
              </div>
            </Reveal>
          ) : null}

          {/* ── Today's list ── */}
          <Reveal delay={0.14}>
            <PCard>
              <SectionTitle
                title="Today's list"
                action={
                  <DownloadButton
                    onDownload={exportList}
                    fileLabel="Today's list CSV"
                    className="bg-p-soft px-4 py-2 text-p-ink hover:bg-p-soft/70"
                  >
                    Export
                  </DownloadButton>
                }
              />
              <ul className="mt-4 list-none space-y-2.5">
                {queue.map((entry, index) => (
                  <li key={entry.id}>
                    <Link
                      href={`/surgeon/consultation/${entry.patientId ?? "p-1001"}`}
                      className={cn(
                        "group flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ease-out-soft hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
                        entry.state === "in-consult"
                          ? "border-p-accent/50 bg-p-soft"
                          : "border-p-line bg-p-card hover:border-p-accent/40",
                      )}
                    >
                      <span className="grid h-9 w-11 shrink-0 place-items-center rounded-xl bg-p-soft text-xs font-bold text-p-accent">
                        {entry.token}
                      </span>
                      <PAvatar
                        initials={entry.initials}
                        name={entry.name}
                        index={index}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-p-ink">
                          {entry.name}
                        </span>
                        <span className="block truncate text-xs text-p-muted">
                          {entry.reason}
                        </span>
                      </span>
                      <PPill tone={entry.priority === "high" ? "Critical" : entry.priority === "medium" ? "Follow-up" : "Stable"}>
                        {entry.priority}
                      </PPill>
                      <span className="shrink-0 text-xs font-medium text-p-muted">
                        {entry.waitMinutes} min
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </PCard>
          </Reveal>
        </div>

        {/* ── Quick actions ── */}
        <div className="min-w-0 space-y-5">
          <Reveal delay={0.12}>
            <PCard>
              <SectionTitle title="Quick action" />
              <ul className="mt-4 list-none space-y-2.5">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <li key={action.label}>
                      <Link
                        href={action.href}
                        className="group flex items-center gap-3 rounded-2xl border border-p-line px-4 py-3 transition-all duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-p-accent/40 motion-reduce:hover:translate-y-0"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-p-soft text-p-accent">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-p-ink">
                            {action.label}
                          </span>
                          <span className="block truncate text-xs text-p-muted">
                            {action.detail}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-p-muted transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <ConicButton href="/surgeon/scribe" className="mt-5 w-full">
                <Mic className="h-4 w-4" aria-hidden="true" />
                Open AI scribe
              </ConicButton>
            </PCard>
          </Reveal>

          <Reveal delay={0.16}>
            <PCard>
              <SectionTitle
                title="Approved appointments"
                action={<ChevronButton href="/surgeon/patients">All patients</ChevronButton>}
              />
              <ul className="mt-4 list-none space-y-3">
                {todaysAppointments.slice(0, 5).map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-p-soft text-p-accent">
                      <Stethoscope className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-p-ink">
                        {entry.patientName}
                      </span>
                      <span className="block truncate text-xs text-p-muted">
                        {entry.reason}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-p-muted">
                      {entry.time}
                    </span>
                  </li>
                ))}
                {todaysAppointments.length === 0 ? (
                  <li className="rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
                    Nothing approved yet — the front desk confirms requests.
                  </li>
                ) : null}
              </ul>
            </PCard>
          </Reveal>

          <Reveal delay={0.2}>
            <PLinkCard href="/surgeon/reports" label="Open report history">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-p-muted">
                    Reports
                  </p>
                  <p className="mt-2 text-lg font-bold tracking-tight text-p-ink">
                    Recent report history
                  </p>
                  <p className="mt-1 text-sm text-p-muted">
                    Everything issued, per patient.
                  </p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-p-grad text-white transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100">
                  <Activity className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </PLinkCard>
          </Reveal>
        </div>
        </div>
      </div>
    </PortalShell>
  );
}
