"use client";

import { useState, type FormEvent } from "react";
import { ClipboardPlus, MapPin, Wrench } from "lucide-react";
import InventoryShell from "@/components/inventory/InventoryShell";
import { PCard, PPill, Reveal, SectionTitle } from "@/components/portal/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DownloadButton, MorphButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import type { EquipmentStatus } from "@/lib/clinic-types";
import { downloadCsv } from "@/lib/downloads";

import TextReveal from "@/components/motion/TextReveal";
const STATUS_TONE: Record<EquipmentStatus, string> = {
  Operational: "Stable",
  "Under maintenance": "In consult",
  "Service due": "Critical",
};

const STATUSES: EquipmentStatus[] = ["Operational", "Under maintenance", "Service due"];

/** Adds a maintenance entry against an existing asset, or registers a new one. */
function EquipmentLogDialog() {
  const { state, dispatch } = useClinic();
  const [mode, setMode] = useState<"log" | "new">("log");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    if (mode === "log") {
      dispatch({
        type: "equipment/log",
        id: String(form.get("asset") ?? ""),
        note: String(form.get("note") ?? "Maintenance carried out"),
        nextService: String(form.get("next") ?? "") || undefined,
      });
    } else {
      dispatch({
        type: "equipment/add",
        item: {
          name: String(form.get("name") ?? "New equipment"),
          location: String(form.get("location") ?? "Unassigned"),
          status: String(form.get("status") ?? "Operational") as EquipmentStatus,
          lastService: String(form.get("last") ?? "—"),
          nextService: String(form.get("next") ?? "—"),
        },
      });
    }
    setSaved(true);
  };

  return (
    <Dialog onOpenChange={(open) => !open && setSaved(false)}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-p-grad px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-transform duration-300 hover:scale-[1.03] motion-reduce:hover:scale-100"
        >
          <ClipboardPlus className="h-4 w-4" aria-hidden="true" />
          Add equipment log
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Equipment log</DialogTitle>
        <DialogDescription>
          Record maintenance against an asset, or register a new one and schedule its
          first service.
        </DialogDescription>

        {saved ? (
          <p role="status" className="mt-6 rounded-chip bg-emerald-50 p-5 text-sm text-emerald-800">
            Entry recorded against the equipment register.
          </p>
        ) : (
          <>
            <div className="mt-5 flex gap-2 rounded-full bg-surface p-1">
              {(["log", "new"] as const).map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setMode(entry)}
                  aria-pressed={mode === entry}
                  className={
                    mode === entry
                      ? "flex-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm"
                      : "flex-1 rounded-full px-4 py-2 text-sm font-medium text-ink-muted"
                  }
                >
                  {entry === "log" ? "Log maintenance" : "New equipment"}
                </button>
              ))}
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              {mode === "log" ? (
                <>
                  <div>
                    <Label htmlFor="eq-asset">Asset</Label>
                    <select
                      id="eq-asset"
                      name="asset"
                      className="h-12 w-full rounded-chip border border-line bg-white px-3 text-base text-ink focus:border-blue-500 focus:outline-none"
                    >
                      {state.equipment.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} — {item.location}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="eq-note">What was done</Label>
                    <Textarea
                      id="eq-note"
                      name="note"
                      placeholder="Filter replaced, calibration verified"
                      className="min-h-24"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eq-next">Next service due</Label>
                    <Input id="eq-next" name="next" type="date" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="eq-name">Equipment name</Label>
                    <Input id="eq-name" name="name" placeholder="Portable ultrasound" required />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="eq-location">Location</Label>
                      <Input id="eq-location" name="location" placeholder="OPD 2" required />
                    </div>
                    <div>
                      <Label htmlFor="eq-status">Status</Label>
                      <select
                        id="eq-status"
                        name="status"
                        className="h-12 w-full rounded-chip border border-line bg-white px-3 text-base text-ink focus:border-blue-500 focus:outline-none"
                      >
                        {STATUSES.map((entry) => (
                          <option key={entry}>{entry}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="eq-last">Last service</Label>
                      <Input id="eq-last" name="last" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="eq-next-new">Next service</Label>
                      <Input id="eq-next-new" name="next" type="date" />
                    </div>
                  </div>
                </>
              )}

              <MorphButton type="submit" doneLabel="Recorded" className="w-full">
                {mode === "log" ? "Save maintenance log" : "Register equipment"}
              </MorphButton>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function EquipmentView() {
  const { state } = useClinic();
  const needsWork = state.equipment.filter((item) => item.status !== "Operational");

  return (
    <InventoryShell
      title="Equipment"
      subtitle={`${needsWork.length} of ${state.equipment.length} assets need attention`}
      actions={
        <span className="flex items-center gap-2">
          <DownloadButton
            fileLabel="Equipment register CSV"
            className="bg-p-card px-4 py-2.5 text-p-ink hover:bg-p-soft"
            onDownload={() =>
              downloadCsv(
                "equipment-register",
                ["Asset", "Location", "Status", "Last service", "Next service", "Log entries"],
                state.equipment.map((item) => [
                  item.name,
                  item.location,
                  item.status,
                  item.lastService,
                  item.nextService,
                  item.logs.length,
                ]),
              )
            }
          >
            Export
          </DownloadButton>
          <EquipmentLogDialog />
        </span>
      }
    >
      <ul className="grid list-none grid-cols-1 gap-4 lg:grid-cols-2">
        {state.equipment.map((item, index) => (
          <li key={item.id}>
            <Reveal delay={index * 0.04} className="h-full">
              <PCard className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-p-soft text-p-accent"
                    >
                      <Wrench className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <TextReveal as="h2" className="truncate text-base font-bold tracking-tight text-p-ink">
                        {item.name}
                      </TextReveal>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-p-muted">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {item.location}
                      </p>
                    </div>
                  </div>
                  <PPill tone={STATUS_TONE[item.status]}>{item.status}</PPill>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-p-soft px-4 py-3">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-p-muted">
                      Last service
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-p-ink">
                      {item.lastService}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-p-soft px-4 py-3">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-p-muted">
                      Next due
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-p-ink">
                      {item.nextService}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex-1">
                  <SectionTitle title="Maintenance log" as="h3" />
                  <ul className="mt-2.5 list-none space-y-2">
                    {item.logs.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-2xl border border-p-line px-3.5 py-2.5"
                      >
                        <p className="text-sm text-p-ink">{entry.note}</p>
                        <p className="mt-0.5 text-[11px] text-p-muted">
                          {entry.at} · {entry.by}
                        </p>
                      </li>
                    ))}
                    {item.logs.length === 0 ? (
                      <li className="rounded-2xl bg-p-soft px-3.5 py-2.5 text-sm text-p-muted">
                        No maintenance recorded yet.
                      </li>
                    ) : null}
                  </ul>
                </div>
              </PCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </InventoryShell>
  );
}
