import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseExcelFile } from "@/lib/excel-parser";

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

  if (!file) {
    return NextResponse.json({ error: "未上传文件" }, { status: 400 });
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "文件大小超过10MB限制" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
    return NextResponse.json({ error: "不支持的文件格式，请上传 .xlsx / .xls / .csv 文件" }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const parsed = parseExcelFile(buffer, file.name);

    return NextResponse.json({
      headers: parsed.headers,
      detectedColumns: parsed.detectedColumns,
      totalRows: parsed.totalRows,
      fileName: parsed.fileName,
      previewRows: parsed.rows.slice(0, 5),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "文件解析失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
