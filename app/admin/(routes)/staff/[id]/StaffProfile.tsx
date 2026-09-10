"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Mail,
  Phone,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, Card, CardHeading, EmptyState, Reveal } from "@/components/admin/ui";
import StatusBadge from "@/components/admin/StatusBadge";
import { MorphButton, DownloadButton } from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { netPay } from "@/lib/clinic-types";
import { downloadPdf } from "@/lib/downloads";

import TextReveal from "@/components/motion/TextReveal";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StaffProfile({ id }: { id: string }) {
  const { state, dispatch } = useClinic();
  const member = state.staff.find((entry) => entry.id === id);

  const [start, setStart] = useState(member?.shiftStart ?? "09:00");
  const [end, setEnd] = useState(member?.shiftEnd ?? "17:00");

  // Keep the local fields in step if the record changes underneath.
  useEffect(() => {
    if (member) {
      setStart(member.shiftStart);
      setEnd(member.shiftEnd);
    }
  }, [member?.shiftStart, member?.shiftEnd, member]);

  if (!member) {
    return (
      <div className="pb-2">
        <EmptyState
          icon={<BadgeCheck className="h-5 w-5" />}
          title="Staff member not found"
          description="This record may have been removed. Head back to the staff list."
        />
      </div>
    );
  }

  const pay = netPay(member.salary);
  const dirty = start !== member.shiftStart || end !== member.shiftEnd;

  const downloadSlip = () =>
    downloadPdf(`salary-slip-${member.id}`, {
      title: "Nexclinic — Salary Slip",
      subtitle: `${member.name} · ${member.role}`,
      lines: [
        `Employee ID: ${member.id}`,
        `Department: ${member.dept}`,
        `Shift: ${member.shiftStart} – ${member.shiftEnd} (${member.days.join(", ")})`,
        "",
        `Basic: Rs. ${member.salary.base.toLocaleString("en-IN")}`,
        `HRA: Rs. ${member.salary.hra.toLocaleString("en-IN")}`,
        `Allowances: Rs. ${member.salary.allowance.toLocaleString("en-IN")}`,
        `Bonus: Rs. ${member.salary.bonus.toLocaleString("en-IN")}`,
        `Gross: Rs. ${pay.gross.toLocaleString("en-IN")}`,
        `Tax (${member.salary.taxPercent}%): Rs. ${pay.tax.toLocaleString("en-IN")}`,
        `Net pay: Rs. ${pay.net.toLocaleString("en-IN")}`,
        "",
        "Sample output generated in the browser. Not a statutory payslip.",
      ],
    });

  return (
    <div className="pb-2">
      <Reveal>
        <Link
          href="/admin/staff"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-admin-muted transition-colors hover:text-admin-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All staff
        </Link>

        <Card className="mt-4">
          <div className="flex flex-wrap items-start gap-5">
            <Avatar initials={member.initials} name={member.name} className="h-16 w-16 text-base" />
            <div className="min-w-0 flex-1">
              <TextReveal as="h2" className="text-2xl font-bold tracking-tight text-admin-ink">
                {member.name}
              </TextReveal>
              <p className="mt-1 text-sm text-admin-muted">
                {member.role} · {member.dept}
              </p>
              <ul className="mt-4 flex list-none flex-wrap gap-x-6 gap-y-2 text-sm text-admin-muted">
                <li className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {member.phone}
                </li>
                <li className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {member.email}
                </li>
              </ul>
            </div>
            <StatusBadge status={member.active ? "Active" : "Inactive"} />
          </div>
        </Card>
      </Reveal>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]">
        {/* Shift timings */}
        <Reveal delay={0.05}>
          <Card className="h-full">
            <CardHeading
              title="Shift timings"
              description={`${member.shiftStart} – ${member.shiftEnd}`}
            />
            <p className="mt-2 flex items-start gap-2 rounded-chip bg-admin-bg px-4 py-3 text-xs leading-relaxed text-admin-muted">
              <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Saving a change pushes a notification to {member.phone}. In this build
              that appears as a handset-style toast in the corner.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shift-start">Shift start</Label>
                <Input
                  id="shift-start"
                  type="time"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="shift-end">Shift end</Label>
                <Input
                  id="shift-end"
                  type="time"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-admin-muted">
                Working days
              </p>
              <ul className="mt-2.5 flex list-none flex-wrap gap-1.5">
                {DAYS.map((day) => {
                  const on = member.days.includes(day);
                  return (
                    <li
                      key={day}
                      className={
                        on
                          ? "rounded-full bg-admin-grad-pink px-3 py-1.5 text-xs font-semibold text-white"
                          : "rounded-full border border-admin-line px-3 py-1.5 text-xs font-medium text-admin-muted"
                      }
                    >
                      {day}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <MorphButton
                doneLabel="Notified"
                disabled={!dirty}
                onClick={() =>
                  dispatch({ type: "staff/shift", id: member.id, shiftStart: start, shiftEnd: end })
                }
              >
                <Clock className="h-4 w-4" aria-hidden="true" />
                Save and notify
              </MorphButton>
              {!dirty ? (
                <span className="text-xs text-admin-muted">No changes to save.</span>
              ) : null}
            </div>
          </Card>
        </Reveal>

        {/* Pay + access */}
        <Reveal delay={0.1}>
          <div className="space-y-5">
            <Card>
              <CardHeading
                title="Salary"
                description={`Net ₹${pay.net.toLocaleString("en-IN")} per month`}
                action={
                  <DownloadButton
                    onDownload={downloadSlip}
                    fileLabel="Salary slip"
                    className="bg-admin-bg px-4 py-2 text-admin-ink hover:bg-admin-bg/70"
                  >
                    Slip
                  </DownloadButton>
                }
              />
              <dl className="mt-5 space-y-2 text-sm">
                {[
                  ["Basic", member.salary.base],
                  ["HRA", member.salary.hra],
                  ["Allowances", member.salary.allowance],
                  ["Bonus", member.salary.bonus],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between gap-4">
                    <dt className="text-admin-muted">{label}</dt>
                    <dd className="font-medium tabular-nums text-admin-ink">
                      ₹{Number(value).toLocaleString("en-IN")}
                    </dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 border-t border-admin-line pt-2">
                  <dt className="text-admin-muted">Tax ({member.salary.taxPercent}%)</dt>
                  <dd className="font-medium tabular-nums text-admin-ink">
                    −₹{pay.tax.toLocaleString("en-IN")}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-admin-line pt-2">
                  <dt className="flex items-center gap-1.5 font-semibold text-admin-ink">
                    <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                    Net pay
                  </dt>
                  <dd className="text-lg font-bold tabular-nums text-admin-ink">
                    ₹{pay.net.toLocaleString("en-IN")}
                  </dd>
                </div>
              </dl>
              <Link
                href="/admin/payroll"
                className="mt-4 inline-block text-xs font-semibold text-admin-pink hover:underline"
              >
                Edit in payroll →
              </Link>
            </Card>

            <Card>
              <CardHeading title="Portal access" description={member.accessRole} />
              <div className="mt-4 flex items-start justify-between gap-4 rounded-chip bg-admin-bg px-4 py-3.5">
                <span>
                  <span className="block text-sm font-medium text-admin-ink">
                    Login enabled
                  </span>
                  <span className="block text-xs text-admin-muted">
                    Username <span className="font-mono">{member.username}</span>
                  </span>
                </span>
                <Switch
                  checked={member.active}
                  onCheckedChange={(checked) =>
                    dispatch({ type: "staff/access", id: member.id, active: checked })
                  }
                  aria-label={`Portal access for ${member.name}`}
                />
              </div>
            </Card>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
