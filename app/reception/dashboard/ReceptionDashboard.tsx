"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Siren,
  UserPlus,
} from "lucide-react";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import PortalShell from "@/components/portal/PortalShell";
import NoticeBell from "@/components/system/NoticeBell";
import {
  PAvatar,
  PCard,
  PLinkCard,
  PPill,
  Reveal,
  SectionTitle,
} from "@/components/portal/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronButton, DownloadButton, MorphButton } from "@/components/motion-ui/buttons";
import { useClinic, sortQueue } from "@/lib/clinic-store";
import { RECEPTION_NAV } from "@/lib/portal-nav";
import { RECEPTION_PROFILE } from "@/lib/portal-data";
import type { Priority } from "@/lib/clinic-types";
import { downloadCsv } from "@/lib/downloads";
import { cn } from "@/lib/utils";

const PRIORITIES: Priority[] = ["low", "medium", "high"];

const PRIORITY_STYLE: Record<Priority, string> = {
  high: "bg-rose-600 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-p-soft text-p-ink",
};

/**
 * The screen-edge alarm frame that appears for as long as the emergency
 * dialog is open — a "vintage red" vignette hugging the viewport border,
 * `fixed` so it covers the whole screen regardless of scroll position or
 * which portal section is showing behind it.
 */
function EmergencyScreenGlow({ active }: { active: boolean }) {
  const reduced = useReducedMotionSafe();

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none fixed inset-0 z-[90] border-[6px] border-red-900/40"
        >
          <motion.div
            animate={reduced ? { opacity: 0.7 } : { opacity: [0.55, 0.85, 0.55] }}
            transition={
              reduced ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            }
            className="absolute inset-0 shadow-[inset_0_0_60px_18px_rgba(127,29,29,0.55),inset_0_0_160px_60px_rgba(127,29,29,0.35)]"
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Raises an emergency and pushes it to every surgeon on call. */
function EmergencyButton() {
  const { dispatch } = useClinic();
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    dispatch({
      type: "emergency/broadcast",
      location: String(form.get("location") ?? "Front desk"),
      detail: String(form.get("detail") ?? "Immediate assistance required"),
    });
    setSent(true);
  };

  return (
    <>
      <EmergencyScreenGlow active={open} />

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSent(false);
        }}
      >
        <DialogTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2.5 rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white transition-transform duration-300 hover:scale-[1.03] motion-reduce:hover:scale-100",
              open
                ? "motion-safe:animate-emergency-glow shadow-[0_0_45px_12px_rgba(244,63,94,0.85)]"
                : "shadow-[0_16px_40px_-14px_rgba(225,29,72,0.8)]",
            )}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-white motion-safe:animate-pulse-ring"
            />
            <Siren className="h-4 w-4" aria-hidden="true" />
            Emergency
          </button>
        </DialogTrigger>

        <DialogContent>
        <DialogTitle>Raise an emergency</DialogTitle>
        <DialogDescription>
          Broadcasts a push notification to every surgeon on call and logs it for
          administration.
        </DialogDescription>

        {sent ? (
          <div role="status" className="mt-6 rounded-[20px] bg-rose-50 p-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-rose-600" aria-hidden="true" />
            <p className="mt-3 text-base font-semibold text-ink">Alert broadcast</p>
            <p className="mt-1.5 text-sm text-ink-muted">
              Surgeons have been paged. Switch to the{" "}
              <Link href="/surgeon/dashboard" className="font-semibold text-rose-700 underline">
                surgeon portal
              </Link>{" "}
              to see it arrive.
            </p>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="emg-location">Location</Label>
              <Input
                id="emg-location"
                name="location"
                defaultValue="Reception, Ground Floor"
                required
              />
            </div>
            <div>
              <Label htmlFor="emg-detail">What is happening</Label>
              <Input
                id="emg-detail"
                name="detail"
                defaultValue="Walk-in collapse near the triage desk"
                required
              />
            </div>
            <MorphButton
              type="submit"
              doneLabel="Broadcast sent"
              className="w-full bg-rose-600 text-white"
            >
              Broadcast to all surgeons
            </MorphButton>
          </form>
        )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ReceptionDashboard() {
  const { state, dispatch } = useClinic();
  const queue = sortQueue(state.queue);
  const pending = state.appointments.filter((entry) => entry.status === "pending");
  const [walkInOpen, setWalkInOpen] = useState(false);

  const waiting = queue.filter((entry) => entry.state === "waiting").length;
  const avgWait = queue.length
    ? Math.round(queue.reduce((sum, entry) => sum + entry.waitMinutes, 0) / queue.length)
    : 0;

  const stats = [
    { label: "In the queue", value: String(waiting), href: "/reception/dashboard" },
    { label: "Pending requests", value: String(pending.length), href: "/reception/requests" },
    { label: "Average wait", value: `${avgWait} min`, href: "/reception/dashboard" },
    { label: "Bills raised today", value: String(state.bills.length), href: "/reception/billing" },
  ];

  return (
    <PortalShell
      theme="clinic"
      nav={RECEPTION_NAV}
      backdrop="grid"
      title="Front desk"
      subtitle={`${waiting} waiting · ${pending.length} requests to action`}
      user={{
        name: RECEPTION_PROFILE.name,
        initials: RECEPTION_PROFILE.initials,
        role: RECEPTION_PROFILE.role,
      }}
      actions={
        <span className="flex items-center gap-2">
          <EmergencyButton />
          <NoticeBell audience="reception" />
        </span>
      }
    >
      {/* ── Stat tiles ── */}
      <Reveal>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <PLinkCard key={stat.label} href={stat.href} label={`${stat.label}: ${stat.value}`}>
              <p className="text-xs font-medium text-p-muted">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-p-ink">
                {stat.value}
              </p>
            </PLinkCard>
          ))}
        </div>
      </Reveal>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* ── Patient queue ── */}
        <Reveal delay={0.05}>
          <PCard>
            <SectionTitle
              title="Patient queue"
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <DownloadButton
                    fileLabel="Queue CSV"
                    className="bg-p-soft px-4 py-2 text-p-ink hover:bg-p-soft/70"
                    onDownload={() =>
                      downloadCsv(
                        "patient-queue",
                        ["Token", "Patient", "Reason", "Priority", "Arrived", "State"],
                        queue.map((entry) => [
                          entry.token,
                          entry.name,
                          entry.reason,
                          entry.priority,
                          entry.arrivedAt,
                          entry.state,
                        ]),
                      )
                    }
                  >
                    Export
                  </DownloadButton>
                  <button
                    type="button"
                    onClick={() => setWalkInOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-p-line bg-p-card px-4 py-2.5 text-sm font-semibold text-p-ink transition-colors hover:border-p-accent/50"
                  >
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    Add walk-in
                  </button>
                </div>
              }
            />

            <p className="mt-2 text-xs text-p-muted">
              The list re-orders itself the moment a priority changes — high first,
              then by arrival time.
            </p>

            <ul className="mt-4 list-none space-y-2.5">
              {queue.map((entry, index) => (
                <li
                  key={entry.id}
                  className={cn(
                    "rounded-2xl border px-4 py-3 transition-colors duration-300",
                    entry.state === "in-consult"
                      ? "border-p-accent/50 bg-p-soft"
                      : "border-p-line bg-p-card",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-3">
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
                      <Link
                        href={entry.patientId ? `/patients/${entry.patientId}` : "/reception/dashboard"}
                        className="block truncate text-sm font-semibold text-p-ink hover:underline"
                      >
                        {entry.name}
                      </Link>
                      <span className="block truncate text-xs text-p-muted">
                        {entry.reason} · arrived {entry.arrivedAt} · waiting{" "}
                        {entry.waitMinutes} min
                      </span>
                    </span>

                    <PPill
                      tone={
                        entry.state === "in-consult"
                          ? "In consult"
                          : entry.state === "done"
                            ? "Resolved"
                            : "Waiting"
                      }
                    >
                      {entry.state === "in-consult"
                        ? "In consult"
                        : entry.state === "done"
                          ? "Done"
                          : "Waiting"}
                    </PPill>
                  </div>

                  {/* Priority selector — changing it re-sorts the queue */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-p-line pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-p-muted">
                      Priority
                    </span>
                    {PRIORITIES.map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        aria-pressed={entry.priority === priority}
                        onClick={() =>
                          dispatch({ type: "queue/priority", id: entry.id, priority })
                        }
                        className={cn(
                          "rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition-all duration-300 ease-out-soft",
                          entry.priority === priority
                            ? PRIORITY_STYLE[priority]
                            : "border border-p-line text-p-muted hover:text-p-ink",
                        )}
                      >
                        {priority}
                      </button>
                    ))}

                    <span className="ml-auto flex items-center gap-1.5 text-[11px] text-p-muted">
                      {index === 0 ? (
                        <>
                          <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          Top of queue
                        </>
                      ) : (
                        <>
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          Position {index + 1}
                        </>
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </PCard>
        </Reveal>

        {/* ── Side rail ── */}
        <div className="min-w-0 space-y-5">
          <Reveal delay={0.1}>
            <PCard>
              <SectionTitle
                title="Pending requests"
                action={<ChevronButton href="/reception/requests">Action them</ChevronButton>}
              />
              <ul className="mt-4 list-none space-y-2.5">
                {pending.slice(0, 4).map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-2xl border border-p-line px-4 py-3"
                  >
                    <p className="truncate text-sm font-semibold text-p-ink">
                      {entry.patientName}
                    </p>
                    <p className="truncate text-xs text-p-muted">
                      {entry.date} at {entry.time} · {entry.doctor}
                    </p>
                  </li>
                ))}
                {pending.length === 0 ? (
                  <li className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Nothing waiting on you.
                  </li>
                ) : null}
              </ul>
            </PCard>
          </Reveal>

          <Reveal delay={0.14}>
            <PLinkCard href="/reception/onboarding" label="Open walk-in onboarding">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-p-muted">
                Walk-ins
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight text-p-ink">
                Onboarding chatbot &amp; QR
              </p>
              <p className="mt-1 text-sm text-p-muted">
                Point the desk scanner at the code and the patient fills their own
                details in.
              </p>
            </PLinkCard>
          </Reveal>

          <Reveal delay={0.18}>
            <PLinkCard href="/reception/billing" label="Open billing and checkout">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-p-muted">
                Checkout
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight text-p-ink">
                Billing
              </p>
              <p className="mt-1 text-sm text-p-muted">
                Adding medicines to a bill draws the same quantity out of pharmacy
                stock.
              </p>
            </PLinkCard>
          </Reveal>
        </div>
      </div>

      {/* ── Walk-in dialog ── */}
      <Dialog open={walkInOpen} onOpenChange={setWalkInOpen}>
        <DialogContent>
          <DialogTitle>Add a walk-in</DialogTitle>
          <DialogDescription>
            Places the patient straight into the queue at the chosen priority.
          </DialogDescription>
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              dispatch({
                type: "queue/add",
                name: String(form.get("name") ?? "Walk-in patient"),
                reason: String(form.get("reason") ?? "Walk-in"),
                priority: String(form.get("priority") ?? "medium") as Priority,
              });
              setWalkInOpen(false);
            }}
          >
            <div>
              <Label htmlFor="walkin-name">Patient name</Label>
              <Input id="walkin-name" name="name" required />
            </div>
            <div>
              <Label htmlFor="walkin-reason">Reason</Label>
              <Input id="walkin-reason" name="reason" required />
            </div>
            <div>
              <Label htmlFor="walkin-priority">Priority</Label>
              <select
                id="walkin-priority"
                name="priority"
                defaultValue="medium"
                className="h-12 w-full rounded-chip border border-line bg-white px-3 text-base capitalize text-ink focus:border-blue-500 focus:outline-none"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority} className="capitalize">
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <MorphButton type="submit" doneLabel="Added to queue" className="w-full">
              Add to queue
            </MorphButton>
          </form>
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
