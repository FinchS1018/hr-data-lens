import type { KPIs } from "@/lib/analytics";
import { Card, CardContent } from "@/components/ui/card";

const METRICS: { key: keyof KPIs; label: string; format: "number" | "percent" }[] = [
  { key: "totalResumes", label: "简历总数", format: "number" },
  { key: "interviewRate", label: "面试率", format: "percent" },
  { key: "passRateNarrow", label: "终面通过率", format: "percent" },
  { key: "offerRate", label: "Offer率", format: "percent" },
  { key: "onboardRate", label: "入职率", format: "percent" },
];

export function KPICards({ kpis }: { kpis: KPIs }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {METRICS.map(({ key, label, format }) => {
        const value = kpis[key];
        return (
          <Card key={key}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-1">
                {format === "percent" ? `${value}%` : value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
