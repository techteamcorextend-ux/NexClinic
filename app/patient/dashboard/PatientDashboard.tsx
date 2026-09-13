"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  CheckCircle2,
  FileClock,
  KeyRound,
  Pill,
  Share2,
  Video,
} from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import BodyVitalsPanel from "@/components/portal/BodyVitalsPanel";
import NoticeBell from "@/components/system/NoticeBell";
import QrPlaceholder from "@/components/system/QrPlaceholder";
import {
  PAvatar,
  PCard,
  PPill,
  Reveal,
  SectionTitle,
} from "@/components/portal/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronButton, DownloadButton, MorphButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { PATIENT_NAV } from "@/lib/portal-nav";
import { SIGNED_IN_PATIENT } from "@/lib/portal-data";
import { DOCTOR_OPTIONS } from "@/lib/roles";
import { isLow } from "@/lib/clinic-types";
import { downloadPdf } from "@/lib/downloads";

import TextReveal from "@/components/motion/TextReveal";
type QuickAction = "refill" | "book" | "telehealth" | null;

export default function PatientDashboard() {
  const { state, dispatch } = useClinic();
  const patient = SIGNED_IN_PATIENT;

  const [action, setAction] = useState<QuickAction>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [referOpen, setReferOpen] = useState(false);
  const [refillItems, setRefillItems] = useState<string[]>([]);

  const upcoming = state.appointments.filter(
    (entry) =>
      entry.patientName === patient.name &&
      (entry.status === "approved" || entry.status === "pending"),
  );

  const medicines = state.stock.filter((item) => item.category === "Medicine");

  const bookVisit = (event: FormEvent<HTMLFormElement>, source: "web" | "telehealth") => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    dispatch({
      type: "appointment/request",
      appointment: {
        patientName: patient.name,
        phone: patient.phone,
        email: patient.email,
        reason: String(form.get("reason") ?? "Follow-up"),
        date: String(form.get("date") ?? ""),
        time: String(form.get("time") ?? ""),
        doctor: String(form.get("doctor") ?? patient.doctor).split(" — ")[0],
        source,
      },
    });
    setAction(null);
  };

  const placeRefill = () => {
    dispatch({
      type: "notice/push",
      notice: {
        to: "reception",
        kind: "phone",
        title: "Pharmacy refill requested",
        body: `${patient.name}: ${refillItems.join(", ") || "no items selected"}`,
      },
    });
    setRefillItems([]);
    setAction(null);
  };

  const QUICK_ACTIONS = [
    { key: "refill" as const, label: "Refill", detail: "Order medicines from the clinic pharmacy", icon: Pill },
    { key: "book" as const, label: "Book visit", detail: "Request another appointment", icon: CalendarPlus },
    { key: "record" as const, label: "View record", detail: "Your full medical timeline", icon: FileClock },
    { key: "telehealth" as const, label: "Telehealth", detail: "Book a video consultation", icon: Video },
  ];

  return (
    <PortalShell
      theme="care"
      nav={PATIENT_NAV}
      backdrop="aurora"
      title={`Hello, ${patient.name.split(" ")[0]}`}
      subtitle={`${patient.condition} · ${patient.doctor}`}
      user={{ id: patient.id, name: patient.name, initials: patient.initials, role: "Patient", email: patient.email }}
      actions={<NoticeBell audience="patient" />}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-5">
          {/* ── Profile ── */}
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
                  <p className="mt-1 text-sm text-p-muted">
                    Patient ID {patient.id} · registered {patient.registered}
                  </p>

                  <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
                    {[
                      ["Age", `${patient.age}`],
                      ["Blood type", patient.bloodType],
                      ["Phone", patient.phone],
                      ["Email", patient.email],
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
                <button
                  type="button"
                  onClick={() => setPasswordOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-p-line bg-p-card px-4 py-2.5 text-sm font-semibold text-p-ink transition-colors hover:border-p-accent/50"
                >
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  Change password
                </button>

                <button
                  type="button"
                  onClick={() => setReferOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-p-grad px-4 py-2.5 text-sm font-semibold text-white shadow-lift transition-transform duration-300 hover:scale-[1.03] motion-reduce:hover:scale-100"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Refer a friend
                </button>

                <DownloadButton
                  fileLabel="Health summary"
                  className="bg-p-soft text-p-ink hover:bg-p-soft/70"
                  onDownload={() =>
                    downloadPdf(`health-summary-${patient.id}`, {
                      title: "Nexclinic — Health Summary",
                      subtitle: `${patient.name} · ${patient.clinic}`,
                      lines: [
                        `Age: ${patient.age}    Blood type: ${patient.bloodType}`,
                        `Clinician: ${patient.doctor}`,
                        `Condition: ${patient.condition}`,
                        "",
                        "Upcoming",
                        ...upcoming.map((e) => `  ${e.date} ${e.time} — ${e.reason} (${e.status})`),
                        "",
                        "Sample output generated in the browser. Not a medical record.",
                      ],
                    })
                  }
                >
                  Summary
                </DownloadButton>
              </div>
            </PCard>
          </Reveal>

          {/* ── Quick actions ── */}
          <Reveal delay={0.05}>
            <PCard>
              <SectionTitle title="Quick action" />
              <ul className="mt-4 grid list-none grid-cols-1 gap-3 sm:grid-cols-2">
                {QUICK_ACTIONS.map((entry, index) => {
                  const Icon = entry.icon;
                  const body = (
                    <>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-p-soft text-p-accent transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-p-ink">
                          {entry.label}
                        </span>
                        <span className="block text-xs text-p-muted">{entry.detail}</span>
                      </span>
                    </>
                  );

                  return (
                    <li key={entry.key}>
                      <Reveal delay={index * 0.07} className="h-full">
                        {entry.key === "record" ? (
                          <Link
                            href="/patient/records"
                            className="group flex h-full items-center gap-3.5 rounded-2xl border border-p-line bg-p-card p-4 transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:border-p-accent/40 motion-reduce:hover:translate-y-0"
                          >
                            {body}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAction(entry.key)}
                            className="group flex h-full w-full items-center gap-3.5 rounded-2xl border border-p-line bg-p-card p-4 text-left transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:border-p-accent/40 motion-reduce:hover:translate-y-0"
                          >
                            {body}
                          </button>
                        )}
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
            </PCard>
          </Reveal>
        </div>

        <div className="min-w-0 space-y-5">
          {/* ── Upcoming appointments ── */}
          {/* No h-full here: this card used to be the column's only child and
              stretched to the grid row. With the viewer stacked beneath it,
              h-full would eat the whole column and push the viewer off. */}
          <Reveal delay={0.1}>
            <PCard>
              <SectionTitle
                title="Upcoming appointments"
                action={<ChevronButton href="/patient/records">Timeline</ChevronButton>}
              />
              <ul className="mt-4 list-none space-y-2.5">
                {upcoming.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-2xl border border-p-line px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-p-ink">{entry.reason}</p>
                      <PPill tone={entry.status === "approved" ? "Resolved" : "Waiting"}>
                        {entry.status}
                      </PPill>
                    </div>
                    <p className="mt-1 text-xs text-p-muted">
                      {entry.date} at {entry.time} · {entry.doctor}
                    </p>
                  </li>
                ))}
                {upcoming.length === 0 ? (
                  <li className="rounded-2xl bg-p-soft px-4 py-3 text-sm text-p-muted">
                    Nothing booked. Use <span className="font-semibold">Book visit</span> to
                    request a slot.
                  </li>
                ) : null}
              </ul>
            </PCard>
          </Reveal>

          {/*
            The patient's own chart, on their own body. No scroll container is
            passed: this screen has no per-region sections to observe, so the
            viewer answers to hover, click and the keyboard legend only.
          */}
          <Reveal delay={0.16}>
            <BodyVitalsPanel
              patientId={patient.id}
              className="min-h-[520px]"
              caption="Your latest readings · hover or click a region"
            />
          </Reveal>
        </div>
      </div>

      {/* ── Change password ── */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Front-end demo — no credential is stored or checked in this build.
          </DialogDescription>
          <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
            <div>
              <Label htmlFor="pw-current">Current password</Label>
              <Input id="pw-current" type="password" autoComplete="current-password" />
            </div>
            <div>
              <Label htmlFor="pw-new">New password</Label>
              <Input id="pw-new" type="password" autoComplete="new-password" />
            </div>
            <div>
              <Label htmlFor="pw-confirm">Confirm new password</Label>
              <Input id="pw-confirm" type="password" autoComplete="new-password" />
            </div>
            <MorphButton type="submit" doneLabel="Password updated" className="w-full">
              Update password
            </MorphButton>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Refer a friend ── */}
      <Dialog open={referOpen} onOpenChange={setReferOpen}>
        <DialogContent>
          <DialogTitle>Refer a friend</DialogTitle>
          <DialogDescription>
            They scan this at home and land on the same onboarding chat the front desk
            uses.
          </DialogDescription>
          <div className="mt-6 flex flex-col items-center gap-4">
            <QrPlaceholder
              seed={patient.id.length * 13}
              label="Referral onboarding QR code placeholder — not scannable in this build"
            />
            <p className="rounded-full bg-p-soft px-4 py-2 font-mono text-xs text-p-ink">
              nexclinic.health/join/{patient.id}
            </p>
            <MorphButton doneLabel="Link copied" className="w-full">
              Copy referral link
            </MorphButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Refill ── */}
      <Dialog open={action === "refill"} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogTitle>Order a refill</DialogTitle>
          <DialogDescription>
            Pick what you need from the clinic pharmacy. The front desk prepares it for
            collection.
          </DialogDescription>
          <ul className="mt-6 max-h-64 list-none space-y-2 overflow-y-auto">
            {medicines.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line px-4 py-3 text-sm hover:bg-surface">
                  <input
                    type="checkbox"
                    checked={refillItems.includes(item.name)}
                    onChange={() =>
                      setRefillItems((current) =>
                        current.includes(item.name)
                          ? current.filter((entry) => entry !== item.name)
                          : [...current, item.name],
                      )
                    }
                    className="h-4 w-4 rounded border-line accent-[#0DB0A2]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">{item.name}</span>
                    <span className="block text-xs text-ink-muted">
                      ₹{item.price} · {isLow(item) ? "low stock" : "in stock"}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <MorphButton
            doneLabel="Refill requested"
            disabled={refillItems.length === 0}
            onClick={placeRefill}
            className="mt-5 w-full"
          >
            Request {refillItems.length || ""} refill{refillItems.length === 1 ? "" : "s"}
          </MorphButton>
        </DialogContent>
      </Dialog>

      {/* ── Book visit / telehealth ── */}
      <Dialog
        open={action === "book" || action === "telehealth"}
        onOpenChange={(open) => !open && setAction(null)}
      >
        <DialogContent>
          <DialogTitle>
            {action === "telehealth" ? "Book a video consultation" : "Book a visit"}
          </DialogTitle>
          <DialogDescription>
            The request goes to the front desk, who confirm the slot.
          </DialogDescription>
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) =>
              bookVisit(event, action === "telehealth" ? "telehealth" : "web")
            }
          >
            <div>
              <Label htmlFor="book-doctor">Clinician</Label>
              <select
                id="book-doctor"
                name="doctor"
                className="h-12 w-full rounded-chip border border-line bg-white dark:bg-p-card px-3 text-base text-ink focus:border-blue-500 focus:outline-none"
              >
                {DOCTOR_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="book-date">Date</Label>
                <Input id="book-date" name="date" type="date" required />
              </div>
              <div>
                <Label htmlFor="book-time">Time</Label>
                <Input id="book-time" name="time" type="time" required />
              </div>
            </div>
            <div>
              <Label htmlFor="book-reason">Reason</Label>
              <Input
                id="book-reason"
                name="reason"
                defaultValue={
                  action === "telehealth" ? "Video follow-up" : "Follow-up consultation"
                }
                required
              />
            </div>
            <MorphButton type="submit" doneLabel="Request sent" className="w-full">
              {action === "telehealth" ? (
                <>
                  <Video className="h-4 w-4" aria-hidden="true" />
                  Request video visit
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Request appointment
                </>
              )}
            </MorphButton>
          </form>
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
