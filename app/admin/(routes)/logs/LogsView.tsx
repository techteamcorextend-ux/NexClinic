"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Card, CardHeading, Reveal } from "@/components/admin/ui";
import StatusBadge from "@/components/admin/StatusBadge";
import { DownloadButton } from "@/components/motion-ui/buttons";
import { PAYMENT_HISTORY, REVENUE_HISTORY } from "@/lib/admin-metrics";
import { downloadCsv } from "@/lib/downloads";

export default function LogsView() {
  const [tab, setTab] = useState("revenue");

  const revenueTotal = REVENUE_HISTORY.reduce((sum, row) => sum + row.amount, 0);
  const paymentTotal = PAYMENT_HISTORY.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="pb-2">
      <Reveal>
        <Card>
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="revenue">Revenue history</TabsTrigger>
                <TabsTrigger value="payments">Patient payments</TabsTrigger>
              </TabsList>

              {tab === "revenue" ? (
                <DownloadButton
                  fileLabel="Revenue history CSV"
                  className="bg-admin-bg px-4 py-2.5 text-admin-ink hover:bg-admin-bg/70"
                  onDownload={() =>
                    downloadCsv(
                      "revenue-history",
                      ["Reference", "When", "Source", "Detail", "Amount", "Mode"],
                      REVENUE_HISTORY.map((row) => [
                        row.id,
                        row.at,
                        row.source,
                        row.detail,
                        row.amount,
                        row.mode,
                      ]),
                    )
                  }
                >
                  Export
                </DownloadButton>
              ) : (
                <DownloadButton
                  fileLabel="Payment history CSV"
                  className="bg-admin-bg px-4 py-2.5 text-admin-ink hover:bg-admin-bg/70"
                  onDownload={() =>
                    downloadCsv(
                      "patient-payments",
                      ["Reference", "When", "Patient", "Against", "Amount", "Mode", "Status"],
                      PAYMENT_HISTORY.map((row) => [
                        row.id,
                        row.at,
                        row.patient,
                        row.against,
                        row.amount,
                        row.mode,
                        row.status,
                      ]),
                    )
                  }
                >
                  Export
                </DownloadButton>
              )}
            </div>

            <TabsContent value="revenue">
              <CardHeading
                title="Revenue history"
                description={`₹${revenueTotal.toLocaleString("en-IN")} recorded`}
              />
              <div className="mt-5">
                <TableScroll label="Revenue history">
                  <Table className="min-w-[860px]">
                    <TableCaption>Every recorded revenue posting, newest first.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>When</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Detail</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Mode</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {REVENUE_HISTORY.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-semibold">{row.id}</TableCell>
                          <TableCell className="whitespace-nowrap text-admin-muted">
                            {row.at}
                          </TableCell>
                          <TableCell className="text-admin-ink">{row.source}</TableCell>
                          <TableCell className="text-admin-muted">{row.detail}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            ₹{row.amount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-admin-muted">{row.mode}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableScroll>
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <CardHeading
                title="Patient payments history"
                description={`₹${paymentTotal.toLocaleString("en-IN")} settled`}
              />
              <div className="mt-5">
                <TableScroll label="Patient payments history">
                  <Table className="min-w-[860px]">
                    <TableCaption>Patient-side settlements against raised bills.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>When</TableHead>
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
                          <TableCell className="whitespace-nowrap text-admin-muted">
                            {row.at}
                          </TableCell>
                          <TableCell className="text-admin-ink">{row.patient}</TableCell>
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
            </TabsContent>
          </Tabs>
        </Card>
      </Reveal>
    </div>
  );
}
