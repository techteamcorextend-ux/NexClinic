"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Sparkles, Square, Waves } from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import NoticeBell from "@/components/system/NoticeBell";
import { PAvatar, PCard, Reveal, SectionTitle } from "@/components/portal/ui";
import { Textarea } from "@/components/ui/input";
import {
  ChevronButton,
  DownloadButton,
  MorphButton,
} from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { SURGEON_NAV } from "@/lib/portal-nav";
import { DOCTOR_PROFILE, PATIENTS } from "@/lib/portal-data";
import { downloadPdf } from "@/lib/downloads";
import { cn } from "@/lib/utils";

/**
 * Transcript lines are revealed one at a time while "listening", standing in
 * for a live speech-to-text feed. No audio is captured in this build.
 */
const TRANSCRIPT: { who: "Doctor" | "Patient"; line: string }[] = [
  { who: "Doctor", line: "Good morning. How have things been since the last review?" },
  { who: "Patient", line: "Mostly fine. I still get a fluttering feeling, usually in the evening." },
  { who: "Doctor", line: "Any chest pain, breathlessness or dizziness with it?" },
  { who: "Patient", line: "No pain. Sometimes a little light-headed if I stand up quickly." },
  { who: "Doctor", line: "Are you taking the beta blocker every day?" },
  { who: "Patient", line: "Yes, every morning. I have not missed a dose." },
  { who: "Doctor", line: "Blood pressure is 120 over 80, pulse 88 and regular. Let us repeat the lipid profile in six weeks." },
];

const SOAP_TEMPLATE = (name: string) => `S — Subjective
${name} reports intermittent palpitations, predominantly in the evening. No chest pain, no dyspnoea. Occasional postural light-headedness. Reports full adherence to the beta blocker.

O — Objective
BP 120/80 mmHg, pulse 88 bpm regular, SpO2 95% on room air, afebrile.

A — Assessment
Stable. Symptoms consistent with benign palpitations; no red-flag features on today's review.

P — Plan
Continue current medication at the same dose. Repeat lipid profile in six weeks. Advise standing slowly and maintaining hydration. Review in eight weeks or sooner if symptoms change.`;

export default function ScribeView() {
  const { dispatch } = useClinic();
  const [patientId, setPatientId] = useState(PATIENTS[0].id);
  const [listening, setListening] = useState(false);
  const [visible, setVisible] = useState(0);
  const [note, setNote] = useState("");
  const timer = useRef<number | null>(null);

  const patient = PATIENTS.find((entry) => entry.id === patientId) ?? PATIENTS[0];

  // Reveal one transcript line roughly every 1.4 seconds while listening.
  useEffect(() => {
    if (!listening) return;
    timer.current = window.setInterval(() => {
      setVisible((count) => {
        if (count >= TRANSCRIPT.length) {
          setListening(false);
          return count;
        }
        return count + 1;
      });
    }, 1400);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [listening]);

  const reset = () => {
    setListening(false);
    setVisible(0);
    setNote("");
  };

  return (
    <PortalShell
      theme="clinic"
      nav={SURGEON_NAV}
      backdrop="grid"
      title="AI Clinical Scribe"
      subtitle="Listens to the consultation and drafts a structured note"
      user={{
        name: DOCTOR_PROFILE.name,
        initials: DOCTOR_PROFILE.initials,
        role: DOCTOR_PROFILE.speciality,
      }}
      actions={<NoticeBell audience="surgeon" />}
    >
      <Reveal>
        <PCard>
          <SectionTitle title="Choose a patient to start" />
          <ul className="mt-4 grid list-none grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {PATIENTS.map((entry, index) => {
              const selected = entry.id === patientId;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPatientId(entry.id);
                      reset();
                    }}
                    aria-pressed={selected}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 ease-out-soft",
                      selected
                        ? "border-transparent bg-p-grad shadow-lift"
                        : "border-p-line bg-p-card hover:-translate-y-0.5 hover:border-p-accent/40 motion-reduce:hover:translate-y-0",
                    )}
                  >
                    <PAvatar
                      initials={entry.initials}
                      name={entry.name}
                      index={index}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm font-semibold",
                          selected ? "text-white" : "text-p-ink",
                        )}
                      >
                        {entry.name}
                      </span>
                      <span
                        className={cn(
                          "block truncate text-xs",
                          selected ? "text-white/80" : "text-p-muted",
                        )}
                      >
                        {entry.condition}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </PCard>
      </Reveal>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* ── Live transcript ── */}
        <Reveal delay={0.05}>
          <PCard className="h-full">
            <SectionTitle
              title="Live transcript"
              action={
                listening ? (
                  <button
                    type="button"
                    onClick={() => setListening(false)}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.03] motion-reduce:hover:scale-100"
                  >
                    <Square className="h-3.5 w-3.5" aria-hidden="true" />
                    Stop listening
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setVisible(0);
                      setListening(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-p-grad px-4 py-2.5 text-sm font-semibold text-white shadow-lift transition-transform duration-300 hover:scale-[1.03] motion-reduce:hover:scale-100"
                  >
                    <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                    Start listening
                  </button>
                )
              }
            />

            <p className="mt-2 flex items-center gap-2 text-xs text-p-muted">
              <Waves
                className={cn("h-3.5 w-3.5", listening && "animate-pulse text-p-accent")}
                aria-hidden="true"
              />
              {listening
                ? `Listening to the consultation with ${patient.name}…`
                : "Idle. No audio is captured in this build — the transcript is scripted."}
            </p>

            <ul
              className="mt-4 max-h-[22rem] list-none space-y-3 overflow-y-auto pr-1"
              aria-live="polite"
            >
              {TRANSCRIPT.slice(0, visible).map((line, index) => (
                <li
                  key={index}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    line.who === "Doctor"
                      ? "bg-p-grad text-white"
                      : "ml-auto bg-p-soft text-p-ink",
                  )}
                >
                  <span
                    className={cn(
                      "block text-[10px] font-semibold uppercase tracking-[0.12em]",
                      line.who === "Doctor" ? "text-white/70" : "text-p-muted",
                    )}
                  >
                    {line.who === "Doctor" ? DOCTOR_PROFILE.name : patient.name}
                  </span>
                  {line.line}
                </li>
              ))}
              {visible === 0 ? (
                <li className="rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
                  Press start to begin the consultation.
                </li>
              ) : null}
            </ul>
          </PCard>
        </Reveal>

        {/* ── Generated note ── */}
        <Reveal delay={0.1}>
          <PCard className="h-full">
            <SectionTitle
              title="Generated SOAP note"
              action={
                <MorphButton
                  doneLabel="Drafted"
                  disabled={visible === 0}
                  onClick={() => setNote(SOAP_TEMPLATE(patient.name))}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Generate note
                </MorphButton>
              }
            />

            <Textarea
              aria-label="Generated SOAP note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="The drafted note appears here once the consultation has been transcribed. Review and edit before signing."
              className="mt-4 min-h-[19rem] font-mono text-[13px] leading-relaxed"
            />

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <MorphButton
                doneLabel="Signed into record"
                disabled={!note}
                onClick={() => dispatch({ type: "chart/notes", patientId, notes: note })}
              >
                Sign into record
              </MorphButton>

              <DownloadButton
                fileLabel="SOAP note"
                onDownload={() =>
                  downloadPdf(`soap-note-${patient.id}`, {
                    title: "Nexclinic — SOAP Note (AI scribe draft)",
                    subtitle: `${patient.name} · ${DOCTOR_PROFILE.name}`,
                    lines: (note || SOAP_TEMPLATE(patient.name)).split("\n"),
                  })
                }
              >
                Download
              </DownloadButton>

              <ChevronButton href={`/surgeon/consultation/${patient.id}`}>
                Open consultation
              </ChevronButton>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-p-muted">
              Drafts require clinician review and sign-off. Signing writes the note to
              this patient&apos;s chart, which the consultation screen reads back.
            </p>
          </PCard>
        </Reveal>
      </div>
    </PortalShell>
  );
}
