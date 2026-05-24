import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeKPIs,
  computeMonthlyTrend,
  computeStageFunnel,
  computeSegmentedFunnel,
  computeDuration,
  type CandidateWithStages,
} from "@/lib/analytics";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const department = searchParams.get("department");
  const position = searchParams.get("position");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: Record<string, unknown> = { projectId: parseInt(id) };
  if (department) where.department = department;
  if (position) where.position = position;

  const candidates = await prisma.candidate.findMany({
    where,
    include: {
      stages: { orderBy: { stageOrder: "asc" } },
    },
  });

  // Client-side date filtering
  let filtered = candidates as unknown as CandidateWithStages[];
  if (dateFrom || dateTo) {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    filtered = filtered.filter((c) => {
      const firstStage = c.stages[0];
      if (!firstStage?.stageDate) return true;
      const d = new Date(firstStage.stageDate);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }

  return NextResponse.json({
    kpis: computeKPIs(filtered),
    monthlyTrend: computeMonthlyTrend(filtered),
    stageFunnel: computeStageFunnel(filtered),
    segmentedByDept: computeSegmentedFunnel(filtered, "department"),
    segmentedByPosition: computeSegmentedFunnel(filtered, "position"),
    duration: computeDuration(filtered),
    totalCandidates: filtered.length,
  });
}
