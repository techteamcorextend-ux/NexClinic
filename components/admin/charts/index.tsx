"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePrefersReducedMotion } from "../use-media-query";

/* Shared axis / grid styling so every chart reads as one system. */
const AXIS = {
  stroke: "transparent",
  tick: { fill: "#5B6B8C", fontSize: 11 },
  tickLine: false as const,
  axisLine: false as const,
};

const GRID_STROKE = "#E2EAF8";

type TooltipPayloadEntry = {
  name?: string | number;
  value?: string | number;
  color?: string;
  dataKey?: string | number;
};

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
  formatter?: (value: number | string, name: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  // A chart may layer a fill-only <Area> under a <Line> for the same
  // dataKey (the gradient finish) — collapse those to one tooltip row.
  const seenKeys = new Set<string | number>();
  const items = payload.filter((entry) => {
    const key = entry.dataKey ?? entry.name ?? "";
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  return (
    <div className="rounded-xl border border-admin-line bg-white dark:bg-admin-card px-3 py-2 shadow-admin-lg">
      {label !== undefined ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-admin-muted">
          {label}
        </p>
      ) : null}
      <ul className="mt-1 list-none space-y-0.5">
        {items.map((entry, index) => (
          <li key={index} className="flex items-center gap-2 text-xs text-admin-ink">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="font-medium">
              {formatter
                ? formatter(entry.value ?? "", String(entry.name ?? ""))
                : `${entry.name}: ${entry.value}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────────── Revenue area chart ─────────────────── */

export function RevenueAreaChart({
  data,
  xKey,
  yKey,
  height = 240,
  unitPrefix = "",
  unitSuffix = "",
  ariaLabel,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  height?: number;
  unitPrefix?: string;
  unitSuffix?: string;
  ariaLabel?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      style={{ height }}
      className="w-full"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#5B6EF5" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#5B6EF5" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey={xKey} {...AXIS} minTickGap={18} />
          <YAxis {...AXIS} width={54} />
          <Tooltip
            cursor={{ stroke: "#2563EB", strokeDasharray: "4 4" }}
            content={
              <ChartTooltip
                formatter={(value) => `${unitPrefix}${value}${unitSuffix}`}
              />
            }
          />
          <Area
            type="monotone"
            dataKey={yKey}
            name="Revenue"
            stroke="url(#revenueStroke)"
            strokeWidth={2.5}
            fill="url(#revenueFill)"
            isAnimationActive={!reduced}
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─────────────────────── Revenue vs target chart ──────────────── */

export function RevenueTargetChart({
  data,
  height = 300,
  ariaLabel,
}: {
  data: { month: string; revenue: number; target: number }[];
  height?: number;
  ariaLabel?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      style={{ height }}
      className="w-full"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#5B6EF5" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#5B6EF5" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey="month" {...AXIS} />
          <YAxis {...AXIS} width={54} />
          <Tooltip
            cursor={{ stroke: "#2563EB", strokeDasharray: "4 4" }}
            content={<ChartTooltip formatter={(value, name) => `${name}: ₹${value}L`} />}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="url(#trendStroke)"
            strokeWidth={2.5}
            fill="url(#trendFill)"
            isAnimationActive={!reduced}
          />
          <Area
            type="monotone"
            dataKey="target"
            name="Target"
            stroke="#5B6EF5"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="transparent"
            isAnimationActive={!reduced}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ───────────────────────────── Donut ──────────────────────────── */

export function DonutChart({
  data,
  height = 220,
  unit = "%",
  ariaLabel,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
  unit?: string;
  ariaLabel?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      style={{ height }}
      className="w-full"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="88%"
            paddingAngle={2}
            stroke="none"
            isAnimationActive={!reduced}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={<ChartTooltip formatter={(value, name) => `${name}: ${value}${unit}`} />}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Text legend that pairs each colour with its label and value. */
export function DonutLegend({
  data,
  unit = "%",
}: {
  data: { name: string; value: number; color: string }[];
  unit?: string;
}) {
  return (
    <ul className="mt-4 list-none space-y-2.5">
      {data.map((entry) => (
        <li key={entry.name} className="flex items-center gap-2.5 text-sm">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="flex-1 truncate text-admin-muted">{entry.name}</span>
          <span className="font-semibold text-admin-ink">
            {entry.value}
            {unit}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ────────────────────────── Footfall bars ─────────────────────── */

export function FootfallBarChart({
  data,
  height = 300,
  ariaLabel,
}: {
  data: { day: string; opd: number; walkIn: number }[];
  height?: number;
  ariaLabel?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      style={{ height }}
      className="w-full"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey="day" {...AXIS} />
          <YAxis {...AXIS} width={54} />
          <Tooltip
            cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
            content={<ChartTooltip formatter={(value, name) => `${name}: ${value}`} />}
          />
          <Bar
            dataKey="opd"
            name="Booked OPD"
            fill="#2563EB"
            radius={[6, 6, 0, 0]}
            isAnimationActive={!reduced}
          />
          <Bar
            dataKey="walkIn"
            name="Walk-in"
            fill="#5B6EF5"
            radius={[6, 6, 0, 0]}
            isAnimationActive={!reduced}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─────────────────────── Stress score line ────────────────────── */

export function StressLineChart({
  data,
  height = 300,
  ariaLabel,
}: {
  data: { month: string; score: number; participation: number }[];
  height?: number;
  ariaLabel?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      style={{ height }}
      className="w-full"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey="month" {...AXIS} />
          <YAxis {...AXIS} width={54} domain={[0, 10]} />
          <Tooltip
            cursor={{ stroke: "#5B6EF5", strokeDasharray: "4 4" }}
            content={
              <ChartTooltip
                formatter={(value, name) =>
                  name === "Avg. stress score" ? `${name}: ${value}/10` : `${name}: ${value}%`
                }
              />
            }
          />
          <Line
            type="monotone"
            dataKey="score"
            name="Avg. stress score"
            stroke="#5B6EF5"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#5B6EF5", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            isAnimationActive={!reduced}
          />
          <Line
            type="monotone"
            dataKey="participation"
            name="Participation"
            stroke="#0EA5E9"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={!reduced}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ───────────────── Mini sparkline for the gradient KPI cards ──── */

export function MiniChart({
  data,
  variant,
}: {
  data: { x: string; y: number }[];
  variant: "area" | "bar";
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="h-14 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        {variant === "area" ? (
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="miniFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="y"
              stroke="#FFFFFF"
              strokeWidth={2}
              fill="url(#miniFill)"
              isAnimationActive={!reduced}
            />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <Bar
              dataKey="y"
              fill="rgba(255,255,255,0.72)"
              radius={[3, 3, 0, 0]}
              isAnimationActive={!reduced}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

/* ─────────────────── Plain two-series line chart ─────────────────── */

export function TwoLineChart({
  data,
  xKey,
  series,
  height = 280,
  ariaLabel,
  suffix = "",
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: { key: string; name: string; color: string; dashed?: boolean }[];
  height?: number;
  ariaLabel: string;
  suffix?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const gradientId = useId();
  const primary = series[0];

  return (
    <div style={{ height }} className="w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
          <defs>
            <linearGradient id={`twoLineFill-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primary.color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={primary.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey={xKey} {...AXIS} />
          <YAxis {...AXIS} width={54} />
          <Tooltip
            cursor={{ stroke: series[0].color, strokeDasharray: "4 4" }}
            content={
              <ChartTooltip formatter={(value, name) => `${name}: ${value}${suffix}`} />
            }
          />
          {/* Gradient finish under the primary series only, fading to transparent. */}
          <Area
            type="monotone"
            dataKey={primary.key}
            name={primary.name}
            stroke="none"
            fill={`url(#twoLineFill-${gradientId})`}
            isAnimationActive={!reduced}
            activeDot={false}
          />
          {series.map((entry) => (
            <Line
              key={entry.key}
              type="monotone"
              dataKey={entry.key}
              name={entry.name}
              stroke={entry.color}
              strokeWidth={entry.dashed ? 1.6 : 2.6}
              strokeDasharray={entry.dashed ? "5 5" : undefined}
              dot={entry.dashed ? false : { r: 3, fill: entry.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={!reduced}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
