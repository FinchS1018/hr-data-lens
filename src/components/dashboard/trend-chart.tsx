import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MonthlyTrend } from "@/lib/analytics";

export function TrendChart({ data }: { data: MonthlyTrend[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        暂无月度趋势数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="resumes" name="简历数" fill="oklch(0.65 0.18 250)" radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="onboarded" name="入职数" stroke="oklch(0.65 0.18 150)" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
