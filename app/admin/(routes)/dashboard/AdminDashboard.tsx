"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Banknote,
  Download,
  Receipt,
  UserCheck,
  Users,
} from "lucide-react";
import { Card, CardHeading, Reveal } from "@/components/admin/ui";
import StatusBadge from "@/components/admin/StatusBadge";
import { TwoLineChart } from "@/components/admin/charts";
import { DownloadButton, ChevronButton } from "@/components/motion-ui/buttons";
import { MediaCard } from "@/components/ui/MediaCard";
import { CascadeGrid } from "@/components/ui/CascadeGrid";
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
import {
  DASHBOARD_TABS,
  MONTHLY_REVENUE,
  PATIENT_VISITS,
  PAYMENT_HISTORY,
} from "@/lib/admin-metrics";
import { useClinic } from "@/lib/clinic-store";
import { netPay } from "@/lib/clinic-types";
import { downloadCsv, downloadPdf } from "@/lib/downloads";
import { cn } from "@/lib/utils";

/**
 * The clickable oversight tabs that sit above the dashboard. The active
 * pill is a single shared-layout element (`layoutId`) that slides from its
 * old tab to the new one instead of just swapping colour.
 */
function OversightTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Oversight" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {DASHBOARD_TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "relative shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-out-soft",
              active
                ? "text-white"
                : "border border-admin-line bg-white dark:bg-admin-card text-admin-muted hover:-translate-y-0.5 hover:text-admin-ink motion-reduce:hover:translate-y-0",
            )}
          >
            {active ? (
              <motion.span
                layoutId="oversight-active-pill"
                className="absolute inset-0 -z-10 rounded-full bg-admin-grad-pink shadow-admin"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : null}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminDashboard() {
  const { state } = useClinic();

  const activeStaff = state.staff.filter((member) => member.active).length;
  const payrollTotal = state.staff.reduce(
    (sum, member) => sum + netPay(member.salary).net,
    0,
  );
  const pendingRequests = state.appointments.filter(
    (entry) => entry.status === "pending",
  ).length;

  const revenueThisMonth = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].revenue;
  const visitsThisMonth = PATIENT_VISITS[PATIENT_VISITS.length - 1].visits;

  const exportBoard = () =>
    downloadPdf("nexclinic-oversight-summary", {
      title: "Nexclinic — Oversight Summary",
      subtitle: "Super Admin dashboard · sample export",
      lines: [
        `Revenue this month: Rs. ${revenueThisMonth} lakh`,
        `Patient visits this month: ${visitsThisMonth}`,
        `Active staff: ${activeStaff} of ${state.staff.length}`,
        `Net payroll: Rs. ${payrollTotal.toLocaleString("en-IN")}`,
        `Pending appointment requests: ${pendingRequests}`,
        "",
        "Monthly revenue (Rs. lakh)",
        ...MONTHLY_REVENUE.map((row) => `  ${row.month}: ${row.revenue}`),
        "",
        "Sample output generated in the browser.",
      ],
    });

  const exportVisits = () =>
    downloadCsv(
      "patient-visits",
      ["Month", "Visits", "New patients"],
      PATIENT_VISITS.map((row) => [row.month, row.visits, row.newPatients]),
    );

  const kpis = [
    {
      label: "Revenue this month",
      value: `₹${revenueThisMonth} L`,
      delta: "+5.7% vs last month",
      icon: Banknote,
      action: { label: "Analytics", href: "/admin/analytics" } as const,
    },
    {
      label: "Patient visits",
      value: visitsThisMonth.toLocaleString("en-IN"),
      delta: "+7.8% vs last month",
      icon: Users,
      action: { label: "CSV", onClick: exportVisits } as const,
    },
    {
      label: "Active staff",
      value: String(activeStaff),
      delta: `${state.staff.length - activeStaff} suspended`,
      icon: UserCheck,
      action: { label: "View", href: "/admin/staff" } as const,
    },
    {
      label: "Payroll (net)",
      value: `₹${(payrollTotal / 100000).toFixed(1)} L`,
      delta: `${state.staff.length} on the register`,
      icon: Receipt,
      action: { label: "Download report", onClick: exportBoard } as const,
    },
  ];

  return (
    <div className="pb-2">
      <Reveal>
        <OversightTabs />
      </Reveal>

      <Reveal delay={0.04}>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-sm text-admin-muted">
            Facility-wide oversight. Inventory and equipment live in the{" "}
            <Link href="/inventory/dashboard" className="font-medium text-admin-pink hover:underline">
              Inventory Manager portal
            </Link>{" "}
            and are deliberately outside this boundary.
          </p>
          <DownloadButton onDownload={exportBoard} fileLabel="Oversight summary">
            <Download className="hidden" aria-hidden="true" />
            Download report
          </DownloadButton>
        </div>
      </Reveal>

      <CascadeGrid className="mt-5 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <MediaCard
              key={kpi.label}
              seed={kpi.label}
              badgeLabel={kpi.label}
              badgeIcon={<Icon aria-hidden="true" />}
              eyebrow={kpi.label}
              title={kpi.value}
              avatarIcon={<Icon aria-hidden="true" />}
              line1={kpi.delta}
              actionLabel={kpi.action.label}
              href={"href" in kpi.action ? kpi.action.href : undefined}
              onAction={"onClick" in kpi.action ? kpi.action.onClick : undefined}
              className="max-w-[260px]"
            />
          );
        })}
      </CascadeGrid>

      {/* The two line charts the spec calls for */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeading
              title="Monthly revenue"
              description="₹ lakh · this year against last"
              action={
                <ChevronButton href="/admin/analytics" className="border-admin-line">
                  Analytics
                </ChevronButton>
              }
            />
            <div className="mt-4">
              <TwoLineChart
                data={MONTHLY_REVENUE}
                xKey="month"
                suffix=" L"
                series={[
                  { key: "revenue", name: "This year", color: "#2563EB" },
                  { key: "lastYear", name: "Last year", color: "#5B6EF5", dashed: true },
                ]}
                ariaLabel="Line chart of monthly revenue rising from ₹64 lakh in April to ₹92 lakh in March, consistently above last year."
              />
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.14}>
          <Card className="h-full">
            <CardHeading
              title="Patient visits"
              description="Footfall and new registrations"
              action={
                <DownloadButton
                  onDownload={exportVisits}
                  fileLabel="Patient visits CSV"
                  className="bg-admin-bg px-4 py-2 text-admin-ink hover:bg-admin-bg/70"
                >
                  CSV
                </DownloadButton>
              }
            />
            <div className="mt-4">
              <TwoLineChart
                data={PATIENT_VISITS}
                xKey="month"
                series={[
                  { key: "visits", name: "Total visits", color: "#0EA5E9" },
                  { key: "newPatients", name: "New patients", color: "#FFA45C", dashed: true },
                ]}
                ariaLabel="Line chart of monthly patient visits rising from 2,180 in April to 3,240 in March, with new registrations tracking below."
              />
            </div>
          </Card>
        </Reveal>
      </div>

      {/* Recent payments */}
      <Reveal delay={0.18}>
        <Card className="mt-5">
          <CardHeading
            title="Recent patient payments"
            action={
              <Link
                href="/admin/logs"
                className="inline-flex items-center gap-1 text-sm font-medium text-admin-pink hover:underline"
              >
                Full history
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-5">
            <TableScroll label="Recent patient payments">
              <Table className="min-w-[720px]">
                <TableCaption>The six most recent settlements.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Against</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PAYMENT_HISTORY.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold">{row.id}</TableCell>
                      <TableCell className="text-admin-muted">{row.patient}</TableCell>
                      <TableCell className="text-admin-muted">{row.against}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        ₹{row.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-admin-muted">{row.mode}</TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
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
