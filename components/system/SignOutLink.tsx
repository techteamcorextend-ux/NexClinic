"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/lib/session";

/**
 * A link to the portal picker that actually ends the session first.
 * Without the clear, "log out" left you signed in behind the picker and one
 * click put you straight back into the portal.
 */
export function SignOutLink({
  className,
  children,
  ...rest
}: {
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  title?: string;
  onClick?: () => void;
}) {
  const { onClick, ...anchorProps } = rest;
  return (
    <Link
      href="/login"
      className={className}
      onClick={() => {
        signOut();
        onClick?.();
      }}
      {...anchorProps}
    >
      {children}
    </Link>
  );
}

export default SignOutLink;
