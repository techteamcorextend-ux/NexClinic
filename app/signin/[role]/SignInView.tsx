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
 * Decorative circles / rounded rectangles / a pin-drop marker, scattered
 * behind the sign-in card. Admin-only — it's what pairs with the admin
 * portal's illustration on the left grid.
 */
function AdminFormDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -right-10 top-10 h-40 w-40 rounded-full border-2 border-blue-100" />
      <div className="absolute right-16 top-32 h-16 w-16 rotate-12 rounded-3xl bg-blue-50" />
      <div className="absolute -left-8 bottom-24 h-28 w-28 rounded-full bg-sky-50" />
      <div className="absolute left-10 bottom-10 h-14 w-14 -rotate-6 rounded-2xl border-2 border-sky-100" />
      <MapPin
        className="absolute right-10 bottom-16 h-9 w-9 -rotate-6 text-blue-200"
        strokeWidth={1.5}
      />
      <div className="absolute right-24 bottom-40 h-3 w-3 rounded-full bg-blue-200" />
      <div className="absolute left-24 top-24 h-2.5 w-2.5 rounded-full bg-sky-300" />
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

  return (
    <main
      className={cn(
        "min-h-screen lg:grid lg:grid-cols-[1fr_1fr]",
        isAdmin ? "bg-[#eef3fc]" : "bg-[#0B1020]",
      )}
    >
      {/* ── Left grid — clinic information ──
          `isolate` gives this section its own stacking context, so the
          absolutely-positioned -z-10 background below paints above the
          section's own (transparent) box but still behind its in-flow
          content — without it, the negative z-index escapes to the nearest
          ancestor stacking context and sinks below <main>'s solid
          background instead. */}
      <section className="isolate relative flex min-h-[40vh] flex-col justify-between overflow-hidden px-6 py-10 sm:px-10 lg:min-h-screen lg:px-14 lg:py-14">
        {isAdmin ? (
          <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#eef3fc] via-[#e8eefc] to-[#dbe6fb]" />
            <div className="animate-aurora-a absolute -left-16 top-0 h-[24rem] w-[24rem] rounded-full bg-blue-200/40 blur-[110px]" />
            <div className="animate-aurora-b absolute -right-10 bottom-10 h-[22rem] w-[22rem] rounded-full bg-orange-200/25 blur-[110px]" />
            <div
              className="absolute inset-6 overflow-hidden rounded-[2.5rem] sm:inset-10 lg:inset-12"
              style={{
                maskImage:
                  "radial-gradient(ellipse 75% 70% at 50% 38%, black 60%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 75% 70% at 50% 38%, black 60%, transparent 100%)",
              }}
            >
              <Image
                src="/images/admin-login.jpg"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-top opacity-90"
              />
            </div>
          </div>
        ) : (
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B0A1E]/90 via-[#0B1020]/95 to-[#0A2A5E]/90" />
            <div className="animate-aurora-a absolute -left-24 top-10 h-[26rem] w-[26rem] rounded-full bg-[#E11D48]/25 blur-[130px]" />
            <div className="animate-aurora-b absolute -right-16 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[#2563EB]/30 blur-[130px]" />
          </div>
        )}

        <div>
          <Link
            href="/login"
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
              isAdmin
                ? "text-[#3c4a68] hover:text-[#16233f]"
                : "text-white/60 hover:text-white",
            )}
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
              className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${role.gradient} text-white shadow-lg shadow-blue-900/10`}
            >
              <Icon className="h-6 w-6" />
            </span>

            <h1
              className={cn(
                "mt-5 text-3xl font-bold tracking-tight sm:text-4xl",
                isAdmin ? "text-[#16233f]" : "text-white",
              )}
            >
              {role.label} sign in
            </h1>
            <p
              className={cn(
                "mt-2 max-w-md text-sm leading-relaxed",
                isAdmin ? "text-[#3c4a68]" : "text-white/70",
              )}
            >
              {role.blurb}
            </p>

            <ul className="mt-7 list-none space-y-2.5">
              {role.highlights.map((line) => (
                <li
                  key={line}
                  className={cn(
                    "flex items-start gap-2.5 text-sm",
                    isAdmin ? "text-[#2c3a5c]" : "text-white/75",
                  )}
                >
                  <CheckCircle2
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      isAdmin ? "text-blue-500" : "text-emerald-400",
                    )}
                    aria-hidden="true"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div
          className={cn(
            "mt-10 rounded-[22px] border p-5 backdrop-blur-md",
            isAdmin
              ? "border-[#c7d6f5] bg-white/70"
              : "border-white/15 bg-white/8",
          )}
        >
          <p
            className={cn(
              "flex items-center gap-2 text-sm font-semibold",
              isAdmin ? "text-[#16233f]" : "text-white",
            )}
          >
            <Building2 className="h-4 w-4" aria-hidden="true" />
            {CLINIC_INFO.name}
          </p>
          <ul
            className={cn(
              "mt-3 list-none space-y-2 text-xs",
              isAdmin ? "text-[#4a577a]" : "text-white/70",
            )}
          >
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
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px]",
                  isAdmin
                    ? "border-[#c7d6f5] text-[#4a577a]"
                    : "border-white/15 text-white/70",
                )}
              >
                {dept}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Right grid — sign-in form ── */}
      <section className="isolate relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-12 sm:px-10 lg:px-14">
        {isAdmin ? <AdminFormDecor /> : null}

        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.55, delay: reduced ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <p
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
              isAdmin
                ? "border-line bg-gradient-to-r from-blue-50 to-sky-50 text-ink"
                : "border-line bg-gradient-to-r from-rose-50 to-blue-50 text-ink",
            )}
          >
            <ShieldCheck
              className={cn("h-3.5 w-3.5", isAdmin ? "text-blue-500" : "text-rose-500")}
              aria-hidden="true"
            />
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
