"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import AnimatedField from "@/components/login/AnimatedField";
import { StretchButton } from "@/components/motion-ui/buttons";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { CLINIC_INFO, ROLES, findRole, type RoleKey } from "@/lib/roles";
import { cn } from "@/lib/utils";

/**
 * One shared background layer for the whole admin sign-in card: the
 * illustration bleeds in from the right, feathered by a left-to-right mask
 * so it fades into the plain text zone instead of ending in a hard rectangle
 * — there's no seam between a "left panel" and "right panel" because it's
 * one continuous layer behind the whole card. A few decorative circles /
 * rounded shapes / a pin-drop marker are scattered on top of the fade for
 * texture where the illustration has already faded out.
 */
function AdminIllustrationBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f3f6fd] to-[#e3ecfb]" />

      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, transparent 6%, black 42%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, transparent 6%, black 42%, black 100%)",
        }}
      >
        <Image
          src="/images/admin-login.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[78%_38%] opacity-95"
        />
      </div>

      {/* Decorative shapes over the faded-out left/lower zone. */}
      <div className="absolute -left-10 bottom-10 h-32 w-32 rounded-full bg-blue-50" />
      <div className="absolute left-16 bottom-6 h-16 w-16 -rotate-6 rounded-2xl border-2 border-sky-100" />
      <div className="absolute left-6 top-24 h-2.5 w-2.5 rounded-full bg-sky-300" />
      <MapPin
        className="absolute left-[38%] bottom-24 h-8 w-8 -rotate-6 text-blue-200"
        strokeWidth={1.5}
      />
    </div>
  );
}

/**
 * Role sign-in — 2-grid: clinic information on the left, the form on the
 * right with demo credentials already filled in. There is no authentication
 * in this build; submitting routes straight to the portal.
 *
 * Takes the role key (not the RoleConfig) because RoleConfig carries a
 * Lucide icon component, which can't cross the server → client boundary
 * from the server-component page.tsx.
 *
 * The admin role gets a distinct light/blue treatment (illustration
 * background, decorative shapes) — the other four roles keep the original
 * dark aurora look.
 */
export default function SignInView({ roleKey }: { roleKey: RoleKey }) {
  const router = useRouter();
  const reduced = useReducedMotionSafe();
  const [pending, setPending] = useState(false);
  const role = findRole(roleKey)!;
  const Icon = role.icon;
  const isAdmin = role.key === "admin";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    window.setTimeout(() => router.push(role.home), reduced ? 0 : 600);
  };

  const formFields = (
    <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
      <AnimatedField
        label="Username"
        name="username"
        defaultValue={role.demoUser}
        autoComplete="username"
      />
      <AnimatedField
        label="Password"
        name="password"
        type="password"
        defaultValue={role.demoPass}
        autoComplete="current-password"
      />

      <label className="flex cursor-pointer items-center gap-2 pt-1 text-sm text-ink-muted">
        <input
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border-line accent-[#2563EB]"
        />
        Keep me signed in on this device
      </label>

      <StretchButton type="submit" className="w-full" disabled={pending}>
        {pending ? "Opening portal…" : `Sign in as ${role.label}`}
      </StretchButton>
    </form>
  );

  const switchRole = (
    <div className="mt-8 border-t border-line pt-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Switch role
      </p>
      <ul className="mt-3 flex list-none flex-wrap gap-2">
        {ROLES.filter((entry) => entry.key !== role.key).map((entry) => (
          <li key={entry.key}>
            <Link
              href={`/signin/${entry.key}`}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
            >
              {entry.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  if (isAdmin) {
    return (
      <main className="isolate relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#dbe6fb] via-[#eef3fc] to-[#e3ecfb] px-4 py-10 sm:px-8">
        {/* Big soft shapes peeking from behind the card's corners, like the
            reference — they sit outside the card so its border clips them. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-200/50 blur-[2px]" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#c7d6f5]/70 blur-[2px]" />
        </div>

        {/* One unified card: a single rounded border around the whole
            sign-in experience, no seam between a "left panel" and a "right
            panel" — the illustration bleeds continuously behind both. */}
        <div className="isolate relative w-full max-w-6xl overflow-hidden rounded-[2.5rem] border-2 border-[#16233f] bg-white shadow-2xl">
          <AdminIllustrationBackground />

          <div className="relative grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:p-14">
            {/* Left — role info, plain text (the illustration has already
                faded out by the time it reaches this column). */}
            <div className="flex flex-col justify-center">
              <Link
                href="/login"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#3c4a68] transition-colors hover:text-[#16233f]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                All portals
              </Link>

              <motion.div
                initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0.2 : 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6"
              >
                <span
                  aria-hidden="true"
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${role.gradient} text-white shadow-lg shadow-blue-900/10`}
                >
                  <Icon className="h-6 w-6" />
                </span>

                <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#16233f] sm:text-4xl">
                  {role.label} sign in
                </h1>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#3c4a68]">
                  {role.blurb}
                </p>

                <ul className="mt-7 list-none space-y-2.5">
                  {role.highlights.map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm text-[#2c3a5c]">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                        aria-hidden="true"
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Boxed so it stays legible over the illustration's fade. */}
              <div className="mt-8 max-w-sm rounded-[22px] border border-[#c7d6f5] bg-white p-5 shadow-md">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#16233f]">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  {CLINIC_INFO.name}
                </p>
                <ul className="mt-3 list-none space-y-2 text-xs text-[#4a577a]">
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {CLINIC_INFO.address}
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {CLINIC_INFO.hours}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {CLINIC_INFO.phone}
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {CLINIC_INFO.email}
                  </li>
                </ul>
                <ul className="mt-4 flex list-none flex-wrap gap-1.5">
                  {CLINIC_INFO.departments.map((dept) => (
                    <li
                      key={dept}
                      className="rounded-full border border-[#c7d6f5] px-2.5 py-1 text-[11px] text-[#4a577a]"
                    >
                      {dept}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — the sign-in form, boxed so it reads clearly against
                the illustration behind it. */}
            <motion.div
              initial={{ opacity: 0, y: reduced ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.55, delay: reduced ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center lg:justify-end"
            >
              <div className="w-full max-w-sm rounded-[28px] border border-[#c7d6f5] bg-white p-6 shadow-xl sm:p-8">
                <p className="inline-flex items-center gap-2 rounded-full border border-line bg-gradient-to-r from-blue-50 to-sky-50 px-3 py-1.5 text-xs font-medium text-ink">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
                  Demo credentials — no password check
                </p>

                <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink">
                  Welcome back
                </h2>
                <p className="mt-1.5 text-sm text-ink-muted">
                  Signing in opens <span className="font-medium text-ink">{role.home}</span>.
                </p>

                {formFields}
                {switchRole}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B1020] lg:grid lg:grid-cols-[1fr_1fr]">
      {/* ── Left grid — clinic information ──
          `isolate` gives this section its own stacking context, so the
          absolutely-positioned -z-10 background below paints above the
          section's own (transparent) box but still behind its in-flow
          content — without it, the negative z-index escapes to the nearest
          ancestor stacking context and sinks below <main>'s solid
          background instead. */}
      <section className="isolate relative flex min-h-[40vh] flex-col justify-between overflow-hidden px-6 py-10 sm:px-10 lg:min-h-screen lg:px-14 lg:py-14">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3B0A1E]/90 via-[#0B1020]/95 to-[#0A2A5E]/90" />
          <div className="animate-aurora-a absolute -left-24 top-10 h-[26rem] w-[26rem] rounded-full bg-[#E11D48]/25 blur-[130px]" />
          <div className="animate-aurora-b absolute -right-16 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[#2563EB]/30 blur-[130px]" />
        </div>

        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All portals
          </Link>

          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <span
              aria-hidden="true"
              className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${role.gradient} text-white`}
            >
              <Icon className="h-6 w-6" />
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {role.label} sign in
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
              {role.blurb}
            </p>

            <ul className="mt-7 list-none space-y-2.5">
              {role.highlights.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-white/75">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="mt-10 rounded-[22px] border border-white/15 bg-white/8 p-5 backdrop-blur-md">
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            {CLINIC_INFO.name}
          </p>
          <ul className="mt-3 list-none space-y-2 text-xs text-white/70">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {CLINIC_INFO.address}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {CLINIC_INFO.hours}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {CLINIC_INFO.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {CLINIC_INFO.email}
            </li>
          </ul>
          <ul className="mt-4 flex list-none flex-wrap gap-1.5">
            {CLINIC_INFO.departments.map((dept) => (
              <li
                key={dept}
                className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/70"
              >
                {dept}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Right grid — sign-in form ── */}
      <section className="flex min-h-screen items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.55, delay: reduced ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-gradient-to-r from-rose-50 to-blue-50 px-3 py-1.5 text-xs font-medium text-ink">
            <ShieldCheck className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
            Demo credentials — no password check
          </p>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink">
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            Signing in opens <span className="font-medium text-ink">{role.home}</span>.
          </p>

          {formFields}
          {switchRole}
        </motion.div>
      </section>
    </main>
  );
}
