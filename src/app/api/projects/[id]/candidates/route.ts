import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const candidates = await prisma.candidate.findMany({
    where: { projectId: parseInt(id) },
    include: { stages: { orderBy: { stageOrder: "asc" } } },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(candidates);
}
