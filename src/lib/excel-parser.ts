import * as XLSX from "xlsx";
import { detectColumns, type DetectedColumn } from "./column-detector";

export interface ParsedFile {
  headers: string[];
  rows: string[][];
  detectedColumns: DetectedColumn[];
  fileName: string;
  totalRows: number;
}

export function parseExcelFile(buffer: ArrayBuffer, fileName: string): ParsedFile {
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("文件中没有找到工作表");

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: "",
  });

  if (data.length < 2) {
    throw new Error("文件至少需要包含表头行和一行数据");
  }

  const headers = data[0].map((h) => String(h ?? "").trim());
  if (headers.every((h) => h === "")) {
    throw new Error("未检测到有效的表头行");
  }

  const rows = data.slice(1).filter((row) => row.some((cell) => String(cell ?? "").trim() !== "")) as string[][];

  if (rows.length === 0) {
    throw new Error("没有找到数据行");
  }

  const detectedColumns = detectColumns(headers, rows);

  const infoColumns = detectedColumns.filter((c) => c.detectedType === "info");
  if (infoColumns.length === 0) {
    throw new Error("未检测到信息列（如姓名、部门等），请检查文件格式");
  }

  return {
    headers,
    rows,
    detectedColumns,
    fileName,
    totalRows: rows.length,
  };
}
