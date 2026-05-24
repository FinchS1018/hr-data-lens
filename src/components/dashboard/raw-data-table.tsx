"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface StageData {
  id: number;
  stageName: string;
  stageOrder: number;
  result: string | null;
  stageDate: string | null;
}

interface CandidateData {
  id: number;
  name: string;
  department: string;
  position: string;
  source: string | null;
  recruiter: string | null;
  offerResult: string | null;
  onboarded: boolean | null;
  stages: StageData[];
}

const RESULT_OPTIONS = ["", "通过", "淘汰", "放弃", "待定"];
const OFFER_OPTIONS = ["", "未发", "已发", "已接受", "已拒绝"];
const ONBOARD_OPTIONS = ["", "是", "否"];

export function RawDataTable({ projectId }: { projectId: string }) {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch(`/api/projects/${projectId}/candidates`)
      .then((r) => (r.ok ? r.json() : Promise.reject("加载失败")))
      .then((d) => { setCandidates(d); setLoading(false); })
      .catch((e) => { setError(e); setLoading(false); });
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  const stageNames = Array.from(
    new Set(candidates.flatMap((c) => c.stages.map((s) => s.stageName)))
  ).sort((a, b) => {
    const orderA = candidates.flatMap((c) => c.stages).find((s) => s.stageName === a)?.stageOrder ?? 99;
    const orderB = candidates.flatMap((c) => c.stages).find((s) => s.stageName === b)?.stageOrder ?? 99;
    return orderA - orderB;
  });

  const updateField = useCallback(
    async (type: "candidate" | "stage", id: number, field: string, value: unknown) => {
      try {
        let url: string;
        let method = "PATCH";
        if (type === "candidate") {
          url = `/api/projects/${projectId}/candidates/${id}`;
        } else {
          const candidate = candidates.find((c) => c.stages.some((s) => s.id === id));
          if (!candidate) return;
          url = `/api/projects/${projectId}/candidates/${candidate.id}/stages/${id}`;
        }

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        });

        if (!res.ok) throw new Error("保存失败");

        setCandidates((prev) =>
          prev.map((c) => {
            if (type === "candidate" && c.id === id) return { ...c, [field]: value };
            if (type === "stage") {
              return {
                ...c,
                stages: c.stages.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
              };
            }
            return c;
          })
        );
      } catch {
        toast.error("保存失败");
      }
    },
    [projectId, candidates]
  );

  const createStage = useCallback(
    async (candidateId: number, stageName: string, stageOrder: number, field: string, value: string) => {
      try {
        const res = await fetch(`/api/projects/${projectId}/candidates/${candidateId}/stages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stageName, stageOrder, [field]: value }),
        });

        if (!res.ok) throw new Error("创建失败");
        const newStage = await res.json();

        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId
              ? { ...c, stages: [...c.stages, newStage] }
              : c
          )
        );
      } catch {
        toast.error("创建阶段失败");
      }
    },
    [projectId]
  );

  function getFirstDate(c: CandidateData): string {
    const sorted = [...c.stages].sort((a, b) => a.stageOrder - b.stageOrder);
    return sorted.find((s) => s.stageDate)?.stageDate ?? "";
  }

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (error) return <p className="text-destructive">加载失败: {error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{candidates.length} 条记录</span>
        <Button
          variant={editing ? "default" : "outline"}
          size="sm"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "退出编辑" : "编辑数据"}
        </Button>
        {editing && (
          <span className="text-xs text-muted-foreground">修改后自动保存，结果类字段使用下拉选择</span>
        )}
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[30px]">#</TableHead>
              <TableHead className="min-w-[90px]">登记日期</TableHead>
              <TableHead className="min-w-[70px]">姓名</TableHead>
              <TableHead className="min-w-[70px]">部门</TableHead>
              <TableHead className="min-w-[80px]">岗位</TableHead>
              <TableHead className="min-w-[70px]">渠道</TableHead>
              <TableHead className="min-w-[60px]">HR</TableHead>
              {stageNames.map((name) => [
                <TableHead key={`${name}-r`} className="min-w-[70px]">{name}</TableHead>,
                <TableHead key={`${name}-d`} className="min-w-[90px]">日期</TableHead>,
              ])}
              <TableHead className="min-w-[80px]">Offer结果</TableHead>
              <TableHead className="min-w-[70px]">是否入职</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((c, idx) => (
              <TableRow key={c.id}>
                <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                <EditableTextCell
                  value={getFirstDate(c)}
                  editing={editing}
                  placeholder="YYYY-MM-DD"
                  onSave={(v) => {
                    const sorted = [...c.stages].sort((a, b) => a.stageOrder - b.stageOrder);
                    const first = sorted.find((s) => s.stageDate);
                    if (first) {
                      updateField("stage", first.id, "stageDate", v || null);
                    } else if (sorted.length > 0 && v) {
                      updateField("stage", sorted[0].id, "stageDate", v);
                    }
                  }}
                />
                <EditableTextCell value={c.name} editing={editing} onSave={(v) => updateField("candidate", c.id, "name", v)} />
                <EditableTextCell value={c.department} editing={editing} onSave={(v) => updateField("candidate", c.id, "department", v)} />
                <EditableTextCell value={c.position} editing={editing} onSave={(v) => updateField("candidate", c.id, "position", v)} />
                <EditableTextCell value={c.source ?? ""} editing={editing} onSave={(v) => updateField("candidate", c.id, "source", v || null)} />
                <EditableTextCell value={c.recruiter ?? ""} editing={editing} onSave={(v) => updateField("candidate", c.id, "recruiter", v || null)} />
                {stageNames.map((sname, stageIdx) => {
                  const stage = c.stages.find((s) => s.stageName === sname);
                  if (!stage) {
                    if (!editing) {
                      return [
                        <TableCell key={`${sname}-r`}>-</TableCell>,
                        <TableCell key={`${sname}-d`}>-</TableCell>,
                      ];
                    }
                    return [
                      <EditableSelectCell
                        key={`${sname}-r`}
                        value=""
                        options={RESULT_OPTIONS}
                        editing={editing}
                        onSave={(v) => {
                          if (v) createStage(c.id, sname, stageIdx, "result", v);
                        }}
                      />,
                      <EditableTextCell
                        key={`${sname}-d`}
                        value=""
                        editing={editing}
                        placeholder="YYYY-MM-DD"
                        onSave={(v) => {
                          if (v) createStage(c.id, sname, stageIdx, "stageDate", v);
                        }}
                      />,
                    ];
                  }
                  return [
                    <EditableSelectCell
                      key={`${sname}-r`}
                      value={stage.result ?? ""}
                      options={RESULT_OPTIONS}
                      editing={editing}
                      onSave={(v) => updateField("stage", stage.id, "result", v || null)}
                    />,
                    <EditableTextCell
                      key={`${sname}-d`}
                      value={stage.stageDate ?? ""}
                      editing={editing}
                      placeholder="YYYY-MM-DD"
                      onSave={(v) => updateField("stage", stage.id, "stageDate", v || null)}
                    />,
                  ];
                })}
                <EditableSelectCell
                  value={c.offerResult ?? ""}
                  options={OFFER_OPTIONS}
                  editing={editing}
                  onSave={(v) => updateField("candidate", c.id, "offerResult", v || null)}
                />
                <EditableSelectCell
                  value={c.onboarded === true ? "是" : c.onboarded === false ? "否" : ""}
                  options={ONBOARD_OPTIONS}
                  editing={editing}
                  onSave={(v) => {
                    const val = v === "是" ? true : v === "否" ? false : null;
                    updateField("candidate", c.id, "onboarded", val);
                  }}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function EditableTextCell({
  value,
  editing,
  onSave,
  placeholder,
}: {
  value: string;
  editing: boolean;
  onSave: (value: string) => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);

  if (!editing) {
    return <TableCell className="max-w-[120px] truncate">{value || "-"}</TableCell>;
  }

  return (
    <TableCell className="p-1">
      <Input
        className="h-7 min-w-[70px] text-sm"
        value={local}
        placeholder={placeholder}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { if (local !== value) onSave(local); }}
        onKeyDown={(e) => { if (e.key === "Enter" && local !== value) onSave(local); }}
      />
    </TableCell>
  );
}

function EditableSelectCell({
  value,
  options,
  editing,
  onSave,
}: {
  value: string;
  options: string[];
  editing: boolean;
  onSave: (value: string) => void;
}) {
  if (!editing) {
    return <TableCell className="max-w-[100px] truncate">{value || "-"}</TableCell>;
  }

  return (
    <TableCell className="p-1">
      <Select value={value || "__empty__"} onValueChange={(v) => onSave(v === "__empty__" ? "" : v)}>
        <SelectTrigger className="h-7 min-w-[70px] text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty__">-</SelectItem>
          {options.filter(Boolean).map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </TableCell>
  );
}
