"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SegmentedFunnelData } from "@/lib/analytics";

const COLORS = [
  "oklch(0.65 0.18 250)",
  "oklch(0.65 0.18 150)",
  "oklch(0.70 0.19 60)",
  "oklch(0.60 0.18 300)",
  "oklch(0.60 0.18 360)",
];

export function SegmentedFunnel({
  byDept,
  byPosition,
}: {
  byDept: SegmentedFunnelData[];
  byPosition: SegmentedFunnelData[];
}) {
  const [mode, setMode] = useState<"department" | "position">("department");

  const data = mode === "department" ? byDept : byPosition;

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "department" | "position")}>
          <TabsList>
            <TabsTrigger value="department">按部门</TabsTrigger>
            <TabsTrigger value="position">按岗位</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          暂无分群数据
        </div>
      </div>
    );
  }

  // Collect all unique stage names across segments
  const allStageNames = [...new Set(data.flatMap((d) => d.stages.map((s) => s.stageName)))];

  // Transform to chart format: one entry per segment, with conversionRate per stage
  const chartData = data.map((seg) => {
    const row: Record<string, string | number> = { segment: seg.segment };
    for (const stage of seg.stages) {
      row[stage.stageName] = stage.conversionRate;
    }
    return row;
  });

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "department" | "position")}>
        <TabsList>
          <TabsTrigger value="department">按部门</TabsTrigger>
          <TabsTrigger value="position">按岗位</TabsTrigger>
        </TabsList>
      </Tabs>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="segment" />
          <YAxis unit="%" />
          <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
          <Legend />
          {allStageNames.map((name, i) => (
            <Bar key={name} dataKey={name} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
