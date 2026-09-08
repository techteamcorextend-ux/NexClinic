"use client";

import { useState } from "react";
import { Banknote, Receipt, TrendingDown, Zap } from "lucide-react";
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
import { Card, CardHeading, FilterSelect, Reveal } from "@/components/admin/ui";
import { DownloadButton } from "@/components/motion-ui/buttons";
import { EXPENSES, EXPENSE_MONTHS, MONTHLY_REVENUE } from "@/lib/admin-metrics";
import { downloadCsv } from "@/lib/downloads";

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function ExpensesView() {
  const [month, setMonth] = useState(EXPENSE_MONTHS[0]);

  const totalExpenses = EXPENSES.reduce((sum, row) => sum + row.amount, 0);
  const payroll = EXPENSES.filter((row) => row.category === "Payroll")
    .reduce((sum, row) => sum + row.amount, 0);
  const utilities = EXPENSES.filter((row) => row.category === "Utilities")
    .reduce((sum, row) => sum + row.amount, 0);

  // Revenue for the month, converted from ₹ lakh to rupees.
  const revenue = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].revenue * 100000;
  const netProfit = revenue - totalExpenses;
  const margin = ((netProfit / revenue) * 100).toFixed(1);

  const tiles = [
    { label: "Revenue", value: inr(revenue), icon: Banknote, tone: "text-emerald-600" },
    { label: "Total expenses", value: inr(totalExpenses), icon: Receipt, tone: "text-rose-600" },
    { label: "Payroll", value: inr(payroll), icon: Receipt, tone: "text-admin-muted" },
    { label: "Utilities", value: inr(utilities), icon: Zap, tone: "text-admin-muted" },
  ];

  return (
    <div className="pb-2">
      <Reveal>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-admin-muted">Net profit</h2>
              <p className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight text-admin-ink md:text-4xl">
                  {inr(netProfit)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <TrendingDown className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
                  {margin}% margin
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <FilterSelect
                label="Select month"
                options={EXPENSE_MONTHS}
                value={month}
                onChange={setMonth}
                className="w-56"
              />
              <DownloadButton
                fileLabel="Expense ledger CSV"
                onDownload={() =>
                  downloadCsv(
                    `expenses-${month.replace(/\s+/g, "-").toLowerCase()}`,
                    ["Head", "Detail", "Category", "Amount"],
                    EXPENSES.map((row) => [row.head, row.detail, row.category, row.amount]),
                  )
                }
              >
                Export ledger
              </DownloadButton>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {tiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <div key={tile.label} className="rounded-chip bg-admin-bg px-4 py-3.5">
                  <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-admin-muted">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {tile.label}
                  </dt>
                  <dd className={`mt-1 text-xl font-bold tabular-nums ${tile.tone}`}>
                    {tile.value}
                  </dd>
                </div>
              );
            })}
          </dl>
        </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="mt-5">
          <CardHeading title="Expense ledger" description={month} />
          <div className="mt-5">
            <TableScroll label="Expense ledger">
              <Table className="min-w-[760px]">
                <TableCaption>All expense heads recorded for {month}.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Head</TableHead>
                    <TableHead>Detail</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EXPENSES.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold">{row.head}</TableCell>
                      <TableCell className="text-admin-muted">{row.detail}</TableCell>
                      <TableCell className="text-admin-muted">{row.category}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {inr(row.amount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-admin-muted">
                        {((row.amount / totalExpenses) * 100).toFixed(1)}%
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
