"use client";

import { useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { DropZone } from "@/components/upload/drop-zone";
import { PreviewTable } from "@/components/upload/preview-table";
import { ConfirmBar } from "@/components/upload/confirm-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { DetectedColumn } from "@/lib/column-detector";

type Stage = "idle" | "parsing" | "preview" | "saving" | "done";

interface UploadState {
  stage: Stage;
  error: string | null;
  headers: string[];
  detectedColumns: DetectedColumn[];
  totalRows: number;
  previewRows: string[][];
  columnMapping: { columnIndex: number; type: "info" | "stage" }[];
}

export default function UploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fileRef = useRef<File | null>(null);

  const [state, setState] = useState<UploadState>({
    stage: "idle",
    error: null,
    headers: [],
    detectedColumns: [],
    totalRows: 0,
    previewRows: [],
    columnMapping: [],
  });

  async function handleFile(file: File) {
    fileRef.current = file;
    setState((s) => ({ ...s, stage: "parsing", error: null }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/projects/${id}/upload/parse`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setState((s) => ({ ...s, stage: "idle", error: data.error ?? "解析失败" }));
        return;
      }

      const mapping = data.detectedColumns.map((col: DetectedColumn, i: number) => ({
        columnIndex: i,
        type: col.detectedType as "info" | "stage",
      }));

      setState({
        stage: "preview",
        error: null,
        headers: data.headers,
        detectedColumns: data.detectedColumns,
        totalRows: data.totalRows,
        previewRows: data.previewRows,
        columnMapping: mapping,
      });
    } catch {
      setState((s) => ({ ...s, stage: "idle", error: "网络错误，请重试" }));
    }
  }

  async function handleConfirm() {
    const file = fileRef.current;
    if (!file) return;

    setState((s) => ({ ...s, stage: "saving", error: null }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mapping", JSON.stringify(state.columnMapping));

      const res = await fetch(`/api/projects/${id}/upload/save`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setState((s) => ({ ...s, stage: "preview", error: data.error ?? "保存失败" }));
        toast.error(data.error ?? "保存失败");
        return;
      }

      setState((s) => ({ ...s, stage: "done" }));
      toast.success(`成功导入 ${data.inserted} 条记录`);
      router.push(`/dashboard/${id}`);
    } catch {
      setState((s) => ({ ...s, stage: "preview", error: "网络错误" }));
      toast.error("网络错误，请重试");
    }
  }

  const infoCount = state.columnMapping.filter((c) => c.type === "info").length;
  const stageCount = state.columnMapping.filter((c) => c.type === "stage").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-2">上传招聘数据</h1>
      <p className="text-muted-foreground mb-8">
        上传你的招聘漏斗 Excel/CSV 文件，系统将自动识别列类型
      </p>

      {state.error && (
        <Card className="p-4 mb-6 border-destructive/50 bg-destructive/5 text-destructive text-sm">
          {state.error}
        </Card>
      )}

      {state.stage === "parsing" && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {(state.stage === "idle" || state.stage === "parsing") && (
        <DropZone onFile={handleFile} disabled={state.stage === "parsing"} />
      )}

      {state.stage === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <DropZone onFile={handleFile} />
            <div className="flex-shrink-0" />
          </div>
          <PreviewTable
            headers={state.headers}
            previewRows={state.previewRows}
            detectedColumns={state.detectedColumns}
            columnMapping={state.columnMapping}
            onMappingChange={(mapping) => setState((s) => ({ ...s, columnMapping: mapping }))}
          />
          <ConfirmBar
            totalRows={state.totalRows}
            infoColumns={infoCount}
            stageColumns={stageCount}
            onConfirm={handleConfirm}
            onCancel={() => setState((s) => ({ ...s, stage: "idle", error: null }))}
            saving={false}
          />
        </div>
      )}

      {state.stage === "saving" && (
        <div className="space-y-4 mt-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <p className="text-center text-muted-foreground">正在导入数据...</p>
        </div>
      )}

      {state.stage === "done" && (
        <Card className="p-8 text-center mt-8">
          <p className="text-lg font-medium">导入完成</p>
          <p className="text-muted-foreground mt-2">正在跳转到分析看板...</p>
        </Card>
      )}
    </div>
  );
}
