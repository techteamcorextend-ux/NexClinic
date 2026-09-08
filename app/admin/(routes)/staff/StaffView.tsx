"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Avatar,
  Card,
  EmptyState,
  FilterSelect,
  GradientButton,
  Reveal,
} from "@/components/admin/ui";
import StatusBadge from "@/components/admin/StatusBadge";
import { useClinic } from "@/lib/clinic-store";
import type { StaffMember } from "@/lib/clinic-types";

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim() || "New staff member";
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
        accessRole: String(form.get("accessRole") ?? "Nurse") as StaffMember["accessRole"],
        active: true,
      },
    });
    setSaved(true);
  };

  return (
    <Dialog onOpenChange={(open) => !open && setSaved(false)}>
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
          <p role="status" className="mt-6 rounded-chip bg-admin-bg p-5 text-sm text-admin-ink">
            Staff member added and credentials issued. Check{" "}
            <Link href="/admin/access" className="font-semibold text-admin-pink underline">
              Access Control
            </Link>
            .
          </p>
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
                  className="h-12 w-full rounded-chip border border-admin-line bg-white px-3 text-base text-admin-ink focus:border-admin-pink focus:outline-none"
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
            <div className="relative">
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
                className="h-11 w-full rounded-full border border-admin-line bg-white pl-11 pr-4 text-sm text-admin-ink placeholder:text-admin-muted focus:border-admin-pink focus:outline-none"
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
            <ul className="mt-5 grid list-none grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((member, index) => (
                <li key={member.id}>
                  <Link
                    href={`/admin/staff/${member.id}`}
                    className="group flex h-full flex-col rounded-admin border border-admin-line bg-white p-5 transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:border-admin-pink/40 hover:shadow-admin-lg motion-reduce:hover:translate-y-0"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar initials={member.initials} name={member.name} index={index} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-admin-ink">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-admin-muted">{member.role}</p>
                      </div>
                      <StatusBadge status={member.active ? "Active" : "Inactive"} />
                    </div>

                    <dl className="mt-4 space-y-1.5 text-xs">
                      <div className="flex justify-between gap-3">
                        <dt className="text-admin-muted">Department</dt>
                        <dd className="font-medium text-admin-ink">{member.dept}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="flex items-center gap-1 text-admin-muted">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          Shift
                        </dt>
                        <dd className="font-medium tabular-nums text-admin-ink">
                          {member.shiftStart} – {member.shiftEnd}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-admin-muted">Access</dt>
                        <dd className="font-medium text-admin-ink">{member.accessRole}</dd>
                      </div>
                    </dl>

                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-admin-pink">
                      Open profile
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transform-none"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
