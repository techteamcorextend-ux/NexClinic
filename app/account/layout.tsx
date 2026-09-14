import RequireRole from "@/components/system/RequireRole";

/** Account screens — anyone signed in manages their own credentials here. */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole>{children}</RequireRole>;
}
