"use client";

import { useState, type FormEvent } from "react";
import { KeyRound, RefreshCw, ShieldCheck, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, Card, CardHeading, GradientButton, Reveal } from "@/components/admin/ui";
import StatusBadge from "@/components/admin/StatusBadge";
import { DownloadButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import type { StaffMember } from "@/lib/clinic-types";
import { downloadCsv } from "@/lib/downloads";

const ACCESS_ROLES: StaffMember["accessRole"][] = [
  "Super Admin",
  "Surgeon",
  "Receptionist",
  "Inventory",
  "Nurse",
];

/** Which portal each access role can reach — shown so the boundary is explicit. */
const ROLE_SCOPE: Record<StaffMember["accessRole"], string> = {
  "Super Admin": "/admin · no inventory",
  Surgeon: "/surgeon",
  Receptionist: "/reception",
  Inventory: "/inventory only",
  Nurse: "/reception (read-only)",
};

function AddCredentialsDialog() {
  const { dispatch } = useClinic();
  const [issued, setIssued] = useState<{ user: string; pass: string } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim() || "New staff member";
    const accessRole = String(form.get("accessRole") ?? "Nurse") as StaffMember["accessRole"];
    const username = name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");
    const password = `${accessRole.split(" ")[0].toLowerCase()}@${new Date().getFullYear()}`;

    dispatch({
      type: "staff/add",
      member: {
        name,
        role: String(form.get("role") ?? accessRole),
        dept: String(form.get("dept") ?? "General"),
        phone: String(form.get("phone") ?? ""),
        email: `${username}@nexclinic.health`,
        shiftStart: "09:00",
        shiftEnd: "17:00",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        salary: { base: 50000, hra: 9000, allowance: 4000, bonus: 0, taxPercent: 10 },
        username,
        accessRole,
        active: true,
      },
    });
    setIssued({ user: username, pass: password });
  };

  return (
    <Dialog onOpenChange={(open) => !open && setIssued(null)}>
      <DialogTrigger asChild>
        <GradientButton>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Add new staff
        </GradientButton>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Generate credentials</DialogTitle>
        <DialogDescription>
          Creates the staff record and issues a portal login scoped to their role.
        </DialogDescription>

        {issued ? (
          <div role="status" className="mt-6 rounded-chip bg-admin-bg p-5">
            <p className="text-sm font-semibold text-admin-ink">Credentials issued</p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-admin-muted">Username</dt>
                <dd className="font-mono text-admin-ink">{issued.user}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-admin-muted">Temporary password</dt>
                <dd className="font-mono text-admin-ink">{issued.pass}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-admin-muted">
              A welcome message has been pushed to their phone.
            </p>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="cred-name">Full name</Label>
              <Input id="cred-name" name="name" required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cred-role">Designation</Label>
                <Input id="cred-role" name="role" placeholder="Staff Nurse" required />
              </div>
              <div>
                <Label htmlFor="cred-dept">Department</Label>
                <Input id="cred-dept" name="dept" placeholder="Wards" required />
              </div>
              <div>
                <Label htmlFor="cred-access">Portal access</Label>
                <select
                  id="cred-access"
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
                <Label htmlFor="cred-phone">Phone</Label>
                <Input id="cred-phone" name="phone" type="tel" required />
              </div>
            </div>
            <GradientButton type="submit" className="w-full">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Generate credentials
            </GradientButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AccessView() {
  const { state, dispatch } = useClinic();
  const active = state.staff.filter((member) => member.active).length;

  const exportCredentials = () =>
    downloadCsv(
      "portal-credentials",
      ["Name", "Username", "Access role", "Scope", "Status"],
      state.staff.map((member) => [
        member.name,
        member.username,
        member.accessRole,
        ROLE_SCOPE[member.accessRole],
        member.active ? "Active" : "Suspended",
      ]),
    );

  return (
    <div className="pb-2">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-sm text-admin-muted">
            {active} of {state.staff.length} logins are active. Access roles decide
            which portal a person can open — the Inventory role reaches only the
            inventory portal, and Super Admin never reaches it.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <DownloadButton
              onDownload={exportCredentials}
              fileLabel="Credentials CSV"
              className="bg-admin-bg px-4 py-2.5 text-admin-ink hover:bg-admin-bg/70"
            >
              Export
            </DownloadButton>
            <AddCredentialsDialog />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="mt-6">
          <CardHeading title="Login credentials" description="All portals" />
          <div className="mt-5">
            <TableScroll label="Portal credentials">
              <Table className="min-w-[860px]">
                <TableCaption>
                  Every staff login and the portal boundary it is scoped to.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Access role</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Login enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.staff.map((member, index) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <span className="flex items-center gap-3">
                          <Avatar
                            initials={member.initials}
                            name={member.name}
                            index={index}
                            size="sm"
                          />
                          <span className="min-w-0">
                            <span className="block font-semibold">{member.name}</span>
                            <span className="block truncate text-xs text-admin-muted">
                              {member.role}
                            </span>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-admin-muted">
                        {member.username}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-admin-ink">
                          <ShieldCheck className="h-3.5 w-3.5 text-admin-pink" aria-hidden="true" />
                          {member.accessRole}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-admin-muted">
                        {ROLE_SCOPE[member.accessRole]}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={member.active ? "Active" : "Inactive"} />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            aria-label={`Reset password for ${member.name}`}
                            className="grid h-9 w-9 place-items-center rounded-full text-admin-muted transition-colors hover:bg-admin-bg hover:text-admin-ink"
                          >
                            <RefreshCw className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <Switch
                            checked={member.active}
                            onCheckedChange={(checked) =>
                              dispatch({ type: "staff/access", id: member.id, active: checked })
                            }
                            aria-label={`Portal access for ${member.name}`}
                          />
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScroll>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
