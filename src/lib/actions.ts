"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "项目名称不能为空" };

  const project = await prisma.project.create({
    data: { title: title.trim() },
  });

  revalidatePath("/");
  return { id: project.id };
}

export async function deleteProject(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return { error: "缺少项目ID" };

  await prisma.project.delete({ where: { id: parseInt(id) } });
  revalidatePath("/");
}
