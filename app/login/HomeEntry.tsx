"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AnimatedField from "@/components/login/AnimatedField";
import { StretchButton, MorphButton } from "@/components/motion-ui/buttons";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { useClinic } from "@/lib/clinic-store";
import { CLINIC_INFO, DOCTOR_OPTIONS, ROLES } from "@/lib/roles";

const PILLARS = [
  "Six role-based portals on one record",
  "AI scribe drafts clinical notes as you consult",
  "Billing that draws down pharmacy stock in real time",
  "Revenue, footfall and payroll in a single ledger",
];

const STATS = [
  { value: "6", label: "Role portals" },
  { value: "13+", label: "AI modules" },
  { value: "24×7", label: "Emergency desk" },
];

/**
 * Pre-login appointment request. First-time visitors book here without an
 * account; the request lands in the receptionist's pending list and fires a
 * push notification at the front desk.
 */
function NewAppointmentDialog() {
  const { dispatch } = useClinic();
  const [sent, setSent] = useState(false);
  const [doctor, setDoctor] = useState(DOCTOR_OPTIONS[0]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    dispatch({
      type: "appointment/request",
      appointment: {
        patientName: String(form.get("name") ?? "").trim() || "New patient",
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? ""),
        reason: String(form.get("reason") ?? "General consultation"),
        date: String(form.get("date") ?? ""),
        time: String(form.get("time") ?? ""),
        doctor: doctor.split(" — ")[0],
        source: "web",
      },
    });
    setSent(true);
  };

  return (
    <Dialog onOpenChange={(open) => !open && setSent(false)}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-dashed border-white/35 bg-white/10 px-6 py-4 text-sm font-semibold text-white transition-all duration-300 ease-out-soft hover:border-white/70 hover:bg-white/20 motion-reduce:transition-none"
        >
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          Enter New Appointment
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogTitle>Book an appointment</DialogTitle>
        <DialogDescription>
          No account needed. Your request goes straight to the front desk, who
          will confirm the slot.
        </DialogDescription>

        {sent ? (
          <div role="status" className="mt-6 rounded-[20px] bg-emerald-50 p-6 text-center">
            <CheckCircle2
              className="mx-auto h-8 w-8 text-emerald-600"
              aria-hidden="true"
            />
            <p className="mt-3 text-base font-semibold text-ink">Request sent</p>
            <p className="mt-1.5 text-sm text-ink-muted">
              The receptionist has been notified. You can watch it arrive in the{" "}
              <Link
                href="/reception/requests"
                className="font-semibold text-emerald-700 underline underline-offset-4"
              >
                front desk requests
              </Link>{" "}
              screen.
            </p>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <AnimatedField label="Full name" name="name" autoComplete="name" required />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AnimatedField
                label="Phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
              />
              <AnimatedField
                label="Email (optional)"
                name="email"
                type="email"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="appt-doctor"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-ink-muted"
              >
                Preferred clinician
              </label>
              <select
                id="appt-doctor"
                value={doctor}
                onChange={(event) => setDoctor(event.target.value)}
                className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-base text-ink focus:border-blue-500 focus:outline-none"
              >
                {DOCTOR_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AnimatedField label="Date" name="date" type="date" required />
              <AnimatedField label="Time" name="time" type="time" required />
            </div>

            <AnimatedField label="Reason for visit" name="reason" required />

            <MorphButton type="submit" doneLabel="Sent to front desk" className="w-full">
              Send request
            </MorphButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function HomeEntry() {
  const reduced = useReducedMotionSafe();

  return (
    <main className="min-h-screen bg-[#0B1020] lg:grid lg:grid-cols-2">
      {/* ─────────────── Left grid — about Nexclinic ─────────────── */}
      <section className="isolate relative flex min-h-[52vh] flex-col justify-between overflow-hidden px-6 py-10 sm:px-10 lg:min-h-screen lg:px-14 lg:py-14">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Image
            src="/images/lungs.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="scale-125 object-cover opacity-30 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#3B0A1E]/85 via-[#0B1020]/90 to-[#0A2A5E]/85" />
          <div className="animate-aurora-a absolute -left-24 top-0 h-[30rem] w-[30rem] rounded-full bg-[#E11D48]/30 blur-[130px]" />
          <div className="animate-aurora-b absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#2563EB]/35 blur-[130px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Unified CMS &amp; Wellness Architecture
          </span>

          <h1 className="mt-7 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl xl:text-6xl">
            Nexclinic
            <span className="mt-2 block bg-gradient-to-r from-rose-300 via-fuchsia-200 to-sky-300 bg-clip-text text-transparent">
              one record, every role.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70">
            Nexclinic runs the whole facility on a single patient record —
            front desk, consulting room, pharmacy, stores and administration.
            Every action taken in one portal is visible in the next, the moment
            it happens.
          </p>

          <ul className="mt-8 list-none space-y-3">
            {PILLARS.map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-white/80">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                {line}
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="mt-10 flex flex-wrap items-end gap-8">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold tracking-tight text-white">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/50">
                {stat.label}
              </p>
            </div>
          ))}
          <Link
            href="/"
            className="ml-auto text-sm font-medium text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            About the platform →
          </Link>
        </div>
      </section>

      {/* ─────────────── Right grid — sign in ─────────────── */}
      <section className="flex min-h-screen flex-col justify-center bg-white px-6 py-12 sm:px-10 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-md"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-gradient-to-r from-rose-50 to-blue-50 px-3 py-1.5 text-xs font-medium text-ink">
            <ShieldCheck className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
            Front-end test build · demo credentials pre-filled
          </p>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-ink">
            Sign in to your portal
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Pick the role you work as. Each portal opens on its own dashboard.
          </p>

          <ul className="mt-7 list-none space-y-3">
            {ROLES.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.li
                  key={role.key}
                  initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduced ? 0.15 : 0.45,
                    delay: reduced ? 0 : 0.15 + index * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={`/signin/${role.key}`}
                    className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:border-transparent hover:shadow-lift motion-reduce:hover:translate-y-0"
                  >
                    <span
                      aria-hidden="true"
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${role.gradient} text-white transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-ink">{role.label}</span>
                      <span className="block truncate text-xs text-ink-muted">
                        {role.blurb}
                      </span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                      aria-hidden="true"
                    />
                  </Link>
                </motion.li>
              );
            })}
          </ul>

          {/* Pre-login action */}
          <div className="mt-8 rounded-[24px] bg-gradient-to-br from-rose-500 via-fuchsia-600 to-blue-600 p-5">
            <p className="text-sm font-semibold text-white">First time here?</p>
            <p className="mt-1 text-xs leading-relaxed text-white/80">
              Book a slot without an account — the front desk confirms it.
            </p>
            <div className="mt-4">
              <NewAppointmentDialog />
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-ink-muted">
            {CLINIC_INFO.name} · {CLINIC_INFO.hours}
          </p>
        </motion.div>
      </section>
    </main>
  );
}
