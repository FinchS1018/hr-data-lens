import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
  const { candidateId } = await params;
  const body = await req.json();

  try {
    const candidate = await prisma.candidate.update({
      where: { id: parseInt(candidateId) },
      data: body,
    });
    return NextResponse.json(candidate);
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
