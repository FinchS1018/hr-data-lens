"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onFile, disabled }: DropZoneProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        setFileName(accepted[0].name);
        onFile(accepted[0]);
      }
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    disabled,
  });

  return (
    <Card
      {...getRootProps()}
      className={`p-12 border-2 border-dashed text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
      {fileName ? (
        <div>
          <p className="font-medium">{fileName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            点击或拖拽以更换文件
          </p>
        </div>
      ) : (
        <div>
          <p className="font-medium">
            {isDragActive ? "松开以上传文件" : "拖拽 Excel/CSV 文件到此处"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            或点击选择文件（.xlsx / .xls / .csv，最大 10MB）
          </p>
        </div>
      )}
    </Card>
  );
}
