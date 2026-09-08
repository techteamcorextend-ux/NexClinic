"use client";

import { useState, type FormEvent } from "react";
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

/**
 * Role sign-in — 2-grid: clinic information on the left, the form on the
 * right with demo credentials already filled in. There is no authentication
 * in this build; submitting routes straight to the portal.
 *
 * Takes the role key (not the RoleConfig) because RoleConfig carries a
 * Lucide icon component, which can't cross the server → client boundary
 * from the server-component page.tsx.
 */
export default function SignInView({ roleKey }: { roleKey: RoleKey }) {
  const router = useRouter();
  const reduced = useReducedMotionSafe();
  const [pending, setPending] = useState(false);
  const role = findRole(roleKey)!;
  const Icon = role.icon;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    window.setTimeout(() => router.push(role.home), reduced ? 0 : 600);
  };

  return (
    <main className="min-h-screen bg-[#0B1020] lg:grid lg:grid-cols-[1fr_1fr]">
      {/* ── Left grid — clinic information ── */}
      <section className="relative flex min-h-[40vh] flex-col justify-between overflow-hidden px-6 py-10 sm:px-10 lg:min-h-screen lg:px-14 lg:py-14">
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
        </motion.div>
      </section>
    </main>
  );
}
