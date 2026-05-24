import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseExcelFile } from "@/lib/excel-parser";

interface ColumnMapping {
  columnIndex: number;
  type: "info" | "stage";
  field?: string;
}

const INFO_FIELD_MAP: Record<string, string> = {
  "姓名": "name", "name": "name", "名字": "name",
  "部门": "department", "department": "department", "dept": "department",
  "职位": "position", "岗位": "position", "position": "position", "job": "position",
  "渠道": "source", "来源": "source", "source": "source", "招聘渠道": "source",
  "招聘负责人": "recruiter", "recruiter": "recruiter", "hr": "recruiter", "招聘hr": "recruiter",
  "offer结果": "offerResult", "offerresult": "offerResult", "offer": "offerResult",
  "是否入职": "onboarded", "onboarded": "onboarded", "入职": "onboarded", "入职状态": "onboarded",
};

function normalizeForMatch(s: string): string {
  return s.trim().toLowerCase().replace(/[\s_\-/]+/g, "");
}

function mapField(columnName: string): string | null {
  const norm = normalizeForMatch(columnName);
  for (const [key, field] of Object.entries(INFO_FIELD_MAP)) {
    if (norm.includes(normalizeForMatch(key))) return field;
  }
  return null;
}

function parseOnboarded(value: string): boolean | null {
  const v = value.trim();
  if (["是", "yes", "true", "1", "已入职"].includes(v)) return true;
  if (["否", "no", "false", "0", "未入职"].includes(v)) return false;
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id: parseInt(id) } });
  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const mappingJson = formData.get("mapping") as string | null;

  if (!file) return NextResponse.json({ error: "未上传文件" }, { status: 400 });

  let columnMapping: ColumnMapping[];
  try {
    columnMapping = JSON.parse(mappingJson ?? "[]");
  } catch {
    return NextResponse.json({ error: "列映射数据无效" }, { status: 400 });
  }

  const infoCols = columnMapping.filter((c) => c.type === "info");
  const stageCols = columnMapping
    .filter((c) => c.type === "stage")
    .sort((a, b) => a.columnIndex - b.columnIndex);

  if (infoCols.length === 0) {
    return NextResponse.json({ error: "至少需要一个信息列" }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const { headers, rows } = parseExcelFile(buffer, file.name);

    let inserted = 0;

    for (const row of rows) {
      const candidateData: Record<string, unknown> = { projectId: parseInt(id) };

      for (const col of infoCols) {
        const rawValue = row[col.columnIndex]?.trim() ?? "";
        const fieldName = col.field ?? mapField(headers[col.columnIndex]);
        if (!fieldName) continue;

        if (fieldName === "onboarded") {
          candidateData[fieldName] = parseOnboarded(rawValue);
        } else {
          candidateData[fieldName] = rawValue || null;
        }
      }

      if (!candidateData.name) continue;

      const candidate = await prisma.candidate.create({
        data: candidateData as {
          name: string;
          department: string;
          position: string;
          source?: string;
          recruiter?: string;
          offerResult?: string;
          onboarded?: boolean;
          projectId: number;
        },
      });

      // Only create stages up to the last meaningful one (stop at empty or eliminated)
      const stageData: {
        candidateId: number;
        stageName: string;
        stageOrder: number;
        result: string | null;
        stageDate: string | null;
      }[] = [];

      for (let i = 0; i < stageCols.length; i++) {
        const col = stageCols[i];
        const stageName = headers[col.columnIndex]?.trim() || `阶段${i + 1}`;
        const stageValue = row[col.columnIndex]?.trim() ?? "";

        let result: string | null = null;
        let stageDate: string | null = null;

        if (stageValue) {
          const dateMatch = stageValue.match(/^(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/);
          if (dateMatch) {
            stageDate = dateMatch[1].replace(/\//g, "-");
            result = "通过"; // A date means the candidate passed/completed this stage
          } else {
            result = stageValue;
          }
        }

        stageData.push({
          candidateId: candidate.id,
          stageName,
          stageOrder: i,
          result,
          stageDate,
        });

        // Stop creating further stages if candidate was eliminated or if next stage is empty
        const isEliminated = result && ["淘汰", "未通过", "放弃", "reject", "fail"].includes(result);
        if (isEliminated) break;

        // Also stop if the next stage column has no value
        if (i + 1 < stageCols.length) {
          const nextValue = row[stageCols[i + 1].columnIndex]?.trim() ?? "";
          if (!nextValue) break;
        }
      }

      if (stageData.length > 0) {
        await prisma.recruitmentStage.createMany({ data: stageData });
      }

      inserted++;
    }

    return NextResponse.json({ inserted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "数据保存失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
