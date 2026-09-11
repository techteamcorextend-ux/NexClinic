"use client";

import { useState, type FormEvent, type ReactNode } from "react";
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

import TextReveal from "@/components/motion/TextReveal";
import ThemeToggle from "@/components/system/ThemeToggle";
/**
 * Shared backdrop for the whole admin sign-in screen: the desk photo sits
 * behind everything, blurred and dimmed just enough to read as texture
 * rather than a literal photo, with a dark wash and an indigo glow tying it
 * to the role's accent colour. The sign-in card itself is a translucent
 * glass panel floating on top of this — same treatment as the main /login
 * page's shared backdrop.
 */
function AdminBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      <Image
        src="/images/adminbg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-105 object-cover object-[78%_38%] opacity-70 blur-[2px]"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070d]/70 via-[#0B1020]/65 to-[#151235]/70" />
      <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-indigo-500/30 blur-[130px]" />
      <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#2563EB]/25 blur-[130px]" />
    </div>
  );
}

/**
 * Shared backdrop for the surgeon sign-in screen: the operating-theatre
 * photo sits behind both glass panels, dimmed and softened just enough to
 * read as texture rather than a literal photo, with a teal/indigo wash
 * tying it to the role's own sky-to-indigo accent.
 */
function SurgeonBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <Image
        src="/images/healing-together.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-105 object-cover object-[62%_40%] opacity-65 blur-[3px]"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#04151f]/65 via-[#060b1a]/60 to-[#0a1440]/65" />
      <div className="animate-aurora-a absolute -left-24 top-0 h-[30rem] w-[30rem] rounded-full bg-[#0EA5E9]/30 blur-[130px]" />
      <div className="animate-aurora-b absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#4F46E5]/30 blur-[130px]" />
    </div>
  );
}

/**
 * Shared backdrop for the receptionist sign-in screen: the front-desk
 * illustration sits behind both glass panels, dimmed and softened just
 * enough to read as texture, with an emerald/teal wash tying it to the
 * role's own accent.
 */
function ReceptionBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <Image
        src="/images/receptionist-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-105 object-cover object-center opacity-55 blur-[3px]"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#031814]/78 via-[#061024]/74 to-[#031814]/78" />
      <div className="animate-aurora-a absolute -left-24 top-0 h-[30rem] w-[30rem] rounded-full bg-[#10B981]/30 blur-[130px]" />
      <div className="animate-aurora-b absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#0D9488]/30 blur-[130px]" />
    </div>
  );
}

/**
 * Shared backdrop for the patient sign-in screen: the telehealth-dashboard
 * photo sits behind both glass panels, already dark enough to need only a
 * light wash, with a rose/pink glow tying it to the role's own accent.
 */
function PatientBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <Image
        src="/images/patient-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-105 object-cover object-center opacity-70 blur-[2px]"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0512]/60 via-[#060b1a]/55 to-[#1a0512]/60" />
      <div className="animate-aurora-a absolute -left-24 top-0 h-[30rem] w-[30rem] rounded-full bg-[#F43F5E]/30 blur-[130px]" />
      <div className="animate-aurora-b absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#EC4899]/25 blur-[130px]" />
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
 * Admin, surgeon, receptionist and patient each get a distinct photo-backed
 * glassmorphism treatment — inventory manager keeps the original dark
 * aurora look until it gets its own image.
 */
export default function SignInView({ roleKey }: { roleKey: RoleKey }) {
  const router = useRouter();
  const reduced = useReducedMotionSafe();
  const [pending, setPending] = useState(false);
  const role = findRole(roleKey)!;
  const Icon = role.icon;
  const isAdmin = role.key === "admin";
  const isSurgeon = role.key === "surgeon";
  const isReception = role.key === "reception";
  const isPatient = role.key === "patient";
  const isGlass = isAdmin || isSurgeon || isReception || isPatient;

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

      <label
        className={cn(
          "flex cursor-pointer items-center gap-2 pt-1 text-sm",
          isGlass ? "text-white/70" : "text-ink-muted",
        )}
      >
        <input
          type="checkbox"
          defaultChecked
          className={cn("h-4 w-4 rounded accent-[#2563EB]", isGlass ? "border-white/30" : "border-line")}
        />
        Keep me signed in on this device
      </label>

      <StretchButton type="submit" className="w-full" disabled={pending}>
        {pending ? "Opening portal…" : `Sign in as ${role.label}`}
      </StretchButton>
    </form>
  );

  const switchRole = (
    <div className={cn("mt-8 border-t pt-5", isGlass ? "border-white/15" : "border-line")}>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.14em]",
          isGlass ? "text-white/50" : "text-ink-muted",
        )}
      >
        Switch role
      </p>
      <ul className="mt-3 flex list-none flex-wrap gap-2">
        {ROLES.filter((entry) => entry.key !== role.key).map((entry) => (
          <li key={entry.key}>
            <Link
              href={`/signin/${entry.key}`}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isGlass
                  ? "border-white/15 text-white/60 hover:border-white/35 hover:text-white"
                  : "border-line text-ink-muted hover:border-ink/25 hover:text-ink",
              )}
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
      <main className="isolate relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070d] px-4 py-10 sm:px-8">
        <AdminBackdrop />

        {/* One unified glass card: a single translucent panel around the
            whole sign-in experience, floating on the shared backdrop —
            no seam between a "left panel" and a "right panel". */}
        <div className="isolate relative w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/[0.05] shadow-[0_8px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="relative grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:p-14">
            {/* Left — role info. */}
            <div className="flex flex-col justify-center">
              <Link
                href="/login"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
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
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${role.gradient} text-white shadow-lg shadow-black/20`}
                >
                  <Icon className="h-6 w-6" />
                </span>

                <TextReveal as="h1" className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {role.label} sign in
                </TextReveal>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
                  {role.blurb}
                </p>

                <ul className="mt-7 list-none space-y-2.5">
                  {role.highlights.map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm text-white/80">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300"
                        aria-hidden="true"
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Nested glass card so it stays legible over the backdrop. */}
              <div className="mt-8 max-w-sm rounded-[22px] border border-white/15 bg-white/[0.04] p-5 backdrop-blur-sm">
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  {CLINIC_INFO.name}
                </p>
                <ul className="mt-3 list-none space-y-2 text-xs text-white/65">
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
                      className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/65"
                    >
                      {dept}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — the sign-in form, its own glass panel so it reads
                clearly against the backdrop. */}
            <motion.div
              initial={{ opacity: 0, y: reduced ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.55, delay: reduced ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center lg:justify-end"
            >
              <div className="w-full max-w-sm rounded-[28px] border border-white/15 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
                  Demo credentials — no password check
                </p>

                <TextReveal as="h2" className="mt-5 text-2xl font-bold tracking-tight text-white">
                  Welcome back
                </TextReveal>
                <p className="mt-1.5 text-sm text-white/60">
                  Signing in opens <span className="font-medium text-white">{role.home}</span>.
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

  /**
   * Two glass panels — role info on the left, sign-in form on the right —
   * floating over a role-specific photo backdrop. Shared by every role that
   * has its own background image, so the ~100 lines of layout markup exist
   * exactly once.
   */
  const renderPhotoGlass = (backdrop: ReactNode, mainBg: string, accentColor: string) => (
    <main className={cn("relative isolate min-h-screen overflow-hidden", mainBg)}>
      {backdrop}

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-6 px-6 py-10 sm:px-10 lg:grid-cols-2 lg:gap-10 lg:px-14 lg:py-14">
        {/* Left panel — role info */}
        <motion.section
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-between rounded-[32px] border border-white/15 bg-white/[0.04] p-7 shadow-[0_8px_60px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:p-9 lg:min-h-[calc(100vh-7rem)] lg:p-12"
        >
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All portals
            </Link>

            <span
              aria-hidden="true"
              className={`mt-8 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${role.gradient} text-white`}
            >
              <Icon className="h-6 w-6" />
            </span>

            <TextReveal as="h1" className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {role.label} sign in
            </TextReveal>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
              {role.blurb}
            </p>

            <ul className="mt-7 list-none space-y-2.5">
              {role.highlights.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-white/80">
                  <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", accentColor)} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 rounded-[22px] border border-white/15 bg-white/[0.03] p-5 backdrop-blur-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              {CLINIC_INFO.name}
            </p>
            <ul className="mt-3 list-none space-y-2 text-xs text-white/65">
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
                  className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/65"
                >
                  {dept}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Right panel — sign-in form */}
        <motion.section
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.55, delay: reduced ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-white/15 bg-white/[0.04] p-7 shadow-[0_8px_60px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:p-9 lg:p-12"
        >
          <div className="mx-auto w-full max-w-sm">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
              <ShieldCheck className={cn("h-3.5 w-3.5", accentColor)} aria-hidden="true" />
              Demo credentials — no password check
            </p>

            <TextReveal as="h2" className="mt-5 text-2xl font-bold tracking-tight text-white">
              Welcome back
            </TextReveal>
            <p className="mt-1.5 text-sm text-white/60">
              Signing in opens <span className="font-medium text-white">{role.home}</span>.
            </p>

            {formFields}
            {switchRole}
          </div>
        </motion.section>
      </div>
    </main>
  );

  if (isSurgeon) {
    return renderPhotoGlass(<SurgeonBackdrop />, "bg-[#060b1a]", "text-sky-300");
  }

  if (isReception) {
    return renderPhotoGlass(<ReceptionBackdrop />, "bg-[#04120f]", "text-emerald-300");
  }

  if (isPatient) {
    return renderPhotoGlass(<PatientBackdrop />, "bg-[#12040c]", "text-rose-300");
  }

  return (
    <main className="min-h-screen bg-[#0B1020] lg:grid lg:grid-cols-[1fr_1fr]">
      {/* No header on this screen — pin the theme switch to the corner. */}
      <div className="pointer-events-auto fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

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

            <TextReveal as="h1" className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {role.label} sign in
            </TextReveal>
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
      <section className="flex min-h-screen items-center justify-center bg-white dark:bg-p-card px-6 py-12 sm:px-10 lg:px-14">
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

          <TextReveal as="h2" className="mt-5 text-2xl font-bold tracking-tight text-ink">
            Welcome back
          </TextReveal>
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
