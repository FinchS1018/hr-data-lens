import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DetectedColumn } from "@/lib/column-detector";

interface PreviewTableProps {
  headers: string[];
  previewRows: string[][];
  detectedColumns: DetectedColumn[];
  columnMapping: { columnIndex: number; type: "info" | "stage" }[];
  onMappingChange: (mapping: { columnIndex: number; type: "info" | "stage" }[]) => void;
}

const TYPE_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  info: { label: "信息", variant: "default" },
  stage: { label: "阶段", variant: "secondary" },
  unknown: { label: "未知", variant: "outline" },
};

export function PreviewTable({
  headers,
  previewRows,
  detectedColumns,
  columnMapping,
  onMappingChange,
}: PreviewTableProps) {
  function handleTypeChange(colIndex: number, newType: "info" | "stage") {
    const newMapping = columnMapping
      .filter((m) => m.columnIndex !== colIndex)
      .concat({ columnIndex: colIndex, type: newType });
    onMappingChange(newMapping);
  }

  function getMappedType(colIndex: number): string {
    const mapped = columnMapping.find((m) => m.columnIndex === colIndex);
    if (mapped) return mapped.type;
    const detected = detectedColumns[colIndex];
    return detected?.detectedType ?? "unknown";
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>列名</TableHead>
            <TableHead className="w-[80px]">类型</TableHead>
            {previewRows.slice(0, 1).map((_, i) => (
              <TableHead key={i}>示例值 {i + 1}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {headers.map((header, colIndex) => {
            const mappedType = getMappedType(colIndex);
            const badge = TYPE_BADGE[mappedType] ?? TYPE_BADGE.unknown;
            return (
              <TableRow key={colIndex}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {colIndex + 1}
                </TableCell>
                <TableCell className="font-medium">{header}</TableCell>
                <TableCell>
                  <Select
                    value={mappedType}
                    onValueChange={(v) => handleTypeChange(colIndex, v as "info" | "stage")}
                  >
                    <SelectTrigger className="h-7 w-[72px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">信息</SelectItem>
                      <SelectItem value="stage">阶段</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                {previewRows.slice(0, 3).map((row, ri) => (
                  <TableCell key={ri} className="text-muted-foreground text-sm max-w-[200px] truncate">
                    {row[colIndex] ?? ""}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
