import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string; stageId: string }> }
) {
  const { stageId } = await params;
  const body = await req.json();

  try {
    const stage = await prisma.recruitmentStage.update({
      where: { id: parseInt(stageId) },
      data: body,
    });
    return NextResponse.json(stage);
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
