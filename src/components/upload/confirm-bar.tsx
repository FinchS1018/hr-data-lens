"use client";

import { Button } from "@/components/ui/button";

interface ConfirmBarProps {
  totalRows: number;
  infoColumns: number;
  stageColumns: number;
  onConfirm: () => void;
  onCancel: () => void;
  saving?: boolean;
}

export function ConfirmBar({
  totalRows,
  infoColumns,
  stageColumns,
  onConfirm,
  onCancel,
  saving,
}: ConfirmBarProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{totalRows}</span> 条记录，
        <span className="font-medium text-foreground"> {infoColumns}</span> 个信息列，
        <span className="font-medium text-foreground"> {stageColumns}</span> 个阶段列
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          取消
        </Button>
        <Button onClick={onConfirm} disabled={saving}>
          {saving ? "导入中..." : "确认并导入"}
        </Button>
      </div>
    </div>
  );
}
