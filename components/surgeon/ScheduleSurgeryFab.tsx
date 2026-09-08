"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Scissors } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MorphButton } from "@/components/motion-ui/buttons";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { useClinic } from "@/lib/clinic-store";
import { PATIENTS } from "@/lib/portal-data";

const THEATRES = ["OT 1", "OT 2", "Day-care OT", "Cath lab"];

/**
 * Floating "Schedule Surgery" action.
 *
 * Mounted once in the surgeon layout so it is present on every screen in the
 * portal. Submitting pushes an OR-prep notification to the front desk.
 */
export function ScheduleSurgeryFab() {
  const { dispatch } = useClinic();
  const [sent, setSent] = useState(false);
  const reduced = useReducedMotionSafe();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    dispatch({
      type: "surgery/schedule",
      patient: String(form.get("patient") ?? ""),
      procedure: String(form.get("procedure") ?? "Procedure"),
      date: String(form.get("date") ?? ""),
      time: String(form.get("time") ?? ""),
      theatre: String(form.get("theatre") ?? THEATRES[0]),
      notes: String(form.get("notes") ?? ""),
    });
    setSent(true);
  };

  return (
    <Dialog onOpenChange={(open) => !open && setSent(false)}>
      <DialogTrigger asChild>
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: reduced ? 1 : 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.15 : 0.4, delay: reduced ? 0 : 0.3 }}
          className="group fixed bottom-5 right-5 z-[90] inline-flex items-center gap-2.5 rounded-full bg-p-grad px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_-12px_rgba(37,99,235,0.7)] transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98] motion-reduce:hover:scale-100 sm:bottom-7 sm:right-7"
        >
          <Scissors className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Schedule Surgery</span>
          <span className="sm:hidden">Surgery</span>
        </motion.button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogTitle>Schedule a surgery</DialogTitle>
        <DialogDescription>
          Books the theatre slot and sends an OR-prep notification to the front desk.
        </DialogDescription>

        {sent ? (
          <div role="status" className="mt-6 rounded-[20px] bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden="true" />
            <p className="mt-3 text-base font-semibold text-ink">OR prep sent</p>
            <p className="mt-1.5 text-sm text-ink-muted">
              The front desk has been notified and will confirm theatre readiness.
            </p>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="surgery-patient">Patient</Label>
              <select
                id="surgery-patient"
                name="patient"
                className="h-12 w-full rounded-chip border border-line bg-white px-3 text-base text-ink focus:border-blue-500 focus:outline-none"
              >
                {PATIENTS.map((patient) => (
                  <option key={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="surgery-procedure">Procedure</Label>
              <Input
                id="surgery-procedure"
                name="procedure"
                placeholder="Arthroscopic meniscus repair"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="surgery-date">Date</Label>
                <Input id="surgery-date" name="date" type="date" required />
              </div>
              <div>
                <Label htmlFor="surgery-time">Time</Label>
                <Input id="surgery-time" name="time" type="time" required />
              </div>
              <div>
                <Label htmlFor="surgery-theatre">Theatre</Label>
                <select
                  id="surgery-theatre"
                  name="theatre"
                  className="h-12 w-full rounded-chip border border-line bg-white px-3 text-base text-ink focus:border-blue-500 focus:outline-none"
                >
                  {THEATRES.map((theatre) => (
                    <option key={theatre}>{theatre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="surgery-notes">Prep notes for the front desk</Label>
              <Textarea
                id="surgery-notes"
                name="notes"
                placeholder="Consent signed, NPO from midnight, cross-match 2 units"
                className="min-h-24"
              />
            </div>

            <MorphButton type="submit" doneLabel="OR prep sent" className="w-full">
              Send OR prep
            </MorphButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ScheduleSurgeryFab;
