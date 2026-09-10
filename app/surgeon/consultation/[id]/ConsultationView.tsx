"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  FileText,
  History,
  MessageCircle,
  Pencil,
  Plus,
  Salad,
  Trash2,
  X,
} from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import BodyVitalsPanel from "@/components/portal/BodyVitalsPanel";
import NoticeBell from "@/components/system/NoticeBell";
import {
  PAvatar,
  PCard,
  PPill,
  Reveal,
  SectionTitle,
} from "@/components/portal/ui";
import { Input, Textarea } from "@/components/ui/input";
import {
  ChevronButton,
  DownloadButton,
  FlyButton,
  MorphButton,
} from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { SURGEON_NAV } from "@/lib/portal-nav";
import { DOCTOR_PROFILE, findPatient } from "@/lib/portal-data";
import { downloadPdf } from "@/lib/downloads";
import type { PatientChart } from "@/lib/clinic-types";

import TextReveal from "@/components/motion/TextReveal";
const EMPTY_CHART: PatientChart = { vitals: [], diet: [], notes: "" };

export default function ConsultationView({ patientId }: { patientId: string }) {
  const { state, dispatch } = useClinic();
  const patient = findPatient(patientId);
  const chart = state.charts[patientId] ?? EMPTY_CHART;

  const [editingVitals, setEditingVitals] = useState(false);
  const [vitalsDraft, setVitalsDraft] = useState(chart.vitals);
  const [dietDraft, setDietDraft] = useState(chart.diet);
  const [newDietLine, setNewDietLine] = useState("");
  const [notes, setNotes] = useState(chart.notes);
  const [sentToWhatsapp, setSentToWhatsapp] = useState(false);

  // Sections inside this container carry `data-region`; the body viewer
  // observes them to fly the camera to whatever the reader is reading.
  const scrollRoot = useRef<HTMLDivElement>(null);

  // Re-sync the drafts whenever the stored chart changes underneath.
  useEffect(() => {
    setVitalsDraft(chart.vitals);
    setDietDraft(chart.diet);
    setNotes(chart.notes);
  }, [chart.vitals, chart.diet, chart.notes]);

  if (!patient) return null;

  const saveVitals = () => {
    dispatch({ type: "chart/vitals", patientId, vitals: vitalsDraft });
    setEditingVitals(false);
  };

  const saveDiet = () => dispatch({ type: "chart/diet", patientId, diet: dietDraft });

  const sendToWhatsapp = () => {
    dispatch({
      type: "notice/push",
      notice: {
        to: "patient",
        kind: "phone",
        title: "Report sent on WhatsApp",
        body: `${patient.name}: your consultation summary from ${DOCTOR_PROFILE.name} is on its way.`,
      },
    });
    setSentToWhatsapp(true);
    window.setTimeout(() => setSentToWhatsapp(false), 3000);
  };

  const downloadSummary = () =>
    downloadPdf(`consultation-${patient.id}`, {
      title: "Nexclinic — Consultation Summary",
      subtitle: `${patient.name} · ${DOCTOR_PROFILE.name}`,
      lines: [
        `Patient ID: ${patient.id}    Age: ${patient.age}    Sex: ${patient.sex}`,
        `Blood type: ${patient.bloodType}`,
        `Presenting: ${patient.condition}`,
        "",
        "Vitals",
        ...chart.vitals.map((vital) => `  ${vital.label}: ${vital.value} ${vital.unit}`),
        "",
        "Clinical note",
        `  ${notes || "—"}`,
        "",
        "Diet plan",
        ...dietDraft.map((line) => `  · ${line}`),
        "",
        "Sample output generated in the browser. Not a medical record.",
      ],
    });

  return (
    <PortalShell
      theme="clinic"
      nav={SURGEON_NAV}
      backdrop="grid"
      title="Consultation"
      subtitle={`${patient.name} · ${patient.condition}`}
      user={{
        name: DOCTOR_PROFILE.name,
        initials: DOCTOR_PROFILE.initials,
        role: DOCTOR_PROFILE.speciality,
      }}
      actions={<NoticeBell audience="surgeon" />}
    >
      {/* ── Demographics ── */}
      <Reveal>
        <PCard>
          <div className="flex flex-wrap items-start gap-5">
            <PAvatar
              initials={patient.initials}
              name={patient.name}
              size="lg"
              index={1}
              className="h-16 w-16 text-base"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <TextReveal as="h2" className="text-2xl font-bold tracking-tight text-p-ink">
                  {patient.name}
                </TextReveal>
                <PPill tone={patient.status}>{patient.status}</PPill>
              </div>
              <p className="mt-1 text-sm text-p-muted">{patient.condition}</p>

              <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
                {[
                  ["Age", `${patient.age}`],
                  ["Sex", patient.sex],
                  ["Blood type", patient.bloodType],
                  ["Weight", `${patient.weightKg} kg`],
                  ["Height", `${patient.heightCm} cm`],
                  ["Phone", patient.phone],
                  ["Registered", patient.registered],
                  ["Clinic", patient.clinic.split("—")[0].trim()],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-p-muted">
                      {label}
                    </dt>
                    <dd className="mt-0.5 truncate text-sm font-medium text-p-ink">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-p-line pt-5">
            <ChevronButton href={`/patients/${patient.id}`}>
              <History className="h-4 w-4" aria-hidden="true" />
              View full patient history
            </ChevronButton>

            <FlyButton
              onClick={sendToWhatsapp}
              icon={<MessageCircle className="h-4 w-4" />}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Send report to WhatsApp
            </FlyButton>

            <DownloadButton onDownload={downloadSummary} fileLabel="Consultation summary">
              Summary PDF
            </DownloadButton>

            {sentToWhatsapp ? (
              <span
                role="status"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Sent to {patient.phone}
              </span>
            ) : null}
          </div>
        </PCard>
      </Reveal>

      <div
        ref={scrollRoot}
        className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]"
      >
        <div className="min-w-0 space-y-5">
          {/* ── Vitals ── */}
          <section data-region="chest">
            <Reveal delay={0.05}>
              <PCard>
                <SectionTitle
                  title="Vitals"
                  action={
                    editingVitals ? (
                      <span className="flex items-center gap-2">
                        <MorphButton doneLabel="Saved" onClick={saveVitals}>
                          Save vitals
                        </MorphButton>
                        <button
                          type="button"
                          onClick={() => {
                            setVitalsDraft(chart.vitals);
                            setEditingVitals(false);
                          }}
                          aria-label="Cancel editing vitals"
                          className="grid h-9 w-9 place-items-center rounded-full border border-p-line text-p-muted transition-colors hover:text-p-ink"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingVitals(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-p-line px-4 py-2 text-sm font-medium text-p-ink transition-colors hover:border-p-accent/50"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </button>
                    )
                  }
                />

                <ul className="mt-4 grid list-none grid-cols-2 gap-3 lg:grid-cols-3">
                  {vitalsDraft.map((vital, index) => (
                    <li key={vital.id} className="rounded-2xl bg-p-soft px-4 py-3">
                      <p className="text-[11px] font-medium text-p-muted">{vital.label}</p>
                      {editingVitals ? (
                        <Input
                          aria-label={vital.label}
                          value={vital.value}
                          onChange={(event) =>
                            setVitalsDraft(
                              vitalsDraft.map((entry, position) =>
                                position === index
                                  ? { ...entry, value: event.target.value }
                                  : entry,
                              ),
                            )
                          }
                          className="mt-1 h-10 bg-white text-base"
                        />
                      ) : (
                        <p className="mt-1 text-xl font-bold tabular-nums text-p-ink">
                          {vital.value}
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-p-muted">{vital.unit}</p>
                    </li>
                  ))}
                </ul>
              </PCard>
            </Reveal>
          </section>

          {/* ── Medical records ── */}
          <section data-region="full">
            <Reveal delay={0.1}>
              <PCard>
                <SectionTitle
                  title="Medical records"
                  action={
                    <ChevronButton href={`/patients/${patient.id}`}>Full record</ChevronButton>
                  }
                />
                <ul className="mt-4 list-none space-y-2.5">
                  {patient.visits.map((visit) => (
                    <li
                      key={visit.id}
                      className="flex flex-wrap items-center gap-3 rounded-2xl border border-p-line px-4 py-3"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-p-soft text-p-accent">
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-p-ink">
                          {visit.title}
                        </span>
                        <span className="block truncate text-xs text-p-muted">
                          {visit.doctor} · {visit.kind}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-p-muted">{visit.date}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  <label
                    htmlFor="clinical-note"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-p-muted"
                  >
                    Clinical note
                  </label>
                  <Textarea
                    id="clinical-note"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="min-h-28"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <MorphButton
                      doneLabel="Note saved"
                      onClick={() => dispatch({ type: "chart/notes", patientId, notes })}
                    >
                      <Activity className="h-4 w-4" aria-hidden="true" />
                      Save note
                    </MorphButton>
                    <Link
                      href="/surgeon/scribe"
                      className="text-sm font-medium text-p-accent underline-offset-4 hover:underline"
                    >
                      Draft it with the AI scribe →
                    </Link>
                  </div>
                </div>
              </PCard>
            </Reveal>
          </section>

          {/* ── Diet plan ── */}
          <section data-region="abdomen">
          <Reveal delay={0.14}>
            <PCard className="h-full">
              <SectionTitle
                title="Diet plan"
                action={
                  <MorphButton
                    doneLabel="Plan saved"
                    disabled={JSON.stringify(dietDraft) === JSON.stringify(chart.diet)}
                    onClick={saveDiet}
                  >
                    <Salad className="h-4 w-4" aria-hidden="true" />
                    Save plan
                  </MorphButton>
                }
              />

              <ul className="mt-4 list-none space-y-2">
                {dietDraft.map((line, index) => (
                  <li key={`${line}-${index}`} className="flex items-start gap-2">
                    <Input
                      aria-label={`Diet line ${index + 1}`}
                      value={line}
                      onChange={(event) =>
                        setDietDraft(
                          dietDraft.map((entry, position) =>
                            position === index ? event.target.value : entry,
                          ),
                        )
                      }
                      className="h-11 flex-1 text-sm"
                    />
                    <button
                      type="button"
                      aria-label={`Remove diet line ${index + 1}`}
                      onClick={() =>
                        setDietDraft(dietDraft.filter((_, position) => position !== index))
                      }
                      className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-p-line text-p-muted transition-colors hover:border-rose-300 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
                {dietDraft.length === 0 ? (
                  <li className="rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
                    No diet plan recorded yet.
                  </li>
                ) : null}
              </ul>

              <form
                className="mt-4 flex items-start gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!newDietLine.trim()) return;
                  setDietDraft([...dietDraft, newDietLine.trim()]);
                  setNewDietLine("");
                }}
              >
                <Input
                  aria-label="New diet instruction"
                  value={newDietLine}
                  onChange={(event) => setNewDietLine(event.target.value)}
                  placeholder="Add an instruction"
                  className="h-11 flex-1 text-sm"
                />
                <button
                  type="submit"
                  aria-label="Add diet instruction"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-p-grad text-white transition-transform duration-300 hover:scale-105 motion-reduce:hover:scale-100"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </PCard>
            </Reveal>
          </section>
        </div>

        {/* ── 3D body viewer ── */}
        <div className="min-w-0 xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
          <BodyVitalsPanel
            patientId={patient.id}
            scrollRootRef={scrollRoot}
            className="h-full"
            caption="Scroll, hover or click a region"
          />
        </div>
      </div>
    </PortalShell>
  );
}
