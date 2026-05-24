"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { StageFunnel } from "@/components/dashboard/stage-funnel";
import { SegmentedFunnel } from "@/components/dashboard/segmented-funnel";
import { DurationTable } from "@/components/dashboard/duration-table";
import { RawDataTable } from "@/components/dashboard/raw-data-table";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { KPIs, MonthlyTrend, StageFunnelEntry, SegmentedFunnelData, DurationEntry } from "@/lib/analytics";

interface AnalyticsData {
  kpis: KPIs;
  monthlyTrend: MonthlyTrend[];
  stageFunnel: StageFunnelEntry[];
  segmentedByDept: SegmentedFunnelData[];
  segmentedByPosition: SegmentedFunnelData[];
  duration: DurationEntry[];
  totalCandidates: number;
}

function DashboardContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams(searchParams.toString());
    fetch(`/api/projects/${id}/analytics?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error("加载失败");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-destructive font-medium">加载失败</p>
        <p className="text-muted-foreground text-sm mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          重试
        </Button>
      </Card>
    );
  }

  if (!data) return null;

  if (data.totalCandidates === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg font-medium">暂无数据</p>
        <p className="text-muted-foreground text-sm mt-1">
          该项目尚未导入候选人数据
        </p>
        <Link
          href={`/upload/${id}`}
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium hover:bg-primary/90 mt-4"
        >
          上传数据
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <KPICards kpis={data.kpis} />

      <Card>
        <CardHeader>
          <CardTitle>月度趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={data.monthlyTrend} />
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">阶段衰减总览</TabsTrigger>
          <TabsTrigger value="segment">分群对比</TabsTrigger>
          <TabsTrigger value="duration">流程耗时</TabsTrigger>
          <TabsTrigger value="raw">源数据</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>阶段衰减分析</CardTitle>
            </CardHeader>
            <CardContent>
              <StageFunnel data={data.stageFunnel} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>分群漏斗对比</CardTitle>
            </CardHeader>
            <CardContent>
              <SegmentedFunnel
                byDept={data.segmentedByDept}
                byPosition={data.segmentedByPosition}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duration" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>流程耗时分析</CardTitle>
            </CardHeader>
            <CardContent>
              <DurationTable data={data.duration} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>源数据</CardTitle>
            </CardHeader>
            <CardContent>
              <RawDataTable projectId={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">分析看板</h1>
          <p className="text-muted-foreground text-sm mt-1">
            招聘漏斗深度分析
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/upload/${id}`}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background h-10 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            上传更多数据
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background h-10 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            返回项目列表
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <FilterBar projectId={id} />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-[300px]" />
          </div>
        }
      >
        <DashboardContent id={id} />
      </Suspense>
    </div>
  );
}
