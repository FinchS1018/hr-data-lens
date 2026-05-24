import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const rows = await prisma.candidate.findMany({
    where: { projectId: parseInt(id) },
    select: { department: true, position: true },
  });

  const departments = [...new Set(rows.map((r) => r.department))].filter(Boolean).sort();
  const positions = [...new Set(rows.map((r) => r.position))].filter(Boolean).sort();

  return NextResponse.json({ departments, positions });
}
