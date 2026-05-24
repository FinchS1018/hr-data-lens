"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { DurationEntry } from "@/lib/analytics";

type SortKey = keyof DurationEntry;

export function DurationTable({ data }: { data: DurationEntry[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("avgDays");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [data, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        暂无耗时数据（需要至少有两个阶段含日期信息）
      </div>
    );
  }

  const maxAvg = Math.max(...sorted.map((d) => d.avgDays), 1);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>从阶段</TableHead>
          <TableHead>到阶段</TableHead>
          <TableHead>
            <Button variant="ghost" size="sm" onClick={() => handleSort("avgDays")}>
              平均天数{sortKey === "avgDays" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" size="sm" onClick={() => handleSort("minDays")}>
              最短{sortKey === "minDays" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" size="sm" onClick={() => handleSort("maxDays")}>
              最长{sortKey === "maxDays" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((entry) => (
          <TableRow key={`${entry.fromStage}-${entry.toStage}`}>
            <TableCell>{entry.fromStage}</TableCell>
            <TableCell>{entry.toStage}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.max((entry.avgDays / maxAvg) * 100, 4)}px` }}
                />
                <span className="font-medium">{entry.avgDays}</span>
              </div>
            </TableCell>
            <TableCell>{entry.minDays}</TableCell>
            <TableCell>{entry.maxDays}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
