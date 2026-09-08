"use client";

import { useState } from "react";
import { CalendarDays, FileDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeading, Reveal } from "@/components/admin/ui";
import {
  DonutChart,
  DonutLegend,
  TwoLineChart,
} from "@/components/admin/charts";
import { DownloadButton } from "@/components/motion-ui/buttons";
import {
  RANGE_LABEL,
  REVENUE_BY_SOURCE,
  REVENUE_SERIES,
  type RangeKey,
} from "@/lib/admin-metrics";
import { downloadCsv, downloadPdf } from "@/lib/downloads";

const RANGES: RangeKey[] = ["daily", "monthly", "yearly"];

const UNIT: Record<RangeKey, string> = {
  daily: " L / day",
  monthly: " L",
  yearly: " L",
};

export default function AnalyticsView() {
  const [range, setRange] = useState<RangeKey>("monthly");

  const sources = REVENUE_BY_SOURCE[range];
  const series = REVENUE_SERIES[range];
  const total = series.reduce((sum, row) => sum + row.value, 0);

  const exportReport = () =>
    downloadPdf(`nexclinic-revenue-${range}`, {
      title: "Nexclinic — Revenue Analytics",
      subtitle: `${RANGE_LABEL[range]} view · sample export`,
      lines: [
        `Total in range: Rs. ${total.toFixed(1)} lakh`,
        "",
        "Revenue by source",
        ...sources.map((row) => `  ${row.name}: ${row.value}%`),
        "",
        `${RANGE_LABEL[range]} series`,
        ...series.map((row) => `  ${row.label}: Rs. ${row.value} lakh`),
        "",
        "Sample output generated in the browser.",
      ],
    });

  const exportCsv = () =>
    downloadCsv(
      `revenue-${range}`,
      ["Period", "Revenue (₹ lakh)"],
      series.map((row) => [row.label, row.value]),
    );

  return (
    <div className="pb-2">
      <Reveal>
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-sm font-medium text-admin-muted">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Range
            </span>

            <Tabs value={range} onValueChange={(value) => setRange(value as RangeKey)}>
              <TabsList>
                {RANGES.map((key) => (
                  <TabsTrigger key={key} value={key}>
                    {RANGE_LABEL[key]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-2.5 sm:ml-auto">
              <DownloadButton
                onDownload={exportCsv}
                fileLabel="Revenue CSV"
                className="bg-admin-bg px-4 py-2.5 text-admin-ink hover:bg-admin-bg/70"
              >
                CSV
              </DownloadButton>
              <DownloadButton onDownload={exportReport} fileLabel="Revenue report">
                <FileDown className="hidden" aria-hidden="true" />
                Export report
              </DownloadButton>
            </div>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="mt-5">
          <CardHeading
            title={`${RANGE_LABEL[range]} revenue`}
            description={`₹${total.toFixed(1)} L across the range`}
          />
          <div className="mt-4">
            <TwoLineChart
              data={series}
              xKey="label"
              suffix={UNIT[range]}
              series={[{ key: "value", name: "Revenue", color: "#2563EB" }]}
              ariaLabel={`Line chart of ${RANGE_LABEL[range].toLowerCase()} revenue totalling ₹${total.toFixed(1)} lakh.`}
            />
          </div>
        </Card>
      </Reveal>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.4fr]">
        <Reveal delay={0.1}>
          <Card className="h-full">
            <CardHeading title="Revenue by source" description={RANGE_LABEL[range]} />
            <DonutChart
              data={sources}
              height={240}
              ariaLabel={`Donut chart of revenue by source: ${sources
                .map((row) => `${row.name} ${row.value}%`)
                .join(", ")}.`}
            />
            <DonutLegend data={sources} />
          </Card>
        </Reveal>

        <Reveal delay={0.14}>
          <Card className="h-full">
            <CardHeading title="Source breakdown" description="Share and trend" />
            <ul className="mt-5 list-none space-y-4">
              {sources.map((source) => (
                <li key={source.name}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2.5 font-medium text-admin-ink">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: source.color }}
                      />
                      {source.name}
                    </span>
                    <span className="font-bold tabular-nums text-admin-ink">
                      {source.value}%
                    </span>
                  </div>
                  <div
                    className="mt-2 h-2 w-full overflow-hidden rounded-full bg-admin-bg"
                    role="img"
                    aria-label={`${source.name}: ${source.value} percent of revenue`}
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out-soft"
                      style={{ width: `${source.value}%`, background: source.color }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
