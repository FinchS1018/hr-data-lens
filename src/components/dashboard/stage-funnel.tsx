import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { StageFunnelEntry } from "@/lib/analytics";

export function StageFunnel({ data }: { data: StageFunnelEntry[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        暂无阶段数据
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    dropped: d.entered - d.passed,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 60)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 60, right: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="stageName" />
        <Tooltip
          formatter={(value: number, name: string) => [
            value,
            name === "passed" ? "通过" : "未通过",
          ]}
        />
        <Bar dataKey="passed" name="passed" stackId="a">
          {chartData.map((_, i) => (
            <Cell key={`p-${i}`} fill="oklch(0.65 0.18 150)" />
          ))}
        </Bar>
        <Bar dataKey="dropped" name="dropped" stackId="a">
          {chartData.map((_, i) => (
            <Cell key={`d-${i}`} fill="oklch(0.90 0.01 0)" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
