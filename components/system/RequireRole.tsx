"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { canOpen, useSession } from "@/lib/session";
import type { RoleKey } from "@/lib/roles";

/**
 * Wraps a portal so only the role that signed in can see it.
 *
 * Nobody signed in, or the wrong role, and the person is sent back to the
 * portal picker with a note saying why. An account still carrying an
 * admin-issued password is pushed to the reset screen first.
 *
 * ⚠️ This is the UX half of access control. The server must refuse the same
 * requests — a client check only hides a page, it doesn't protect the data.
 */
export function RequireRole({
  allow,
  children,
}: {
  /** Roles allowed here. Omit to accept anyone signed in. */
  allow?: RoleKey[];
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const resolving = session === undefined;
  const permitted = session
    ? (allow ? allow.includes(session.role) : true) && canOpen(session.role, pathname)
    : false;

  const needsReset = Boolean(session?.mustChangePassword) && !pathname.startsWith("/account");

  useEffect(() => {
    if (resolving) return;
    if (!session) {
      router.replace(`/login?denied=signed-out&next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (needsReset) {
      router.replace("/account/password?first=1");
      return;
    }
    if (!permitted) {
      router.replace(`/login?denied=role&as=${session.role}`);
    }
  }, [resolving, session, permitted, needsReset, pathname, router]);

  if (resolving || !session || !permitted || needsReset) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg px-6 text-center">
        <div className="max-w-sm">
          <span
            aria-hidden="true"
            className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-line bg-surface text-ink-muted"
          >
            <ShieldAlert className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-medium text-ink">
            {resolving ? "Checking your session…" : "Taking you somewhere you can go…"}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {resolving
              ? "One moment."
              : "This workspace belongs to a different role."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RequireRole;
