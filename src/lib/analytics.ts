// All analytics functions operate on in-memory data.
// Data is fetched from DB once, then passed through these pure functions.

export interface CandidateWithStages {
  id: number;
  name: string;
  department: string;
  position: string;
  source: string | null;
  recruiter: string | null;
  offerResult: string | null;
  onboarded: boolean | null;
  stages: {
    stageName: string;
    stageOrder: number;
    result: string | null;
    stageDate: string | null;
  }[];
}

export interface KPIs {
  totalResumes: number;
  interviewRate: number;
  passRateNarrow: number;
  passRateWide: number;
  offerRate: number;
  onboardRate: number;
}

export function computeKPIs(candidates: CandidateWithStages[]): KPIs {
  const total = candidates.length;
  if (total === 0) {
    return { totalResumes: 0, interviewRate: 0, passRateNarrow: 0, passRateWide: 0, offerRate: 0, onboardRate: 0 };
  }

  const hasInterview = candidates.filter((c) =>
    c.stages.some((s) => s.stageName.includes("面") || s.stageName.includes("试"))
  ).length;

  const lastStageOrder = Math.max(...candidates.flatMap((c) => c.stages.map((s) => s.stageOrder)), 0);
  const enteredFinal = candidates.filter((c) =>
    c.stages.some((s) => s.stageOrder === lastStageOrder)
  ).length;
  const passedFinal = candidates.filter((c) =>
    c.stages.some((s) => s.stageOrder === lastStageOrder && s.result === "通过")
  ).length;

  const passedOwnFinal = candidates.filter((c) => {
    if (c.stages.length === 0) return false;
    const ownLast = c.stages.reduce((max, s) => s.stageOrder > max.stageOrder ? s : max, c.stages[0]);
    return ownLast.result === "通过";
  }).length;

  const offered = candidates.filter((c) =>
    c.offerResult === "已发" || c.offerResult === "已接受"
  ).length;

  const onboarded = candidates.filter((c) => c.onboarded === true).length;

  return {
    totalResumes: total,
    interviewRate: total > 0 ? Math.round((hasInterview / total) * 1000) / 10 : 0,
    passRateNarrow: enteredFinal > 0 ? Math.round((passedFinal / enteredFinal) * 1000) / 10 : 0,
    passRateWide: total > 0 ? Math.round((passedFinal / total) * 1000) / 10 : 0,
    offerRate: passedOwnFinal > 0 ? Math.round((offered / passedOwnFinal) * 1000) / 10 : 0,
    onboardRate: offered > 0 ? Math.round((onboarded / offered) * 1000) / 10 : 0,
  };
}

export interface MonthlyTrend {
  month: string;
  resumes: number;
  onboarded: number;
}

export function computeMonthlyTrend(candidates: CandidateWithStages[]): MonthlyTrend[] {
  const byMonth: Record<string, { resumes: number; onboarded: number }> = {};

  for (const c of candidates) {
    // Try stages in order for the first valid date
    const sorted = [...c.stages].sort((a, b) => a.stageOrder - b.stageOrder);
    const firstDate = sorted.find((s) => s.stageDate)?.stageDate;
    if (!firstDate) continue;

    const month = firstDate.substring(0, 7);

    if (!byMonth[month]) byMonth[month] = { resumes: 0, onboarded: 0 };
    byMonth[month].resumes++;

    if (c.onboarded) {
      byMonth[month].onboarded++;
    }
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
}

export interface StageFunnelEntry {
  stageName: string;
  stageOrder: number;
  entered: number;
  passed: number;
  conversionRate: number;
}

export function computeStageFunnel(candidates: CandidateWithStages[]): StageFunnelEntry[] {
  const maxOrder = Math.max(...candidates.flatMap((c) => c.stages.map((s) => s.stageOrder)), 0);
  const result: StageFunnelEntry[] = [];

  for (let order = 0; order <= maxOrder; order++) {
    const stagesAtOrder = candidates.flatMap((c) => c.stages.filter((s) => s.stageOrder === order));
    const uniqueNames = [...new Set(stagesAtOrder.map((s) => s.stageName))];
    const stageName = uniqueNames[0] || `阶段${order + 1}`;

    const entered = stagesAtOrder.length;
    const passed = stagesAtOrder.filter((s) => s.result === "通过").length;

    result.push({
      stageName,
      stageOrder: order,
      entered,
      passed,
      conversionRate: entered > 0 ? Math.round((passed / entered) * 1000) / 10 : 0,
    });
  }

  return result;
}

export interface SegmentedFunnelData {
  segment: string;
  stages: { stageName: string; entered: number; passed: number; conversionRate: number }[];
}

export function computeSegmentedFunnel(
  candidates: CandidateWithStages[],
  segmentBy: "department" | "position"
): SegmentedFunnelData[] {
  const groups = new Map<string, CandidateWithStages[]>();

  for (const c of candidates) {
    const key = c[segmentBy] || "未知";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  }

  return Array.from(groups.entries())
    .map(([segment, groupCandidates]) => {
      const allStages = groupCandidates.flatMap((c) => c.stages);
      const stageNames = [...new Set(allStages.map((s) => s.stageName))];
      const maxOrder = Math.max(...allStages.map((s) => s.stageOrder), 0);

      const stages = [];
      for (let order = 0; order <= maxOrder; order++) {
        const atOrder = allStages.filter((s) => s.stageOrder === order);
        const name = atOrder[0]?.stageName || `阶段${order + 1}`;
        const entered = atOrder.length;
        const passed = atOrder.filter((s) => s.result === "通过").length;
        stages.push({
          stageName: name,
          entered,
          passed,
          conversionRate: entered > 0 ? Math.round((passed / entered) * 1000) / 10 : 0,
        });
      }

      return { segment, stages };
    })
    .sort((a, b) => a.segment.localeCompare(b.segment));
}

export interface DurationEntry {
  fromStage: string;
  toStage: string;
  avgDays: number;
  minDays: number;
  maxDays: number;
}

export function computeDuration(candidates: CandidateWithStages[]): DurationEntry[] {
  const transitions: Record<string, number[]> = {};

  for (const c of candidates) {
    const sorted = [...c.stages].sort((a, b) => a.stageOrder - b.stageOrder);

    for (let i = 1; i < sorted.length; i++) {
      const from = sorted[i - 1];
      const to = sorted[i];

      if (from.stageDate && to.stageDate) {
        const fromDate = new Date(from.stageDate);
        const toDate = new Date(to.stageDate);
        if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
          const days = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
          const key = `${from.stageName} → ${to.stageName}`;
          if (!transitions[key]) transitions[key] = [];
          transitions[key].push(days);
        }
      }
    }
  }

  return Object.entries(transitions).map(([key, days]) => ({
    fromStage: key.split(" → ")[0],
    toStage: key.split(" → ")[1],
    avgDays: Math.round(days.reduce((a, b) => a + b, 0) / days.length),
    minDays: Math.min(...days),
    maxDays: Math.max(...days),
  }));
}
