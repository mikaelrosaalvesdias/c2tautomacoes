import { Card, CardContent } from "@/components/ui/card";

type LoadingStateProps = {
  rows?: number;
};

export function LoadingState({ rows = 6 }: LoadingStateProps) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-md bg-secondary" />
        ))}
      </CardContent>
    </Card>
  );
}
