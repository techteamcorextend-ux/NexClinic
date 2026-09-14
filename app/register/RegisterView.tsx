"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Check, ShieldCheck, UserPlus } from "lucide-react";
import AnimatedField from "@/components/login/AnimatedField";
import { StretchButton } from "@/components/motion-ui/buttons";
import TextReveal from "@/components/motion/TextReveal";
import { registerPatient } from "@/lib/accounts";
import { signIn } from "@/lib/session";

/**
 * Patient self-registration.
 *
 * Only patients register themselves — staff accounts are issued by an
 * administrator from Admin → Staff, which is the rule the real backend
 * should enforce too.
 */
export default function RegisterView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const username = String(data.get("username") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (!name || !email || !username) {
      setError("Fill in your name, email and a username.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    // Until the backend mints real ids, a new patient is keyed off their
    // username. `findPerson` returns nothing for it, so the profile page
    // falls back to what the session carries.
    const result = registerPatient({
      personId: `p-new-${username}`,
      name,
      email,
      username,
      password,
    });

    if (!result.ok) {
      setError(
        result.reason === "taken"
          ? "That username is already registered. Try another."
          : "Use at least 8 characters, with a letter and a number.",
      );
      return;
    }

    signIn({
      role: "patient",
      personId: result.account.personId,
      username: result.account.username,
      name: result.account.name,
      mustChangePassword: false,
    });
    setDone(true);
    window.setTimeout(() => router.push("/patient/dashboard"), 1000);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>

        <div className="mt-5 rounded-card border border-line bg-surface p-6 shadow-soft md:p-8">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-gradient text-white"
          >
            <UserPlus className="h-5 w-5" />
          </span>

          <TextReveal as="h1" className="mt-5 text-2xl font-bold tracking-tight text-ink">
            Create a patient account
          </TextReveal>
          <p className="mt-2 text-sm text-ink-muted">
            For patients only. Clinic staff are given credentials by an
            administrator.
          </p>

          {done ? (
            <p
              role="status"
              className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Account created. Opening your dashboard…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <AnimatedField label="Full name" name="name" autoComplete="name" />
              <AnimatedField label="Email" name="email" type="email" autoComplete="email" />
              <AnimatedField label="Username" name="username" autoComplete="username" />
              <AnimatedField
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                hint="At least 8 characters, with a letter and a number."
              />
              <AnimatedField
                label="Repeat password"
                name="confirm"
                type="password"
                autoComplete="new-password"
              />

              {error ? (
                <p
                  role="alert"
                  className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                >
                  {error}
                </p>
              ) : null}

              <StretchButton type="submit" className="btn-aurora w-full">
                Create account
              </StretchButton>
            </form>
          )}

          <p className="mt-6 flex items-start gap-2 border-t border-line pt-5 text-xs text-ink-muted">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Sample build — this account lives in this browser only, and no
            medical record is created for it.
          </p>
        </div>
      </div>
    </div>
  );
}
