"use client";

import { useState } from "react";
import { CalendarClock, Check, Inbox, RotateCcw, X } from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import NoticeBell from "@/components/system/NoticeBell";
import { PCard, PPill, Reveal, SectionTitle } from "@/components/portal/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadButton, MorphButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { RECEPTION_NAV } from "@/lib/portal-nav";
import { RECEPTION_PROFILE } from "@/lib/portal-data";
import { downloadCsv } from "@/lib/downloads";

const STATUS_TONE: Record<string, string> = {
  pending: "Waiting",
  approved: "Resolved",
  declined: "Critical",
  completed: "Stable",
};

export default function RequestsView() {
  const { state, dispatch } = useClinic();
  const [filter, setFilter] = useState("pending");
  const [reschedule, setReschedule] = useState<string | null>(null);

  const rows = state.appointments.filter((entry) =>
    filter === "all" ? true : entry.status === filter,
  );
  const target = state.appointments.find((entry) => entry.id === reschedule);
  const pendingCount = state.appointments.filter((e) => e.status === "pending").length;

  return (
    <PortalShell
      theme="clinic"
      nav={RECEPTION_NAV}
      backdrop="grid"
      title="Appointment requests"
      subtitle={`${pendingCount} awaiting a decision`}
      user={{
        name: RECEPTION_PROFILE.name,
        initials: RECEPTION_PROFILE.initials,
        role: RECEPTION_PROFILE.role,
      }}
      actions={<NoticeBell audience="reception" />}
    >
      <Reveal>
        <PCard>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="declined">Declined</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>

            <DownloadButton
              fileLabel="Requests CSV"
              className="bg-p-soft px-4 py-2.5 text-p-ink hover:bg-p-soft/70"
              onDownload={() =>
                downloadCsv(
                  "appointment-requests",
                  ["Reference", "Patient", "Phone", "Reason", "Date", "Time", "Clinician", "Source", "Status"],
                  state.appointments.map((entry) => [
                    entry.id,
                    entry.patientName,
                    entry.phone,
                    entry.reason,
                    entry.date,
                    entry.time,
                    entry.doctor,
                    entry.source,
                    entry.status,
                  ]),
                )
              }
            >
              Export
            </DownloadButton>
          </div>

          <p className="mt-3 text-xs text-p-muted">
            Requests arrive here from the public homepage. Approving one notifies the
            patient and puts it on the surgeon&apos;s approved list.
          </p>
        </PCard>
      </Reveal>

      <Reveal delay={0.05}>
        <ul className="mt-5 list-none space-y-3">
          {rows.map((entry) => (
            <li key={entry.id}>
              <PCard>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-base font-bold text-p-ink">{entry.patientName}</p>
                      <PPill tone={STATUS_TONE[entry.status]}>{entry.status}</PPill>
                      <span className="rounded-full bg-p-soft px-2.5 py-1 text-[11px] font-medium capitalize text-p-muted">
                        {entry.source}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-p-muted">{entry.reason}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-p-muted">
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                        {entry.date} at {entry.time}
                      </span>
                      <span>{entry.doctor}</span>
                      <span>{entry.phone}</span>
                      <span className="font-mono">{entry.id}</span>
                    </p>
                  </div>

                  {entry.status === "pending" ? (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setReschedule(entry.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-p-line bg-p-card px-4 py-2.5 text-sm font-semibold text-p-ink transition-colors hover:border-p-accent/50"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Reschedule
                      </button>

                      <MorphButton
                        doneLabel="Approved"
                        onClick={() => dispatch({ type: "appointment/approve", id: entry.id })}
                        className="bg-emerald-600 text-white"
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Approve
                      </MorphButton>

                      <button
                        type="button"
                        onClick={() => dispatch({ type: "appointment/decline", id: entry.id })}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-p-muted">No action outstanding</span>
                  )}
                </div>
              </PCard>
            </li>
          ))}

          {rows.length === 0 ? (
            <li>
              <PCard>
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Inbox className="h-6 w-6 text-p-muted" aria-hidden="true" />
                  <p className="text-sm font-semibold text-p-ink">Nothing in this view</p>
                  <p className="max-w-sm text-sm text-p-muted">
                    New requests appear here the moment someone books from the
                    homepage.
                  </p>
                </div>
              </PCard>
            </li>
          ) : null}
        </ul>
      </Reveal>

      {/* ── Reschedule dialog ── */}
      <Dialog open={reschedule !== null} onOpenChange={(open) => !open && setReschedule(null)}>
        <DialogContent>
          <DialogTitle>Reschedule appointment</DialogTitle>
          <DialogDescription>
            {target ? `${target.patientName} · ${target.doctor}` : ""} — the patient is
            notified of the new slot.
          </DialogDescription>

          {target ? (
            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                dispatch({
                  type: "appointment/reschedule",
                  id: target.id,
                  date: String(form.get("date") ?? target.date),
                  time: String(form.get("time") ?? target.time),
                });
                setReschedule(null);
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rs-date">New date</Label>
                  <Input id="rs-date" name="date" type="date" defaultValue={target.date} required />
                </div>
                <div>
                  <Label htmlFor="rs-time">New time</Label>
                  <Input id="rs-time" name="time" type="time" defaultValue={target.time} required />
                </div>
              </div>
              <MorphButton type="submit" doneLabel="Rescheduled" className="w-full">
                Confirm new slot
              </MorphButton>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
