"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { ArrowLeft, Check, KeyRound, ShieldCheck } from "lucide-react";
import AnimatedField from "@/components/login/AnimatedField";
import { StretchButton } from "@/components/motion-ui/buttons";
import TextReveal from "@/components/motion/TextReveal";
import { changePassword, passwordProblem } from "@/lib/accounts";
import { ROLE_HOME, patchSession, useSession } from "@/lib/session";

/**
 * Change password — reachable from every portal's account menu, and forced
 * on first sign-in when an admin issued the password.
 */
function ChangePasswordForm() {
  const session = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const first = params.get("first") === "1";

  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const home = session ? ROLE_HOME[session.role] : "/login";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!session) return;

    const data = new FormData(event.currentTarget);
    const current = String(data.get("current") ?? "");
    const next = String(data.get("next") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (next !== confirm) {
      setError("The two new passwords don't match.");
      return;
    }
    const weak = passwordProblem(next);
    if (weak) {
      setError(weak);
      return;
    }
    if (next === current) {
      setError("Pick a password you haven't used here before.");
      return;
    }

    const result = changePassword(session.username, current, next);
    if (!result.ok) {
      setError(
        result.reason === "wrong-password"
          ? "That isn't your current password."
          : "We couldn't change the password. Try again.",
      );
      return;
    }

    patchSession({ mustChangePassword: false });
    setDone(true);
    window.setTimeout(() => router.push(home), 1200);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        {!first ? (
          <Link
            href={home}
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to your dashboard
          </Link>
        ) : null}

        <div className="mt-5 rounded-card border border-line bg-surface p-6 shadow-soft md:p-8">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-gradient text-white"
          >
            <KeyRound className="h-5 w-5" />
          </span>

          <TextReveal as="h1" className="mt-5 text-2xl font-bold tracking-tight text-ink">
            {first ? "Set your own password" : "Change password"}
          </TextReveal>
          <p className="mt-2 text-sm text-ink-muted">
            {first
              ? "Your account was opened with a password an administrator issued. Choose your own before you carry on."
              : `Signed in as ${session?.name ?? ""}.`}
          </p>

          {done ? (
            <p
              role="status"
              className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Password changed. Taking you to your dashboard…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <AnimatedField
                label={first ? "Password you were given" : "Current password"}
                name="current"
                type="password"
                autoComplete="current-password"
              />
              <AnimatedField
                label="New password"
                name="next"
                type="password"
                autoComplete="new-password"
                hint="At least 8 characters, with a letter and a number."
              />
              <AnimatedField
                label="Repeat new password"
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
                Save new password
              </StretchButton>
            </form>
          )}

          <p className="mt-6 flex items-start gap-2 border-t border-line pt-5 text-xs text-ink-muted">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Sample build — credentials live in this browser only. Hooked to the
            backend, this screen calls the change-password endpoint and the
            server stores nothing but a hash.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChangePasswordView() {
  return (
    <Suspense fallback={null}>
      <ChangePasswordForm />
    </Suspense>
  );
}
