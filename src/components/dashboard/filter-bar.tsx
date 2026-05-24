"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  projectId: string;
}

export function FilterBar({ projectId }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);

  const currentDept = searchParams.get("department") ?? "all";
  const currentPos = searchParams.get("position") ?? "all";
  const currentDateFrom = searchParams.get("dateFrom") ?? "";
  const currentDateTo = searchParams.get("dateTo") ?? "";

  useEffect(() => {
    fetch(`/api/projects/${projectId}/filters`)
      .then((r) => r.json())
      .then((d) => {
        setDepartments(d.departments ?? []);
        setPositions(d.positions ?? []);
      })
      .catch(() => {});
  }, [projectId]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/${projectId}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(`/dashboard/${projectId}`);
  }

  const hasFilters = currentDept !== "all" || currentPos !== "all" || currentDateFrom || currentDateTo;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">部门</label>
        <Select value={currentDept} onValueChange={(v) => updateParam("department", v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="全部部门" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部部门</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">岗位</label>
        <Select value={currentPos} onValueChange={(v) => updateParam("position", v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="全部岗位" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部岗位</SelectItem>
            {positions.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">开始日期</label>
        <Input
          type="date"
          className="w-[150px]"
          value={currentDateFrom}
          onChange={(e) => updateParam("dateFrom", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">结束日期</label>
        <Input
          type="date"
          className="w-[150px]"
          value={currentDateTo}
          onChange={(e) => updateParam("dateTo", e.target.value)}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          清除筛选
        </Button>
      )}
    </div>
  );
}
