export interface DetectedColumn {
  originalName: string;
  normalizedName: string;
  detectedType: "info" | "stage" | "unknown";
  sampleValues: string[];
}

const INFO_KEYWORDS = [
  "姓名", "name", "名字",
  "部门", "department", "dept",
  "职位", "岗位", "position", "job",
  "渠道", "来源", "source", "招聘渠道",
  "招聘负责人", "recruiter", "hr", "招聘hr",
  "offer结果", "offerresult", "offer",
  "是否入职", "onboarded", "入职", "入职状态",
  "日期", "date", "时间", "time",
];

const STAGE_KEYWORDS = [
  "筛选", "初试", "复试", "面试",
  "hr面", "技术面", "offer", "入职",
  "一面", "二面", "三面", "终面",
  "笔试", "测评", "screen", "interview",
  "结果", "result",
];

const STAGE_RESULT_VALUES = new Set([
  "通过", "淘汰", "待定", "未通过", "放弃",
  "pass", "fail", "pending", "reject",
]);

function looksLikeDate(value: string): boolean {
  if (!value) return false;
  const patterns = [
    /^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$/,
    /^\d{4}年\d{1,2}月\d{1,2}日$/,
    /^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/,
    /^\d{4}[-\/]\d{1,2}$/,
  ];
  return patterns.some((p) => p.test(value.trim()));
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/[\s_\-/]+/g, "");
}

export function detectColumns(headers: string[], rows: string[][]): DetectedColumn[] {
  return headers.map((header, colIndex) => {
    const normalized = normalizeName(header);
    const sampleValues = rows
      .slice(0, 5)
      .map((row) => row[colIndex]?.trim() ?? "")
      .filter(Boolean);

    let detectedType: DetectedColumn["detectedType"] = "unknown";

    const matchesInfo = INFO_KEYWORDS.some((kw) => normalized.includes(normalizeName(kw)));
    const matchesStage = STAGE_KEYWORDS.some((kw) => normalized.includes(normalizeName(kw)));

    if (matchesInfo) {
      detectedType = "info";
    } else if (matchesStage) {
      detectedType = "stage";
    } else {
      const stageResultCount = sampleValues.filter((v) =>
        STAGE_RESULT_VALUES.has(v)
      ).length;
      const dateCount = sampleValues.filter((v) => looksLikeDate(v)).length;

      if (stageResultCount >= sampleValues.length * 0.6 || dateCount >= sampleValues.length * 0.6) {
        detectedType = "stage";
      }
    }

    return { originalName: header, normalizedName: normalized, detectedType, sampleValues };
  });
}
