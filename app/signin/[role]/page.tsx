import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ROLES, findRole } from "@/lib/roles";
import SignInView from "./SignInView";

type Params = { params: { role: string } };

export function generateStaticParams() {
  return ROLES.map((role) => ({ role: role.key }));
}

export function generateMetadata({ params }: Params): Metadata {
  const role = findRole(params.role);
  return { title: role ? `${role.label} sign in` : "Sign in" };
}

export default function SignInPage({ params }: Params) {
  const role = findRole(params.role);
  if (!role) notFound();
  return <SignInView roleKey={role.key} />;
}
