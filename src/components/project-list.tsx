import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/lib/actions";
import type { Project } from "@/generated/prisma/client";

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">暂无项目</p>
        <p className="text-sm mt-1">点击"新建项目"开始分析招聘数据</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>项目名称</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead className="w-[200px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">{project.title}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(project.createdAt).toLocaleDateString("zh-CN")}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/${project.id}`}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background h-9 px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  查看
                </Link>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background h-9 px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    删除
                  </button>
                </form>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
