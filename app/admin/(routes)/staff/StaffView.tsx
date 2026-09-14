"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, EmptyState, FilterSelect, GradientButton, Reveal } from "@/components/admin/ui";
import { MediaCard } from "@/components/ui/MediaCard";
import { CascadeGrid } from "@/components/ui/CascadeGrid";
import { useClinic } from "@/lib/clinic-store";
import { issueStaffCredentials } from "@/lib/accounts";
import type { RoleKey } from "@/lib/roles";
import type { StaffMember } from "@/lib/clinic-types";

/** Which portal each access role signs in to. Nurses have no portal yet. */
const PORTAL_FOR_ACCESS: Record<StaffMember["accessRole"], RoleKey | null> = {
  "Super Admin": "admin",
  Surgeon: "surgeon",
  Receptionist: "reception",
  Inventory: "inventory",
  Nurse: null,
};

const ACCESS_ROLES: StaffMember["accessRole"][] = [
  "Super Admin",
  "Surgeon",
  "Receptionist",
  "Inventory",
  "Nurse",
];

/** Creates the staff record and fires a welcome push at their phone. */
function AddStaffDialog() {
  const { dispatch } = useClinic();
  const [saved, setSaved] = useState(false);
  /** Shown once, right after the record is created — never stored in view. */
  const [issued, setIssued] = useState<{
    name: string;
    username: string;
    tempPassword: string;
    portal: RoleKey | null;
  } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim() || "New staff member";
    const accessRole = String(
      form.get("accessRole") ?? "Nurse",
    ) as StaffMember["accessRole"];
    dispatch({
      type: "staff/add",
      member: {
        name,
        role: String(form.get("role") ?? "Staff"),
        dept: String(form.get("dept") ?? "General"),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? ""),
        shiftStart: String(form.get("shiftStart") ?? "09:00"),
        shiftEnd: String(form.get("shiftEnd") ?? "17:00"),
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        salary: {
          base: Number(form.get("base") ?? 50000),
          hra: 9000,
          allowance: 4000,
          bonus: 0,
          taxPercent: 10,
        },
        username: name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, ""),
        accessRole,
        active: true,
      },
    });

    // Staff never register themselves — the administrator issues a one-time
    // password here, and the holder is forced to replace it at first sign-in.
    const portal = PORTAL_FOR_ACCESS[accessRole];
    if (portal) {
      const credentials = issueStaffCredentials({
        personId: `ST-new-${Date.now()}`,
        name,
        email: String(form.get("email") ?? ""),
        role: portal,
      });
      setIssued({ name, portal, ...credentials });
    } else {
      setIssued({ name, portal, username: "", tempPassword: "" });
    }
    setSaved(true);
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setSaved(false);
          setIssued(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <GradientButton>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Add Staff
        </GradientButton>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogTitle>Add a staff member</DialogTitle>
        <DialogDescription>
          Creates the record, generates a login and pushes a welcome message to
          their phone.
        </DialogDescription>

        {saved ? (
          <div role="status" className="mt-6 rounded-chip bg-admin-bg p-5 text-sm text-admin-ink">
            <p className="font-semibold">{issued?.name} was added to the register.</p>

            {issued?.portal ? (
              <>
                <p className="mt-2 text-admin-muted">
                  Hand these over in person or by phone — the password works once
                  and they must replace it at first sign-in.
                </p>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-[14px] border border-admin-line bg-white p-4 font-mono text-sm dark:bg-admin-card">
                  <dt className="text-admin-muted">Portal</dt>
                  <dd className="font-semibold">/signin/{issued.portal}</dd>
                  <dt className="text-admin-muted">Username</dt>
                  <dd className="font-semibold">{issued.username}</dd>
                  <dt className="text-admin-muted">Password</dt>
                  <dd className="font-semibold">{issued.tempPassword}</dd>
                </dl>
              </>
            ) : (
              <p className="mt-2 text-admin-muted">
                Nursing has no portal of its own yet, so no login was created.
              </p>
            )}

            <p className="mt-4 text-admin-muted">
              Shifts and pay are editable from{" "}
              <Link href="/admin/access" className="font-semibold text-admin-pink underline">
                Access Control
              </Link>
              .
            </p>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="staff-name">Full name</Label>
                <Input id="staff-name" name="name" required />
              </div>
              <div>
                <Label htmlFor="staff-role">Designation</Label>
                <Input id="staff-role" name="role" placeholder="Staff Nurse" required />
              </div>
              <div>
                <Label htmlFor="staff-dept">Department</Label>
                <Input id="staff-dept" name="dept" placeholder="Wards" required />
              </div>
              <div>
                <Label htmlFor="staff-access">Access role</Label>
                <select
                  id="staff-access"
                  name="accessRole"
                  defaultValue="Nurse"
                  className="h-12 w-full rounded-chip border border-admin-line bg-white dark:bg-admin-card px-3 text-base text-admin-ink focus:border-admin-pink focus:outline-none"
                >
                  {ACCESS_ROLES.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="staff-phone">Phone</Label>
                <Input id="staff-phone" name="phone" type="tel" required />
              </div>
              <div>
                <Label htmlFor="staff-email">Email</Label>
                <Input id="staff-email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="staff-start">Shift start</Label>
                <Input id="staff-start" name="shiftStart" type="time" defaultValue="09:00" />
              </div>
              <div>
                <Label htmlFor="staff-end">Shift end</Label>
                <Input id="staff-end" name="shiftEnd" type="time" defaultValue="17:00" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="staff-base">Base pay (₹ per month)</Label>
                <Input id="staff-base" name="base" type="number" min={0} defaultValue={50000} />
              </div>
            </div>

            <GradientButton type="submit" className="w-full">
              Create staff record
            </GradientButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function StaffView() {
  const { state } = useClinic();
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All departments");

  const departments = useMemo(
    () => ["All departments", ...Array.from(new Set(state.staff.map((m) => m.dept)))],
    [state.staff],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.staff.filter((member) => {
      if (dept !== "All departments" && member.dept !== dept) return false;
      if (!needle) return true;
      return (
        member.name.toLowerCase().includes(needle) ||
        member.role.toLowerCase().includes(needle) ||
        member.dept.toLowerCase().includes(needle)
      );
    });
  }, [state.staff, query, dept]);

  return (
    <div className="pb-2">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-sm text-admin-muted">
            {state.staff.length} people on the register. Open a profile to adjust
            shift timings — the change pushes a notification to their phone.
          </p>
          <AddStaffDialog />
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="mt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
            <div className="btn-aurora rounded-full relative">
              <label htmlFor="staff-search" className="sr-only">
                Search staff
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted"
                aria-hidden="true"
              />
              <input
                id="staff-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, designation or department"
                className="h-11 w-full rounded-full border border-admin-line bg-white dark:bg-admin-card pl-11 pr-4 text-sm text-admin-ink placeholder:text-admin-muted focus:border-admin-pink focus:outline-none"
              />
            </div>
            <FilterSelect
              label="Filter by department"
              options={departments}
              value={dept}
              onChange={setDept}
            />
          </div>

          {rows.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                icon={<Search className="h-5 w-5" />}
                title="No matching staff"
                description="Try a different search term or clear the department filter."
              />
            </div>
          ) : (
            <CascadeGrid className="mt-5 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((member) => (
                <MediaCard
                  key={member.id}
                  seed={member.id}
                  badgeLabel={member.active ? "Active" : "Inactive"}
                  badgeStatus={member.active ? "active" : "inactive"}
                  title={member.name}
                  avatarInitials={member.initials}
                  line1={member.role}
                  line2={member.dept}
                  actionLabel="Open profile"
                  href={`/admin/staff/${member.id}`}
                  className="max-w-[228px]"
                />
              ))}
            </CascadeGrid>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
