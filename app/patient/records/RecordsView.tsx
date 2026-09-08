"use client";

import { useMemo, useState } from "react";
import {
  CreditCard,
  FileText,
  FlaskConical,
  Pill,
  Stethoscope,
} from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import NoticeBell from "@/components/system/NoticeBell";
import { PCard, PPill, Reveal, SectionTitle } from "@/components/portal/ui";
import { DownloadButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { PATIENT_NAV } from "@/lib/portal-nav";
import { SIGNED_IN_PATIENT } from "@/lib/portal-data";
import { REPORTS } from "@/lib/reports-data";
import { downloadCsv, downloadPdf } from "@/lib/downloads";
import { cn } from "@/lib/utils";

type EntryKind = "payment" | "note" | "lab" | "visit" | "prescription";

type TimelineEntry = {
  id: string;
  kind: EntryKind;
  title: string;
  detail: string;
  date: string;
  meta?: string;
};

const KIND_META: Record<EntryKind, { label: string; icon: typeof FileText; tone: string }> = {
  payment: { label: "Payment", icon: CreditCard, tone: "bg-sky-50 text-sky-700" },
  note: { label: "Clinical note", icon: Stethoscope, tone: "bg-violet-50 text-violet-700" },
  lab: { label: "Lab result", icon: FlaskConical, tone: "bg-emerald-50 text-emerald-700" },
  visit: { label: "Visit", icon: FileText, tone: "bg-amber-50 text-amber-700" },
  prescription: { label: "Prescription", icon: Pill, tone: "bg-rose-50 text-rose-700" },
};

const FILTERS: ("all" | EntryKind)[] = [
  "all",
  "visit",
  "note",
  "lab",
  "prescription",
  "payment",
];

export default function RecordsView() {
  const { state } = useClinic();
  const patient = SIGNED_IN_PATIENT;
  const [filter, setFilter] = useState<"all" | EntryKind>("all");

  /** The timeline is assembled from every source that touches this patient. */
  const timeline = useMemo<TimelineEntry[]>(() => {
    const chart = state.charts[patient.id];

    const visits: TimelineEntry[] = patient.visits.map((visit) => ({
      id: `visit-${visit.id}`,
      kind: "visit",
      title: visit.title,
      detail: `${visit.kind} · ${visit.doctor}`,
      date: visit.date,
    }));

    const reports: TimelineEntry[] = REPORTS.filter(
      (report) => report.patientId === patient.id,
    ).map((report) => ({
      id: `report-${report.id}`,
      kind:
        report.kind === "Lab"
          ? "lab"
          : report.kind === "Prescription"
            ? "prescription"
            : "note",
      title: report.title,
      detail: report.summary,
      date: report.issued,
      meta: report.by,
    }));

    const payments: TimelineEntry[] = state.bills
      .filter((bill) => bill.patientName === patient.name)
      .map((bill) => ({
        id: `bill-${bill.id}`,
        kind: "payment",
        title: `Invoice ${bill.id}`,
        detail: `${bill.lines.length} item${bill.lines.length === 1 ? "" : "s"} + consultation · ₹${bill.total.toLocaleString("en-IN")}`,
        date: bill.at,
        meta: bill.doctor,
      }));

    const notes: TimelineEntry[] = chart?.notes
      ? [
          {
            id: "chart-note",
            kind: "note",
            title: "Latest clinical note",
            detail: chart.notes,
            date: "Current",
            meta: patient.doctor,
          },
        ]
      : [];

    return [...notes, ...payments, ...reports, ...visits];
  }, [state.bills, state.charts, patient]);

  const rows = filter === "all" ? timeline : timeline.filter((e) => e.kind === filter);

  return (
    <PortalShell
      theme="care"
      nav={PATIENT_NAV}
      backdrop="aurora"
      title="Medical timeline"
      subtitle={`${timeline.length} entries across visits, notes, labs, prescriptions and payments`}
      user={{ name: patient.name, initials: patient.initials, role: "Patient" }}
      actions={<NoticeBell audience="patient" />}
    >
      <Reveal>
        <PCard>
          <SectionTitle
            title="Complete medical record"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <DownloadButton
                  fileLabel="Timeline CSV"
                  className="bg-p-soft px-4 py-2 text-p-ink hover:bg-p-soft/70"
                  onDownload={() =>
                    downloadCsv(
                      `medical-timeline-${patient.id}`,
                      ["Date", "Type", "Title", "Detail"],
                      timeline.map((entry) => [
                        entry.date,
                        KIND_META[entry.kind].label,
                        entry.title,
                        entry.detail,
                      ]),
                    )
                  }
                >
                  CSV
                </DownloadButton>
                <DownloadButton
                  fileLabel="Medical record PDF"
                  onDownload={() =>
                    downloadPdf(`medical-record-${patient.id}`, {
                      title: "Nexclinic — Medical Record",
                      subtitle: `${patient.name} · ${patient.clinic}`,
                      lines: [
                        `Patient ID: ${patient.id}`,
                        `Date of birth: ${patient.dob}    Blood type: ${patient.bloodType}`,
                        `Clinician: ${patient.doctor}`,
                        "",
                        "Timeline",
                        ...timeline.map(
                          (entry) =>
                            `  ${entry.date} — [${KIND_META[entry.kind].label}] ${entry.title}: ${entry.detail}`,
                        ),
                        "",
                        "Sample output generated in the browser. Not a medical record.",
                      ],
                    })
                  }
                >
                  Full record
                </DownloadButton>
              </div>
            }
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setFilter(entry)}
                aria-pressed={filter === entry}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold capitalize transition-colors duration-200",
                  filter === entry
                    ? "bg-p-grad text-white"
                    : "border border-p-line bg-p-card text-p-muted hover:text-p-ink",
                )}
              >
                {entry === "all" ? "Everything" : KIND_META[entry].label}
              </button>
            ))}
          </div>
        </PCard>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-5">
          <ol className="relative list-none space-y-3 pl-8">
            <span
              aria-hidden="true"
              className="absolute bottom-6 left-[11px] top-6 w-px bg-p-accent/30"
            />
            {rows.map((entry) => {
              const meta = KIND_META[entry.kind];
              const Icon = meta.icon;
              return (
                <li key={entry.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-8 top-6 grid h-6 w-6 place-items-center rounded-full border-[3px] border-p-bg bg-p-accent text-white"
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <PCard>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <p className="text-sm font-bold text-p-ink">{entry.title}</p>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                              meta.tone,
                            )}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-p-muted">
                          {entry.detail}
                        </p>
                        {entry.meta ? (
                          <p className="mt-1 text-xs text-p-muted">{entry.meta}</p>
                        ) : null}
                      </div>
                      <PPill>{entry.date}</PPill>
                    </div>
                  </PCard>
                </li>
              );
            })}

            {rows.length === 0 ? (
              <li>
                <PCard>
                  <p className="py-6 text-center text-sm text-p-muted">
                    No entries of this type yet.
                  </p>
                </PCard>
              </li>
            ) : null}
          </ol>
        </div>
      </Reveal>
    </PortalShell>
  );
}
