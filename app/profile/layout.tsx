import RequireRole from "@/components/system/RequireRole";

/** Profile pages are readable by anyone signed in — see SHARED_AREAS. */
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole>{children}</RequireRole>;
}
