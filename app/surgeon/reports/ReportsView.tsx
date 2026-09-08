"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, FlaskConical, Pill, Scan, Search, Stethoscope } from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import NoticeBell from "@/components/system/NoticeBell";
import {
  PAvatar,
  PCard,
  PPill,
  Reveal,
  SectionTitle,
} from "@/components/portal/ui";
import { ChevronButton, DownloadButton } from "@/components/motion-ui/buttons";
import { SURGEON_NAV } from "@/lib/portal-nav";
import { DOCTOR_PROFILE, PATIENTS } from "@/lib/portal-data";
import { REPORTS, REPORT_KINDS } from "@/lib/reports-data";
import { downloadCsv, downloadPdf } from "@/lib/downloads";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<string, typeof FileText> = {
  Lab: FlaskConical,
  Imaging: Scan,
  Discharge: FileText,
  Consultation: Stethoscope,
  Prescription: Pill,
};

export default function ReportsView() {
  const [patientId, setPatientId] = useState("all");
  const [kind, setKind] = useState("All types");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return REPORTS.filter((report) => {
      if (patientId !== "all" && report.patientId !== patientId) return false;
      if (kind !== "All types" && report.kind !== kind) return false;
      if (!needle) return true;
      return (
        report.title.toLowerCase().includes(needle) ||
        report.patient.toLowerCase().includes(needle) ||
        report.summary.toLowerCase().includes(needle)
      );
    });
  }, [patientId, kind, query]);

  return (
    <PortalShell
      theme="clinic"
      nav={SURGEON_NAV}
      backdrop="grid"
      title="Reports"
      subtitle={`${REPORTS.length} reports issued across ${PATIENTS.length} patients`}
      user={{
        name: DOCTOR_PROFILE.name,
        initials: DOCTOR_PROFILE.initials,
        role: DOCTOR_PROFILE.speciality,
      }}
      actions={<NoticeBell audience="surgeon" />}
    >
      {/* ── Patient filter row ── */}
      <Reveal>
        <PCard>
          <SectionTitle
            title="Recent report history"
            action={
              <DownloadButton
                fileLabel="Report index CSV"
                className="bg-p-soft px-4 py-2 text-p-ink hover:bg-p-soft/70"
                onDownload={() =>
                  downloadCsv(
                    "report-history",
                    ["Reference", "Patient", "Report", "Type", "Issued", "By"],
                    rows.map((row) => [
                      row.id,
                      row.patient,
                      row.title,
                      row.kind,
                      row.issued,
                      row.by,
                    ]),
                  )
                }
              >
                Export index
              </DownloadButton>
            }
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPatientId("all")}
              aria-pressed={patientId === "all"}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200",
                patientId === "all"
                  ? "bg-p-grad text-white"
                  : "border border-p-line bg-p-card text-p-muted hover:text-p-ink",
              )}
            >
              All patients
            </button>
            {PATIENTS.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => setPatientId(patient.id)}
                aria-pressed={patientId === patient.id}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-200",
                  patientId === patient.id
                    ? "bg-p-grad text-white"
                    : "border border-p-line bg-p-card text-p-muted hover:text-p-ink",
                )}
              >
                {patient.name.split(" ")[0]}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
            <div className="relative">
              <label htmlFor="report-search" className="sr-only">
                Search reports
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-p-muted"
                aria-hidden="true"
              />
              <input
                id="report-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reports"
                className="h-11 w-full rounded-full border border-p-line bg-p-card pl-11 pr-4 text-sm text-p-ink placeholder:text-p-muted focus:border-p-accent focus:outline-none"
              />
            </div>
            <label className="block">
              <span className="sr-only">Filter by report type</span>
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value)}
                aria-label="Filter by report type"
                className="h-11 w-full rounded-full border border-p-line bg-p-card px-4 text-sm text-p-ink focus:border-p-accent focus:outline-none"
              >
                {REPORT_KINDS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
        </PCard>
      </Reveal>

      {/* ── Report list ── */}
      <Reveal delay={0.05}>
        <ul className="mt-5 grid list-none grid-cols-1 gap-4 lg:grid-cols-2">
          {rows.map((report, index) => {
            const Icon = KIND_ICON[report.kind] ?? FileText;
            const patient = PATIENTS.find((entry) => entry.id === report.patientId);
            return (
              <li key={report.id}>
                <PCard className="h-full">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-p-soft text-p-accent"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-p-ink">
                        {report.title}
                      </p>
                      <p className="truncate text-xs text-p-muted">
                        {report.id} · {report.issued} · {report.by}
                      </p>
                    </div>
                    <PPill>{report.kind}</PPill>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-p-muted">
                    {report.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-p-line pt-4">
                    <Link
                      href={`/patients/${report.patientId}`}
                      className="flex min-w-0 items-center gap-2.5"
                    >
                      {patient ? (
                        <PAvatar
                          initials={patient.initials}
                          name={patient.name}
                          index={index}
                          size="sm"
                        />
                      ) : null}
                      <span className="truncate text-xs font-semibold text-p-ink hover:underline">
                        {report.patient}
                      </span>
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                      <DownloadButton
                        fileLabel={report.title}
                        className="bg-p-soft px-3.5 py-2 text-xs text-p-ink hover:bg-p-soft/70"
                        onDownload={() =>
                          downloadPdf(`report-${report.id}`, {
                            title: `Nexclinic — ${report.title}`,
                            subtitle: `${report.patient} · ${report.issued}`,
                            lines: [
                              `Reference: ${report.id}`,
                              `Type: ${report.kind}`,
                              `Reported by: ${report.by}`,
                              "",
                              "Summary",
                              `  ${report.summary}`,
                              "",
                              "Sample output generated in the browser. Not a clinical report.",
                            ],
                          })
                        }
                      >
                        PDF
                      </DownloadButton>
                      <ChevronButton
                        href={`/surgeon/consultation/${report.patientId}`}
                        className="px-3.5 py-2 text-xs"
                      >
                        Open
                      </ChevronButton>
                    </div>
                  </div>
                </PCard>
              </li>
            );
          })}

          {rows.length === 0 ? (
            <li className="lg:col-span-2">
              <PCard>
                <p className="py-6 text-center text-sm text-p-muted">
                  No reports match these filters.
                </p>
              </PCard>
            </li>
          ) : null}
        </ul>
      </Reveal>
    </PortalShell>
  );
}
