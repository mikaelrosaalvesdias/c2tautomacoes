"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ErrorStateProps = {
  title: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  function handleRetry() {
    if (onRetry) {
      onRetry();
      return;
    }
    window.location.reload();
  }

  return (
    <Card className="border-red-200">
      <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 text-center">
        <h3 className="text-base font-semibold text-red-700">{title}</h3>
        {description ? <p className="max-w-md text-sm text-red-600">{description}</p> : null}
        <Button variant="outline" onClick={handleRetry}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
}
