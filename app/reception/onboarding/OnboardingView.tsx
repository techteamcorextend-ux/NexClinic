"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2, QrCode, Send, ScanLine } from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import NoticeBell from "@/components/system/NoticeBell";
import { PCard, Reveal, SectionTitle } from "@/components/portal/ui";
import { Input } from "@/components/ui/input";
import { MorphButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { RECEPTION_NAV } from "@/lib/portal-nav";
import { RECEPTION_PROFILE } from "@/lib/portal-data";
import type { Priority } from "@/lib/clinic-types";
import QrPlaceholder from "@/components/system/QrPlaceholder";

type Step = {
  key: "name" | "phone" | "age" | "reason" | "priority";
  question: string;
  placeholder: string;
};

const STEPS: Step[] = [
  { key: "name", question: "Hello! Welcome to Nexclinic. What is your full name?", placeholder: "Rohit Malhotra" },
  { key: "phone", question: "Thanks. What mobile number can we reach you on?", placeholder: "+91 98450 00000" },
  { key: "age", question: "And your age?", placeholder: "34" },
  { key: "reason", question: "What brings you in today?", placeholder: "Fever and sore throat since Tuesday" },
  { key: "priority", question: "Last one — how urgent does it feel? Type low, medium or high.", placeholder: "medium" },
];

export default function OnboardingView() {
  const { dispatch } = useClinic();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [done, setDone] = useState(false);
  const logRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [step, done]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const key = STEPS[step].key;
    const next = { ...answers, [key]: draft.trim() };
    setAnswers(next);
    setDraft("");

    if (step === STEPS.length - 1) {
      const priority = ["low", "medium", "high"].includes(next.priority?.toLowerCase())
        ? (next.priority.toLowerCase() as Priority)
        : "medium";
      dispatch({
        type: "queue/add",
        name: next.name ?? "Walk-in patient",
        reason: next.reason ?? "Walk-in",
        priority,
      });
      setDone(true);
    } else {
      setStep(step + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setDraft("");
    setDone(false);
  };

  return (
    <PortalShell
      theme="clinic"
      nav={RECEPTION_NAV}
      backdrop="grid"
      title="Walk-in onboarding"
      subtitle="Scan at the desk, the patient fills their own details in"
      user={{
        name: RECEPTION_PROFILE.name,
        initials: RECEPTION_PROFILE.initials,
        role: RECEPTION_PROFILE.role,
      }}
      actions={<NoticeBell audience="reception" />}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.4fr]">
        {/* ── Desk scanner card ── */}
        <Reveal>
          <PCard className="h-full">
            <SectionTitle title="Desk scanner" />
            <p className="mt-2 text-sm leading-relaxed text-p-muted">
              Sits on the reception counter. A walk-in scans it with their phone and
              the same chatbot opens there instead of on this screen.
            </p>

            <div className="mt-5 flex flex-col items-center gap-4 rounded-[22px] bg-p-soft p-5">
              <QrPlaceholder label="Onboarding QR code placeholder — not scannable in this build" />
              <p className="flex items-center gap-2 text-xs font-semibold text-p-ink">
                <QrCode className="h-4 w-4" aria-hidden="true" />
                nexclinic.health/onboard/kmg-desk-01
              </p>
              <p className="flex items-center gap-2 text-[11px] text-p-muted">
                <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
                Placeholder code — not scannable in this build
              </p>
            </div>
          </PCard>
        </Reveal>

        {/* ── Chatbot ── */}
        <Reveal delay={0.06}>
          <PCard className="h-full">
            <SectionTitle
              title="Onboarding assistant"
              action={
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-p-line px-4 py-2 text-xs font-semibold text-p-muted transition-colors hover:text-p-ink"
                >
                  Start over
                </button>
              }
            />

            <ul
              ref={logRef}
              aria-live="polite"
              className="mt-4 max-h-[24rem] list-none space-y-3 overflow-y-auto pr-1"
            >
              {STEPS.slice(0, step + (done ? STEPS.length : 1)).map((entry, index) => (
                <li key={entry.key} className="space-y-2">
                  <div className="flex max-w-[85%] items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-p-grad text-white"
                    >
                      <Bot className="h-4 w-4" />
                    </span>
                    <span className="rounded-2xl bg-p-soft px-4 py-2.5 text-sm text-p-ink">
                      {entry.question}
                    </span>
                  </div>

                  {answers[entry.key] ? (
                    <p className="ml-auto max-w-[85%] rounded-2xl bg-p-grad px-4 py-2.5 text-sm text-white">
                      {answers[entry.key]}
                    </p>
                  ) : null}
                </li>
              ))}

              {done ? (
                <li className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-600 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Thank you, {answers.name}. You are in the queue — please take a seat
                    and watch the board for your token.
                  </span>
                </li>
              ) : null}
            </ul>

            {!done ? (
              <form className="mt-5 flex items-center gap-2" onSubmit={submit}>
                <Input
                  aria-label={STEPS[step].question}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={STEPS[step].placeholder}
                  className="flex-1"
                />
                <button
                  type="submit"
                  aria-label="Send answer"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-p-grad text-white transition-transform duration-300 hover:scale-105 motion-reduce:hover:scale-100"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            ) : (
              <div className="mt-5">
                <MorphButton doneLabel="Ready" onClick={reset} className="w-full">
                  Onboard the next walk-in
                </MorphButton>
              </div>
            )}

            <p className="mt-3 text-xs text-p-muted">
              Step {Math.min(step + 1, STEPS.length)} of {STEPS.length}. Completing the
              chat adds the patient to the live queue at the priority they gave.
            </p>
          </PCard>
        </Reveal>
      </div>
    </PortalShell>
  );
}
