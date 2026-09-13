"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, Play, Search } from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import NoticeBell from "@/components/system/NoticeBell";
import {
  PAvatar,
  PCard,
  PPill,
  Reveal,
  SectionTitle,
} from "@/components/portal/ui";
import {
  ChevronButton,
  DownloadButton,
  StretchButton,
} from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { SURGEON_NAV } from "@/lib/portal-nav";
import { DOCTOR_PROFILE, PATIENTS } from "@/lib/portal-data";
import { downloadCsv } from "@/lib/downloads";

export default function PatientsView() {
  const { state } = useClinic();
  const [query, setQuery] = useState("");

  const approved = state.appointments.filter((entry) => entry.status === "approved");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return PATIENTS;
    return PATIENTS.filter(
      (patient) =>
        patient.name.toLowerCase().includes(needle) ||
        patient.condition.toLowerCase().includes(needle) ||
        patient.id.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <PortalShell
      theme="clinic"
      nav={SURGEON_NAV}
      backdrop="grid"
      title="Patient database"
      subtitle={`${PATIENTS.length} patients · ${approved.length} appointments approved`}
      user={{
        id: DOCTOR_PROFILE.id,
        name: DOCTOR_PROFILE.name,
        initials: DOCTOR_PROFILE.initials,
        role: DOCTOR_PROFILE.speciality,
        email: DOCTOR_PROFILE.email,
      }}
      actions={<NoticeBell audience="surgeon" />}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-5">
          <Reveal>
            <PCard>
              <SectionTitle
                title="All patients"
                action={
                  <DownloadButton
                    fileLabel="Patient list CSV"
                    className="bg-p-soft px-4 py-2 text-p-ink hover:bg-p-soft/70"
                    onDownload={() =>
                      downloadCsv(
                        "patient-database",
                        ["ID", "Name", "Age", "Sex", "Blood type", "Condition", "Status"],
                        PATIENTS.map((patient) => [
                          patient.id,
                          patient.name,
                          patient.age,
                          patient.sex,
                          patient.bloodType,
                          patient.condition,
                          patient.status,
                        ]),
                      )
                    }
                  >
                    Export
                  </DownloadButton>
                }
              />

              <div className="relative mt-4">
                <label htmlFor="db-search" className="sr-only">
                  Search patients
                </label>
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-p-muted"
                  aria-hidden="true"
                />
                <input
                  id="db-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, ID or condition"
                  className="h-11 w-full rounded-full border border-p-line bg-p-card pl-11 pr-4 text-sm text-p-ink placeholder:text-p-muted focus:border-p-accent focus:outline-none"
                />
              </div>

              <ul className="mt-4 list-none space-y-2.5">
                {rows.map((patient, index) => (
                  <li key={patient.id}>
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-p-line px-4 py-3">
                      <PAvatar
                        initials={patient.initials}
                        name={patient.name}
                        index={index}
                        size="sm"
                      />
                      <Link
                        href={`/patients/${patient.id}`}
                        className="min-w-0 flex-1 hover:underline"
                      >
                        <span className="block truncate text-sm font-semibold text-p-ink">
                          {patient.name}
                        </span>
                        <span className="block truncate text-xs text-p-muted">
                          {patient.id} · {patient.age} yrs · {patient.condition}
                        </span>
                      </Link>
                      <PPill tone={patient.status}>{patient.status}</PPill>
                      <StretchButton
                        href={`/surgeon/consultation/${patient.id}`}
                        className="px-4 py-2.5 text-xs"
                      >
                        <span className="flex items-center gap-1.5">
                          <Play className="h-3.5 w-3.5" aria-hidden="true" />
                          Start
                        </span>
                      </StretchButton>
                    </div>
                  </li>
                ))}
                {rows.length === 0 ? (
                  <li className="rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
                    No patient matches “{query}”.
                  </li>
                ) : null}
              </ul>
            </PCard>
          </Reveal>
        </div>

        {/* ── Today's approved appointments ── */}
        <Reveal delay={0.06}>
          <PCard className="h-full">
            <SectionTitle
              title="Today's appointments"
              action={<ChevronButton href="/reception/requests">Requests</ChevronButton>}
            />
            <ul className="mt-4 list-none space-y-2.5">
              {approved.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-2xl border border-p-line px-4 py-3"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-p-soft text-p-accent">
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-p-ink">
                      {entry.patientName}
                    </span>
                    <span className="block truncate text-xs text-p-muted">
                      {entry.reason} · {entry.doctor}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-p-muted">
                    {entry.date} {entry.time}
                  </span>
                </li>
              ))}
              {approved.length === 0 ? (
                <li className="rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
                  Nothing approved yet. The front desk confirms incoming requests.
                </li>
              ) : null}
            </ul>
          </PCard>
        </Reveal>
      </div>
    </PortalShell>
  );
}
