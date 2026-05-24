import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
  const { id, candidateId } = await params;
  const body = await req.json();

  try {
    const stage = await prisma.recruitmentStage.create({
      data: {
        candidateId: parseInt(candidateId),
        stageName: body.stageName,
        stageOrder: body.stageOrder,
        result: body.result ?? null,
        stageDate: body.stageDate ?? null,
      },
    });
    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
