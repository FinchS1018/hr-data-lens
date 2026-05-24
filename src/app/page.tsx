import { prisma } from "@/lib/prisma";
import { ProjectList } from "@/components/project-list";
import { CreateProjectDialog } from "@/components/create-project-dialog";

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">项目列表</h1>
          <p className="text-muted-foreground mt-1">
            📊 管理你的招聘数据分析项目
          </p>
        </div>
        <CreateProjectDialog />
      </div>
      <ProjectList projects={projects} />
    </div>
  );
}
