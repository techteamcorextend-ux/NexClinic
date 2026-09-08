"use client";

import { useState } from "react";
import { ChevronDown, FileText, PlayCircle, Save } from "lucide-react";
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
import { Avatar, Card, CardHeading, Reveal } from "@/components/admin/ui";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  DownloadButton,
  MorphButton,
} from "@/components/motion-ui/buttons";
import { useClinic } from "@/lib/clinic-store";
import { netPay, type Salary } from "@/lib/clinic-types";
import { PAYROLL_CYCLES } from "@/lib/admin-metrics";
import { downloadCsv, downloadPdf } from "@/lib/downloads";
import { cn } from "@/lib/utils";

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

/** An editable slip: bonus, allowances and tax can be adjusted in place. */
function SlipEditor({ id }: { id: string }) {
  const { state, dispatch } = useClinic();
  const member = state.staff.find((entry) => entry.id === id);
  const [draft, setDraft] = useState<Salary | null>(member ? { ...member.salary } : null);

  if (!member || !draft) return null;
  const pay = netPay(draft);
  const dirty = JSON.stringify(draft) !== JSON.stringify(member.salary);

  type SalaryField = Extract<keyof Salary, string>;

  const field = (key: SalaryField, label: string, suffix?: string) => (
    <div>
      <Label htmlFor={`${id}-${key}`}>
        {label}
        {suffix ? <span className="normal-case tracking-normal"> {suffix}</span> : null}
      </Label>
      <Input
        id={`${id}-${key}`}
        type="number"
        min={0}
        value={draft[key]}
        onChange={(event) =>
          setDraft({ ...draft, [key]: Number(event.target.value) || 0 })
        }
      />
    </div>
  );

  return (
    <div className="rounded-chip bg-admin-bg p-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {field("base", "Basic")}
        {field("hra", "HRA")}
        {field("allowance", "Allowances")}
        {field("bonus", "Bonus")}
        {field("taxPercent", "Tax", "(%)")}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-admin-line pt-4">
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-xs text-admin-muted">Gross</dt>
            <dd className="font-bold tabular-nums text-admin-ink">{inr(pay.gross)}</dd>
          </div>
          <div>
            <dt className="text-xs text-admin-muted">Tax deducted</dt>
            <dd className="font-bold tabular-nums text-admin-ink">−{inr(pay.tax)}</dd>
          </div>
          <div>
            <dt className="text-xs text-admin-muted">Net pay</dt>
            <dd className="text-lg font-bold tabular-nums text-admin-ink">{inr(pay.net)}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-2.5">
          <DownloadButton
            fileLabel={`Salary slip for ${member.name}`}
            className="bg-white px-4 py-2.5 text-admin-ink hover:bg-admin-bg"
            onDownload={() =>
              downloadPdf(`salary-slip-${member.id}`, {
                title: "Nexclinic — Salary Slip",
                subtitle: `${member.name} · ${member.role}`,
                lines: [
                  `Basic: Rs. ${draft.base.toLocaleString("en-IN")}`,
                  `HRA: Rs. ${draft.hra.toLocaleString("en-IN")}`,
                  `Allowances: Rs. ${draft.allowance.toLocaleString("en-IN")}`,
                  `Bonus: Rs. ${draft.bonus.toLocaleString("en-IN")}`,
                  `Gross: Rs. ${pay.gross.toLocaleString("en-IN")}`,
                  `Tax (${draft.taxPercent}%): Rs. ${pay.tax.toLocaleString("en-IN")}`,
                  `Net pay: Rs. ${pay.net.toLocaleString("en-IN")}`,
                  "",
                  "Sample output generated in the browser. Not a statutory payslip.",
                ],
              })
            }
          >
            <FileText className="hidden" aria-hidden="true" />
            Slip
          </DownloadButton>

          <MorphButton
            doneLabel="Saved"
            disabled={!dirty}
            onClick={() => dispatch({ type: "staff/salary", id: member.id, salary: draft })}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save slip
          </MorphButton>
        </div>
      </div>
    </div>
  );
}

export default function PayrollView() {
  const { state } = useClinic();
  const [openId, setOpenId] = useState<string | null>(state.staff[0]?.id ?? null);
  const [running, setRunning] = useState(false);

  const totals = state.staff.reduce(
    (acc, member) => {
      const pay = netPay(member.salary);
      acc.gross += pay.gross;
      acc.tax += pay.tax;
      acc.net += pay.net;
      return acc;
    },
    { gross: 0, tax: 0, net: 0 },
  );

  const exportRegister = () =>
    downloadCsv(
      "payroll-register",
      ["Staff", "Role", "Basic", "HRA", "Allowances", "Bonus", "Tax %", "Gross", "Net"],
      state.staff.map((member) => {
        const pay = netPay(member.salary);
        return [
          member.name,
          member.role,
          member.salary.base,
          member.salary.hra,
          member.salary.allowance,
          member.salary.bonus,
          member.salary.taxPercent,
          pay.gross,
          pay.net,
        ];
      }),
    );

  return (
    <div className="pb-2">
      <Reveal>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-admin-muted">Current cycle</h2>
              <p className="mt-1 text-lg font-semibold tracking-tight text-admin-ink">
                September 2026
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <DownloadButton
                onDownload={exportRegister}
                fileLabel="Payroll register CSV"
                className="bg-admin-bg px-4 py-2.5 text-admin-ink hover:bg-admin-bg/70"
              >
                Register
              </DownloadButton>
              <MorphButton
                doneLabel="Payroll run"
                onClick={() => {
                  setRunning(true);
                  window.setTimeout(() => setRunning(false), 1600);
                }}
              >
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                {running ? "Running…" : "Run payroll"}
              </MorphButton>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
            {[
              ["Staff on payroll", String(state.staff.length)],
              ["Gross", inr(totals.gross)],
              ["Tax deducted", inr(totals.tax)],
              ["Net payable", inr(totals.net)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-chip bg-admin-bg px-4 py-3.5">
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-admin-muted">
                  {label}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-admin-ink">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </Reveal>

      {/* Editable salary slips */}
      <Reveal delay={0.05}>
        <Card className="mt-5">
          <CardHeading title="Salary slips" description="Expand a row to edit" />
          <ul className="mt-5 list-none space-y-2.5">
            {state.staff.map((member, index) => {
              const pay = netPay(member.salary);
              const open = openId === member.id;
              return (
                <li key={member.id} className="rounded-admin border border-admin-line">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : member.id)}
                    aria-expanded={open}
                    className="flex w-full flex-wrap items-center gap-3 p-4 text-left"
                  >
                    <Avatar
                      initials={member.initials}
                      name={member.name}
                      index={index}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-admin-ink">
                        {member.name}
                      </span>
                      <span className="block truncate text-xs text-admin-muted">
                        {member.role} · {member.dept}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-admin-ink">
                      {inr(pay.net)}
                    </span>
                    <StatusBadge status={member.active ? "Paid" : "Pending"} />
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-admin-muted transition-transform duration-300",
                        open && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {open ? (
                    <div className="px-4 pb-4">
                      <SlipEditor id={member.id} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Card>
      </Reveal>

      {/* Monthly reports */}
      <Reveal delay={0.1}>
        <Card className="mt-5">
          <CardHeading title="Recent monthly payroll reports" />
          <div className="mt-5">
            <TableScroll label="Monthly payroll reports">
              <Table className="min-w-[640px]">
                <TableCaption>Closed payroll cycles.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead className="text-right">Staff</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PAYROLL_CYCLES.map((cycle) => (
                    <TableRow key={cycle.cycle}>
                      <TableCell className="font-semibold">{cycle.cycle}</TableCell>
                      <TableCell className="text-admin-muted">{cycle.processed}</TableCell>
                      <TableCell className="text-right tabular-nums">{cycle.staff}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {cycle.total}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={cycle.status} />
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
