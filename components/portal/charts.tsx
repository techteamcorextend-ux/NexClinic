"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";
import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";

const AXIS = {
  stroke: "transparent",
  tickLine: false as const,
  axisLine: false as const,
};

function Box({ children }: { children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-p-line bg-p-card px-3 py-2 text-xs shadow-lg">
      {children}
    </div>
  );
}

/** Candlestick-ish bar column chart used for the patient's heart-rate trend. */
export function HeartRateChart({
  data,
  height = 210,
  ariaLabel,
}: {
  data: { time: string; bpm: number }[];
  height?: number;
  ariaLabel: string;
}) {
  const reduced = useReducedMotionSafe();
  return (
    <div style={{ height }} role="img" aria-label={ariaLabel} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -22 }} barCategoryGap="35%">
          <CartesianGrid vertical={false} stroke="rgb(var(--p-line))" />
          <XAxis dataKey="time" {...AXIS} tick={{ fill: "rgb(var(--p-muted))", fontSize: 10 }} interval={1} />
          <YAxis {...AXIS} tick={{ fill: "rgb(var(--p-muted))", fontSize: 10 }} width={44} domain={[60, 120]} />
          <Tooltip
            cursor={{ fill: "rgb(var(--p-accent) / 0.08)" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <Box>
                  <span className="font-semibold text-p-ink">{payload[0].value} bpm</span>
                  <span className="ml-2 text-p-muted">{label}</span>
                </Box>
              ) : null
            }
          />
          <Bar dataKey="bpm" radius={[4, 4, 4, 4]} isAnimationActive={!reduced}>
            {data.map((entry, index) => (
              <Cell
                key={entry.time}
                fill={
                  index === Math.floor(data.length / 2)
                    ? "rgb(var(--p-accent))"
                    : "rgb(var(--p-accent) / 0.35)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Smooth area used for footfall / consumption trends. */
export function TrendArea({
  data,
  xKey,
  yKey,
  height = 180,
  ariaLabel,
  suffix = "",
}: {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  height?: number;
  ariaLabel: string;
  suffix?: string;
}) {
  const reduced = useReducedMotionSafe();
  return (
    <div style={{ height }} role="img" aria-label={ariaLabel} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id="portalFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--p-accent))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="rgb(var(--p-accent))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgb(var(--p-line))" />
          <XAxis dataKey={xKey} {...AXIS} tick={{ fill: "rgb(var(--p-muted))", fontSize: 10 }} />
          <YAxis {...AXIS} tick={{ fill: "rgb(var(--p-muted))", fontSize: 10 }} width={44} />
          <Tooltip
            cursor={{ stroke: "rgb(var(--p-accent))", strokeDasharray: "4 4" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <Box>
                  <span className="font-semibold text-p-ink">
                    {payload[0].value}
                    {suffix}
                  </span>
                  <span className="ml-2 text-p-muted">{label}</span>
                </Box>
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke="rgb(var(--p-accent))"
            strokeWidth={2.5}
            fill="url(#portalFill)"
            isAnimationActive={!reduced}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Compact sparkline for KPI tiles. */
export function Spark({
  data,
  yKey,
  variant = "line",
  color = "rgb(var(--p-accent))",
}: {
  data: Record<string, string | number>[];
  yKey: string;
  variant?: "line" | "bar";
  color?: string;
}) {
  const reduced = useReducedMotionSafe();
  return (
    <div className="h-16 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        {variant === "line" ? (
          <LineChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2, fill: color, strokeWidth: 0 }}
              isAnimationActive={!reduced}
            />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
            <Bar dataKey={yKey} fill={color} radius={[3, 3, 0, 0]} isAnimationActive={!reduced} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
