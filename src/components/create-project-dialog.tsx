"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject } from "@/lib/actions";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await createProject(formData);
    if (result.error) return;
    setOpen(false);
    router.push(`/upload/${result.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium hover:bg-primary/90">
        新建项目
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建分析项目</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title">项目名称</Label>
            <Input
              id="title"
              name="title"
              placeholder="如：技术部2026Q1招聘分析"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            创建并上传数据
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
