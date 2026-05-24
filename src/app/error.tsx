"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <h2 className="text-xl font-bold mb-2">出错了</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || "页面加载时发生错误，请重试"}
      </p>
      <Button onClick={reset}>重试</Button>
    </div>
  );
}
